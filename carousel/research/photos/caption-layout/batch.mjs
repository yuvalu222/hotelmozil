// Batch probe: TikTok mobile-web photo player, one fresh profile per page.
// For each post and viewport: the first slide's <img> box, the caption block
// box (username top -> music line bottom), line counts, then the same after
// clicking "See more" (caption expanded). Screenshots both states.
//   node batch.mjs posts.json out.jsonl
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const [listFile, outFile] = process.argv.slice(2);
const posts = JSON.parse(fs.readFileSync(listFile, 'utf8'));
const SHOTS = path.resolve('research/photos/caption-layout/shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VPS = { m660: { width: 393, height: 660 }, m852: { width: 393, height: 852 }, p915: { width: 412, height: 915 } };
const done = new Set(fs.existsSync(outFile) ? fs.readFileSync(outFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => { const j = JSON.parse(l); return `${j.id}|${j.vp}`; }) : []);

const measure = () => {
  const box = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
  const imgs = [...document.querySelectorAll('img')].filter((i) => /ImgPhotoSlide/.test(i.className));
  const vis = imgs.filter((i) => { const r = i.getBoundingClientRect(); return r.left >= -2 && r.left < 50; });
  const img = vis[0] || imgs[0];
  const q = (re) => [...document.querySelectorAll('*')].filter((e) => re.test(String(e.className)) && e.getBoundingClientRect().height > 0);
  const user = q(/DivUserName/)[0];
  const music = q(/PMusicName/)[0];
  const normal = q(/SpanNormalText|SpanTagText/);
  const more = [...document.querySelectorAll('button')].find((b) => /See more|more/i.test(b.innerText) && b.getBoundingClientRect().height > 0);
  // the text container: common ancestor of the description spans
  let desc = normal[0]?.parentElement; 
  while (desc && normal.some((n) => !desc.contains(n))) desc = desc.parentElement;
  const dr = desc?.getBoundingClientRect();
  const lh = desc ? parseFloat(getComputedStyle(normal[0]).lineHeight) || 18 : null;
  const tops = new Set();
  for (const n of normal) for (const cr of n.getClientRects()) if (cr.height > 0) tops.add(Math.round(cr.top / 4));
  const popup = !!document.querySelector('[data-e2e="launch-popup-title"]') && document.querySelector('[data-e2e="launch-popup-title"]').getBoundingClientRect().height > 0;
  // the player container: nearest ancestor of img that is as wide as viewport
  let pl = img?.parentElement; while (pl && pl.getBoundingClientRect().height < 50) pl = pl.parentElement;
  return {
    img: img ? { box: box(img), nat: [img.naturalWidth, img.naturalHeight], fit: getComputedStyle(img).objectFit, pos: getComputedStyle(img).objectPosition } : null,
    player: pl ? box(pl) : null,
    user: user ? box(user) : null, music: music ? box(music) : null,
    desc: desc ? box(desc) : null, descLines: tops.size, descBoxLines: desc ? Math.round(dr.height / lh) : null, lh, popup,
    more: more ? box(more) : null, unavailable: /isn.t available/.test(document.body.innerText),
  };
};

for (const p of posts) {
  for (const vpName of p.vps || ['m660', 'm852']) {
    const key = `${p.id}|${vpName}`;
    if (done.has(key)) continue;
    let rec = null;
    for (let attempt = 1; attempt <= 3 && !rec; attempt++) {
      const dir = path.resolve(`recon/p-capb-${process.pid}-${attempt}`);
      fs.rmSync(dir, { recursive: true, force: true });
      const d = { ...devices['iPhone 14 Pro'] }; delete d.defaultBrowserType;
      const ctx = await chromium.launchPersistentContext(dir, { channel: 'chrome', headless: true, locale: 'en-US', ...d, viewport: VPS[vpName],
        args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage'] });
      const page = await ctx.newPage();
      try {
        await page.goto(`https://www.tiktok.com/@${p.author}/photo/${p.id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await sleep(7000 + Math.random() * 3000);
        for (let k = 0; k < 6; k++) {
          try { await page.click('[data-e2e="launch-popup-close"]', { timeout: 1500 }); } catch {}
          await sleep(800);
        }
        // Whatever popup survives is hidden, not dismissed: it is an overlay and
        // does not take part in the player's layout.
        await page.addStyleTag({ content: '[class*="DivPopupMask"],[class*="LaunchPopup"],[data-e2e^="launch-popup"],[class*="DivModalMask"]{display:none!important}' }).catch(() => {});
        await sleep(1000);
        const a = await page.evaluate(measure);
        if (!a.img) { console.log('no img', key, attempt, a.unavailable); await ctx.close(); fs.rmSync(dir, { recursive: true, force: true }); await sleep(4000); continue; }
        const tag = `${p.tag}-${vpName}`;
        await page.screenshot({ path: path.join(SHOTS, `${tag}-a.png`) });
        let b = null;
        if (a.more) {
          try {
            await page.mouse.click(a.more[0] + a.more[2] / 2, a.more[1] + a.more[3] / 2);
            await sleep(1500);
            b = await page.evaluate(measure);
            await page.screenshot({ path: path.join(SHOTS, `${tag}-b.png`) });
          } catch (e) { b = { err: String(e).slice(0, 100) }; }
        }
        rec = { id: p.id, author: p.author, tag: p.tag, vp: vpName, vpSize: VPS[vpName], descLen: p.descLen, descNl: p.descNl, collapsed: a, expanded: b };
      } catch (e) { console.log('err', key, String(e).slice(0, 120)); }
      await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
    }
    if (rec) { fs.appendFileSync(outFile, JSON.stringify(rec) + '\n'); console.log('ok', key, JSON.stringify(rec.collapsed.img?.box), rec.collapsed.descLines, rec.expanded ? 'exp:' + JSON.stringify(rec.expanded.img?.box) + ' ' + rec.expanded.descLines : ''); }
    await sleep(3000 + Math.random() * 3000);
  }
}
