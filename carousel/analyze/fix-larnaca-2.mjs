// Second pass on tt-4, from looking at the rendered frames rather than the
// spec. Three things the gates cannot see:
//
//   1. The Stavrovouni tile showed a green hillside village. Pexels has no
//      photograph of that monastery, so a loose query returned generic
//      Cyprus. A `must` forces at least a monastery, and if nothing passes the
//      build says so instead of quietly shipping the wrong place — which is
//      how tt-17's "pools" deck ended up with no pools in it.
//   2. The Zenobia line wrapped and left "מטר" alone on a second line.
//   3. Chirokitia's tile was ambiguous stonework; the query now names what
//      the site actually is.
//
// Photo ids are cleared for the entries being re-queried, so the build goes
// and looks again instead of reusing the locked pick.

import fs from 'node:fs';

const p = 'specs/tt-4-larnaca-20things.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

const QUERY = {
  'stavrovouni monastery cyprus hilltop view': {
    query: 'orthodox monastery on mountain peak greece cyprus',
    must: ['monaster'],
  },
  'ancient stone round huts archaeology cyprus': {
    query: 'neolithic stone round house ruins archaeological site',
    must: ['ruin', 'ancient', 'archaeolog', 'stone'],
  },
};

let n = 0;
for (const s of d.slides) {
  for (const e of (s.images || [])) {
    const swap = QUERY[e.query];
    if (!swap) continue;
    e.query = swap.query;
    e.must = swap.must;
    // Drop the locked pick so the new query is actually searched.
    delete e.id; delete e.file; delete e.url; delete e.keep;
    delete e.alt; delete e.altRaw; delete e.credit;
    n++;
  }
}

// "טבעה ב-1980 בהפלגה הראשונה. 42 מטר" ran to two lines in a 478px column.
for (const s of d.slides) {
  for (const it of (s.items || [])) {
    if (it.name === 'הזנוביה') it.fact = 'טבעה **ב-1980**. 42 מטר עומק';
  }
}

fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
console.log(`${n} queries re-aimed, Zenobia line shortened`);
