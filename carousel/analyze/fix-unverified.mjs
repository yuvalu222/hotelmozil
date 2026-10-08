// Correct the numbers I put on the Amalfi deck from memory rather than from a
// source — the same failure as the adjectives, wearing a number.
//
// The copy gate stops "זול" and demands a figure. It cannot tell a figure I
// looked up from one I guessed, and three of mine were wrong:
//
//   limoncello  26-32%   -> 30%. The Sorrento PGI floor is 30; 26 was invented.
//   Nerano      "3 ingredients" -> false. Spaghetti alla Nerano takes zucchini,
//               provolone del Monaco, parmesan, oil, garlic, basil and pepper.
//               The real fact is the year: Nerano, 1952, at Maria Grazia's.
//   Fornillo    5 minutes -> 10. Every source says ten, with steps.
//
// Verified and kept: Amalfi cathedral 62 steps, delizia al limone 1978
// (Carmine Marzuillo, Sorrento), SS163 50.36 km, Monte Solaro 589 m.
// The chairlift's 12 minutes is new and is the more useful number.
//
// The caption also promised "מעבורת מ-10 יורו", a figure no slide carries any
// more after the ferry line was changed to its duration.

import fs from 'node:fs';
import { checkFacts } from '../lib/facts.js';

const p = 'specs/tt-26-amalfi.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

const FACT = {
  'לימונצ׳לו': 'מלימוני סורנטו. **30 אחוז** אלכוהול',
  'ספגטי אלה נרנו': 'נולד בכפר נרנו **ב-1952**',
  'חוף פורנילו': '**עשר דקות** מהחוף הראשי, במדרגות',
  'אנאקפרי': 'רכבל **12 דקות** ל-589 מטר',
};

let n = 0;
for (const s of d.slides) {
  for (const it of (s.items || [])) {
    if (FACT[it.name]) { it.fact = FACT[it.name]; n++; }
  }
}

d.caption = 'חוף אמלפי בלי לשרוף את כל התקציב. לינה בחצי מחיר, אוטובוס ב-1.5 יורו,\n'
  + 'ושביל האלים בחינם. כולל מה לא לעשות.\n'
  + 'שמרו את זה לפני שאתם מזמינים. מי כבר היה?';

fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);

// Every figure in the caption must appear on a slide, or the caption is
// promising something the deck does not deliver.
const onSlides = new Set();
for (const s of d.slides) {
  for (const it of (s.items || [])) {
    for (const f of (it.fact || '').match(/\d[\d,.]*/g) || []) onSlides.add(f);
  }
}
const missing = (d.caption.match(/\d[\d,.]*/g) || []).filter((f) => !onSlides.has(f));

console.log(`${n} unverified figures corrected`);
console.log('caption figures not on any slide:', missing.length ? missing.join(', ') : 'none');
const left = checkFacts(d);
console.log('copy gate:', left.length ? left.join(' | ') : 'clean');
