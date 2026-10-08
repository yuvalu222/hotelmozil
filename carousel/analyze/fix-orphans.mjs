// Shorten the lines the wrap check caught: facts that spill a word or two
// onto a second line, and headings that break in half. The copy says the same
// thing in fewer words — nothing measured is dropped.
//
//   node analyze/fix-orphans.mjs

import fs from 'node:fs';

const EDITS = {
  'tt-26-amalfi': {
    fact: {
      'סורנטו': '**120-200 יורו**. חצי מחיר',
      'לטוס לרומא': 'נאפולי שעה וחצי, **רומא ארבע**',
    },
  },
  'tt-4-larnaca-20things': {
    name: {
      'לשכור רכב בלי רישיון בינלאומי': 'בלי רישיון בינלאומי',
      'לשכוח שנוסעים בצד שמאל': 'נוסעים בצד שמאל',
    },
    fact: {
      'פרפה בכיכר': 'קפה קר. יושבים עליו **שעתיים**',
      'בלי רישיון בינלאומי': 'בודקים, והביטוח **לא תקף**',
      'נוסעים בצד שמאל': '**אחת מארבע** מדינות באירופה',
    },
  },
};

for (const [id, e] of Object.entries(EDITS)) {
  const p = `specs/${id}.json`;
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));
  let n = 0;
  for (const s of d.slides) {
    for (const it of (s.items || [])) {
      // Rename first so a fact keyed on the new name is found in the same pass.
      if (e.name?.[it.name]) { it.name = e.name[it.name]; n++; }
      if (e.fact?.[it.name]) { it.fact = e.fact[it.name]; n++; }
    }
  }
  fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);
  console.log(`${id}: ${n} edits`);
}
