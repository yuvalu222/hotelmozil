// Prints the top of TikTok Studio's content list (scheduled posts show there with their time).
import { chromium } from 'playwright';
import path from 'node:path';
const ctx = await chromium.launchPersistentContext(path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'social-profile'), {
  channel: 'chrome', headless: false, viewport: { width: 1400, height: 1400 },
  args: ['--disable-blink-features=AutomationControlled', '--window-position=-32000,-32000', '--window-size=1400,1400'],
});
const page = await ctx.newPage();
try {
  await page.goto('https://www.tiktok.com/tiktokstudio/content', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(12000);
  const t = await page.evaluate(() => document.body.innerText);
  const i = t.indexOf('פוסטים:');
  console.log(t.slice(i, i + 1400));
  await page.screenshot({ path: path.join(import.meta.dirname, '_probe', 'content-after.png') });
} finally { await ctx.close(); }
