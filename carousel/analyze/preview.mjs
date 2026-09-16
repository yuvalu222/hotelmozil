// Build a single HTML page showing every rendered carousel, slide by slide, so
// the five decks can be judged at a glance instead of by opening 90 JPEGs.
//
//   node analyze/preview.mjs            -> out/preview.html

import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
const specsDir = 'specs';

const decks = fs.readdirSync(OUT)
  .filter(d => fs.statSync(path.join(OUT, d)).isDirectory())
  .filter(d => d.startsWith('he-'))
  .sort();

function specFor(id) {
  const p = path.join(specsDir, `${id}.json`);
  if (!fs.existsSync(p)) return {};
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return {}; }
}

const sections = decks.map(id => {
  const dir = path.join(OUT, id);
  const slides = fs.readdirSync(dir).filter(f => /-tiktok\.jpg$/.test(f)).sort();
  const spec = specFor(id);
  const imgs = slides.map((f, i) =>
    `<figure><img loading="lazy" src="${id}/${f}"><figcaption>${i + 1}</figcaption></figure>`).join('');
  return `<section>
    <h2>${id}</h2>
    <p class="demo">${(spec.demonstrates || '').replace(/</g, '&lt;')}</p>
    <p class="cap"><b>כיתוב:</b> ${(spec.caption || '').replace(/</g, '&lt;')}</p>
    <p class="tags">${(spec.hashtags || []).map(h => '#' + h).join(' ')}</p>
    <div class="strip">${imgs}</div>
  </section>`;
}).join('');

const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>חמש הקרוסלות</title>
<style>
 :root{color-scheme:dark}
 *{box-sizing:border-box}
 body{margin:0;background:#101216;color:#e9e7e2;
   font-family:'Segoe UI',system-ui,sans-serif;padding:28px 34px 80px}
 h1{font-size:30px;margin:0 0 6px}
 .sub{color:#98a1ae;margin:0 0 30px;font-size:15px;line-height:1.6;max-width:80ch}
 section{margin:0 0 46px;padding:0 0 30px;border-bottom:1px solid #262b33}
 h2{font-size:20px;margin:0 0 8px;color:#cfd6e0;direction:ltr;text-align:right}
 .demo{color:#8d97a5;font-size:13.5px;line-height:1.6;margin:0 0 10px;direction:ltr;text-align:left;max-width:100ch}
 .cap{font-size:15px;line-height:1.6;margin:0 0 4px;color:#d6dae1}
 .tags{color:#7f8b9a;font-size:13px;margin:0 0 14px}
 .strip{display:flex;gap:12px;overflow-x:auto;padding-bottom:10px}
 figure{margin:0;flex:0 0 auto;width:240px}
 img{width:240px;height:427px;object-fit:cover;border-radius:8px;display:block;background:#1b1f26}
 figcaption{text-align:center;color:#7f8b9a;font-size:12px;padding-top:5px}
</style></head><body>
<h1>חמש הקרוסלות</h1>
<p class="sub">כל קרוסלה מדגימה דבר אחר שהמחקר מצא. השורה באנגלית מתחת לכל כותרת אומרת בדיוק מה,
ולמה. שקופית הסיום היא מציין מיקום בכולן: היא שלך, ולא עיצבתי אותה.
הפירוט המלא ב-PLAYBOOK.md.</p>
${sections}
</body></html>`;

fs.writeFileSync(path.join(OUT, 'preview.html'), html);
console.log(`preview -> ${path.join(OUT, 'preview.html')} (${decks.length} decks)`);
