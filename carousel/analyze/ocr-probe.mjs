// Can a machine read the words on a cover well enough to measure them?
//
// Before trusting OCR to code hundreds of covers, run it on covers whose text
// is already known — his own, transcribed by eye in
// research/own-covers-transcribed.json — and compare. If it cannot read those,
// it cannot be trusted on anything.
//
//   node analyze/ocr-probe.mjs <image> [<image> ...]

import Tesseract from 'tesseract.js';

const files = process.argv.slice(2);
const worker = await Tesseract.createWorker(['heb', 'eng']);
for (const f of files) {
  const { data } = await worker.recognize(f);
  const text = data.text.replace(/\s+/g, ' ').trim();
  console.log(`--- ${f}`);
  console.log(`    conf ${Math.round(data.confidence)}  |  ${text.slice(0, 160)}`);
}
await worker.terminate();
