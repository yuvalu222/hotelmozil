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
  // a stock description usually names the country, but often enough it names
  // only the town, and the check passed three wrong-country photos on 8.10
  // because of it: an Istanbul mosque for Hala Sultan Tekke, a Naxos bell
  // tower for Angeloktisti in Kiti, and Göbeklitepe for Choirokoitia. The
  // last also writes the country as "Türkiye", which "turkey" never matches.
  'turkiye', 'türkiye',
];

/** Towns and regions that give away a country the description never names. */
const PLACES = {
  istanbul: 'turkey', cappadocia: 'turkey', antalya: 'turkey', bodrum: 'turkey',
  'şanlıurfa': 'turkey', sanliurfa: 'turkey', 'göbeklitepe': 'turkey', gobeklitepe: 'turkey',
  naxos: 'greece', mykonos: 'greece', athens: 'greece', corfu: 'greece', zakynthos: 'greece',
  milos: 'greece', paros: 'greece', thessaloniki: 'greece', meteora: 'greece',
  rome: 'italy', venice: 'italy', florence: 'italy', milan: 'italy', naples: 'italy',
  sicily: 'italy', tuscany: 'italy', 'cinque terre': 'italy',
  barcelona: 'spain', madrid: 'spain', seville: 'spain', mallorca: 'spain', ibiza: 'spain',
  lisbon: 'portugal', porto: 'portugal', madeira: 'portugal', algarve: 'portugal',
  nicosia: 'cyprus', limassol: 'cyprus', paphos: 'cyprus', larnaca: 'cyprus',
  // The north of the island is not the Republic a Larnaca itinerary is about,
  // and the pool is full of it. On 8.10 a Mackenzie Beach tile came back with
  // a Turkish flag flying in it and a Stavrovouni tile came back as Bellapais
  // Abbey in Kyrenia; both descriptions said "Cyprus" and the gate passed them.
  bellapais: 'northern cyprus', kyrenia: 'northern cyprus', girne: 'northern cyprus',
  famagusta: 'northern cyprus', gazimagusa: 'northern cyprus',
  'gazimağusa': 'northern cyprus', karpaz: 'northern cyprus',
  'north cyprus': 'northern cyprus', lefkosa: 'northern cyprus',
  marrakech: 'morocco', fes: 'morocco', chefchaouen: 'morocco',
  bangkok: 'thailand', phuket: 'thailand', krabi: 'thailand', 'chiang mai': 'thailand',
  tokyo: 'japan', kyoto: 'japan', osaka: 'japan', budapest: 'hungary', prague: 'czechia',
  vienna: 'austria', amsterdam: 'netherlands', 'tel aviv': 'israel', jerusalem: 'israel',
};

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
      const text = String(e.alt).toLowerCase();
      const named = COUNTRIES.filter((c) => new RegExp(`\\b${c}\\b`, 'i').test(e.alt));
      // A town name gives the country away just as well, and is far commoner
      // in a stock description than the country itself.
      const towns = [];
      for (const [town, country] of Object.entries(PLACES)) {
        if (text.includes(town)) {
          towns.push(country);
          if (!named.includes(country)) named.push(country);
        }
      }
      // A town beats a country word, because it is the more specific claim.
      // "Harbour in Kyrenia, Cyprus" says Cyprus and means the north, and
      // without this the country word alone would wave it through.
      const townSaysElsewhere = towns.length && !towns.includes(want);
      if (townSaysElsewhere || (named.length && !named.includes(want))) {
        const where = townSaysElsewhere ? [...new Set(towns)] : named;
        problems.push(`slide ${i}: the photo for "${e.for || 'the backdrop'}" is in `
          + `${where.join('/')}, not ${spec.country} — set anyCountry:true to accept it`);
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

// Two rows on one slide showing the same thing.
//
// On 8.10 the Capri slide carried Monte Solaro, the Augustus Gardens and the
// Faraglioni, and all three photographs were of the Faraglioni — the picker
// answered three different queries with the same landmark because it is what
// Capri stock is full of. Every gate passed it: each photo was of Capri, in
// Italy, and wired to the right row.
//
// ⚠️ THE FIRST VERSION OF THIS CHECK WAS NOISE. Flagging any capitalised word
// two descriptions share reported 37 problems on the Paris deck, every one of
// them the word "Paris". A gate that fires on good work teaches you to ignore
// it, which is the same fault the ink check had an hour earlier.
//
// The sharpened test: a shared name is a problem only when it appears in
// exactly ONE of the slide's own row queries. "Paris" is in all five, so it
// says nothing. "Faraglioni" is in one — so the other row showing it is
// showing somebody else's subject. "Louvre" is in two, because the Carrousel
// really is the Louvre, and "Vesuvius" is in two, because Pompeii really does
// have the mountain behind it; neither is flagged, correctly.

/**
 * @param {object} spec a deck spec
 * @returns {string[]} problems, empty when no row shows another row's subject
 */
export function checkDuplicateSubjects(spec) {
  const problems = [];
  (spec.slides || []).forEach((slide, i) => {
    const rows = (slide.images || []).filter((e) => e && e.for && e.alt);
    if (rows.length < 2) return;
    const queries = rows.map((e) => String(e.query || '').toLowerCase());
    const inQueries = (w) => queries.filter((q) => q.includes(w)).length;
    // Split on non-letters rather than use a word boundary. The first
    // version of this line went through a heredoc, which turned its backslash-b
    // escape into a real backspace byte (0x08): the regex matched nothing
    // and the check called every deck clean. Same failure as the bidi rule.
    const nouns = rows.map((e) => new Set(
      String(e.alt).split(/[^A-Za-z]+/)
        .filter((x) => /^[A-Z][a-z][a-z][a-z]/.test(x))
        .map((x) => x.toLowerCase()),
    ));
    const seen = new Set();
    for (let a2 = 0; a2 < rows.length; a2++) {
      for (let b = a2 + 1; b < rows.length; b++) {
        // A shared GENERIC noun is not a shared subject. Pompeii and Vesuvius
        // both say "Mount" because the mountain stands behind the ruins, which
        // is correct and not a duplicate. Only names count.
        const GENERIC = new Set(['mount', 'mountain', 'beach', 'island', 'village',
          'church', 'museum', 'garden', 'gardens', 'palace', 'castle', 'tower',
          'bridge', 'square', 'street', 'coast', 'cliff', 'cliffs', 'harbour',
          'harbor', 'grotto', 'cave', 'lake', 'river', 'valley', 'monastery']);
        const shared = [...nouns[a2]].filter((w) => nouns[b].has(w) && !GENERIC.has(w) && inQueries(w) === 1);
        if (!shared.length) continue;
        const key = `${i}|${shared.join()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        problems.push(`slide ${i}: "${rows[a2].for}" and "${rows[b].for}" are both `
          + `photographs of ${shared.join('/')} — one slide, two rows, one subject`);
      }
    }
  });
  return problems;
}
