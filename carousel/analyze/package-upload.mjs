// Put every finished deck somewhere you can actually upload from.
//
// The renderer leaves slides as `out/<deck>/07-tiktok.jpg`, which is right for
// reviewing and wrong for uploading: the picker sorts by filename, the `-ig`
// copies are in the way, and the caption lives in a JSON file.
//
// This writes one plain folder per deck — 01.jpg, 02.jpg, … in order, plus a
// caption.txt you can paste — and zips the lot so it can go to a phone in one
// send.
//
//   node analyze/package-upload.mjs            -> Desktop/HotelMozil-TikTok
//   node analyze/package-upload.mjs <dest-dir>

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { viewerHtml } from '../lib/viewer.js';

const DEST = process.argv[2]
  || path.join(os.homedir(), 'Desktop', 'HotelMozil-TikTok');

const decks = fs.readdirSync('out')
  .filter((d) => d.startsWith('tt-') && fs.statSync(path.join('out', d)).isDirectory())
  .sort((a, b) => {
    const n = (s) => Number(s.match(/^tt-(\d+)/)?.[1] ?? 0);
    return n(a) - n(b);
  });

fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

const specOf = (deck) => {
  const p = path.join('specs', `${deck}.json`);
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
};

let decksOut = 0;
let slidesOut = 0;
const index = [];
const viewer = [];

for (const deck of decks) {
  const slides = fs.readdirSync(path.join('out', deck))
    .filter((f) => /^\d+-tiktok\.jpg$/.test(f))
    .sort();
  if (!slides.length) continue;

  const spec = specOf(deck);
  const folder = path.join(DEST, deck);
  fs.mkdirSync(folder, { recursive: true });

  slides.forEach((f, i) => {
    // Renamed, not just copied: the upload picker orders by filename, and
    // "10-tiktok" sorts before "2-tiktok" unless every number is padded.
    const to = path.join(folder, `${String(i + 1).padStart(2, '0')}.jpg`);
    fs.copyFileSync(path.join('out', deck, f), to);
    slidesOut++;
  });

  // His own two closing frames, appended untouched. Every post on
  // @hotelmozil ends on this pair — the tease ("if only there were an app
  // that made hotels free") and the card that answers it ("does exactly
  // that") — and they are his artwork, so they are copied rather than
  // re-rendered. Re-encoding them through the slide pipeline would crop the
  // App Store badge off the bottom.
  let n = slides.length;
  for (const rel of spec.ownClose || []) {
    if (!fs.existsSync(rel)) { console.log(`  missing ${rel}`); continue; }
    n += 1;
    fs.copyFileSync(rel, path.join(folder, `${String(n).padStart(2, '0')}.jpg`));
    slidesOut++;
  }

  const tags = (spec.hashtags || []).map((t) => `#${t}`).join(' ');
  const caption = [
    spec.caption || '',
    tags,
    '',
    `סאונד: ${spec.sound || 'בחר סאונד טרנדי ביום ההעלאה.'}`,
    `${n} שקופיות (${slides.length} + שתי שקופיות הסגירה שלך) · מקור: @${spec.clonedAccount || '?'}`,
  ].join('\n');
  // No BOM. It was added so Notepad would not render the Hebrew as mojibake,
  // but Windows has detected UTF-8 without one for years, and the cost is real:
  // the natural way to use this file is select-all and paste, which carried an
  // invisible U+FEFF straight into the post. Invisible characters in his text
  // are a standing problem, so the file is written plain.
  fs.writeFileSync(path.join(folder, 'caption.txt'), caption, 'utf8');

  const built = Math.max(...slides.map((f) => fs.statSync(path.join('out', deck, f)).mtimeMs));
  viewer.push({ deck, n, title: spec.title || deck, caption: spec.caption || '', tags, built });
  index.push(`${deck}  —  ${n} שקופיות`);
  decksOut++;
}

fs.writeFileSync(
  path.join(DEST, '_README.txt'),
  '﻿' + [
    'כל קרוסלה בתיקייה משלה.',
    'התמונות ממוספרות 01, 02, 03 — להעלות בסדר הזה.',
    'caption.txt מכיל את הכיתוב וההאשטגים להעתקה.',
    '',
    ...index,
  ].join('\n'),
  'utf8',
);

// A photo carousel is laid out at ONE aspect ratio, so a deck that mixes
// them gets its odd slides letterboxed or cropped by the app. That is what he
// reported on 8.10 as "my closer isn't the right size": his two closing frames
// were 1920x2560 and every rendered slide 1080x1920. Fixed at source, and
// checked here so it cannot come back through a new asset.
function jpegSize(file) {
  const b = fs.readFileSync(file);
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xFF) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      return `${b.readUInt16BE(i + 7)}x${b.readUInt16BE(i + 5)}`;
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}
let mixed = 0;
for (const d of fs.readdirSync(DEST)) {
  const dir = path.join(DEST, d);
  if (!fs.statSync(dir).isDirectory()) continue;
  const sizes = {};
  for (const f of fs.readdirSync(dir).filter((x) => /^d+.jpg$/.test(x))) {
    const s = jpegSize(path.join(dir, f));
    if (s) (sizes[s] = sizes[s] || []).push(f);
  }
  const keys = Object.keys(sizes);
  if (keys.length > 1) {
    mixed++;
    console.log(`  !! ${d} mixes ${keys.length} sizes — TikTok lays a carousel out at one ratio:`);
    for (const k of keys) console.log(`       ${k}  ${sizes[k].join(', ')}`);
  }
}
console.log(mixed ? `${mixed} deck(s) mix aspect ratios` : 'every deck is one size throughout');

// The review page is generated here, not written by hand into the folder:
// this directory is deleted and rebuilt on every run, so a hand-placed file
// vanishes on the next package and the link he saved 404s.
fs.writeFileSync(path.join(DEST, 'review.html'), viewerHtml(viewer), 'utf8');

// "New" = rendered within six hours of the most recent render in the set.
// A rebuild of one deck does not make the other twenty-five new.
const newest = Math.max(...viewer.map((v) => v.built));
const fresh = viewer.filter((v) => newest - v.built < 6 * 3600 * 1000)
  .sort((a, b) => b.built - a.built);
fs.writeFileSync(path.join(DEST, 'review-new.html'), viewerHtml(fresh, { onlyNew: true }), 'utf8');
console.log(`review-new.html: ${fresh.map((v) => v.deck).join(', ')}`);

// One file to send to a phone. PowerShell ships with Windows, so there is no
// dependency to install.
const zip = `${DEST}.zip`;
fs.rmSync(zip, { force: true });
try {
  // path.join, not a template string: writing the separators by hand produced
  // "C:\WINDOWSSystem32WindowsPowerShell1.0powershell.exe" — every backslash
  // swallowed as an escape — and the zip step then failed on every run.
  execFileSync(process.env.SystemRoot
      ? path.join(process.env.SystemRoot, 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
      : 'powershell', ['-NoProfile', '-Command',
    `Compress-Archive -Path '${DEST}\\*' -DestinationPath '${zip}' -Force`],
  { stdio: 'ignore' });
} catch {
  console.error('!! ZIP NOT CREATED — the folder is complete but there is no file to send to a phone');
}

console.log(`${decksOut} decks, ${slidesOut} slides -> ${DEST}`);
if (fs.existsSync(zip)) {
  console.log(`zip -> ${zip}  (${(fs.statSync(zip).size / 1e6).toFixed(1)} MB)`);
}
