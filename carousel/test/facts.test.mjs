// Tests for the copy gate. Every case below is a bug that actually shipped or
// actually fired falsely during the hour the gate was written — nothing here
// is hypothetical.
//
//   node --test test/
//
// The gate's job is narrow: stop a deck whose facts are adjectives instead of
// figures. Hebrew makes that harder than it sounds, and the four bugs that
// matter are all boundary bugs. Without these tests they come straight back.

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { checkFacts } from '../lib/facts.js';

const SPECS = path.join(import.meta.dirname, '..', 'specs');

/** A slide where only the first fact is under test; the other two are padding
 *  that carries figures, so a figure-count problem never masks a hedge one. */
const one = (fact) => ({
  slides: [{ items: [{ name: 'x', fact }, { name: 'y', fact: '**10 יורו**' }, { name: 'z', fact: '**3 ק״מ**' }] }],
});
const hedged = (fact) => checkFacts(one(fact)).some((p) => p.includes('placeholder'));
const sparse = (fact) => checkFacts(one(fact)).some((p) => p.includes('carry a figure'));

test('a hedge is caught', () => {
  assert.ok(hedged('כניסה בכמה אירו'), 'בכמה אירו');
  assert.ok(hedged('כניסה בכמה יורו'), 'the other Hebrew spelling of euro');
  assert.ok(hedged('הנוף המרהיב'), 'a hedge wearing a ה prefix is still the hedge');
  assert.ok(hedged('בערך שעה'), 'בערך');
  assert.ok(hedged('יום שלם'), 'a duration that is not a duration');
});

test('a word merely spelled like a hedge is spared', () => {
  // The first false positive the gate produced. "כמעט" contains "מעט".
  assert.ok(!hedged('כמעט 5 דקות'), 'כמעט');
  assert.ok(!hedged('**10 יורו** לכניסה'), 'a plain price');
});

test('Hebrew figures count as figures', () => {
  // The gate knew digits and cardinals only, so it under-counted five real
  // facts across tt-4 and reported slides that were fine.
  assert.ok(!sparse('פלמינגו נובמבר עד מרץ'), 'a month answers "when"');
  assert.ok(!sparse('כנסייה מהמאה התשיעית'), 'an ordinal is a figure');
  assert.ok(!sparse('**חצי שעה** על הים'), 'חצי');
  assert.ok(!sparse('**7.8 ק״מ**. חינם'), 'free is the strongest price');
});

test('a slide of adjectives fails', () => {
  const p = checkFacts({ slides: [{ title: 'ט', items: [
    { name: 'a', fact: 'ממש שווה' }, { name: 'b', fact: 'נוף יפה' },
    { name: 'c', fact: 'אווירה טובה' }, { name: 'd', fact: 'כדאי מאוד' },
  ] }] });
  assert.ok(p.some((x) => x.includes('carry a figure')));
});

test('one figure-free rule of thumb is allowed', () => {
  // "כל מדרגה מהחוף מורידה מחיר" is a real rule with no number to give. The
  // gate must not force a figure onto it.
  const p = checkFacts({ slides: [{ items: [
    { name: 'a', fact: '**10 יורו**' }, { name: 'b', fact: '**3 ק״מ**' },
    { name: 'c', fact: '**חינם**' }, { name: 'd', fact: 'כל מדרגה מהחוף מורידה מחיר' },
  ] }] });
  assert.deepStrictEqual(p, []);
});

test('the same figure on two slides is caught', () => {
  // "1,500 מדרגות" shipped on two tt-26 slides. He has caught this class by
  // eye before: "יש פעמים ששמת משפט פעמיים".
  const p = checkFacts({ slides: [
    { items: [{ name: 'a', fact: '**1,500 מדרגות**' }] },
    { items: [{ name: 'b', fact: '**1,500 מדרגות** לפוזיטאנו' }] },
  ] });
  assert.ok(p.some((x) => x.includes('1,500')));
  // A one-digit collision is coincidence, not repetition.
  assert.deepStrictEqual(checkFacts({ slides: [
    { items: [{ name: 'a', fact: 'יום 1 בבוקר' }] },
    { items: [{ name: 'b', fact: 'קו 1 מהנמל' }] },
  ] }), []);
  // Nor is the same number in a different unit. "23-30 יורו" was split into
  // 23 and 30, and the 30 then collided with "30 אחוז" on another slide.
  assert.deepStrictEqual(checkFacts({ slides: [
    { items: [{ name: 'a', fact: 'מעבורת **23-30 יורו** לכיוון' }] },
    { items: [{ name: 'b', fact: '**30 אחוז** אלכוהול' }] },
  ] }), []);
});

test('both item shapes are understood', () => {
  // The older guide decks list items as plain strings. Reading those as
  // objects made the gate report "no fact at all" on 27 lines that were fine.
  const p = checkFacts({ slides: [{ items: [
    'נובמבר-פברואר: הכי נוח, חם ויבש',
    'שקע מסוג G, **220 וולט**',
    'סים מקומי **10 יורו** לשבועיים',
  ] }] });
  assert.ok(!p.some((x) => x.includes('no fact at all')), p.join(' | '));
});

test('the deck being shipped passes', () => {
  // A gate nothing passes is a gate that gets switched off.
  const spec = JSON.parse(fs.readFileSync(path.join(SPECS, 'tt-26-amalfi.json'), 'utf8'));
  assert.deepStrictEqual(checkFacts(spec), []);
});
