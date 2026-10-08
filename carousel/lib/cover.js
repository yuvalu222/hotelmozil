// Scoring a COVER photograph, which is a different job from scoring any other
// frame in the deck.
//
// WHY THIS IS SEPARATE. The owner, 7.10: the Amalfi cover works because it is
// a good sunset; the Larnaca cover fails because it is "just a photo of
// rooftops from the street — lots of colour, but nothing WOW in it". Both
// scored well on the existing picker, which ranks saturation, chroma,
// contrast and busyness. Those terms cannot tell a sunset over the sea from a
// saturated alley, because to them the alley IS the better frame: more edges,
// more colour variance. The cover needs a different question asked of it.
//
// WHAT THE OUTSIDE RESEARCH SAYS, and it converges from two directions:
//
//   - Visual attention: depictions of human beings, and heads in particular,
//     are prioritised during scene exploration INDEPENDENTLY of low-level
//     physical saliency, and the presence of social information weakens the
//     influence of colour and edge saliency on where people look.
//   - Travel publishing, stated as a working rule: a magazine wants a
//     landscape WITH people for a cover image, and uses the versions without
//     people for the inside spreads, where landscapes alone are "two a penny".
//
// That maps exactly onto a deck: one cover, which needs a person in it, and a
// set of interior thumbnails, which do not.
//
// HOW IT IS MEASURED. Pixels cannot tell me a person is present — the existing
// measurement is luminance and colour statistics, nothing semantic. But every
// candidate already carries the stock library's own alt text, written by the
// contributor, and it names what is in the frame: "woman lounging by the
// infinity pool", "aerial view of a vibrant alley". That text is the cheapest
// honest signal available, and it is the one the picker was throwing away.
//
// ⚠️ CONFIDENCE. The person-in-frame effect is well supported for attention
// and for travel covers; it is NOT measured on this corpus, because the
// corpus has likes and saves and no impressions, and both of those are
// recorded only after someone has already stopped. Nothing here is validated
// against scroll-stopping, and it should not be described as if it were.
// To falsify: post two covers of the same deck, one with a figure and one
// without, and compare reach.

const RE = (words) => new RegExp(`\\b(${words.join('|')})\\b`, 'i');

// A person in the frame. Plural and singular, and the words stock contributors
// actually use.
// NOT 'silhouette'. It was in this list and scored a flamingo as a person:
// "Stunning flamingo silhouette against a golden sunset". A silhouette is a
// lighting condition, not a subject.
const PERSON = RE([
  'woman', 'women', 'man', 'men', 'person', 'people', 'girl', 'boy',
  'couple', 'traveler', 'traveller', 'tourist', 'tourists', 'hiker',
  'female', 'male', 'someone', 'friends', 'swimmer', 'adults',
]);

// Light doing something, not weather. Sunset is the obvious case and it is NOT
// the only one — the owner, 7.10: "Manhattan at night can have no sea at all
// and still be full of lights and impressive buildings from the right angle.
// Sunset and sea are not the only thing." Night light counts the same.
const LIGHT = RE([
  'sunset', 'sunrise', 'golden hour', 'twilight', 'dusk', 'dawn',
  'sunlit', 'glowing', 'backlit',
  'night', 'illuminated', 'lights', 'lit up', 'neon', 'skyline at night',
  'blue hour', 'glittering', 'fireworks',
]);

// Scale, or a vantage point a passer-by does not get. This is the term that
// was missing: Manhattan at night and a cliff coast at sunset share nothing
// subject-wise, they share SPECTACLE — something big, seen from somewhere you
// could not casually stand.
const SCALE = RE([
  'aerial', 'drone', 'skyline', 'panorama', 'panoramic', 'overlook',
  'viewpoint', 'vista', 'cliff', 'cliffs', 'towering', 'vast', 'sweeping',
  'from above', 'bird\'s eye', 'rooftop view', 'mountain', 'canyon',
]);

// A landscape subject present at all. Weighted lightly: it confirms there is
// something to look at, and says nothing about whether it is impressive.
const SUBJECT = RE([
  'sea', 'ocean', 'coast', 'coastline', 'bay', 'beach', 'lagoon',
  'city', 'old town', 'harbour', 'harbor', 'island', 'lake', 'river',
]);

// Subjects that read as a snapshot rather than as a destination. An aerial of
// rooftops is the exact frame he rejected.
const FLAT = RE(['alley', 'alleyway', 'rooftops', 'street sign', 'parking', 'wall', 'facade', 'doorway']);

// Stock descriptions usually name the place, and that is the one piece of
// ground truth available about WHERE a photograph was taken. A flamingo shot
// chosen for a Cyprus deck turned out to say "Volano, Italy" — a better
// picture of the wrong country, which is the same failure as a better picture
// of the wrong subject.
const COUNTRIES = [
  'italy', 'greece', 'cyprus', 'spain', 'portugal', 'france', 'turkey',
  'croatia', 'thailand', 'vietnam', 'japan', 'india', 'mexico', 'brazil',
  'morocco', 'egypt', 'hungary', 'czechia', 'poland', 'georgia', 'albania',
  'malta', 'israel', 'indonesia', 'bali', 'dubai', 'norway', 'iceland',
];

/**
 * A multiplier on the visual score, from what the stock library says is in the
 * frame. Returns { factor, why } so a build can print its reasoning instead of
 * silently preferring one photo over another.
 *
 * @param {string} alt     the contributor's description
 * @param {string} [country] the deck's destination, e.g. "Cyprus"
 */
export function coverBonus(alt, country) {
  const t = String(alt || '');
  const why = [];
  let f = 1;
  // A person AMPLIFIES a frame that is already worth looking at; it does not
  // make a dull one worth looking at. Unconditional, the bonus put an overcast
  // promenade in winter coats above Positano at twilight — the person was the
  // only interesting thing the words could find, and there was nothing else.
  const spectacle = LIGHT.test(t) || SCALE.test(t);
  if (PERSON.test(t)) {
    f *= spectacle ? 1.35 : 1.08;
    why.push(spectacle ? 'person in frame' : 'person, but nothing else going on');
  }
  if (LIGHT.test(t)) { f *= 1.25; why.push('light as an event'); }
  if (SCALE.test(t)) { f *= 1.25; why.push('scale or vantage'); }
  if (SUBJECT.test(t)) { f *= 1.05; why.push('a place, not a detail'); }
  if (FLAT.test(t)) { f *= 0.55; why.push('street-level snapshot'); }
  if (country) {
    const want = String(country).toLowerCase();
    const named = COUNTRIES.filter((c) => new RegExp(`\\b${c}\\b`, 'i').test(t));
    if (named.length && !named.includes(want)) {
      f *= 0.2;
      why.push(`names ${named.join('/')}, not ${country}`);
    }
  }
  return { factor: +f.toFixed(3), why };
}

/**
 * Re-rank already-measured cover candidates using the alt text.
 * @param {Array<{file:string, alt?:string, score?:number}>} ranked visually ranked, best first
 */
export function rankCovers(ranked, country) {
  for (const c of ranked) {
    const { factor, why } = coverBonus(c.alt ?? c.altRaw, country);
    c.coverFactor = factor;
    c.coverWhy = why;
    // A dud stays a dud: the visual score is 0 and no amount of alt text can
    // lift it. This only reorders frames that already passed.
    c.coverScore = +((Number(c.score) || 0) * factor).toFixed(4);
  }
  return [...ranked].sort((a, b) => b.coverScore - a.coverScore);
}
