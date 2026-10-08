// The cover must say where it is about.
//
// 8.10, his words: *"nobody will fly because of the video, but people flying
// to Larnaca, who want to know what to do there, need to know the video is
// even about Larnaca."*
//
// MEASURED, not taken on his word alone. All 13 travel covers on his own
// account name their destination — 13 of 13, no exception, from the 35,900
// view post down to the 632 one (`research/own-covers-transcribed.json`).
// 12 of the 13 highest-saving covers in the 847-deck corpus do the same. It is
// the only cover property this project has found that is unanimous.
//
// Both decks he complained about failed it and no gate noticed:
//   tt-28 Larnaca  "שעה טיסה מתל אביב / ורובם עושים את זה לא נכון"  — no Larnaca
//   tt-27 Amalfi   "טסתם לרומא?"                                      — names ROME
//
// The second is the worse failure: a cover that names a DIFFERENT place than
// the deck is about. So the check is two-sided — the destination must appear,
// and no other destination may appear without it.

/** Strip emoji and punctuation so a name matches however it is decorated. */
const plain = (s) => String(s ?? '')
  .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/gu, ' ')
  .replace(/[?!.,:;'"()\u05be-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

/** Every line of text the cover shows. */
export function coverText(spec) {
  const s = (spec.slides || [])[0] || {};
  return [s.titleCaps, s.title, s.line, s.sub, s.note, ...(s.lines || [])]
    .filter(Boolean).map(String).join(' \u2022 ');
}

/**
 * @param {object} spec a deck spec carrying `place` (the destination in Hebrew,
 *   as a viewer would search it) and optionally `placeAlso` (accepted variants)
 * @returns {string[]} problems, empty when the cover names its destination
 */
export function checkCover(spec) {
  const problems = [];
  const text = plain(coverText(spec));
  if (!text) return ['the cover has no text at all'];

  const place = spec.place;
  if (!place) {
    return [`the deck has no \`place\` — add the destination in Hebrew, the word `
      + `a viewer would search, so the cover can be checked against it`];
  }
  const names = [place, ...(spec.placeAlso || [])].map(plain);
  const hit = names.find((n) => n && text.includes(n));
  if (!hit) {
    problems.push(`the cover never says "${place}" — it reads "${coverText(spec)}". `
      + 'All 13 of his own travel covers name their destination (13/13, '
      + 'research/own-covers-transcribed.json); a viewer searching for it would '
      + 'not know this deck is about it');
  }

  // A cover that names somewhere else instead is the Amalfi failure: the deck
  // was the Amalfi coast and the cover said Rome.
  const ELSEWHERE = [
    'רומא', 'מילאנו', 'ונציה', 'פירנצה', 'נאפולי', 'פריז', 'לונדון', 'ברלין',
    'מדריד', 'ברצלונה', 'ליסבון', 'אתונה', 'רודוס', 'כרתים', 'סנטוריני',
    'לרנקה', 'פאפוס', 'אייה נאפה', 'תאילנד', 'בנגקוק', 'טוקיו', 'דובאי',
    'איסטנבול', 'בודפשט', 'פראג', 'אמסטרדם', 'וינה', 'ורשה', 'תל אביב',
  ].filter((c) => !names.some((n) => n.includes(plain(c)) || plain(c).includes(n)));
  const strays = ELSEWHERE.filter((c) => text.includes(plain(c)));
  if (strays.length) {
    problems.push(`the cover names ${strays.join('/')} but the deck is about ${place} — `
      + 'a cover that announces a different place sends the wrong audience');
  }
  return problems;
}
