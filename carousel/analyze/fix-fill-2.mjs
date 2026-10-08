// Shorten every line the wrap check flags now that it measures in the real
// webfont. The previous round was calibrated against the fallback face and so
// let twelve lines through; these are the same kind of edit, done against a
// measurement that matches the rendered file.
//
// Each line keeps its figure. What goes is a word that was repeating what the
// heading already said, or a qualifier the number makes redundant.

import fs from 'node:fs';

const EDITS = {
  'tt-26-amalfi': {
    fact: {
      'ראוולו': '**350 מטר** מעל הים. הכי שקטה',
      'מעבורת': '**חצי שעה** על הים',
      'האוטובוס': '**1.5-3.4 יורו**. יומי 10',
    },
    name: { 'לבוא בנעליים לא נכונות': 'נעליים לא נכונות' },
  },
  'tt-4-larnaca-20things': {
    fact: {
      'אגיוס לאזארוס': '**מהמאה התשיעית**. חינם',
      'חוף מקנזי': '**1,000 מטר** ממסלול ההמראה',
      'אגם המלח': 'פלמינגו, **נובמבר עד מרץ**',
      'חלה סולטן טקה': 'על שפת האגם, **מ-648**',
      'לפקרה': 'תחרה ב**אונסקו מ-2009**',
      'מזה קפריסאי': '**עשרים מנות** בארוחה אחת',
      'חלומי': 'מוגן באירופה **מ-2021**',
      'להגיע לאגם בקיץ': '**יבש מאפריל**. בלי פלמינגו',
    },
  },
};

for (const [id, e] of Object.entries(EDITS)) {
  const p = `specs/${id}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const s of d.slides) {
    for (const it of (s.items || [])) {
      if (e.fact?.[it.name]) { it.fact = e.fact[it.name]; n++; }
      if (e.name?.[it.name]) { it.name = e.name[it.name]; n++; }
    }
  }
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  console.log(`${id}: ${n} edits`);
}
