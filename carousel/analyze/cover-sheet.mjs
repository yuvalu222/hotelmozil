// NOTE: the cover is 00.jpg. 01.jpg is the SECOND slide, and the first run of
// this script read it — which would have produced a "measured" cover rule
// derived entirely from second slides. Checked, not felt.
//
// Contact sheets of the highest- and lowest-saving source COVERS, so the cover
// line can be copied from the precedent instead of written by me.
//
// 8.10: *"the clickbait line came out badly, especially for Cyprus. Nobody
// will fly because of the video, but people flying to Larnaca, who want to
// know what to do there, need to know the video is even about Larnaca."*
//
// Nine covers were already transcribed and 9 of 9 name the destination. Nine
// is too thin to encode a rule from, and the frames for 846 more are on disk,
// so this sheets the extremes — top and bottom by saves/like — at a size where
// the headline is legible, and I read them. Reading the primary frame is the
// one step that cannot be inferred.
//
//   node analyze/cover-sheet.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const q = JSON.parse(fs.readFileSync('harvest/cover-read-queue.json', 'utf8'));
const hi = q.filter((r) => r.sl > 0.8);
const lo = q.filter((r) => r.sl <= 0.8);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const [name, rows] of [['top', hi], ['bottom', lo]]) {
  const cells = rows.map((r) => {
    const f = path.join('harvest', 'tt-decks', r.id, '00.jpg');
    if (!fs.existsSync(f)) return '';
    const b64 = fs.readFileSync(f).toString('base64');
    return `<figure><img src="data:image/jpeg;base64,${b64}"><figcaption>${r.sl}</figcaption></figure>`;
  }).join('');
  const W = 560, cols = 4;
  const html = `<!doctype html><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#111;display:grid;grid-template-columns:repeat(${cols},${W}px);gap:8px;width:${cols * W + 8 * (cols - 1)}px}
    figure{position:relative}
    img{width:${W}px;display:block}
    figcaption{position:absolute;top:0;left:0;background:#0f0;color:#000;font:700 34px system-ui;padding:2px 10px}
  </style>${cells}`;
  const page = await browser.newPage({ viewport: { width: cols * W + 8 * (cols - 1), height: 1000 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => {})))));
  const out = `out/cover-sheet-${name}.jpg`;
  await page.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 88 });
  console.log(`${rows.length} covers -> ${out}`);
  await page.close();
}
await browser.close();
