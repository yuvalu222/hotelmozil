// Harvest creator grids slowly enough to be allowed to.
//
// On 8.10 TikTok began answering logged-out grid AND search requests with
// "Something went wrong — please try again later" after a handful of profile
// loads in quick succession. That is a rate limit, and the honest response to
// a rate limit is to go at its pace, not around it: no logged-in account (it
// would risk @hotelmozil), no rotating proxies (that is evading the control,
// and it would spend another product's budget).
//
// So: one creator at a time, a few minutes apart. On an empty answer, back
// off — 10, 20, 40 minutes — and try the same creator again. Stop after the
// given number of hours. Everything is resumable: grid.mjs skips creators
// already on disk.
//
//   node harvest/patient-grid.mjs <handles-file> [--hours=8]

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const file = process.argv[2];
const HOURS = Number((process.argv.find((a) => a.startsWith('--hours=')) || '--hours=8').split('=')[1]);
const queue = fs.readFileSync(file, 'utf8').split(/\r?\n/).map((s) => s.trim().replace(/^@/, '')).filter(Boolean);
const OUT = path.join('harvest', 'grids');
const LOG = path.join(OUT, '_patient.log');
const end = Date.now() + HOURS * 3600e3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (s) => {
  const line = `${new Date().toISOString().slice(11, 19)}  ${s}`;
  console.log(line);
  fs.appendFileSync(LOG, line + String.fromCharCode(10));
};

let backoff = 10 * 60e3;
let ok = 0;
let refused = 0;
while (queue.length && Date.now() < end) {
  const h = queue.shift();
  if (fs.existsSync(path.join(OUT, h, '_grid.json'))) continue;
  const r = spawnSync(process.execPath, ['harvest/grid.mjs', `@${h}`, '--pages=4'], { encoding: 'utf8', timeout: 240e3 });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  if (fs.existsSync(path.join(OUT, h, '_grid.json'))) {
    ok++;
    backoff = 10 * 60e3;
    log(`ok   @${h}  ${(out.match(/@\S+: (.*)/) || [, ''])[1]}`);
    await sleep(150e3 + Math.random() * 90e3);
  } else {
    refused++;
    queue.unshift(h);                       // the same creator, after the pause
    log(`wait @${h} refused — backing off ${Math.round(backoff / 60e3)} min (ok ${ok}, refused ${refused})`);
    await sleep(backoff);
    backoff = Math.min(backoff * 2, 40 * 60e3);
  }
}
log(`stopped: ${ok} creators harvested, ${refused} refusals, ${queue.length} left`);
