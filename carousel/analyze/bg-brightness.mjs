// Mean luminance of the backdrop, ours against the precedent's, measured in
// the margins where no tile or text sits. The precedent's backdrop is a bright
// blurred photograph; ours came out nearly black, and "looks dark" is not a
// number.
//
//   node analyze/bg-brightness.mjs <file> [<file> ...]
import fs from 'node:fs';
import { chromium } from 'playwright';
const files = process.argv.slice(2);
const br = await chromium.launch({ channel: 'chrome', headless: true });
const p = await br.newPage();
await p.setContent('<body></body>');
for (const f of files) {
  const b64 = fs.readFileSync(f).toString('base64');
  const r = await p.evaluate(async (uri) => {
    const im = new Image();
    await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = uri; });
    const c = document.createElement('canvas');
    c.width = im.width; c.height = im.height;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(im, 0, 0);
    // the left sixth and the bottom eighth: backdrop in both layouts
    const sample = (sx, sy, sw, sh) => {
      const d = x.getImageData(sx, sy, sw, sh).data;
      let s = 0;
      for (let i = 0; i < d.length; i += 4) s += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
      return s / (d.length / 4);
    };
    return {
      w: im.width, h: im.height,
      left: sample(0, Math.round(im.height * 0.2), Math.round(im.width / 7), Math.round(im.height * 0.5)),
      bottom: sample(0, Math.round(im.height * 0.88), im.width, Math.round(im.height * 0.1)),
    };
  }, `data:image/jpeg;base64,${b64}`);
  console.log(`${String(Math.round(r.left)).padStart(3)}  left   ${String(Math.round(r.bottom)).padStart(3)}  bottom   ${f}`);
}
await br.close();
