// Rewrite both covers: the copy as a hook rather than a label, and the
// Larnaca cover photograph as something worth stopping for.
//
// THE COPY. Owner, 7.10: "work properly on the text of the first slide, every
// time. For Amalfi it could be something about the best destination in Italy
// you never knew about. Clickbait is super critical."
//
// What was there was a caption, not a hook: "חוף אמלפי / בלי לשרוף את כל
// התקציב" names the place and states a benefit. Nothing is withheld, so there
// is no reason to swipe. The research on carousel covers says the same thing
// from the other side: the first slide is the only one anyone sees before
// deciding, and it has to open a loop — a curiosity gap, a contradiction, or a
// claim that demands the next slide.
//
// Both rewrites use a gap that is also TRUE, which matters because a hook that
// the deck does not pay off is the thing that loses a follower:
//
//   Amalfi  — Israelis overwhelmingly fly to Rome; the coast is four hours
//             from it and an hour and a half from Naples. The cover states
//             the habit and withholds the consequence, and slide 6 pays it off
//             as one of the four mistakes.
//   Larnaca — an hour's flight is the real hook and it was already there, but
//             it was closed off by "and a whole weekend in Cyprus", which
//             answers itself. The gap moves to what people get wrong.
//
// THE PHOTO. He rejected the Larnaca cover specifically: "good saturation, but
// it falls down by being just a photo of rooftops from the street — lots of
// colours but nothing WOW in it. A sunset is always good, the sea is always
// good if it is an impressive photo." The stock description of that frame was
// literally "aerial view of a vibrant alley ... colorful rooftops", so the
// query itself was wrong, not only the ranking.

import fs from 'node:fs';

const COVERS = {
  'tt-26-amalfi': {
    titleCaps: 'רוב הישראלים טסים לרומא',
    line: 'וזה מה שהם מפספסים שעה וחצי משם',
  },
  'tt-4-larnaca-20things': {
    titleCaps: 'שעה טיסה מתל אביב',
    line: 'ורוב האנשים עושים את זה לא נכון',
    // Sunset over the sea with a figure in it, which is what both the owner's
    // rule and the travel-cover research ask for.
    query: 'cyprus beach sunset couple silhouette sea golden',
  },
};

for (const [id, c] of Object.entries(COVERS)) {
  const p = `specs/${id}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  const s = d.slides[0];
  s.titleCaps = c.titleCaps;
  s.line = c.line;
  if (c.query) {
    s.image = { query: c.query };
  }
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  console.log(`${id}: "${c.titleCaps}" / "${c.line}"${c.query ? '  + new cover photo' : ''}`);
}
