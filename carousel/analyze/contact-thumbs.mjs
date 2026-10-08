// Lay every thumbnail of a built deck out at full resolution, in order, so the
// subjects can actually be judged.
//
// WHY NOT A CONTACT SHEET OF WHOLE FRAMES: at 300px wide a 196px thumbnail is
// about 50px, and at that size I read a dry salt flat as a blank rectangle and
// called two correct photos wrong. The only reading that counts is the one at
// the size the thumbnail is rendered.
//
//   node analyze/contact-thumbs.mjs <deck-id>
//
// Writes contact-thumbs-<id>.png next to the project, one row per slide.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const id = process.argv[2];
if (!id) { console.error('name a deck'); process.exit(1); }

const dir = path.join('out', id);
const frames = fs.readdirSync(dir).filter((f) => /-tiktok\.jpg$/.test(f)).sort();

// Thumbnail geometry, from the stack layout: four tiles down the right side.
const THUMB = 196, GAP = 24 + 196 - 196; // row pitch is derived below
const X0 = 722, X1 = 920;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const rows = [];
for (const f of frames) {
  const b64 = fs.readFileSync(path.join(dir, f)).toString('base64');
  const strip = await page.evaluate(async ({ b64, X0, X1 }) => {
    const im = new Image();
    await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = `data:image/jpeg;base64,${b64}`; });
    // Find the tile bands by looking for rows where the thumbnail column is
    // sharply different from the blurred backdrop beside it. Simpler and more
    // robust: take the whole column and let the eye do the rest.
    const c = document.createElement('canvas');
    c.width = X1 - X0; c.height = im.height;
    c.getContext('2d').drawImage(im, -X0, 0);
    return c.toDataURL('image/png');
  }, { b64, X0, X1 });
  rows.push(strip);
}

// Compose the strips side by side.
const sheet = await page.evaluate(async ({ rows, W }) => {
  const imgs = [];
  for (const r of rows) {
    const im = new Image();
    await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = r; });
    imgs.push(im);
  }
  const h = Math.max(...imgs.map((i) => i.height));
  const c = document.createElement('canvas');
  c.width = (W + 20) * imgs.length; c.height = h;
  const x = c.getContext('2d');
  x.fillStyle = '#222'; x.fillRect(0, 0, c.width, c.height);
  imgs.forEach((im, i) => x.drawImage(im, (W + 20) * i, 0));
  return c.toDataURL('image/png');
}, { rows, W: X1 - X0 });

const out = `contact-thumbs-${id}.png`;
fs.writeFileSync(out, Buffer.from(sheet.split(',')[1], 'base64'));
console.log(`${frames.length} slides -> ${out}`);
await browser.close();
