// Build the page that answers "show me your inspiration" — the real source
// frames next to what I actually built from them.
//
// He asked, 7.10: "I have no idea what those 4 little pictures on every slide
// are or why you did it that way — that is not what I meant. If there is an
// inspiration like that, show what it is."
//
// There IS one, and the honest answer has two halves. The structure came from
// the two highest saves-per-like decks in the 524-deck harvest. But my build
// shrank it: their tiles are large and landscape, three stops per slide, with
// a dashed timeline carrying the walking time between them. Mine became four
// small squares, because every time a line of Hebrew wrapped I made the tile
// smaller to free up width. The drift is mine, not theirs.
//
// Copies the source frames next to the output so the page is self-contained
// and can be reopened later without the harvest.

import fs from 'node:fs';
import path from 'node:path';

const OUT = path.join('out', '_inspiration');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const SOURCES = [
  { id: '7594133912230792456', handle: '@trip.com', sl: '1.31', saves: '127,500', frames: ['01.jpg', '02.jpg'] },
  { id: '7597919401312111894', handle: '@vitortrip', sl: '1.54', saves: '90,000', frames: ['01.jpg', '02.jpg'] },
];

const rows = [];
for (const s of SOURCES) {
  const got = [];
  for (const f of s.frames) {
    const src = path.join('harvest', 'tt-decks', s.id, f);
    if (!fs.existsSync(src)) continue;
    const dest = `src-${s.id}-${f}`;
    fs.copyFileSync(src, path.join(OUT, dest));
    got.push(dest);
  }
  rows.push({ ...s, got });
}

// And what I built from it.
const mine = [];
for (const [deck, frame] of [['tt-26-amalfi', '03-tiktok.jpg'], ['tt-4-larnaca-20things', '04-tiktok.jpg']]) {
  const src = path.join('out', deck, frame);
  if (!fs.existsSync(src)) continue;
  const dest = `mine-${deck}.jpg`;
  fs.copyFileSync(src, path.join(OUT, dest));
  mine.push({ deck, dest });
}

// The rebuild, so all three can be seen in one place.
const preview = path.join('out', '_preview', 'route.jpg');
let rebuilt = null;
if (fs.existsSync(preview)) {
  rebuilt = 'rebuilt-route.jpg';
  fs.copyFileSync(preview, path.join(OUT, rebuilt));
}

const img = (f, cap) => `<figure><a href="${f}" target="_blank"><img src="${f}" loading="lazy"></a>`
  + `<figcaption>${cap}</figcaption></figure>`;

const html = `<!doctype html>
<html lang="he" dir="rtl"><meta charset="utf-8">
<title>ההשראה — ומה שעשיתי ממנה</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  :root{--bg:#0e1013;--card:#171a1f;--line:#272c33;--ink:#f2f4f7;--dim:#9aa3ad;--warn:#e0a33e;--brand:#70d050}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 'Segoe UI',Arial,sans-serif}
  header{padding:26px 24px 14px;border-bottom:1px solid var(--line)}
  h1{margin:0 0 8px;font-size:22px}
  header p{margin:0;color:var(--dim);font-size:14px;max-width:70ch}
  section{padding:24px;border-bottom:1px solid var(--line)}
  h2{margin:0 0 6px;font-size:18px}
  .meta{margin:0 0 14px;color:var(--dim);font-size:13px}
  .strip{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px}
  figure{margin:0;flex:0 0 auto}
  figure img{display:block;width:300px;border-radius:12px;border:1px solid var(--line);background:#000}
  figcaption{color:var(--dim);font-size:12px;margin-top:6px;text-align:center;max-width:300px}
  .note{background:var(--card);border:1px solid var(--line);border-right:3px solid var(--warn);
        border-radius:10px;padding:14px 16px;margin:0 0 16px;max-width:80ch}
  .note b{color:var(--warn)}
  ul{margin:8px 0 0;padding-inline-start:20px;color:var(--dim)}
  li{margin:4px 0}
</style>
<header>
  <h1>מאיפה הפורמט הזה הגיע</h1>
  <p>שני הדקים עם יחס השמירות-ללייק הגבוה ביותר בקורפוס של 524 דקים, משני חשבונות שונים.
     למטה: הפריימים המקוריים, ואחריהם מה שבניתי מהם.</p>
</header>

${rows.map((s) => `<section>
  <h2>${s.handle}</h2>
  <p class="meta">${s.saves} שמירות · ${s.sl} שמירות לכל לייק — הגבוה בקורפוס</p>
  <div class="strip">${s.got.map((f, i) => img(f, `שקופית ${i + 1}`)).join('')}</div>
</section>`).join('')}

<section>
  <h2>מה שבניתי מזה</h2>
  <div class="note">
    <b>וכאן הסחיפה, והיא שלי.</b> במקור: אריחים <b>גדולים ולרוחב</b>, <b>שלוש</b> עצירות
    בשקופית, וציר זמן מקווקו שנושא את זמן ההליכה בין עצירה לעצירה. אצלי זה הפך
    ל<b>ארבעה ריבועים קטנים</b> בלי ציר — כי בכל פעם ששורה בעברית נשברה, הקטנתי את
    התמונה כדי לפנות רוחב לטקסט. ירדתי מ-258 ל-224 ואז ל-196 פיקסל.
    <ul>
      <li>הם נותנים לכל עצירה 3-4 שורות טקסט. אני דחסתי לשורה אחת.</li>
      <li>אצלם יש היררכיה של צבע: כותרת כתומה, פרט מודגש, שאר הטקסט לבן.</li>
      <li>אצלם אין כריכה נפרדת בכלל — שקופית 1 היא כבר המסלול.</li>
    </ul>
  </div>
  <div class="strip">${mine.map((m) => img(m.dest, m.deck)).join('')}</div>
</section>

${rebuilt ? `<section>
  <h2>אחרי — הפורמט בנוי מחדש מול המקור</h2>
  <div class="note" style="border-right-color:var(--brand)">
    <b>מה חזר:</b> שלוש עצירות במקום ארבע · אריחים גדולים לרוחב במקום ריבועים
    קטנים · שלוש שורות לכל עצירה במקום אחת · <b>ציר הזמן המקווקו עם זמן המעבר
    בין עצירה לעצירה</b>, שהוא הדבר היחיד שאומר "אלה לפי סדר" · והיררכיית צבע:
    שם בענבר, מספר בירוק, שאר הטקסט לבן.
  </div>
  <div class="strip">${img(rebuilt, 'tt-route — תצוגה מקדימה')}</div>
</section>` : ''}
</html>
`;

fs.writeFileSync(path.join(OUT, 'index.html'), html, 'utf8');
console.log(path.resolve(OUT, 'index.html'));
