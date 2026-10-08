// Check a caption against what was measured, not against taste.
//
// §14 of TIKTOK.md, over 663 captioned decks with a 0.361 median saves/like.
// Only patterns with n ≥ 25 are enforced; the thin ones are reported as hints
// so the number they came from is visible and can be ignored.
//
// The reason this is a gate and not a note: every one of these was already
// known when the last two decks were written, and none of them was applied.

const RULES = [
  {
    key: 'route',
    test: /מסלול|תוכנית|תכנית|יומן|סדר יום|מדריך/,
    n: 34, lift: '+125%',
    say: 'no route framing — "מסלול" / "תוכנית" / "מדריך" is the strongest caption '
       + 'pattern measured anywhere in this research',
  },
  {
    key: 'save',
    test: /שמרו|שמור|תשמרו|לשמור/,
    n: 62, lift: '+80%',
    say: 'no save CTA — "שמרו את זה" ',
  },
  {
    key: 'money',
    test: /חינם|זול|תקציב|יורו|שקל|₪|€|\d+\s*ש"?ח/,
    n: 34, lift: '+74%',
    say: 'no money word — a price, "חינם" or "תקציב"',
  },
  {
    key: 'superlative',
    test: /הכי|המושלם|המלא|חובה|אולטימטיבי|הטוב ביותר/,
    n: 58, lift: '+61%',
    say: 'no superlative — "הכי", "המושלם", "המלא"',
  },
  {
    key: 'flag',
    test: /\p{RI}\p{RI}/u,
    n: 95, lift: '+38%',
    say: 'no flag emoji for the destination',
  },
  {
    key: 'emoji',
    test: /\p{Extended_Pictographic}/u,
    n: 249, lift: '+22%',
    say: 'no emoji at all',
  },
];

// Thin-but-interesting. Reported with the n so nobody treats them as settled.
const HINTS = [
  { test: /\d+\s*(ימים|יום|שעות|שעה|לילות|שבוע)/, n: 17, lift: '+116%',
    say: 'a duration in the title — "5 ימים", "48 שעות"' },
  { test: /שגר|מקומי|חי שם|גרה שם|גר שם|מישהו ש/, n: 6, lift: '+83%',
    say: 'a credibility claim — "(מאחת שגרה שם)"' },
];

// Measured as actively bad.
const AVOID = [
  { test: /חלק\s*\d|part\s*\d/i, n: 28, lift: '-56%',
    say: 'announces itself as part of a series, the worst pattern measured' },
];

/**
 * @param {object} spec a deck spec
 * @returns {{problems:string[], hints:string[]}}
 */
export function checkCaption(spec) {
  const c = String(spec.caption || '');
  const problems = [];
  const hints = [];

  if (!c.trim()) return { problems: ['no caption at all'], hints };

  const words = c.trim().split(/\s+/).length;
  // 19-30 words measured best (0.594); 1-5 words measured 0.231.
  if (words < 11) problems.push(`caption is ${words} words — under 11 measures 0.23-0.39 against a 0.36 median; aim for 19-30`);
  else if (words > 34) hints.push(`caption is ${words} words — 31+ drops back to 0.42 from 0.59`);

  for (const r of RULES) {
    if (!r.test.test(c)) problems.push(`${r.say} (${r.lift}, n=${r.n})`);
  }
  for (const h of HINTS) {
    if (!h.test.test(c)) hints.push(`${h.say} (${h.lift}, n=${h.n} — thin)`);
  }
  for (const a of AVOID) {
    if (a.test.test(c)) problems.push(`${a.say} (${a.lift}, n=${a.n})`);
  }
  return { problems, hints };
}
