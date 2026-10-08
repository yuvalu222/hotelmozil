// Within-creator lift: how far each post sits above or below its own
// creator's norm, with age taken out.
//
// Two outcomes, because they answer different questions:
//
//   LIFT  = log10(plays) − the creator's median log10(plays)
//           how far the algorithm pushed this post compared with that
//           creator's usual. TikTok counts a view once per impression
//           ("number of times your video started to play ... for each video
//           impression", ads.tiktok.com/help/article/video-play), so plays are
//           reach, and reach is decided by how the first viewers responded.
//
//   ENGAGE = log10(likes / plays) − the creator's median of the same
//           likes per impression = P(stop) × P(like | stopped). If a cover
//           stops fewer people the numerator falls and the denominator does
//           not, so this is the rate most sensitive to stopping that public
//           data can give.
//
// Age: a post a few days old has not finished accumulating. Posts younger
// than MIN_DAYS are dropped, and the rest are checked for any remaining
// relationship with age before anything else is read.
//
//   node analyze/grid-lift.mjs            -> research/scroll-stop/lift.json

import fs from 'node:fs';
import path from 'node:path';

const MIN_DAYS = 10;
const MIN_POSTS = 8;
const now = Date.now() / 1000;
// counts are clamped at 1 so a zero cannot become -Infinity; RATIOS must not
// be — likes per play is always below 1, and clamping it zeroed the whole
// engagement measure on the first run
const log10 = (x) => Math.log10(Math.max(1, x));
const lratio = (a, b) => Math.log10((a + 1) / Math.max(1, b));
const median = (a) => { const s = [...a].sort((x, y) => x - y); const k = s.length >> 1; return s.length % 2 ? s[k] : (s[k - 1] + s[k]) / 2; };

const rows = [];
const creators = [];

// harvested grids (exact plays and ages from item_list)
for (const h of fs.readdirSync('harvest/grids')) {
  const f = path.join('harvest/grids', h, '_grid.json');
  if (!fs.existsSync(f)) continue;
  const g = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (!g.items) continue;
  const posts = g.items.filter((x) => x.kind === 'photo' && !x.pinned && !x.ad
    && x.plays > 0 && (now - x.createTime) / 86400 >= MIN_DAYS);
  if (posts.length < MIN_POSTS) continue;
  const mP = median(posts.map((x) => log10(x.plays)));
  const mE = median(posts.map((x) => lratio(x.likes, x.plays)));
  for (const x of posts) {
    rows.push({
      creator: h, id: x.id, cover: path.join('harvest/grids', h, `${x.id}.jpg`),
      days: Math.round((now - x.createTime) / 86400), plays: x.plays, likes: x.likes, saves: x.saves,
      slides: x.slides, title: x.title, desc: x.desc,
      lift: log10(x.plays) - mP,
      engage: lratio(x.likes, x.plays) - mE,
    });
  }
  creators.push({ h, n: posts.length, followers: g.author?.followers ?? null, medianPlays: Math.round(10 ** mP) });
}

fs.mkdirSync('research/scroll-stop', { recursive: true });
fs.writeFileSync('research/scroll-stop/lift.json', JSON.stringify({ minDays: MIN_DAYS, creators, rows }, null, 1));

console.log(`${creators.length} creators with >= ${MIN_POSTS} photo posts older than ${MIN_DAYS} days, ${rows.length} posts\n`);
for (const c of creators) {
  const r = rows.filter((x) => x.creator === c.h).map((x) => x.lift).sort((a, b) => a - b);
  const p10 = r[Math.floor(r.length * 0.1)], p90 = r[Math.floor(r.length * 0.9)];
  console.log(`@${c.h.padEnd(22)} ${String(c.n).padStart(3)} posts  median ${String(c.medianPlays).padStart(8)} plays  `
    + `10th-90th pct of lift: x${(10 ** p10).toFixed(2)} .. x${(10 ** p90).toFixed(2)}  (spread x${(10 ** (p90 - p10)).toFixed(0)})`);
}

// Is age still in there? A correlation near zero means the cut did its job.
const corr = (a, b) => {
  const ma = a.reduce((s, x) => s + x, 0) / a.length, mb = b.reduce((s, x) => s + x, 0) / b.length;
  let n = 0, da = 0, db = 0;
  for (let i = 0; i < a.length; i++) { n += (a[i] - ma) * (b[i] - mb); da += (a[i] - ma) ** 2; db += (b[i] - mb) ** 2; }
  return n / Math.sqrt(da * db);
};
if (rows.length > 10) {
  console.log(`\nage vs lift: r = ${corr(rows.map((r) => Math.log10(r.days)), rows.map((r) => r.lift)).toFixed(2)}`
    + `   (near 0 = age no longer drives it)`);
  console.log(`lift vs engage: r = ${corr(rows.map((r) => r.lift), rows.map((r) => r.engage)).toFixed(2)}`
    + `   (positive = posts that engaged per impression were pushed further)`);
}
