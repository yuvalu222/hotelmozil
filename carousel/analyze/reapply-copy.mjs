// Re-apply the captions, hashtags and cover copy that a concurrent build.js
// run would have reverted. build.js reads a spec at the start and writes the
// whole object back at the end, so anything edited while it runs disappears
// without a word.
//
//   node analyze/reapply-copy.mjs
import fs from 'node:fs';
const keep = JSON.parse(fs.readFileSync('research/pending-copy.json', 'utf8'));
for (const [id, k] of Object.entries(keep)) {
  const p = `specs/${id}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const f of ['caption', 'hashtags', 'place', 'demonstrates']) {
    if (k[f] !== undefined && JSON.stringify(d[f]) !== JSON.stringify(k[f])) { d[f] = k[f]; n++; }
  }
  for (const [f, v] of Object.entries(k.cover || {})) {
    if (v !== undefined && d.slides[0][f] !== v) { d.slides[0][f] = v; n++; }
  }
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');
  console.log(`${id.padEnd(22)} ${n ? `${n} field(s) restored` : 'already current'}`);
}
