// Read carousel URLs already collected, without touching search at all.
//
// Search is the endpoint TikTok rate-limits hardest, and after a night of it
// the IP now gets refused on the first query. Post pages are a different
// surface and still answer. ~134 carousel URLs were already gathered before
// the block, so this drains that queue instead of fighting for new ones.
//
// Likes come from the page itself here (not from a search card), so the
// 50,000 floor is applied after reading rather than before.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const DECKS = path.join(ROOT, 'tt-decks');
fs.mkdirSync(DECKS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);
const FLOOR = 50000;

const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').trim().match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

// pull every carousel URL any earlier pass collected
const urls = new Set();
for (const f of ['ttf-seen.json', 'tt-seen.json']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  try {
    for (const u of JSON.parse(fs.readFileSync(p, 'utf8'))) {
      if (/\/photo\/\d+/.test(u)) urls.add(u.split('?')[0]);
    }
  } catch { /* skip */ }
}
const readPath = path.join(ROOT, 'ttr-done.json');
const read = new Set(fs.existsSync(readPath) ? JSON.parse(fs.readFileSync(readPath, 'utf8')) : []);
const todo = [...urls].filter((u) => !read.has(u));

const out = fs.createWriteStream(path.join(ROOT, 'tt-final.jsonl'), { flags: 'a' });
const lg = fs.createWriteStream(path.join(ROOT, 'tt-read.log'), { flags: 'a' });
const log = (s) => { console.log(s); lg.write(s + '\n'); };
log(`\n=== reader ${new Date().toISOString()} — ${todo.length} carousel URLs queued, floor ${FLOOR.toLocaleString()} ===`);

const ctx = await chromium.launchPersistentContext('recon/p-card', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1300, height: 1200 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
let page = await ctx.newPage();

async function newPage() {
  try { if (page && !page.isClosed()) await page.close(); } catch { /* gone */ }
  page = await ctx.newPage();
}
async function warm() {
  try {
    if (!page || page.isClosed()) await newPage();
    await page.goto('https://www.tiktok.com/', { timeout: 60000, waitUntil: 'domcontentloaded' });
    await sleep(6000);
    for (const sel of ['button:has-text("Accept all")', 'button:has-text("Allow all")', '[data-e2e="accept-all"]']) {
      try {
        const b = page.locator(sel).first();
        if (await b.count()) { await b.click({ timeout: 3000 }); await sleep(1800); break; }
      } catch { /* no banner */ }
    }
    return true;
  } catch (e) {
    log(`  warm failed: ${String(e).split(String.fromCharCode(10))[0].slice(0, 60)}`);
    try { await newPage(); } catch { /* next cycle */ }
    return false;
  }
}
await warm();

// give the limit time to decay before the first request
const COLD_START_MS = Number(process.env.TT_COLD_MS ?? 0);
if (COLD_START_MS > 0) {
  log(`  cooling ${Math.round(COLD_START_MS / 60000)}m before first read`);
  await sleep(COLD_START_MS);
  await warm();
}

async function dl(url, dest) {
  try {
    const r = await ctx.request.get(url, { timeout: 30000, headers: { Referer: 'https://www.tiktok.com/' } });
    if (!r.ok()) return false;
    const b = await r.body();
    if (b.length < 8000) return false;
    fs.writeFileSync(dest, b);
    return true;
  } catch { return false; }
}

let kept = 0, done = 0, below = 0, best = 0, shellRun = 0;
for (const url of todo) {
  done++;
  let d = null;
  try {
    await page.goto(url, { timeout: 75000, waitUntil: 'domcontentloaded' });
    for (let i = 0; i < 30; i++) {
      const n = await page.evaluate(() =>
        [...document.querySelectorAll('img')].filter((x) => /photomode/i.test(x.src) && x.naturalWidth >= 600).length
      ).catch(() => 0);
      if (n >= 2) break;
      await sleep(600);
    }
    d = await page.evaluate(() => {
      const g = (s) => { const e = document.querySelector(`[data-e2e="${s}"]`); return e ? e.innerText.trim() : null; };
      const t = (document.body.innerText || '').replace(/\s+/g, ' ');
      const slides = [...new Set([...document.querySelectorAll('img')]
        .filter((i) => /photomode/i.test(i.src) && i.naturalWidth >= 600).map((i) => i.src))];
      const tags = (t.match(/#[^\s#]+/g) || []).map((h) => h.slice(1));
      const counts = t.match(/\b(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\b/);
      const musicM = t.match(/more\s+(.{3,70}?)\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*/);
      const capM = t.match(/·\s*[\d-]+\s+(.{10,600}?)(?:\s+more\b|\s+#)/);
      return {
        likes: g('like-count') || g('browse-like-count'),
        comments: g('comment-count') || g('browse-comment-count'),
        shares: g('share-count'),
        countsRun: counts ? counts.slice(1, 5) : null,
        slides, hashtags: [...new Set(tags)],
        caption: capM ? capM[1] : t.slice(0, 300),
        musicRaw: musicM ? musicM[1].trim() : null,
        fullText: t.slice(0, 1400),
      };
    });
  } catch (e) {
    log(`  read failed ${url.slice(-19)}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 45)}`);
    if (/crash|closed/i.test(String(e))) { await newPage(); await warm(); }
  }
  // a 218-char body is the shell TikTok serves when it is refusing; the post
  // is fine, we are not. Do not burn the URL — put it back and wait longer.
  const shell = d && d.fullText && d.fullText.length < 600 && !d.slides?.length;
  if (shell) {
    shellRun++;
    const wait = Math.min(120000 * shellRun, 1800000);
    log(`  refused (${d.fullText.length}c body) — backing off ${Math.round(wait / 60000)}m (streak ${shellRun})`);
    await sleep(wait);
    await warm();
    continue;
  }
  shellRun = 0;
  read.add(url);
  if (done % 5 === 0) fs.writeFileSync(readPath, JSON.stringify([...read]));

  if (!d || !d.slides?.length) {
    if (!d) log(`  NO DATA ${url.slice(-19)}`);
    else log(`  NO SLIDES ${url.slice(-19)} — body ${d.fullText.length}c, `
      + `likes="${d.likes}", head="${d.fullText.slice(0, 60)}"`);
    await sleep(jitter(5000, 9000));
    continue;
  }
  const run = d.countsRun || [];
  const likes = num(d.likes) ?? num(run[0]) ?? 0;
  if (likes > best) best = likes;
  if (likes < FLOOR) {
    below++;
    if (below % 10 === 0) log(`  ... ${done}/${todo.length} read, best so far ${best.toLocaleString()} likes`);
    await sleep(jitter(5000, 9000));
    continue;
  }

  const id = url.split('/').pop();
  const dir = path.join(DECKS, id);
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const [i, u] of d.slides.entries()) {
    const dest = path.join(dir, String(i).padStart(2, '0') + '.jpg');
    if (await dl(u, dest)) files.push(dest);
  }
  if (files.length < 2) { fs.rmSync(dir, { recursive: true, force: true }); await sleep(4000); continue; }

  out.write(JSON.stringify({
    source: 'tiktok', kind: 'photo-carousel', organic: true,
    url, id, account: url.split('/@')[1]?.split('/')[0] || null,
    likes, comments: num(d.comments) ?? num(run[1]), saves: num(run[2]),
    shares: num(d.shares) ?? num(run[3]),
    slideCount: files.length, files,
    caption: d.caption, hashtags: d.hashtags,
    music: d.musicRaw, soundIsOriginal: /original sound/i.test(d.musicRaw || ''),
    fullText: d.fullText, harvestedAt: new Date().toISOString(),
  }) + '\n');
  kept++;
  log(`  KEEP ${likes.toLocaleString()} likes · ${files.length} slides · @${url.split('/@')[1]?.split('/')[0]}`);
  await sleep(jitter(5000, 9000));
}

fs.writeFileSync(readPath, JSON.stringify([...read]));
log(`\nDONE reader kept=${kept} read=${done} below=${below} best=${best.toLocaleString()}`);
out.end();
await ctx.close();
