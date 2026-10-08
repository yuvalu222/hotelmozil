// Tests for the photo-wiring check. The failure it guards against shipped
// twice in one session and neither gate nor eye caught it from the spec: a
// renamed row keeps the old query, and the search returns a good photograph
// of the wrong subject.
//
//   npm test

import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { checkWiring } from '../lib/wiring.js';

test('a renamed row is caught', () => {
  const p = checkWiring({ slides: [{
    title: 'מה לא לעשות',
    items: [{ name: 'לטוס לרומא' }, { name: 'לנסות הכל ביומיים' }],
    images: [
      { query: 'backdrop' },
      { query: 'positano hotel cliff expensive view', for: 'לישון בפוזיטאנו בתקציב' },
      { query: 'q2', for: 'לנסות הכל ביומיים' },
    ],
  }] });
  assert.equal(p.length, 1);
  assert.ok(p[0].includes('לישון בפוזיטאנו בתקציב'), p[0]);
});

test('a matching deck passes', () => {
  assert.deepStrictEqual(checkWiring({ slides: [{
    items: [{ name: 'א' }, { name: 'ב' }],
    images: [{ query: 'bg' }, { query: 'q1', for: 'א' }, { query: 'q2', for: 'ב' }],
  }] }), []);
});

test('a missing `for` is reported', () => {
  const p = checkWiring({ slides: [{
    items: [{ name: 'א' }],
    images: [{ query: 'bg' }, { query: 'q1' }],
  }] });
  assert.ok(p[0].includes('`for`'), p[0]);
});

test('a count mismatch is reported once, not per row', () => {
  const p = checkWiring({ slides: [{
    items: [{ name: 'א' }, { name: 'ב' }, { name: 'ג' }],
    images: [{ query: 'bg' }, { query: 'q1', for: 'א' }],
  }] });
  assert.equal(p.length, 1);
  assert.ok(p[0].includes('expected 4'), p[0]);
});

test('slides without rows are left alone', () => {
  // Covers and single-photo slides have no row queries to match.
  assert.deepStrictEqual(checkWiring({ slides: [
    { title: 'כריכה', image: { query: 'x' } },
    { items: [{ name: 'א' }] },
  ] }), []);
});

test('both decks being shipped pass', () => {
  const dir = path.join(import.meta.dirname, '..', 'specs');
  for (const id of ['tt-26-amalfi', 'tt-4-larnaca-20things']) {
    const spec = JSON.parse(fs.readFileSync(path.join(dir, `${id}.json`), 'utf8'));
    assert.deepStrictEqual(checkWiring(spec), [], id);
  }
});
