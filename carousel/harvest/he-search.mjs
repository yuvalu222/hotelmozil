// Hebrew travel carousels from TikTok's photo search (10.10).
//
// Goal: find Israeli creators who post travel photo carousels, so their own
// grids (harvest/grid.mjs) can be compared post-against-post. The search
// page fetches /api/search/... itself; this only listens to those responses,
// so every hit comes with author, stats, caption and cover URL. A query that
// returns nothing is logged as unknown, never as "no results".
//
//   node harvest/he-search.mjs
// Out: harvest/he-search/hits.json (merged across runs), creators.txt

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join(import.meta.dirname, 'he-search');
fs.mkdirSync(OUT, { recursive: true });
const HITS = path.join(OUT, 'hits.json');
const hits = fs.existsSync(HITS) ? JSON.parse(fs.readFileSync(HITS, 'utf8')) : {};

const QUERIES = process.argv.slice(2).length ? process.argv.slice(2) : [
  'טיפים לתאילנד', 'תאילנד המלצות', 'טיול לתאילנד', 'דברים שאסור לעשות בתאילנד', 'קופיפי', 'קוסמוי', 'פוקט',
  'בנגקוק המלצות', 'טיול גדול', 'מזרח הרחוק', 'המלצות ליוון', 'כרתים', 'אתונה המלצות', 'רודוס',
  'קפריסין המלצות', 'לרנקה', 'פאפוס', 'רומא המלצות', 'איטליה טיפים', 'פריז המלצות', 'לונדון המלצות',
  'ברצלונה המלצות', 'בודפשט', 'פראג', 'דובאי המלצות', 'אבו דאבי', 'גאורגיה טביליסי', 'בטומי',
  'ניו יורק המלצות', 'יפן טיפים', 'וייטנאם', 'בלי', 'מלדיביים', 'זנזיבר', 'סיישל', 'הפיליפינים',
  'מלון מומלץ', 'מלונות מומלצים', 'חופשה זולה', 'טיסות זולות', 'טיפים לטיסה', 'דברים שלא אומרים לכם',
  'אל תעשו את הטעות', 'המקומות שאסור לפספס', 'מקומות סודיים', 'חופשה באירופה', 'טיול משפחות', 'ירח דבש',
  'סופש באירופה', 'מה לעשות ב', 'המסלול המושלם', 'שמרו את זה לטיול', 'טיפ לחופשה', 'אילת המלצות',
];

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const HEB = /[א-ת]/;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const dir = path.join(process.env.TEMP, 'hm-he-search');
fs.rmSync(dir, { recursive: true, force: true });
const ctx = await chromium.launchPersistentContext(dir, {
  channel: 'chrome', headless: true, userAgent: UA, viewport: { width: 1280, height: 1400 }, locale: 'he-IL',
  args: ['--disable-blink-features=AutomationControlled'],
});
const page = await ctx.newPage();
let got = [];
page.on('response', async (r) => {
  if (!/\/api\/search\//.test(r.url())) return;
  try {
    const j = await r.json();
    const items = j.item_list || j.data?.map((d) => d.item).filter(Boolean) || [];
    got.push(...items);
  } catch { /* refused */ }
});
// Search needs a warmed session (TIKTOK.md): homepage first.
await page.goto('https://www.tiktok.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
await sleep(5000);

const log = [];
for (const q of QUERIES) {
  got = [];
  try {
    await page.goto(`https://www.tiktok.com/search/photo?q=${encodeURIComponent(q)}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(5000);
    for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 3000); await sleep(2200); }
  } catch (e) { log.push(`${q}: error ${e.message.slice(0, 60)}`); continue; }
  let added = 0, heb = 0;
  for (const it of got) {
    if (!it?.id || !it.imagePost) continue;
    const desc = it.desc || '';
    const s = it.statsV2 || it.stats || {};
    const isHeb = HEB.test(desc) || HEB.test(it.author?.nickname || '') || HEB.test(it.author?.signature || '');
    if (isHeb) heb++;
    if (hits[it.id]) continue;
    hits[it.id] = {
      id: it.id, author: it.author?.uniqueId, nick: it.author?.nickname, followers: it.authorStats?.followerCount ?? null,
      createTime: it.createTime, plays: +s.playCount || 0, likes: +s.diggCount || 0, saves: +s.collectCount || 0,
      shares: +s.shareCount || 0, slides: it.imagePost.images.length, desc, heb: isHeb, query: q,
      cover: it.imagePost.images[0]?.imageURL?.urlList?.[0] || null,
    };
    added++;
  }
  log.push(`${q}: ${got.length} items, ${heb} hebrew, ${added} new`);
  console.log(log[log.length - 1]);
  fs.writeFileSync(HITS, JSON.stringify(hits, null, 1));
  await sleep(2500 + Math.random() * 3000);
}
await ctx.close();

const by = {};
for (const h of Object.values(hits)) if (h.heb && h.author) (by[h.author] ||= []).push(h);
const creators = Object.entries(by).sort((a, b) => b[1].length - a[1].length);
fs.writeFileSync(path.join(OUT, 'creators.txt'), creators.map(([a, l]) => `${a}\t${l.length}\t${Math.max(...l.map((x) => x.plays))}`).join('\n'));
fs.writeFileSync(path.join(OUT, 'log.txt'), log.join('\n'));
console.log(`hits ${Object.keys(hits).length}, hebrew creators ${creators.length}`);
