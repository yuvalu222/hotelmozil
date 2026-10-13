// Second batch (10.10): five formats proven by OTHER creators, copied slide for
// slide in his native text style. Source decks in harvest/sources/:
//   e1-traps        <- @travel.destinations7  "TOURIST TRAPS VS ALTERNATIVES" 434K
//   e2-islands      <- @berigold "from least touristy to most underrated" 1.1M
//   e3-hotel        <- @architinerary "The only hotel you need in greece" 827K
//   e4-not-tourist  <- @italianinspo 4.6M + @holisticjess 1.9M "Small ways I avoided..."
//   e5-photospots   <- @travellingcloset1 "Best Eiffel Tower photo spots" 1.9M
//
//   node native/build2.mjs <deck> [--render]

import fs from 'node:fs';
import path from 'node:path';
import { renderDeck } from './render.mjs';

const HERE = import.meta.dirname;
const deck = process.argv[2];
const R = JSON.parse(fs.readFileSync(path.join(HERE, 'research', `${deck}.json`), 'utf8'));
const P = JSON.parse(fs.readFileSync(path.join(HERE, 'picks.json'), 'utf8'))[deck];
const photo = (p) => ({ photo: `native/pool/full/${p.id}.jpg`, focus: p.focus || [0.5, 0.5] });
const L = (t, s, x = {}) => ({ t, s, ...x });
const gap = (h) => ({ t: '', h });
const FOLDER = {
  must: 'harvest/own-full/7678361608925482261/07.jpg',
  this: 'harvest/own-full/7681254316103027989/06.jpg',
  personal: 'harvest/own-full/7676865634118110484/06.jpg',
  tip: 'harvest/own-full/7682476408320380180/08.jpg',
};
const slides = [];

if (deck === 'e1-traps') {
  slides.push({ ...photo(P.cover), top: 0.2, lines: R.cover.lines.map((t) => L(t, 'l')) });
  R.pairs.forEach((pr, i) => {
    const [a, b] = P.pairs[i];
    const one = (side, ph, label, colour) => ({ ...photo(ph), top: 0.16, lines: [
      L(`{${colour}}${label}{/${colour}}`, 'xl'), gap(0.005), L(side.place, 'xl'),
      ...(side.line ? [gap(0.02), L(side.line, 's')] : []),
    ] });
    slides.push(one(pr.trap, a, 'מלכודת תיירים ❌', 'red'));
    slides.push(one(pr.alt, b, 'במקום זה ✅', 'green'));
  });
} else if (deck === 'e2-islands') {
  slides.push({ ...photo(P.cover), top: 0.3, lines: [L(R.cover.line, 's'), L(R.cover.title, 'xl')] });
  R.islands.forEach((is, i) => slides.push({ ...photo(P.slides[i]), top: 0.26, width: 0.84, lines: [L(is.label, 's'), L(is.place, 'xl'), ...(is.line ? [gap(0.012), L(is.line, 's')] : [])] }));
} else if (deck === 'e3-hotel') {
  slides.push({ ...photo(P.cover), top: 0.62, lines: R.cover.lines.map((t) => L(t, 'l')) });
  R.slides.forEach((s, i) => slides.push({ ...photo(P.slides[i]), top: 0.62, lines: [L(s.line, 'm')] }));
  slides.push({ ...photo(P.last), top: 0.15, lines: [L(R.last.line, 'm')] });
} else if (deck === 'e4-not-tourist') {
  slides.push({ ...photo(P.cover), top: 0.6, lines: R.cover.lines.map((t) => L(t, 'l')) });
  R.slides.forEach((s, i) => slides.push({ ...photo(P.slides[i]), top: 0.08, lines: [L(s.heading, 'l'), gap(0.02), ...s.lines.map((t) => L(t, 's'))] }));
  slides.push({ ...photo(P.last), top: 0.4, lines: R.last.lines.map((t) => L(t, 'm')) });
} else if (deck === 'e5-photospots') {
  slides.push({ ...photo(P.cover), top: 0.12, lines: R.cover.lines.map((t, i) => L(t, i ? 'm' : 'xl')) });
  R.spots.forEach((s, i) => slides.push({ ...photo(P.slides[i]), top: P.slides[i].top ?? 0.12, width: 0.84, lines: [L(s.pin, 'm'), ...(s.line ? [gap(0.01), L(s.line, 's')] : [])] }));
}
slides.push({ copy: FOLDER[P.folder || 'must'] });

const spec = { name: deck, slides };
const specPath = path.join(HERE, 'decks', `${deck}.json`);
fs.writeFileSync(specPath, JSON.stringify(spec, null, 1));
console.log(`${deck}: ${slides.length} slides`);
if (process.argv.includes('--render')) await renderDeck(specPath);
