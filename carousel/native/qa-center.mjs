// Centring gate (17.10). Owner: "a lot of slides have text that is not
// straight and not in the centre of the photo, even though it tries to be".
// The cause was the safe-zone nudge sliding whole blocks sideways. This gate
// lays every slide out exactly as render.mjs does (slideHtml + fitBlocks) and
// measures every rendered text line: its centre must sit on the photo's
// vertical centre line, within TOL px (1440-wide canvas).
//   node native/qa-center.mjs <deck> ...      (deck = native/decks/<deck>.json)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { slideHtml, fitBlocks, W, H } from './render.mjs';

const TOL = 4;
const base = path.join(import.meta.dirname, '..');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H } });
let bad = 0;
for (const deck of process.argv.slice(2)) {
  const spec = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'decks', deck + '.json'), 'utf8'));
  for (const [i, s] of spec.slides.entries()) {
    if (s.copy) continue; // his own folder screenshot, not laid out by us
    await page.setContent(slideHtml(s, base), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await fitBlocks(page);
    // every VISIBLE row as the reader sees it: ink only (no spaces), grouped by row
    const rows = await page.evaluate((W) => {
      const out = [];
      for (const ln of document.querySelectorAll('.ln')) {
        const boxes = [];
        const walk = (n) => {
          if (n.nodeType === 3) {
            for (let k = 0; k < n.data.length; k++) {
              if (/\s/.test(n.data[k])) continue;
              const rg = document.createRange(); rg.setStart(n, k); rg.setEnd(n, k + 1);
              for (const q of rg.getClientRects()) if (q.width) boxes.push({ l: q.left, r: q.right, y: Math.round((q.top + q.bottom) / 2), emo: false });
            }
          } else if (n.nodeName === 'IMG') {
            const q = n.getBoundingClientRect(); boxes.push({ l: q.left, r: q.right, y: Math.round((q.top + q.bottom) / 2), emo: true });
          } else n.childNodes.forEach(walk);
        };
        walk(ln);
        const groups = [];
        for (const b of boxes) { const g = groups.find((x) => Math.abs(x.y - b.y) < 20); if (g) g.items.push(b); else groups.push({ y: b.y, items: [b] }); }
        for (const g of groups) {
          const l = Math.min(...g.items.map((b) => b.l)), r = Math.max(...g.items.map((b) => b.r));
          // an emoji-only row is a fault only when the line also has words (it wrapped);
          // a line written as emoji alone is his cover's emoji row, on purpose
          const hasWords = boxes.some((b) => !b.emo);
          out.push({ t: ln.innerText.replace(/\s+/g, ' ').slice(0, 34), off: (l + r) / 2 - W / 2, emojiOnly: hasWords && g.items.every((b) => b.emo) });
        }
      }
      return out;
    }, W);
    const lone = rows.find((x) => x.emojiOnly);
    if (lone) { bad++; console.log(`LONE EMOJI ${deck} slide ${String(i + 1).padStart(2, '0')}: "${lone.t}"`); }
    const worst = rows.reduce((m, x) => (Math.abs(x.off) > Math.abs(m.off) ? x : m), { off: 0, t: '' });
    if (Math.abs(worst.off) > TOL) { bad++; console.log(`OFF CENTRE ${deck} slide ${String(i + 1).padStart(2, '0')}: ${worst.off.toFixed(0)}px "${worst.t}"`); }
  }
}
await browser.close();
console.log('off-centre slides:', bad);
process.exit(bad ? 1 : 0);
