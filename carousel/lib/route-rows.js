// The route row schema, as the precedent writes it.
//
// Measured 8.10 off the three highest-saving walking-route decks in the
// corpus — Rome 1.538, Paris 1.390, London 1.307. Across their 15 content
// slides, without a single exception:
//
//   * exactly five stops a slide
//   * under every name, two labelled fields and nothing else:
//       TIME SPENT: <duration>      PRICE: <amount, or FREE>
//     (one may be dropped when it does not apply — Rome's "DINNER IN
//      TRASTEVERE" carries a price and no duration — but prose never
//      appears in their place)
//   * a travel time between consecutive stops, on every gap
//
// WHY A GATE. "PRICE: €18 (BASIC) / €24+ (ARENA)" is a figure; "משתנה לפי
// תערוכה" is a shrug. Two rows shipped with the shrug on 8.10 and every
// other gate passed them, because the facts gate asks for figures in the
// deck as a whole and not in each row. An adjective where a number belongs
// means nobody looked the number up.

const FIGURE = /\d/;
// "חינם מהיבשה" is still a price. Note the (\s|$) rather than \b: \b is an
// ASCII word boundary and Hebrew letters are not \w, so חינם\b never matches.
const FREE = /^\s*חינם(\s|$)/;
const VAGUE = /משתנה|תלוי|בערך|סביב|כמה עשרות|לא ידוע/;

/**
 * @param {object} spec a deck spec
 * @returns {string[]} problems, empty when every route row matches the schema
 */
export function checkRouteRows(spec) {
  const problems = [];
  (spec.slides || []).forEach((slide, i) => {
    if (slide.layout !== 'tt-route') return;
    const items = slide.items || [];
    const where = `slide ${i}${slide.badge ? ` (${slide.badge})` : ''}`;

    if (items.length !== 5) {
      problems.push(`${where}: ${items.length} stops — the precedent puts five `
        + 'on every content slide, 15 of 15 across the three decks');
    }
    items.forEach((it, k) => {
      const name = it.name || `stop ${k + 1}`;
      if (!it.price) {
        problems.push(`${where}: "${name}" has no price — the precedent prints `
          + 'one on every row, even when it is FREE');
      } else if (VAGUE.test(it.price)) {
        problems.push(`${where}: "${name}" is priced "${it.price}" — that is an `
          + 'adjective where a number belongs. Look it up.');
      } else if (!FIGURE.test(it.price) && !FREE.test(it.price)) {
        problems.push(`${where}: "${name}" is priced "${it.price}", which is `
          + 'neither a figure nor חינם');
      }
      if (!it.time && k !== items.length - 1) {
        problems.push(`${where}: "${name}" has no visit time`);
      }
      // Every gap carries a travel time; the last stop has no gap after it.
      if (k < items.length - 1 && !it.to) {
        problems.push(`${where}: nothing between "${name}" and the next stop — `
          + 'the travel time is what makes this a route and not a list');
      }
    });
  });
  return problems;
}
