// Collect carousel URLs from TikTok's PHOTO search tab.
//
// WHY THIS REPLACES THE OLD COLLECTOR, measured side by side on the same
// session and the same query:
//
//   /search?q=athens travel tips        ->  0 carousel links
//   /search/photo?q=athens travel tips  -> 24 carousel links, 0 videos
//
// The general tab is mostly video, so ~85% of every page was being thrown
// away, and on a refused session it returns nothing at all. The photo tab is
// carousels only. Like counts printed on those cards ran to 140K and 157.9K,
// well over the 50,000 floor, so the corpus was never as thin as the first
// pass suggested — it was being looked for in the wrong place.
//
// Queries mix destination x shape with FORMAT words ("save this", "carousel",
// "photo dump"), because that is what carousel creators put in their own
// captions. "save this" surfaced the two biggest posts seen anywhere.
//
// This process only COLLECTS. Search needs a warmed session and post pages
// refuse one, so reading is left to the cold reader.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const FLOOR = Number(process.env.TT_FLOOR ?? 50000);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);

const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').trim().match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};

const PLACES = [
  'greece', 'athens', 'crete', 'rhodes', 'corfu', 'santorini', 'mykonos', 'naxos', 'paros',
  'cyprus', 'larnaca', 'ayia napa', 'paphos',
  'dubai', 'abu dhabi',
  'italy', 'rome', 'venice', 'florence', 'amalfi', 'sicily', 'naples',
  'thailand', 'bangkok', 'phuket', 'krabi', 'koh samui', 'chiang mai',
  'tbilisi', 'batumi', 'georgia country',
  'vietnam', 'hanoi', 'japan', 'tokyo', 'kyoto',
  'prague', 'budapest', 'barcelona', 'paris', 'london', 'amsterdam',
  'vienna', 'istanbul', 'lisbon', 'bali', 'sri lanka', 'maldives', 'zanzibar',
];

// what the deck is "about"
const SHAPES = [
  'travel tips', 'things to do in', 'travel guide', 'hidden gems in',
  'mistakes to avoid in', 'things to know before visiting', 'where to eat in',
  'first time in', 'on a budget', 'itinerary',
];

// what carousel creators actually type. These are format words, not topics,
// and they are the half of the search space the first pass never touched.
const FORMAT = [
  'save this', 'save this for later', 'carousel', 'photo dump', 'swipe',
  'everything you need to know before', 'things nobody tells you about',
  'i wish i knew before', 'dont go to', 'read this before you go',
  'ultimate guide', 'travel hacks', 'bucket list',
  // Second wave, 5.10. Chosen from what the corpus and the research say the
  // winning decks actually ARE, rather than from more synonyms for "guide":
  // itinerary-with-numbers, cost breakdowns, ratings, and the negative
  // framings the owner points out are viral in their own right.
  'day 1 in', 'how much it costs', 'cost of a day in', 'where to stay in',
  'cheapest way to', 'rated out of 10', 'overrated or worth it', 'underrated',
  'dont make this mistake in', 'what they dont tell you about',
  'nobody talks about', 'before you book', 'the truth about', 'avoid this in',
  'part 1', 'worth it or not',
];

function queries() {
  const qs = [];
  // MEASURED over the first 230 queries: format-word queries returned 1.97
  // decks over the floor each, and every single over-floor find came from
  // one. The shape x destination grid produced none.
  //
  // The first version ran format words against only the first 20 destinations
  // and the thin grid against all 49 — which is backwards. Format words now
  // run against every destination, and the grid is kept as a tail rather than
  // the bulk of the sweep.
  for (const f of FORMAT) for (const p of PLACES) qs.push(`${f} ${p}`);
  for (const f of FORMAT) qs.push(`${f} travel`);
  for (const s of SHAPES) for (const p of PLACES) qs.push(`${s} ${p}`);
  return [...new Set(qs)];
}

const seenPath = path.join(ROOT, 'ttf-seen.json');
const seen = new Set(fs.existsSync(seenPath) ? JSON.parse(fs.readFileSync(seenPath, 'utf8')) : []);
const qDonePath = path.join(ROOT, 'ttp-queries.json');
const qDone = new Set(fs.existsSync(qDonePath) ? JSON.parse(fs.readFileSync(qDonePath, 'utf8')) : []);
const sizesPath = path.join(ROOT, 'ttp-sizes.json');
const sizes = fs.existsSync(sizesPath) ? JSON.parse(fs.readFileSync(sizesPath, 'utf8')) : {};

const lg = fs.createWriteStream(path.join(ROOT, 'tt-photo.log'), { flags: 'a' });
const log = (s) => { console.log(s); lg.write(s + '\n'); };

const todo = queries().filter((q) => !qDone.has(q));
log(`\n=== photo-tab collector ${new Date().toISOString()} — ${todo.length} queries, floor ${FLOOR.toLocaleString()} ===`);

const ctx = await chromium.launchPersistentContext(process.env.TT_PROFILE || 'recon/p-final', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1280, height: 1400 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
});
let page = await ctx.newPage();

async function warm() {
  try {
    if (!page || page.isClosed()) page = await ctx.newPage();
    await page.goto('https://www.tiktok.com/', { timeout: 60000, waitUntil: 'domcontentloaded' });
    await sleep(8000);
    for (const sel of ['button:has-text("Accept all")', 'button:has-text("Allow all")', '[data-e2e="accept-all"]']) {
      try {
        const b = page.locator(sel).first();
        if (await b.count()) { await b.click({ timeout: 3000 }); await sleep(2000); break; }
      } catch { /* no banner */ }
    }
    // A login modal blocks the results behind it and does not time out, so it
    // is dismissed here rather than waited on. Escape closes it; the close
    // button is the fallback when the modal traps the key.
    try { await page.keyboard.press('Escape'); await sleep(900); } catch { /* none open */ }
    for (const sel of ['[data-e2e="modal-close-inner-button"]', 'div[role="dialog"] button[aria-label*="lose"]']) {
      try {
        const x = page.locator(sel).first();
        if (await x.count()) { await x.click({ timeout: 2500 }); await sleep(1200); break; }
      } catch { /* none open */ }
    }
    return true;
  } catch (e) {
    log(`  warm failed: ${String(e).split(String.fromCharCode(10))[0].slice(0, 60)}`);
    try { if (page && !page.isClosed()) await page.close(); page = await ctx.newPage(); } catch { /* next cycle */ }
    return false;
  }
}
await warm();

/** One photo-tab page: every card is a carousel, and prints its like count. */
async function search(q) {
  await page.goto(`https://www.tiktok.com/search/photo?q=${encodeURIComponent(q)}`,
    { timeout: 70000, waitUntil: 'domcontentloaded' });
  await sleep(11000);
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 2)).catch(() => {});
    await sleep(2600);
  }
  return page.evaluate(() => {
    const out = [];
    for (const a of document.querySelectorAll('a[href*="/photo/"]')) {
      const box = a.closest('div')?.parentElement || a.parentElement;
      const txt = (box?.innerText || '').replace(/\s+/g, ' ').trim();
      const m = txt.match(/\b([\d.]+[KMB]?)\b/);
      out.push({ href: a.href.split('?')[0], likesText: m ? m[1] : null });
    }
    const s = new Set();
    const uniq = out.filter((i) => !s.has(i.href) && s.add(i.href));
    const t = (document.body.innerText || '').replace(/\s+/g, ' ');
    return { items: uniq, bodyLen: t.length, tail: t.slice(-220) };
  });
}

let scanned = 0, over = 0, best = 0, blockedRun = 0, done = 0, loginWalls = 0, wallRun = 0;
// Pace adapts to refusals instead of only waiting them out. Backing off once
// and then returning to the same rate treats the symptom: the limit is a rate,
// so the rate is what has to change. Each refusal adds 6s to every subsequent
// gap, permanently, up to a 45s floor-to-ceiling walk. A slower sweep that
// finishes beats a fast one that gets walled.
let paceFloor = 7000, paceCeil = 13000;
for (const q of todo) {
  done++;
  let res = null;
  try { res = await search(q); }
  catch (e) {
    log(`  "${q}" failed: ${String(e).split(String.fromCharCode(10))[0].slice(0, 50)}`);
    if (/crash|closed|Target/i.test(String(e))) { try { await page.close(); } catch {} page = await ctx.newPage(); await warm(); }
    continue;
  }

  // a short body with no cards is a refusal, not an empty result — keep the
  // query and slow down rather than recording it as searched
  if (!res.items.length && res.bodyLen < 1500) {
    // A short body with no cards is ambiguous: TikTok says "Something went
    // wrong" when it is refusing, and "No results" when the query genuinely
    // matches nothing. Scoring the second as a block makes the collector slow
    // itself down in response to a query that was simply too specific.
    // THIRD state, found only because the page text was printed: a login
    // modal. "By continuing with an account located in Israel, you agree to
    // our Terms of Service" is TikTok asking us to sign in, not refusing and
    // not returning nothing. Sleeping does not clear it and slowing down is
    // the wrong response entirely — the modal has to be dismissed.
    // "Terms of Service" and "Privacy Policy" appear in TikTok's FOOTER on
    // every page, so matching them labelled ordinary pages as login walls.
    // The modal-only phrasing is the account-location sentence.
    const login = /account located in|log in to tiktok|sign up for tiktok/i.test(res.tail || '');
    if (login) {
      loginWalls++;
      wallRun++;
      // A query that hits the wall stays unmarked so it can be retried — but
      // that is an infinite loop if the wall is not per-query. Measured: after
      // the first wall appeared, clearing the session and retrying hit it on
      // five consecutive DIFFERENT queries without a single one completing.
      // The wall is on the session, not the query, so there is nothing here
      // worth spinning on. Stop, and let the supervisor come back later.
      // MEASURED, on a fresh profile, while this one was walled: every query
      // that returned a 665-character body here returned 2,800-4,800 characters
      // and 24 carousels there. The wall is on the PROFILE, not on the IP and
      // not on the phrase — so the fix is to throw the profile away, not to
      // wait. Closing the page alone does not do it; the state is on disk.
      if (wallRun >= 3) {
        log(`
SEARCH WALLED — ${wallRun} walls in a row. Rotating the profile.`);
        break;   // the supervisor deletes it and starts again on a clean one
      }
      log(`  login wall on "${q}" — reopening the page (${wallRun}/3)`);
      try { if (page && !page.isClosed()) await page.close(); } catch { /* gone */ }
      page = await ctx.newPage();
      await warm();
      await sleep(jitter(8000, 14000));
      continue;
    }
    wallRun = 0;

    const empty = /no results|couldn't find|try (another|different)/i.test(res.tail || '');
    if (empty) {
      qDone.add(q);
      log(`  no results for "${q}" — not a block, moving on`);
      await sleep(jitter(paceFloor, paceCeil));
      continue;
    }
    blockedRun++;
    paceFloor = Math.min(paceFloor + 6000, 45000);
    paceCeil = Math.min(paceCeil + 6000, 60000);
    const wait = Math.min(90000 * blockedRun, 900000);
    log(`  refused on "${q}" (${res.bodyLen}c) — waiting ${Math.round(wait / 60000)}m `
      + `(streak ${blockedRun}, pace now ${Math.round(paceFloor / 1000)}-${Math.round(paceCeil / 1000)}s)`);
    log(`    page said: ${(res.tail || '').slice(-140)}`);
    await sleep(wait);
    await warm();
    continue;
  }
  blockedRun = 0;
  qDone.add(q);

  const fresh = res.items.filter((i) => !seen.has(i.href));
  scanned += fresh.length;
  let addedHere = 0;
  for (const it of fresh) {
    const v = num(it.likesText) || 0;
    if (v > best) best = v;
    if (v >= FLOOR) {
      seen.add(it.href);
      sizes[it.href] = v;
      over++;
      addedHere++;
    }
  }
  if (addedHere) {
    log(`  "${q}": ${res.items.length} carousels, +${addedHere} over floor (queue ${seen.size}, best ${best.toLocaleString()})`);
  }
  if (done % 5 === 0) {
    fs.writeFileSync(seenPath, JSON.stringify([...seen]));
    fs.writeFileSync(qDonePath, JSON.stringify([...qDone]));
    fs.writeFileSync(sizesPath, JSON.stringify(sizes));
    log(`  ... ${done}/${todo.length} queries, ${scanned} carousels seen, ${over} over floor, best ${best.toLocaleString()}`);
  }
  await sleep(jitter(paceFloor, paceCeil));
}

fs.writeFileSync(seenPath, JSON.stringify([...seen]));
fs.writeFileSync(qDonePath, JSON.stringify([...qDone]));
fs.writeFileSync(sizesPath, JSON.stringify(sizes));
log(`\nDONE photo-tab queries=${done} carousels=${scanned} overFloor=${over} loginWalls=${loginWalls} best=${best.toLocaleString()} queue=${seen.size}`);
await ctx.close();
