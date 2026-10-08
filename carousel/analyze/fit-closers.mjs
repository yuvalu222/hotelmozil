// His two closing slides are 1920x2560 (3:4). Every slide this pipeline renders
// is 1080x1920 (9:16). A photo carousel is laid out at ONE ratio, so a mixed
// deck gets the odd ones letterboxed or cropped — which is the "my closer is
// not the right size" he reported on 8.10.
//
// MEASURED, NOT ASSUMED. 3:4 is the commonest ratio in the corpus (353 of 847
// covers, against 251 at 9:16) and it carries no save advantage (median 0.374
// vs 0.348, inside the noise band §18 calls no-difference). So neither ratio is
// "better"; the only defect is the mix. He asked for the closer to be fixed, so
// the closer is what changes.
//
// AND HIS TEXT IS NOT TOUCHED. Scaling to cover 1080x1920 would mean cropping
// 180px off each side, and his text block runs to about 95% of the frame width
// — it would lose its first and last letters. So the slide is scaled to FIT the
// width (1080x1440, nothing cropped, text whole) and the 240px above and below
// are filled with his own photograph, scaled to cover and blurred. Every pixel
// shown is his; none is discarded.
//
//   node analyze/fit-closers.mjs            # report only
//   node analyze/fit-closers.mjs --write    # rewrite in place, keeping a .orig
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const WRITE = process.argv.includes('--write');
// The two SOURCE files, not the 65 copies already packaged. Fixing a copy
// leaves the next package broken again, and the packager re-copies from here.
const SRC = 'assets/own-close';
const W = 1080, H = 1920;

function dim(f) {
  const b = fs.readFileSync(f);
  let i = 2;
  while (i < b.length - 9) {
    if (b[i] !== 0xFF) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
      return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
    i += 2 + b.readUInt16BE(i + 2);
  }
  return null;
}

const jobs = [];
for (const f of fs.readdirSync(SRC).filter((x) => /.jpg$/.test(x) && !x.endsWith('.orig.jpg'))) {
  const full = path.join(SRC, f);
  const s = dim(full);
  if (!s || (s[0] === W && s[1] === H)) continue;
  jobs.push({ full, rel: f, w: s[0], h: s[1] });
}
console.log(`${jobs.length} frames are not ${W}x${H}`);
if (!jobs.length || !WRITE) {
  for (const j of jobs.slice(0, 8)) console.log(`   ${j.rel}  ${j.w}x${j.h}`);
  if (!WRITE) console.log('\n(report only — pass --write to rebuild them)');
  process.exit(0);
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H } });
let done = 0;
for (const j of jobs) {
  const orig = j.full.replace(/\.jpg$/, '.orig.jpg');
  if (!fs.existsSync(orig)) fs.copyFileSync(j.full, orig);
  const b64 = fs.readFileSync(orig).toString('base64');
  const uri = `data:image/jpeg;base64,${b64}`;
  await page.setContent(`<!doctype html><meta charset="utf-8"><style>
    *{margin:0;padding:0}
    body{width:${W}px;height:${H}px;overflow:hidden;background:#000;position:relative}
    .bg{position:absolute;inset:-40px;background:url('${uri}') center/cover no-repeat;filter:blur(28px) brightness(.8)}
    .fg{position:absolute;left:0;top:50%;transform:translateY(-50%);width:${W}px;display:block}
  </style><div class="bg"></div><img class="fg" src="${uri}">`, { waitUntil: 'load' });
  await page.evaluate(() => Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => {})))));
  await page.screenshot({ path: j.full, type: 'jpeg', quality: 92 });
  const s = dim(j.full);
  if (s[0] !== W || s[1] !== H) { console.error(`!! ${j.rel} came out ${s[0]}x${s[1]}`); process.exit(1); }
  done++;
}
await browser.close();
console.log(`${done} closers rebuilt at ${W}x${H}; originals kept as *.orig.jpg`);
