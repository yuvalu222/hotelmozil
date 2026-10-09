// What the mirror has done and what it is waiting on, as a page: every post
// with its TikTok slides next to the 4:5 slides Instagram gets, the caption,
// and the status. Opens in Chrome.
//
//   node ig/status.mjs           write + open
//   node ig/status.mjs --no-open

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { DIR, loadState, loadToken, postDir } from './lib/store.mjs';

const LABEL = {
  new: 'חדש, מחכה שעה מההעלאה',
  ready: 'מוכן, מחכה לתורו',
  publishing: 'באמצע העלאה',
  published: 'עלה לאינסטגרם',
  held: 'נעצר, צריך החלטה',
  failed: 'נכשל',
  'skipped-video': 'סרטון, לא קרוסלה',
};

const state = loadState();
const tok = loadToken();
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const url = (f) => 'file:///' + f.replace(/\\/g, '/');

const posts = Object.values(state?.posts || {}).filter((p) => p.status !== 'skipped-video').sort((a, b) => b.createTime - a.createTime);
const card = (p) => {
  const dir = postDir(p.id);
  const slides = (p.slides || []).map((s) => `
    <div class="pair">
      <img class="tt" src="${url(path.join(dir, 'tt-' + s.name))}" alt="">
      <img class="ig" src="${url(path.join(dir, s.name))}" alt="">
      <span>${esc(s.mode)}</span>
    </div>`).join('');
  return `<section>
    <h2><a href="https://www.tiktok.com/@hotelmozil/photo/${p.id}">TikTok ${p.id}</a>
      <b class="st ${p.status}">${esc(LABEL[p.status] || p.status)}</b></h2>
    <p class="meta">הועלה לטיקטוק ${new Date(p.createTime * 1000).toLocaleString('he-IL')}
      ${p.permalink ? ` · <a href="${esc(p.permalink)}">הפוסט באינסטגרם</a>` : ''}
      ${p.held ? ` · ${esc(p.held)}` : ''}${p.error ? ` · שגיאה: ${esc(p.error)}` : ''}</p>
    ${p.caption ? `<pre>${esc(p.caption)}</pre>` : ''}
    ${p.tiktok?.music ? `<p class="meta">הסאונד בטיקטוק: ${esc(p.tiktok.music)} (באינסטגרם אין סאונד: ה-API לא תומך)</p>` : ''}
    <div class="row">${slides}</div>
  </section>`;
};

const html = `<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>טיקטוק לאינסטגרם</title>
<style>
:root{--bg:#f6f6f4;--fg:#1d1d1b;--mute:#6b6b66;--card:#fff;--line:#e3e3de}
@media (prefers-color-scheme: dark){:root{--bg:#161615;--fg:#ececea;--mute:#a3a39d;--card:#1f1f1d;--line:#33332f}}
body{margin:0;padding:24px 16px;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,sans-serif}
h1{font-size:22px;margin:0 0 4px}
.top{color:var(--mute);margin:0 0 20px}
section{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:16px}
h2{font-size:16px;margin:0;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
a{color:inherit}
.st{font-size:13px;padding:2px 10px;border-radius:99px;background:var(--line)}
.published{background:#cfeccf;color:#134d13}.held,.failed{background:#f6d4d0;color:#6b1a10}
.meta{color:var(--mute);margin:6px 0}
pre{white-space:pre-wrap;font:inherit;background:var(--bg);padding:10px;border-radius:8px}
.row{display:flex;gap:12px;overflow-x:auto;padding-bottom:6px}
.pair{display:grid;grid-template-columns:auto auto;gap:4px;flex:none;font-size:12px;color:var(--mute)}
.pair span{grid-column:1/3}
.connect{border-color:#3a7}.connect li{margin:6px 0}
.tt{height:200px;border-radius:6px}.ig{height:200px;border-radius:6px;outline:2px solid #3a7}
</style>
<h1>טיקטוק → אינסטגרם</h1>
<p class="top">${tok ? `מחובר לאינסטגרם @${esc(tok.username)} · החיבור בתוקף עד ${esc((tok.expiresAt || '').slice(0, 10)) || 'לא ידוע'}` : 'אינסטגרם עוד לא מחובר: קרוסלות מוכנות מחכות לחיבור'}
 · מעקב מ-${state ? new Date(state.cutoff * 1000).toLocaleDateString('he-IL') : 'עוד לא רץ'}
 · בכל זוג: מימין טיקטוק, משמאל במסגרת ירוקה מה שעולה לאינסטגרם (4:5)</p>
${tok ? '' : `<section class="connect">
  <h2>חיבור חד-פעמי לאינסטגרם</h2>
  <ol>
    <li>באפליקציית אינסטגרם, בחשבון <b>@hotelmozil</b>: הגדרות ← סוג חשבון וכלים ← מעבר לחשבון מקצועי ← <b>יוצר</b>. אם החשבון כבר מקצועי, מדלגים.</li>
    <li>ב-<a href="https://developers.facebook.com/apps">developers.facebook.com/apps</a>: <b>Create app</b> ← בשימוש (use case) לבחור <b>Manage messaging &amp; content on Instagram</b> ← ליצור.</li>
    <li>באפליקציה שנוצרה: <b>Instagram</b> ← <b>API setup with Instagram business login</b> ← <b>Add account</b> / <b>Generate token</b> ← להתחבר עם @hotelmozil ← <b>Copy</b>.</li>
    <li>לחיצה כפולה על <b>חיבור אינסטגרם</b> בשולחן העבודה. זה קורא את הטוקן שהועתק, בודק אותו, ופותח את הדף הזה מחדש.</li>
  </ol>
  <p class="meta">הטוקן תקף 60 יום והמערכת מחדשת אותו לבד כל שבוע, כך שזה קורה פעם אחת.</p>
</section>`}
${posts.length ? posts.map(card).join('') : '<p>עוד אין קרוסלות חדשות מאז תחילת המעקב.</p>'}
</html>`;

const out = path.join(DIR, 'status.html');
fs.writeFileSync(out, html);
console.log(out);
for (const p of posts) console.log(`${p.id}  ${p.status.padEnd(10)} ${(p.slides || []).length} slides  ${p.permalink || p.held || p.error || ''}`);
if (!process.argv.includes('--no-open')) {
  const chrome = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find((f) => fs.existsSync(f));
  if (chrome) execFile(chrome, [out]).unref();
}
