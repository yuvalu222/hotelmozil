// Which cover properties go with a post outperforming ITS OWN creator's norm.
//
// Joins three things that were produced separately on purpose:
//   * coded/*.jsonl      — what is on each cover, coded blind to performance
//   * coding-key.json    — which post each blind code is
//   * the grids          — exact plays, likes and age for each post
//
// For every feature: inside each creator, mean lift of covers WITH it minus
// covers WITHOUT it (only creators where both groups have >= MIN_GROUP posts);
// pooled across creators weighted by the smaller group; a bootstrap that
// resamples posts within each creator; and the count of creators in which the
// difference points the same way.
//
// A pilot until the grid harvest delivers more creators. With three creators
// a "finding" is a direction worth testing, not a rule.
//
//   node analyze/cover-effects.mjs

import fs from 'node:fs';
import path from 'node:path';
import { copyFeatures } from './copy-features.mjs';

const MIN_DAYS = 10;
const MIN_GROUP = 3;
const now = Date.now() / 1000;
const median = (a) => { const s = [...a].sort((x, y) => x - y); const k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
const num = (v) => {
  if (typeof v === 'number') return v;
  const m = String(v ?? '').replace(/,/g, '').match(/^([\d.]+)\s*([KMB])?$/i);
  if (!m) return null;
  return Math.round(parseFloat(m[1]) * ({ k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '').toLowerCase()] || 1));
};
const ageOf = (id) => (now - Number(BigInt(id) >> 32n)) / 86400;

// --- performance per (creator, id) -----------------------------------------
const perf = new Map();
for (const h of fs.readdirSync('harvest/grids')) {
  const f = path.join('harvest/grids', h, '_grid.json');
  if (!fs.existsSync(f)) continue;
  const g = JSON.parse(fs.readFileSync(f, 'utf8'));
  for (const it of g.items || []) {
    if (it.kind !== 'photo' || it.pinned || it.ad) continue;
    perf.set(`${h}/${it.id}`, { plays: it.plays, likes: it.likes, age: (now - it.createTime) / 86400 });
  }
}
// his own account: views from the profile grid, age from the post id
const ownProfile = 'harvest/own/hotelmozil/_profile.json';
if (fs.existsSync(ownProfile)) {
  const p = JSON.parse(fs.readFileSync(ownProfile, 'utf8'));
  for (const g of p.grid || []) {
    const id = String(g.url || '').match(/(\d{15,})/)?.[1];
    const v = num(g.views);
    if (id && v) perf.set(`hotelmozil/${id}`, { plays: v, likes: null, age: ageOf(id) });
  }
}

// corpus decks: no plays exist for these, so the outcome is LIKES and it is
// kept in its own column — it measures something different (every one of
// these already cleared 50K likes) and must never be pooled with plays.
const corpusLikes = new Map();
for (const l of fs.readFileSync('harvest/tt-final.jsonl', 'utf8').split(/\r?\n/)) {
  if (!l.trim()) continue;
  let r; try { r = JSON.parse(l); } catch { continue; }
  corpusLikes.set(`corpus:${r.account}/${r.id}`, { plays: r.likes, likes: null, saves: r.saves, age: ageOf(r.id), outcomeIs: 'likes' });
}

// --- coded covers -----------------------------------------------------------
const key = JSON.parse(fs.readFileSync('research/scroll-stop/coding-key.json', 'utf8')).items;
const coded = [];
for (const cf of fs.readdirSync('research/scroll-stop/coded').filter((x) => x.endsWith('.jsonl'))) {
  for (const l of fs.readFileSync(path.join('research/scroll-stop/coded', cf), 'utf8').split(/\r?\n/)) {
    if (!l.trim()) continue;
    const c = JSON.parse(l);
    const k = key[c.code];
    if (!k) continue;
    const pf = perf.get(`${k.creator}/${k.id}`) || corpusLikes.get(`${k.creator}/${k.id}`);
    if (!pf || !pf.plays) continue;
    if (c.topic && c.topic !== 'travel') continue;          // AI and beauty posts are another subject
    if (pf.age < MIN_DAYS) continue;
    coded.push({ ...c, creator: k.creator, id: k.id, ...pf, ...copyFeatures(c.text) });
  }
}

// --- objective pixel measures, split at the median of all covers -------------
// A median split keeps them in the same with/without form as everything else.
// They are not judgements, so they are the strongest evidence of the lot.
const PX = fs.existsSync('research/scroll-stop/cover-pixels.json')
  ? JSON.parse(fs.readFileSync('research/scroll-stop/cover-pixels.json', 'utf8')) : {};
const PXK = ['brightness', 'contrast', 'colourful', 'saturation', 'busy', 'warm', 'skyTop'];
const pxMedian = {};
for (const k of PXK) pxMedian[k] = median(Object.values(PX).map((v) => v[k]).filter(Number.isFinite));
for (const r of coded) {
  const p = PX[r.code];
  if (!p) continue;
  for (const k of PXK) r[`px_${k}`] = p[k] > pxMedian[k] ? 1 : 0;
}

// --- lift within creator ----------------------------------------------------
const byCreator = new Map();
for (const r of coded) (byCreator.get(r.creator) || byCreator.set(r.creator, []).get(r.creator)).push(r);
for (const [, rows] of byCreator) {
  const m = median(rows.map((r) => Math.log10(r.plays)));
  for (const r of rows) r.lift = Math.log10(r.plays) - m;
  const withLikes = rows.filter((r) => r.likes != null);
  if (withLikes.length) {
    const me = median(withLikes.map((r) => Math.log10((r.likes + 1) / r.plays)));
    for (const r of withLikes) r.engage = Math.log10((r.likes + 1) / r.plays) - me;
  }
}

const FEATS = {
  // wording (derived from text)
  question: (r) => r.question, number: (r) => r.number, place: (r) => r.place, warning: (r) => r.warning,
  superlative: (r) => r.superlative, money: (r) => r.money, 'first person': (r) => r.firstPerson,
  you: (r) => r.you, 'list count': (r) => r.listCount, 'quote hook': (r) => r.quote, 'part N': (r) => r.part,
  exclamation: (r) => r.exclaim, 'save CTA': (r) => r.saveCTA, 'short (<=8 words)': (r) => r.short,
  // visual (coded blind)
  person: (r) => r.person, face: (r) => r.face, 'scene: sea': (r) => r.scene === 'sea',
  'scene: city': (r) => r.scene === 'city', 'scene: landmark': (r) => r.scene === 'landmark',
  'scene: collage': (r) => r.scene === 'collage', 'text in top third': (r) => r.textpos === 'top',
  'big headline': (r) => r.big, 'any emoji': (r) => r.emoji > 0, 'emoji row (4+)': (r) => r.emoji >= 4,
  // objective pixels (above the median of all covers)
  'px: bright': (r) => r.px_brightness, 'px: high contrast': (r) => r.px_contrast,
  'px: colourful': (r) => r.px_colourful, 'px: saturated': (r) => r.px_saturation,
  'px: busy': (r) => r.px_busy, 'px: warm': (r) => r.px_warm, 'px: blue on top': (r) => r.px_skyTop,
};

// Two samples that measure different things, reported apart:
//   'plays' — grids with real view counts (reach; the closest to stopping)
//   'likes' — the 50K+ corpus, likes only, every deck already a big winner
const sampleOf = (creator) => (creator.startsWith('corpus:') ? 'likes' : 'plays');
let SAMPLE = 'plays';

function contrast(fn, outcome, resample) {
  let num_ = 0, den = 0, pos = 0, neg = 0, creators = 0, posts = 0;
  for (const [creator, rowsAll] of byCreator) {
    if (sampleOf(creator) !== SAMPLE) continue;
    let rows = rowsAll.filter((r) => Number.isFinite(r[outcome]));
    if (resample) rows = rows.map(() => rows[(Math.random() * rows.length) | 0]);
    const y = rows.filter((r) => fn(r)), n = rows.filter((r) => !fn(r));
    if (y.length < MIN_GROUP || n.length < MIN_GROUP) continue;
    const d = y.reduce((s, r) => s + r[outcome], 0) / y.length - n.reduce((s, r) => s + r[outcome], 0) / n.length;
    const w = Math.min(y.length, n.length);
    num_ += d * w; den += w; creators++; posts += y.length + n.length;
    if (d > 0) pos++; else if (d < 0) neg++;
  }
  return den ? { d: num_ / den, creators, posts, pos, neg } : null;
}

const x = (d) => `x${(10 ** d).toFixed(2)}`;
const RUNS = [
  ['plays', 'lift', 'PLAYS — reach vs the creator\'s own median (grids with view counts)'],
  ['plays', 'engage', 'ENGAGE — likes per impression vs the creator\'s median'],
  ['likes', 'lift', 'LIKES — 50K+ corpus, likes vs the creator\'s own median (no view counts exist)'],
];
const summary = {};
for (const [sample, outcome, title] of RUNS) {
  SAMPLE = sample;
  const cs = [...byCreator.keys()].filter((h) => sampleOf(h) === sample);
  console.log(`\n=== ${title} ===`);
  console.log(`${cs.length} creators, ${cs.reduce((n, h) => n + byCreator.get(h).length, 0)} covers\n`);
  console.log('feature'.padEnd(22) + 'effect'.padStart(8) + '   95% interval          creators agree');
  const res = [];
  for (const [name, fn] of Object.entries(FEATS)) {
    const e = contrast(fn, outcome, false);
    if (!e) continue;
    const bs = [];
    for (let b = 0; b < 300; b++) { const r = contrast(fn, outcome, true); if (r) bs.push(r.d); }
    bs.sort((a, b) => a - b);
    const lo = bs[Math.floor(bs.length * 0.025)], hi = bs[Math.floor(bs.length * 0.975)];
    res.push({ name, ...e, lo, hi });
  }
  res.sort((a, b) => b.d - a.d);
  for (const r of res) {
    const sig = (r.lo > 0 || r.hi < 0) ? ' *' : '';
    console.log(r.name.padEnd(22) + x(r.d).padStart(8) + `   [${x(r.lo)}, ${x(r.hi)}]`.padEnd(22)
      + `  ${r.pos}+ ${r.neg}- of ${r.creators} (n=${r.posts})${sig}`);
  }
  summary[`${sample}/${outcome}`] = res;
}
// --- pooled within-creator estimate, for small clusters ----------------------
// Most corpus creators have 3-4 decks, so "3 on each side" keeps almost none.
// Lift is already centred on each creator's own median, so every post's lift
// is a within-creator deviation; pooling them across all creators in which the
// feature VARIES is the fixed-effects estimate. The interval resamples whole
// creators, so one prolific account cannot carry the result.
function pooled(fn, sample, outcome) {
  const groups = [];
  for (const [creator, rows0] of byCreator) {
    if (sampleOf(creator) !== sample) continue;
    const rows = rows0.filter((r) => Number.isFinite(r[outcome]));
    const y = rows.filter((r) => fn(r)), n = rows.filter((r) => !fn(r));
    if (!y.length || !n.length) continue;
    groups.push({ y: y.map((r) => r[outcome]), n: n.map((r) => r[outcome]) });
  }
  const est = (gs) => {
    let sy = 0, cy = 0, sn = 0, cn = 0, pos = 0;
    for (const g of gs) {
      sy += g.y.reduce((s, v) => s + v, 0); cy += g.y.length;
      sn += g.n.reduce((s, v) => s + v, 0); cn += g.n.length;
      const d = g.y.reduce((s, v) => s + v, 0) / g.y.length - g.n.reduce((s, v) => s + v, 0) / g.n.length;
      if (d > 0) pos++;
    }
    return { d: sy / cy - sn / cn, cy, cn, pos };
  };
  if (groups.length < 5) return null;
  const e = est(groups);
  const bs = [];
  for (let b = 0; b < 600; b++) bs.push(est(groups.map(() => groups[(Math.random() * groups.length) | 0])).d);
  bs.sort((a, b) => a - b);
  return { ...e, creators: groups.length, lo: bs[15], hi: bs[584] };
}

for (const [sample, outcome, title] of [
  ['likes', 'lift', 'POOLED — corpus likes, every creator where the feature varies (bootstrap over creators)'],
  ['plays', 'lift', 'POOLED — plays, same method'],
]) {
  console.log(`\n=== ${title} ===\n`);
  console.log('feature'.padEnd(22) + 'effect'.padStart(8) + '   95% interval (creators)   with/without   creators where it won');
  const res = [];
  for (const [name, fn] of Object.entries(FEATS)) {
    const r = pooled(fn, sample, outcome);
    if (r) res.push({ name, ...r });
  }
  res.sort((a, b) => b.d - a.d);
  for (const r of res) {
    const sig = (r.lo > 0 || r.hi < 0) ? ' *' : '';
    console.log(r.name.padEnd(22) + x(r.d).padStart(8) + `   [${x(r.lo)}, ${x(r.hi)}]`.padEnd(27)
      + `${String(r.cy).padStart(4)}/${String(r.cn).padEnd(5)}   ${r.pos} of ${r.creators}${sig}`);
  }
  summary[`pooled:${sample}/${outcome}`] = res;
}

fs.writeFileSync('research/scroll-stop/cover-rows.json', JSON.stringify(coded, null, 1));
fs.writeFileSync('research/scroll-stop/cover-effects.json', JSON.stringify(summary, null, 1));
