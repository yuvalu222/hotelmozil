// Shorten the facts the wrap check says sit too close to the edge of their
// column. Each one keeps its figure and loses a word that was carrying little.

import fs from 'node:fs';

const EDITS = {
  'tt-26-amalfi': {
    'פוזיטאנו': 'הכי מצולמת. **250-450 יורו**',
    'לא לשכור רכב': '**50 ק״מ** סרפנטינות. אין חניה',
    'חוף פורנילו': '**עשר דקות** מהחוף הראשי',
    'לימונצ׳לו': 'מלימוני סורנטו. **30 אחוז**',
    'לבוא בנעליים לא נכונות': '**1,500 מדרגות**. לא סנדלים',
  },
  'tt-4-larnaca-20things': {
    'טיילת פיניקודס': 'דקלים וים. **מתחילים כאן**',
    'סטברובוני': '**750 מטר**. נשים לא נכנסות',
  },
};

for (const [id, map] of Object.entries(EDITS)) {
  const p = `specs/${id}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const s of d.slides) {
    for (const it of (s.items || [])) {
      if (map[it.name]) { it.fact = map[it.name]; n++; }
    }
  }
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  console.log(`${id}: ${n} lines shortened`);
}
