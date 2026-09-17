// Build out/preview.html — every rendered carousel, slide by slide, and beside
// each one the decks in the harvested corpus whose pattern it was built from,
// with a live link to each source so the original can be opened and judged.
//
//   node analyze/preview.mjs

import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
const specsDir = 'specs';
const sourcesPath = 'analyze/sources.json';

const decks = fs.readdirSync(OUT)
  .filter(d => fs.statSync(path.join(OUT, d)).isDirectory())
  .filter(d => d.startsWith('he-'))
  .sort();

const sources = fs.existsSync(sourcesPath)
  ? JSON.parse(fs.readFileSync(sourcesPath, 'utf8')) : {};

const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function specFor(id) {
  const p = path.join(specsDir, `${id}.json`);
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

function sourceCard(s) {
  // sheets live at carousel/harvest/sheets; this page sits in carousel/out
  const sheet = s.sheet ? '../' + s.sheet : null;
  const kind = s.organic ? 'אורגני · אינסטגרם' : 'מודעה · ספריית המודעות';
  let metric = '';
  if (s.organic) {
    metric = s.engagementRate != null
      ? `לייקים ${s.metricValue ?? '—'} · מעורבות ${s.engagementRate}`
      : `לייקים ${s.metricValue ?? '—'}`;
  } else {
    metric = s.metricValue != null ? `רץ ${s.metricValue} ימים` : 'אין מדידה';
  }
  const slides = s.organic
    ? `${s.slideCount} שקופיות <span class="warn">(האמבד חותך ל-2)</span>`
    : `${s.slideCount} שקופיות (דק מלא)`;
  return `<article class="src">
    ${sheet ? `<a href="${esc(sheet)}" target="_blank"><img loading="lazy" src="${esc(sheet)}" alt=""></a>`
            : `<div class="nosheet">אין גיליון</div>`}
    <div class="meta">
      <div class="acct">${esc(s.account || s.id)}</div>
      <div class="kind">${kind}</div>
      <div class="num">${slides}</div>
      <div class="num">${esc(metric)}</div>
      <a class="go" href="${esc(s.url)}" target="_blank" rel="noopener">פתח את המקור ↗</a>
    </div>
  </article>`;
}

const sections = decks.map(id => {
  const dir = path.join(OUT, id);
  const slides = fs.readdirSync(dir).filter(f => /-tiktok\.jpg$/.test(f)).sort();
  const spec = specFor(id);
  const mine = slides.map((f, i) =>
    `<figure><img loading="lazy" src="${id}/${f}"><figcaption>${i + 1}</figcaption></figure>`).join('');

  const src = sources[id];
  // one card per distinct creative: AYANA ships the same deck under two
  // library ids, and showing it twice would overstate the evidence
  const seen = new Set();
  const uniq = (src?.sources || []).filter(s => {
    const k = (s.account || s.id) + '|' + s.slideCount;
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });

  const srcBlock = src
    ? `<div class="srcwrap">
         <h3>המקור <span class="ref">${esc(src.ref)}</span></h3>
         <p class="why">${esc(src.why)}</p>
         <div class="srcgrid">${uniq.map(sourceCard).join('')}</div>
       </div>`
    : '';

  return `<section>
    <h2>${esc(id)}</h2>
    <p class="cap"><b>כיתוב:</b> ${esc(spec.caption)}</p>
    <p class="tags">${(spec.hashtags || []).map(h => '#' + esc(h)).join(' ')}</p>
    <h3>מה שנבנה</h3>
    <div class="strip">${mine}</div>
    ${srcBlock}
  </section>`;
}).join('');

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>חמש הקרוסלות והמקור שלהן</title>
<style>
 :root{color-scheme:dark}
 *{box-sizing:border-box}
 body{margin:0;background:#0f1115;color:#e9e7e2;
   font-family:'Segoe UI',system-ui,sans-serif;padding:26px 32px 90px}
 h1{font-size:30px;margin:0 0 8px}
 .sub{color:#98a1ae;margin:0 0 34px;font-size:15px;line-height:1.65;max-width:86ch}
 .sub b{color:#d8dde4}
 section{margin:0 0 20px;padding:22px 0 30px;border-bottom:1px solid #242a33}
 h2{font-size:21px;margin:0 0 10px;color:#cfd6e0;direction:ltr;text-align:right}
 h3{font-size:14px;margin:22px 0 10px;color:#99a3b1;font-weight:600;letter-spacing:.02em}
 .ref{color:#6f7a88;font-weight:400}
 .cap{font-size:15px;line-height:1.65;margin:0 0 4px;color:#d6dae1;max-width:88ch}
 .tags{color:#7f8b9a;font-size:13px;margin:0}
 .why{color:#aab3c0;font-size:14px;line-height:1.6;margin:0 0 14px;max-width:88ch}
 .strip{display:flex;gap:11px;overflow-x:auto;padding-bottom:8px}
 figure{margin:0;flex:0 0 auto;width:206px}
 figure img{width:206px;height:366px;object-fit:cover;border-radius:7px;display:block;background:#1b1f26}
 figcaption{text-align:center;color:#7f8b9a;font-size:12px;padding-top:4px}
 .srcwrap{margin-top:26px;padding:18px 20px 20px;background:#141821;border-radius:12px;
   border:1px solid #232a35}
 .srcgrid{display:flex;gap:14px;overflow-x:auto;padding-bottom:6px}
 .src{flex:0 0 auto;width:330px;background:#181d26;border:1px solid #262d39;
   border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:9px}
 .src img{width:100%;border-radius:6px;display:block;background:#11141a}
 .nosheet{height:120px;display:flex;align-items:center;justify-content:center;color:#5f6874;
   border:1px dashed #333b47;border-radius:6px;font-size:13px}
 .meta{display:flex;flex-direction:column;gap:3px}
 .acct{font-size:14.5px;font-weight:600;color:#e4e8ee;direction:ltr;text-align:right}
 .kind{font-size:12.5px;color:#7f8b9a}
 .num{font-size:12.5px;color:#9aa4b2;direction:rtl}
 .warn{color:#c49a4a}
 .go{margin-top:5px;font-size:13px;color:#7fb2ff;text-decoration:none}
 .go:hover{text-decoration:underline}
</style></head><body>
<h1>חמש הקרוסלות, והמקור של כל אחת</h1>
<p class="sub">מתחת לכל קרוסלה יושבים הדקים האמיתיים שמהם נגזר הפורמט, עם קישור חי לכל אחד.
<b>שים לב למה שאפשר ומה שאי אפשר להסיק מהם:</b> הדקים האורגניים מאינסטגרם מוצגים
בשתי שקופיות בלבד, כי האמבד חותך שם — מהם רואים את הפתיחה ואת שקופית 2 ולא יותר.
הדקים המלאים הם מודעות. ואף אחד מהמספרים כאן אינו "ניצחון": אין חציון לחשבון, ולכן
זה תיאור של מה שהז'אנר עושה, לא הוכחה שזה עובד. ההסבר המלא ב-PLAYBOOK §0.</p>
${sections}
</body></html>`;

fs.writeFileSync(path.join(OUT, 'preview.html'), html);
console.log(`preview -> ${path.join(OUT, 'preview.html')} (${decks.length} decks)`);
