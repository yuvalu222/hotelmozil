// What is actually trending on TikTok in Israel, from TikTok's own Creative
// Center rather than from guesswork.
//
// The Creative Center is TikTok's public insights tool for advertisers. Its
// pages are a JS app, so the numbers are read from the same JSON endpoints the
// page itself calls, inside a real browser session so the request carries the
// headers the API expects.
//
//   node harvest/tt-creative-center.mjs [country] [days]

import { chromium } from 'playwright';
import fs from 'node:fs';

const COUNTRY = (process.argv[2] || 'IL').toUpperCase();
const DAYS = Number(process.argv[3] || 7);
const BS = String.fromCharCode(92);

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ctx = await chromium.launchPersistentContext('recon/p-cc', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1400, height: 1000 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage'],
});
const page = await ctx.newPage();

// Load the real page first so the session has whatever cookies the API wants.
const landing = `https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en?region=${COUNTRY}`;
await page.goto(landing, { waitUntil: 'domcontentloaded', timeout: 90000 });
await page.waitForTimeout(6000);

const ENDPOINTS = {
  hashtags: `https://ads.tiktok.com/creative_radar_api/v1/popular_trend/hashtag/list?period=${DAYS}&page=1&limit=50&order_by=popular&country_code=${COUNTRY}`,
  songs: `https://ads.tiktok.com/creative_radar_api/v1/top_ads/v2/list?period=${DAYS}&page=1&limit=20&country_code=${COUNTRY}`,
};

const out = {};
for (const [name, url] of Object.entries(ENDPOINTS)) {
  try {
    const r = await page.evaluate(async (u) => {
      const res = await fetch(u, { headers: { 'web-id': '1', 'timestamp': String(Date.now()) } });
      return { status: res.status, body: await res.text() };
    }, url);
    out[name] = r;
    console.log(`${name}: HTTP ${r.status}, ${r.body.length} bytes`);
  } catch (e) {
    console.log(`${name}: ${String(e.message).slice(0, 80)}`);
  }
}

// Whatever the API gave, also keep what the rendered page shows, because the
// page is the thing a human would read and it is the check on the JSON.
const onPage = await page.evaluate(() => {
  const txt = document.body.innerText || '';
  return txt.slice(0, 6000);
});

fs.mkdirSync('harvest/cc', { recursive: true });
fs.writeFileSync(`harvest/cc/${COUNTRY}-${DAYS}d.json`, JSON.stringify({ out, onPage }, null, 2));
await page.screenshot({ path: `harvest/cc/${COUNTRY}-${DAYS}d.png`, fullPage: false });
console.log(`\n--- what the page renders ---\n${onPage.slice(0, 2500)}`);
await ctx.close();
