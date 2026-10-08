// His own covers, ranked by VIEWS. The only scroll-stopping data in the
// project, and the only data in Hebrew.
//
// Everything measured from the 847-deck corpus is saves and likes, and both
// are counted after someone has already stopped — so the corpus cannot say
// what makes a thumb stop. His own grid carries view counts, 632 to ~36K
// across 40 posts, which is the thing a cover is actually for.
//
// ⚠️ VIEWS ARRIVE AS STRINGS. The grid renders "12.2K", "1.1M", and "Pinned"
// where a pinned post hides its count. Comparing those as numbers is how this
// project once reported 12,591,803 views for an account with 2,021 followers.
// Pinned posts are dropped as UNKNOWN, not counted as zero.
//
//   node analyze/own-covers.mjs
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = 'harvest/own/hotelmozil';

/** "12.2K" -> 12200, "1.1M" -> 1100000, "Pinned" -> null */
export function views(v) {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v ?? '').trim();
  const m = s.match(/^([\d.]+)\s*([KMB])?$/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  const n = parseFloat(m[1]) * mult;
  return Number.isFinite(n) ? Math.round(n) : null;
}

const pr = JSON.parse(fs.readFileSync(path.join(BASE, '_profile.json'), 'utf8'));
const byId = {};
for (const x of pr.grid || []) {
  const m = String(x.url || '').match(/(\d{15,})/);
  if (m) byId[m[1]] = x;
}

const seen = new Set();
const rows = [];
let pinned = 0;
for (const d of fs.readdirSync(BASE).filter((f) => /^\d+-\d+$/.test(f))) {
  const id = d.split('-')[1];
  if (seen.has(id)) continue;                // 04-… and 99-… are one post
  const g = byId[id];
  if (!g) continue;
  const v = views(g.views);
  if (v === null) { pinned++; continue; }    // unknown, not zero
  const files = fs.readdirSync(path.join(BASE, d))
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  if (!files.length) continue;
  seen.add(id);
  rows.push({ id, dir: d, cover: path.join(BASE, d, files[0]), v, slides: files.length });
}
rows.sort((a, b) => b.v - a.v);
console.log(`${rows.length} of his posts have a cover on disk and a readable view count`
  + ` (${pinned} pinned, count hidden -> excluded)`);
const vs = rows.map((r) => r.v);
const med = [...vs].sort((a, b) => a - b)[vs.length >> 1];
console.log(`views ${Math.min(...vs)} .. ${Math.max(...vs)}, median ${med}\n`);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const W = 440, cols = 5;
for (const [name, set] of [['top', rows.slice(0, 10)], ['bottom', rows.slice(-10)]]) {
  const cells = set.map((r) => {
    const b64 = fs.readFileSync(r.cover).toString('base64');
    const ext = path.extname(r.cover).slice(1).replace('jpg', 'jpeg');
    return `<figure><img src="data:image/${ext};base64,${b64}">`
      + `<figcaption>${r.v.toLocaleString()} views</figcaption></figure>`;
  }).join('');
  const html = `<!doctype html><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#111;display:grid;grid-template-columns:repeat(${cols},${W}px);gap:6px;width:${cols * W + 6 * (cols - 1)}px}
    figure{position:relative}img{width:${W}px;display:block}
    figcaption{position:absolute;top:0;left:0;background:#ff0;color:#000;font:700 26px system-ui;padding:2px 8px}
  </style>${cells}`;
  const page = await browser.newPage({ viewport: { width: cols * W + 6 * (cols - 1), height: 900 } });
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => {})))));
  await page.screenshot({ path: `out/own-covers-${name}.jpg`, fullPage: true, type: 'jpeg', quality: 90 });
  console.log(`${set.length} covers -> out/own-covers-${name}.jpg  `
    + `(${set[0].v.toLocaleString()} .. ${set[set.length - 1].v.toLocaleString()})`);
  await page.close();
}
await browser.close();
