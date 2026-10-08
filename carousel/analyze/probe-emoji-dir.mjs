// Where does an emoji land in an RTL line — and does putting it first in the
// string put it on the right, as Hebrew reading order would expect?
//
// Rendering 📌 at the START of a Hebrew CTA put it on the LEFT of the frame,
// which in Hebrew is the END of the line. Rather than reason about bidi
// neutrals, measure both placements in the real template.
//
//   node analyze/probe-emoji-dir.mjs

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { slideMarkup2 } from '../lib/skins.js';

const browser = await chromium.launch({
  channel: 'chrome', headless: true,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(path.resolve('lib/template2.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

for (const [label, note] of [
  ['emoji first ', '📌 שמרו את זה לפני שאתם מזמינים'],
  ['emoji last  ', 'שמרו את זה לפני שאתם מזמינים 📌'],
]) {
  const html = slideMarkup2(
    { layout: 'tt-tiny', pos: 'upper', titleCaps: 'כותרת', line: 'משנה', note },
    { photos: [blank], debug: false },
  );
  await page.evaluate((h) => { document.getElementById('slide').innerHTML = h; }, html);
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => {
    const n = document.querySelector('.ttt-note');
    const im = n && n.querySelector('img.emo');
    if (!n || !im) return null;
    const nb = n.getBoundingClientRect();
    const ib = im.getBoundingClientRect();
    // Where the glyphs actually start and end, not the full-width box.
    const range = document.createRange();
    range.selectNodeContents(n);
    const rects = [...range.getClientRects()].filter((x) => x.width > 1);
    const left = Math.min(...rects.map((x) => x.left));
    const right = Math.max(...rects.map((x) => x.right));
    return {
      emojiCentre: Math.round(ib.left + ib.width / 2),
      textLeft: Math.round(left), textRight: Math.round(right),
      dir: getComputedStyle(n).direction,
    };
  });
  if (!r) { console.log(`${label} — no emoji img found`); continue; }
  const side = r.emojiCentre < (r.textLeft + r.textRight) / 2 ? 'LEFT (end of a Hebrew line)'
                                                             : 'RIGHT (start of a Hebrew line)';
  console.log(`${label} dir=${r.dir}  text ${r.textLeft}..${r.textRight}  emoji@${r.emojiCentre}  -> ${side}`);
}

await browser.close();
