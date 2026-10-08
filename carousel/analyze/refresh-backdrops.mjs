// Release the locked backdrop photo on every stack slide so the next build
// re-picks it with the current ranking.
//
// Photos are deliberately locked into the spec so a rebuild does not re-roll
// the whole deck — that lock is what stopped five decks shuffling their images
// on every build. But it also means a change to the PICKER has no effect until
// the lock is released, which is why two rounds of backdrop tuning produced an
// identical flat teal frame: the build never re-asked.
//
// Only entry 0 of a stack slide is touched. That is the backdrop; entries 1..n
// are the thumbnails, which are correct and stay exactly as they are.
//
//   node analyze/refresh-backdrops.mjs <spec-id> [spec-id ...]

import fs from 'node:fs';

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('name the specs to refresh');
  process.exit(1);
}

for (const id of ids) {
  const p = `specs/${id}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const s of d.slides) {
    // A stack slide is the one with items and several image entries; the
    // cover has a single photo and is left alone.
    if (!s.items?.length || !(s.images?.length > 1)) continue;
    const e = s.images[0];
    for (const k of ['id', 'file', 'url', 'keep', 'alt', 'altRaw', 'credit', 'width', 'height', 'source']) {
      delete e[k];
    }
    n++;
  }
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  console.log(`${id}: ${n} backdrop(s) released`);
}
