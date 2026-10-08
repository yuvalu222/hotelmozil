// Objective pixel measures for every cover in the coding key.
//
// The eye-coding is blind to performance but it is still a judgement. These
// numbers are not: the same function reads every image. Measured on the
// central 9:16 window so that 3:4 covers and 9:16 covers are compared on the
// part a phone actually shows.
//
//   brightness   mean luminance, 0-255
//   contrast     standard deviation of luminance
//   colourful    Hasler & Susstrunk (2003) colourfulness metric
//   saturation   mean HSV saturation, 0-1
//   busy         share of pixels on a hard luminance edge
//   warm         share of pixels whose hue is red/orange/yellow and saturated
//   skyTop       mean blue-dominance of the top fifth (sky / sea above)
//
//   node analyze/cover-pixels.mjs     -> research/scroll-stop/cover-pixels.json

import fs from 'node:fs';
import { chromium } from 'playwright';

const key = JSON.parse(fs.readFileSync('research/scroll-stop/coding-key.json', 'utf8')).items;
const OUT = 'research/scroll-stop/cover-pixels.json';
const done = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.setContent('<body></body>');

let n = 0;
for (const [code, k] of Object.entries(key)) {
  if (done[code] || !fs.existsSync(k.file)) continue;
  const b64 = fs.readFileSync(k.file).toString('base64');
  const m = await page.evaluate(async (uri) => {
    const im = new Image();
    await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = uri; });
    // central 9:16 window, downscaled for speed
    let sw = im.width, sh = im.height;
    if (sw / sh > 9 / 16) sw = Math.round(sh * 9 / 16); else sh = Math.round(sw * 16 / 9);
    const sx = Math.round((im.width - sw) / 2), sy = Math.round((im.height - sh) / 2);
    const W = 270, H = 480;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
    const d = x.getImageData(0, 0, W, H).data;
    const N = W * H;
    const lum = new Float32Array(N);
    let sL = 0, sL2 = 0, sS = 0, warm = 0;
    let rgM = 0, rgM2 = 0, ybM = 0, ybM2 = 0;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      lum[p] = L; sL += L; sL2 += L * L;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const s = mx ? (mx - mn) / mx : 0; sS += s;
      // hue in degrees
      let h = 0;
      if (mx !== mn) {
        if (mx === r) h = ((g - b) / (mx - mn)) % 6;
        else if (mx === g) h = (b - r) / (mx - mn) + 2;
        else h = (r - g) / (mx - mn) + 4;
        h *= 60; if (h < 0) h += 360;
      }
      if (s > 0.35 && mx > 80 && (h < 60 || h > 330)) warm++;
      const rg = r - g, yb = 0.5 * (r + g) - b;
      rgM += rg; rgM2 += rg * rg; ybM += yb; ybM2 += yb * yb;
    }
    const mean = sL / N;
    const sd = Math.sqrt(Math.max(0, sL2 / N - mean * mean));
    const sdRG = Math.sqrt(Math.max(0, rgM2 / N - (rgM / N) ** 2));
    const sdYB = Math.sqrt(Math.max(0, ybM2 / N - (ybM / N) ** 2));
    const colourful = Math.sqrt(sdRG ** 2 + sdYB ** 2) + 0.3 * Math.sqrt((rgM / N) ** 2 + (ybM / N) ** 2);
    let edges = 0;
    for (let y = 1; y < H; y++) for (let xx = 1; xx < W; xx++) {
      const p = y * W + xx;
      if (Math.abs(lum[p] - lum[p - 1]) > 30 || Math.abs(lum[p] - lum[p - W]) > 30) edges++;
    }
    let sky = 0, cnt = 0;
    for (let i = 0; i < W * Math.round(H / 5) * 4; i += 4) {
      sky += (d[i + 2] - Math.max(d[i], d[i + 1])) / 255; cnt++;
    }
    return {
      brightness: +mean.toFixed(1), contrast: +sd.toFixed(1), colourful: +colourful.toFixed(1),
      saturation: +(sS / N).toFixed(3), busy: +(edges / N).toFixed(3), warm: +(warm / N).toFixed(3),
      skyTop: +(sky / cnt).toFixed(3),
    };
  }, `data:image/jpeg;base64,${b64}`).catch(() => null);
  if (m) { done[code] = m; n++; }
}
await browser.close();
fs.writeFileSync(OUT, JSON.stringify(done, null, 1));
console.log(`${n} covers measured, ${Object.keys(done).length} in total`);
