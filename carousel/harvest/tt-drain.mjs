// Drain the queue of TikTok carousel URLs — built on the one approach that is
// proven to work on this machine, right now.
//
// WHY THIS EXISTS, and what the previous reader got wrong:
//
// The previous reader loaded tiktok.com first ("warming") and then navigated to
// each post, reusing one page. It received a 218-character shell every time, and
// that was read as "the IP is rate-limited". It is not. `recon/tt-dom.mjs` —
// same profile, same UA, same machine, same minute — goes **straight to the
// post** on a **fresh page** and gets the complete record: 13 slides, likes,
// comments, shares, hashtags, music title.
//
// So the homepage visit is what gets the session refused on post pages, not the
// request rate. Warming is what search needs; it is the opposite of what a post
// page needs. This reader therefore never touches the homepage.
//
// Floor is applied after reading, since the like count comes off the post page.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const DECKS = path.join(ROOT, 'tt-decks');
fs.mkdirSync(DECKS, { recursive: true });

const FLOOR = Number(process.env.TT_FLOOR ?? 50000);
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

// ---- queue -----------------------------------------------------------------
// The two decks already known to clear the floor go first, so that even a short
// run produces something usable.
const KNOWN_GOOD = [
  'https://www.tiktok.com/@izzy_travels_/photo/7679870394685230358',
  'https://www.tiktok.com/@emsriley/photo/7622782757621615875',
];

const urls = new Set(KNOWN_GOOD);
for (const f of ['ttf-seen.json', 'tt-seen.json']) {
  const p = path.join(ROOT, f);
  if (!fs.existsSync(p)) continue;
  try {
    for (const u of JSON.parse(fs.readFileSync(p, 'utf8'))) {
      if (/\/photo\/\d+/.test(u)) urls.add(u.split('?')[0]);
    }
  } catch { /* unreadable list, skip it */ }
}

const donePath = path.join(ROOT, 'ttd-done.json');
const done = new Set(fs.existsSync(donePath) ? JSON.parse(fs.readFileSync(donePath, 'utf8')) : []);
// The photo-tab collector records the like count printed on each search card,
// so the queue can be worked biggest-first instead of in collection order.
// A 352,100-like deck is worth reading before a 51,000-like one.
const sizesPath = path.join(ROOT, 'ttp-sizes.json');
const sizes = fs.existsSync(sizesPath) ? JSON.parse(fs.readFileSync(sizesPath, 'utf8')) : {};
const todo = [...urls]
  .filter((u) => !done.has(u))
  .sort((a, b) => (sizes[b] || 0) - (sizes[a] || 0));

const out = fs.createWriteStream(path.join(ROOT, 'tt-final.jsonl'), { flags: 'a' });
const lg = fs.createWriteStream(path.join(ROOT, 'tt-drain.log'), { flags: 'a' });
const log = (s) => { console.log(s); lg.write(s + '\n'); };
log(`\n=== drain ${new Date().toISOString()} — ${todo.length} queued, floor ${FLOOR.toLocaleString()} ===`);

// ---- browser ---------------------------------------------------------------
const LAUNCH = {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1280, height: 1400 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
};
const PROFILE = process.env.TT_PROFILE || 'recon/p-card';
let ctx = await chromium.launchPersistentContext(PROFILE, LAUNCH);

async function rebuild() {
  try { await ctx.close(); } catch { /* already gone */ }
  await sleep(4000);
  ctx = await chromium.launchPersistentContext(PROFILE, LAUNCH);
  log('  (browser rebuilt)');
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

// Read one post on its own page, exactly the way tt-dom.mjs does it.
async function readPost(url) {
  let page = null;
  try {
    page = await ctx.newPage();
    await page.goto(url, { timeout: 70000, waitUntil: 'domcontentloaded' });
    // the slides are lazy; tt-dom waits 13s flat, so start there and then poll
    await page.waitForTimeout(9000);
    for (let i = 0; i < 20; i++) {
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
      // the rendered footer prints likes, comments, saves, shares as one run
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
      return {
        likes: g('like-count') || g('browse-like-count'),
        comments: g('comment-count') || g('browse-comment-count'),
        shares: g('share-count'),
        countsRun: counts ? counts.slice(1, 5) : null,
        slides, hashtags: [...new Set(tags)],
        caption: capM ? capM[1] : null,
        musicRaw: mSlug || (musicM ? musicM[1].trim() : null),
        musicUrl: mHref, musicFromElement: Boolean(mSlug),
        fullText: t.slice(0, 3000),
      };
    }, MIN_SLIDE_PX);
  } catch (e) {
    log(`  read failed ${url.slice(-19)}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 50)}`);
    if (/crash|closed|Target/i.test(String(e))) await rebuild();
    return null;
  } finally {
    try { if (page && !page.isClosed()) await page.close(); } catch { /* gone */ }
  }
}

// ---- loop ------------------------------------------------------------------
// Where Israelis actually fly. A deck that clears the floor but is about
// nothing we sell is not worth the download: the biggest post the collector
// found anywhere was 1,900,000 likes and 163,600 saves, tagged #viral #roblox
// #baddie, captioned "Very tuff". Reading one costs 9-30 slide downloads, and
// the format words that find the big travel decks ("save this", "carousel")
// also drag in generic viral content, so the check belongs before the fetch.
const PLACE_WORDS = [
  'greece', 'greek', 'athens', 'crete', 'rhodes', 'corfu', 'santorini', 'mykonos',
  'paros', 'naxos', 'zakynthos', 'kefalonia', 'milos', 'thessaloniki', 'halkidiki',
  'cyprus', 'larnaca', 'ayia napa', 'paphos', 'limassol',
  'dubai', 'abu dhabi', 'uae', 'emirates',
  'italy', 'italia', 'rome', 'roma', 'venice', 'florence', 'amalfi', 'sicily',
  'milan', 'naples', 'positano', 'tuscany',
  'thailand', 'thai', 'bangkok', 'phuket', 'samui', 'krabi', 'chiang mai',
  'tbilisi', 'batumi', 'georgia', 'vietnam', 'hanoi', 'japan', 'tokyo', 'kyoto',
  'prague', 'budapest', 'barcelona', 'madrid', 'paris', 'london', 'amsterdam',
  'vienna', 'istanbul', 'lisbon', 'porto', 'europe', 'european', 'travel',
];
const onTopic = (d) => {
  const t = `${d.caption || ''} ${(d.hashtags || []).join(' ')} ${(d.fullText || '').slice(0, 600)}`.toLowerCase();
  return PLACE_WORDS.some((w) => t.includes(w));
};

let kept = 0, read = 0, below = 0, best = 0, refusedRun = 0, noSlides = 0, offTopic = 0;
const retries = new Map();

for (const url of todo) {
  if (read > 0 && read % 20 === 0) await rebuild();

  const d = await readPost(url);

  // A sub-600-char body with no slides is TikTok refusing us, not an empty
  // post. Keep the URL, slow down, try it again later in the run.
  const refused = d && (d.fullText || '').length < 600 && !d.slides?.length;
  if (refused || !d) {
    const n = (retries.get(url) || 0) + 1;
    retries.set(url, n);
    refusedRun++;
    if (n <= 3) {
      const wait = Math.min(60000 * refusedRun, 600000);
      log(`  refused (${d ? (d.fullText || '').length : 0}c) — waiting ${Math.round(wait / 60000)}m, try ${n}/3 (streak ${refusedRun})`);
      await sleep(wait);
      if (refusedRun % 3 === 0) await rebuild();
      todo.push(url); // back of the queue
    } else {
      log(`  giving up on ${url.slice(-19)} after 3 tries`);
      done.add(url);
    }
    continue;
  }
  refusedRun = 0;
  read++;
  done.add(url);
  fs.writeFileSync(donePath, JSON.stringify([...done]));

  if (!d.slides?.length) {
    noSlides++;
    log(`  no slides ${url.slice(-19)} — body ${(d.fullText || '').length}c, likes="${d.likes}"`);
    await sleep(jitter(6000, 11000));
    continue;
  }

  const run = d.countsRun || [];
  const likes = num(d.likes) ?? num(run[0]) ?? 0;
  if (likes > best) best = likes;
  if (likes < FLOOR) {
    below++;
    if (below % 5 === 0) log(`  ... ${read}/${todo.length} read, ${kept} kept, best ${best.toLocaleString()}`);
    await sleep(jitter(6000, 11000));
    continue;
  }

  if (!onTopic(d)) {
    offTopic++;
    log(`  off topic, not downloaded: ${likes.toLocaleString()} likes · @${url.split('/@')[1]?.split('/')[0]}`);
    await sleep(jitter(4000, 7000));
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
  if (files.length < 2) {
    fs.rmSync(dir, { recursive: true, force: true });
    log(`  slides would not download for ${url.slice(-19)}`);
    await sleep(5000);
    continue;
  }

  out.write(JSON.stringify({
    source: 'tiktok', kind: 'photo-carousel', organic: true,
    url, id, account: url.split('/@')[1]?.split('/')[0] || null,
    likes, comments: num(d.comments) ?? num(run[1]), saves: num(run[2]),
    shares: num(d.shares) ?? num(run[3]),
    slideCount: files.length, files,
    caption: d.caption, hashtags: d.hashtags,
    music: d.musicRaw, musicUrl: d.musicUrl, musicFromElement: d.musicFromElement,
    soundIsOriginal: /original sound|suono originale|sonido original/i.test(d.musicRaw || ''),
    fullText: d.fullText, harvestedAt: new Date().toISOString(),
  }) + '\n');
  kept++;
  // Saves per like is what decides whether a deck is worth cloning (a beauty
  // post gets ~0.12, a guide people keep gets ~0.85), so the log line leads
  // with it. A star marks the ones actually worth opening, which is what makes
  // the stream readable once it is dozens of decks long.
  const savesN = num(run[2]) ?? 0;
  const spl = likes ? savesN / likes : 0;
  const star = spl >= 0.35 ? 'KEEP*' : 'keep ';
  log(`  ${star} ${savesN.toLocaleString()} saves (${spl.toFixed(2)}/like) · `
    + `${likes.toLocaleString()} likes · ${files.length} slides · @${url.split('/@')[1]?.split('/')[0]}`);
  await sleep(jitter(6000, 11000));
}

fs.writeFileSync(donePath, JSON.stringify([...done]));
log(`\nDONE drain kept=${kept} read=${read} below=${below} offTopic=${offTopic} noSlides=${noSlides} best=${best.toLocaleString()}`);
out.end();
try { await ctx.close(); } catch { /* done */ }
