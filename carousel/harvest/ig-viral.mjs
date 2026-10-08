// Fallback track: Instagram carousels above Yuval's 50,000-like floor, on
// destinations Israelis actually fly to.
//
// This exists because TikTok may not open. Its limits are real and stated
// rather than smoothed over:
//   - the embed shows only the first 2 slides of a carousel
//   - there is no view count and no sound, so "trending vs original audio"
//     cannot be answered from here at all
// What it does give, fully: likes, follower count, the complete caption and
// the exact hashtags — and the cover slide, which is the one that has to work.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const DECKS = path.join(ROOT, 'igv-decks');
// Fresh profile per run: a crashed launch poisons the directory it used.
const IG_PROFILE = path.join('recon', 'p-igv-' + Date.now().toString(36));
process.on('exit', () => { try { fs.rmSync(IG_PROFILE, { recursive: true, force: true }); } catch {} });
fs.mkdirSync(DECKS, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);
const LIKES_FLOOR = 50000;

const PLACES = [
  'greece', 'athens', 'crete', 'rhodes', 'corfu', 'santorini', 'mykonos', 'naxos', 'paros',
  'cyprus', 'larnaca', 'ayia napa', 'paphos',
  'dubai', 'abu dhabi',
  'italy', 'rome', 'venice', 'florence', 'amalfi', 'sicily',
  'thailand', 'bangkok', 'phuket', 'krabi',
  'tbilisi', 'batumi', 'vietnam', 'hanoi', 'japan', 'tokyo',
  'prague', 'budapest', 'barcelona', 'paris', 'london', 'amsterdam', 'istanbul',
];
const SHAPES = ['travel tips', 'things to do in', 'travel guide', 'hidden gems',
                'mistakes to avoid', 'what to do in', 'best beaches in'];

const codesPath = path.join(ROOT, 'igv-codes.json');
const codes = new Set(fs.existsSync(codesPath) ? JSON.parse(fs.readFileSync(codesPath, 'utf8')) : []);
const donePath = path.join(ROOT, 'igv-done.json');
const done = new Set(fs.existsSync(donePath) ? JSON.parse(fs.readFileSync(donePath, 'utf8')) : []);
const out = fs.createWriteStream(path.join(ROOT, 'ig-viral.jsonl'), { flags: 'a' });
const log = (s) => console.log(s);

const ctx = await chromium.launchPersistentContext(IG_PROFILE, {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1200, height: 1200 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));

// ---- enumerate shortcodes via Brave + DDG (same pair that worked before) ----
const ENGINES = [
  (q) => `https://search.brave.com/search?q=${encodeURIComponent(q)}`,
  (q) => `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`,
];
let ei = 0;
const sp = await ctx.newPage();
// SKIP_ENUM=1 goes straight to fetching the shortcodes already on file.
// Enumeration is 7 shapes x 38 places = 266 search queries at a few seconds
// each, and NOTHING is fetched until every one of them finishes — so a run
// that already has 55 codes waiting burns hours re-finding the same ones
// before it writes a single row. The embed itself was proved to answer
// separately: three codes, three 200s with handle, followers and caption.
outer:
for (const shape of (process.env.SKIP_ENUM ? [] : SHAPES)) {
  for (const place of PLACES) {
    const q = `site:instagram.com/p "${shape}" ${place}`;
    try {
      await sp.goto(ENGINES[ei % ENGINES.length](q), { timeout: 40000, waitUntil: 'domcontentloaded' });
      await sleep(jitter(1800, 2800));
      const found = await sp.evaluate(() => {
        const h = document.documentElement.innerHTML;
        const t = document.body.innerText || '';
        const a = (h.match(/instagram\.com\/p\/([A-Za-z0-9_-]{5,})/g) || []).map((s) => s.split('/p/')[1]);
        const b = (t.match(/instagram\.com\s*[›>\/]\s*p\s*[›>\/]\s*([A-Za-z0-9_-]{5,})/gi) || [])
          .map((s) => s.split(/[›>\/]/).pop().trim());
        return { codes: [...new Set([...a, ...b])], links: document.querySelectorAll('a[href^="http"]').length };
      });
      if (found.links < 5) { ei++; await sleep(20000); continue; }
      found.codes.forEach((c) => codes.add(c));
    } catch { ei++; await sleep(8000); continue; }
    fs.writeFileSync(codesPath, JSON.stringify([...codes]));
    if (codes.size > 1400) break outer;
    await sleep(jitter(2500, 4200));
  }
  log(`enumerated: ${codes.size} shortcodes`);
}
await sp.close();
log(`\ntotal shortcodes: ${codes.size}\n`);

// ---- read each post through the public embed ----
const num = (s) => {
  if (!s) return null;
  const m = String(s).replace(/,/g, '').match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
};
async function dl(url, dest) {
  try {
    const r = await ctx.request.get(url, { timeout: 25000 });
    if (!r.ok()) return false;
    const b = await r.body();
    if (b.length < 8000) return false;
    fs.writeFileSync(dest, b);
    return true;
  } catch { return false; }
}

const page = await ctx.newPage();
let kept = 0, looked = 0;
const likeDist = [];

for (const code of codes) {
  if (done.has(code)) continue;
  // NOT marked done here. It used to be, and a run that crashed part-way left
  // every code it had merely reached recorded as finished — all 55 were marked
  // done without one being fetched, so every later run skipped the lot and
  // reported "examined=0" while looking perfectly healthy. A code is done when
  // it has been read, not when it has been reached.
  try {
    const r = await page.goto(`https://www.instagram.com/p/${code}/embed/captioned/`,
      { timeout: 35000, waitUntil: 'domcontentloaded' });
    if (!r || r.status() !== 200) continue;
    await sleep(1500);
    for (let i = 0; i < 12; i++) {
      const n = await page.evaluate(() => {
        const f = document.querySelector('.EmbedFrame, .Content') || document;
        return [...f.querySelectorAll('img')].filter((x) => /cdninstagram|fbcdn/.test(x.src)
          && x.naturalWidth >= 600 && x.naturalHeight >= 600).length;
      }).catch(() => 0);
      if (n >= 2) break;
      await sleep(600);
    }
    const d = await page.evaluate(() => {
      const t = document.body.innerText || '';
      const f = document.querySelector('.EmbedFrame, .Content') || document;
      const imgs = [...new Set([...f.querySelectorAll('img')]
        .filter((i) => /cdninstagram|fbcdn/.test(i.src) && i.naturalWidth >= 600 && i.naturalHeight >= 600)
        .map((i) => i.src))];
      return {
        handle: (t.split('\n').find((x) => x.trim()) || '').trim(),
        likesRaw: (t.match(/([\d,.]+[KMB]?)\s+likes?/i) || [])[1] || null,
        followersRaw: (t.match(/([\d,.]+[KMB]?)\s+followers/i) || [])[1] || null,
        caption: t.replace(/\s+/g, ' ').slice(0, 2000),
        imgs,
      };
    });
    if (d.imgs.length < 2) continue;
    done.add(code);   // read successfully — now it is done
    looked++;
    const likes = num(d.likesRaw);
    likeDist.push(likes || 0);
    if ((likes || 0) < LIKES_FLOOR) {
      if (looked % 25 === 0) {
        const s = [...likeDist].sort((a, b) => b - a);
        log(`  ... ${looked} carousels seen, best ${s[0].toLocaleString()} likes`);
      }
      continue;
    }
    const dir = path.join(DECKS, code);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (const [i, u] of d.imgs.entries()) {
      const dest = path.join(dir, String(i).padStart(2, '0') + '.jpg');
      if (await dl(u, dest)) files.push(dest);
    }
    if (!files.length) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
    const followers = num(d.followersRaw);
    out.write(JSON.stringify({
      source: 'instagram-embed', kind: 'carousel', organic: true,
      shortcode: code, url: `https://www.instagram.com/p/${code}/`,
      account: d.handle, likes, followers,
      engagementRate: (likes != null && followers) ? +(likes / followers).toFixed(5) : null,
      hashtags: (d.caption.match(/#[^\s#]+/g) || []).map((h) => h.slice(1)),
      caption: d.caption,
      files, slideCount: files.length,
      note: 'embed shows first 2 slides only; no views, no audio',
      harvestedAt: new Date().toISOString(),
    }) + '\n');
    kept++;
    log(`  KEEP ${likes.toLocaleString()} likes @${d.handle.slice(0, 22)}`);
  } catch { /* skip */ }
  finally {
    if (looked % 20 === 0) fs.writeFileSync(donePath, JSON.stringify([...done]));
  }
  await sleep(jitter(700, 1300));
}
fs.writeFileSync(donePath, JSON.stringify([...done]));
log(`\nDONE kept=${kept} examined=${looked}`);
out.end();
await page.close();
await ctx.close();
