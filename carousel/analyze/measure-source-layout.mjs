// Measure a source deck's layout off its pixels, so no number in our template
// is one I chose.
//
// THE INSTRUCTION, 8.10: *"from now on, by definition, you guess nothing. Not
// the size of each tile (check the precedent you took the inspiration from),
// not what is interesting in Paris (check the precedent), not even what to do
// on each day. ... you don't need to invent the wheel, you need to do like
// what already exists and works, with no judgement of yours at all."*
//
// He is right that this is the root. Every geometric number in `tt-route` —
// tile 330x186 then 310x170, rail 56 then 100 then 110, five stops, 36px
// names — came out of my head and was then nudged until it looked acceptable.
// "Looked acceptable" is the guess.
//
// WHAT THIS MEASURES. The source frames are a blurred backdrop with sharp
// photo tiles and sharp type on top. Sharpness is the signal: a tile edge is
// a hard luminance step, the backdrop has none. So the tiles are found by
// edge density rather than by me reading coordinates off a screenshot.
//
//   node analyze/measure-source-layout.mjs <deck-id> [frame]
//   node analyze/measure-source-layout.mjs 7597919401312111894 02.jpg

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const [deck, frame = '02.jpg'] = process.argv.slice(2);
if (!deck) { console.error('usage: node analyze/measure-source-layout.mjs <deck-id> [frame]'); process.exit(1); }

const file = path.join('harvest', 'tt-decks', deck, frame);
if (!fs.existsSync(file)) { console.error(`no frame at ${file}`); process.exit(1); }

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.setContent('<!doctype html><title>m</title><body></body>');

const b64 = fs.readFileSync(file).toString('base64');
const r = await page.evaluate(async (uri) => {
  const im = new Image();
  await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = uri; });
  const W = im.width, H = im.height;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, W, H).data;

  const lum = new Float32Array(W * H);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    lum[p] = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  }

  // A pixel is "sharp" when it sits on a hard step in both directions'
  // neighbourhood. A blurred backdrop produces almost none.
  const sharp = new Uint8Array(W * H);
  for (let y = 1; y < H - 1; y++) {
    for (let xx = 1; xx < W - 1; xx++) {
      const p = y * W + xx;
      const gx = Math.abs(lum[p + 1] - lum[p - 1]);
      const gy = Math.abs(lum[p + W] - lum[p - W]);
      if (gx > 40 || gy > 40) sharp[p] = 1;
    }
  }

  // Column and row profiles of sharpness: where the content actually is.
  const col = new Float32Array(W), row = new Float32Array(H);
  for (let y = 0; y < H; y++) {
    for (let xx = 0; xx < W; xx++) {
      if (sharp[y * W + xx]) { col[xx]++; row[y]++; }
    }
  }
  const norm = (a, n) => Array.from(a, (v) => v / n);
  return { W, H, col: norm(col, H), row: norm(row, W) };
}, `data:image/jpeg;base64,${b64}`);

// Bands: runs where the profile stays above a fraction of its own peak.
function bands(profile, minRun, frac = 0.18) {
  const peak = Math.max(...profile);
  const t = peak * frac;
  const out = [];
  let start = -1;
  for (let i = 0; i < profile.length; i++) {
    if (profile[i] >= t) { if (start < 0) start = i; }
    else if (start >= 0) { if (i - start >= minRun) out.push([start, i - 1]); start = -1; }
  }
  if (start >= 0 && profile.length - start >= minRun) out.push([start, profile.length - 1]);
  return out;
}

const scale = 1080 / r.W;   // report everything in our 1080-wide frame
const at = (v) => Math.round(v * scale);

console.log(`${deck}/${frame}  source ${r.W}x${r.H}  (reported at 1080 wide, x${scale.toFixed(3)})\n`);

const FRAC = Number(process.argv[4] || 0.18);
const cols = bands(r.col, Math.round(r.W * 0.02), FRAC);
console.log('vertical bands of sharp content — the columns of the layout:');
for (const [a, b] of cols) {
  console.log(`  x ${String(at(a)).padStart(4)} .. ${String(at(b)).padStart(4)}   width ${String(at(b - a)).padStart(4)}`);
}

const rows = bands(r.row, Math.round(r.H * 0.012), FRAC);
console.log('\nhorizontal bands — the rows:');
for (const [a, b] of rows) {
  console.log(`  y ${String(at(a)).padStart(4)} .. ${String(at(b)).padStart(4)}   height ${String(at(b - a)).padStart(4)}`);
}

console.log(`\nfirst content starts at y=${rows.length ? at(rows[0][0]) : '?'}`);
console.log(`last content ends at   y=${rows.length ? at(rows[rows.length - 1][1]) : '?'}`);
console.log(`left margin  x=${cols.length ? at(cols[0][0]) : '?'}`);
console.log(`right edge   x=${cols.length ? at(cols[cols.length - 1][1]) : '?'}`);

await browser.close();
