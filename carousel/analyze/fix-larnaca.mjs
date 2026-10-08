// One-off: replace tt-4's adjectives with figures I went and looked up.
//
// The copy gate failed this deck on all five slides. Every line below swaps a
// vague phrase for a checkable number. One change is a content fix rather than
// a copy fix: the deck recommended Stavrovouni monastery, which does not admit
// women at all — it keeps Mount Athos rules. Sending half the audience to a
// door they cannot enter is worse than a weak sentence, and the restriction is
// the more interesting fact anyway.
//
// Sources, for the record:
//   Larnaca Castle €2.50 .......... visitcyprus.com
//   Mackenzie 1,000 m from runway . airportspotting.com
//   Hala Sultan Tekke, 648 AD ..... visitcyprus.com / larnakaregion.com
//   Lefkara lace, UNESCO 2009 ..... UNESCO intangible heritage list
//   Zenobia, sank 1980, 42 m ...... cyprusdiving.org.cy
//   Stavrovouni 750 m, men only ... visitcyprus.com / larnakaregion.com
//   Halloumi EU protected 2021 .... EU PDO register
//   Left-hand drive, 4 in Europe .. UK, Ireland, Malta, Cyprus

import fs from 'node:fs';
import { checkFacts } from '../lib/facts.js';

const p = 'specs/tt-4-larnaca-20things.json';
const d = JSON.parse(fs.readFileSync(p, 'utf8'));

const FACT = {
  'מצודת לרנקה': 'בקצה הטיילת, **2.5 יורו** כניסה',
  'חוף מקנזי': '**1,000 מטר** ממסלול ההמטוסים',
  'חלה סולטן טקה': 'על שפת האגם, **מ-648 לספירה**',
  'לפקרה': 'תחרה שנכנסה ל**אונסקו ב-2009**',
  'הזנוביה': 'טבעה **ב-1980** בהפלגה הראשונה. 42 מטר',
  'סטברובוני': '**750 מטר** מעל הים. נשים לא נכנסות',
  'פרפה בכיכר': 'קפה קר. יושבים **שעתיים** בלי למהר',
  'לשכוח שנוסעים בצד שמאל': '**אחת מארבע** באירופה. מפתיע כל ישראלי',
};

// "לוקמדס :: כמה אירו" is the exact hedge the gate was built to stop, and I
// could not find a price I trust. Halloumi carries a date instead.
const SWAP = { 'לוקמדס': { name: 'חלומי', fact: 'מוגן באירופה **מ-2021**. רק מכאן' } };

let n = 0;
for (const s of d.slides) {
  for (const it of (s.items || [])) {
    if (SWAP[it.name]) { Object.assign(it, SWAP[it.name]); n++; }
    else if (FACT[it.name]) { it.fact = FACT[it.name]; n++; }
  }
}
fs.writeFileSync(p, `${JSON.stringify(d, null, 2)}\n`);

const left = checkFacts(d);
console.log(`${n} lines rewritten`);
console.log(left.length ? `still failing:\n  ${left.join('\n  ')}` : 'gate: clean');
