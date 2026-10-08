// Every slide of one source deck on a single sheet, so its CONTENT can be
// read off the precedent instead of chosen.
//
// 8.10: *"not what is interesting in Paris (check the precedent)."* The route
// LAYOUT was already measured off these frames; what was still mine was which
// landmarks go in and what each line says underneath. Both are visible here.
//
//   node analyze/deck-sheet.mjs <deck-id> [out-name]
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const id = process.argv[2];
const name = process.argv[3] || id;
const dir = path.join('harvest', 'tt-decks', id);
const files = fs.readdirSync(dir).filter((f) => /^\d+\.jpg$/.test(f)).sort();

const W = 640, cols = Math.min(4, files.length);
const cells = files.map((f, i) => {
  const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
  return `<figure><img src="data:image/jpeg;base64,${b64}"><figcaption>${i}</figcaption></figure>`;
}).join('');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: cols * W + 6 * (cols - 1), height: 900 } });
await page.setContent(`<!doctype html><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#111;display:grid;grid-template-columns:repeat(${cols},${W}px);gap:6px;width:${cols * W + 6 * (cols - 1)}px}
  figure{position:relative}img{width:${W}px;display:block}
  figcaption{position:absolute;top:0;left:0;background:#0ff;color:#000;font:700 30px system-ui;padding:1px 12px}
</style>${cells}`, { waitUntil: 'networkidle' });
await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => {})))));
const out = `out/deck-${name}.jpg`;
await page.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 90 });
await browser.close();
console.log(`${files.length} slides -> ${out}`);
