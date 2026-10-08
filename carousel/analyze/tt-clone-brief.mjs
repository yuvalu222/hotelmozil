// One page per clone: the source's numbers, the source's slides and the
// clone's slides side by side, and for every slide the things that were
// actually copied — what the photo shows, how much copy, at what size, in
// what weight, and where in the frame it sits.
//
// Sizes are not guessed: they are read back out of the rendered CSS, so the
// page states what the file really is rather than what the spec asked for.
//
//   node analyze/tt-clone-brief.mjs

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join('out', 'tt-briefs.html');

const decks = [];
const src = path.join('harvest', 'tt-final.jsonl');
if (fs.existsSync(src)) {
  for (const line of fs.readFileSync(src, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t) continue;
    try { decks.push(JSON.parse(t)); } catch { /* skip */ }
  }
}
const byId = new Map(decks.map((d) => [`tt-${d.id}`, d]));

// What each source slide actually says, transcribed off the slide image and
// translated. Without this the brief would ask you to trust that the clone
// follows the source; with it you can check.
const srcTextPath = path.join('harvest', 'tt-source-text.json');
const srcText = fs.existsSync(srcTextPath)
  ? JSON.parse(fs.readFileSync(srcTextPath, 'utf8')) : {};

const specs = fs.readdirSync('specs')
  .filter((f) => f.startsWith('tt-') && f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join('specs', f), 'utf8')))
  .filter((s) => byId.has(s.clonedFrom));

if (!specs.length) { console.log('no tiktok clones with a matching source yet'); process.exit(0); }

// Read the live computed type off one rendered slide per layout, so the brief
// quotes the file rather than the intention.
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const probe = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const tpl = fs.readFileSync(path.join('lib', 'template2.html'), 'utf8');
await probe.setContent(tpl, { waitUntil: 'networkidle' });
const type = await probe.evaluate(() => {
  const out = {};
  const probes = {
    'כותרת הוק': 'tth-big', 'שורת משנה בהוק': 'tth-sub', 'שורת רגל בהוק': 'tth-foot',
    "צ׳יפ כותרת": 'ttc-title', "צ׳יפ ירוק": 'ttc-accent', "צ׳יפ גוף": 'tt-item',
    'כותרת ברשימה': 'ttt-title', 'שורה ברשימה': 'ttt-line',
  };
  for (const [label, cls] of Object.entries(probes)) {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = 'בדיקה';
    document.getElementById('slide').appendChild(el);
    const cs = getComputedStyle(el);
    out[label] = { size: cs.fontSize, weight: cs.fontWeight, family: cs.fontFamily.split(',')[0].replace(/"/g, ''), stroke: cs.webkitTextStrokeWidth };
    el.remove();
  }
  return out;
});
await browser.close();

const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const nf = (n) => (typeof n === 'number' ? n.toLocaleString('en-US') : '—');
const words = (s) => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const abs = (f) => 'file:///' + path.resolve(f).replace(/\\/g, '/');

const POS = { top: 'גבוה בפריים', upper: 'שליש עליון', mid: 'אמצע הפריים', low: 'שליש תחתון' };

function slideRows(spec) {
  return spec.slides.map((s, i) => {
    let copy = '', amount = 0, place = '';
    if (s.layout === 'tt-hook') {
      copy = [...(s.titleLines || []), s.sub, ...(s.foot || [])].filter(Boolean).join(' / ');
      amount = words(copy);
      place = 'כותרת ב-21% מהגובה, שורת רגל ב-70%';
    } else if (s.layout === 'tt-chips') {
      copy = [s.title, s.accent, ...(s.items || [])].filter(Boolean).join(' / ');
      amount = words(copy);
      place = `צ'יפ כותרת במרכז למעלה, ${(s.items || []).length} צ'יפי גוף מיושרים לימין`;
    } else if (s.layout === 'tt-memo') {
      copy = [s.memoNo, ...(s.titleLines || []), s.sub].filter(Boolean).join(' / ');
      amount = words(copy);
      place = 'כרטיס נייר, בלי תמונה כלל';
    } else if (s.layout === 'tt-card') {
      copy = [s.place, ...(s.meta || []), s.doLabel, ...(s.todo || []),
        s.stayLabel, ...(s.stay || [])].filter(Boolean).join(' / ');
      amount = words(copy);
      place = `בלוק מיושר לימין בראש הפריים, ${(s.todo || []).length} פריטי עשייה ו-${(s.stay || []).length} לינה`;
    } else if (s.layout === 'tt-gem-cover') {
      copy = [...(s.titleLines || []), s.sub].filter(Boolean).join(' / ');
      amount = words(copy);
      place = 'כותרת סריף ממורכזת ברבע העליון';
    } else if (s.layout === 'tt-grid9') {
      copy = [s.place, s.note].filter(Boolean).join(' / ');
      amount = words(copy);
      place = 'תווית במרכז, מעל קולאז׳ 3x3 של תשע תמונות';
    } else if (s.layout === 'tt-gem') {
      copy = [s.place, ...(s.lines || [])].filter(Boolean).join(' / ');
      amount = words(copy);
      place = 'שם בסריף גבוה בפריים, שורות קצרות מתחת';
    } else {
      copy = [s.titleCaps, s.num ? `${s.num}.` : '', s.line, s.note, s.sub].filter(Boolean).join(' ');
      amount = words(copy);
      place = POS[s.pos] || 'שליש עליון';
    }
    const file = path.join('out', spec.id, String(i + 1).padStart(2, '0') + '-tiktok.jpg');
    return { i: i + 1, layout: s.layout, subject: s.alt || '', query: s.image?.query || (s.images || []).map((x) => x.query).join(' + '), copy, amount, place, file };
  });
}

let html = `<!doctype html><html dir="rtl" lang="he"><meta charset="utf-8">
<title>שיבוטי טיקטוק — תדריך מלא</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;700;900&display=swap" rel="stylesheet">
<style>
 *{box-sizing:border-box} body{margin:0;background:#0e1014;color:#e8eaee;font:16px/1.6 Heebo,sans-serif;padding:34px}
 h1{font-weight:900;font-size:34px;margin:0 0 6px} h2{font-size:25px;margin:48px 0 4px;font-weight:900}
 .lede{color:#9aa4b2;margin:0 0 26px;max-width:900px}
 .card{background:#161920;border:1px solid #242934;border-radius:14px;padding:22px;margin:16px 0}
 .nums{display:flex;gap:26px;flex-wrap:wrap;margin:10px 0 4px}
 .nums b{display:block;font-size:27px;font-weight:900;color:#7ee29a;line-height:1.2}
 .nums span{color:#8d96a5;font-size:13px}
 .meta{color:#aeb6c2;font-size:14px;margin-top:10px}
 .meta code{background:#0c0e12;padding:2px 7px;border-radius:5px;color:#d7dde6;direction:ltr;display:inline-block}
 .why{background:#11161c;border-right:3px solid #3f8ae0;padding:12px 16px;margin:14px 0;color:#c6cedb;font-size:15px}
 table{border-collapse:collapse;width:100%;margin-top:14px;font-size:14px}
 th,td{border-bottom:1px solid #242934;padding:9px 10px;text-align:right;vertical-align:top}
 th{color:#8d96a5;font-weight:700;font-size:13px}
 td.n{color:#7ee29a;font-weight:700;width:38px}
 .strip{display:flex;gap:8px;overflow-x:auto;padding:12px 0 4px}
 .strip figure{margin:0;flex:0 0 auto;width:150px}
 .strip img{width:150px;height:267px;object-fit:cover;border-radius:7px;display:block;background:#0a0c10}
 .strip.srcimgs img{height:200px;object-fit:contain;background:#0a0c10}
 .strip figcaption{color:#79818f;font-size:11px;text-align:center;padding-top:3px}
 .lbl{color:#8d96a5;font-size:13px;margin-top:16px;font-weight:700}
 a{color:#7fb2f5}
 pre.paste{background:#0c0e12;border:1px solid #242934;border-radius:9px;padding:14px 16px;
   margin:8px 0 4px;white-space:pre-wrap;font:15px/1.65 Heebo,sans-serif;color:#e8eaee;direction:rtl}
</style>
<h1>שיבוטי טיקטוק — תדריך מלא</h1>
<p class="lede">כל שיבוט כאן מועתק מפוסט תמונות אחד בטיקטוק שעבר את הרף של 50,000 לייקים.
לכל אחד: המספרים של המקור, השקופיות של המקור מול השקופיות של השיבוט, ולכל שקופית מה
התמונה מראה, כמה כיתוב יש בה, באיזה גודל וכובד, ואיפה בפריים הוא יושב. הגדלים נקראו
מתוך הקובץ שנבנה, לא מתוך הכוונה.</p>`;

html += '<div class="card"><div class="lbl">הטיפוגרפיה, כפי שהיא בקובץ</div><table>'
  + '<tr><th>רכיב</th><th>גודל</th><th>כובד</th><th>פונט</th><th>קו מתאר</th></tr>'
  + Object.entries(type).map(([k, v]) =>
    `<tr><td>${esc(k)}</td><td><code>${esc(v.size)}</code></td><td><code>${esc(v.weight)}</code></td>`
    + `<td><code>${esc(v.family)}</code></td><td><code>${esc(v.stroke || '0px')}</code></td></tr>`).join('')
  + '</table></div>';

for (const spec of specs) {
  const d = byId.get(spec.clonedFrom);
  const rows = slideRows(spec);
  const srcFiles = (d.files || []).filter((f) => fs.existsSync(f));
  const er = d.likes && d.saves ? (d.saves / d.likes) : null;

  html += `<h2>${esc(spec.id)}</h2>
  <div class="card">
    <div class="nums">
      <div><b>${nf(d.likes)}</b><span>לייקים</span></div>
      <div><b>${nf(d.saves)}</b><span>שמירות</span></div>
      <div><b>${nf(d.shares)}</b><span>שיתופים</span></div>
      <div><b>${nf(d.comments)}</b><span>תגובות</span></div>
      <div><b>${srcFiles.length}</b><span>שקופיות במקור</span></div>
      ${er ? `<div><b>${er.toFixed(2)}</b><span>שמירות לכל לייק</span></div>` : ''}
    </div>
    <div class="meta">מקור: <a href="${esc(d.url)}">@${esc(d.account)}</a>
      &nbsp;·&nbsp; סאונד: <code>${esc(d.music || 'לא זוהה')}</code>
      ${!d.music ? '(שם הטראק לא נקלט מהדף — לא ידוע אם מקורי או מספרייה)'
                 : d.soundIsOriginal ? '(הקלטה של היוצר)' : '(טראק מספרייה, לא קשור לתוכן)'}
      ${d.musicUrl ? `<a href="${esc(d.musicUrl)}">דף הסאונד</a>` : ''}
      ${d.musicFromElement ? '' : '<span style="color:#d9a441">· נקרא מטקסט הדף, לא מאלמנט הסאונד — ייתכן שזה טראק של פוסט אחר</span>'}</div>
    <div class="meta">האשטגים במקור: <code>${esc((d.hashtags || []).slice(0, 14).map((h) => '#' + h).join(' '))}</code></div>
    <div class="meta">כיתוב במקור: ${esc(spec.sourceCaption || d.caption || '')}</div>
    <div class="why">${esc(spec.demonstrates)}</div>
    <div class="lbl">להעלאה — להעתיק כמו שזה</div>
    <pre class="paste">${esc(spec.caption)}

${esc((spec.hashtags || []).map((h) => '#' + h).join(' '))}</pre>
    <div class="meta"><b>סאונד:</b> ${esc(spec.sound || '')}</div>
    <div class="meta"><b>הקבצים:</b> <code>out/${esc(spec.id)}/NN-tiktok.jpg</code> — ${spec.slides.length} שקופיות, 1080x1920, לפי הסדר</div>

    <div class="lbl">המקור</div>
    <div class="strip srcimgs">${srcFiles.map((f, i) =>
      `<figure><img src="${abs(f)}"><figcaption>${i + 1}</figcaption></figure>`).join('')}</div>

    <div class="lbl">השיבוט</div>
    <div class="strip">${rows.map((r) => fs.existsSync(r.file)
      ? `<figure><img src="${abs(r.file)}"><figcaption>${r.i}</figcaption></figure>` : '').join('')}</div>

    <table>
      <tr><th>#</th><th>פריסה</th><th>מה בתמונה</th><th>מילים</th><th>איפה בפריים</th><th>הכיתוב שלנו</th><th>מה אמר המקור</th></tr>
      ${rows.map((r) => {
        const srcSlide = (srcText[spec.clonedFrom]?.slides || [])[r.i - 1];
        return `<tr><td class="n">${r.i}</td><td><code>${esc(r.layout)}</code></td>
        <td>${esc(r.subject)}<br><span style="color:#6f7784;font-size:12px;direction:ltr;display:inline-block">${esc(r.query)}</span></td>
        <td class="n">${r.amount}</td><td>${esc(r.place)}</td><td>${esc(r.copy).slice(0, 220)}</td>
        <td style="color:#9aa4b2">${srcSlide ? esc(srcSlide.he).slice(0, 240) : '—'}
          ${srcSlide?.image ? `<br><span style="color:#6f7784;font-size:12px">תמונת המקור: ${esc(srcSlide.image)}</span>` : ''}</td></tr>`;
      }).join('')}
    </table>
  </div>`;
}

html += '</html>';
fs.mkdirSync('out', { recursive: true });
fs.writeFileSync(OUT, html, 'utf8');
console.log(`brief -> ${OUT}  (${specs.length} clone${specs.length > 1 ? 's' : ''})`);
