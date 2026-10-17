// Third batch (17.10): ten Thailand decks, each copying a format proven by
// other creators (sources in harvest/sources/, listed in each research json
// under "format_source"). One generic layout, the same native text style as
// build2.mjs: white Arial with a black outline, Apple emoji, centred.
//
// research/<deck>.json
//   cover:  { top, lines: [[text, size], ...] }
//   slides: [{ top?, lines: [[text, size], ...], bottom?: { top, lines } }, ...]
// picks.json[<deck>] = { cover: {id, focus?, zoom?, top?, bright?, sat?}, slides: [...], folder }
// A pick's "top" overrides the block position (keeps text off the subject).
//
//   node native/build3.mjs <deck> [--render]
import fs from 'node:fs';
import path from 'node:path';
import { renderDeck } from './render.mjs';

const HERE = import.meta.dirname;
const deck = process.argv[2];
const R = JSON.parse(fs.readFileSync(path.join(HERE, 'research', `${deck}.json`), 'utf8'));
const P = JSON.parse(fs.readFileSync(path.join(HERE, 'picks.json'), 'utf8'))[deck];
if (!P) throw new Error(`no photo picks for ${deck} in native/picks.json`);
const FOLDER = {
  must: 'harvest/own-full/7678361608925482261/07.jpg',
  this: 'harvest/own-full/7681254316103027989/06.jpg',
  personal: 'harvest/own-full/7676865634118110484/06.jpg',
  tip: 'harvest/own-full/7682476408320380180/08.jpg',
};
const photo = (p) => ({ photo: `native/pool/full/${p.id}.jpg`, focus: p.focus || [0.5, 0.5],
  ...(p.zoom ? { zoom: p.zoom } : {}), ...(p.bright ? { bright: p.bright } : {}), ...(p.sat ? { sat: p.sat } : {}) });
const L = ([t, s]) => (t === '' ? { t: '', h: s } : { t, s });
const block = (b, top) => ({ top, ...(b.width ? { width: b.width } : {}), lines: b.lines.map(L) });

const slides = [];
const one = (src, pick, defTop) => {
  const blocks = [block(src, pick.top ?? src.top ?? defTop)];
  if (src.bottom) blocks.push(block(src.bottom, pick.bottomTop ?? src.bottom.top));
  return { ...photo(pick), width: src.width ?? 0.86, blocks };
};
slides.push(one(R.cover, P.cover, 0.14));
R.slides.forEach((s, i) => slides.push(one(s, P.slides[i], 0.12)));
slides.push({ copy: FOLDER[P.folder || 'must'] });

const spec = { name: deck, slides };
const specPath = path.join(HERE, 'decks', `${deck}.json`);
fs.writeFileSync(specPath, JSON.stringify(spec, null, 1));
console.log(`${deck}: ${slides.length} slides`);
if (process.argv.includes('--render')) await renderDeck(specPath);
