// Does any slide's text run off the frame, or sit under the TikTok UI?
//
// The text was just made much larger, on the owner's instruction that the old
// size was unreadable in a feed. Larger text on a slide with eight items is
// exactly where a block silently runs past the bottom of the frame, and a
// rendered JPEG gives no warning — it just crops.
//
// Also checks the TikTok safe area. The feed draws the caption, the handle,
// the music line and the action rail over the bottom and right of the frame,
// so copy down there is covered by the app, not by us.
//
//   node analyze/overflow-check.mjs [spec-id ...]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { slideMarkup2 } from '../lib/skins.js';

const W = 1080, H = 1920;
// Measured off a TikTok screenshot: caption + handle + music occupy the bottom
// strip, the like/comment/share rail the right edge.
// TikTok draws its tab bar and search over the top of a full-screen frame.
// Nothing here ever reserved that, which is why copy came out from under the
// app's own header and he had to re-crop a deck by hand before posting.
const SAFE_TOP = 240;
const SAFE_BOTTOM = 330;
const SAFE_RIGHT = 150;

const ids = process.argv.slice(2);
const specs = fs.readdirSync('specs')
  .filter((f) => f.startsWith('tt-') && f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join('specs', f), 'utf8')))
  .filter((s) => !ids.length || ids.includes(s.id));

const tpl = fs.readFileSync(path.join('lib', 'template2.html'), 'utf8');
const b = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
const page = await b.newPage({ viewport: { width: W, height: H } });
await page.setContent(tpl, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

let problems = 0;
for (const spec of specs) {
  const notes = [];
  for (const [i, slide] of spec.slides.entries()) {
    // a 1x1 transparent pixel stands in for the photo: only the text matters
    const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    const html = slideMarkup2(slide, { photos: [blank, blank, blank, blank], debug: false });
    // Inject, then wait for the webfont, then measure. Awaiting fonts.ready at
    // page load resolves instantly because nothing on the page has asked for
    // Heebo yet, so every measurement lands in the fallback face and is wrong
    // by about a word per line. Verified with document.fonts.check, which
    // returned false for '700 40px Heebo' at that point.
    await page.evaluate((h) => { document.getElementById('slide').innerHTML = h; }, html);
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(({ W, H, SAFE_TOP, SAFE_BOTTOM, SAFE_RIGHT }) => {
      const el = document.getElementById('slide');
      let maxB = 0, minT = H, maxR = 0, minL = W;
      // Measure the elements that HOLD the text, not their containers. The
      // positioned wrapper is inset:0, so including it reported every slide as
      // ending at exactly 1920px — the frame height, not the copy.
      const holdsText = (n) => [...n.childNodes]
        .some((c) => c.nodeType === 3 && c.textContent.trim().length > 0);
      // Images count too. The stack layout puts 258px thumbnails near the
      // right edge and measuring only text meant nothing ever looked at them.
      //
      // For text, measure the GLYPHS and not the element box. A centred line
      // lives in a full-width box, so the box reports right=1024 while the
      // letters sit in the middle of the frame — the cover slide was flagged
      // as 94px under the rail when nothing was near it.
      const boxOf = (n) => {
        if (n.tagName === 'IMG') return n.getBoundingClientRect();
        const r = document.createRange();
        r.selectNodeContents(n);
        const rects = [...r.getClientRects()].filter((x) => x.width && x.height);
        if (!rects.length) return n.getBoundingClientRect();
        return {
          top: Math.min(...rects.map((x) => x.top)),
          bottom: Math.max(...rects.map((x) => x.bottom)),
          left: Math.min(...rects.map((x) => x.left)),
          right: Math.max(...rects.map((x) => x.right)),
          width: Math.max(...rects.map((x) => x.right)) - Math.min(...rects.map((x) => x.left)),
          height: Math.max(...rects.map((x) => x.bottom)) - Math.min(...rects.map((x) => x.top)),
        };
      };
      for (const n of el.querySelectorAll('div,p,span,img')) {
        if (n.tagName !== 'IMG' && !holdsText(n)) continue;
        const b = boxOf(n);
        if (b.height === 0 || b.width === 0) continue;
        // The full-bleed backdrop is an <img> covering the whole frame, so
        // counting every image reported all 408 slides as starting at 0px and
        // reaching 1080px. A backdrop is meant to run under the UI; only the
        // content thumbnails sitting on top of it are a collision.
        if (n.tagName === 'IMG' && b.width > W * 0.9 && b.height > H * 0.9) continue;
        maxB = Math.max(maxB, b.bottom);
        minT = Math.min(minT, b.top);
        maxR = Math.max(maxR, b.right);
        minL = Math.min(minL, b.left);
      }
      return { maxB, minT, maxR, minL };
    }, { W, H, SAFE_TOP, SAFE_BOTTOM, SAFE_RIGHT });

    if (r.maxB > H) notes.push(`slide ${i + 1}: text runs ${Math.round(r.maxB - H)}px past the bottom`);
    else if (r.minT !== null && r.minT < SAFE_TOP) notes.push(`slide ${i + 1}: text starts at ${Math.round(r.minT)}px, under the TikTok header`);
    else if (r.maxB > H - SAFE_BOTTOM) notes.push(`slide ${i + 1}: text ends at ${Math.round(r.maxB)}px, under the TikTok caption strip`);
    if (r.minT < 0) notes.push(`slide ${i + 1}: text starts ${Math.round(-r.minT)}px above the frame`);
    // maxR was measured and then thrown away, so the one collision he named by
    // name — "מה שבצד ימין גם מתנגש עם הלייקים והתגובות" — was the only safe
    // area never enforced.
    if (r.maxR > W - SAFE_RIGHT) {
      notes.push(`slide ${i + 1}: content reaches ${Math.round(r.maxR)}px, `
        + `${Math.round(r.maxR - (W - SAFE_RIGHT))}px under the like/comment rail`);
    }
  }
  problems += notes.length;
  console.log(`${(spec.id || '?').padEnd(24)} ${String(spec.slides.length).padStart(2)} slides  `
    + (notes.length ? `${notes.length} PROBLEM(S)` : 'fits'));
  for (const n of notes) console.log('    ' + n);
}
console.log(`\n${problems === 0 ? 'every slide fits the frame and clears the TikTok UI' : problems + ' slide(s) to shorten'}`);
await b.close();
