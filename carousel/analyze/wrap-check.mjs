// Find lines that wrap badly: a fact that spills onto a second line carrying
// one or two words. The renderer never complained — the text fits the box, so
// every layout gate passed — but on the frame it reads as a mistake, a word
// stranded under a full line.
//
// Range.getClientRects() returns one rect per rendered line, which is the only
// honest way to count lines: the box height divided by line-height guesses,
// and a bold run or a different font changes the answer.
//
//   node analyze/wrap-check.mjs [spec-id ...]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { slideMarkup2 } from '../lib/skins.js';

const W = 1080, H = 1920;
// A line may fill this much of its column and no more. With the webfont
// actually loaded the measurement matches the renderer, so this is a modest
// safety margin rather than a fudge factor.
const FILL_MAX = 0.96;
const ids = process.argv.slice(2);
const specs = (ids.length ? ids.map((i) => `${i}.json`) : fs.readdirSync('specs'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => ({ f, spec: JSON.parse(fs.readFileSync(path.join('specs', f), 'utf8')) }));

const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--force-color-profile=srgb', '--font-render-hinting=none'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto('about:blank');
await page.setContent(fs.readFileSync('lib/template2.html', 'utf8'), { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
let total = 0;

for (const { f, spec } of specs) {
  const notes = [];
  for (const [i, slide] of spec.slides.entries()) {
    if (!slide.items?.length) continue;
    const html = slideMarkup2(slide, { photos: Array(6).fill(blank), debug: false });
    // Inject first, THEN wait for the fonts. Awaiting document.fonts.ready at
    // page load proves nothing: the page has no Heebo text yet, so no face has
    // started loading and the promise resolves immediately. Every measurement
    // taken that way was in the fallback face, which is narrower — which is
    // precisely why this check kept passing lines that wrap in the JPEG.
    // document.fonts.check('700 40px Heebo') returned false at that point.
    await page.evaluate((h) => { document.getElementById('slide').innerHTML = h; }, html);
    await page.evaluate(() => document.fonts.ready);
    const rows = await page.evaluate(() => {
      const el = document.getElementById('slide');
      const out = [];
      for (const n of el.querySelectorAll('.stk-fact, .stk-name')) {
        // Height over line-height, NOT Range.getClientRects(). The range came
        // back holding only the <b> runs — a 31-character line measured as
        // 131px — so the check cleared lines that visibly wrap in the JPEG.
        const cs = getComputedStyle(n);
        const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
        const box = n.getBoundingClientRect();
        // And measure how wide the line would be if it never wrapped, by
        // cloning it into a nowrap container with the same computed font.
        //
        // The disagreement with the renderer that made this number look
        // untrustworthy was the font-loading order above, not the measurement.
        // With the real face loaded the two agree, so the fill ratio is a real
        // number again and the ceiling can sit close to 1.
        const probe = document.createElement('div');
        // Carry the class across. Without it the `.stk-fact b` rule does not
        // apply, so the green run — font-weight 900 — was measured at the
        // container's 700 and came out narrower than it renders. That is why
        // the check kept clearing lines that wrap in the JPEG.
        probe.className = n.className;
        probe.style.cssText = `position:absolute;left:-9999px;top:0;white-space:nowrap;`
          + `width:auto;max-width:none;direction:rtl;`;
        probe.innerHTML = n.innerHTML;
        el.appendChild(probe);
        const flat = probe.getBoundingClientRect().width;
        probe.remove();
        out.push({
          cls: n.className, text: (n.textContent || '').trim(),
          lines: Math.max(1, Math.round(box.height / lh)),
          fill: box.width ? flat / box.width : 0,
        });
      }
      return out;
    }, html);

    for (const r of rows) {
      // One line per fact, no exceptions. The stack format gives each row a
      // heading and a single line under it; a fact that needs two lines is a
      // fact written too long, and in every rendered case so far the second
      // line held one or two stranded words.
      const kind = r.cls.includes('stk-name') ? 'heading' : 'fact';
      if (r.lines > 1) {
        notes.push(`slide ${i + 1}: ${kind} "${r.text.slice(0, 44)}" `
          + `renders on ${r.lines} lines`);
      } else if (r.fill > FILL_MAX) {
        notes.push(`slide ${i + 1}: ${kind} "${r.text.slice(0, 44)}" fills `
          + `${Math.round(r.fill * 100)}% of its line — too close to wrapping`);
      }
    }
  }
  if (notes.length) {
    console.log(`${f.replace('.json', '')}`);
    for (const n of notes) console.log(`    ${n}`);
  }
  total += notes.length;
}

console.log(total ? `\n${total} line(s) wrap badly` : '\nno orphaned lines');
await browser.close();
process.exit(total ? 1 : 0);
