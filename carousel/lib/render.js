// Slide rendering. HTML/CSS -> headless Chromium -> JPEG.
//
// Prices, hotel names and dates are drawn as real text by a deterministic
// template rather than generated as pixels, because image models still misprint
// numbers often enough to matter when the number is the product.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATE = path.join(HERE, 'template.html');

export const CANVAS = { w: 1080, h: 1920 };
// Instagram's publishing API accepts 0.8 (4:5) to 1.91:1 only. 1080x1350 is the
// one master that also survives Facebook and YouTube untouched.
export const IG_CROP = { w: 1080, h: 1350, top: 285 };

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Build the inner markup for one slide from its spec. */
function slideMarkup(slide, { photoDataUri, debug }) {
  const justify = slide.align === 'top' ? 'flex-start'
    : slide.align === 'bottom' ? 'flex-end' : 'center';

  // Hooks run larger; later slides carry more text so they run smaller.
  const size = slide.headlineSize || (slide.role === 'hook' ? 104 : 84);

  const parts = [];
  if (photoDataUri) parts.push(`<img class="photo" src="${photoDataUri}" alt="">`);
  parts.push('<div class="scrim"></div>');

  const inner = [];
  if (slide.eyebrow) inner.push(`<div class="eyebrow">${esc(slide.eyebrow)}</div>`);
  if (slide.badge) inner.push(`<div class="badge">${esc(slide.badge)}</div>`);
  if (slide.headline) inner.push(`<div class="headline">${esc(slide.headline)}</div>`);
  if (slide.body) inner.push(`<div class="body">${esc(slide.body)}</div>`);

  if (slide.price) {
    const { label, amount, note, was } = slide.price;
    inner.push(
      `<div class="pricecard">` +
        (label ? `<div class="label">${esc(label)}</div>` : '') +
        `<div class="amount">${esc(amount)}</div>` +
        (note ? `<div class="note">${esc(note)}</div>` : '') +
      `</div>` +
      (was ? `<div class="was">${esc(was)}</div>` : '')
    );
  }

  parts.push(`<div class="safe" style="--justify:${justify};--headline-size:${size}px">${inner.join('')}</div>`);

  if (slide.swipe) parts.push(`<div class="swipe">${esc(slide.swipe)}</div>`);
  if (slide.credit) parts.push(`<div class="credit">Photo: ${esc(slide.credit)}</div>`);
  if (debug) parts.push('<div class="guide on"><div class="band"></div><div class="igcrop"></div></div>');

  return parts.join('');
}

async function toDataUri(file) {
  if (!file) return null;
  const buf = await fs.readFile(file);
  const ext = path.extname(file).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  return `data:${mime};base64,${buf.toString('base64')}`;
}

/**
 * Render every slide in a spec.
 *
 * Emits two JPEGs per slide from one layout pass:
 *   <n>-tiktok.jpg  1080x1920  -> TikTok, YouTube
 *   <n>-ig.jpg      1080x1350  -> Instagram, Facebook
 *
 * Same width for both, so the second is a crop and never a re-layout.
 */
export async function renderSpec(spec, { outDir, debug = false, quality = 88 } = {}) {
  await fs.mkdir(outDir, { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
  });

  try {
    const page = await browser.newPage({
      viewport: { width: CANVAS.w, height: CANVAS.h },
      deviceScaleFactor: 1,
    });
    await page.goto(`file://${TEMPLATE}`, { waitUntil: 'networkidle' });
    // Webfonts must be resolved before the first screenshot or slide 1 renders
    // in the fallback face while the rest render in Heebo.
    await page.evaluate(() => document.fonts.ready);

    const written = [];

    for (const [i, slide] of spec.slides.entries()) {
      const n = String(i + 1).padStart(2, '0');
      const photoDataUri = await toDataUri(slide.image?.file);

      await page.evaluate(
        ({ html }) => { document.getElementById('slide').innerHTML = html; },
        { html: slideMarkup(slide, { photoDataUri, debug }) }
      );
      await page.evaluate(() => document.fonts.ready);

      const tiktok = path.join(outDir, `${n}-tiktok.jpg`);
      await page.screenshot({ path: tiktok, type: 'jpeg', quality, clip: { x: 0, y: 0, ...CANVAS } });

      const ig = path.join(outDir, `${n}-ig.jpg`);
      await page.screenshot({
        path: ig, type: 'jpeg', quality,
        clip: { x: 0, y: IG_CROP.top, width: IG_CROP.w, height: IG_CROP.h },
      });

      written.push({ index: i, tiktok, ig });
    }

    return written;
  } finally {
    await browser.close();
  }
}
