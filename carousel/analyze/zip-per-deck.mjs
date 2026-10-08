// One zip per carousel, for getting a single deck onto a phone.
//
// The whole-set zip is ~110MB, which is the wrong shape for a phone: you
// upload one carousel at a time, and a phone has to unpack the whole archive
// to reach eleven pictures. Each of these is 3-6MB — open it, save the photos,
// post, delete.
//
//   node analyze/zip-per-deck.mjs [dest-dir]

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

const SRC = path.join(os.homedir(), 'Desktop', 'HotelMozil-TikTok');
const DEST = process.argv[2] || path.join(SRC, '_zips');

if (!fs.existsSync(SRC)) {
  console.error(`run analyze/package-upload.mjs first — ${SRC} is not there`);
  process.exit(1);
}
fs.rmSync(DEST, { recursive: true, force: true });
fs.mkdirSync(DEST, { recursive: true });

const decks = fs.readdirSync(SRC)
  .filter((d) => d.startsWith('tt-') && fs.statSync(path.join(SRC, d)).isDirectory());

let made = 0;
for (const deck of decks) {
  const zip = path.join(DEST, `${deck}.zip`);
  try {
    execFileSync('powershell', ['-NoProfile', '-Command',
      `Compress-Archive -Path '${path.join(SRC, deck)}\\*' -DestinationPath '${zip}' -Force`],
    { stdio: 'ignore' });
    const mb = (fs.statSync(zip).size / 1e6).toFixed(1);
    console.log(`${deck.padEnd(28)} ${mb} MB`);
    made++;
  } catch {
    console.log(`${deck.padEnd(28)} FAILED`);
  }
}
console.log(`\n${made} zips -> ${DEST}`);
