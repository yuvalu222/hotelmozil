// TikTok Creative Center popular hashtags: listen to the API the page calls.
import fs from 'node:fs';
import path from 'node:path';
import { openBrowser } from '../../ig/lib/tiktok.mjs';
const OUT = path.join(import.meta.dirname, 'cc');
fs.mkdirSync(OUT, { recursive: true });
const ctx = await openBrowser(path.join(process.env.TEMP, 'hm-cc-' + process.pid));
const page = await ctx.newPage();
const hits = [];
page.on('response', async (r) => {
  const u = r.url();
  if (!/creative_radar_api|popular_trend|hashtag/.test(u)) return;
  let j = null; try { j = await r.json(); } catch {}
  hits.push({ u, status: r.status(), j });
});
const url = process.argv[2] || 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en?countryCode=IL&period=30';
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(9000);
for (const h of hits) console.log(h.status, h.u.slice(0, 160), h.j ? JSON.stringify(h.j).slice(0, 200) : '');
console.log('title', await page.title());
console.log((await page.evaluate(() => document.body.innerText)).slice(0, 1200).replace(/\n+/g, ' | '));
fs.writeFileSync(path.join(OUT, 'probe.json'), JSON.stringify(hits.filter((h) => h.j), null, 1));
await ctx.close();
