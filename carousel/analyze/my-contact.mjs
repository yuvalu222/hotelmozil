// A contact sheet of OUR OWN rendered decks, so every image gets looked at.
//
// The owner's standing rule is that every image placed in a carousel has to be
// a genuine wow, always. No automated gate can judge that — saturation and
// contrast were calibrated against his verdicts and ran backwards. The only
// way to hold the standard is to look at the whole set at once, which is what
// this produces: one sheet per deck, every slide, large enough to judge.
//
//   node analyze/my-contact.mjs [spec-id ...]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join('out', '_sheets');
fs.mkdirSync(OUT, { recursive: true });

const ids = process.argv.slice(2);
const decks = fs.readdirSync('out')
  .filter((d) => d.startsWith('tt-') && fs.statSync(path.join('out', d)).isDirectory())
  .filter((d) => !ids.length || ids.includes(d))
  .sort();

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
let made = 0;

for (const deck of decks) {
  const files = fs.readdirSync(path.join('out', deck))
    .filter((f) => f.endsWith('-tiktok.jpg')).sort();
  if (!files.length) continue;

  const cols = Math.min(files.length, 6);
  const cell = 330;
  const rows = Math.ceil(files.length / cols);
  const W = cols * cell + (cols + 1) * 10;
  const H = rows * (cell * 16 / 9 + 26) + (rows + 1) * 10 + 56;

  const cells = files.map((f, i) =>
    `<figure><img src="file:///${path.resolve('out', deck, f).replace(/\\/g, '/')}">`
    + `<figcaption>${i + 1}</figcaption></figure>`).join('');

  const html = `<!doctype html><html><meta charset=utf8><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#111;width:${W}px;font:13px system-ui,sans-serif;color:#ddd}
    .h{padding:14px 14px 6px;font-size:17px;font-weight:700;color:#fff}
    .g{display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:10px;padding:10px}
    figure{width:${cell}px}
    img{width:${cell}px;height:${Math.round(cell * 16 / 9)}px;object-fit:cover;display:block;
        background:#0a0a0a;border-radius:4px}
    figcaption{color:#888;text-align:center;height:22px;line-height:22px}
  </style>
  <div class="h">${deck} — ${files.length} slides</div>
  <div class="g">${cells}</div></html>`;

  const tmp = path.join(OUT, `_${deck}.html`);
  fs.writeFileSync(tmp, html);
  try {
    await page.setViewportSize({ width: W, height: Math.min(Math.round(H), 4000) });
    await page.goto('file:///' + path.resolve(tmp).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 40000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${deck}.jpg`), type: 'jpeg', quality: 80, fullPage: true });
    made++;
  } catch (e) {
    console.log(`fail ${deck}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 70)}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}
console.log(`${made} deck sheets -> ${OUT}`);
await browser.close();
