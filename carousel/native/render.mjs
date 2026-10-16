// Render a native-look deck: one photo per slide, text the way TikTok's own
// editor draws it on his iPhone. Built 10.10 from measurements of his 26
// posts (harvest/own-full), not from taste:
//
// - Canvas 1440x1920 (3:4): the size TikTok keeps for an iPhone photo, and
//   the most common size among his top slides.
// - Type: TikTok's text tool draws Latin and digits in TikTok Sans, which
//   has no Hebrew, so iOS falls back to its system Hebrew. TikTok Sans is
//   loaded for real; for the Hebrew the closest open font was measured, not
//   picked: of 64 Hebrew font/weight pairs on Google Fonts, Open Sans 600
//   overlapped his glyphs best (harvest/own-full/fontcand).
// - White fill, black outline, Apple emoji, centred, no boxes, no colour
//   except the single red word some of his covers carry.
// - Sizes as a fraction of the width, from his slides: body lines ~4%,
//   headings ~5.5%, the big tip number ~7.5%.
//
//   node native/render.mjs native/decks/<deck>.json
// Out: native/out/<deck>/NN.jpg

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { appleEmoji } from '../lib/emoji.js';

const W = 1440, H = 1920;
// font-size as a fraction of W per size class
const SIZE = { num: 0.093, xl: 0.083, l: 0.073, m: 0.064, s: 0.057, xs: 0.042 };
// 10.10 reverse-engineered against his own slides: TikTok's text font has no
// Hebrew, so iOS falls back to Apple's SF Hebrew Rounded (glyph overlay on his
// "שהלוואי וידענו" matched letter for letter). Outline measured at ~0.05 of
// the letter height; final values fitted by side-by-side on his tips slide: weight 580, CSS stroke 0.13em (half shows), sizes +15-19%.
const SCALE = Number(process.env.HM_SCALE || 1);
const STROKE = Number(process.env.HM_STROKE || 0.13);
const WEIGHT = Number(process.env.HM_WEIGHT || 580);
// 13.10 (owner: "not 1:1 iPhone"): TikTok's text tool sets text in TikTok
// Sans, which has no Hebrew, so iOS falls back to its default Hebrew cascade
// font, Arial Hebrew. Measured word by word on his cover (registered IoU):
// Arial 400 = 0.72 on all 7 words vs SF Hebrew 0.52 / SF Rounded 0.38; his
// digits "10" fit TikTok Sans 500 (0.63). So: 'TikTok Sans' for Latin and
// digits, Arial for Hebrew, weight 500. HM_FONT=sf keeps the old SF Rounded.
const FONT = (process.env.HM_FONT || 'arial').toLowerCase();
const SFHR = FONT === 'sf' ? fs.readFileSync(path.join(import.meta.dirname, 'fonts', 'SF-Hebrew-Rounded.ttf')).toString('base64') : null;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lineHtml = (l) => {
  if (l.t === '') return `<div class="sp" style="height:${(l.h ?? 0.03) * W}px"></div>`;
  let h = appleEmoji(esc(l.t));
  h = h.replace(/\{red\}(.*?)\{\/red\}/g, '<span class="red">$1</span>').replace(/\{green\}(.*?)\{\/green\}/g, '<span class="green">$1</span>');
  const fs = (SIZE[l.s] || SIZE.m) * W;
  const extra = (l.w ? `font-weight:${l.w};` : '') + (l.lh ? `line-height:${l.lh};` : '');
  return `<div class="ln" style="font-size:${fs}px;-webkit-text-stroke-width:${fs * STROKE}px;${extra}">${h}</div>`;
};

export function slideHtml(slide, base) {
  // HM_SCALE=2 (4K, 2880x3840): use the hi-res copy of the photo when there is one
  const hi = SCALE > 1 ? path.resolve(base, slide.photo).replace(/[\\/]full[\\/]/, path.sep + 'full2x' + path.sep) : null;
  const img = 'data:image/jpeg;base64,' + fs.readFileSync(hi && fs.existsSync(hi) ? hi : path.resolve(base, slide.photo)).toString('base64');
  const [fx, fy] = slide.focus || [0.5, 0.5];
  const width = (slide.width ?? 0.9) * W;
  const blocks = (slide.blocks || [{ top: slide.top ?? 0.18, lines: slide.lines }]).map((b) =>
    `<div class="blk" style="top:${b.top * H}px;width:${(b.width ?? slide.width ?? 0.9) * W}px;margin-left:${-((b.width ?? slide.width ?? 0.9) * W) / 2}px">${b.lines.map(lineHtml).join('')}</div>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=TikTok+Sans:wght@300..900&display=block" rel="stylesheet">
${SFHR ? `<style>@font-face{font-family:'SFHR';src:url(data:font/ttf;base64,${SFHR});font-weight:100 1000}</style>` : ''}
<style>
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:#000}
.ph{position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover;object-position:${fx * 100}% ${fy * 100}%;transform:scale(${slide.zoom || 1});transform-origin:${fx * 100}% ${fy * 100}%}
.blk{position:absolute;left:50%;text-align:center;direction:rtl}
.ln{font-family:${SFHR ? "'SFHR'" : "'TikTok Sans',Arial"},sans-serif;font-weight:${SFHR ? WEIGHT : Number(process.env.HM_WEIGHT || 500)};color:#fff;-webkit-text-stroke-color:#000;paint-order:stroke fill;line-height:1.36;-webkit-text-stroke-linejoin:round;white-space:pre-wrap;word-break:normal}
.red{color:#ee2b3b;-webkit-text-stroke-color:#fff}
.green{color:#2fbf4a;-webkit-text-stroke-color:#fff} /* his red word: red fill, WHITE outline (measured on his cover) */
.emo{height:1.08em;width:auto;vertical-align:-0.2em;margin:0 0.03em}
.sp{width:1px}
</style></head><body><img class="ph" src="${img}">${blocks}</body></html>`;
}

export async function renderDeck(specPath) {
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const base = path.join(import.meta.dirname, '..');
  const out = path.join(import.meta.dirname, 'out', spec.name + (SCALE > 1 ? '-4k' : ''));
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: SCALE });
  for (const [i, s] of spec.slides.entries()) {
    const name = `${String(i + 1).padStart(2, '0')}.jpg`;
    if (s.copy) { fs.copyFileSync(path.resolve(base, s.copy), path.join(out, name)); continue; }
    await page.setContent(slideHtml(s, base), { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, name), type: 'jpeg', quality: SCALE > 1 ? 96 : 92 });
  }
  await browser.close();
  console.log(`${spec.name}: ${spec.slides.length} slides -> ${out}`);
  return out;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  for (const f of process.argv.slice(2)) await renderDeck(f);
}
