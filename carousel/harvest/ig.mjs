// Instagram organic carousels — Pile A2.
//
// Why this exists: TikTok's grid and Instagram's profile API are both walled
// logged-out, so an account's own median (the brief's §3) cannot be computed
// for organic content on either platform. But Instagram's PUBLIC embed endpoint
// returns, without login: every slide of a carousel, the caption, the like
// count, AND the account's follower count.
//
// Follower count is precisely the confound §3 exists to control for ("comparing
// a post against its own account controls for follower count"). So each post
// carries a real denominator: engagement rate = likes / followers. That is not
// the same as an account's own median — it does not control for that account's
// own variance — and it is labelled differently everywhere it is used.
//
// Stage 1: enumerate shortcodes via DuckDuckGo HTML (paginated).
// Stage 2: pull each post through the embed, save every slide to disk.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const DECKS = path.join(ROOT, 'ig-decks');
fs.mkdirSync(DECKS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const QUERIES = [
  '"travel tips"', '"travel hacks"', '"things to do in"', '"travel guide"',
  '"packing tips"', '"budget travel"', '"hotel tips"', '"flight hacks"',
  '"travel mistakes"', '"before you go"', '"travel itinerary"',
  '"thailand travel"', '"japan travel tips"', '"europe travel tips"',
  '"greece travel"', '"bali travel tips"', '"travel on a budget"',
  '"airport tips"', '"solo travel tips"', '"cheap flights tips"',
  'טיפים לטיול', 'טיולים המלצות', 'תאילנד טיפים',
];

const codesPath = path.join(ROOT, 'ig-shortcodes.json');
let codes = new Set(fs.existsSync(codesPath) ? JSON.parse(fs.readFileSync(codesPath, 'utf8')) : []);

const ctx = await chromium.launchPersistentContext('recon/p-igfetch', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1200, height: 1200 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));

// ---------------- Stage 1: enumerate ----------------
if (!process.env.SKIP_ENUM) {
  const sp = await ctx.newPage();
  for (const q of QUERIES) {
    for (const off of [0, 30, 60, 90]) {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent('site:instagram.com/p ' + q)}`
        + (off ? `&s=${off}&dc=${off + 1}` : '');
      try {
        await sp.goto(url, { timeout: 40000, waitUntil: 'domcontentloaded' });
        await sleep(2600);
        const found = await sp.evaluate(() =>
          [...new Set((document.documentElement.innerHTML.match(/instagram\.com\/p\/([A-Za-z0-9_-]{5,})/g) || [])
            .map(s => s.split('/p/')[1]))]);
        found.forEach(c => codes.add(c));
        if (!found.length) break;
      } catch { break; }
      await sleep(1400);
    }
    console.log(`enum "${q}" -> total ${codes.size}`);
    fs.writeFileSync(codesPath, JSON.stringify([...codes], null, 0));
  }
  await sp.close();
}
console.log('shortcodes to try:', codes.size);

// ---------------- Stage 2: harvest each post ----------------
const donePath = path.join(ROOT, 'ig-done.json');
const done = new Set(fs.existsSync(donePath) ? JSON.parse(fs.readFileSync(donePath, 'utf8')) : []);
const out = fs.createWriteStream(path.join(ROOT, 'harvest.jsonl'), { flags: 'a' });

function num(s) {
  if (!s) return null;
  s = s.replace(/,/g, '').trim();
  const m = s.match(/^([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1;
  return Math.round(parseFloat(m[1]) * mult);
}

async function dl(url, dest) {
  try {
    const r = await ctx.request.get(url, { timeout: 25000 });
    if (!r.ok()) return false;
    const b = await r.body();
    if (b.length < 4000) return false;          // skip avatars/sprites
    fs.writeFileSync(dest, b);
    return true;
  } catch { return false; }
}

const page = await ctx.newPage();
let kept = 0, seen = 0;

for (const code of codes) {
  if (done.has(code)) continue;
  done.add(code); seen++;
  try {
    const r = await page.goto(`https://www.instagram.com/p/${code}/embed/captioned/`,
      { timeout: 35000, waitUntil: 'domcontentloaded' });
    if (!r || r.status() !== 200) continue;

    // Slides lazy-load one after another. A fixed 2.6s wait captured only the
    // first two of three on EVERY post (57/57 decks came back exactly 2 slides
    // — a suspiciously flat distribution, which is what gave the bug away).
    // Wait until the qualifying-image count stops growing instead of guessing.
    await sleep(1500);
    let stable = 0, last = -1;
    for (let t = 0; t < 14 && stable < 3; t++) {
      const n = await page.evaluate(() => {
        const f = document.querySelector('.EmbedFrame, .Content') || document;
        return [...f.querySelectorAll('img')]
          .filter(i => /cdninstagram|fbcdn/.test(i.src) && i.naturalWidth >= 600 && i.naturalHeight >= 600).length;
      }).catch(() => -1);
      stable = (n === last) ? stable + 1 : 0;
      last = n;
      await sleep(700);
    }

    const d = await page.evaluate(() => {
      const t = document.body.innerText;
      // An embed page's <img> list is NOT the deck. It also holds the 100x100
      // avatar (twice) and a strip of 150x150 "more posts from this account"
      // thumbnails that belong to OTHER posts entirely. Taking them as slides
      // silently contaminates every deck. Real slides are the full-resolution
      // images inside the embed frame, so scope to that container and require
      // a real natural width.
      const frame = document.querySelector('.EmbedFrame, .Content') || document;
      const imgs = [...new Set([...frame.querySelectorAll('img')]
        .filter(i => /cdninstagram|fbcdn/.test(i.src)
                  && i.naturalWidth >= 600 && i.naturalHeight >= 600)
        .map(i => i.src))];
      const handle = (document.querySelector('.Username, .UsernameText')?.innerText
        || (t.split('\n').find(x => x.trim()) || '')).trim();
      return {
        handle,
        likesRaw: (t.match(/([\d,.]+[KMB]?)\s+likes?/i) || [])[1] || null,
        followersRaw: (t.match(/([\d,.]+[KMB]?)\s+followers/i) || [])[1] || null,
        postsRaw: (t.match(/([\d,.]+[KMB]?)\s+posts/i) || [])[1] || null,
        caption: t.replace(/\s+/g, ' ').slice(0, 1500),
        imgs,
      };
    });

    // already scoped and size-filtered in the page; a carousel needs >1 slide
    const slides = d.imgs;
    if (slides.length < 2) continue;

    const followers = num(d.followersRaw);
    const likes = num(d.likesRaw);

    const dir = path.join(DECKS, code);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (const [i, u] of slides.entries()) {
      const dest = path.join(dir, String(i).padStart(2, '0') + '.jpg');
      if (await dl(u, dest)) files.push(dest);
    }
    if (files.length < 2) { fs.rmSync(dir, { recursive: true, force: true }); continue; }

    out.write(JSON.stringify({
      source: 'instagram-embed', pile: 'A2', organic: true,
      shortcode: code,
      url: `https://www.instagram.com/p/${code}/`,
      account: d.handle,
      likes, followers,
      posts: num(d.postsRaw),
      // the denominator: controls for audience size, NOT for the account's own
      // variance. Labelled 'engagementRate', never 'vs account median'.
      engagementRate: (likes != null && followers) ? +(likes / followers).toFixed(5) : null,
      slideCount: files.length,
      files,
      caption: d.caption,
      harvestedAt: new Date().toISOString(),
    }) + '\n');
    kept++;
    if (kept % 10 === 0) console.log(`kept ${kept} / seen ${seen}`);
  } catch { /* skip */ }
  finally {
    if (seen % 20 === 0) fs.writeFileSync(donePath, JSON.stringify([...done]));
  }
  await sleep(900);
}

fs.writeFileSync(donePath, JSON.stringify([...done]));
out.end();
console.log(`DONE ig decks kept=${kept} seen=${seen}`);
await page.close();
await ctx.close();
