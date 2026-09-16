// Phase 3 support — tile a deck's slides into one contact sheet.
//
// The brief is explicit that whole decks must be viewed, not single slides
// ("ברור שדקים מלאים איך תלמד משקופית אחת"), and equally explicit that images
// must not flood a context window. A contact sheet satisfies both: one image
// per deck, slides left-to-right in order, numbered, so sequence still reads.
//
// Rendering goes through Chromium, which is already a dependency — no image
// library is added for this.
//
//   node analyze/contact-sheet.mjs                 # all decks missing a sheet
//   node analyze/contact-sheet.mjs <deckDir> ...   # specific decks

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'harvest';
const SHEETS = path.join(ROOT, 'sheets');
fs.mkdirSync(SHEETS, { recursive: true });

const GAP = 10;
// Cell size is chosen per deck, not fixed. At 300px a viewer could not read the
// on-slide copy and had to open the original files instead, which defeats the
// point of a sheet. Short decks get big tiles; long ones stay within one image.
function layoutFor(n) {
  if (n <= 3) return { cols: n, cell: 620 };
  if (n <= 6) return { cols: 3, cell: 480 };
  if (n <= 12) return { cols: 4, cell: 380 };
  return { cols: 5, cell: 300 };
}

function deckDirs() {
  const dirs = [];
  for (const base of ['ig-decks', 'decks']) {
    const b = path.join(ROOT, base);
    if (!fs.existsSync(b)) continue;
    for (const d of fs.readdirSync(b)) {
      const full = path.join(b, d);
      if (fs.statSync(full).isDirectory()) dirs.push(full);
    }
  }
  return dirs;
}

const targets = process.argv.slice(2).length ? process.argv.slice(2) : deckDirs();

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
let made = 0, skipped = 0;

for (const dir of targets) {
  const id = path.basename(dir);
  const tag = path.basename(path.dirname(dir)) === 'ig-decks' ? 'ig' : 'ad';
  const outFile = path.join(SHEETS, `${tag}-${id}.jpg`);
  if (fs.existsSync(outFile)) { skipped++; continue; }

  const slides = fs.readdirSync(dir).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).sort();
  if (slides.length < 2) { skipped++; continue; }

  const { cols: COLS, cell: CELL } = layoutFor(slides.length);
  const rows = Math.ceil(slides.length / COLS);
  const W = COLS * CELL + (COLS + 1) * GAP;
  const H = rows * (CELL + 26) + (rows + 1) * GAP + 30;

  const cells = slides.map((f, i) => {
    const src = 'file:///' + path.resolve(dir, f).replace(/\\/g, '/');
    return `<figure><img src="${src}"><figcaption>${i + 1}</figcaption></figure>`;
  }).join('');

  const html = `<!doctype html><meta charset=utf8><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#111;width:${W}px;font:13px system-ui,sans-serif}
    h1{color:#bbb;font-size:13px;font-weight:600;padding:8px ${GAP}px 0}
    .g{display:grid;grid-template-columns:repeat(${COLS},${CELL}px);gap:${GAP}px;padding:${GAP}px}
    figure{width:${CELL}px}
    /* contain, not cover: the real aspect ratio and framing IS the evidence
       §4 asks for, and cropping every slide to a square destroys it */
    img{width:${CELL}px;height:${CELL}px;object-fit:contain;display:block;background:#222;border-radius:4px}
    figcaption{color:#888;text-align:center;height:22px;line-height:22px}
  </style><h1>${tag}:${id} — ${slides.length} slides</h1><div class="g">${cells}</div>`;

  const tmp = path.join(SHEETS, `_${tag}-${id}.html`);
  fs.writeFileSync(tmp, html);
  try {
    await page.setViewportSize({ width: W, height: Math.min(H, 4000) });
    await page.goto('file:///' + path.resolve(tmp).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(350);
    await page.screenshot({ path: outFile, type: 'jpeg', quality: 72, fullPage: true });
    made++;
  } catch (e) {
    console.log(`fail ${id}: ${String(e).split('\n')[0].slice(0, 80)}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

console.log(`sheets made=${made} skipped=${skipped} -> ${SHEETS}`);
await browser.close();
