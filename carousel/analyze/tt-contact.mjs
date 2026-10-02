// Contact sheets for harvested TikTok carousels, with every number the post
// earned burned into the header — so no slide is ever judged apart from how
// the deck performed, and so a clone brief can be written straight off one
// image per deck.
//
//   node analyze/tt-contact.mjs

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'harvest';
const OUT = path.join(ROOT, 'tt-sheets');
fs.mkdirSync(OUT, { recursive: true });

const src = path.join(ROOT, 'tt-final.jsonl');
if (!fs.existsSync(src)) { console.log('no carousels harvested yet'); process.exit(0); }

const rows = [];
for (const line of fs.readFileSync(src, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t) continue;
  try { rows.push(JSON.parse(t)); } catch { /* skip */ }
}
const seen = new Set();
const uniq = rows.filter((r) => r.id && !seen.has(r.id) && seen.add(r.id));
if (!uniq.length) { console.log('no carousels harvested yet'); process.exit(0); }

const nf = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
let made = 0;

for (const r of uniq) {
  const outFile = path.join(OUT, `${r.id}.jpg`);
  if (fs.existsSync(outFile)) continue;
  const files = (r.files || []).filter((f) => fs.existsSync(f));
  if (files.length < 2) continue;

  const cols = Math.min(files.length, 5);
  const cell = files.length <= 4 ? 470 : files.length <= 10 ? 370 : 300;
  const rowsN = Math.ceil(files.length / cols);
  const W = cols * cell + (cols + 1) * 10;
  const H = rowsN * (cell + 26) + (rowsN + 1) * 10 + 104;

  const sound = r.soundIsOriginal ? 'סאונד מקורי של היוצר' : 'טראק מספריית טיקטוק';
  const tags = (r.hashtags || []).map((h) => '#' + h).join(' ');
  const cells = files.map((f, i) =>
    `<figure><img src="file:///${path.resolve(f).replace(/\\/g, '/')}"><figcaption>${i + 1}</figcaption></figure>`).join('');

  const html = `<!doctype html><html dir="rtl"><meta charset=utf8><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#111;width:${W}px;font:13px system-ui,'Segoe UI',sans-serif;color:#ddd}
    .hdr{padding:12px 14px 8px}
    .t{font-size:16px;font-weight:700;color:#fff;direction:ltr;text-align:right}
    .m{font-size:14px;color:#8fe6a8;padding-top:4px}
    .s{font-size:12px;color:#9aa4b2;padding-top:3px}
    .c{font-size:12px;color:#c7cedb;padding-top:4px}
    .g{display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:10px;padding:10px;direction:ltr}
    figure{width:${cell}px}
    img{width:${cell}px;height:${cell}px;object-fit:contain;display:block;background:#1a1a1a;border-radius:4px}
    figcaption{color:#888;text-align:center;height:22px;line-height:22px}
  </style>
  <div class="hdr">
    <div class="t">@${(r.account || '?')} — ${files.length} slides</div>
    <div class="m">${nf(r.likes)} לייקים · ${nf(r.shares)} שיתופים · ${nf(r.saves)} שמירות · ${nf(r.comments)} תגובות</div>
    <div class="s">${sound}${r.music ? ' — ' + String(r.music).replace(/</g, '') : ''}</div>
    <div class="s">${tags || 'ללא האשטגים'}</div>
    <div class="c">${String(r.caption || '').replace(/</g, '').slice(0, 160)}</div>
  </div>
  <div class="g">${cells}</div></html>`;

  const tmp = path.join(OUT, `_${r.id}.html`);
  fs.writeFileSync(tmp, html);
  try {
    await page.setViewportSize({ width: W, height: Math.min(H, 4000) });
    await page.goto('file:///' + path.resolve(tmp).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(350);
    await page.screenshot({ path: outFile, type: 'jpeg', quality: 78, fullPage: true });
    made++;
  } catch (e) {
    console.log(`fail ${r.id}: ${String(e).split(String.fromCharCode(10))[0].slice(0, 70)}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}
console.log(`tt sheets made=${made} of ${uniq.length} decks -> ${OUT}`);
await browser.close();
