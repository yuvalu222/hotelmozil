// What wording makes people click — from randomised experiments, not from
// what happened to go viral.
//
// The Upworthy Research Archive (Matias, Munger, Le Quere, Ebersole 2021,
// Nature Scientific Data) is 32,487 headline A/B tests run 2013-2015, each one
// randomly assigning readers to versions of the same story. Within a test the
// story is fixed and only the package differs, so a difference in click rate
// between arms is caused by the package. That is the thing the TikTok corpus
// can never give: an experiment.
//
// METHOD
//   * only tests where every arm shares one image (eyecatcher_id) — then the
//     arms differ in WORDING alone
//   * each arm's outcome is its log-odds click rate minus its own test's mean,
//     so every story is its own control
//   * a feature's effect = mean centred log-odds of arms WITH it minus arms
//     WITHOUT it, within the same tests; reported as relative change in CTR
//   * bootstrap over TESTS (not arms) for the interval
//   * run on the exploratory file to look, then re-run untouched on the
//     confirmatory file, which is 4x larger and was not looked at first
//
// HONEST LIMITS: English, US, Facebook-era news, a click on a headline. A
// TikTok cover is not clicked; it is stopped at. Where this transfers is the
// wording, not the medium.
//
//   node analyze/upworthy.mjs exploratory|confirmatory

import fs from 'node:fs';

const which = process.argv[2] || 'exploratory';
const file = `research/scroll-stop/upworthy/${which}.csv`;
const raw = fs.readFileSync(file, 'utf8');

// CSV with quoted fields that can hold commas, quotes and line breaks.
function parse(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.length > 1) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const rows = parse(raw);
const head = rows.shift();
const col = Object.fromEntries(head.map((h, i) => [h, i]));
const arms = rows.map((r) => ({
  test: r[col.clickability_test_id],
  headline: r[col.headline] || '',
  img: r[col.eyecatcher_id] || '',
  n: Number(r[col.impressions]),
  k: Number(r[col.clicks]),
})).filter((a) => a.test && a.headline && a.n > 0 && a.k >= 0);

// tests whose arms all share one image and differ in headline
const byTest = new Map();
for (const a of arms) (byTest.get(a.test) || byTest.set(a.test, []).get(a.test)).push(a);
const tests = [...byTest.values()].filter((t) => t.length >= 2
  && new Set(t.map((a) => a.img)).size === 1
  && new Set(t.map((a) => a.headline)).size >= 2);

// centred log-odds per arm
for (const t of tests) {
  for (const a of t) a.lo = Math.log((a.k + 0.5) / (a.n - a.k + 0.5));
  const m = t.reduce((s, a) => s + a.lo, 0) / t.length;
  for (const a of t) a.c = a.lo - m;
}

const words = (s) => s.toLowerCase().match(/[a-z']+/g) || [];
const F = {
  'question mark':          (h) => /\?/.test(h),
  'a number (digit)':       (h) => /\d/.test(h),
  'list: N things/ways':    (h) => /\b\d+\s+(things|ways|reasons|times|people|facts|signs|photos|tips|places|words)\b/i.test(h),
  'you / your':             (h) => /\b(you|your|you're|yourself)\b/i.test(h),
  'I / my / we / our':      (h) => /\b(i|i'm|i've|my|me|we|our|us)\b/i.test(h),
  'negation (not/never/don\'t/no)': (h) => /\b(not|never|don't|doesn't|didn't|can't|won't|no)\b/i.test(h),
  'warning (mistake/stop/wrong)':   (h) => /\b(mistake|mistakes|stop|wrong|avoid|warning|never)\b/i.test(h),
  'money ($/cost/price/free)':      (h) => /\$|\b(cost|costs|price|cheap|free|money|dollars|paid|pay)\b/i.test(h),
  'superlative (best/worst/most)':  (h) => /\b(best|worst|most|least|greatest|biggest|perfect|ever)\b/i.test(h),
  'curiosity (this/here\'s/what happened)': (h) => /\b(this|these|here's|what happened|the reason|why)\b/i.test(h),
  'exclamation mark':       (h) => /!/.test(h),
  'quotation in it':        (h) => /["'“”‘’]/.test(h.replace(/\b\w+'\w+\b/g, '')),
  'ALL-CAPS word':          (h) => /\b[A-Z]{3,}\b/.test(h),
  'short (<= 10 words)':    (h) => words(h).length <= 10,
  'long (>= 18 words)':     (h) => words(h).length >= 18,
  // structural choices that map onto a two-line cover (added 8.10, second pass)
  'number LEADS the line':  (h) => /^\s*["'“]?\d/.test(h),
  'number but not leading': (h) => /\d/.test(h) && !/^\s*["'“]?\d/.test(h),
  'two-part (colon/dash)':  (h) => /[:—–]|\s-\s/.test(h),
  'imperative opener':      (h) => /^\s*["'“]?(don't|do not|stop|never|watch|look|read|meet|see|try|get|make|take|imagine|forget)\b/i.test(h),
  'starts with "this/these"': (h) => /^\s*["'“]?(this|these)\b/i.test(h),
  'ends with "..." (trail-off)': (h) => /(\.\.\.|…)\s*["'”]?\s*$/.test(h),
};

// within-test contrast: tests where the feature varies across arms
function effect(fn, sampleTests) {
  let sum = 0, cnt = 0;
  for (const t of sampleTests) {
    const yes = t.filter((a) => fn(a.headline));
    const no = t.filter((a) => !fn(a.headline));
    if (!yes.length || !no.length) continue;
    const my = yes.reduce((s, a) => s + a.c, 0) / yes.length;
    const mn = no.reduce((s, a) => s + a.c, 0) / no.length;
    sum += my - mn; cnt++;
  }
  return cnt ? { d: sum / cnt, n: cnt } : { d: NaN, n: 0 };
}

function boot(fn, B = 400) {
  const relevant = tests.filter((t) => {
    const y = t.some((a) => fn(a.headline)); const n = t.some((a) => !fn(a.headline));
    return y && n;
  });
  const ds = [];
  for (let b = 0; b < B; b++) {
    const s = [];
    for (let i = 0; i < relevant.length; i++) s.push(relevant[(Math.random() * relevant.length) | 0]);
    ds.push(effect(fn, s).d);
  }
  ds.sort((x, y) => x - y);
  return [ds[Math.floor(B * 0.025)], ds[Math.floor(B * 0.975)]];
}

const pct = (d) => `${d >= 0 ? '+' : ''}${((Math.exp(d) - 1) * 100).toFixed(1)}%`;
console.log(`${which}: ${arms.length} arms, ${tests.length} headline-only tests (one image, 2+ headlines)\n`);
console.log('feature'.padEnd(40) + 'tests'.padStart(7) + '   CTR effect   95% interval');
const out = {};
for (const [name, fn] of Object.entries(F)) {
  const e = effect(fn, tests);
  if (e.n < 30) { console.log(name.padEnd(40) + String(e.n).padStart(7) + '   too few'); continue; }
  const [lo, hi] = boot(fn);
  const sig = (lo > 0 || hi < 0) ? '  *' : '';
  console.log(name.padEnd(40) + String(e.n).padStart(7) + `   ${pct(e.d).padStart(7)}   [${pct(lo)}, ${pct(hi)}]${sig}`);
  out[name] = { tests: e.n, effect: e.d, lo, hi };
}
fs.writeFileSync(`research/scroll-stop/upworthy/result-${which}.json`, JSON.stringify(out, null, 1));
console.log('\n* = interval excludes zero');
