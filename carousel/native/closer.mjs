// How every deck carries the app (owner, 18.10):
// - The last slide is one of HIS folder screenshots saying how much the app
//   saved him, copied as is, never written by us. His pick: the 590 one
//   (post 7692513891271593237, 3.10): "טיפ חובה! האפליקציה הזאת מוזילה
//   מלונות וחסכה לי 590₪ על המלון!!!".
// - Mid-deck, a two-line app mention under the slide text, the one he called
//   amazing and wants in every deck (first used in the batch-3 decks).
export const CLOSER = { copy: 'harvest/own-full/7692513891271593237/07.jpg' };

export const appLine = (where = 'בתאילנד', top = 0.8) => ({ top, width: 0.9, lines: [
  { t: 'אפליקציית HotelMozil מוזילה', s: 's' },
  { t: `מלונות ${where} ובכל יעד אחר 🤫`, s: 's' },
] });

// Adds the mention to the middle slide of a deck (cover included, closer not
// yet pushed), turning a single-block slide into blocks.
export function addAppLine(slides, where, at, top) {
  const s = slides[at ?? Math.floor(slides.length / 2)];
  const blocks = s.blocks || [{ top: s.top ?? 0.18, lines: s.lines }];
  delete s.top; delete s.lines;
  s.blocks = [...blocks, appLine(where, top)];
}
