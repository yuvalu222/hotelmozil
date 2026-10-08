// Refuse a frame that rendered nothing.
//
// WHY. The new route deck shipped eight slides that were almost entirely
// black — one stray red pill on an empty field — and every gate passed it.
// The frame check said "every slide fits and clears the TikTok UI", which was
// true and useless: it measures where text SITS, and text that was never
// drawn sits nowhere and therefore collides with nothing.
//
// The cause was a missing `skin: "clone"`, so the renderer used the old
// template, which has none of the layout's CSS. Any future wiring mistake of
// that shape produces the same silent black deck.
//
// This looks at the pixels that were actually written. Three ways a frame can
// be empty, each with its own message:
//
//   nothing bright   no type, no photo — the layout did not render
//   almost no edges  a flat field, which is a backdrop with nothing on it
//   near-black       the scrim rendered and the content did not
//
//   node analyze/ink-check.mjs [deck-id ...]

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ids = process.argv.slice(2);
const decks = (ids.length ? ids : fs.readdirSync('out'))
  .filter((d) => !d.startsWith('_'))
  .filter((d) => { try { return fs.statSync(path.join('out', d)).isDirectory(); } catch { return false; } });

const browser = await chromium.launch({
  channel: 'chrome', headless: true,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
});
const page = await browser.newPage();
await page.setContent('<!doctype html><title>ink</title><body></body>');
await page.addScriptTag({ content: `
window.__ink = async (uri) => {
  const im = new Image();
  await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = uri; });
  const W = 220, H = Math.max(1, Math.round(W * im.height / im.width));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const n = W * H;
  const lum = new Float32Array(n);
  let bright = 0, dark = 0;
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const l = 0.2126 * d[i] + 0.7152 * d[i+1] + 0.0722 * d[i+2];
    lum[p] = l;
    if (l > 200) bright++;      // white type, white boxes, a lit photo
    if (l < 24) dark++;         // effectively black
  }
  // Edge density: a rendered slide has type and photo borders; an empty one
  // has a smooth gradient and almost nothing.
  let edges = 0, cells = 0;
  for (let y = 1; y < H; y++) for (let xx = 1; xx < W; xx++) {
    if (Math.abs(lum[y*W+xx] - lum[y*W+xx-1]) > 30) edges++;
    cells++;
  }
  // Colour. A frame that failed to render is grey or black; a photograph that
  // simply happens to be smooth and mid-toned — a sunset, for one — is deeply
  // coloured. Mean chroma separates the two where brightness and edges cannot.
  let chroma = 0;
  for (let i = 0; i < d.length; i += 4) {
    const mx = Math.max(d[i], d[i+1], d[i+2]);
    const mn = Math.min(d[i], d[i+1], d[i+2]);
    chroma += mx - mn;
  }
  return { bright: bright / n, dark: dark / n, edges: edges / cells, chroma: chroma / n };
};
`});

let bad = 0;
for (const deck of decks) {
  const dir = path.join('out', deck);
  const frames = fs.readdirSync(dir).filter((f) => /-tiktok\.jpg$/.test(f)).sort();
  const notes = [];
  for (const f of frames) {
    const uri = `data:image/jpeg;base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}`;
    const m = await page.evaluate((u) => window.__ink(u), uri);
    // Thresholds from the failure itself: the black slides measured
    // bright≈0.004 and edges≈0.002. A real slide of ours runs bright 0.06-0.30
    // and edges 0.05-0.25.
    // ⚠️ Chroma is in this test because the two-signal version cried wolf on
    // 8.10: a Cyprus sunset closing slide measured bright 1.5%, edges 1.6% and
    // was reported as "rendered almost nothing" — it is one of the best frames
    // in the set. Its chroma is ~90. The black slides this check was built for
    // measure under 10. A gate that fires on good work teaches you to ignore it.
    if (m.bright < 0.02 && m.edges < 0.02 && m.chroma < 25) {
      notes.push(`${f}: rendered almost nothing — bright ${(m.bright*100).toFixed(1)}%, `
        + `edges ${(m.edges*100).toFixed(1)}%, chroma ${m.chroma.toFixed(0)}`);
    } else if (m.dark > 0.85) {
      notes.push(`${f}: ${(m.dark*100).toFixed(0)}% of the frame is black`);
    } else if (m.edges < 0.012) {
      notes.push(`${f}: flat field, no detail anywhere — edges ${(m.edges*100).toFixed(1)}%`);
    }
  }
  if (notes.length) {
    console.log(deck);
    for (const n of notes) console.log(`    ${n}`);
    bad += notes.length;
  }
}

console.log(bad ? `\n${bad} frame(s) rendered empty` : '\nevery frame has content on it');
await browser.close();
process.exit(bad ? 1 : 0);
