// TikTok carousel harvester — final. Everything comes from the DOM.
//
// Three wrong turns got us here, all worth recording:
//
//  1. "TikTok search is dead." It is not. A COLD request returns "Something
//     went wrong"; the same request from a session that has loaded the
//     homepage and cleared the cookie banner answers normally. One cold test
//     early on cost the whole platform.
//  2. "Photo posts are walled." Their __UNIVERSAL_DATA_FOR_REHYDRATION__ blob
//     genuinely has no webapp.video-detail scope — 6 of 6 tested — so a
//     JSON-only reader sees nothing. But the PAGE renders the carousel: the
//     slides are in the DOM at 1320x1650, and the likes, comments, saves,
//     shares, caption, hashtags and music title are all visible text. Reading
//     the DOM instead of the blob turns a dead end into a complete record.
//  3. Visiting every result to check its size. Search cards already print the
//     like count, so the >=50,000 floor is applied BEFORE opening anything.
//
// Floor: 50,000 likes. Destinations: where Israelis actually fly (Athens
// 1,178,745 passengers, Dubai 1,119,786, Larnaca 1,012,937).

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

const PLACES = [
  'greece', 'athens', 'crete', 'rhodes', 'corfu', 'santorini', 'mykonos', 'naxos', 'paros',
  'zakynthos', 'kefalonia', 'milos', 'thessaloniki', 'halkidiki',
  'cyprus', 'larnaca', 'ayia napa', 'paphos', 'limassol',
  'dubai', 'abu dhabi',
  'italy', 'rome', 'venice', 'florence', 'amalfi', 'sicily', 'milan', 'naples',
  'thailand', 'bangkok', 'phuket', 'krabi', 'koh samui', 'chiang mai',
  'tbilisi', 'batumi', 'vietnam', 'hanoi', 'japan', 'tokyo', 'kyoto',
  'prague', 'budapest', 'barcelona', 'madrid', 'paris', 'london', 'amsterdam',
  'vienna', 'istanbul', 'lisbon', 'bali', 'sri lanka', 'maldives', 'zanzibar',
];
const SHAPES = [
  'travel tips', 'things to do in', 'travel guide', 'hidden gems in',
  'mistakes to avoid in', 'what to do in', 'best beaches in', 'places to visit in',
  'things to know before visiting', 'where to eat in', 'itinerary',
];

const PRIORITY = [
  'greece','athens','crete','rhodes','santorini','mykonos','corfu','naxos','paros',
  'cyprus','larnaca','ayia napa','paphos',
  'dubai','thailand','bangkok','phuket','italy','rome',
];
function queries() {
  const qs = [];
  // highest-value destination x shape first
  for (const p of PRIORITY) for (const s of SHAPES) qs.push(`${s} ${p}`);
  for (const s of SHAPES) for (const p of PLACES) {
    if (!PRIORITY.includes(p)) qs.push(`${s} ${p}`);
  }
  return [...new Set(qs)];
}

const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').trim().match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

const seenPath = path.join(ROOT, 'ttf-seen.json');
const seen = new Set(fs.existsSync(seenPath) ? JSON.parse(fs.readFileSync(seenPath, 'utf8')) : []);
const COLLECT_ONLY = process.env.TT_COLLECT_ONLY === '1';
const qDonePath = path.join(ROOT, 'ttf-q.json');
const qDone = new Set(fs.existsSync(qDonePath) ? JSON.parse(fs.readFileSync(qDonePath, 'utf8')) : []);
const out = fs.createWriteStream(path.join(ROOT, 'tt-final.jsonl'), { flags: 'a' });
const lg = fs.createWriteStream(path.join(ROOT, 'tt-final.log'), { flags: 'a' });
const log = (s) => { console.log(s); lg.write(s + '\n'); };

const ctx = await chromium.launchPersistentContext('recon/p-final', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1300, height: 1200 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
let page = await ctx.newPage();

// Nothing in here is allowed to throw. A dead renderer, a DNS blip or a
// cookie banner that never appears must all end as "warm returned false", not
// as an uncaught exception that kills a multi-hour run.
async function newPage() {
  try { if (page && !page.isClosed()) await page.close(); } catch { /* already gone */ }
  page = await ctx.newPage();
}
async function warm() {
  try {
    if (!page || page.isClosed()) await newPage();
    await page.goto('https://www.tiktok.com/', { timeout: 60000, waitUntil: 'domcontentloaded' });
  await sleep(7000);
  for (const sel of ['button:has-text("Accept all")', 'button:has-text("Allow all")', '[data-e2e="accept-all"]']) {
    try {
      const b = page.locator(sel).first();
      if (await b.count()) { await b.click({ timeout: 3000 }); await sleep(2000); break; }
    } catch { /* no banner */ }
  }
    await sleep(2500);
    return true;
  } catch (e) {
    log(`  warm failed: ${String(e).split(String.fromCharCode(10))[0].slice(0, 60)}`);
    try { await newPage(); } catch { /* next cycle */ }
    return false;
  }
}
await warm();
log(`\n=== run ${new Date().toISOString()} — floor ${FLOOR.toLocaleString()} likes ===`);

/** Search cards print the like count, so size is known before any post opens. */
async function search(q) {
  await page.goto(`https://www.tiktok.com/search?q=${encodeURIComponent(q)}`,
    { timeout: 60000, waitUntil: 'domcontentloaded' });
  await sleep(jitter(9000, 11000));
  for (let i = 0; i < 3; i++) { await page.mouse.wheel(0, 2000); await sleep(jitter(2000, 3000)); }
  return await page.evaluate(() => {
    const seenHref = new Set();
    const out = [];
    for (const a of document.querySelectorAll('a[href*="/photo/"]')) {
      const href = a.href.split('?')[0];
      if (seenHref.has(href)) continue;
      seenHref.add(href);
      let box = a;
      for (let i = 0; i < 4 && box.parentElement; i++) box = box.parentElement;
      const txt = (box.innerText || '').replace(/\s+/g, ' ').trim();
      // the card opens with its like count, e.g. "11.8K Let me know if..."
      const m = txt.match(/^(?:Top liked\s+)?([\d.]+[KMB]?)\b/i);
      out.push({ href, likesText: m ? m[1] : null, cardText: txt.slice(0, 120) });
    }
    return { items: out, blocked: /Something went wrong/i.test(document.body.innerText || '') };
  });
}

/** The carousel itself, read from the rendered page. */
async function readDeck(url) {
  await page.goto(url, { timeout: 75000, waitUntil: 'domcontentloaded' });
  for (let i = 0; i < 30; i++) {
    const n = await page.evaluate(() =>
      [...document.querySelectorAll('img')]
        .filter((x) => /photomode/i.test(x.src) && x.naturalWidth >= 600).length
    ).catch(() => 0);
    if (n >= 2) break;
    await sleep(600);
  }
  return await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(`[data-e2e="${s}"]`); return e ? e.innerText.trim() : null; };
    const t = (document.body.innerText || '').replace(/\s+/g, ' ');
    // "photomode" in the CDN path is what separates the post's own slides from
    // the related-posts grid, which uses identically sized thumbnails.
    const slides = [...new Set([...document.querySelectorAll('img')]
      .filter((i) => /photomode/i.test(i.src) && i.naturalWidth >= 600)
      .map((i) => i.src))];
    const relatedCount = [...document.querySelectorAll('img')]
      .filter((i) => /tiktokcdn|byteimg/.test(i.src) && !/photomode/i.test(i.src)).length;
    // the caption sits between the handle line and the "more" affordance
    const capM = t.match(/·\s*[\d-]+\s+(.{10,600}?)(?:\s+more\b|\s+#|$)/);
    const tags = (t.match(/#[^\s#]+/g) || []).map((h) => h.slice(1));
    // music line appears right after the hashtag block, before the counts
    const musicM = t.match(/(?:more\s+)?([^#]{4,80}?)\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*\s+\d[\d.,KMB]*\s/);
    const counts = t.match(/\b(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\s+(\d[\d.,KMB]*)\b/);
    return {
      likes: g('like-count') || g('browse-like-count'),
      comments: g('comment-count') || g('browse-comment-count'),
      shares: g('share-count'),
      countsRun: counts ? counts.slice(1, 5) : null,
      slides,
      caption: capM ? capM[1] : t.slice(0, 400),
      hashtags: [...new Set(tags)],
      musicRaw: musicM ? musicM[1].trim() : null,
      relatedCount,
      fullText: t.slice(0, 1400),
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

let kept = 0, scanned = 0, over = 0, best = 0, blockedRun = 0;
for (const q of queries()) {
  if (qDone.has(q)) continue;
  let res;
  try { res = await search(q); }
  catch (e) {
    log(`search FAIL "${q}": ${String(e).split('\n')[0].slice(0, 60)}`);
    await sleep(25000);
    await warm();
    continue;
  }
  if (res.blocked) {
    blockedRun++;
    // back off harder the longer it keeps refusing, rather than hammering
    const wait = Math.min(90000 * blockedRun, 600000);
    log(`blocked on "${q}" — cooling ${Math.round(wait / 1000)}s (streak ${blockedRun})`);
    await sleep(wait);
    await warm();
    continue;
  }
  blockedRun = 0;
  qDone.add(q);
  fs.writeFileSync(qDonePath, JSON.stringify([...qDone]));

  const fresh = res.items.filter((i) => !seen.has(i.href));
  for (const it of fresh) scanned++;
  const big = fresh.filter((i) => (num(i.likesText) || 0) >= FLOOR);
  for (const i of fresh) { const v = num(i.likesText) || 0; if (v > best) best = v; }
  if (fresh.length) {
    log(`"${q}": ${fresh.length} carousels, ${big.length} at/over floor (best seen overall ${best.toLocaleString()})`);
  }

  // A warmed session is the only way to get search to answer, and a warmed
  // session is exactly what makes POST pages answer with a 218-char shell.
  // So this process does search only: every qualifying URL goes into
  // ttf-seen.json, which is the drain's queue, and the drain reads it cold on
  // its own profile. Two jobs that need opposite sessions, kept apart.
  if (COLLECT_ONLY) {
    for (const it of big) {
      seen.add(it.href.split('?')[0]);
      over++;
      log(`  queued ${(num(it.likesText) || 0).toLocaleString()} likes — ${it.href.slice(-30)}`);
    }
    fs.writeFileSync(seenPath, JSON.stringify([...seen]));
    await sleep(jitter(9000, 16000));
    continue;
  }

  for (const it of big) {
    seen.add(it.href);
    over++;
    let d = null;
    try { d = await readDeck(it.href); }
    catch (e) {
      log(`  read failed ${it.href}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 50)}`);
      if (/crash|closed/i.test(String(e))) { await newPage(); await warm(); }
    }
    if (!d || !d.slides?.length) {
      log(`  no slides at ${it.href}`
        + (d ? ` (other cdn imgs on page: ${d.relatedCount}, body ${d.fullText.length}c)` : ' (no data)'));
      continue;
    }

    const id = it.href.split('/').pop();
    const dir = path.join(DECKS, id);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (const [i, u] of d.slides.entries()) {
      const dest = path.join(dir, String(i).padStart(2, '0') + '.jpg');
      if (await dl(u, dest)) files.push(dest);
    }
    if (files.length < 2) { fs.rmSync(dir, { recursive: true, force: true }); continue; }

    const run = d.countsRun || [];
    out.write(JSON.stringify({
      source: 'tiktok', kind: 'photo-carousel', organic: true,
      url: it.href, id, query: q,
      account: it.href.split('/@')[1]?.split('/')[0] || null,
      likesFromCard: num(it.likesText),
      likes: num(d.likes) ?? num(run[0]),
      comments: num(d.comments) ?? num(run[1]),
      saves: num(run[2]),
      shares: num(d.shares) ?? num(run[3]),
      slideCount: files.length,
      files,
      caption: d.caption,
      hashtags: d.hashtags,
      music: d.musicRaw,
      // "original sound - <handle>" means the creator's own audio; anything
      // else is a track taken from TikTok's library
      soundIsOriginal: /original sound/i.test(d.musicRaw || ''),
      fullText: d.fullText,
      harvestedAt: new Date().toISOString(),
    }) + '\n');
    kept++;
    log(`  KEEP ${num(it.likesText).toLocaleString()} likes · ${files.length} slides · ${it.href}`);
    fs.writeFileSync(seenPath, JSON.stringify([...seen]));
    await sleep(jitter(3000, 5000));
  }
  for (const i of fresh) seen.add(i.href);
  fs.writeFileSync(seenPath, JSON.stringify([...seen]));
  await sleep(jitter(22000, 38000));
}

log(`\nDONE kept=${kept} carousels_seen=${scanned} over_floor=${over} best_seen=${best.toLocaleString()}`);
out.end();
await ctx.close();
