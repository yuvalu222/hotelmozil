// Is each clone actually uploadable? Checks the things that would only show
// up at the moment of uploading: every slide present, in order, at the right
// pixel size, with nothing missing in the middle of the sequence, and a
// caption that fits what the feed shows before it truncates.
//
//   node analyze/tt-ready-check.mjs

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const specs = fs.readdirSync('specs')
  .filter((f) => f.startsWith('tt-') && f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join('specs', f), 'utf8')));

const b = await chromium.launch({ channel: 'chrome', headless: true });
const p = await b.newPage();
await p.setContent('<!doctype html><html><body></body></html>');

let problems = 0;
for (const spec of specs) {
  const dir = path.join('out', spec.id);
  const notes = [];
  if (!fs.existsSync(dir)) {
    console.log(`${spec.id}: NOT BUILT`);
    problems++;
    continue;
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('-tiktok.jpg')).sort();

  if (files.length !== spec.slides.length) {
    notes.push(`${files.length} files for ${spec.slides.length} slides`);
  }
  // the sequence must have no holes — a missing 07 uploads as a silent gap
  for (let i = 0; i < files.length; i++) {
    const want = String(i + 1).padStart(2, '0') + '-tiktok.jpg';
    if (files[i] !== want) { notes.push(`expected ${want}, found ${files[i]}`); break; }
  }
  for (const f of files) {
    const buf = fs.readFileSync(path.join(dir, f));
    const wh = await p.evaluate(async (src) => {
      const im = new Image();
      await new Promise((r, j) => { im.onload = r; im.onerror = j; im.src = src; });
      return [im.naturalWidth, im.naturalHeight];
    }, 'data:image/jpeg;base64,' + buf.toString('base64'));
    if (wh[0] !== 1080 || wh[1] !== 1920) notes.push(`${f} is ${wh[0]}x${wh[1]}`);
    if (buf.length < 20000) notes.push(`${f} is only ${Math.round(buf.length / 1024)}kB`);
  }

  // TikTok shows roughly this much caption before "more"
  const capHead = [...(spec.caption || '')].length;
  // One format deliberately overruns: @travellingcloset1 puts every address in
  // the caption, so the post is savable as a text list, and it is the highest
  // saves-per-like in the corpus. A spec opts in by saying WHY, in
  // `longCaption`, so the exception is readable and not a silenced check.
  if (capHead > 150 && !spec.longCaption) {
    notes.push(`caption is ${capHead} chars, the feed cuts near 150`);
  }
  if (!spec.hashtags?.length) notes.push('no hashtags');
  if (spec.slides.length > 35) notes.push(`${spec.slides.length} slides, over the TikTok limit`);

  problems += notes.length;
  console.log(`${spec.id.padEnd(24)} ${String(files.length).padStart(2)} slides  `
    + (notes.length ? 'PROBLEM: ' + notes.join('; ') : 'ready'));
}
console.log(`\n${problems === 0 ? 'all clones ready to upload' : problems + ' problem(s) to fix'}`);
await b.close();
