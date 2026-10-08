// Every closing frame he uses, in one montage.
//
// He closes a post with its LAST TWO slides: one that speaks in the deck's own
// format and first person, then either a screenshot of his own home screen or
// the branded card with the App Store badge. Seeing them side by side is the
// only way to know which variants exist before reusing one.
//
//   node analyze/own-closers.mjs [handle]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const HANDLE = (process.argv[2] || 'hotelmozil').replace('@', '');
const SRC = path.join('harvest', 'own', HANDLE);
const BS = String.fromCharCode(92); // heredocs keep eating this one

// The HotelMozil era is the recent post ids; everything older on the profile
// is the previous app and is not ours to study.
const posts = fs.readdirSync(SRC)
  .filter((d) => /^\d\d-76[7-9]\d+$/.test(d))
  .sort();

const cells = [];
for (const p of posts) {
  const dir = path.join(SRC, p);
  const files = fs.readdirSync(dir).filter((x) => /^\d+\.jpg$/.test(x)).sort();
  for (const x of files.slice(-2)) {
    cells.push({
      src: path.resolve(dir, x).split(BS).join('/'),
      label: p.slice(0, 2) + '.' + x.replace('.jpg', ''),
    });
  }
}

const cols = 8;
const cell = 230;
const rows = Math.ceil(cells.length / cols);
const W = cols * cell + (cols + 1) * 8;
const H = rows * (cell * 16 / 9 + 24) + (rows + 1) * 8 + 40;

const html = `<!doctype html><meta charset=utf8><style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#111;width:${W}px;font:12px system-ui;color:#ddd}
.h{padding:12px;font-size:15px;font-weight:700;color:#fff}
.g{display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:8px;padding:8px}
img{width:${cell}px;height:${Math.round(cell * 16 / 9)}px;object-fit:cover;display:block;border-radius:4px;background:#000}
figcaption{color:#999;text-align:center;height:20px;line-height:20px}</style>
<div class="h">last two slides of each HotelMozil-era post — ${cells.length} frames</div>
<div class="g">${cells.map((c) => `<figure><img src="file:///${c.src}"><figcaption>${c.label}</figcaption></figure>`).join('')}</div>`;

fs.mkdirSync('out/_own', { recursive: true });
const tmp = 'out/_own/_closers.html';
fs.writeFileSync(tmp, html);

const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage();
await pg.setViewportSize({ width: W, height: Math.min(Math.round(H), 4000) });
await pg.goto('file:///' + path.resolve(tmp).split(BS).join('/'), { waitUntil: 'load' });
await pg.waitForTimeout(500);
await pg.screenshot({ path: 'out/_own/_closers.jpg', type: 'jpeg', quality: 82, fullPage: true });
console.log(`${cells.length} closing frames from ${posts.length} posts -> out/_own/_closers.jpg`);
await b.close();
