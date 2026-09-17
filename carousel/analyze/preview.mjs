// Build out/preview.html — each cloned carousel beside the exact deck it was
// cloned from (contact sheet + live link), then the other decks in the corpus
// that share the pattern. The earlier, superseded attempt is kept at the
// bottom, collapsed, so the difference can be seen rather than remembered.
//
//   node analyze/preview.mjs

import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
const specsDir = 'specs';
const manifest = JSON.parse(fs.readFileSync('harvest/manifest.json', 'utf8'));
const byId = Object.fromEntries(manifest.map((r) => [r.id, r]));
const sources = fs.existsSync('analyze/sources.json')
  ? JSON.parse(fs.readFileSync('analyze/sources.json', 'utf8')) : {};

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const specFor = (id) => {
  const p = path.join(specsDir, `${id}.json`);
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
};

const deckDirs = fs.readdirSync(OUT)
  .filter((d) => fs.statSync(path.join(OUT, d)).isDirectory() && d.startsWith('he-'))
  .sort();
const clones = deckDirs.filter((d) => specFor(d).skin === 'clone');
const old = deckDirs.filter((d) => specFor(d).skin !== 'clone');

function metricLine(s) {
  if (s.organic) {
    return s.engagementRate != null
      ? `לייקים ${s.metricValue ?? '—'} · מעורבות ${s.engagementRate}`
      : `לייקים ${s.metricValue ?? '—'}`;
  }
  return s.metricValue != null ? `רץ ${s.metricValue} ימים` : 'אין מדידה';
}

function sourceCard(s, big = false) {
  const sheet = s.sheet ? '../' + s.sheet : null;
  const kind = s.organic ? 'אורגני · אינסטגרם' : 'מודעה · ספריית המודעות';
  const slides = s.organic
    ? `${s.slideCount} שקופיות <span class="warn">(האמבד חותך ל-2)</span>`
    : `${s.slideCount} שקופיות (דק מלא)`;
  return `<article class="src${big ? ' big' : ''}">
    ${sheet ? `<a href="${esc(sheet)}" target="_blank"><img loading="lazy" src="${esc(sheet)}" alt=""></a>` : ''}
    <div class="meta">
      <div class="acct">${esc(s.account || s.id)}</div>
      <div class="kind">${kind}</div>
      <div class="num">${slides}</div>
      <div class="num">${esc(metricLine(s))}</div>
      <a class="go" href="${esc(s.url)}" target="_blank" rel="noopener">פתח את המקור ↗</a>
    </div>
  </article>`;
}

function mySlides(id) {
  const dir = path.join(OUT, id);
  const files = fs.readdirSync(dir).filter((f) => /-ig\.jpg$/.test(f)).sort();
  return files.map((f, i) =>
    `<figure><img loading="lazy" src="${id}/${f}"><figcaption>${i + 1}</figcaption></figure>`).join('');
}

const cloneSections = clones.map((id) => {
  const spec = specFor(id);
  const src = byId[spec.clonedFrom];
  const siblings = (sources[id]?.sources || sources[spec.patternKey]?.sources || [])
    .filter((s) => s.id !== spec.clonedFrom);
  return `<section>
    <h2>${esc(id)}</h2>
    <p class="cap"><b>כיתוב:</b> ${esc(spec.caption)}</p>
    <p class="tags">${(spec.hashtags || []).map((h) => '#' + esc(h)).join(' ')}</p>
    <div class="pair">
      <div class="col">
        <h3>המקור שהועתק <span class="ref">${esc(spec.clonedAccount || spec.clonedFrom)}</span></h3>
        ${src ? sourceCard(src, true) : `<p class="warn">המקור ${esc(spec.clonedFrom)} לא נמצא במניפסט</p>`}
      </div>
      <div class="col grow">
        <h3>השיבוט <span class="ref">(תצוגת אינסטגרם 4:5)</span></h3>
        <div class="strip">${mySlides(id)}</div>
      </div>
    </div>
    <p class="why">${esc(spec.demonstrates)}</p>
  </section>`;
}).join('');

const oldSections = old.length ? `<details class="old"><summary>הניסיון הקודם (${old.length} קרוסלות) — הוחלף. נשאר כאן רק כדי לראות את ההבדל.</summary>
  ${old.map((id) => `<section class="dim"><h2>${esc(id)}</h2><div class="strip">${mySlides(id)}</div></section>`).join('')}
</details>` : '';

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>שיבוטים מול המקור</title>
<style>
 :root{color-scheme:dark}
 *{box-sizing:border-box}
 body{margin:0;background:#0f1115;color:#e9e7e2;font-family:'Segoe UI',system-ui,sans-serif;padding:26px 32px 90px}
 h1{font-size:30px;margin:0 0 8px}
 .sub{color:#98a1ae;margin:0 0 30px;font-size:15px;line-height:1.65;max-width:88ch}
 section{margin:0 0 18px;padding:22px 0 28px;border-bottom:1px solid #242a33}
 h2{font-size:21px;margin:0 0 8px;color:#cfd6e0;direction:ltr;text-align:right}
 h3{font-size:14px;margin:0 0 10px;color:#99a3b1;font-weight:600}
 .ref{color:#6f7a88;font-weight:400;direction:ltr;unicode-bidi:embed}
 .cap{font-size:15px;line-height:1.65;margin:0 0 4px;color:#d6dae1;max-width:88ch}
 .tags{color:#7f8b9a;font-size:13px;margin:0 0 16px}
 .why{color:#8d97a5;font-size:13px;line-height:1.6;margin:14px 0 0;direction:ltr;text-align:left;max-width:110ch}
 .pair{display:flex;gap:22px;align-items:flex-start}
 .col{flex:0 0 auto} .col.grow{flex:1 1 auto;min-width:0}
 .strip{display:flex;gap:10px;overflow-x:auto;padding-bottom:8px}
 figure{margin:0;flex:0 0 auto;width:236px}
 figure img{width:236px;height:295px;object-fit:cover;border-radius:7px;display:block;background:#1b1f26}
 figcaption{text-align:center;color:#7f8b9a;font-size:12px;padding-top:4px}
 .src{width:330px;background:#181d26;border:1px solid #262d39;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:9px}
 .src.big{width:420px}
 .src img{width:100%;border-radius:6px;display:block;background:#11141a}
 .meta{display:flex;flex-direction:column;gap:3px}
 .acct{font-size:14.5px;font-weight:600;color:#e4e8ee;direction:ltr;text-align:right}
 .kind,.num{font-size:12.5px;color:#8f99a7}
 .warn{color:#c49a4a}
 .go{margin-top:5px;font-size:13px;color:#7fb2ff;text-decoration:none}
 details.old{margin-top:40px;color:#7f8b9a}
 details.old summary{cursor:pointer;font-size:14px;padding:10px 0}
 section.dim{opacity:.55}
 section.dim figure img{height:260px}
</style></head><body>
<h1>חמישה שיבוטים, כל אחד מול המקור שלו</h1>
<p class="sub">משמאל המקור מהקורפוס, מימין מה שנבנה ממנו: אותה מערכת ויזואלית, אותו רעיון נושא, יעד ישראלי.
המקורות האורגניים מוצגים בשתי שקופיות כי האמבד של אינסטגרם חותך שם. אף מספר כאן אינו "ניצחון": אין חציון לחשבון.</p>
${cloneSections}
${oldSections}
</body></html>`;

fs.writeFileSync(path.join(OUT, 'preview.html'), html);
console.log(`preview -> ${path.join(OUT, 'preview.html')} (${clones.length} clones, ${old.length} superseded)`);
