// What WORKS, not what to avoid: the track record of each cover template.
//
// Owner, 8.10: "understand exactly what works and invent zero. Just take
// what works." Feature effects (a question costs X%, a number adds Y%) are
// not that — assembling a new sentence out of measured features is still a
// sentence nobody tested. A TEMPLATE is a whole wording pattern that real
// covers used. Its record is how often a cover in that pattern beat its OWN
// creator's median, across how many different creators.
//
// A template "works" when it wins repeatedly, for several creators, and the
// cover we make is then the template's best real example with only the
// destination changed.
//
// Templates are fixed regexes, English and Hebrew, so a cover's template is
// assigned by rule and not by my reading of it.
//
//   node analyze/templates.mjs

import fs from 'node:fs';

const T = {
  'mistakes / what not to do': /\b(what not to|mistakes?|avoid|don'?t (make|do|take|go)|regret|never do|things you should never|wish i'?d skipped|tourist traps?)\b|שאסור|אל תטוסו|אל תסגרו|טעויות/i,
  'how to plan (first-timers)': /\bhow to (plan|prep)|first[- ]?tim(er|ers)|first trip|1st trip|first few hours/i,
  'N things / places to do in X': /\b\d+\s+(fun\s+)?(things|places|activities|beaches|areas|day trips)\b.*\b(to do|to visit|in)\b|\d+\s*(דברים|מקומות)|places (to visit|you need to visit)|things to do in/i,
  'underrated / hidden / niche': /\b(underrated|hidden gems?|niche|less[- ]known|lesser[- ]known|never heard of|less[- ]travell?ed|beyond the islands)\b|עוד לא יודעים/i,
  'what it costs': /\b(cost|costs|how much|\$\d+|£\d+|budget|cheapest|save money|money[- ]saving|expensive)\b|כמה עלה|כמה עלו|חסכ/i,
  'guide / ultimate / everything': /\b(guide|ultimate|everything you need|need to know|essentials)\b|המדריך/i,
  'hard truth / dark side': /\b(truth|dark side|hard reality|horrible|terrifying)\b/i,
  'going to X? here\'s where': /going to .*\?|here'?s where to go/i,
  'best / recommendations': /\b(best|recommendations?|recs|top)\b|המלצות|הכי שוות|הכי טובות/i,
  'itinerary / route / N days': /\b(itinerary|itineraries|route|\d+\s*days?|\d+-weeks?|walking)\b|המסלול|ימים/i,
  'I wish I knew (quote)': /\bwish i knew\b/i,
  'shopping (apps/brands/stores)': /\b(apps?|brands?|stores?|shops?|konbini|supermarkets?|souvenirs?|snacks?|shoes)\b|סבן אילבן|ספורה/i,
};

const R = JSON.parse(fs.readFileSync('research/scroll-stop/cover-rows.json', 'utf8'))
  .filter((r) => r.text && r.text.trim() && Number.isFinite(r.lift));
const by = {};
for (const r of R) (by[r.creator] = by[r.creator] || []).push(r);
// only creators with enough covers for "beat its own median" to mean anything
const rows = R.filter((r) => by[r.creator].length >= 4);

const median = (a) => { const s = [...a].sort((x, y) => x - y); const k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };
const out = [];
for (const [name, re] of Object.entries(T)) {
  const hit = rows.filter((r) => re.test(r.text.replace(/\s*\/\s*/g, ' ')));
  if (!hit.length) continue;
  const creators = new Set(hit.map((r) => r.creator));
  const winsByCreator = {};
  for (const r of hit) {
    winsByCreator[r.creator] = winsByCreator[r.creator] || { w: 0, n: 0 };
    winsByCreator[r.creator].n++;
    if (r.lift > 0) winsByCreator[r.creator].w++;
  }
  // a creator "endorses" the template when most of its covers in it beat
  // that creator's median
  const endorse = Object.values(winsByCreator).filter((v) => v.w / v.n > 0.5).length;
  const best = [...hit].sort((a, b) => b.lift - a.lift)[0];
  out.push({
    name, covers: hit.length, creators: creators.size, endorse,
    winRate: hit.filter((r) => r.lift > 0).length / hit.length,
    median: median(hit.map((r) => r.lift)),
    best: { text: best.text, creator: best.creator, x: 10 ** best.lift },
  });
}
out.sort((a, b) => (b.endorse - a.endorse) || (b.median - a.median));
console.log(`${rows.length} covers from ${new Set(rows.map((r) => r.creator)).size} creators with 4+ covers each\n`);
console.log('template'.padEnd(32) + 'covers  creators  won-for   beat own median   typical');
for (const t of out) {
  console.log(t.name.padEnd(32) + String(t.covers).padStart(5) + String(t.creators).padStart(9)
    + `   ${t.endorse} of ${t.creators}`.padEnd(10) + `   ${(t.winRate * 100).toFixed(0).padStart(3)}%`.padEnd(18)
    + `x${(10 ** t.median).toFixed(2)}`);
}
console.log('\nbest real example of each template:');
for (const t of out) {
  console.log(`  ${t.name.padEnd(32)} x${t.best.x.toFixed(1).padEnd(6)} @${t.best.creator.replace('corpus:', '').padEnd(20)} ${t.best.text.replace(/\s*\/\s*/g, ' / ').slice(0, 70)}`);
}
fs.writeFileSync('research/scroll-stop/templates.json', JSON.stringify(out, null, 1));
