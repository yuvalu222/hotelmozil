// Catch a thumbnail that is searching for something the slide no longer says.
//
// WHY. A stack slide holds N items and N+1 photo queries: one backdrop, then
// one per row, in order. Rename an item and the query underneath it does not
// move. Nothing notices, because a stale query still returns a perfectly good
// photograph — of the wrong thing. It happened twice in one session:
//
//   tt-26 row "לטוס לרומא" was still being searched as
//           "positano hotel cliff expensive view"
//   tt-26 row "לנסות הכל ביומיים" as "amalfi coast viewpoint sea panorama"
//
// Both rendered fine and both shipped a picture unrelated to their line.
//
// The queries are English and the items Hebrew, so nothing can be inferred by
// comparing them. Instead each row query carries `for`, the item name it was
// written against, and this check fails when the two drift apart. Writing a
// new query means writing the name it belongs to — which is the moment the
// author actually knows it.

// A photograph from the wrong country is the same failure as one of the wrong
// subject, and harder to see: a flamingo lagoon in Gruissan, FRANCE sat on a
// Cyprus deck and looked perfect. The stock description almost always names
// the place, which is the only ground truth available about where a frame was
// taken.
//
// `anyCountry: true` on a photo entry waives this, for the case where no
// local photograph exists — Stavrovouni has none on Pexels, so a Greek
// monastery stands in on purpose. The waiver has to be written down, which is
// the point: an accepted compromise is visible, an accidental one is not.
const COUNTRIES = [
  'italy', 'greece', 'cyprus', 'spain', 'portugal', 'france', 'turkey',
  'croatia', 'thailand', 'vietnam', 'japan', 'india', 'mexico', 'brazil',
  'morocco', 'egypt', 'hungary', 'czechia', 'poland', 'georgia', 'albania',
  'malta', 'israel', 'indonesia', 'dubai', 'norway', 'iceland', 'netherlands',
];

/**
 * @param {object} spec a deck spec with a `country`
 * @returns {string[]} photos whose description names a different country
 */
export function checkCountry(spec) {
  if (!spec.country) return [];
  const want = String(spec.country).toLowerCase();
  const problems = [];
  (spec.slides || []).forEach((slide, i) => {
    for (const e of [slide.image, ...(slide.images || [])]) {
      if (!e || !e.alt || e.anyCountry) continue;
      const named = COUNTRIES.filter((c) => new RegExp(`\\b${c}\\b`, 'i').test(e.alt));
      if (named.length && !named.includes(want)) {
        problems.push(`slide ${i}: the photo for "${e.for || 'the backdrop'}" is in `
          + `${named.join('/')}, not ${spec.country} — set anyCountry:true to accept it`);
      }
    }
  });
  return problems;
}

// The gate exists to catch a query pointing at a different PLACE, so it has to
// compare identity and not decoration. A 📍 prefix is decoration: it is added
// to every row by one rule, carries no meaning about which stop a row is, and
// if it counted as a rename then adding it would "break" 57 correct queries at
// once — which is exactly what happened on the first run.
const ident = (s) => String(s ?? '')
  .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/gu, '')
  .trim();

/**
 * @param {object} spec a deck spec
 * @returns {string[]} problems, empty when every row query matches its item
 */
export function checkWiring(spec) {
  const problems = [];
  (spec.slides || []).forEach((slide, i) => {
    const items = slide.items || [];
    const images = slide.images || [];
    if (!items.length || images.length < 2) return;
    const label = `slide ${i}${slide.title ? ` (${slide.title})` : ''}`;

    // One backdrop plus one photo per row. A mismatch here means the rows and
    // the queries are no longer aligned at all, and every `for` below would be
    // comparing the wrong pair.
    if (images.length !== items.length + 1) {
      problems.push(`${label}: ${items.length} items but ${images.length} photo `
        + `queries — expected ${items.length + 1} (one backdrop + one per row)`);
      return;
    }

    items.forEach((it, k) => {
      const e = images[k + 1];
      if (e.for === undefined) {
        problems.push(`${label}: the query for "${it.name}" has no \`for\` — `
          + 'add it so a rename cannot leave the photo behind');
      } else if (ident(e.for) !== ident(it.name)) {
        problems.push(`${label}: row "${it.name}" is being searched as `
          + `"${e.query}", which was written for "${e.for}"`);
      }
    });
  });
  return problems;
}
