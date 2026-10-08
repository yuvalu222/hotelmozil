// Print the raw per-line rectangles for one slide's facts, so a disagreement
// between what a gate reports and what the rendered JPEG shows gets settled by
// measurement instead of by squinting.
//
//   node analyze/probe-lines.mjs <spec-id> <slide-index>

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { slideMarkup2 } from '../lib/skins.js';

const [id, idxArg] = process.argv.slice(2);
const idx = Number(idxArg || 2);

const spec = JSON.parse(fs.readFileSync(path.join('specs', `${id}.json`), 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
// Load the template the way the renderer does — from the file, and waiting for
// the webfont. Measuring in a fallback font gives different line breaks.
await page.goto(pathToFileURL(path.resolve('lib/template2.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const html = slideMarkup2(spec.slides[idx], { photos: Array(6).fill(blank), debug: false });

const rows = await page.evaluate((h) => {
  const el = document.getElementById('slide');
  el.innerHTML = h;
  const out = [];
  for (const n of el.querySelectorAll('.stk-fact, .stk-name')) {
    const r = document.createRange();
    r.selectNodeContents(n);
    const rects = [...r.getClientRects()].filter((x) => x.width > 1 && x.height > 1);
    out.push({
      cls: n.className,
      txt: (n.textContent || '').trim(),
      boxW: Math.round(n.getBoundingClientRect().width),
      font: getComputedStyle(n).fontFamily,
      rects: rects.map((x) => `top=${Math.round(x.top)} w=${Math.round(x.width)}`),
    });
  }
  return out;
}, html);

console.log(`${id} slide ${idx}  (font: ${rows[0]?.font})`);
for (const r of rows) {
  console.log(`  [${r.cls}] box=${r.boxW}  "${r.txt}"`);
  for (const x of r.rects) console.log(`      ${x}`);
}
await browser.close();
