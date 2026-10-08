// Does anything measurable about the COVER frame track how often a deck is
// saved — across 847 decks rather than the four I read by eye?
//
// This is the last open question answerable from data already on disk. Both
// harvest routes are closed (§17), so nothing new is coming, and the gap map
// still lists composition and cover-versus-no-cover as unanswered.
//
// ⚠️ WHAT THIS CANNOT SAY. Saves and likes are both counted after someone has
// already stopped. So nothing here speaks to whether a cover stops a scroll —
// only to whether, among people who stopped, the cover tracks with keeping it.
// The honest version of the scroll-stopping question still has no data in this
// project outside his own 27 posts.
//
// And per §18: every split below is reported with its n, and a difference is
// only called a finding when the top and bottom thirds are far apart AND the
// bucket counts are large.
//
//   node analyze/cover-vs-saves.mjs

import fs from 'node:fs';

const measured = JSON.parse(fs.readFileSync('harvest/measure/tt-decks.json', 'utf8'));
const rows = fs.readFileSync('harvest/tt-final.jsonl', 'utf8')
  .split('\n').filter(Boolean)
  .map((l) => { try { return JSON.parse(l); } catch { return null; } })
  .filter((r) => r && r.likes > 0 && r.saves > 0);

// measure-slides keys by deck directory; the jsonl keys by post id.
const joined = [];
for (const r of rows) {
  const m = measured[r.id];
  if (!m || !m.length) continue;
  joined.push({ sl: r.saves / r.likes, cover: m[0], second: m[1] || null });
}
console.log(`${joined.length} decks have both a measurement and a save rate\n`);

const med = (a) => {
  if (!a.length) return NaN;
  const s = [...a].sort((x, y) => x - y);
  const k = s.length >> 1;
  return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2;
};
const base = med(joined.map((j) => j.sl));
console.log(`corpus median saves/like ${base.toFixed(3)}\n`);

// Thirds rather than a correlation: the relationship need not be linear, and
// thirds say plainly whether the extremes differ.
function thirds(label, pick) {
  const have = joined.filter((j) => j.cover && Number.isFinite(pick(j.cover)));
  if (have.length < 90) { console.log(`${label.padEnd(26)} too few measured (${have.length})`); return; }
  const sorted = [...have].sort((a, b) => pick(a.cover) - pick(b.cover));
  const n = Math.floor(sorted.length / 3);
  const lo = sorted.slice(0, n);
  const hi = sorted.slice(-n);
  const mLo = med(lo.map((j) => j.sl));
  const mHi = med(hi.map((j) => j.sl));
  const gap = ((mHi / mLo - 1) * 100).toFixed(0);
  const verdict = Math.abs(mHi / mLo - 1) < 0.15 ? '  (no real difference)' : '';
  console.log(`${label.padEnd(26)} n=${String(n).padStart(3)}/third  `
    + `low ${mLo.toFixed(3)}  high ${mHi.toFixed(3)}  `
    + `${gap >= 0 ? '+' : ''}${gap}%${verdict}`);
}

console.log('cover frame, bottom third vs top third of each measure:');
thirds('text coverage', (c) => c.textCover);
thirds('rows of text', (c) => c.textRows);
thirds('where text starts', (c) => (c.textTop === null ? NaN : c.textTop));
thirds('height of text block', (c) => c.textSpan);
thirds('colourfulness', (c) => c.colourful);
thirds('saturation', (c) => c.sat);
thirds('contrast', (c) => c.contrast);
thirds('darkness', (c) => c.dark);
thirds('busyness outside text', (c) => c.busy);
