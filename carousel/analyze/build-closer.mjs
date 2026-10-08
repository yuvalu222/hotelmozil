// His branded closer, rebuilt natively at 9:16 (owner, 8.10: "the blurred
// bands look bad"; chose "rebuild at 9:16" over a full-bleed crop that put
// his text under TikTok's header, caption and like rail).
//
// Every element is HIS, at his proportions, measured off
// assets/own-close/branded-card.orig.jpg (display units, 1500 wide):
//   top box 285..1215 x 78..372 · icon 458..1022 x 455..1020
//   middle box 190..1280 x 1105..1395 · App Store badge 352..1148 x 1470..1705
//   box = black at 55% (inside/outside luminance 0.39-0.47 at four edges)
//   cyan #18c8f8, green #78d858 (most common pixel in each word)
// The App Store badge is cut from his own image. Google Play sits directly
// under it at the same size (owner, 8.10), from Google's official badge.
// The background is a sharp Pexels photo of the same kind of bay, because his
// photo has the text baked into it.
//
//   node analyze/build-closer.mjs
import fs from 'node:fs';
import { chromium } from 'playwright';

const b64 = (f, t) => `data:${t};base64,${fs.readFileSync(f).toString('base64')}`;
const his = b64('assets/own-close/branded-card.orig.jpg', 'image/jpeg');
const bg = b64('cache/closer/pexels-14574527.jpg', 'image/jpeg');
const icon = b64('../../HotelMozil/assets/images/icon.png', 'image/png');
const gp = b64('assets/badges/google-play.png', 'image/png');
const OUT = 'assets/own-close/branded-card-916.jpg'; // owner kept his own closer (8.10); this one is not wired into any deck

// Layout box: his 1500x2000 frame scaled by K and centred, so the content
// (78..1970 with the second badge) sits inside TikTok's safe band 240..1590.
const K = 0.67;
const LEFT = 540 - 750 * K;
const TOP = 240 + (1350 - (1970 - 78) * K) / 2 - 78 * K;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@700;800;900&display=block" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;position:relative;overflow:hidden;background:#000}
.bg{position:absolute;inset:0;width:1080px;height:1920px;object-fit:cover}
.L{position:absolute;left:${LEFT}px;top:${TOP}px;width:1500px;height:2000px;transform:scale(${K});transform-origin:0 0;direction:rtl}
.box{position:absolute;background:rgba(0,0,0,.55);border-radius:34px;text-align:center;color:#fff;font-family:Rubik;font-weight:800;text-shadow:0 4px 10px rgba(0,0,0,.45)}
.top{left:285px;width:930px;top:78px;height:294px}
.brand{font-family:Rubik;font-weight:800;font-size:110px;line-height:1;color:#18c8f8;direction:ltr;position:absolute;top:22px;left:0;right:0}
.l1{position:absolute;top:168px;left:0;right:0;font-size:100px;line-height:1}
.icon{position:absolute;left:458px;top:455px;width:564px;height:564px;border-radius:124px;overflow:hidden;box-shadow:0 18px 40px rgba(0,0,0,.35)}
.icon img{width:100%;height:100%;display:block}
.mid{left:190px;width:1090px;top:1105px;height:290px}
.m1{position:absolute;top:36px;left:0;right:0;font-size:100px;line-height:1}
.m1 b{color:#78d858;font-weight:900}
.m2{position:absolute;top:176px;left:0;right:0;font-size:100px;line-height:1}
.badge{position:absolute;left:352px;width:796px;height:235px;border-radius:40px;overflow:hidden}
.as{top:1470px;background:url(${his}) no-repeat;background-size:1500px 2000px;background-position:-352px -1470px}
.gp{top:1735px;background:#000}
.gp img{position:absolute;width:${796 * 646 / 562}px;height:${235 * 250 / 167}px;left:${-796 * 41 / 562}px;top:${-235 * 41 / 167}px}
</style></head><body>
<img class="bg" src="${bg}">
<div class="L">
  <div class="box top"><div class="brand">HotelMozil</div><div class="l1">עושה בדיוק את זה</div></div>
  <div class="icon"><img src="${icon}"></div>
  <div class="box mid"><div class="m1">מוזיל <b>כ70%</b> מהמלונות</div><div class="m2">חפשו עכשיו!</div></div>
  <div class="badge as"></div>
  <div class="badge gp"><img src="${gp}"></div>
</div>
</body></html>`;

const br = await chromium.launch({ channel: 'chrome', headless: true });
const p = await br.newPage({ viewport: { width: 1080, height: 1920 } });
await p.setContent(html, { waitUntil: 'networkidle' });
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(400);
await p.screenshot({ path: OUT, type: 'jpeg', quality: 92 });
await br.close();
console.log(`-> ${OUT}  (layout scale ${K}, top ${Math.round(TOP + 78 * K)}..${Math.round(TOP + 1970 * K)})`);
