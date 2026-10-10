// Pexels candidates for exact places Unsplash lacks (10.10). Pexels licence:
// free, no attribution. Thumbs go into the same pool (pool.json, source:
// 'pexels'), so sheets and picks treat both sources alike.
//
//   node native/pexels-pool.mjs "Koh Kradan" "Kata Noi" ...

import fs from 'node:fs';
import path from 'node:path';
import { searchPexelsBrowser, closeBrowser } from '../lib/stock-browser.js';

const HERE = import.meta.dirname;
const poolFile = path.join(HERE, 'pool', 'pool.json');
const pool = JSON.parse(fs.readFileSync(poolFile, 'utf8'));
for (const q of process.argv.slice(2)) {
  let res = [];
  try { res = await searchPexelsBrowser(q, { perPage: 30 }); } catch (e) { console.log(`${q}: ${e.message}`); continue; }
  let added = 0;
  for (const c of res) {
    const id = c.id;
    if (pool[id]) continue;
    const base = c.url.split('?')[0]; pool[id] = { id, source: 'pexels', query: q, w: null, h: null, alt: c.altRaw || '', page: c.credit?.page, small: base + '?auto=compress&w=400', raw: base, camera: null };
    const t = path.join(HERE, 'pool', 'thumbs', `${id}.jpg`);
    try {
      const r = await fetch(pool[id].small, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/152.0' } });
      if (r.ok) { fs.writeFileSync(t, Buffer.from(await r.arrayBuffer())); added++; } else delete pool[id];
    } catch { delete pool[id]; }
  }
  console.log(`${q}: ${res.length} results, ${added} added`);
}
fs.writeFileSync(poolFile, JSON.stringify(pool, null, 1));
await closeBrowser();
