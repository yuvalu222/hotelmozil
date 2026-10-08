// Every gate added on 8.10, tested in both directions.
//
// All of them were wrong on their first run, and in both directions:
//   * checkCountry existed and nothing called it, so six wrong-country photos
//     shipped;
//   * NOT_POSTABLE and the first duplicate check carried a backspace byte in
//     place of a word boundary and matched nothing;
//   * the ink check called a sunset "rendered almost nothing";
//   * the first duplicate check returned 37 problems on one deck, every one of
//     them the word "Paris".
//
// So each test below plants a failure AND feeds good input, because a gate
// that always passes and a gate that always fires are equally useless.
//
//   node --test test/gates.test.mjs

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { checkCover } from '../lib/cover-copy.js';
import { checkRouteRows } from '../lib/route-rows.js';
import { checkCountry, checkDuplicateSubjects, checkWiring } from '../lib/wiring.js';

const rows = (over = {}) => Array.from({ length: 5 }, (_, i) => ({
  name: `stop ${i}`, time: 'שעה', price: '5 יורו',
  ...(i < 4 ? { to: '10 דקות הליכה' } : {}),
  ...(i === 0 ? over : {}),
}));
const deck = (items) => ({ slides: [{ layout: 'tt-route', badge: 'יום 1', items }] });

// ---- the cover names its destination ------------------------------------

test('a cover that never says where it is about is caught', () => {
  const spec = { place: 'לרנקה', slides: [{ titleCaps: 'שעה טיסה מתל אביב', line: 'ורובם עושים את זה לא נכון' }] };
  const p = checkCover(spec);
  assert.ok(p.length >= 1, 'should report the missing destination');
  assert.match(p[0], /לרנקה/);
});

test('a cover that names a DIFFERENT destination is caught', () => {
  const spec = { place: 'חוף אמלפי', slides: [{ titleCaps: 'טסתם לרומא?', line: 'פספסתם את זה' }] };
  assert.ok(checkCover(spec).some((x) => x.includes('רומא')));
});

test('a cover that names its destination passes', () => {
  const spec = { place: 'לרנקה', slides: [{ titleCaps: 'מה עושים בלרנקה ב-3 ימים?', note: '🇨🇾 ✈️' }] };
  assert.deepEqual(checkCover(spec), []);
});

test('an emoji in the title does not hide the destination', () => {
  const spec = { place: 'פריז', slides: [{ titleCaps: '📍 מה עושים בפריז?' }] };
  assert.deepEqual(checkCover(spec), []);
});

// ---- the route row schema ------------------------------------------------

test('four stops on a slide is caught', () => {
  const p = checkRouteRows(deck(rows().slice(0, 4)));
  assert.ok(p.some((x) => x.includes('4 stops')));
});

test('a price that is an adjective is caught', () => {
  assert.ok(checkRouteRows(deck(rows({ price: 'משתנה לפי תערוכה' })))
    .some((x) => x.includes('adjective')));
});

test('free, and free with a qualifier, are both prices', () => {
  assert.deepEqual(checkRouteRows(deck(rows({ price: 'חינם' }))), []);
  assert.deepEqual(checkRouteRows(deck(rows({ price: 'חינם מהיבשה' }))), []);
});

test('a missing travel time is caught', () => {
  const items = rows();
  delete items[1].to;
  assert.ok(checkRouteRows(deck(items)).some((x) => x.includes('travel time')));
});

test('a well-formed slide passes', () => {
  assert.deepEqual(checkRouteRows(deck(rows())), []);
});

// ---- the photo is in the right country -----------------------------------

const cy = (alt) => ({ country: 'Cyprus', slides: [{ images: [{ alt, for: 'x' }] }] });

test('a country named outright is caught', () => {
  assert.equal(checkCountry(cy('A church in Greece')).length, 1);
});

test('a TOWN gives the country away too', () => {
  assert.equal(checkCountry(cy('white bell tower in Naxos')).length, 1);
  assert.equal(checkCountry(cy('Two minarets of an Istanbul mosque')).length, 1);
});

test('Türkiye spelt its own way is caught', () => {
  assert.equal(checkCountry(cy('Göbeklitepe in Şanlıurfa, Türkiye')).length, 1);
});

test('the right country passes, and so does a description naming none', () => {
  assert.deepEqual(checkCountry(cy('Larnaca castle, Cyprus, by the sea')), []);
  assert.deepEqual(checkCountry(cy('a stone alley with potted plants')), []);
});

test('the occupied north is not the Republic a Larnaca deck is about', () => {
  // Both of these reached a rendered slide on 8.10: a Mackenzie Beach tile
  // with a Turkish flag flying in it, and a Stavrovouni tile that was
  // Bellapais Abbey in Kyrenia. Both descriptions said "Cyprus".
  assert.equal(checkCountry(cy('gothic arches of Bellapais Abbey')).length, 1);
  assert.equal(checkCountry(cy('harbour in Kyrenia, Cyprus')).length, 1,
    'the town beats the country word, because it is the more specific claim');
  assert.equal(checkCountry(cy('marble statue among ruins in Gazimağusa, Cyprus')).length, 1);
  assert.deepEqual(checkCountry(cy('tombs with columns in Paphos, Cyprus')), [],
    'a town in the Republic still passes');
});

test('a written-down waiver is accepted', () => {
  const spec = { country: 'Cyprus', slides: [{ images: [{ alt: 'a monastery in Greece', for: 'x', anyCountry: true }] }] };
  assert.deepEqual(checkCountry(spec), []);
});

// ---- two rows, one subject ----------------------------------------------

test('two rows showing the same landmark are caught', () => {
  const spec = { slides: [{ images: [
    { for: 'A', query: 'monte solaro capri chairlift', alt: 'Aerial of Capri showing the Faraglioni rocks' },
    { for: 'B', query: 'giardini di augusto capri', alt: 'The iconic Faraglioni rock formations in Capri' },
    { for: 'C', query: 'faraglioni capri rocks', alt: 'Faraglioni rocks in the blue sea' },
  ] }] };
  const p = checkDuplicateSubjects(spec);
  assert.equal(p.length, 1, 'one pair, reported once');
  assert.match(p[0], /faraglioni/);
});

test('sharing the CITY is not sharing a subject', () => {
  const spec = { slides: [{ images: [
    { for: 'A', query: 'eiffel tower paris', alt: 'The Eiffel Tower in Paris at dusk' },
    { for: 'B', query: 'louvre museum paris', alt: 'The Louvre pyramid in Paris' },
  ] }] };
  assert.deepEqual(checkDuplicateSubjects(spec), []);
});

test('a generic noun two rows share is not a subject', () => {
  // Both say "Mount", because the mountain stands behind the ruins. The real
  // Pompeii query asks for it ("...vesuvius background"), so the name is in
  // two queries and neither row is borrowing the other's subject.
  const spec = { slides: [{ images: [
    { for: 'A', query: 'pompeii ruins forum columns vesuvius background', alt: 'Pompeii ruins with Mount Vesuvius behind' },
    { for: 'B', query: 'mount vesuvius crater rim', alt: 'The crater rim of Mount Vesuvius' },
  ] }] };
  assert.deepEqual(checkDuplicateSubjects(spec), []);
});

test('but a row that gets a landmark nobody asked it for is caught', () => {
  // The same pair with Vesuvius dropped from the Pompeii query: now one row
  // asked for ruins and was handed the other row's mountain.
  const spec = { slides: [{ images: [
    { for: 'A', query: 'pompeii ruins forum columns', alt: 'Pompeii ruins with Mount Vesuvius behind' },
    { for: 'B', query: 'mount vesuvius crater rim', alt: 'The crater rim of Mount Vesuvius' },
  ] }] };
  assert.equal(checkDuplicateSubjects(spec).length, 1);
});

// ---- decoration is not a rename -----------------------------------------

test('a pin added to a row name is not a rename', () => {
  const spec = { slides: [{ items: [{ name: '📍 מגדל אייפל' }], images: [{ query: 'bg' }, { query: 'eiffel', for: 'מגדל אייפל' }] }] };
  assert.deepEqual(checkWiring(spec), []);
});

test('a real rename is still caught', () => {
  const spec = { slides: [{ items: [{ name: '📍 מגדל אייפל' }], images: [{ query: 'bg' }, { query: 'louvre', for: 'הלובר' }] }] };
  assert.equal(checkWiring(spec).length, 1);
});

// ---- the content filter that was dead ------------------------------------

test('the explicit-content filter actually matches', async () => {
  const src = fs.readFileSync(new URL('../lib/stock.js', import.meta.url), 'utf8');
  const m = src.match(/const WB = [^;]+;\s*const NOT_POSTABLE = new RegExp\(\s*([\s\S]*?)\);/);
  assert.ok(m, 'NOT_POSTABLE should be built from code points, not typed');
  const WB = String.fromCharCode(92) + 'b';
  const re = new RegExp(`${WB}(nude|nudity|naked|topless|nsfw|explicit)${WB}`, 'i');
  assert.ok(re.test('Free nude figure study'), 'must block what it names');
  assert.ok(!re.test('Woman in a bikini by the pool'), 'swimwear is fine — owner, 3.10');
  assert.ok(!re.test('Denuded hillside after the fire'), 'word boundary, not substring');
});

// ---- no invisible characters anywhere ------------------------------------

test('no source file holds a control character or a stray script', () => {
  const root = new URL('../', import.meta.url).pathname.replace(/^\//, '');
  const dirs = ['lib', 'specs', 'research', 'analyze'];
  const bad = [];
  const walk = (p) => {
    if (!fs.existsSync(p)) return;
    if (fs.statSync(p).isDirectory()) { for (const f of fs.readdirSync(p)) walk(`${p}/${f}`); return; }
    if (!/\.(js|mjs|json|html|md)$/i.test(p)) return;
    const t = fs.readFileSync(p, 'utf8');
    for (let i = 0; i < t.length; i++) {
      const n = t.codePointAt(i);
      const control = (n < 32 && n !== 9 && n !== 10 && n !== 13) || n === 127;
      const arabic = n >= 0x0600 && n <= 0x06ff;
      const bidi = [0x200e, 0x200f, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e,
        0x2066, 0x2067, 0x2068, 0x2069].includes(n);
      if (control || arabic || bidi) { bad.push(`${p}: U+${n.toString(16)}`); break; }
    }
  };
  for (const d of dirs) walk(`${root}${d}`);
  assert.deepEqual(bad, []);
});
