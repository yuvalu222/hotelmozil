// TikTok Creative Center popular hashtags for a country (16.10).
// The page (now "TikTok One", ads.tiktok.com/creative/creativeCenter) forces
// region=US when logged out, but its own API, KnowledgeAPI/GetHashtagList,
// answers for any countryCode from inside the page. Headless gets a 403, so
// the browser runs headed but off-screen (the owner asked: no windows popping
// up on his screen).
//   node social/cc-hashtags.mjs [countryCode=IL] [days=30] [pages=5] [industryId]
// Out: research/hashtags/cc/cc-<country>-<days>[-<industry>].json + table.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const [country = 'IL', days = '30', pages = '5', industry = ''] = process.argv.slice(2);
const OUT = path.join(import.meta.dirname, '..', 'research', 'hashtags', 'cc');
fs.mkdirSync(OUT, { recursive: true });
const ctx = await chromium.launchPersistentContext(path.join(process.env.TEMP, 'hm-cc-profile'), {
  channel: 'chrome', headless: false, viewport: { width: 1400, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--window-position=-32000,-32000', '--window-size=1400,1000'],
});
const page = await ctx.newPage();
let ready = false;
ctx.on('request', (r) => { if (r.url().includes('GetHashtagList')) ready = true; });
await page.goto('https://ads.tiktok.com/creative/creativeCenter/trends?countryCode=US&period=30', { waitUntil: 'commit', timeout: 60000 });
for (let i = 0; i < 60 && !ready; i++) await page.waitForTimeout(1000);
if (!ready) throw new Error('the page never called GetHashtagList: the API may have moved');

const items = [];
for (let p = 1; p <= Number(pages); p++) {
  const body = { timeRange: Number(days), countryCode: country, page: p, limit: 50 };
  if (industry) body.industryID = industry;
  const j = await page.evaluate(async (b) => {
    const r = await fetch('https://ads.tiktok.com/CreativeOne/KnowledgeAPI/GetHashtagList', { method: 'POST', body: JSON.stringify(b), headers: { 'content-type': 'application/json' }, credentials: 'include' });
    return r.json();
  }, body);
  if (j?.BaseResp?.StatusCode !== 0) { console.log('page', p, 'error', JSON.stringify(j).slice(0, 200)); break; }
  const got = j.items || [];
  for (const it of got) { delete it.popularityCurve; delete it.topCreators; items.push(it); }
  if (got.length < 50) break;
}
await ctx.close();

const name = `cc-${country}-${days}${industry ? '-' + industry : ''}`;
fs.writeFileSync(path.join(OUT, name + '.json'), JSON.stringify({ at: new Date().toISOString(), country, days, industry, items }, null, 1));
const heb = /[֐-׿]/, arab = /[؀-ۿ]/;
for (const it of items) {
  const script = arab.test(it.hashtagName) ? 'AR' : heb.test(it.hashtagName) ? 'HE' : '';
  console.log(String(it.rankIndex).padStart(3), script.padEnd(2), '#' + it.hashtagName, it.publishCnt, it.videoViews ?? it.viewCnt ?? '', (it.industryIDs || []).join(','));
}
console.log(items.length, 'hashtags ->', path.join(OUT, name + '.json'));
