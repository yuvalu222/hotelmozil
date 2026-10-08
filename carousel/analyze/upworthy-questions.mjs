// Which KIND of question costs clicks?
//
// The archive says a question mark costs ~10% of clicks, replicated on 11,053
// tests. His single most-viewed cover is a question ("how do you get from
// place to place in Thailand?"). Both can be true if the cost sits in one
// kind of question. A practical wh-question promises an answer the viewer
// wants; a rhetorical or yes/no question ("Is this the most beautiful...?")
// withholds and teases. Split them and test each against question-free arms
// of the same story.
//
// Kinds, fixed before running:
//   practical  how / what / where / which / when ... + a concrete subject
//   why        why ...
//   yes-no     starts with is/are/do/does/can/would/should/will/have/did
//   other      any other question
//
//   node analyze/upworthy-questions.mjs exploratory|confirmatory

import fs from 'node:fs';

const which = process.argv[2] || 'exploratory';
const raw = fs.readFileSync(`research/scroll-stop/upworthy/${which}.csv`, 'utf8');
function parse(text) {
  const rows = []; let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; } else field += c; }
    else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); field = ''; if (row.length > 1) rows.push(row); row = []; }
    else field += c;
  }
  return rows;
}
const rows = parse(raw);
const head = rows.shift();
const col = Object.fromEntries(head.map((h, i) => [h, i]));
const arms = rows.map((r) => ({ test: r[col.clickability_test_id], h: r[col.headline] || '', img: r[col.eyecatcher_id] || '',
  n: Number(r[col.impressions]), k: Number(r[col.clicks]) })).filter((a) => a.test && a.h && a.n > 0);
const by = new Map();
for (const a of arms) (by.get(a.test) || by.set(a.test, []).get(a.test)).push(a);
const tests = [...by.values()].filter((t) => t.length >= 2 && new Set(t.map((a) => a.img)).size === 1 && new Set(t.map((a) => a.h)).size >= 2);
for (const t of tests) {
  for (const a of t) a.lo = Math.log((a.k + 0.5) / (a.n - a.k + 0.5));
  const m = t.reduce((s, a) => s + a.lo, 0) / t.length;
  for (const a of t) a.c = a.lo - m;
}

function kind(h) {
  if (!h.includes('?')) return 'none';
  // the clause that carries the question mark
  const q = h.split(/(?<=[.!?])\s+/).find((s) => s.includes('?')) || h;
  const s = q.trim().toLowerCase().replace(/^["'“‘]+/, '');
  if (/^(how|what|where|which|when|who)\b/.test(s)) return 'practical (how/what/where...)';
  if (/^why\b/.test(s)) return 'why';
  if (/^(is|are|do|does|did|can|could|would|should|will|have|has|was|were)\b/.test(s)) return 'yes-no';
  return 'other';
}

const kinds = ['practical (how/what/where...)', 'why', 'yes-no', 'other'];
function effect(k, sample) {
  let sum = 0, cnt = 0;
  for (const t of sample) {
    const y = t.filter((a) => kind(a.h) === k), n = t.filter((a) => kind(a.h) === 'none');
    if (!y.length || !n.length) continue;
    sum += y.reduce((s, a) => s + a.c, 0) / y.length - n.reduce((s, a) => s + a.c, 0) / n.length; cnt++;
  }
  return { d: cnt ? sum / cnt : NaN, n: cnt };
}
const pct = (d) => `${d >= 0 ? '+' : ''}${((Math.exp(d) - 1) * 100).toFixed(1)}%`;
console.log(`${which}: ${tests.length} headline-only tests\n`);
console.log('question kind'.padEnd(34) + 'tests'.padStart(7) + '   vs no question   95% interval');
for (const k of kinds) {
  const e = effect(k, tests);
  if (e.n < 20) { console.log(k.padEnd(34) + String(e.n).padStart(7) + '   too few'); continue; }
  const rel = tests.filter((t) => t.some((a) => kind(a.h) === k) && t.some((a) => kind(a.h) === 'none'));
  const bs = [];
  for (let b = 0; b < 400; b++) { const s = rel.map(() => rel[(Math.random() * rel.length) | 0]); bs.push(effect(k, s).d); }
  bs.sort((a, b) => a - b);
  const lo = bs[10], hi = bs[389];
  console.log(k.padEnd(34) + String(e.n).padStart(7) + `   ${pct(e.d).padStart(8)}        [${pct(lo)}, ${pct(hi)}]${(lo > 0 || hi < 0) ? ' *' : ''}`);
}
