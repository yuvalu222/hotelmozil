// Block the deck copy I write when I have no source.
//
// WHY THIS EXISTS. Building tt-26 I filled a slide with lines like
// "זול, אבל צפוף ומסחרר", "מעבורת מסורנטו, יום שלם" and "חצי מחיר מפוזיטאנו".
// Every one of them was a placeholder standing in for a figure I had not gone
// and looked up. The deck rendered, every frame cleared the layout gate, and
// it would have shipped. The owner then said the thing this file answers:
// *"לא אומר לך מחירים. לא אומר לך כלום. אתה מכונה אטומה... AI שמשפר את עצמו."*
// A machine he hands nothing to cannot have a stage where it quietly degrades
// to adjectives. So the degradation now fails the build instead.
//
// What the corpus says, which is why the gate is this shape: the decks people
// SAVE carry hard numbers — a price, a distance, a duration, a count. Saving is
// how someone keeps a thing they intend to act on, and an adjective is not
// actionable. A slide of four vague lines is not a weaker slide, it is a slide
// with nothing to save.
//
// Three rules, each one traceable to a mistake that actually got made:
//
//   1. HEDGES are banned outright. These are the words that appear exactly
//      when a figure is missing. "זול" instead of the price, "בערך" instead of
//      the distance, "יום שלם" instead of the hours.
//   2. MOST FACTS ON A SLIDE MUST CARRY A FIGURE. Not all of them — "כל מדרגה
//      מהחוף מורידה מחיר" is a genuine rule and has no number to give. But a
//      slide where the majority are figure-free is the failure above.
//   3. NO FIGURE TWICE ACROSS THE DECK. "1,500 מדרגות" landed on two separate
//      slides in tt-26, which is the repetition the owner has already caught
//      by eye once: *"יש פעמים ששמת משפט פעמיים"*.

// Words that stand in for a number. Deliberately includes the puff vocabulary
// from the voice rules, because that is the same failure wearing nicer clothes.
const HEDGE = [
  // a figure is missing
  'בערך', 'בסביבות', 'כמה שקלים', 'כמה יורו', 'כמה אירו', 'לא יקר', 'לא זול',
  'יחסית זול', 'יחסית יקר', 'משתלם', 'שווה את זה', 'יום שלם', 'חצי יום',
  'המון זמן', 'הרבה זמן', 'כמה דקות', 'כמה שעות', 'קצת כסף',
  // puff: says nothing, measures nothing
  'עוצר נשימה', 'עוצרת נשימה', 'מרהיב', 'מרהיבה', 'חובה לבקר', 'חובה לראות',
  'מורשת עשירה', 'תוסס', 'תוססת', 'מהממת', 'מהמם', 'קסום', 'קסומה',
  'חלומי', 'חלומית', 'גן עדן', 'כמו בסרט', 'אין מילים',
];

// A figure is a digit, a written-out small number, or a free price — all of
// which a reader can act on. "חינם" is the strongest price there is.
const FIGURE = new RegExp(
  '\\d|חינם|בחינם|' +
  'שתי |שני |שלוש|שלושה|ארבע|חמש|שש |שישה|שבע|שמונה|תשע|עשר|' +
  'מחצית|חצי|שליש|רבע|כפול|פי שניים|פי שלוש|' +
  // duals, which are counts in Hebrew. The gate first read tt-4 slide 4 as
  // figure-free while a line on it already said "שעתיים".
  'שעתיים|יומיים|שבועיים|פעמיים|חודשיים|שנתיים|' +
  // ordinals: "מהמאה התשיעית" is a figure, "תשע" is not inside it
  'ראשונ|שניי|שלישי|רביעי|חמישי|שישי|שביעי|שמיני|תשיעי|עשירי|' +
  // months: the actionable answer to "when"
  'ינואר|פברואר|מרץ|אפריל|מאי |יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר'
);

const strip = (s) => String(s || '').replace(/\*\*/g, '');

// THREE item shapes exist now, and this gate has misread each new one in turn.
//
//   plain string            the older guide decks — the whole string is the fact
//   { name, fact }          the stack decks
//   { name, time, price, note }   tt-route, the labelled schema read off
//                           @vitortrip, where the facts are separate fields
//
// Each time a shape arrived, every line on every deck using it reported "no
// fact at all": 27 false positives the first time, 28 the second. A gate that
// does not recognise a shape does not stay quiet about it — it accuses.
const norm = (it) => {
  if (typeof it === 'string') return { name: it.split(/[:.]/)[0].slice(0, 24), fact: it };
  if (!it) return { name: undefined, fact: undefined };
  if (it.fact !== undefined) return { name: it.name, fact: it.fact };
  // Route shape: join whatever the schema filled in, so a stop with a price
  // and an opening time reads as two facts rather than none.
  const parts = [it.time, it.price, it.note].filter(Boolean);
  return { name: it.name, fact: parts.length ? parts.join(' · ') : undefined };
};

/**
 * @param {object} spec a deck spec
 * @returns {string[]} problems, empty when the copy is shippable
 */
export function checkFacts(spec) {
  const problems = [];
  const figureSeen = new Map(); // figure -> first slide index that used it

  (spec.slides || []).forEach((slide, i) => {
    const items = slide.items || [];
    if (!items.length) return;
    // tt-trio copies @miba_app, whose rows are a city and nothing else; the
    // figure on that slide is the travel time on the seam (`to`), checked there.
    if (slide.layout === 'tt-trio') {
      items.slice(0, -1).forEach((it) => { if (!/\d|שעה|שעתיים/.test(it.to || '')) problems.push(`${`slide ${i}`}: "${it.name}" has no travel time to the next city`); });
      return;
    }
    const label = `slide ${i}${slide.title ? ` (${slide.title})` : ''}`;

    let withFigure = 0;
    for (const raw of items) {
      const it = norm(raw);
      const fact = strip(it.fact);
      if (!fact) {
        problems.push(`${label}: "${it.name}" has no fact at all`);
        continue;
      }
      for (const h of HEDGE) {
        // One optional Hebrew prefix letter is allowed before a hedge: plain
        // substring matching fired on "כמעט", which contains "מעט". Hebrew has
        // no case to anchor on, so a hedge only counts when no Hebrew letter
        // touches it on either side — otherwise the gate edits words that are
        // merely spelled like the problem.
        if (new RegExp(`(^|[^\u0590-\u05FF])[\u05D1\u05DC\u05DE\u05D5\u05D4\u05E9\u05DB]?${h}($|[^\u0590-\u05FF])`).test(` ${fact} `)) {
          problems.push(`${label}: "${it.name}" says "${h}" — that is a `
            + 'placeholder for a figure you did not look up');
        }
      }
      if (FIGURE.test(fact)) withFigure++;
    }

    // Rule 2. A single figure-free rule-of-thumb is fine; a slide built out of
    // them is the slide that renders clean and is worth nothing.
    const need = Math.ceil(items.length * 0.6);
    if (withFigure < need) {
      problems.push(`${label}: only ${withFigure} of ${items.length} facts carry `
        + `a figure (need ${need}) — this is the vague-adjective slide`);
    }
  });

  // Rule 3, deck-wide. Run after the per-slide pass so the message can name
  // both slides. Short figures are skipped: a lone "1" or "5" collides by
  // coincidence, a "1,500" or "250" does not.
  (spec.slides || []).forEach((slide, i) => {
    for (const raw of (slide.items || [])) {
      const it = norm(raw);
      // ⚠️ The schema fields are exempt. This rule assumes a repeated figure
      // means a repeated SENTENCE, which held for the stack format where each
      // fact was one free-written claim. In the route format `time` and
      // `price` are a fixed schema — two stops that each take thirty minutes
      // both say "30 דקות", and that is the truth, not a copy-paste. Enforcing
      // it there made the gate demand that correct durations be falsified.
      // Prose fields (`fact`, `note`) are still checked.
      const fact = typeof raw === 'object' && raw && raw.fact === undefined
        ? strip(raw.note)
        : strip(it.fact);
      for (const m of fact.matchAll(/(\d[\d,.]*(?:-\d[\d,.]*)?)\s*([^\s,.]*)/g)) {
        const num = m[1];
        if (num.replace(/\D/g, '').length < 2) continue;
        const key = `${num} ${m[2] || ''}`.trim();
        const first = figureSeen.get(key);
        if (first === undefined) figureSeen.set(key, i);
        else if (first !== i) {
          problems.push(`"${key}" appears on slide ${first} and again on `
            + `slide ${i} — pick a different fact for one of them`);
        }
      }
    }
  });

  return [...new Set(problems)];
}
