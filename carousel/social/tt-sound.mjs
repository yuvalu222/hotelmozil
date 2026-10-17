// Find the sound of a TikTok post and add it to the account's Favorites, so
// the web uploader can pick it from the "מועדפים" tab (16.10).
//   node social/tt-sound.mjs <post url>
// Prints {id,title,author}. Runs off-screen in the logged-in social profile.
import { chromium } from 'playwright';
import path from 'node:path';

const url = process.argv[2];
const PROFILE = path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'social-profile');
const ctx = await chromium.launchPersistentContext(PROFILE, {
  channel: 'chrome', headless: false, viewport: { width: 1300, height: 1400 },
  args: ['--disable-blink-features=AutomationControlled', '--window-position=-32000,-32000', '--window-size=1300,1400'],
});
const page = await ctx.newPage();
const id = url.match(/(\d{15,})/)[1];
let music = null;
page.on('response', async (r) => {
  if (!r.url().includes('/api/')) return;
  let j; try { j = await r.json(); } catch { return; }
  const walk = (o) => { if (!o || typeof o !== 'object' || music) return; if (String(o.id) === id && o.music) { music = { id: o.music.id, title: o.music.title, author: o.music.authorName, original: o.music.original, dur: o.music.duration }; return; } Object.values(o).forEach(walk); };
  walk(j);
});
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
for (let i = 0; i < 20 && !music; i++) await page.waitForTimeout(1000);
if (!music) music = await page.evaluate(() => { const a = document.querySelector('a[href*="/music/"]'); return a && { href: a.href, title: a.innerText }; });
console.log('sound', JSON.stringify(music));
if (music?.id) {
  await page.goto(`https://www.tiktok.com/music/x-${music.id}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(8000);
  await page.getByText('הבנתי', { exact: true }).click().catch(() => {});
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
  const all = await page.$$eval('button, [role=button]', (a) => a.map((b) => ({ t: (b.innerText || '').trim().slice(0, 25), al: b.getAttribute('aria-label') || '', dt: b.getAttribute('data-e2e') || '', y: Math.round(b.getBoundingClientRect().y) })).filter((x) => x.y < 450));
  console.log('top buttons', JSON.stringify(all));
  // the favorite toggle lives in the sound page's "פעולות" (more) menu
  await page.locator('[data-e2e="music-more"]').click();
  await page.waitForTimeout(2000);
  const menu = await page.$$eval('[role=menuitem], [role=option], li, button', (a) => a.map((b) => (b.innerText || '').trim()).filter((t) => t && t.length < 40));
  console.log('menu', JSON.stringify([...new Set(menu)].slice(-15)));
  const item = page.getByText(/^(הוספה למועדפים|להוסיף למועדפים|הוסף למועדפים|Add to Favorites)$/).first();
  if (await item.count()) { await item.click(); await page.waitForTimeout(2500); console.log('favorited'); }
  else if (await page.getByText(/^(הסרה מהמועדפים|להסיר מהמועדפים|Remove from Favorites)$/).count()) console.log('already in favorites');
  else console.log('no favorite item in menu');
  await page.screenshot({ path: path.join(process.env.TEMP, 'tt-sound.png') });
}
await ctx.close();
