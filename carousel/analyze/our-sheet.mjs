// Contact sheet of one of our own packaged decks, so the whole thing can be
// looked at at once instead of a slide at a time.
//   node analyze/our-sheet.mjs <deck-id>
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
const id = process.argv[2];
const dir = path.join('C:', 'Users', 'Yuval', 'Desktop', 'HotelMozil-TikTok', id);
const files = fs.readdirSync(dir).filter((f) => /^\d+\.jpg$/.test(f)).sort();
const W = 460, cols = Math.min(5, files.length);
const cells = files.map((f, i) => {
  const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
  return `<figure><img src="data:image/jpeg;base64,${b64}"><figcaption>${i + 1}</figcaption></figure>`;
}).join('');
const br = await chromium.launch({ channel: 'chrome', headless: true });
const p = await br.newPage({ viewport: { width: cols * W + 6 * (cols - 1), height: 900 } });
await p.setContent(`<!doctype html><meta charset="utf-8"><style>
 *{margin:0;padding:0;box-sizing:border-box}
 body{background:#111;display:grid;grid-template-columns:repeat(${cols},${W}px);gap:6px;width:${cols * W + 6 * (cols - 1)}px}
 figure{position:relative}img{width:${W}px;display:block}
 figcaption{position:absolute;top:0;left:0;background:#ff0;color:#000;font:700 26px system-ui;padding:1px 10px}
</style>${cells}`, { waitUntil: 'networkidle' });
await p.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode()))));
await p.screenshot({ path: `out/ours-${id}.jpg`, fullPage: true, type: 'jpeg', quality: 88 });
await br.close();
console.log(`${files.length} slides -> out/ours-${id}.jpg`);
