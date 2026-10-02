// TikTok harvester — the platform the study never actually used.
//
// Recon proved three things and then the study ignored all of them:
//   1. an individual post page renders logged out, with like / comment / SHARE
//   2. /discover/<slug> and /channel/<slug> each list ~26 post URLs
//   3. none of those listed URLs is ever a /photo/ one
//
// (3) is why the corpus went to Instagram instead. But (1) is the only place
// in this entire study where SHARE counts exist, and the brief's §6 says
// shares are the KPI for reference content — so skipping TikTok threw away the
// one metric that mattered most.
//
// What this collects: travel posts on TikTok with likes, comments and shares,
// plus the cover frame. Video posts are not Yuval's format, and are labelled
// as video — but their hook line and cover frame transfer directly to a
// carousel cover, and the share ratio is computable for the first time.
//
// Writes harvest/tiktok.jsonl and harvest/tt-covers/<id>.jpg

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const COVERS = path.join(ROOT, 'tt-covers');
fs.mkdirSync(COVERS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SLUGS = [
  'discover/travel-tips', 'discover/thailand-travel-tips', 'discover/things-to-do-in-athens',
  'discover/greece-travel-tips', 'discover/dubai-travel-tips', 'discover/travel-hacks',
  'discover/budget-travel-tips', 'discover/travel-mistakes', 'discover/first-time-in-europe',
  'discover/cheap-flights-tips', 'discover/hotel-tips', 'discover/packing-tips',
  'discover/things-to-do-in-bangkok', 'discover/vietnam-travel-tips',
  'channel/travel', 'channel/what-to-do-in-thailand', 'explore',
];

const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

const donePath = path.join(ROOT, 'tt-done.json');
const done = new Set(fs.existsSync(donePath) ? JSON.parse(fs.readFileSync(donePath, 'utf8')) : []);
const out = fs.createWriteStream(path.join(ROOT, 'tiktok.jsonl'), { flags: 'a' });
const log = (s) => { console.log(s); };

const ctx = await chromium.launchPersistentContext('recon/p-tiktok', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1400, height: 1000 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));

// ---------- enumerate ----------
const urls = new Set();
const page = await ctx.newPage();
for (const slug of SLUGS) {
  try {
    await page.goto(`https://www.tiktok.com/${slug}`, { timeout: 45000, waitUntil: 'domcontentloaded' });
    await sleep(7000);
    for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 1800); await sleep(2000); }
    const found = await page.evaluate(() =>
      [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.href)
        .filter((h) => /tiktok\.com\/@[^/]+\/(photo|video)\/\d+/.test(h)))]);
    found.forEach((u) => urls.add(u.split('?')[0]));
    const photos = found.filter((u) => u.includes('/photo/')).length;
    log(`${slug}: +${found.length} (photo ${photos})  total ${urls.size}`);
  } catch (e) {
    log(`${slug}: FAIL ${String(e).split('\n')[0].slice(0, 70)}`);
  }
  await sleep(1500);
}
await page.close();

const list = [...urls].filter((u) => !done.has(u));
log(`\nposts to visit: ${list.length} (${[...urls].filter((u) => u.includes('/photo/')).length} photo posts)\n`);

// ---------- visit ----------
const p = await ctx.newPage();
let kept = 0;
for (const url of list) {
  done.add(url);
  try {
    await p.goto(url, { timeout: 60000, waitUntil: 'commit' });
    await sleep(9000);
    const d = await p.evaluate(() => {
      const g = (s) => { const e = document.querySelector(`[data-e2e="${s}"]`); return e ? e.innerText.trim() : null; };
      const t = document.body.innerText || '';
      const html = document.documentElement.innerHTML;
      return {
        likes: g('like-count') || g('browse-like-count'),
        comments: g('comment-count') || g('browse-comment-count'),
        shares: g('share-count') || g('undefined-count'),
        author: g('browse-username') || g('user-title'),
        caption: (g('browse-video-desc') || g('new-desc-span') || '').slice(0, 1200),
        isImagePost: /imagePost|"photoMode"\s*:\s*true/.test(html),
        txt: t.replace(/\s+/g, ' ').slice(0, 400),
      };
    });
    const likes = num(d.likes), comments = num(d.comments), shares = num(d.shares);
    if (likes == null) continue;

    const id = url.split('/').pop();
    const shot = path.join(COVERS, `${id}.jpg`);
    try { await p.screenshot({ path: shot, type: 'jpeg', quality: 62 }); } catch { /* keep going */ }

    out.write(JSON.stringify({
      source: 'tiktok', pile: 'B', organic: true,
      url, id,
      account: d.author,
      kind: url.includes('/photo/') || d.isImagePost ? 'photo-carousel' : 'video',
      likes, comments, shares,
      // the ratio Instagram cannot give at all: how often a viewer passes it on
      sharesPerLike: likes ? +(shares / likes).toFixed(4) : null,
      commentsPerLike: likes ? +(comments / likes).toFixed(4) : null,
      caption: d.caption || d.txt,
      cover: shot,
      harvestedAt: new Date().toISOString(),
    }) + '\n');
    kept++;
    if (kept % 5 === 0) {
      log(`kept ${kept}/${list.length}`);
      fs.writeFileSync(donePath, JSON.stringify([...done]));
    }
  } catch { /* skip */ }
  await sleep(1200);
}
fs.writeFileSync(donePath, JSON.stringify([...done]));
out.end();
log(`\nDONE tiktok posts kept=${kept}`);
await p.close();
await ctx.close();
