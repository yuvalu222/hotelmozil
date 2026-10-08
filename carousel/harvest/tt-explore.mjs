// Find more carousels over the floor WITHOUT using search.
//
// Search is refused for this IP right now — probed directly: the results pane
// renders "Something went wrong" while the page chrome loads fine. Post pages
// and profile pages are a different surface and answer normally, so this walks
// those instead:
//
//   1. a profile page lists that creator's posts, with a view count on each
//      thumbnail -> pre-filter on views before opening anything;
//   2. a post page renders a "you may like" rail of related posts, which is
//      the algorithm's own idea of the same niche -> follow those;
//   3. any deck that clears the like floor puts ITS account into the profile
//      queue, so the crawl snowballs through creators who actually perform.
//
// Seeded with the two accounts already proven over the floor. Never warms:
// a homepage visit is what makes post pages answer with a 218-char shell.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const DECKS = path.join(ROOT, 'tt-decks');
fs.mkdirSync(DECKS, { recursive: true });

const FLOOR = Number(process.env.TT_FLOOR ?? 50000);
// likes run roughly 5-12% of views in this niche, so this is a deliberately
// generous gate: it throws away only what cannot possibly reach the floor.
const VIEW_GATE = Number(process.env.TT_VIEW_GATE ?? 300000);
// A post's own slides are 1080px wide at the very least (measured across both
// kept decks: 1080-2160). Related-post thumbnails that are themselves photo
// posts also carry `photomode` in their URL, and on some profiles the rail
// renders them at 600-1000px — a 600 threshold quietly folds other people's
// posts into the deck. 1000 separates them.
const MIN_SLIDE_PX = 1000;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);

const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').trim().match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

const statePath = path.join(ROOT, 'ttx-state.json');
const state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, 'utf8'))
  : { accountsDone: [], postsDone: [], queue: [] };
const accountsDone = new Set(state.accountsDone);
const postsDone = new Set(state.postsDone);

// decks already kept must not be re-downloaded
for (const f of ['tt-final.jsonl']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try { postsDone.add(JSON.parse(t).url); } catch { /* skip */ }
  }
}

// PROBED, not assumed: a profile page renders its header (follower counts are
// there) but the post grid never loads — 400-char body, 0 post links. Same wall
// as search. So accounts are not a usable surface and the walk runs entirely on
// post pages and the related rail each one renders.
// The snowball ran dry: TikTok stopped serving a related rail to the seed
// posts, so the post queue emptied and nothing ever entered the account
// queue — the crawl kept exiting cleanly having found zero. But 710 creators
// are already in the corpus, each walked once weeks ago and posting since.
// harvest/known-accounts.txt (written by the corpus pass) seeds them directly,
// which needs no related rail and no search.
const accountQ = [];
try {
  const seedFile = path.join(ROOT, 'known-accounts.txt');
  if (fs.existsSync(seedFile)) {
    for (const h of fs.readFileSync(seedFile, 'utf8').split(/\r?\n/).map((x) => x.trim()).filter(Boolean)) {
      if (!accountsDone.has(h) && !accountQ.includes(h)) accountQ.push(h);
    }
  }
} catch { /* seeding is a bonus, never a reason to fail the run */ }

// Seeds: the posts already known to clear the floor. They are re-opened once
// purely to read their related rail, which is the algorithm's own shortlist of
// the same niche.
const SEED_POSTS = [
  'https://www.tiktok.com/@izzy_travels_/photo/7679870394685230358',
  'https://www.tiktok.com/@emsriley/photo/7622782757621615875',
];
const postQ = [...new Set(state.queue || [])].filter((u) => !postsDone.has(u));
// plus whatever earlier passes collected and never read
for (const f of ['ttf-seen.json', 'tt-seen.json']) {
  const q = path.join(ROOT, f);
  if (!fs.existsSync(q)) continue;
  try {
    for (const u of JSON.parse(fs.readFileSync(q, 'utf8'))) {
      const c = String(u).split('?')[0];
      if (/\/photo\/\d+/.test(c) && !postsDone.has(c) && !postQ.includes(c)) postQ.push(c);
    }
  } catch { /* skip */ }
}

const out = fs.createWriteStream(path.join(ROOT, 'tt-final.jsonl'), { flags: 'a' });
const lg = fs.createWriteStream(path.join(ROOT, 'tt-explore.log'), { flags: 'a' });
const log = (s) => { console.log(s); lg.write(s + '\n'); };
log(`\n=== explore ${new Date().toISOString()} — ${accountQ.length} accounts, ${postQ.length} posts queued, floor ${FLOOR.toLocaleString()} ===`);

const LAUNCH = {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1280, height: 1400 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
};
const PROFILE = process.env.TT_PROFILE || 'recon/p-card';
let ctx = await chromium.launchPersistentContext(PROFILE, LAUNCH);

async function rebuild() {
  try { await ctx.close(); } catch { /* gone */ }
  await sleep(4000);
  ctx = await chromium.launchPersistentContext(PROFILE, LAUNCH);
  log('  (browser rebuilt)');
}

function save() {
  fs.writeFileSync(statePath, JSON.stringify({
    accountsDone: [...accountsDone], postsDone: [...postsDone], queue: postQ.slice(0, 4000),
  }));
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

/** A creator's own posts, with the view count printed on each thumbnail. */
async function readAccount(handle) {
  let page = null;
  try {
    page = await ctx.newPage();
    await page.goto(`https://www.tiktok.com/@${handle}`, { timeout: 70000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2)).catch(() => {});
      await sleep(2200);
    }
    return await page.evaluate(() => {
      const items = [];
      for (const a of document.querySelectorAll('a[href*="/photo/"]')) {
        // the view count sits in the thumbnail's own container, not the anchor
        const box = a.closest('div')?.parentElement || a.parentElement;
        const txt = (box?.innerText || '').replace(/\s+/g, ' ').trim();
        const m = txt.match(/([\d.]+[KMB]?)\s*$/) || txt.match(/^([\d.]+[KMB]?)\b/);
        items.push({ href: a.href.split('?')[0], views: m ? m[1] : null });
      }
      const seen = new Set();
      return items.filter((i) => !seen.has(i.href) && seen.add(i.href));
    });
  } catch (e) {
    log(`  account failed @${handle}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 50)}`);
    if (/crash|closed|Target/i.test(String(e))) await rebuild();
    return [];
  } finally {
    try { if (page && !page.isClosed()) await page.close(); } catch { /* gone */ }
  }
}

/** One post, read cold, exactly the way tt-drain does it. */
async function readPost(url) {
  let page = null;
  try {
    page = await ctx.newPage();
    await page.goto(url, { timeout: 70000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(9000);
    for (let i = 0; i < 18; i++) {
      const n = await page.evaluate((min) =>
        [...document.querySelectorAll('img')].filter((x) => /photomode/i.test(x.src) && x.naturalWidth >= min).length
      , MIN_SLIDE_PX).catch(() => 0);
      if (n >= 2) break;
      await sleep(900);
    }
    return await page.evaluate((min) => {
      const g = (s) => { const e = document.querySelector(`[data-e2e="${s}"]`); return e ? e.innerText.trim() : null; };
      const t = (document.body.innerText || '').replace(/\s+/g, ' ');
      const slides = [...new Set([...document.querySelectorAll('img')]
        .filter((i) => /photomode/i.test(i.src) && i.naturalWidth >= min).map((i) => i.src))];
      const tags = (t.match(/#[^\s#]+/g) || []).map((h) => h.slice(1));
      const counts = t.match(/\b(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\b/);
      const musicM = t.match(/\bmore\s+(.{3,70}?)\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*/);
      // The post's OWN sound is [data-e2e="video-music"]; its link slug carries
      // the track name. The body-text regex above picks up a RELATED post's
      // sound often enough that it cannot be trusted alone — it put the wrong
      // track on one of the two kept decks.
      const mEl = document.querySelector('[data-e2e="video-music"]');
      const mHref = mEl ? (mEl.querySelector('a')?.href || mEl.closest('a')?.href || null) : null;
      const mSlug = mHref ? decodeURIComponent((mHref.split('/music/')[1] || ''))
        .replace(/-[0-9]{6,}$/, '').split('-').join(' ').trim() : null;
      const capM = t.match(/·\s*[\d-]+\s+(.{10,900}?)(?:\s+more\b|\s+#)/);
      const related = [...new Set([...document.querySelectorAll('a[href*="/photo/"]')]
        .map((a) => a.href.split('?')[0]))];
      return {
        likes: g('like-count') || g('browse-like-count'),
        comments: g('comment-count') || g('browse-comment-count'),
        shares: g('share-count'),
        countsRun: counts ? counts.slice(1, 5) : null,
        slides, hashtags: [...new Set(tags)], related,
        caption: capM ? capM[1] : null,
        musicRaw: mSlug || (musicM ? musicM[1].trim() : null),
        musicUrl: mHref, musicFromElement: Boolean(mSlug),
        fullText: t.slice(0, 3000),
      };
    }, MIN_SLIDE_PX);
  } catch (e) {
    log(`  post failed ${url.slice(-19)}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 50)}`);
    if (/crash|closed|Target/i.test(String(e))) await rebuild();
    return null;
  } finally {
    try { if (page && !page.isClosed()) await page.close(); } catch { /* gone */ }
  }
}

let kept = 0, opened = 0, skipped = 0, best = 0, refusedRun = 0;

async function handlePost(url) {
  if (postsDone.has(url)) return;
  const d = await readPost(url);
  const refused = d && (d.fullText || '').length < 600 && !d.slides?.length;
  if (refused || !d) {
    refusedRun++;
    const wait = Math.min(60000 * refusedRun, 420000);
    log(`  refused — waiting ${Math.round(wait / 60000)}m (streak ${refusedRun})`);
    await sleep(wait);
    if (refusedRun % 3 === 0) await rebuild();
    return;
  }
  refusedRun = 0;
  opened++;
  postsDone.add(url);

  // every related carousel the page offers is a lead worth queueing
  for (const r of d.related || []) {
    if (!postsDone.has(r) && !postQ.includes(r)) postQ.push(r);
  }

  if (!d.slides?.length) { await sleep(jitter(5000, 9000)); return; }
  const run = d.countsRun || [];
  const likes = num(d.likes) ?? num(run[0]) ?? 0;
  if (likes > best) best = likes;
  if (likes < FLOOR) { await sleep(jitter(5000, 9000)); return; }

  const id = url.split('/').pop();
  const account = url.split('/@')[1]?.split('/')[0] || null;
  const dir = path.join(DECKS, id);
  fs.mkdirSync(dir, { recursive: true });
  const files = [];
  for (const [i, u] of d.slides.entries()) {
    const dest = path.join(dir, String(i).padStart(2, '0') + '.jpg');
    if (await dl(u, dest)) files.push(dest);
  }
  if (files.length < 2) { fs.rmSync(dir, { recursive: true, force: true }); return; }

  out.write(JSON.stringify({
    source: 'tiktok', kind: 'photo-carousel', organic: true,
    url, id, account, likes,
    comments: num(d.comments) ?? num(run[1]), saves: num(run[2]),
    shares: num(d.shares) ?? num(run[3]),
    slideCount: files.length, files,
    caption: d.caption, hashtags: d.hashtags,
    music: d.musicRaw, musicUrl: d.musicUrl, musicFromElement: d.musicFromElement,
    soundIsOriginal: /original sound|suono originale|sonido original/i.test(d.musicRaw || ''),
    fullText: d.fullText, harvestedAt: new Date().toISOString(),
  }) + '\n');
  kept++;
  log(`  KEEP ${likes.toLocaleString()} likes · ${files.length} slides · @${account}`);
  // a creator who clears the floor once usually clears it again
  if (account && !accountsDone.has(account) && !accountQ.includes(account)) accountQ.push(account);
  await sleep(jitter(5000, 9000));
}

// ---- seed: harvest the related rail of the posts already known to work -----
for (const u of SEED_POSTS) {
  const d = await readPost(u);
  const rel = (d && d.related) || [];
  let added = 0;
  for (const r of rel) {
    if (!postsDone.has(r) && !postQ.includes(r) && r !== u) { postQ.push(r); added++; }
  }
  log(`seed ${u.slice(-19)}: ${rel.length} related, ${added} new -> queue ${postQ.length}`);
  await sleep(jitter(6000, 11000));
}
save();

// ---- walk ------------------------------------------------------------------
while (accountQ.length || postQ.length) {
  if (accountQ.length) {
    const handle = accountQ.shift();
    if (accountsDone.has(handle)) continue;
    const items = await readAccount(handle);
    accountsDone.add(handle);
    const big = items.filter((i) => (num(i.views) || 0) >= VIEW_GATE || !i.views);
    log(`@${handle}: ${items.length} carousels on the profile, ${big.length} past the view gate`);
    for (const i of big) if (!postsDone.has(i.href) && !postQ.includes(i.href)) postQ.push(i.href);
    skipped += items.length - big.length;
    save();
    await sleep(jitter(6000, 11000));
    continue;
  }
  const url = postQ.shift();
  await handlePost(url);
  if (opened % 5 === 0) {
    save();
    log(`  ... opened ${opened}, kept ${kept}, queue ${postQ.length}, best ${best.toLocaleString()}`);
  }
  if (opened > 0 && opened % 25 === 0) await rebuild();
}

save();
log(`\nDONE explore kept=${kept} opened=${opened} skippedOnViews=${skipped} best=${best.toLocaleString()}`);
out.end();
try { await ctx.close(); } catch { /* done */ }
