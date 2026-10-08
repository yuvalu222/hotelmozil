// Two fixes on the mistakes slide, both visible only by looking at the frame.
//
// 1. The green highlight marks the number on every other row, and here it was
//    sitting on "הכי יקר והכי עמוס" — not a number at all. The line is also
//    better as advice than as a complaint, so it now names the months to come
//    in instead.
// 2. Two thumbnails were searched for items that no longer exist. Renaming an
//    item left its query pointing at the old subject: "positano hotel cliff
//    expensive view" was still being used for "לטוס לרומא", and a generic
//    panorama for "לנסות הכל ביומיים". Nothing catches this — a stale query
//    returns a perfectly good photograph of the wrong thing.

import fs from 'node:fs';

const p = 'specs/tt-26-amalfi.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

const FACT = {
  'לבוא באוגוסט': 'אוגוסט הכי עמוס. **מאי או אוקטובר**',
  'לטוס לרומא': '**נאפולי שעה וחצי**. מרומא ארבע',
};

const QUERY = {
  'positano hotel cliff expensive view': 'naples italy bay vesuvius city view',
  'amalfi coast viewpoint sea panorama': 'amalfi coast hotel terrace evening lights',
};

let f = 0; let q = 0;
for (const s of d.slides) {
  for (const it of (s.items || [])) {
    if (FACT[it.name]) { it.fact = FACT[it.name]; f++; }
  }
  for (const e of (s.images || [])) {
    if (!QUERY[e.query]) continue;
    e.query = QUERY[e.query];
    for (const k of ['id', 'file', 'url', 'keep', 'alt', 'altRaw', 'credit', 'width', 'height', 'source']) {
      delete e[k];
    }
    q++;
  }
}

fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
console.log(`${f} facts rewritten, ${q} stale queries re-aimed`);
