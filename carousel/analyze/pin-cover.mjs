// Pin a cover to an exact photograph, chosen by eye off the candidate sheet.
//
// WHY THIS EXISTS. I picked candidate #5 by looking at it — a natural rock
// arch over the sea, and the stock description places it in Larnaca itself —
// and then tried to re-find it by writing a narrower query. The search
// returned a different photo: a rock window onto a hazy town, no sea, no
// light. A query describes a KIND of photo; it cannot name one. Having chosen
// a specific frame, the only honest way to keep it is to write its id down.
//
//   node analyze/pin-cover.mjs <spec-id> <index-in-cover-candidates.json>
//
// Downloads the file into the cache, writes the full resolved entry into the
// spec and marks it `keep`, so no later build re-rolls it.

import fs from 'node:fs';
import path from 'node:path';

const [specId, idxArg] = process.argv.slice(2);
if (!specId || idxArg === undefined) {
  console.log('usage: node analyze/pin-cover.mjs <spec-id> <candidate-index>');
  process.exit(1);
}

const cands = JSON.parse(fs.readFileSync('cover-candidates.json', 'utf8'));
const c = cands[Number(idxArg)];
if (!c) { console.error(`no candidate ${idxArg}`); process.exit(1); }

const CACHE = path.join(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ''), '..', 'cache');
const file = path.join('cache', `${c.id}.jpg`);
if (!fs.existsSync(file)) {
  const res = await fetch(c.url);
  if (!res.ok) { console.error(`download failed: ${res.status}`); process.exit(1); }
  fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  console.log(`downloaded -> ${file}`);
} else {
  console.log(`already cached -> ${file}`);
}

const p = `specs/${specId}.json`;
const d = JSON.parse(fs.readFileSync(p, 'utf8'));
d.slides[0].image = {
  query: c.q,
  id: c.id,
  file,
  url: c.url,
  width: c.width,
  height: c.height,
  alt: c.alt,
  credit: c.credit,
  keep: true,
};
fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
console.log(`${specId} cover pinned to ${c.id}`);
console.log(`  ${(c.alt || '').replace(/^Free /, '')}`);
