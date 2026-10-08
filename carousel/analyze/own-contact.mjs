// Contact sheets of HIS OWN posts, so they can be studied a whole deck at a
// time instead of one slide per look.
//
// Written for the owner's instruction of 3.10: before touching any copy again,
// go and look at what he actually posts — the real layouts, where HotelMozil
// appears, how the text sits on the frame.
//
//   node analyze/own-contact.mjs [handle]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const HANDLE = (process.argv[2] || 'hotelmozil').replace('@', '');
const SRC = path.join('harvest', 'own', HANDLE);
const OUT = path.join('out', '_own', HANDLE);
fs.mkdirSync(OUT, { recursive: true });

const posts = fs.readdirSync(SRC)
  .filter((d) => /^\d\d-/.test(d) && fs.statSync(path.join(SRC, d)).isDirectory())
  .sort();

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
let made = 0;

for (const post of posts) {
  const dir = path.join(SRC, post);
  const files = fs.readdirSync(dir).filter((f) => /^\d+\.jpg$/.test(f)).sort();
  if (!files.length) continue;

  let meta = {};
  try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'post.json'), 'utf8')); } catch { /* none */ }

  const cols = Math.min(files.length, 6);
  const cell = 300;
  const rows = Math.ceil(files.length / cols);
  const W = cols * cell + (cols + 1) * 10;
  const H = rows * (cell * 16 / 9 + 26) + (rows + 1) * 10 + 60;

  const cells = files.map((f, i) =>
    `<figure><img src="file:///${path.resolve(dir, f).replace(/\\/g, '/')}">`
    + `<figcaption>${i + 1}</figcaption></figure>`).join('');

  const head = `${post}  —  ${files.length} slides  —  ${meta.views || '?'} views`
    + `  —  ${(meta.caption || '').replace(/\s+/g, ' ').slice(0, 70)}`;

  const html = `<!doctype html><html><meta charset=utf8><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#111;width:${W}px;font:13px system-ui,sans-serif;color:#ddd}
    .h{padding:14px 14px 6px;font-size:16px;font-weight:700;color:#fff;direction:rtl;text-align:right}
    .g{display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:10px;padding:10px}
    figure{width:${cell}px}
    img{width:${cell}px;height:${Math.round(cell * 16 / 9)}px;object-fit:cover;display:block;
        background:#0a0a0a;border-radius:4px}
    figcaption{color:#888;text-align:center;height:22px;line-height:22px}
  </style>
  <div class="h">${head}</div>
  <div class="g">${cells}</div></html>`;

  const tmp = path.join(OUT, `_${post}.html`);
  fs.writeFileSync(tmp, html);
  try {
    await page.setViewportSize({ width: W, height: Math.min(Math.round(H), 4000) });
    await page.goto('file:///' + path.resolve(tmp).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 40000 });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${post}.jpg`), type: 'jpeg', quality: 82, fullPage: true });
    made++;
  } catch (e) {
    console.log(`fail ${post}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 70)}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}
console.log(`${made} post sheets -> ${OUT}`);
await browser.close();
