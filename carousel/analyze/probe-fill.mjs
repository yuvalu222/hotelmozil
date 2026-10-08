// Print, for one slide, what the check believes about every fact line: the
// box width, the unwrapped width, the fill ratio and the rendered line count.
// Used to settle the standing disagreement between this measurement and the
// rendered JPEG.
//
//   node analyze/probe-fill.mjs <spec-id> <slide-index>

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { slideMarkup2 } from '../lib/skins.js';

const [id, idxArg] = process.argv.slice(2);
const idx = Number(idxArg || 2);

const spec = JSON.parse(fs.readFileSync(path.join('specs', `${id}.json`), 'utf8'));
const browser = await chromium.launch({
  channel: 'chrome', headless: true,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(path.resolve('lib/template2.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);

const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const html = slideMarkup2(spec.slides[idx], { photos: Array(6).fill(blank), debug: false });

const rows = await page.evaluate((h) => {
  const el = document.getElementById('slide');
  el.innerHTML = h;
  const out = [];
  for (const n of el.querySelectorAll('.stk-fact')) {
    const cs = getComputedStyle(n);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const box = n.getBoundingClientRect();
    const probe = document.createElement('div');
    probe.className = n.className;
    probe.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:nowrap;width:auto;max-width:none;direction:rtl;';
    probe.innerHTML = n.innerHTML;
    el.appendChild(probe);
    const flat = probe.getBoundingClientRect().width;
    const probeFont = getComputedStyle(probe).font;
    const bold = probe.querySelector('b');
    const boldWeight = bold ? getComputedStyle(bold).fontWeight : '-';
    probe.remove();
    out.push({
      txt: (n.textContent || '').trim(),
      boxW: Math.round(box.width), flatW: Math.round(flat),
      fill: box.width ? +(flat / box.width).toFixed(3) : 0,
      lines: Math.max(1, Math.round(box.height / lh)),
      boxH: Math.round(box.height), lh: Math.round(lh),
      probeFont, boldWeight,
    });
  }
  return out;
}, html);

console.log(`${id} slide ${idx}`);
for (const r of rows) {
  console.log(`  "${r.txt}"`);
  console.log(`      box=${r.boxW} flat=${r.flatW} fill=${r.fill} `
    + `lines=${r.lines} (h=${r.boxH}/lh=${r.lh}) boldWeight=${r.boldWeight}`);
}
await browser.close();
