// Meta Ad Library — full carousel decks, every slide, saved to disk. Pile A1.
//
// v2. The first version walked a Playwright locator over every card on every
// scroll step, which is O(n^2) and crawled once a listing passed ~200 cards.
// This version does one page.evaluate() per step, tags each card with a
// data-hm attribute, and only reaches back into Playwright for the handful of
// cards that actually are carousels and need their arrows clicked.
//
// Writes harvest/harvest.jsonl and harvest/decks/<libraryId>/NN.jpg.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const DECKS = path.join(ROOT, 'decks');
fs.mkdirSync(DECKS, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));

const QUERIES = JSON.parse(fs.readFileSync(path.join(ROOT, 'queries.json'), 'utf8'));
const donePath = path.join(ROOT, 'decks-done.json');
const done = new Set(fs.existsSync(donePath) ? JSON.parse(fs.readFileSync(donePath, 'utf8')) : []);
const out = fs.createWriteStream(path.join(ROOT, 'harvest.jsonl'), { flags: 'a' });
const log = fs.createWriteStream(path.join(ROOT, 'adlib-decks.log'), { flags: 'a' });
const say = s => { console.log(s); log.write(s + '\n'); };

function parseStart(txt) {
  const m = txt.match(/Started running on ([A-Za-z]{3} \d{1,2},? \d{4})/);
  if (!m) return null;
  const d = new Date(m[1].replace(',', ''));
  return isNaN(d) ? null : d;
}
const advOf = t => (t.match(/See ad details\s+([\s\S]*?)\s+Sponsored/) || [])[1]?.trim().replace(/\s+/g, ' ') || null;

const ctx = await chromium.launchPersistentContext('recon/p-adlib', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1500, height: 1100 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
const page = await ctx.newPage();
await page.goto('https://www.facebook.com/ads/library/', { timeout: 60000, waitUntil: 'domcontentloaded' });
await sleep(4000);

async function dl(url, dest) {
  try {
    const r = await ctx.request.get(url, { timeout: 25000 });
    if (!r.ok()) return false;
    const b = await r.body();
    if (b.length < 4000) return false;
    fs.writeFileSync(dest, b);
    return true;
  } catch { return false; }
}

// one pass: tag every unprocessed card, return its facts
const scan = seen => page.evaluate(seenIds => {
  const known = new Set(seenIds);
  const cards = [...document.querySelectorAll('div')]
    .filter(e => (e.innerText?.match(/Library ID:/g) || []).length === 1);
  const res = [];
  // One ad is matched by several nested divs — an outer wrapper and an inner
  // body can each contain exactly one "Library ID:". Without this per-pass
  // guard the same ad is emitted two or three times (45% of an early run).
  const thisPass = new Set();
  for (const e of cards) {
    const t = e.innerText || '';
    const id = (t.match(/Library ID:\s*(\d+)/) || [])[1];
    if (!id || known.has(id) || thisPass.has(id) || e.getAttribute('data-hm')) continue;
    thisPass.add(id);
    e.setAttribute('data-hm', id);
    const imgs = [...new Set([...e.querySelectorAll('img')].map(i => i.src)
      .filter(s => /scontent|fbcdn/.test(s) && !/s60x60|p50x50|s32x32/.test(s)))];
    res.push({
      id, text: t.slice(0, 2000), imgs,
      hasNext: !!e.querySelector('[aria-label*="Next"]'),
    });
  }
  return res;
}, [...seen]);

let decks = 0, scanned = 0;

for (const { country, q, label } of QUERIES) {
  const url = `https://www.facebook.com/ads/library/?ad_type=all&active_status=all&country=${country}`
    + `&q=${encodeURIComponent(q)}&search_type=keyword_unordered&media_type=image`;
  try { await page.goto(url, { timeout: 90000, waitUntil: 'domcontentloaded' }); }
  catch { say(`nav fail ${country}/${q}`); continue; }
  await sleep(12000);

  let stale = 0;
  for (let step = 0; step < 60 && stale < 5; step++) {
    let batch = [];
    try { batch = await scan(done); } catch { break; }

    if (!batch.length) stale++; else stale = 0;

    for (const c of batch) {
      done.add(c.id); scanned++;
      if (!c.hasNext && c.imgs.length < 2) continue;

      const card = page.locator(`[data-hm="${c.id}"]`).first();
      try { await card.scrollIntoViewIfNeeded({ timeout: 4000 }); } catch { continue; }
      await sleep(800);

      const slides = new Set(c.imgs);
      // re-read after scroll: lazy images land only once visible
      try {
        const now = await card.evaluate(e => [...new Set([...e.querySelectorAll('img')].map(i => i.src)
          .filter(s => /scontent|fbcdn/.test(s) && !/s60x60|p50x50|s32x32/.test(s)))]);
        now.forEach(u => slides.add(u));
      } catch { /* ignore */ }

      if (c.hasNext) {
        for (let s = 0; s < 12; s++) {
          const btn = card.locator('[aria-label*="Next"]').first();
          if (!(await btn.count().catch(() => 0))) break;
          try { await btn.click({ timeout: 2500 }); } catch { break; }
          await sleep(1000);
          let more = [];
          try {
            more = await card.evaluate(e => [...new Set([...e.querySelectorAll('img')].map(i => i.src)
              .filter(s => /scontent|fbcdn/.test(s) && !/s60x60|p50x50|s32x32/.test(s)))]);
          } catch { break; }
          const before = slides.size;
          more.forEach(u => slides.add(u));
          if (slides.size === before) break;
        }
      }
      if (slides.size < 2) continue;

      const dir = path.join(DECKS, c.id);
      fs.mkdirSync(dir, { recursive: true });
      const files = [];
      let k = 0;
      for (const u of slides) {
        const dest = path.join(dir, String(k).padStart(2, '0') + '.jpg');
        if (await dl(u, dest)) { files.push(dest); k++; }
      }
      if (files.length < 2) { fs.rmSync(dir, { recursive: true, force: true }); continue; }

      const start = parseStart(c.text);
      out.write(JSON.stringify({
        source: 'meta-ad-library', pile: 'A1', organic: false,
        libraryId: c.id,
        url: `https://www.facebook.com/ads/library/?id=${c.id}`,
        advertiser: advOf(c.text),
        country, query: q, label,
        startDate: start ? start.toISOString().slice(0, 10) : null,
        runDays: start ? Math.round((Date.now() - start) / 86400000) : null,
        active: /\bActive\b/.test(c.text.slice(0, 80)),
        slideCount: files.length,
        files,
        text: c.text.replace(/\s+/g, ' ').slice(0, 1200),
        harvestedAt: new Date().toISOString(),
      }) + '\n');
      decks++;
      say(`deck ${decks}: ${c.id} ${files.length} slides — ${(advOf(c.text) || '?').slice(0, 40)}`);
    }

    fs.writeFileSync(donePath, JSON.stringify([...done]));
    await page.mouse.wheel(0, 3000);
    await sleep(2400);
  }
  say(`— ${country}/${q}: decks ${decks}, scanned ${scanned}`);
  fs.writeFileSync(donePath, JSON.stringify([...done]));
}

out.end();
say(`DONE decks=${decks} scanned=${scanned}`);
await page.close();
await ctx.close();
