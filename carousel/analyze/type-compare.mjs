// Measure OUTLINED type specifically, and nothing else.
//
// v1 of this measured "rows with white pixels" and latched onto a white
// counter and pale packaging, returning stroke estimates from 5% to 17% on
// slides from the same post. Useless, and calibrating on it would have
// repeated the picker mistake.
//
// Outlined white type has a signature nothing else in a photograph has: a
// white run with a DARK run immediately on both sides. Scanning for
// dark-white-dark triples finds the glyphs and gives the stroke width for
// free — it is the length of the dark runs.
//
//   node analyze/type-compare.mjs <image> ...
import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage();
await pg.setContent('<!doctype html><title>t</title><body></body>');
await pg.addScriptTag({ content: `
window.__type = async (u) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = u; });
  const W = 720, H = Math.round(W * im.height / im.width);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const L = new Float32Array(W*H);
  for (let i=0,p=0;i<d.length;i+=4,p++) L[p] = 0.2126*d[i]+0.7152*d[i+1]+0.0722*d[i+2];

  const strokes = [], glyphRows = new Uint8Array(H);
  for (let y=0; y<H; y++) {
    let hits = 0, run = 0, state = 0, darkL = 0;
    for (let xx=0; xx<W; xx++) {
      const v = L[y*W+xx];
      const dark = v < 72, white = v > 198;
      if (state === 0) { if (dark) { state = 1; darkL = 1; } }
      else if (state === 1) { if (dark) darkL++; else if (white) { state = 2; run = 1; } else state = 0; }
      else if (state === 2) { if (white) run++; else if (dark) { state = 3; } else state = 0; }
      if (state === 3) {
        let darkR = 0, k = xx;
        while (k < W && L[y*W+k] < 72) { darkR++; k++; }
        // a glyph stem: white core, dark on both sides, both sides similar
        if (run >= 2 && run <= 90 && darkL >= 1 && darkR >= 1 && darkL <= 40 && darkR <= 40) {
          strokes.push((darkL + darkR) / 2); hits++;
        }
        state = 0; xx = k - 1;
      }
    }
    if (hits >= 3) glyphRows[y] = 1;
  }
  const bands = []; let s = -1;
  for (let y=0; y<H; y++) {
    if (glyphRows[y] && s < 0) s = y;
    if ((!glyphRows[y] || y === H-1) && s >= 0) { if (y - s >= 4) bands.push([s, y]); s = -1; }
  }
  strokes.sort((a,b)=>a-b);
  const med = strokes.length ? strokes[Math.floor(strokes.length/2)] : null;
  const tallest = bands.length ? bands.reduce((a,b)=>(b[1]-b[0])>(a[1]-a[0])?b:a) : null;
  return {
    textRows: bands.length,
    glyphHeightPctOfW: tallest ? +(((tallest[1]-tallest[0])/W)*100).toFixed(2) : null,
    strokePx720: med ? +med.toFixed(1) : null,
    strokePctOfGlyph: (med && tallest) ? +((med/(tallest[1]-tallest[0]))*100).toFixed(1) : null,
    samples: strokes.length,
    firstTextTopPct: bands.length ? +((bands[0][0]/H)*100).toFixed(1) : null,
  };
};`});
for (const f of process.argv.slice(2)) {
  const b64 = fs.readFileSync(f).toString('base64');
  const r = await pg.evaluate((u)=>window.__type(u), `data:image/jpeg;base64,${b64}`);
  const tag = f.includes('own') ? 'HIS ' : 'MINE';
  console.log(`${tag} ${f.split(/[\/]/).slice(-2).join('/').padEnd(34)}` +
    ` glyph ${String(r.glyphHeightPctOfW).padStart(5)}% of W  stroke ${String(r.strokePctOfGlyph).padStart(5)}%` +
    `  rows ${String(r.textRows).padStart(2)}  n=${r.samples}`);
}
await b.close();
