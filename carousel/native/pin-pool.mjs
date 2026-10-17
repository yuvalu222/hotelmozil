// Pinterest candidates at full resolution (16.10). Logged-out search works:
// the page loads BaseSearchResource itself, and each result carries
// images.orig (often 3024x4032 phone photos). Owner OK'd Pinterest (15.10).
// Portrait-ish only (h/w >= 1.15), long side >= 1600.
//
//   node native/pin-pool.mjs "<query>" ...      -> pool.json (source: 'pinterest'), thumbs/
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from '../ig/lib/tiktok.mjs';

const HERE = import.meta.dirname;
// PIN_POOL: a separate pool file, so several searches can run side by side (merge with pool-merge.mjs)
const poolFile = process.env.PIN_POOL || path.join(HERE, 'pool', 'pool.json');
const main = JSON.parse(fs.readFileSync(path.join(HERE, 'pool', 'pool.json'), 'utf8'));
const pool = fs.existsSync(poolFile) ? JSON.parse(fs.readFileSync(poolFile, 'utf8')) : {};
const SCROLLS = Number(process.env.PIN_SCROLLS || 8);

const ctx = await openBrowser(path.join(process.env.TEMP, 'hm-pin-' + process.pid));
for (const q of process.argv.slice(2)) {
  const page = await ctx.newPage();
  const got = [];
  page.on('response', async (r) => {
    if (!r.url().includes('BaseSearchResource')) return;
    try { got.push(...((await r.json()).resource_response?.data?.results || [])); } catch { /* not json */ }
  });
  try {
    await page.goto('https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(q), { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(5000);
    for (let i = 0; i < SCROLLS; i++) {
      // the logged-out sign-in modal swallows wheel events; close it and scroll the document itself
      await page.keyboard.press('Escape').catch(() => {});
      await page.evaluate(() => { document.querySelectorAll('[data-test-id="fullPageSignupModal"],[role="dialog"]').forEach((e) => e.remove()); document.body.style.overflow = 'auto'; window.scrollBy(0, 4000); });
      await page.waitForTimeout(1800 + Math.random() * 1200);
    }
  } catch (e) { console.log(`${q}: ${e.message.slice(0, 60)}`); }
  await page.close();
  let added = 0;
  for (const r of got) {
    const o = r.images?.orig; if (!o?.url || r.videos || r.story_pin_data) continue;
    if (o.height / o.width < 1.15 || Math.max(o.width, o.height) < 1600) continue;
    const id = 'pin-' + r.id;
    if (pool[id] || main[id]) continue;
    const thumb = r.images['474x']?.url || r.images['236x']?.url;
    try {
      const t = await ctx.request.get(thumb, { timeout: 30000 });
      if (!t.ok()) continue;
      fs.writeFileSync(path.join(HERE, 'pool', 'thumbs', `${id}.jpg`), await t.body());
    } catch { continue; }
    pool[id] = { id, source: 'pinterest', query: q, w: o.width, h: o.height, raw: o.url, small: thumb,
      alt: (r.grid_title || r.title || r.description || '').slice(0, 200), pinner: r.pinner?.username || null, camera: null };
    added++;
  }
  console.log(`${q}: ${got.length} results, ${added} added`);
  fs.writeFileSync(poolFile, JSON.stringify(pool, null, 1));
}
await ctx.close();
