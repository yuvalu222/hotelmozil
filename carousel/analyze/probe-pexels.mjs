// Ask Pexels what it actually has, BEFORE writing a slide around it.
//
// Pexels matches loosely. "santorini infinity pool caldera" returns six
// Santorini streets and not one pool; "blue lagoon iceland" returns the
// Jokulsarlon GLACIER lagoon, which is ice. A whole deck of pools shipped with
// no pools in it because the queries were written from imagination and only
// checked after rendering.
//
// This prints the photographer's own words for the top results, which is the
// same text `image.must` is matched against in lib/stock.js. If the subject is
// not in these lines, it is not in the photos.
//
//   node analyze/probe-pexels.mjs "query one" "query two" ...

import { searchPexelsBrowser } from '../lib/stock-browser.js';

const qs = process.argv.slice(2);
if (!qs.length) {
  console.log('usage: node analyze/probe-pexels.mjs "a query" ["another"]');
  process.exit(1);
}
for (const q of qs) {
  try {
    const r = await searchPexelsBrowser(q, { perPage: 6 });
    console.log(`\n"${q}" -> ${r.length}`);
    for (const c of r) console.log('   ', (c.altRaw || '(no alt)').slice(0, 64));
  } catch (e) {
    console.log(`\n"${q}" FAILED ${String(e.message).slice(0, 70)}`);
  }
}
process.exit(0);
