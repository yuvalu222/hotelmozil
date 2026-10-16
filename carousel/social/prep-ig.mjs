// Fit a deck folder to Instagram 4:5 (1080x1350) with the mirror's fitter,
// so text is never cropped.  node social/prep-ig.mjs <in-folder> <out-folder>
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fitSlide } from '../ig/lib/fit.mjs';
const [src, dst] = process.argv.slice(2);
fs.mkdirSync(dst, { recursive: true });
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage();
for (const f of fs.readdirSync(src).filter((x) => /^\d\d\.jpg$/.test(x)).sort()) {
  const r = await fitSlide(p, fs.readFileSync(path.join(src, f)));
  fs.writeFileSync(path.join(dst, f), r.buffer);
  console.log(f, r.mode, r.size.join('x'));
}
await b.close();
