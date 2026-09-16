// Meta Ad Library harvester — Pile A (has a denominator).
//
// Stage 1 sweeps keywords to discover advertisers and ads.
// Stage 2 pulls every ad for each advertiser so a per-advertiser median run
// duration can be computed (the §3 algorithm, mapped onto run duration).
//
// Nothing here is presented as organic. These are ads.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const SHOTS = path.join(ROOT, 'adlib-shots');
fs.mkdirSync(SHOTS, { recursive: true });

// active_status=all so killed ads are included — that is what makes run
// duration a performance signal at all.
const base = 'https://www.facebook.com/ads/library/?ad_type=all&search_type=keyword_unordered&media_type=all&active_status=all';

const SWEEPS = [
  // Hebrew, Israel — the user's own market
  ['IL', 'חופשה'], ['IL', 'טיסות'], ['IL', 'מלון'], ['IL', 'חבילת נופש'],
  ['IL', 'טיול מאורגן'], ['IL', 'דילים'], ['IL', 'תאילנד'], ['IL', 'יוון'],
  // English, large travel markets — carousel craft at volume
  ['US', 'travel deals'], ['US', 'hotel deals'], ['US', 'flight deals'],
  ['GB', 'holiday deals'], ['GB', 'cheap flights'],
];

const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseStart(txt) {
  const m = txt.match(/Started running on ([A-Za-z]{3} \d{1,2},? \d{4})/);
  if (!m) return null;
  const d = new Date(m[1].replace(',', ''));
  return isNaN(d) ? null : d;
}

async function scrapeListing(page, url, maxScroll = 10) {
  await page.goto(url, { timeout: 90000, waitUntil: 'domcontentloaded' });
  await sleep(12000);
  let last = 0;
  for (let i = 0; i < maxScroll; i++) {
    await page.mouse.wheel(0, 3000);
    await sleep(2800);
    const n = await page.evaluate(() =>
      [...document.querySelectorAll('div')].filter(e => (e.innerText?.match(/Library ID:/g) || []).length === 1).length);
    if (n === last && i > 2) break;
    last = n;
  }
  return await page.evaluate(() => {
    const cards = [...document.querySelectorAll('div')]
      .filter(e => (e.innerText?.match(/Library ID:/g) || []).length === 1);
    return cards.map(e => {
      const t = e.innerText || '';
      const imgs = [...e.querySelectorAll('img')].map(i => i.src)
        .filter(s => /scontent|fbcdn/.test(s) && !/s60x60|p50x50/.test(s));
      const pageLink = [...e.querySelectorAll('a[href*="view_all_page_id"], a[href*="facebook.com/"]')]
        .map(a => a.href).find(h => /view_all_page_id=(\d+)/.test(h)) || null;
      return {
        libraryId: (t.match(/Library ID:\s*(\d+)/) || [])[1] || null,
        startedRaw: (t.match(/Started running on [A-Za-z]{3} \d{1,2},? \d{4}/) || [])[0] || null,
        active: /^\s*​?\s*Active/m.test(t) || /\bActive\b/.test(t.slice(0, 60)),
        advertiser: (t.split('\n').find(l => l.trim() && !/Library ID|Started running|Platforms|Open Dropdown|See ad details|Active|Inactive|^​$/.test(l)) || '').trim(),
        text: t.replace(/\s+/g, ' ').slice(0, 900),
        imgUrls: [...new Set(imgs)].slice(0, 12),
        imgCount: [...new Set(imgs)].length,
        hasVideo: e.querySelectorAll('video').length > 0,
        pageLink,
      };
    }).filter(c => c.libraryId);
  });
}

const ctx = await chromium.launchPersistentContext('recon/profile-hl', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1500, height: 1100 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));

const page = await ctx.newPage();
await page.goto('https://www.facebook.com/ads/library/', { timeout: 60000, waitUntil: 'domcontentloaded' });
await sleep(4000);

const out = fs.createWriteStream(path.join(ROOT, 'adlib-raw.jsonl'), { flags: 'a' });
const seen = new Set();
let total = 0;

for (const [country, q] of SWEEPS) {
  const url = `${base}&country=${country}&q=${encodeURIComponent(q)}`;
  let cards = [];
  try {
    cards = await scrapeListing(page, url);
  } catch (e) {
    console.log(`SWEEP FAIL ${country}/${q}: ${String(e).split('\n')[0].slice(0, 90)}`);
    continue;
  }
  let fresh = 0;
  for (const c of cards) {
    if (seen.has(c.libraryId)) continue;
    seen.add(c.libraryId);
    const start = c.startedRaw ? parseStart(c.startedRaw) : null;
    const rec = {
      ...c, country, query: q,
      startDate: start ? start.toISOString().slice(0, 10) : null,
      runDays: start ? Math.round((Date.now() - start) / 86400000) : null,
      harvestedAt: new Date().toISOString(),
    };
    out.write(JSON.stringify(rec) + '\n');
    fresh++; total++;
  }
  console.log(`${country}/${q}: ${cards.length} cards, ${fresh} new (total ${total})`);
  await sleep(2500);
}
out.end();
console.log('DONE total unique ads =', total);
await page.close();
await ctx.close();
