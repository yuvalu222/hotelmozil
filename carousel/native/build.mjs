// Research JSON + chosen photos -> deck spec -> rendered slides.
//
// One layout per format, each copied from HIS post in that format (the post
// numbers are his view ranking, harvest/own-full/items.json):
//   tips      <- #1  7675637726456073493 (62.4k)  big number, heading, body
//   transport <- #4  7678361608925482261 (36.7k)  origin heading, finger, rows
//   forbidden <- #8  7676865634118110484 (21.7k)  one heavy block at the top
//   route     <- #9  7680247925468957972 (21.0k)  "place: N nights" + list
//   places    <- #16 7677199779247508757 (8.1k)   big place heading + 3 lines
// The closing slide is one of his own folder screenshots, copied as is — he
// reuses the same screenshot across posts, and only number-free ones are used.
//
//   node native/build.mjs d3-forbidden [--render]

import fs from 'node:fs';
import path from 'node:path';
import { renderDeck } from './render.mjs';

const HERE = import.meta.dirname;
const deck = process.argv[2];
const research = JSON.parse(fs.readFileSync(path.join(HERE, 'research', `${deck}.json`), 'utf8'));
const picks = JSON.parse(fs.readFileSync(path.join(HERE, 'picks.json'), 'utf8'))[deck];
if (!picks) throw new Error(`no photo picks for ${deck} in native/picks.json`);

const photo = (p) => ({ photo: `native/pool/full/${p.id}.jpg`, focus: p.focus || [0.5, 0.5] });
const L = (t, s, x = {}) => ({ t, s, ...x });
const gap = (h) => ({ t: '', h });
const red = (line, word) => (word && line.includes(word) ? line.replace(word, `{red}${word}{/red}`) : line);

const FOLDER = {
  // his own closers, text as he wrote it (no savings figure in any of these)
  must: 'harvest/own-full/7678361608925482261/07.jpg',   // "אפליקציית חובה מבחינתי! לחסוך כסף על מלונות בחינם"
  this: 'harvest/own-full/7681254316103027989/06.jpg',   // "זאת האפליקציה מוזיל מלונות בכל העולם תורידו שלא תשכחו!"
  personal: 'harvest/own-full/7676865634118110484/06.jpg', // "זו האפליקציה, מנסיון אישי היא חסכה לי המון בטיול (;"
  tip: 'harvest/own-full/7682476408320380180/08.jpg',    // "וטיפ אישי לחסוך כסף, תורידו את האפליקציה הזו שמוזילה מחירים במלונות"
};

const slides = [];
const c = research.cover;

if (deck.startsWith('d1')) {
  slides.push({ ...photo(picks.cover), top: 0.2, lines: c.lines.map((t) => L(t, 'l')) });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.085,
    lines: [L(String(s.n), 'num'), gap(0.075), L(s.heading, 'l'), gap(0.07), ...s.body.map((b) => L(b, 's'))],
  }));
  slides.push({ copy: FOLDER[picks.folder || 'must'] });
} else if (deck.startsWith('d2')) {
  slides.push({ ...photo(picks.cover), top: 0.36, lines: c.lines.map((t) => L(t, 's')) });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.075,
    lines: [L(s.heading, 'l'), ...(s.sub ? [L(s.sub, 's')] : []), L('👇🏻', 's'), gap(0.03), ...s.rows.map((r) => L(`${r.dest}${r.emoji} - ${r.mode}`, 's', { lh: 1.28 }))],
  }));
  slides.push({ ...photo(picks.last), top: 0.13, width: 0.86, lines: [L(research.last.lines[0], 's'), gap(0.045), L(research.last.lines[1], 's')] });
  slides.push({ copy: FOLDER[picks.folder || 'this'] });
} else if (deck.startsWith('d3')) {
  slides.push({ ...photo(picks.cover), blocks: [
    { top: 0.16, lines: [L(c.lines[0], 'xl', { w: 700 }), gap(0.04), L(red(c.lines[1], c.red), 'xl', { w: 700 }), gap(0.04), L(c.lines[2], 'xl', { w: 700 })] },
    { top: 0.84, lines: [L(c.bottom, 'xs')] },
  ] });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.07, width: 0.86,
    lines: [s.heading, ...s.body].map((t) => L(t, 's', { w: 700, lh: 1.18 })),
  }));
  slides.push({ ...photo(picks.last), top: 0.07, width: 0.86, lines: research.last.lines.map((t) => L(t, 's', { w: 700, lh: 1.18 })) });
  slides.push({ copy: FOLDER[picks.folder || 'personal'] });
} else if (deck.startsWith('d4')) {
  slides.push({ ...photo(picks.cover), top: 0.2, lines: [L(red(c.lines[0], c.red), 'm'), L(c.lines[1], 'm'), gap(0.01), L(c.lines[2], 'm')] });
  research.slides.forEach((s, i) => slides.push({
    ...photo(picks.slides[i]), top: 0.19,
    lines: [L(s.heading, 'm'), gap(0.1), ...s.lines.map((t) => L(t, 's', { lh: 1.25 }))],
  }));
  slides.push({ ...photo(picks.last), top: 0.36, width: 0.8, lines: research.last.lines.map((t) => L(t, 's')) });
  slides.push({ copy: FOLDER[picks.folder || 'tip'] });
} else if (deck.startsWith('d5')) {
  slides.push({ ...photo(picks.cover), blocks: [
    { top: 0.22, lines: c.lines.map((t) => L(red(t, c.red), 'l')) },
    { top: 0.8, lines: [L(c.bottom, 'xs')] },
  ] });
  research.slides.forEach((s, i) => {
    slides.push({ ...photo(picks.slides[i]), top: 0.17, lines: [L(s.heading, 'xl'), gap(0.035), ...s.lines.map((t) => L(t, 'm'))] });
    if (research.extra && i === picks.extraAfter) slides.push({ ...photo(picks.extra), top: 0.11, lines: research.extra.lines.map((t) => L(t, 'm')) });
  });
  slides.push({ ...photo(picks.last), top: 0.4, width: 0.86, lines: research.last.lines.map((t) => L(t, 'm')) });
  slides.push({ copy: FOLDER[picks.folder || 'must'] });
}

const spec = { name: deck, slides };
fs.mkdirSync(path.join(HERE, 'decks'), { recursive: true });
const specPath = path.join(HERE, 'decks', `${deck}.json`);
fs.writeFileSync(specPath, JSON.stringify(spec, null, 1));
console.log(`${deck}: ${slides.length} slides -> ${specPath}`);
if (process.argv.includes('--render')) await renderDeck(specPath);
