// Name the element that trips the safe-area check, instead of guessing at it.
// Prints every measured node on one slide with its tag, class and rect.
//
//   node analyze/probe-safe.mjs <spec-id> [slide-index]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { slideMarkup2 } from '../lib/skins.js';

const [id, idxArg] = process.argv.slice(2);
const idx = Number(idxArg || 2);
const W = 1080, H = 1920;

const spec = JSON.parse(fs.readFileSync(path.join('specs', `${id}.json`), 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto('about:blank');
await page.setContent(fs.readFileSync('lib/template2.html', 'utf8'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const html = slideMarkup2(spec.slides[idx], { photos: [blank, blank, blank, blank, blank], debug: false });

const rows = await page.evaluate(({ html }) => {
  const el = document.getElementById('slide');
  el.innerHTML = html;
  const holdsText = (n) => [...n.childNodes]
    .some((c) => c.nodeType === 3 && c.textContent.trim().length > 0);
  const out = [];
  for (const n of el.querySelectorAll('div,p,span,img')) {
    if (n.tagName !== 'IMG' && !holdsText(n)) continue;
    const b = n.getBoundingClientRect();
    if (!b.width || !b.height) continue;
    out.push({
      tag: n.tagName, cls: n.className || '',
      t: Math.round(b.top), r: Math.round(b.right),
      l: Math.round(b.left), bo: Math.round(b.bottom),
      txt: (n.textContent || '').trim().slice(0, 22),
    });
  }
  return out;
}, { html });

console.log(`${id} slide ${idx}`);
for (const r of rows) {
  const flag = (r.t < 240 || r.r > W - 150) ? '  <-- trips' : '';
  console.log(`  ${r.tag.padEnd(4)} ${String(r.cls).padEnd(14)} `
    + `top=${String(r.t).padStart(5)} right=${String(r.r).padStart(5)} `
    + `left=${String(r.l).padStart(5)} "${r.txt}"${flag}`);
}
await browser.close();
