import { chromium } from 'playwright';
import fs from 'node:fs';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const OUT = 'recon/shots';
fs.mkdirSync(OUT, { recursive: true });

const HEADLESS = process.env.HEADED ? false : true;

const targets = [
  ['tiktok-search',  'https://www.tiktok.com/search?q=thailand%20travel%20tips'],
  ['tiktok-tag',     'https://www.tiktok.com/tag/traveltips'],
  ['pinterest',      'https://www.pinterest.com/search/pins/?q=thailand%20travel%20tips'],
  ['cc-topads',      'https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en'],
  ['meta-adlib',     'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IL&q=travel&media_type=all'],
  ['instagram-tag',  'https://www.instagram.com/explore/tags/traveltips/'],
  ['pexels',         'https://www.pexels.com/search/thailand/'],
];

const ctx = await chromium.launchPersistentContext('recon/profile', {
  channel: 'chrome', headless: HEADLESS, userAgent: UA,
  viewport: { width: 1440, height: 900 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));

const results = [];
for (const [name, url] of targets) {
  const page = await ctx.newPage();
  let r = { name, url };
  try {
    const resp = await page.goto(url, { timeout: 45000, waitUntil: 'domcontentloaded' });
    r.status = resp?.status() ?? null;
    await page.waitForTimeout(6000);
    const body = await page.evaluate(() => document.body.innerText.slice(0, 3000));
    r.title = await page.title();
    r.chars = body.length;
    // crude blocker detection
    r.blocked = /captcha|verify (that )?you are human|unusual traffic|log in to continue|access denied|are you a robot|security check/i.test(body);
    r.loginwall = /log ?in|sign ?up/i.test(body.slice(0, 600));
    // count plausible metric strings (12.3K, 1.2M, 4,521)
    r.metricHits = (body.match(/\b\d+(\.\d+)?[KMB]\b/g) || []).length;
    r.sample = body.replace(/\s+/g, ' ').slice(0, 260);
    await page.screenshot({ path: `${OUT}/${name}.jpg`, quality: 60, type: 'jpeg', fullPage: false });
  } catch (e) {
    r.error = String(e).split('\n')[0].slice(0, 160);
  }
  results.push(r);
  console.log(JSON.stringify(r));
  await page.close();
}
fs.writeFileSync('recon/probe-results.json', JSON.stringify(results, null, 2));
await ctx.close();
