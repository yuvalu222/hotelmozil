import { chromium } from 'playwright';
import fs from 'node:fs';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
await p.setContent('<!doctype html><title>s</title><body></body>');
const b64 = fs.readFileSync('assets/own-close/branded-card.jpg').toString('base64');
const hits = await p.evaluate(async (u) => {
  const im = new Image();
  await new Promise(r => { im.onload = r; im.src = u; });
  const c = document.createElement('canvas');
  c.width = im.width; c.height = im.height;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const counts = new Map();
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i+1], bl = d[i+2];
    // clearly green type: green dominant, bright, not grey
    if (g > 140 && g - r > 40 && g - bl > 40) {
      const k = `${r>>4<<4},${g>>4<<4},${bl>>4<<4}`;
      counts.set(k, (counts.get(k) || 0) + 1);
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
}, `data:image/jpeg;base64,${b64}`);
console.log('his green, most common first:');
for (const [k, n] of hits) {
  const [r, g, bl] = k.split(',').map(Number);
  console.log(`  rgb(${r},${g},${bl})  #${[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join('')}  ${n} px`);
}
await b.close();
