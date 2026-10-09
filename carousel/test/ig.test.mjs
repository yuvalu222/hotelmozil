// Tests for the TikTok -> Instagram mirror (ig/).
//
//   node --test test/ig.test.mjs
//
// The Instagram calls run against a fake Graph API, so the order of calls and
// the failure paths are checked without an account. The fitter runs in real
// Chrome on synthetic slides whose text position is known.

import { test } from 'node:test';
import assert from 'node:assert';
import { chromium } from 'playwright';
import { igCaption } from '../ig/lib/caption.mjs';
import { client, buildCarousel, publish, GraphError } from '../ig/lib/graph.mjs';
import { fitSlide, H } from '../ig/lib/fit.mjs';
import { toPost } from '../ig/lib/tiktok.mjs';

// ---- caption ---------------------------------------------------------------

test('his real caption keeps its body and its 5 tags', () => {
  const desc = 'אף אחד לא מספר לך שהחלק הכי מבאס בדובאי זה בכלל לא החום. טיסה נעימה! #דובאי #המלצות #חופשה #טיול #טיפים ';
  const r = igCaption(desc);
  assert.deepStrictEqual(r.tags, ['#דובאי', '#המלצות', '#חופשה', '#טיול', '#טיפים']);
  assert.ok(r.caption.startsWith('אף אחד לא מספר לך'));
  assert.ok(r.caption.endsWith('#דובאי #המלצות #חופשה #טיול #טיפים'));
});

test('a sixth tag never reaches Instagram, and For-You tags are dropped first', () => {
  const r = igCaption('x #fyp #a #b #c #d #e #f #foryou');
  assert.deepStrictEqual(r.tags, ['#a', '#b', '#c', '#d', '#e']);
  assert.deepStrictEqual(r.dropped, ['#fyp', '#f', '#foryou']);
});

test('a caption that is only hashtags stays only hashtags', () => {
  assert.strictEqual(igCaption('#תאילנד #חופשה').caption, '#תאילנד #חופשה');
});

test('a repeated tag counts once', () => {
  assert.deepStrictEqual(igCaption('#Paris #paris #rome').tags, ['#Paris', '#rome']);
});

// ---- tiktok ----------------------------------------------------------------

test('a video post is recognised as one', () => {
  assert.strictEqual(toPost({ id: '1', createTime: 5, desc: '', video: { duration: 12 } }).kind, 'video');
  // Neither shape: a field TikTok renamed. Must not be filed away as a video.
  assert.strictEqual(toPost({ id: '1', createTime: 5, desc: '' }).kind, 'unknown');
  assert.strictEqual(toPost({ id: '1', createTime: 5, imagePost: { images: [{ imageURL: { urlList: ['u'] } }] } }).kind, 'photo');
});

// ---- graph -----------------------------------------------------------------

function fakeGraph({ failChild = false, failPublish = false } = {}) {
  const calls = [];
  let n = 0;
  const fetchImpl = async (u, init) => {
    const url = new URL(u);
    const params = init.method === 'GET' ? Object.fromEntries(url.searchParams) : Object.fromEntries(init.body);
    calls.push(`${init.method} ${url.pathname.replace('/v26.0', '')} ${params.media_type || ''}${params.is_carousel_item ? 'item' : ''}`.trim());
    const ok = (j) => new Response(JSON.stringify(j), { status: 200 });
    if (url.pathname.endsWith('/media') && init.method === 'POST') return ok({ id: `c${++n}` });
    if (url.pathname.endsWith('/media_publish')) {
      return failPublish ? new Response(JSON.stringify({ error: { message: 'boom', code: 9007 } }), { status: 400 }) : ok({ id: 'm1' });
    }
    if (params.fields?.includes('status_code')) return ok({ status_code: failChild && url.pathname.endsWith('/c2') ? 'ERROR' : 'FINISHED' });
    if (params.fields === 'permalink') return ok({ permalink: 'https://www.instagram.com/p/X/' });
    return new Response('{}', { status: 404 });
  };
  return { api: client('TOKEN', { fetchImpl }), calls };
}

test('a carousel is built child by child, then the parent, then published', async () => {
  const { api, calls } = fakeGraph();
  const { creationId, children } = await buildCarousel(api, '17841', ['https://a/1.jpg', 'https://a/2.jpg', 'https://a/3.jpg'], 'cap', { pollMs: 1 });
  assert.deepStrictEqual(children, ['c1', 'c2', 'c3']);
  assert.strictEqual(creationId, 'c4');
  const r = await publish(api, '17841', creationId);
  assert.deepStrictEqual(r, { mediaId: 'm1', permalink: 'https://www.instagram.com/p/X/' });
  assert.deepStrictEqual(calls, [
    'POST /17841/media item', 'POST /17841/media item', 'POST /17841/media item',
    'GET /c1', 'GET /c2', 'GET /c3',
    'POST /17841/media CAROUSEL', 'GET /c4',
    'POST /17841/media_publish', 'GET /m1',
  ]);
});

test('a slide Instagram could not fetch stops the post before anything is published', async () => {
  const { api, calls } = fakeGraph({ failChild: true });
  await assert.rejects(buildCarousel(api, '1', ['a', 'b', 'c'], 'x', { pollMs: 1 }), /c2 ERROR/);
  assert.ok(!calls.some((c) => c.includes('media_publish') || c.includes('CAROUSEL')));
});

test('11 slides are refused before any call', async () => {
  const { api, calls } = fakeGraph();
  await assert.rejects(buildCarousel(api, '1', Array(11).fill('u'), 'x'), /2-10 images/);
  assert.strictEqual(calls.length, 0);
});

test('an expired token is recognised as one', () => {
  assert.ok(new GraphError('x', { code: 190 }).isAuth);
  assert.ok(!new GraphError('x', { code: 9007 }).isAuth);
});

// ---- fit -------------------------------------------------------------------

/** Draw a slide in Chrome: a noisy photo-like background plus outlined text at given rows. */
async function synth(page, w, h, textRows) {
  const b64 = await page.evaluate(({ w, h, textRows }) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#5a7fa8'); grad.addColorStop(1, '#c98c5a');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.font = `bold ${Math.round(w / 14)}px Arial`;
    g.textAlign = 'center'; g.lineJoin = 'round';
    for (const y of textRows) {
      g.lineWidth = 10; g.strokeStyle = '#000'; g.strokeText('WHERE TO STAY 2026', w / 2, y);
      g.fillStyle = '#fff'; g.fillText('WHERE TO STAY 2026', w / 2, y);
    }
    const u = c.toDataURL('image/jpeg', 0.9);
    return u.slice(u.indexOf(',') + 1);
  }, { w, h, textRows });
  return Buffer.from(b64, 'base64');
}

test('fitter: crops a 9:16 slide without cutting its text, falls back when it cannot', async (t) => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();

  // Title high up: a centre crop (y0 = 285) would cut it; the window must move up.
  const high = await fitSlide(page, await synth(page, 1080, 1920, [160, 260]));
  assert.strictEqual(high.mode, 'crop');
  assert.ok(high.y0 <= high.span[0] - 30, `window ${high.y0} must start above text ${high.span[0]}`);
  assert.ok(high.y0 + H >= high.span[1]);

  // Text at the very top and the very bottom: no 4:5 window holds both.
  const both = await fitSlide(page, await synth(page, 1080, 1920, [120, 1850]));
  assert.strictEqual(both.mode, 'contain-tall');

  // His own 3:4 designs are never cropped.
  assert.strictEqual((await fitSlide(page, await synth(page, 1284, 1712, [80]))).mode, 'contain');

  // Already 4:5.
  assert.strictEqual((await fitSlide(page, await synth(page, 1080, 1350, [400]))).mode, 'resize');

  // Every output is exactly 1080x1350.
  const size = await page.evaluate(async (b64) => {
    const i = new Image(); i.src = 'data:image/jpeg;base64,' + b64; await i.decode(); return [i.naturalWidth, i.naturalHeight];
  }, high.buffer.toString('base64'));
  assert.deepStrictEqual(size, [1080, 1350]);
});
