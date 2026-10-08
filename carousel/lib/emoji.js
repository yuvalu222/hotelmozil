// Render emoji as Apple's artwork, not as whatever Windows happens to have.
//
// THE PROBLEM. The decks are rendered by headless Chrome on Windows, where the
// emoji font is Segoe UI Emoji — flat, outlined, and instantly recognisable as
// "not a phone". The owner uploads from his iPhone and the whole deck is built
// to look like something a person made on a phone, so a Segoe emoji is a tell
// in the same way a wrong font is. Earlier I dropped emoji entirely rather
// than ship the wrong ones, which solved the tell by removing a tool.
//
// 7.10, his decision: *"solve the emoji question properly. I upload this to
// TikTok from the iPhone, so use iPhone emoji. There is no copyright problem
// with it."* That is his call to make and it is recorded here as his.
//
// THE FIX. `emoji-datasource-apple` ships Apple's emoji as PNGs named by code
// point. Every emoji in the copy is swapped for an <img> holding that PNG
// inline, so the rendered JPEG carries Apple artwork and nothing depends on a
// font being installed.
//
// Naming is not uniform in the dataset — 2708-fe0f.png exists but 2708.png
// does not, while 1f600.png has no selector — so the lookup tries the full
// sequence, then the sequence without variation selectors, then with one
// added. Anything still unresolved is left as the literal character rather
// than dropped: a visible wrong-looking emoji is a bug I can see, a silently
// deleted one is not.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(HERE, '..', 'node_modules', 'emoji-datasource-apple', 'img', 'apple', '64');

// Any codepoint that can begin or continue an emoji sequence, plus ZWJ,
// variation selectors, skin-tone modifiers and keycaps.
const EMOJI_RE = /(?:\p{RI}\p{RI}|\p{Extended_Pictographic}(?:️|︎)?(?:\p{Emoji_Modifier})?(?:‍\p{Extended_Pictographic}(?:️)?(?:\p{Emoji_Modifier})?)*|[0-9#*]️⃣)/gu;

const cache = new Map();

const hex = (s) => [...s].map((c) => c.codePointAt(0).toString(16)).join('-');

/** The dataset's filename for one emoji sequence, or null. */
function fileFor(seq) {
  const full = hex(seq);
  const bare = hex([...seq].filter((c) => c !== '️' && c !== '︎').join(''));
  for (const name of [full, bare, `${bare}-fe0f`]) {
    const p = path.join(DIR, `${name}.png`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Inline <img> for one emoji, cached because a deck repeats the same few. */
function imgFor(seq) {
  if (cache.has(seq)) return cache.get(seq);
  const file = fileFor(seq);
  let html = null;
  if (file) {
    const b64 = fs.readFileSync(file).toString('base64');
    // Sized in em so it tracks whatever the surrounding type is doing, and
    // nudged down a little: Apple's glyphs sit high against Hebrew letters,
    // which have no ascender to balance them.
    html = `<img class="emo" src="data:image/png;base64,${b64}" alt="${seq}">`;
  }
  cache.set(seq, html);
  return html;
}

/**
 * Swap every emoji in a string of ALREADY-ESCAPED html for Apple artwork.
 * Must run after escaping — it injects tags.
 */
export function appleEmoji(html) {
  return String(html ?? '').replace(EMOJI_RE, (m) => imgFor(m) || m);
}

/** Does the text contain anything we would try to swap? */
export function hasEmoji(s) {
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(String(s ?? ''));
}

/** For reporting: which emoji in this text have no Apple artwork. */
export function missingEmoji(s) {
  const out = [];
  for (const m of String(s ?? '').matchAll(EMOJI_RE)) {
    if (!fileFor(m[0])) out.push(m[0]);
  }
  return [...new Set(out)];
}
