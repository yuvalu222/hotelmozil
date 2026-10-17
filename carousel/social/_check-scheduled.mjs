// Lists the dated rows of TikTok Studio's content list (scheduled posts show
// there with their time). The list renders lazily and drops rows that scroll
// away, so rows are collected at every scroll step.
//   node social/_check-scheduled.mjs
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
  const seen = new Set();
  for (let k = 0; k < 8; k++) {
    const lines = (await page.evaluate(() => document.body.innerText)).split('\n').map((l) => l.trim());
    lines.forEach((l, i) => {
      if (!l.startsWith('#')) return;
      const date = lines.slice(i + 1, i + 3).find((x) => /\d+ ב/.test(x));
      if (date) seen.add(`${date.replace(/[^\S ]|‏/g, '')}  ${l}`);
    });
    await page.mouse.move(700, 800); await page.mouse.wheel(0, 800); await page.waitForTimeout(2000);
  }
  console.log([...seen].join('\n'));
} finally { await ctx.close(); }
