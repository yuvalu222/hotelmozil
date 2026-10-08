// Measure the corpus on everything that was harvested and never looked at.
//
// The harvest stores comments, shares, the sound and whether it is original,
// the hashtag list and the full caption — for every deck. Until now the only
// number ever used was saves per like. Several of the open questions in
// research/GAPS.md can be answered from data already on disk:
//
//   sound      — does an original sound beat a trending one (gap 22)
//   hashtags   — is the cap of 5 I enforce supported by anything (gap 23)
//   caption    — length, and whether it opens with a number or a question
//   length     — slides per deck, re-checked on the larger corpus
//   metrics    — shares and comments, which were never read at all (gap 30)
//
//   node analyze/corpus-stats.mjs
//
// Reporting rule: a bucket under 25 decks is printed with its n and marked
// thin, never quoted as a finding. The last time a split looked decisive it
// was restriction of range, and that cost a rebuilt picker.

import fs from 'node:fs';

const rows = fs.readFileSync('harvest/tt-final.jsonl', 'utf8')
  .split('\n').filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter((r) => r && r.likes > 0 && r.saves > 0);

console.log(`${rows.length} decks with both numbers\n`);

const med = (a) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const sl = (r) => r.saves / r.likes;

function bucket(label, keyFn, order) {
  const groups = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (k === null || k === undefined) continue;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }
  const keys = order ? order.filter((k) => groups.has(k)) : [...groups.keys()].sort();
  console.log(`\n=== ${label} ===`);
  console.log(`${'bucket'.padEnd(22)} ${'n'.padStart(5)} ${'saves/like'.padStart(11)} ${'shares/like'.padStart(12)} ${'comments/like'.padStart(14)}`);
  for (const k of keys) {
    const g = groups.get(k);
    const thin = g.length < 25 ? '  ← thin, not a finding' : '';
    console.log(`${String(k).padEnd(22)} ${String(g.length).padStart(5)} `
      + `${med(g.map(sl)).toFixed(3).padStart(11)} `
      + `${med(g.filter((r) => r.shares).map((r) => r.shares / r.likes)).toFixed(3).padStart(12)} `
      + `${med(g.filter((r) => r.comments).map((r) => r.comments / r.likes)).toFixed(4).padStart(14)}${thin}`);
  }
}

// Corpus baseline, so every bucket can be read against something.
console.log(`corpus median saves/like  ${med(rows.map(sl)).toFixed(3)}`);
console.log(`corpus median shares/like ${med(rows.filter((r) => r.shares).map((r) => r.shares / r.likes)).toFixed(3)}`);
console.log(`corpus median comments/like ${med(rows.filter((r) => r.comments).map((r) => r.comments / r.likes)).toFixed(4)}`);

bucket('sound: original vs trending', (r) => (
  r.soundIsOriginal === true ? 'original' : r.soundIsOriginal === false ? 'trending / licensed' : null
), ['trending / licensed', 'original']);

bucket('hashtag count', (r) => {
  const n = (r.hashtags || []).length;
  if (!n) return '0';
  if (n <= 3) return '1-3';
  if (n <= 5) return '4-5';
  if (n <= 8) return '6-8';
  if (n <= 12) return '9-12';
  if (n <= 20) return '13-20';
  return '21+';
}, ['0', '1-3', '4-5', '6-8', '9-12', '13-20', '21+']);

bucket('caption length (chars)', (r) => {
  const n = (r.caption || '').length;
  if (n < 30) return 'a. under 30';
  if (n < 70) return 'b. 30-69';
  if (n < 120) return 'c. 70-119';
  if (n < 220) return 'd. 120-219';
  return 'e. 220+';
});

bucket('slides per deck', (r) => {
  const n = r.slideCount || (r.files || []).length;
  if (!n) return null;
  if (n <= 5) return 'a. 2-5';
  if (n <= 7) return 'b. 6-7';
  if (n <= 9) return 'c. 8-9';
  if (n <= 13) return 'd. 10-13';
  if (n <= 20) return 'e. 14-20';
  return 'f. 21+';
});

// Caption openers. The question is whether the shapes I have been guessing at
// — a number, a superlative, a question, shouting — show up in the numbers.
const cap = (r) => (r.caption || '').trim();
bucket('caption opens with', (r) => {
  const c = cap(r);
  if (!c) return 'nothing';
  if (/^\d/.test(c)) return 'a number';
  if (/^(the\s+)?(ultimate|best|perfect|only|most)\b/i.test(c)) return 'a superlative';
  if (/\?/.test(c.slice(0, 60))) return 'a question';
  if (/^[A-Z][A-Z\s!]{8,}/.test(c)) return 'ALL CAPS';
  if (/^(how|what|why|where|when)\b/i.test(c)) return 'how/what/why';
  return 'something else';
});

// Does the caption name a place in the first few words? The route decks do.
bucket('caption names a place early', (r) => {
  const c = cap(r).slice(0, 48);
  return /\b(in|to|of)\s+[A-Z]/.test(c) || /^[A-Z][a-z]+\s*[:\-–]/.test(c) ? 'yes' : 'no';
}, ['yes', 'no']);
