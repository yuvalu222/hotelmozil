// 17.10 gate (owner): no slide may read like the end before the last one
// ("תעקבו לעוד..." made people leave before the closer), and the last slide
// is always closer.mjs, the one that explains what the app is.
//   node native/qa-closer.mjs <deck> ...
import fs from 'node:fs';
import path from 'node:path';
import { CLOSER } from './closer.mjs';

const HERE = import.meta.dirname;
const ENDING = /תעקב|עקבו|לעוד (טיפים|דברים|סרטונים)|חלק 2|להמשך|follow/i;
let bad = 0;
for (const deck of process.argv.slice(2)) {
  const { slides } = JSON.parse(fs.readFileSync(path.join(HERE, 'decks', `${deck}.json`), 'utf8'));
  const text = (s) => (s.blocks || [{ lines: s.lines || [] }]).flatMap((b) => b.lines.map((l) => l.t)).join(' ');
  slides.forEach((s, i) => {
    if (ENDING.test(text(s))) { bad++; console.log(`${deck} slide ${i + 1}: reads like the end: ${text(s)}`); }
  });
  if (JSON.stringify(slides.at(-1)) !== JSON.stringify(CLOSER)) { bad++; console.log(`${deck}: last slide is not the explaining closer (closer.mjs)`); }
  if (slides.slice(0, -1).some((s) => s.copy || s.photo === CLOSER.photo)) { bad++; console.log(`${deck}: a closer before the last slide`); }
}
console.log(bad ? `closer gate: ${bad} problem(s)` : `closer gate: clean (${process.argv.length - 2} decks)`);
process.exitCode = bad ? 1 : 0;
