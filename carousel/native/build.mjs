// Research JSON + chosen photos -> deck spec -> rendered slides.
//
// One layout per format, each copied from HIS post in that format (the post
// numbers are his view ranking, harvest/own-full/items.json):
//   tips      <- #1  7675637726456073493 (62.4k)  big number, heading, body
//   transport <- #4  7678361608925482261 (36.7k)  origin heading, finger, rows
//   forbidden <- #8  7676865634118110484 (21.7k)  one heavy block at the top
//   route     <- #9  7680247925468957972 (21.0k)  "place: N nights" + list
//   places    <- #16 7677199779247508757 (8.1k)   big place heading + 3 lines
// The closing slide is closer.mjs: his folder screenshot, explaining the app.
//
//   node native/build.mjs d3-forbidden [--render]

import fs from 'node:fs';
import path from 'node:path';
import { renderDeck } from './render.mjs';
import { CLOSER, addAppLine } from './closer.mjs';

const HERE = import.meta.dirname;
const deck = process.argv[2];
const research = JSON.parse(fs.readFileSync(path.join(HERE, 'research', `${deck}.json`), 'utf8'));
const picks = JSON.parse(fs.readFileSync(path.join(HERE, 'picks.json'), 'utf8'))[deck];
if (!picks) throw new Error(`no photo picks for ${deck} in native/picks.json`);

const photo = (p) => ({ photo: p.file || `native/pool/full/${p.id}.jpg`, focus: p.focus || [0.5, 0.5], ...(p.zoom ? { zoom: p.zoom } : {}), ...(p.bright ? { bright: p.bright } : {}), ...(p.sat ? { sat: p.sat } : {}), ...(p.top !== undefined ? { _top: p.top } : {}) });
const L = (t, s, x = {}) => ({ t, s, ...x });
const gap = (h) => ({ t: '', h });
const red = (line, word) => (word && line.includes(word) ? line.replace(word, `{red}${word}{/red}`) : line);


const slides = [];
const c = research.cover;

if (deck.startsWith('d1')) {
  slides.push({ ...photo(picks.cover), top: 0.2, lines: c.lines.map((t) => L(t, 'l')) });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.085,
    lines: [L(String(s.n), 'num'), gap(0.075), L(s.heading, 'l'), gap(0.07), ...s.body.map((b) => L(b, 's'))],
  }));
} else if (deck.startsWith('d2')) {
  slides.push({ ...photo(picks.cover), top: 0.36, lines: c.lines.map((t) => L(t, 's')) });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.075,
    lines: [L(s.heading, 'l'), ...(s.sub ? [L(s.sub, 's')] : []), L('👇🏻', 's'), gap(0.03), ...s.rows.map((r) => L(`${r.dest}${r.emoji} - ${r.mode}`, 's', { lh: 1.28 }))],
  }));
  slides.push({ ...photo(picks.last), top: 0.13, width: 0.86, lines: [L(research.last.lines[0], 's'), gap(0.045), L(research.last.lines[1], 's')] });
} else if (deck.startsWith('d3')) {
  slides.push({ ...photo(picks.cover), blocks: [
    { top: 0.16, lines: c.lines.map((t) => L(red(t, c.red), 'l', { w: 700 })) },
    ...(c.bottom ? [{ top: 0.84, lines: [L(c.bottom, 'xs')] }] : []),
  ] });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.07, width: 0.86,
    lines: [s.heading, ...s.body].map((t) => L(t, 's', { w: 700, lh: 1.18 })),
  }));
  slides.push({ ...photo(picks.last), top: 0.07, width: 0.86, lines: research.last.lines.map((t) => L(t, 's', { w: 700, lh: 1.18 })) });
} else if (deck.startsWith('d4')) { // d4-route-main replaced the niche Andaman route (13.10: audience size first)
  slides.push({ ...photo(picks.cover), top: 0.2, lines: c.lines.map((t) => L(red(t, c.red), 'm')) });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.19,
    lines: [L(s.heading, 'm'), gap(0.1), ...s.lines.map((t) => L(t, 's', { lh: 1.25 }))],
  }));
  slides.push({ ...photo(picks.last), top: 0.36, width: 0.7, lines: research.last.lines.map((t) => L(t, 's')) });
} else if (deck.startsWith('d5')) {
  slides.push({ ...photo(picks.cover), blocks: [
    { top: c.top ?? 0.22, lines: c.lines.map((t) => L(red(t, c.red), 'xl')) },
    ...(c.bottom ? [{ top: 0.8, lines: [L(c.bottom, 'xs')] }] : []),
  ] });
  research.slides.forEach((s, i) => {
    slides.push({ ...photo(picks.slides[i]), top: 0.17, lines: [L(s.heading, 'xl'), gap(0.035), ...s.lines.map((t) => L(t, 'm'))] });
    if (research.extra && i === picks.extraAfter) slides.push({ ...photo(picks.extra), top: 0.11, lines: research.extra.lines.map((t) => L(t, 'm')) });
  });
  slides.push({ ...photo(picks.last), top: 0.4, width: 0.86, lines: research.last.lines.map((t) => L(t, 'm')) });
} else if (deck.startsWith('g1')) { // 7-Eleven products (15.10): product name big, then his short verdict lines
  slides.push({ ...photo(picks.cover), top: 0.14, lines: c.lines.map((t) => L(t, 'l')) });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.1, width: 0.86,
    lines: s.lines.map((t, j) => L(t, j ? 's' : 'l')),
  }));
}

// a pick's own "top" (picks.json) moves the text block off the landmark
for (const s of slides) if (s._top !== undefined) { if (s.blocks) s.blocks[0].top = s._top; else s.top = s._top; delete s._top; }
// 18.10 (owner): the app mention mid-deck, and his own savings screenshot last
addAppLine(slides, picks.appWhere, picks.appAt, picks.appTop);
slides.push(CLOSER);
const spec = { name: deck, slides };
fs.mkdirSync(path.join(HERE, 'decks'), { recursive: true });
const specPath = path.join(HERE, 'decks', `${deck}.json`);
fs.writeFileSync(specPath, JSON.stringify(spec, null, 1));
console.log(`${deck}: ${slides.length} slides -> ${specPath}`);
if (process.argv.includes('--render')) await renderDeck(specPath);
