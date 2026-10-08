// Measure @hotelmozil — the only account that matters, and the one I never
// measured.
//
// research/GAPS.md §20 called this the most relevant data available and
// recorded that I had never looked at it. That was half wrong: 44 of his posts
// were captured with metadata months ago and have been sitting in
// harvest/own/hotelmozil/. They carry VIEWS, which is the impressions-level
// number I have repeatedly said the corpus does not have — so the one question
// I called unanswerable (what stops a scroll) is partly answerable here.
//
// What views let us compute that saves/like cannot:
//   like rate    likes/views    — did they stop and react
//   save rate    saves/views    — did they keep it
//   saves/like                  — comparable to the corpus
//
//   node analyze/own-account.mjs

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join('harvest', 'own', 'hotelmozil');
const posts = [];
for (const d of fs.readdirSync(ROOT)) {
  const f = path.join(ROOT, d, 'post.json');
  if (!fs.existsSync(f)) continue;
  try {
    const r = JSON.parse(fs.readFileSync(f, 'utf8'));
    const n = (v) => (v === undefined || v === null || v === '' ? 0 : Number(v));
    const rec = { ...r, views: n(r.views), likes: n(r.likes),
                  saves: n(r.saves), comments: n(r.comments), dir: d };
    if (Number.isFinite(rec.views) && rec.views > 0) posts.push(rec);
  } catch { /* skip */ }
}

posts.sort((a, b) => b.views - a.views);
const num = (n) => (!Number.isFinite(n) ? '??' : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));
const pct = (x) => `${(x * 100).toFixed(2)}%`;

const med = (a) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const views = posts.map((p) => p.views);
const likeRate = posts.filter((p) => p.likes).map((p) => p.likes / p.views);
const saveRate = posts.filter((p) => p.saves).map((p) => p.saves / p.views);

console.log(`${posts.length} posts with view counts\n`);
console.log(`views      median ${num(med(views))}   max ${num(Math.max(...views))}   min ${num(Math.min(...views))}`);
console.log(`like rate  median ${pct(med(likeRate))}`);
console.log(`save rate  median ${pct(med(saveRate))}\n`);

console.log(`${'views'.padStart(7)} ${'likes'.padStart(7)} ${'saves'.padStart(6)} ${'like%'.padStart(7)} ${'save%'.padStart(7)} ${'n'.padStart(3)}  caption`);
for (const p of posts.slice(0, 20)) {
  console.log(`${num(p.views).padStart(7)} ${num(p.likes || 0).padStart(7)} ${num(p.saves || 0).padStart(6)} `
    + `${pct((p.likes || 0) / p.views).padStart(7)} ${pct((p.saves || 0) / p.views).padStart(7)} `
    + `${String(p.slideCount || (p.files || []).length).padStart(3)}  ${(p.caption || '').replace(/\s+/g, ' ').slice(0, 64)}`);
}

// The spread is the whole question: if his best post is 50x his median, the
// variance is in what he posted, not in the account.
const top = posts[0];
console.log(`\ntop post is ${(top.views / med(views)).toFixed(0)}x the median view count`);

// Carousels versus video, since this project only makes carousels.
const by = new Map();
for (const p of posts) {
  const k = p.kind || 'unknown';
  if (!by.has(k)) by.set(k, []);
  by.get(k).push(p);
}
console.log('\nby kind');
for (const [k, g] of by) {
  console.log(`  ${k.padEnd(16)} n=${String(g.length).padStart(3)}  median views ${num(med(g.map((p) => p.views))).padStart(6)}`
    + `  like rate ${pct(med(g.filter((p) => p.likes).map((p) => p.likes / p.views)))}`);
}

// Does caption length track anything on HIS account?
console.log('\nhis caption length vs views');
const buckets = new Map();
for (const p of posts) {
  const w = (p.caption || '').trim().split(/\s+/).filter(Boolean).length;
  const k = w === 0 ? 'a. none' : w <= 8 ? 'b. 1-8' : w <= 18 ? 'c. 9-18' : 'd. 19+';
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(p);
}
for (const k of [...buckets.keys()].sort()) {
  const g = buckets.get(k);
  console.log(`  ${k.padEnd(10)} n=${String(g.length).padStart(3)}  median views ${num(med(g.map((p) => p.views))).padStart(6)}`);
}
