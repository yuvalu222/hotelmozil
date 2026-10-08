// One post, read properly, with retries.
//
// The profile sweep reads forty posts quickly and accepts whatever each page
// gives up. When a single post matters — the one he published from a deck I
// made, so his edits can be compared against my original — it is worth
// reloading until the slides actually come down.
//
//   node harvest/tt-one-post.mjs <handle> <postId> [tries]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const HANDLE = (process.argv[2] || 'hotelmozil').replace('@', '');
const ID = process.argv[3];
const TRIES = Number(process.argv[4] || 5);
if (!ID) { console.error('usage: tt-one-post.mjs <handle> <postId>'); process.exit(1); }

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const OUT = path.join('harvest', 'own', `${HANDLE}-post-${ID}`);
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);

for (let attempt = 1; attempt <= TRIES; attempt++) {
  // A fresh browser profile each time: a session that has already been walled
  // keeps being walled, and the wall lives in the stored state, not the IP.
  const dir = `recon/p-one-${attempt}`;
  fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(dir, {
    channel: 'chrome', headless: true, userAgent: UA,
    viewport: { width: 1280, height: 1600 }, locale: 'en-US',
    args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage'],
  });
  const page = await ctx.newPage();
  let d = null;
  try {
    await page.goto(`https://www.tiktok.com/@${HANDLE}/photo/${ID}`,
      { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(jitter(5000, 8000));
    // Click through the carousel so every slide is actually requested.
    for (let i = 0; i < 20; i++) {
      const next = await page.$('[data-e2e="arrow-right"], button[aria-label*="ext"]');
      if (!next) break;
      try { await next.click({ timeout: 2000 }); } catch { break; }
      await sleep(jitter(500, 900));
    }
    d = await page.evaluate(() => {
      const t = (s) => document.querySelector(s)?.innerText?.trim() || null;
      const imgs = [...document.querySelectorAll('img')]
        .map((im) => ({ src: im.src, w: im.naturalWidth }))
        .filter((x) => /photomode|tiktokcdn/.test(x.src) && x.w >= 500);
      return {
        caption: t('[data-e2e="browse-video-desc"]') || t('[data-e2e="video-desc"]'),
        likes: t('[data-e2e="like-count"]') || t('[data-e2e="browse-like-count"]'),
        comments: t('[data-e2e="comment-count"]') || t('[data-e2e="browse-comment-count"]'),
        music: document.querySelector('[data-e2e="video-music"]')?.innerText || null,
        imgs,
        tail: document.body.innerText.slice(-1200),
      };
    });
  } catch (e) {
    console.log(`attempt ${attempt}: ${String(e.message).slice(0, 70)}`);
  }

  const uniq = d ? [...new Map(d.imgs.map((x) => [x.src.split('?')[0], x])).values()] : [];
  console.log(`attempt ${attempt}: ${uniq.length} slide image(s)`);

  if (uniq.length >= 2) {
    let n = 0;
    for (const im of uniq) {
      const dest = path.join(OUT, `${String(++n).padStart(2, '0')}.jpg`);
      try {
        const r = await ctx.request.get(im.src, { timeout: 30000, headers: { Referer: 'https://www.tiktok.com/' } });
        if (r.ok()) fs.writeFileSync(dest, await r.body());
      } catch { /* next */ }
    }
    fs.writeFileSync(path.join(OUT, 'post.json'), JSON.stringify({ id: ID, ...d, imgs: undefined }, null, 2));
    console.log(`caption: ${(d.caption || '(none)').slice(0, 200)}`);
    console.log(`music:   ${d.music || '(none)'}`);
    console.log(`${n} slides -> ${OUT}`);
    await ctx.close();
    process.exit(0);
  }
  if (d?.tail) console.log(`   tail: ${d.tail.replace(/\s+/g, ' ').slice(-140)}`);
  await ctx.close();
  await sleep(jitter(8000, 14000));
}
console.log('could not get the slides after all attempts');
