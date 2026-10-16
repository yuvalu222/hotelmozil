// One-time login for posting (16.10). Opens a visible Chrome window with a
// dedicated, persistent profile (outside every repo) on the TikTok and
// Instagram login pages. The owner logs in once (QR from the phone is
// easiest); the session stays in the profile, and social/post-*.mjs reuse it.
// Waits until both 'sessionid' cookies exist, then closes.
//   node social/login.mjs
import { chromium } from 'playwright';
import path from 'node:path';

const PROFILE = path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'social-profile');
const ctx = await chromium.launchPersistentContext(PROFILE, {
  channel: 'chrome', headless: false, viewport: null,
  args: ['--start-maximized', '--disable-blink-features=AutomationControlled'],
});
const tt = ctx.pages()[0] || await ctx.newPage();
await tt.goto('https://www.tiktok.com/login/qrcode');
const cc = await ctx.newPage();
await cc.goto('https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en');
const ig = await ctx.newPage();
await ig.goto('https://www.instagram.com/accounts/login/');
const has = async (domain) => (await ctx.cookies()).some((c) => c.name === 'sessionid' && c.domain.includes(domain) && c.value);
for (let i = 0; i < 60 * 30; i++) {
  const t = await has('tiktok'), g = await has('instagram');
  if (i % 30 === 0) console.log(new Date().toISOString().slice(11, 19), 'tiktok', t, 'instagram', g);
  if (t && g) { console.log('both logged in'); break; }
  await new Promise((r) => setTimeout(r, 2000));
}
await ctx.close();
