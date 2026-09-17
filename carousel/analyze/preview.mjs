// Build out/preview.html — each clone beside the exact deck it was cloned
// from, with that deck's real numbers and a live link, ordered by how well the
// SOURCE performed. Earlier attempts stay at the bottom, collapsed, so the
// difference is visible rather than remembered.
//
//   node analyze/preview.mjs

import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
const specsDir = 'specs';
const manifest = JSON.parse(fs.readFileSync('harvest/manifest.json', 'utf8'));
const byId = Object.fromEntries(manifest.map((r) => [r.id, r]));

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nf = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));

const specFor = (id) => {
  const p = path.join(specsDir, `${id}.json`);
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
};

const dirs = fs.readdirSync(OUT)
  .filter((d) => fs.statSync(path.join(OUT, d)).isDirectory())
  .filter((d) => fs.existsSync(path.join(specsDir, `${d}.json`)));

// hi-* are the current set (chosen on source performance); he-* are superseded
const current = dirs.filter((d) => d.startsWith('hi-'))
  .sort((a, b) => (specFor(b).sourceLikes || 0) - (specFor(a).sourceLikes || 0));
const older = dirs.filter((d) => d.startsWith('he-')).sort();

const MEDIAN_LIKES = 1414;

function slidesOf(id) {
  const dir = path.join(OUT, id);
  if (!fs.existsSync(dir)) return '';
  return fs.readdirSync(dir).filter((f) => /-ig\.jpg$/.test(f)).sort()
    .map((f, i) => `<figure><img loading="lazy" src="${id}/${f}"><figcaption>${i + 1}</figcaption></figure>`).join('');
}

function sourceBlock(spec) {
  const s = byId[spec.clonedFrom];
  if (!s) return `<p class="warn">המקור ${esc(spec.clonedFrom)} לא נמצא</p>`;
  const likes = spec.sourceLikes ?? s.metricValue;
  const mult = likes ? (likes / MEDIAN_LIKES).toFixed(1) : null;
  return `<article class="src">
    <a href="../${esc(s.sheet)}" target="_blank"><img loading="lazy" src="../${esc(s.sheet)}" alt=""></a>
    <div class="meta">
      <div class="acct">${esc(s.account || s.id)}</div>
      <div class="big">${nf(likes)} <span>לייקים</span></div>
      <div class="num">${nf(spec.sourceFollowers ?? s.baselineValue)} עוקבים · מעורבות ${(spec.sourceER ?? s.engagementRate ?? 0).toFixed(3)}</div>
      ${mult ? `<div class="mult">×${mult} מחציון הקורפוס (${nf(MEDIAN_LIKES)})</div>` : ''}
      <a class="go" href="${esc(s.url)}" target="_blank" rel="noopener">פתח את המקור ↗</a>
    </div>
  </article>`;
}

const sections = current.map((id) => {
  const spec = specFor(id);
  return `<section>
    <h2>${esc(id)}</h2>
    <p class="cap"><b>כיתוב:</b> ${esc(spec.caption)}</p>
    <p class="tags">${(spec.hashtags || []).map((h) => '#' + esc(h)).join(' ')}</p>
    <div class="pair">
      <div class="col"><h3>המקור שהועתק</h3>${sourceBlock(spec)}</div>
      <div class="col grow"><h3>השיבוט <span class="ref">(תצוגת אינסטגרם 4:5)</span></h3>
        <div class="strip">${slidesOf(id)}</div></div>
    </div>
    <p class="why">${esc(spec.demonstrates)}</p>
  </section>`;
}).join('');

const oldBlock = older.length ? `<details class="old">
  <summary>קודמים (${older.length}) — הוחלפו. נשארו כאן רק כדי לראות את ההבדל.</summary>
  ${older.map((id) => {
    const sp = specFor(id);
    const s = byId[sp.clonedFrom];
    const tag = s ? `${esc(s.account)} · ${nf(s.metricValue)} לייקים` : 'ללא מקור';
    return `<section class="dim"><h2>${esc(id)} <span class="ref">${tag}</span></h2>
      <div class="strip">${slidesOf(id)}</div></section>`;
  }).join('')}
</details>` : '';

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>שיבוטים מול המקור</title>
<style>
 :root{color-scheme:dark}
 *{box-sizing:border-box}
 body{margin:0;background:#0f1115;color:#e9e7e2;font-family:'Segoe UI',system-ui,sans-serif;padding:26px 32px 90px}
 h1{font-size:30px;margin:0 0 8px}
 .sub{color:#98a1ae;margin:0 0 30px;font-size:15px;line-height:1.7;max-width:92ch}
 .sub b{color:#dfe4ea}
 section{margin:0 0 18px;padding:22px 0 28px;border-bottom:1px solid #242a33}
 h2{font-size:21px;margin:0 0 8px;color:#cfd6e0;direction:ltr;text-align:right}
 h3{font-size:14px;margin:0 0 10px;color:#99a3b1;font-weight:600}
 .ref{color:#6f7a88;font-weight:400;font-size:14px}
 .cap{font-size:15px;line-height:1.65;margin:0 0 4px;color:#d6dae1;max-width:90ch}
 .tags{color:#7f8b9a;font-size:13px;margin:0 0 16px}
 .why{color:#8d97a5;font-size:13px;line-height:1.6;margin:14px 0 0;direction:ltr;text-align:left;max-width:115ch}
 .pair{display:flex;gap:22px;align-items:flex-start}
 .col{flex:0 0 auto} .col.grow{flex:1 1 auto;min-width:0}
 .strip{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px}
 figure{margin:0;flex:0 0 auto;width:236px}
 figure img{width:236px;height:295px;object-fit:cover;border-radius:7px;display:block;background:#1b1f26}
 figcaption{text-align:center;color:#7f8b9a;font-size:12px;padding-top:4px}
 .src{width:420px;background:#181d26;border:1px solid #262d39;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:9px}
 .src img{width:100%;border-radius:6px;display:block;background:#11141a}
 .meta{display:flex;flex-direction:column;gap:4px}
 .acct{font-size:15px;font-weight:600;color:#e4e8ee;direction:ltr;text-align:right}
 .big{font-size:26px;font-weight:700;color:#7ee0a6}
 .big span{font-size:14px;font-weight:400;color:#8f99a7}
 .num{font-size:12.5px;color:#8f99a7}
 .mult{font-size:12.5px;color:#c49a4a}
 .warn{color:#c49a4a}
 .go{margin-top:5px;font-size:13px;color:#7fb2ff;text-decoration:none}
 details.old{margin-top:40px;color:#7f8b9a}
 details.old summary{cursor:pointer;font-size:14px;padding:10px 0}
 section.dim{opacity:.5}
 section.dim figure img{height:250px}
</style></head><body>
<h1>חמישה שיבוטים, ממוינים לפי כמה שהמקור באמת הצליח</h1>
<p class="sub">הסבב הקודם נבחר לפי כמה שהמלאכה נראתה מעניינת, ולכן ארבעה מתוך חמישה מקורות
ישבו בדיוק על <b>חציון הקורפוס, 1,414 לייקים</b>. הסבב הזה נבחר לפי ביצועים: כל מקור חייב
לעבור גם ברוחב (לייקים מוחלטים) וגם ביחס המעורבות. <b>היעדים הם ערים</b> שישראלים באמת טסים אליהן,
לא מדינות. שימו לב למגבלה: האמבד של אינסטגרם לא חושף צפיות, ולכן המספר שמוצג הוא לייקים,
והוא המדד הקרוב ביותר לרוחב שיש כאן.</p>
${sections}
${oldBlock}
</body></html>`;

fs.writeFileSync(path.join(OUT, 'preview.html'), html);
console.log(`preview -> ${path.join(OUT, 'preview.html')} (${current.length} current, ${older.length} superseded)`);
