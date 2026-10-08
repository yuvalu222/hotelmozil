// Measure what a slide actually looks like, in numbers, so "too much text"
// and "not flashy enough" stop being opinions.
//
// Run over the harvested corpus, every frame is scored on:
//
//   textCover   fraction of the frame covered by text-like pixels
//   textTop     where the text band starts, 0 = top of frame, 1 = bottom
//   textRows    how many distinct rows of text there are
//   colourful   Hasler-Susstrunk colourfulness (the standard metric)
//   sat         mean saturation
//   contrast    standard deviation of luminance
//   dark        fraction of pixels below 25% luminance
//   busy        edge density outside the text band, i.e. how much is going on
//
// Text is found without OCR: glyphs make dense, short-range luminance
// gradients in horizontal runs, which a photograph almost never does over a
// whole row. The per-row gradient profile gives both coverage and position.
//
//   node analyze/measure-slides.mjs <glob-dir> [limit]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.argv[2] || 'harvest/tt-decks';
const LIMIT = Number(process.argv[3] || 0);
const BS = String.fromCharCode(92);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.goto('about:blank');
// A real document, because a canvas in about:blank is tainted for getImageData
// in some builds — that bug silently returned null once already.
await page.setContent('<!doctype html><title>m</title><body></body>');

await page.addScriptTag({ content: `
window.measure = async (dataUri) => {
  const img = new Image();
  await new Promise((ok, no) => { img.onload = ok; img.onerror = no; img.src = dataUri; });
  const W = 180, H = Math.max(1, Math.round(W * img.height / img.width));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;

  const lum = new Float32Array(W * H);
  let rs = 0, gs = 0, bs = 0, satSum = 0, dark = 0;
  const rg = [], yb = [];
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    lum[p] = l;
    if (l < 64) dark++;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    satSum += mx ? (mx - mn) / mx : 0;
    rg.push(r - g); yb.push(0.5 * (r + g) - b);
    rs += r; gs += g; bs += b;
  }
  const n = W * H;
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const sd = (a, m) => Math.sqrt(a.reduce((s, v) => s + (v - m) * (v - m), 0) / a.length);
  const mrg = mean(rg), myb = mean(yb);
  // Hasler & Susstrunk 2003: a perceptual colourfulness score.
  const colourful = Math.sqrt(sd(rg, mrg) ** 2 + sd(yb, myb) ** 2)
                  + 0.3 * Math.sqrt(mrg * mrg + myb * myb);
  let lmean = 0; for (let p = 0; p < n; p++) lmean += lum[p]; lmean /= n;
  let lvar = 0; for (let p = 0; p < n; p++) lvar += (lum[p] - lmean) ** 2;
  const contrast = Math.sqrt(lvar / n);

  // Horizontal gradient: text has many strong, closely spaced transitions.
  const rowScore = new Float32Array(H);
  const strong = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    let hits = 0;
    for (let xx = 1; xx < W; xx++) {
      const g = Math.abs(lum[y * W + xx] - lum[y * W + xx - 1]);
      if (g > 55) { hits++; strong[y * W + xx] = 1; }
    }
    rowScore[y] = hits / W;
  }
  // A text row is one with many transitions; a photo edge gives a few.
  const TEXT_ROW = 0.14;
  const textRowsIdx = [];
  for (let y = 0; y < H; y++) if (rowScore[y] >= TEXT_ROW) textRowsIdx.push(y);
  let textCover = 0;
  for (const y of textRowsIdx) for (let xx = 0; xx < W; xx++) textCover += strong[y * W + xx];
  textCover /= n;

  // Group contiguous text rows into bands, so "rows of text" is countable.
  let bands = 0, last = -5;
  for (const y of textRowsIdx) { if (y - last > 2) bands++; last = y; }
  const textTop = textRowsIdx.length ? textRowsIdx[0] / H : null;
  const textBottom = textRowsIdx.length ? textRowsIdx[textRowsIdx.length - 1] / H : null;

  // Busyness of the part of the frame that is NOT text.
  let busy = 0, busyN = 0;
  const inText = new Set(textRowsIdx);
  for (let y = 1; y < H; y++) {
    if (inText.has(y)) continue;
    for (let xx = 1; xx < W; xx++) {
      busy += Math.abs(lum[y * W + xx] - lum[y * W + xx - 1]) > 24 ? 1 : 0;
      busyN++;
    }
  }
  return {
    textCover: +textCover.toFixed(4),
    textRows: bands,
    textTop: textTop === null ? null : +textTop.toFixed(3),
    textBottom: textBottom === null ? null : +textBottom.toFixed(3),
    textSpan: textTop === null ? 0 : +(textBottom - textTop).toFixed(3),
    colourful: +colourful.toFixed(1),
    sat: +(satSum / n).toFixed(3),
    contrast: +contrast.toFixed(1),
    dark: +(dark / n).toFixed(3),
    busy: busyN ? +(busy / busyN).toFixed(3) : 0,
  };
};
`});

const decks = fs.readdirSync(ROOT).filter((d) => {
  try { return fs.statSync(path.join(ROOT, d)).isDirectory(); } catch { return false; }
}).sort();

const out = {};
let done = 0;
for (const deck of decks) {
  const files = fs.readdirSync(path.join(ROOT, deck)).filter((f) => /\.jpg$/i.test(f)).sort();
  if (!files.length) continue;
  // Cover plus the first two content slides by default: the cover decides the
  // stop, the next two decide whether anyone keeps swiping. MEASURE_ALL=1
  // measures every frame, which is slower but lets per-position questions be
  // asked — does slide 5 look different in decks people finish?
  const pick = process.env.MEASURE_ALL
    ? files
    : [files[0], files[1], files[2]].filter(Boolean);
  const rows = [];
  for (const f of pick) {
    try {
      const b64 = fs.readFileSync(path.join(ROOT, deck, f)).toString('base64');
      rows.push(await page.evaluate((u) => window.measure(u), `data:image/jpeg;base64,${b64}`));
    } catch { /* unreadable frame */ }
  }
  if (rows.length) out[deck] = rows;
  if (++done % 25 === 0) console.log(`  ${done}/${decks.length}`);
  if (LIMIT && done >= LIMIT) break;
}

fs.mkdirSync('harvest/measure', { recursive: true });
const dest = `harvest/measure/${path.basename(ROOT)}${process.env.MEASURE_ALL ? '-all' : ''}.json`;
fs.writeFileSync(dest, JSON.stringify(out, null, 1));
console.log(`measured ${Object.keys(out).length} decks -> ${dest}`);
await browser.close();
