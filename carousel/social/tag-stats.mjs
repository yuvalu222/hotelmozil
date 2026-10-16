// Hashtag popularity straight from TikTok (16.10): posts + views per tag, the
// same two numbers Creative Center shows. Creative Center itself needs a
// TikTok For Business login whose consent screen asks to "read and change
// account types" (a business account loses most trending sounds), so it is not
// authorised. Uses the logged-in social profile, off-screen.
//   node social/tag-stats.mjs <tag> <tag> ...   (no '#')
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const PROFILE = path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'social-profile');
const OUT = path.join(import.meta.dirname, '..', 'research', 'hashtags', 'tag-stats.json');
const db = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const ctx = await chromium.launchPersistentContext(PROFILE, {
  channel: 'chrome', headless: false, viewport: { width: 1300, height: 900 },
  args: ['--disable-blink-features=AutomationControlled', '--window-position=-32000,-32000', '--window-size=1300,900'],
});
const page = await ctx.newPage();
for (const tag of process.argv.slice(2)) {
  let info = null;
  const on = async (r) => { if (r.url().includes('/api/challenge/detail')) { try { info = await r.json(); } catch {} } };
  page.on('response', on);
  await page.goto('https://www.tiktok.com/tag/' + encodeURIComponent(tag), { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
  for (let i = 0; i < 15 && !info; i++) await page.waitForTimeout(1000);
  if (!info) {
    // stats are also embedded in the page's rehydration JSON
    info = await page.evaluate(() => { try { const s = JSON.parse(document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__').textContent); return s.__DEFAULT_SCOPE__['webapp.challenge-detail']?.challengeInfo; } catch { return null; } });
  }
  page.off('response', on);
  const ci = info?.challengeInfo || info;
  const st = ci?.statsV2 || ci?.stats || {};
  const row = { posts: Number(st.videoCount || 0), views: Number(st.viewCount || 0), at: new Date().toISOString() };
  db[tag] = row;
  console.log('#' + tag, row.posts, row.views);
}
await ctx.close();
fs.writeFileSync(OUT, JSON.stringify(db, null, 1));
