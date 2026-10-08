// Which rendered slides are actually BLACK AND WHITE?
//
// Scope, narrowed after this tool over-flagged: saturation does not measure
// whether a photo is interesting. Calibrated against the decks the owner liked
// and disliked it runs backwards (the deck he called boring scores higher than
// the one he called best), so the only thing it reliably catches is a genuine
// greyscale frame — the Dubai skyline that scored 0.001. At 0.18 it also
// flagged the cream paper memo cards, which are low-saturation BY DESIGN,
// copied from the source. A gate that cries wolf gets ignored, so the
// threshold is set where the signal actually is.
import { saturationOf, closeColourCheck } from '../lib/colourfulness.js';
import fs from 'node:fs';
import path from 'node:path';
const dirs = fs.readdirSync('out').filter((d) => d.startsWith('tt-') && fs.statSync(path.join('out', d)).isDirectory());
let flagged = 0, total = 0;
for (const d of dirs) {
  const files = fs.readdirSync(path.join('out', d)).filter((f) => f.endsWith('-tiktok.jpg')).sort();
  const bad = [];
  for (const f of files) {
    total++;
    const m = await saturationOf(path.join('out', d, f));
    const s = m ? m.sat : null;
    const k = m ? m.contrast : null;
    if (s === null) { bad.push(`${f} COULD-NOT-MEASURE`); flagged++; }
    else if (s < 0.06) { bad.push(`${f} BLACK AND WHITE, sat ${s.toFixed(3)}`); flagged++; }
    else if (k < 0.08) { bad.push(`${f} almost no contrast, ${k.toFixed(3)}`); flagged++; }
  }
  console.log(`${d}: ${files.length} slides` + (bad.length ? ` -- GREY: ${bad.join(', ')}` : ' -- all in colour'));
}
console.log(`\n${flagged} of ${total} slides near-greyscale`);
await closeColourCheck();
