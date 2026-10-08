// Zoom into a region of a source frame, so small type can be read instead of
// guessed at. node analyze/crop.mjs <deck> <frame> <x> <y> <w> <h> [zoom]
import fs from 'node:fs';
import { chromium } from 'playwright';
const [deck, frame, x, y, w, h, z = 2] = process.argv.slice(2);
const b64 = fs.readFileSync(`harvest/tt-decks/${deck}/${frame}`).toString('base64');
const br = await chromium.launch({ channel: 'chrome', headless: true });
const p = await br.newPage({ viewport: { width: w * z | 0, height: h * z | 0 } });
await p.setContent(`<!doctype html><style>*{margin:0;padding:0}
  body{width:${w * z}px;height:${h * z}px;overflow:hidden;position:relative;background:#000}
  img{position:absolute;left:${-x * z}px;top:${-y * z}px;width:${1080 * z}px;image-rendering:auto}
</style><img src="data:image/jpeg;base64,${b64}">`, { waitUntil: 'load' });
await p.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode()))));
await p.screenshot({ path: 'out/crop.jpg', type: 'jpeg', quality: 95 });
await br.close();
console.log(`out/crop.jpg  (${deck}/${frame} at ${x},${y} ${w}x${h}, x${z})`);
