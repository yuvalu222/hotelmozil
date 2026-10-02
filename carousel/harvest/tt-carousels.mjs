// TikTok PHOTO CAROUSEL harvester — the real target.
//
// Two things unlocked this, both of which an earlier pass gave up on too fast:
//
//  1. tiktok.com/search?q= works, but ONLY from a warmed session. A cold
//     headless hit returns "Something went wrong", which is what the first
//     recon saw before concluding search was dead. Visiting the homepage,
//     clearing the cookie banner and waiting makes it answer normally.
//     /search/video and /search/top still return nothing; only the plain form.
//  2. Roughly a fifth of search results are /photo/ posts — carousels — which
//     NO /discover/, /channel/ or /explore/ surface ever lists. 279 posts from
//     17 of those surfaces produced zero. Search produces them immediately.
//
// Every metric comes from the page's own __UNIVERSAL_DATA_FOR_REHYDRATION__
// blob rather than from DOM scraping, which also yields the things the study
// never had: saves, shares, the exact hashtags, and whether the sound is an
// original or a trending track.
//
// Floor: >=50,000 likes (diggCount). Destination must be one Israelis fly to.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const DECKS = path.join(ROOT, 'tt-decks');
fs.mkdirSync(DECKS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);

// Verified against Israel Airports Authority figures: Athens 1,178,745
// passengers, Dubai 1,119,786, Larnaca 1,012,937; top countries Greece,
// Cyprus, Italy, UAE. A road trip through Arizona is not in this list on
// purpose — it is a fine carousel and an irrelevant one.
const PLACES = [
  'greece', 'athens', 'crete', 'rhodes', 'corfu', 'santorini', 'mykonos', 'paros', 'naxos',
  'zakynthos', 'kefalonia', 'thessaloniki', 'halkidiki',
  'cyprus', 'larnaca', 'ayia napa', 'paphos', 'limassol',
  'dubai', 'abu dhabi',
  'italy', 'rome', 'milan', 'venice', 'florence', 'naples', 'sicily',
  'thailand', 'bangkok', 'phuket', 'koh samui', 'krabi', 'chiang mai',
  'georgia country', 'tbilisi', 'batumi',
  'vietnam', 'hanoi', 'japan', 'tokyo', 'sri lanka', 'bali',
  'prague', 'budapest', 'bucharest', 'barcelona', 'madrid', 'paris', 'london',
  'amsterdam', 'vienna', 'berlin', 'istanbul', 'baku', 'yerevan', 'zanzibar',
  'maldives', 'seychelles', 'new york',
];
const SHAPES = [
  'travel tips', 'things to do in', 'travel guide', 'mistakes to avoid in',
  'hidden gems', 'what to do in', 'places to visit', 'travel itinerary',
  'where to eat in', 'best beaches', 'first time in', 'things to know before',
];

function queries() {
  const out = [];
  for (const s of SHAPES) for (const p of PLACES) out.push(`${s} ${p}`);
  // carousel-native phrasings, which surface photo posts disproportionately
  for (const p of PLACES.slice(0, 24)) out.push(`${p} photo dump travel`);
  return out;
}

const LIKES_FLOOR = 50000;

const seenPath = path.join(ROOT, 'tt-seen.json');
const seen = new Set(fs.existsSync(seenPath) ? JSON.parse(fs.readFileSync(seenPath, 'utf8')) : []);
const qDonePath = path.join(ROOT, 'tt-queries-done.json');
const qDone = new Set(fs.existsSync(qDonePath) ? JSON.parse(fs.readFileSync(qDonePath, 'utf8')) : []);
const out = fs.createWriteStream(path.join(ROOT, 'tt-carousels.jsonl'), { flags: 'a' });
const logf = fs.createWriteStream(path.join(ROOT, 'tt-carousels.log'), { flags: 'a' });
const log = (s) => { console.log(s); logf.write(s + '\n'); };

const ctx = await chromium.launchPersistentContext('recon/p-ttcar', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1440, height: 1000 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));

const page = await ctx.newPage();

/** Cold hits to /search fail; the session has to be warmed first. */
async function warm() {
  await page.goto('https://www.tiktok.com/', { timeout: 60000, waitUntil: 'domcontentloaded' });
  await sleep(6000);
  for (const sel of ['button:has-text("Accept all")', 'button:has-text("Allow all")',
                     '[data-e2e="accept-all"]', 'button:has-text("Decline")']) {
    try {
      const b = page.locator(sel).first();
      if (await b.count()) { await b.click({ timeout: 2500 }); await sleep(1500); break; }
    } catch { /* no banner */ }
  }
  await sleep(2500);
}
await warm();

async function searchPhotos(q) {
  await page.goto(`https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
    { timeout: 60000, waitUntil: 'domcontentloaded' });
  await sleep(jitter(5000, 6500));
  for (let i = 0; i < 2; i++) { await page.mouse.wheel(0, 2000); await sleep(jitter(1400, 2000)); }
  return await page.evaluate(() => {
    const t = document.body.innerText || '';
    const links = [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.href)
      .filter((h) => /tiktok\.com\/@[^/]+\/photo\/\d+/.test(h)))].map((h) => h.split('?')[0]);
    return { links, blocked: /Something went wrong|unusual|captcha/i.test(t) };
  });
}

/** Everything comes from the page's own hydration blob, not from the DOM. */
async function readPost(url) {
  await page.goto(url, { timeout: 90000, waitUntil: 'commit' });
  // Poll rather than guess: proceed the moment itemStruct exists.
  for (let i = 0; i < 26; i++) {
    const ready = await page.evaluate(() => {
      const el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
      if (!el) return false;
      try { return !!JSON.parse(el.textContent)['__DEFAULT_SCOPE__']['webapp.video-detail']?.itemInfo?.itemStruct; }
      catch { return false; }
    }).catch(() => false);
    if (ready) break;
    await sleep(500);
  }
  return await page.evaluate(() => {
    const el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
    if (!el) return null;
    let it;
    try {
      it = JSON.parse(el.textContent)['__DEFAULT_SCOPE__']['webapp.video-detail']?.itemInfo?.itemStruct;
    } catch { return null; }
    if (!it) return null;
    const st = it.statsV2 || it.stats || {};
    const n = (v) => (v == null ? null : Number(v));
    const imgs = (it.imagePost?.images || [])
      .map((im) => im?.imageURL?.urlList?.[0]).filter(Boolean);
    return {
      id: it.id,
      desc: it.desc || '',
      createTime: Number(it.createTime) || null,
      isPhoto: !!it.imagePost,
      slideUrls: imgs,
      author: it.author?.uniqueId || null,
      authorName: it.author?.nickname || null,
      followers: n(it.authorStats?.followerCount ?? it.authorStatsV2?.followerCount),
      likes: n(st.diggCount), views: n(st.playCount), shares: n(st.shareCount),
      comments: n(st.commentCount), saves: n(st.collectCount),
      hashtags: (it.textExtra || []).map((x) => x.hashtagName).filter(Boolean),
      music: it.music ? {
        title: it.music.title || null,
        author: it.music.authorName || null,
        // false => a track lifted from TikTok's library (a "trending sound");
        // true => the creator's own audio recorded with the post
        isOriginal: !!it.music.original,
        duration: it.music.duration ?? null,
      } : null,
    };
  });
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

let kept = 0, looked = 0, below = 0;
const seenLikes = [];
const qs = queries();
log(`\n=== run ${new Date().toISOString()} — ${qs.length} queries, floor ${LIKES_FLOOR.toLocaleString()} likes ===`);

for (const q of qs) {
  if (qDone.has(q)) continue;
  let res;
  try { res = await searchPhotos(q); }
  catch (e) { log(`search FAIL "${q}": ${String(e).split('\n')[0].slice(0, 60)}`); await sleep(20000); continue; }

  if (res.blocked) { log(`throttled on "${q}" — warming again`); await sleep(45000); await warm(); continue; }
  qDone.add(q);
  fs.writeFileSync(qDonePath, JSON.stringify([...qDone]));

  const fresh = res.links.filter((u) => !seen.has(u));
  if (fresh.length) log(`"${q}": ${res.links.length} photo posts, ${fresh.length} new`);

  for (const url of fresh) {
    seen.add(url);
    let d = null;
    try { d = await readPost(url); } catch { /* skip */ }
    if (!d || !d.isPhoto) continue;
    looked++;
    seenLikes.push(d.likes || 0);
    if ((d.likes || 0) < LIKES_FLOOR) {
      below++;
      if (below % 10 === 0) {
        const s2 = [...seenLikes].sort((a, b) => b - a);
        log(`  ... ${looked} carousels examined, best so far ${s2[0].toLocaleString()} likes, `
          + `median ${s2[Math.floor(s2.length / 2)].toLocaleString()}`);
      }
      continue;
    }

    const dir = path.join(DECKS, d.id);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (const [i, u] of d.slideUrls.entries()) {
      const dest = path.join(dir, String(i).padStart(2, '0') + '.jpg');
      if (await dl(u, dest)) files.push(dest);
    }
    if (!files.length) { fs.rmSync(dir, { recursive: true, force: true }); continue; }

    out.write(JSON.stringify({
      source: 'tiktok', kind: 'photo-carousel', organic: true,
      url, query: q, ...d, slideUrls: undefined, files, slideCount: files.length,
      sharesPerLike: d.likes ? +( (d.shares || 0) / d.likes).toFixed(4) : null,
      savesPerLike: d.likes ? +((d.saves || 0) / d.likes).toFixed(4) : null,
      harvestedAt: new Date().toISOString(),
    }) + '\n');
    kept++;
    log(`  KEEP ${d.likes.toLocaleString()} likes · ${(d.views || 0).toLocaleString()} views · `
      + `${files.length} slides · @${d.author} · ${d.desc.slice(0, 60)}`);
    fs.writeFileSync(seenPath, JSON.stringify([...seen]));
    await sleep(jitter(900, 1600));
  }
  fs.writeFileSync(seenPath, JSON.stringify([...seen]));
  await sleep(jitter(2000, 3500));
}

log(`\nDONE kept=${kept} examined=${looked} below_floor=${below}`);
out.end();
await page.close();
await ctx.close();
