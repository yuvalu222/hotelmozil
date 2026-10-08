// Read OUR OWN TikTok profile, post by post, and keep everything.
//
// The owner's instruction, 3.10: before touching any copy again, go and look
// at what he actually posts. He puts HotelMozil in indirectly and always at
// the END; the posts are finished to the last detail. Further down the profile
// it turns into ads for his previous app (ai index) — that part is not ours
// and gets left alone.
//
// Cold reads only, same as tt-drain: the session is never warmed, because a
// warmed session is what starts serving login walls on post pages.
//
//   node harvest/tt-own-profile.mjs [@handle] [max]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const HANDLE = (process.argv[2] || 'hotelmozil').replace('@', '');
const MAX = Number(process.argv[3] || 40);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const OUT = path.join(ROOT, 'own', HANDLE);
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);
const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').trim().match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

const LAUNCH = {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1280, height: 1400 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
};
const ctx = await chromium.launchPersistentContext('recon/p-own', LAUNCH);

async function dl(url, dest) {
  try {
    const r = await ctx.request.get(url, { timeout: 30000, headers: { Referer: 'https://www.tiktok.com/' } });
    if (!r.ok()) return false;
    fs.writeFileSync(dest, await r.body());
    return true;
  } catch { return false; }
}

// ---- 1. the grid -----------------------------------------------------------
const page = await ctx.newPage();
await page.goto(`https://www.tiktok.com/@${HANDLE}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
await sleep(jitter(3500, 5000));
for (let i = 0; i < 6; i++) {
  await page.mouse.wheel(0, 2400);
  await sleep(jitter(1200, 2000));
}

const grid = await page.evaluate(() => {
  const seen = new Set();
  const out = [];
  for (const a of document.querySelectorAll('a[href*="/video/"], a[href*="/photo/"]')) {
    const href = a.href.split('?')[0];
    if (!/\/(video|photo)\/\d+/.test(href) || seen.has(href)) continue;
    seen.add(href);
    const card = a.closest('div');
    out.push({
      url: href,
      kind: href.includes('/photo/') ? 'photo' : 'video',
      cover: a.querySelector('img')?.src || null,
      views: card?.innerText?.trim().split('\n').pop() || null,
    });
  }
  return out;
});
const bio = await page.evaluate(() => ({
  name: document.querySelector('[data-e2e="user-title"]')?.innerText || null,
  subtitle: document.querySelector('[data-e2e="user-subtitle"]')?.innerText || null,
  bio: document.querySelector('[data-e2e="user-bio"]')?.innerText || null,
  followers: document.querySelector('[data-e2e="followers-count"]')?.innerText || null,
  likes: document.querySelector('[data-e2e="likes-count"]')?.innerText || null,
}));
await page.close();

console.log(`profile @${HANDLE}: ${grid.length} posts listed`);
console.log(JSON.stringify(bio, null, 1));
fs.writeFileSync(path.join(OUT, '_profile.json'), JSON.stringify({ bio, grid }, null, 2));

// ---- 2. each post, cold ----------------------------------------------------
const results = [];
for (const [i, g] of grid.slice(0, MAX).entries()) {
  const id = g.url.split('/').pop();
  const p = await ctx.newPage();
  let d = null;
  try {
    await p.goto(g.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await sleep(jitter(2500, 4000));
    d = await p.evaluate(() => {
      const t = (s) => document.querySelector(s)?.innerText?.trim() || null;
      const imgs = [...document.querySelectorAll('img')]
        .map((im) => ({ src: im.src, w: im.naturalWidth }))
        .filter((x) => /photomode|tiktokcdn/.test(x.src) && x.w >= 500);
      return {
        caption: t('[data-e2e="browse-video-desc"]') || t('[data-e2e="video-desc"]'),
        likes: t('[data-e2e="like-count"]') || t('[data-e2e="browse-like-count"]'),
        comments: t('[data-e2e="comment-count"]') || t('[data-e2e="browse-comment-count"]'),
        saves: t('[data-e2e="undefined-count"]'),
        music: document.querySelector('[data-e2e="video-music"]')?.innerText || null,
        imgs,
        fullText: document.body.innerText.slice(0, 4000),
      };
    });
  } catch (e) {
    console.log(`  ${id}: ${String(e.message).slice(0, 60)}`);
  }
  await p.close();
  if (!d) continue;

  // the run of four numbers under the post is likes / comments / saves / shares
  const run = (d.fullText || '').match(/^\s*([\d.]+[KMB]?)\s*$/gm)?.map((x) => x.trim()) || [];
  const dir = path.join(OUT, String(i + 1).padStart(2, '0') + '-' + id);
  fs.mkdirSync(dir, { recursive: true });

  const files = [];
  if (g.kind === 'photo') {
    const uniq = [...new Map(d.imgs.map((x) => [x.src.split('?')[0], x])).values()];
    for (const [k, im] of uniq.entries()) {
      const dest = path.join(dir, `${String(k + 1).padStart(2, '0')}.jpg`);
      if (await dl(im.src, dest)) files.push(dest);
    }
  } else if (g.cover) {
    const dest = path.join(dir, 'cover.jpg');
    if (await dl(g.cover, dest)) files.push(dest);
  }

  const rec = {
    i: i + 1, id, url: g.url, kind: g.kind,
    views: g.views,
    likes: num(d.likes) ?? num(run[0]),
    comments: num(d.comments) ?? num(run[1]),
    saves: num(d.saves) ?? num(run[2]),
    caption: d.caption, music: d.music,
    slideCount: files.length, files,
  };
  results.push(rec);
  fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify(rec, null, 2));
  console.log(`  ${rec.i}. ${rec.kind.padEnd(5)} ${String(rec.views || '?').padStart(6)} views  ${rec.slideCount} img  ${(rec.caption || '').slice(0, 60).replace(/\n/g, ' ')}`);
  await sleep(jitter(2500, 4500));
}

fs.writeFileSync(path.join(OUT, '_posts.json'), JSON.stringify(results, null, 2));
console.log(`\n${results.length} posts -> ${OUT}`);
await ctx.close();
