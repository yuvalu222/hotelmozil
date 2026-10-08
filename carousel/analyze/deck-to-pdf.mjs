// One deck -> one PDF, one slide per page.
//
// Asked for 7.10: a Paris example delivered as a PDF with every slide on its
// own page. A contact sheet is for me to judge by; a PDF is something he can
// scroll on a phone, show someone, or mark up.
//
// Page size is the frame itself — 1080x1920 at 96dpi — so each slide fills its
// page edge to edge with no letterboxing and no scaling guesswork. The closing
// pair he supplies is included, because the deck is what gets posted, not just
// the part this pipeline renders.
//
// `break-inside: avoid` and absolute file:// paths are both deliberate: past
// PDFs cut images across a page boundary, and relative paths silently resolve
// to nothing inside a print context.
//
//   node analyze/deck-to-pdf.mjs <deck-id> [out.pdf]

import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';

const id = process.argv[2];
if (!id) { console.error('usage: node analyze/deck-to-pdf.mjs <deck-id> [out.pdf]'); process.exit(1); }

// Prefer the packaged folder — it holds his closing slides renumbered in
// order. Fall back to out/ when the deck has not been packaged yet.
const packed = path.join('C:', 'Users', 'Yuval', 'Desktop', 'HotelMozil-TikTok', id);
let files = [];
let source = '';
if (fs.existsSync(packed)) {
  files = fs.readdirSync(packed).filter((f) => /^\d+\.jpg$/.test(f)).sort()
    .map((f) => path.resolve(packed, f));
  source = packed;
} else {
  const dir = path.join('out', id);
  if (!fs.existsSync(dir)) { console.error(`no deck at ${dir}`); process.exit(1); }
  files = fs.readdirSync(dir).filter((f) => /-tiktok\.jpg$/.test(f)).sort()
    .map((f) => path.resolve(dir, f));
  source = dir;
}
if (!files.length) { console.error('no frames found'); process.exit(1); }

const out = process.argv[3] || path.resolve(`C:/Users/Yuval/Desktop/${id}.pdf`);

// Embedded as data URIs, not file:// paths. A page built with setContent has
// no document origin, so file:// images are blocked and simply never paint —
// the first attempt produced a 23 KB PDF of ten blank pages, which looks like
// a successful run from every angle except opening it.
const pages = files.map((f, i) => {
  const b64 = fs.readFileSync(f).toString('base64');
  return `
  <section>
    <img src="data:image/jpeg;base64,${b64}" alt="שקופית ${i + 1}">
  </section>`;
}).join('');

const html = `<!doctype html>
<html lang="he" dir="rtl"><meta charset="utf-8">
<style>
  @page { size: 1080px 1920px; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { background:#000; }
  section { width:1080px; height:1920px; page-break-after:always;
            break-inside:avoid; page-break-inside:avoid;
            display:flex; align-items:center; justify-content:center; overflow:hidden; }
  section:last-child { page-break-after:auto; }
  img { width:1080px; height:1920px; object-fit:cover; display:block; }
</style>
<body>${pages}</body></html>`;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
// Every frame decoded before printing, or a page comes out blank.
await page.evaluate(async () => {
  await Promise.all([...document.images].map((im) => (im.complete ? null : im.decode().catch(() => {}))));
});
await page.pdf({ path: out, width: '1080px', height: '1920px', printBackground: true, pageRanges: '' });
await browser.close();

const bytes = fs.statSync(out).size;
const mb = (bytes / 1e6).toFixed(1);
console.log(`${files.length} slides from ${source}`);
console.log(`-> ${out}  (${mb} MB)`);
// ~150 KB per page is already conservative for a full-bleed photograph.
const floor = files.length * 150000;
if (bytes < floor) {
  console.error(`!! only ${Math.round(bytes / 1024)} KB for ${files.length} pages — `
    + 'the images did not embed. The PDF is blank.');
  process.exit(1);
}
