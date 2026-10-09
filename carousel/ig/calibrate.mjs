// Run the 4:5 fitter over every slide of ours already on disk and draw a
// contact sheet: the original with the detected text span, next to what
// Instagram would receive. This is how TEXT_ROW was chosen, and the sheet is
// the check after any change to fit.mjs.
//
//   node ig/calibrate.mjs [outDir] [--row N]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fitSlide } from './lib/fit.mjs';

const ROOT = path.join(import.meta.dirname, '..');
const OUT = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : path.join(ROOT, 'out', '_ig-calibrate');
const rowArg = process.argv.indexOf('--row');
const opts = rowArg > 0 ? { TEXT_ROW: Number(process.argv[rowArg + 1]) } : {};
fs.mkdirSync(OUT, { recursive: true });

const own = path.join(ROOT, 'harvest', 'own');
const files = [];
for (const d of fs.readdirSync(own, { recursive: true })) {
  const f = path.join(own, String(d));
  if (/\d\d\.jpg$/.test(f) && fs.statSync(f).size > 20000) files.push(f);
}
files.sort();

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
const rows = [];
const tally = {};
for (const [i, f] of files.entries()) {
  const res = await fitSlide(page, fs.readFileSync(f), opts);
  tally[res.mode] = (tally[res.mode] || 0) + 1;
  const name = `${String(i).padStart(3, '0')}.jpg`;
  fs.writeFileSync(path.join(OUT, name), res.buffer);
  rows.push({ file: f, out: name, ...res, buffer: undefined });
}
console.log(`${files.length} slides`, tally);
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(rows, null, 1));

// Only the slides where a decision was made are worth looking at.
const interesting = rows.filter((r) => r.mode !== 'resize' && r.mode !== 'contain');
const cell = (r) => {
  const [iw, ih] = r.size;
  const sh = Math.round(1080 * ih / iw);
  const mark = r.span ? `<div class="span" style="top:${(r.span[0] / sh) * 100}%;height:${((r.span[1] - r.span[0]) / sh) * 100}%"></div>` : '';
  const win = r.y0 !== null && r.y0 !== undefined ? `<div class="win" style="top:${(r.y0 / sh) * 100}%;height:${(1350 / sh) * 100}%"></div>` : '';
  return `<figure><div class="o"><img src="file:///${r.file.replace(/\\/g, '/')}">${mark}${win}</div><img class="r" src="${r.out}"><figcaption>${r.mode} ${r.ratio}</figcaption></figure>`;
};
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:#222;color:#eee;font:14px sans-serif;display:flex;flex-wrap:wrap;gap:10px;padding:10px}
figure{margin:0;display:grid;grid-template-columns:150px 216px;gap:4px;align-items:start}
figcaption{grid-column:1/3}
.o{position:relative;width:150px}.o img{width:150px;display:block}
.r{width:216px}
.span{position:absolute;left:0;right:0;background:rgba(255,0,0,.35)}
.win{position:absolute;left:0;right:0;outline:3px solid #0f0}
</style>${interesting.map(cell).join('')}`;
fs.writeFileSync(path.join(OUT, 'sheet.html'), html);
const sp = await browser.newPage({ viewport: { width: 1900, height: 1000 } });
await sp.goto('file:///' + path.join(OUT, 'sheet.html').replace(/\\/g, '/'));
await sp.waitForTimeout(1500);
await sp.screenshot({ path: path.join(OUT, 'sheet.jpg'), fullPage: true, quality: 70, type: 'jpeg' });
await browser.close();
console.log(`${interesting.length} decided slides -> ${path.join(OUT, 'sheet.jpg')}`);
