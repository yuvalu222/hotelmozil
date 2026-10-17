// Dump the text fields Pinterest returns for a query (to find captions/links).
import { openBrowser } from '../../ig/lib/tiktok.mjs';
import path from 'node:path';
const ctx = await openBrowser(path.join(process.env.TEMP, 'hm-pinprobe'));
const page = await ctx.newPage();
const got = [];
page.on('response', async (r) => { if (r.url().includes('BaseSearchResource')) { try { got.push(...((await r.json()).resource_response?.data?.results || [])); } catch {} } });
await page.goto('https://www.pinterest.com/search/pins/?q=' + encodeURIComponent(process.argv[2]), { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(5000);
for (let i = 0; i < 6; i++) { await page.evaluate(() => { document.querySelectorAll('[role="dialog"]').forEach((e) => e.remove()); window.scrollBy(0, 4000); }); await page.waitForTimeout(2000); }
for (const r of got.slice(0, 6)) {
  const o = {};
  for (const [k, v] of Object.entries(r)) if (typeof v === 'string' && v && !k.includes('url')) o[k] = v.slice(0, 100);
  o.rich = r.rich_summary?.display_name; o.link = r.link; o.domain = r.domain; o.alt = r.auto_alt_text;
  console.log(JSON.stringify(o));
}
await ctx.close();
