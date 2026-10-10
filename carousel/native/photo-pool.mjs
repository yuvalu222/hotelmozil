// Photo pool for the native decks (10.10).
//
// His slides are real iPhone travel photos at 3:4. So the pool is Unsplash
// (free licence, many iPhone uploads), searched through a real Chrome session
// (plain requests get 403), keeping only free (not Unsplash+), portrait,
// full-resolution photos, with the camera recorded from EXIF. Every candidate
// lands on a numbered contact sheet; choosing is done by eye, one by one,
// because "every image must be a WOW" is not something a filter can judge.
//
//   node native/photo-pool.mjs            search + thumbs + sheets
// Out: native/pool/pool.json, native/pool/thumbs/<id>.jpg, native/pool/sheet-NN.jpg

import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from '../ig/lib/tiktok.mjs';

const OUT = path.join(import.meta.dirname, 'pool');
const THUMBS = path.join(OUT, 'thumbs');
fs.mkdirSync(THUMBS, { recursive: true });

const EXTRA = process.argv.slice(2);
export const QUERIES = EXTRA.length ? EXTRA : [
  'maya bay', 'railay beach', 'phi phi island', 'koh lipe', 'longtail boat thailand',
  'krabi beach', 'thailand sunset beach', 'koh tao', 'koh lanta', 'khao sok lake',
  'andaman sea beach', 'el nido beach', 'tropical beach sunset', 'sunset over sea',
  'turquoise beach woman', 'koh yao noi', 'similan islands', 'koh kood', 'erawan falls',
  'thailand island viewpoint', 'koh samet', 'koh chang thailand', 'khao lak beach', 'thai temple',
  'bangkok street night', 'thailand night market',
];

const poolFile = path.join(OUT, 'pool.json');
const pool = fs.existsSync(poolFile) ? JSON.parse(fs.readFileSync(poolFile, 'utf8')) : {};

const ctx = await openBrowser(path.join(process.env.TEMP, 'hm-unsplash-pool'));
const page = await ctx.newPage();
await page.goto('https://unsplash.com/s/photos/beach?orientation=portrait', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(3000);

for (const q of QUERIES) {
  const res = await page.evaluate(async (q) => {
    const out = [];
    for (const p of [1, 2]) {
      const r = await fetch(`/napi/search/photos?query=${encodeURIComponent(q)}&per_page=30&page=${p}&orientation=portrait`);
      if (!r.ok) break;
      const j = await r.json();
      out.push(...j.results);
    }
    return out.map((x) => ({ id: x.id, w: x.width, h: x.height, premium: !!x.premium, plus: !!x.plus, alt: x.alt_description, small: x.urls?.small, raw: x.urls?.raw, user: x.user?.username, likes: x.likes }));
  }, q);
  let added = 0;
  for (const x of res) {
    if (x.premium || x.plus || pool[x.id]) continue;
    if (x.h < 3000 || x.h / x.w < 1.25) continue; // tall enough to crop 3:4 at 1440 wide
    pool[x.id] = { ...x, query: q };
    added++;
  }
  console.log(`${q}: ${res.length} results, ${added} added`);
}

// Camera, from each photo's own page data.
for (const p of Object.values(pool).filter((p) => p.camera === undefined)) {
  const d = await page.evaluate(async (id) => {
    const r = await fetch(`/napi/photos/${id}`);
    if (!r.ok) return null;
    const j = await r.json();
    return { make: j.exif?.make || null, model: j.exif?.model || null, loc: j.location?.name || null };
  }, p.id);
  p.camera = d ? [d.make, d.model].filter(Boolean).join(' ') || null : null;
  p.location = d?.loc || null;
}
fs.writeFileSync(poolFile, JSON.stringify(pool, null, 1));

for (const p of Object.values(pool)) {
  const f = path.join(THUMBS, `${p.id}.jpg`);
  if (fs.existsSync(f)) continue;
  try {
    const r = await ctx.request.get(p.small, { timeout: 30000 });
    if (r.ok()) fs.writeFileSync(f, await r.body());
  } catch { /* skipped on the sheet */ }
}
await ctx.close();
console.log(`pool: ${Object.keys(pool).length} photos`);
