// Point the backdrop queries at places instead of at water.
//
// Every backdrop on both decks was searched with some arrangement of sea,
// water, sky, sunset and horizon. A query like that returns a flat field of
// colour, and blurring one leaves a teal rectangle with no place in it. Two
// rounds of tuning the picker and one round of reducing the blur changed
// nothing, because the ranking was choosing between photographs that were all
// the same thing. The query was the whole problem.
//
// The replacements name something built: a town on a cliff, a street, a
// terrace, a harbour. Blurred, those keep a shape a viewer reads as somewhere.

import fs from 'node:fs';

const QUERIES = {
  'tt-26-amalfi': [
    'positano italy cliffside colorful houses',
    'amalfi coast village houses terraces',
    'ravello italy garden terrace coast view',
    'sorrento italy old town street lemons',
    'amalfi coast town cliff houses evening',
  ],
  'tt-4-larnaca-20things': [
    'larnaca cyprus old town street palm trees',
    'cyprus village stone houses hills',
    'cyprus harbour town boats waterfront',
    'cyprus old stone church village mountains',
    'larnaca cyprus promenade buildings evening',
  ],
};

for (const [id, list] of Object.entries(QUERIES)) {
  const p = `specs/${id}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let k = 0;
  for (const s of d.slides) {
    if (!s.items?.length || !(s.images?.length > 1)) continue;
    const e = s.images[0];
    if (!list[k]) { k++; continue; }
    e.query = list[k++];
    // Release the locked pick, or the build reuses the old photo and the new
    // query is never actually searched.
    for (const key of ['id', 'file', 'url', 'keep', 'alt', 'altRaw', 'credit', 'width', 'height', 'source']) {
      delete e[key];
    }
  }
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  console.log(`${id}: ${k} backdrop queries re-aimed`);
}
