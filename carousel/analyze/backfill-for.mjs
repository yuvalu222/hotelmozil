// Stamp each row query with the item it was written for, so the wiring check
// has something to compare against from here on.
//
// This is a backfill, and a backfill blesses whatever is there now. That is
// only honest because both live decks were just checked by eye, frame by
// frame, and the two stale queries found were re-aimed first. Decks that have
// not been looked at are stamped too — the check cannot retroactively prove
// their photos were ever right, only that they stop drifting from here.
//
//   node analyze/backfill-for.mjs            # every spec
//   node analyze/backfill-for.mjs <id> ...   # named specs

import fs from 'node:fs';
import { checkWiring } from '../lib/wiring.js';

const ids = process.argv.slice(2);
const files = ids.length ? ids.map((i) => `${i}.json`)
  : fs.readdirSync('specs').filter((f) => f.endsWith('.json'));

let stamped = 0; let skipped = 0;
for (const f of files) {
  const p = `specs/${f}`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const s of d.slides || []) {
    const items = s.items || [];
    const images = s.images || [];
    // Only slides whose rows and queries line up one to one. Anywhere else the
    // pairing is a guess, and a wrong `for` is worse than none.
    if (!items.length || images.length !== items.length + 1) { skipped++; continue; }
    items.forEach((it, k) => {
      if (images[k + 1].for !== it.name) { images[k + 1].for = it.name; n++; }
    });
  }
  if (n) { fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`); stamped += n; }
  const left = checkWiring(d);
  if (left.length) console.log(`${f}:\n  ${left.join('\n  ')}`);
}
console.log(`${stamped} queries stamped, ${skipped} slide(s) skipped as not one-to-one`);
