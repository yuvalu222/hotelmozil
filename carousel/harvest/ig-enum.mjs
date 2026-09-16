// Stage 1 — enumerate Instagram post shortcodes at breadth.
//
// v3. DuckDuckGo rate-limited this IP after ~86 codes. Brave Search answers the
// same site: queries, exposes the post URLs, and paginates by &offset= (0-9),
// so it is the primary engine now; DDG stays as a fallback for when it recovers.
//
// Throttling and saturation are still kept distinct: a page that answered but
// returned only known codes is saturation, a page that returned nothing is
// throttling, and only the former counts toward stopping.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const ROOT = 'harvest';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);

const TOPICS = [
  'travel tips', 'travel hacks', 'things to do', 'travel guide', 'packing list',
  'budget travel', 'travel mistakes', 'before you go', 'itinerary', 'where to stay',
  'hidden gems', 'what to eat', 'first time visiting', 'travel checklist',
  'best time to visit', 'cheap eats', 'day trip', 'must see', 'travel essentials',
  'how to get around', 'where to eat', 'travel on a budget', 'save money travel',
];
const PLACES = [
  '', 'thailand', 'japan', 'greece', 'italy', 'bali', 'vietnam', 'portugal',
  'turkey', 'dubai', 'cyprus', 'georgia', 'spain', 'paris', 'london', 'new york',
  'bangkok', 'tokyo', 'rome', 'amsterdam', 'prague', 'budapest', 'morocco',
  'sri lanka', 'philippines', 'mexico', 'croatia', 'albania', 'seoul', 'lisbon',
];
const HEBREW = [
  'טיפים לטיול', 'המלצות טיול', 'תאילנד טיפים', 'יוון טיול', 'טיול משפחתי',
  'טיפים לטיסה', 'יעדים מומלצים', 'טיול בתקציב', 'ויאטנם טיול', 'טיול ליפן',
  'המלצות מלון', 'טיול לאירופה', 'מה לעשות בבנגקוק',
];

const queries = [];
for (const t of TOPICS) for (const p of PLACES) queries.push(p ? `"${t}" ${p}` : `"${t}"`);
queries.push(...HEBREW);

// engine: (query, pageIndex) -> url | null
const ENGINES = [
  { name: 'brave', pages: 6, url: (q, i) => `https://search.brave.com/search?q=${encodeURIComponent(q)}${i ? `&offset=${i}` : ''}` },
  { name: 'ddg',   pages: 1, url: (q)    => `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}` },
];

const codesPath = path.join(ROOT, 'ig-shortcodes.json');
const qDonePath = path.join(ROOT, 'ig-queries-done.json');
const codes = new Set(fs.existsSync(codesPath) ? JSON.parse(fs.readFileSync(codesPath, 'utf8')) : []);
const qDone = new Set(fs.existsSync(qDonePath) ? JSON.parse(fs.readFileSync(qDonePath, 'utf8')) : []);
const log = fs.createWriteStream(path.join(ROOT, 'ig-enum.log'), { flags: 'a' });
const say = s => { console.log(s); log.write(s + '\n'); };

const ctx = await chromium.launchPersistentContext('recon/p-enum3', {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1350, height: 1000 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled'],
});
await ctx.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
const p = await ctx.newPage();

const extract = () => p.evaluate(() => {
  const html = document.documentElement.innerHTML;
  const txt = document.body.innerText || '';
  const a = (html.match(/instagram\.com\/p\/([A-Za-z0-9_-]{5,})/g) || []).map(s => s.split('/p/')[1]);
  const b = (txt.match(/instagram\.com\s*[›>\/]\s*p\s*[›>\/]\s*([A-Za-z0-9_-]{5,})/gi) || [])
    .map(s => s.split(/[›>\/]/).pop().trim());
  return {
    codes: [...new Set([...a, ...b])],
    links: document.querySelectorAll('a[href^="http"]').length,
    throttled: /captcha|unusual traffic|are you a robot|too many requests|verify you/i.test(txt.slice(0, 600)),
  };
});

let saturated = 0, backoff = 15000, engineIdx = 0;

for (const q of queries) {
  if (qDone.has(q)) continue;
  const full = 'site:instagram.com/p ' + q;
  const before = codes.size;
  let answered = false;

  const eng = ENGINES[engineIdx % ENGINES.length];
  for (let pg = 0; pg < eng.pages; pg++) {
    let r = null;
    try {
      await p.goto(eng.url(full, pg), { timeout: 45000, waitUntil: 'domcontentloaded' });
      await sleep(jitter(1600, 2800));
      r = await extract();
    } catch { r = null; }

    if (!r || r.throttled || r.links < 5) {
      say(`  ${eng.name} throttled/empty on "${q}" p${pg} — backoff ${Math.round(backoff / 1000)}s, switching engine`);
      engineIdx++;
      await sleep(backoff);
      backoff = Math.min(backoff * 2, 300000);
      break;
    }
    answered = true;
    backoff = Math.max(15000, backoff / 2);
    r.codes.forEach(c => codes.add(c));
    if (!r.codes.length) break;                 // no more pages worth turning
    await sleep(jitter(2500, 4500));
  }

  if (!answered) { say(`  no answer for "${q}" — leaving unmarked for retry`); continue; }

  qDone.add(q);
  const gained = codes.size - before;
  saturated = gained === 0 ? saturated + 1 : 0;
  say(`"${q}" +${gained} (total ${codes.size}${gained === 0 ? ', saturated' : ''})`);
  fs.writeFileSync(codesPath, JSON.stringify([...codes]));
  fs.writeFileSync(qDonePath, JSON.stringify([...qDone]));

  if (saturated >= 30) { say('30 answered-but-saturated queries — corpus tapped.'); break; }
  await sleep(jitter(4000, 8000));
}

say(`ENUM DONE total=${codes.size}`);
log.end();
await ctx.close();
