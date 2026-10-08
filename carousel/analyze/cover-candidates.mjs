// Put real cover candidates on one sheet, big enough to judge, and let the eye
// pick. This is the step that was missing.
//
// WHY. Three covers in a row were chosen by score and all three were wrong in
// a way the score could not see:
//
//   a couple silhouette at sunset   1.856 — stunning, says nothing about Cyprus
//   a flamingo at golden hour       1.688 — and it is in Volano, ITALY
//   a palm promenade with people    1.350 — overcast, winter coats, umbrellas
//
// The alt text can VETO a frame (wrong country, street-level snapshot) and it
// cannot SELECT one, because "impressive" is not in the words. The owner's
// standing rule says this outright: every image has to be a WOW, and no gate
// can judge that. So the gate narrows the field and a person looks at what is
// left.
//
//   node analyze/cover-candidates.mjs <country> "query one" "query two" ...
//
// Writes cover-candidates.png — a row of frames with their index and score —
// and prints the matching table so a choice can be made by number.

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { searchPexelsBrowser } from '../lib/stock-browser.js';
import { coverBonus } from '../lib/cover.js';

const [country, ...queries] = process.argv.slice(2);
if (!country || !queries.length) {
  console.log('usage: node analyze/cover-candidates.mjs <country> "query" ["query"...]');
  process.exit(1);
}

const seen = new Set();
const cands = [];
for (const q of queries) {
  let found = [];
  try { found = await searchPexelsBrowser(q, { perPage: 6 }); } catch (e) {
    console.error(`  "${q}": ${e.message}`);
    continue;
  }
  for (const c of found) {
    if (!c.id || seen.has(c.id)) continue;
    seen.add(c.id);
    const { factor, why } = coverBonus(c.alt || c.altRaw, country);
    cands.push({ ...c, q, factor, why });
  }
}

// Keep anything the veto did not kill, best first. A low score is still shown:
// the point of the sheet is that the number is advisory.
cands.sort((a, b) => b.factor - a.factor);
const show = cands.slice(0, 12);

console.log(`${cands.length} candidates, showing ${show.length}\n`);
show.forEach((c, i) => {
  console.log(`${String(i).padStart(2)}  ${String(c.factor).padStart(5)}  ${(c.why.join(', ') || '-').slice(0, 44).padEnd(44)}  ${(c.alt || '').replace(/^Free /, '').slice(0, 64)}`);
});

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const W = 230, H = 409;
const html = `<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#111;display:flex;flex-wrap:wrap;gap:8px;padding:8px">
${show.map((c, i) => `<figure style="margin:0;position:relative">
  <img src="${c.url}" style="width:${W}px;height:${H}px;object-fit:cover;border-radius:8px;display:block">
  <figcaption style="position:absolute;top:6px;right:6px;background:#000c;color:#fff;
    font:700 15px system-ui;padding:3px 8px;border-radius:6px">${i} · ${c.factor}</figcaption>
</figure>`).join('')}
</body>`;
await page.setContent(html, { waitUntil: 'networkidle' });
const el = await page.$('body');
await el.screenshot({ path: 'cover-candidates.png' });
await browser.close();
console.log('\n-> cover-candidates.png');
fs.writeFileSync('cover-candidates.json', `${JSON.stringify(show, null, 1)}\n`);
