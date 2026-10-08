// Mine the captions for the shapes I have been guessing at, and attach a
// number to each.
//
// The outside writing on hooks is all assertion — "curiosity gaps work",
// "negative framing wins" — with no data behind it that applies to travel
// carousels. The harvest has 671 real captions with saves and likes attached,
// so the same questions can be asked of something that actually happened.
//
// The owner's own example is one of the patterns tested here: *"המסלול המושלם
// ל-5 ימים בפריז (מאחת שגרה שם)"* — a duration, a superlative, and a
// credibility claim about who is speaking.
//
//   node analyze/caption-patterns.mjs
//
// A pattern is printed with its n and its lift over the corpus median. Under
// 25 decks it is marked thin and is not a finding.

import fs from 'node:fs';

const rows = fs.readFileSync('harvest/tt-final.jsonl', 'utf8')
  .split('\n').filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter((r) => r && r.likes > 0 && r.saves > 0 && r.caption);

const med = (a) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const sl = (r) => r.saves / r.likes;
const base = med(rows.map(sl));

console.log(`${rows.length} captioned decks · corpus median saves/like ${base.toFixed(3)}\n`);

const PATTERNS = [
  // Who is speaking — the credibility marker in his example.
  ['first person "my / I"', /\b(my|i['’]ve|i have|i|we)\b/i],
  ['"my go-to / my favourite"', /\bmy\s+(go.?to|favou?rite|top|must)\b/i],
  ['speaks as a local / resident', /\b(local|lives? (here|there)|living in|as someone who|i live)\b/i],

  // What is promised.
  ['a duration: "N days / hours"', /\b\d+\s*(day|days|hour|hours|week|weeks|night|nights)\b/i],
  ['the word itinerary / plan / route', /\b(itinerary|plan|route|guide)\b/i],
  ['a count of items: "N things / spots"', /\b\d+\s*(things|spots|places|stops|tips|reasons)\b/i],
  ['money: free / cheap / budget / €$', /\b(free|cheap|budget|affordable|under\s*[€$£]?\d|[€$£]\d)/i],
  ['a superlative', /\b(ultimate|best|perfect|only|must.?(see|do|visit)|top)\b/i],
  ['hidden / secret / nobody', /\b(hidden|secret|underrated|nobody|no one|don['’]?t know)\b/i],

  // How it is framed.
  ['a mistake / warning frame', /\b(mistake|avoid|don['’]?t|never|wrong|regret|scam)\b/i],
  ['an explicit save CTA', /\bsave (this|it|for)\b/i],
  ['a question mark', /\?/],
  ['emoji present', /\p{Extended_Pictographic}/u],
  ['a flag emoji', /\p{RI}\p{RI}/u],
  ['"part N" — a series', /\bpart\s*\d/i],
];

const pad = (s, n) => String(s).padEnd(n);
console.log(`${pad('pattern', 34)} ${'n'.padStart(5)} ${'saves/like'.padStart(11)}  lift`);
const out = [];
for (const [label, re] of PATTERNS) {
  const hit = rows.filter((r) => re.test(r.caption));
  if (!hit.length) continue;
  const m = med(hit.map(sl));
  out.push({ label, n: hit.length, m, lift: m / base });
}
out.sort((a, b) => b.lift - a.lift);
for (const o of out) {
  const thin = o.n < 25 ? '   ← thin' : '';
  const sign = o.lift >= 1 ? '+' : '';
  console.log(`${pad(o.label, 34)} ${String(o.n).padStart(5)} ${o.m.toFixed(3).padStart(11)}  `
    + `${sign}${((o.lift - 1) * 100).toFixed(0)}%${thin}`);
}

// Caption word count, which is the thing I control most directly.
console.log('\nwords in caption');
const buckets = new Map();
for (const r of rows) {
  const w = r.caption.trim().split(/\s+/).length;
  const k = w <= 5 ? 'a. 1-5' : w <= 10 ? 'b. 6-10' : w <= 18 ? 'c. 11-18'
    : w <= 30 ? 'd. 19-30' : 'e. 31+';
  if (!buckets.has(k)) buckets.set(k, []);
  buckets.get(k).push(r);
}
for (const k of [...buckets.keys()].sort()) {
  const g = buckets.get(k);
  console.log(`${pad(k, 34)} ${String(g.length).padStart(5)} ${med(g.map(sl)).toFixed(3).padStart(11)}`);
}
