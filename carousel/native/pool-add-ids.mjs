// Add specific Unsplash photo ids to the pool (thumb + raw url), via a real
// Chrome session because Unsplash refuses plain HTTP clients.
//   node native/pool-add-ids.mjs <query-tag> <id> <id> ...
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from '../ig/lib/tiktok.mjs';

const HERE = import.meta.dirname;
const [tag, ...ids] = process.argv.slice(2);
const poolFile = path.join(HERE, 'pool', 'pool.json');
const pool = JSON.parse(fs.readFileSync(poolFile, 'utf8'));
const ctx = await openBrowser(path.join(process.env.TEMP, 'hm-unsplash-ids-' + process.pid));
const page = await ctx.newPage();
await page.goto('https://unsplash.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(2500);
for (const id of ids) {
  const x = await page.evaluate(async (id) => {
    const r = await fetch(`/napi/photos/${id}`);
    if (!r.ok) return null;
    const j = await r.json();
    return { id: j.id, w: j.width, h: j.height, premium: !!j.premium, plus: !!j.plus, alt: j.alt_description || j.description, small: j.urls?.small, raw: j.urls?.raw, loc: j.location?.name };
  }, id);
  if (!x || x.premium || x.plus) { console.log(`${id}: ${x ? 'premium' : 'not found'}`); continue; }
  pool[id] = { ...x, query: tag, camera: null };
  const r = await ctx.request.get(x.small, { timeout: 30000 });
  if (r.ok()) fs.writeFileSync(path.join(HERE, 'pool', 'thumbs', `${id}.jpg`), await r.body());
  console.log(`${id}: ${x.w}x${x.h} ${x.loc || ''}`);
}
fs.writeFileSync(poolFile, JSON.stringify(pool, null, 1));
await ctx.close();
