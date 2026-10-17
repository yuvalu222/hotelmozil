// Schedules the TikTok queue (18.10). Each "pending" entry of
// research/schedule/tiktok-queue.json goes through post-tiktok.mjs with --at,
// so TikTok holds the post and publishes it at that time, PC on or off.
// An entry is marked "scheduled" only when the post went through; a failure
// (sound not found, schedule fields not set, ...) leaves it pending and the
// run moves on. Decks in the queue are the ones the owner picked (18.10).
//   node social/schedule-tiktok.mjs            dry run: fills every form, posts nothing
//   node social/schedule-tiktok.mjs --post [--only <deck>]
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const QUEUE = path.join(HERE, '..', 'research', 'schedule', 'tiktok-queue.json');
const POST = process.argv.includes('--post');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1] : null;
const q = JSON.parse(fs.readFileSync(QUEUE, 'utf8'));

for (const e of q) {
  if (e.status !== 'pending' || (only && e.deck !== only)) continue;
  const folder = path.join(HERE, '..', 'native', 'out', `${e.deck}-4k`);
  const args = [path.join(HERE, 'post-tiktok.mjs'), folder, '--title', e.title, '--tags', e.tags,
    '--sound', e.sound, '--sound-match', e.soundMatch, '--at', e.at, ...(POST ? ['--post'] : [])];
  console.log(`\n== ${e.deck} @ ${e.at}${POST ? '' : ' (dry run)'}`);
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', timeout: 8 * 60e3 });
  const log = (r.stdout || '') + (r.stderr || '');
  const keep = log.split('\n').filter((l) => /scheduled fields|chosen sound|sound rows|Error|refused|after post|DRY RUN/.test(l));
  console.log(keep.join('\n'));
  if (r.status !== 0) { console.log(`FAILED ${e.deck}, left pending`); continue; }
  if (POST) {
    e.status = 'scheduled'; e.scheduledAt = new Date().toISOString();
    fs.writeFileSync(QUEUE, JSON.stringify(q, null, 1));
  }
}
console.log('\n' + q.map((e) => `${e.at}  ${e.status.padEnd(9)}  ${e.deck}`).join('\n'));
