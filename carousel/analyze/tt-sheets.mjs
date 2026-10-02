// Contact sheets for harvested TikTok carousels, with the post's real numbers
// burned into the header so a deck can never be judged apart from how it did.
//
//   node analyze/tt-sheets.mjs

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'harvest';
const OUT = path.join(ROOT, 'tt-sheets');
fs.mkdirSync(OUT, { recursive: true });

const src = path.join(ROOT, 'tt-carousels.jsonl');
if (!fs.existsSync(src)) { console.log('nothing harvested yet'); process.exit(0); }

const rows = [];
for (const line of fs.readFileSync(src, 'utf8').split('\n')) {
  const t = line.trim();
  if (!t) continue;
  try { rows.push(JSON.parse(t)); } catch { /* skip */ }
}
if (!rows.length) { console.log('nothing harvested yet'); process.exit(0); }

const nf = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
let made = 0;

for (const r of rows) {
  const outFile = path.join(OUT, `${r.id}.jpg`);
  if (fs.existsSync(outFile)) continue;
  const files = (r.files || []).filter((f) => fs.existsSync(f));
  if (!files.length) continue;

  const cols = Math.min(files.length, 5);
  const cell = files.length <= 3 ? 560 : files.length <= 6 ? 430 : 340;
  const rowsN = Math.ceil(files.length / cols);
  const W = cols * cell + (cols + 1) * 10;
  const H = rowsN * (cell + 26) + (rowsN + 1) * 10 + 86;

  const snd = r.music?.isOriginal ? 'original audio' : 'trending track';
  const cells = files.map((f, i) =>
    `<figure><img src="file:///${path.resolve(f).replace(/\\/g, '/')}"><figcaption>${i + 1}</figcaption></figure>`).join('');

  const html = `<!doctype html><meta charset=utf8><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#111;width:${W}px;font:13px system-ui,sans-serif;color:#ddd}
    .hdr{padding:10px 12px 6px}
    .t{font-size:15px;font-weight:700;color:#fff}
    .m{font-size:13px;color:#8fe6a8;padding-top:3px}
    .s{font-size:12px;color:#9aa4b2;padding-top:2px}
    .g{display:grid;grid-template-columns:repeat(${cols},${cell}px);gap:10px;padding:10px}
    figure{width:${cell}px}
    img{width:${cell}px;height:${cell}px;object-fit:contain;display:block;background:#1a1a1a;border-radius:4px}
    figcaption{color:#888;text-align:center;height:22px;line-height:22px}
  </style>
  <div class="hdr">
    <div class="t">@${r.author || '?'} — ${files.length} slides</div>
    <div class="m">${nf(r.likes)} likes · ${nf(r.views)} views · ${nf(r.shares)} shares · ${nf(r.saves)} saves · ${nf(r.comments)} comments</div>
    <div class="s">${nf(r.followers)} followers · ${snd}${r.music?.title ? ' — ' + r.music.title.replace(/</g, '') : ''} · ${(r.hashtags || []).map((h) => '#' + h).join(' ')}</div>
  </div>
  <div class="g">${cells}</div>`;

  const tmp = path.join(OUT, `_${r.id}.html`);
  fs.writeFileSync(tmp, html);
  try {
    await page.setViewportSize({ width: W, height: Math.min(H, 4000) });
    await page.goto('file:///' + path.resolve(tmp).replace(/\\/g, '/'), { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(300);
    await page.screenshot({ path: outFile, type: 'jpeg', quality: 76, fullPage: true });
    made++;
  } catch (e) {
    console.log(`fail ${r.id}: ${String(e).split('\n')[0].slice(0, 70)}`);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}
console.log(`tt sheets made=${made} -> ${OUT}`);
await browser.close();
