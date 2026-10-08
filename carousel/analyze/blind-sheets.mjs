// Contact sheets for coding covers BLIND to how they performed.
//
// When his 13 covers were coded on 8.10, the view count sat on every tile.
// Knowing which cover won while deciding whether it "has a question" or "has
// a person" is how a coder's expectations leak into the data. So here each
// cover is shown under an opaque code only — no views, no creator, no order
// that follows performance — and the key is written to a separate file that
// the coding step never reads.
//
//   node analyze/blind-sheets.mjs        -> out/coding/sheet-NN.jpg
//                                          research/scroll-stop/coding-key.json

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const PER = 12;           // 4 x 3: large enough to read the smallest overlay text
const KEY = 'research/scroll-stop/coding-key.json';
const key = fs.existsSync(KEY) ? JSON.parse(fs.readFileSync(KEY, 'utf8')) : { next: 1, items: {} };
const known = new Set(Object.values(key.items).map((v) => `${v.creator}/${v.id}`));

const pool = [];
// harvested grids
for (const h of fs.readdirSync('harvest/grids')) {
  const f = path.join('harvest/grids', h, '_grid.json');
  if (!fs.existsSync(f)) continue;
  const g = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const it of g.items || []) {
    if (it.kind !== 'photo') continue;
    const img = path.join('harvest/grids', h, `${it.id}.jpg`);
    if (fs.existsSync(img)) pool.push({ creator: h, id: it.id, file: img });
  }
}
// his own account, harvested earlier from the profile page
const own = 'harvest/own/hotelmozil';
if (fs.existsSync(own)) {
  for (const d of fs.readdirSync(own)) {
    const m = d.match(/^\d+-(\d{15,})$/);
    if (!m) continue;
    const img = path.join(own, d, '01.jpg');
    if (fs.existsSync(img)) pool.push({ creator: 'hotelmozil', id: m[1], file: img });
  }
}

// corpus decks from creators with 3+ decks in it: no plays, but likes and an
// age, so each can be compared with the same creator's other decks. All of
// them cleared 50K likes, so this compares big winners with smaller winners.
{
  const rowsC = fs.readFileSync('harvest/tt-final.jsonl', 'utf8').split(/\r?\n/).filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  const per = {};
  for (const r of rowsC) (per[r.account] = per[r.account] || []).push(r);
  for (const [acc, list] of Object.entries(per)) {
    if (list.length < 3) continue;
    for (const r of list) {
      const img = path.join('harvest', 'tt-decks', r.id, '00.jpg');
      if (fs.existsSync(img)) pool.push({ creator: `corpus:${acc}`, id: r.id, file: img });
    }
  }
}

// new covers get the next codes, in a shuffled order so that a sheet never
// lines up with a creator or with time
const fresh = pool.filter((p) => !known.has(`${p.creator}/${p.id}`));
const seen = new Set();
const uniq = fresh.filter((p) => { const k = `${p.creator}/${p.id}`; if (seen.has(k)) return false; seen.add(k); return true; });
let seed = 20261008;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
for (let i = uniq.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [uniq[i], uniq[j]] = [uniq[j], uniq[i]]; }
for (const p of uniq) {
  const code = `C${String(key.next++).padStart(4, '0')}`;
  key.items[code] = { creator: p.creator, id: p.id, file: p.file };
}
fs.writeFileSync(KEY, JSON.stringify(key, null, 1));

// sheets only for codes not yet coded
const coded = new Set();
// one file per sheet in coded/, so a sheet is coded in one write
const CODED_DIR = 'research/scroll-stop/coded';
const codedFiles = fs.existsSync(CODED_DIR)
  ? fs.readdirSync(CODED_DIR).filter((x) => x.endsWith('.jsonl')) : [];
for (const cf of codedFiles) {
  for (const l of fs.readFileSync(path.join(CODED_DIR, cf), 'utf8').split(/\r?\n/)) {
    if (!l.trim()) continue;
    try { coded.add(JSON.parse(l).code); } catch { /* skip */ }
  }
}
const todo = Object.keys(key.items).filter((c) => !coded.has(c)).sort();
fs.mkdirSync('out/coding', { recursive: true });
for (const f of fs.readdirSync('out/coding')) if (/^sheet-\d+\.jpg$/.test(f)) fs.unlinkSync(path.join('out/coding', f));

const W = 360, H = 640, cols = 4;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: cols * W + 3 * 8, height: 900 } });
let n = 0;
for (let s = 0; s < todo.length; s += PER) {
  const batch = todo.slice(s, s + PER);
  const cells = batch.map((c) => {
    const b64 = fs.readFileSync(key.items[c].file).toString('base64');
    return `<figure><img src="data:image/jpeg;base64,${b64}"><figcaption>${c}</figcaption></figure>`;
  }).join('');
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#222;display:grid;grid-template-columns:repeat(${cols},${W}px);gap:8px;width:${cols * W + 3 * 8}px}
    figure{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:#000}
    img{width:${W}px;height:${H}px;object-fit:contain;display:block}
    figcaption{position:absolute;top:0;left:0;background:#0ff;color:#000;font:700 22px monospace;padding:1px 8px}
  </style>${cells}`, { waitUntil: 'load' });
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => {})))));
  const out = `out/coding/sheet-${String(++n).padStart(2, '0')}.jpg`;
  await page.screenshot({ path: out, fullPage: true, type: 'jpeg', quality: 88 });
}
await browser.close();
console.log(`${Object.keys(key.items).length} covers keyed, ${todo.length} to code -> ${n} sheets in out/coding/`);
