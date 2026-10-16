// Collect the posts TikTok lists on its own search-generated "discover" pages
// for the caption-pushes-photos complaint; save cover images + desc for review.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve('research/photos/caption-layout/discover');
const slugs = ['when-i-post-photos-on-tiktok-my-caption-pushes-up-my-photos', 'how-to-fix-tiktok-photo-cropping-long-caption', 'why-does-the-photo-on-my-tiktok-keep-getting-placed-up'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const all = [];
for (const s of slugs) {
  const dir = path.resolve(`recon/p-disc-${process.pid}`); fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(dir, { channel: 'chrome', headless: true, locale: 'en-US', viewport: { width: 1280, height: 1600 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled'] });
  const page = await ctx.newPage();
  const items = [];
  page.on('response', async (r) => { try { if (/application\/json/.test(r.headers()['content-type'] || '')) { const j = await r.json(); const L = j.itemList || j.data?.itemList || []; for (const it of L) items.push(it); } } catch {} });
  try {
    await page.goto(`https://www.tiktok.com/discover/${s}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(9000);
    for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, 2500); await sleep(2500); }
    const fromHtml = await page.evaluate(() => {
      const el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__'); return el ? el.textContent : null; });
    let fromUD = [];
    const links = await page.$$eval('a[href*="/video/"],a[href*="/photo/"]', (as) => as.map((a) => { const img = a.querySelector('img'); return { href: a.href, cover: img?.src || null, alt: img?.alt || null }; }));
    all.push({ slug: s, links, fromUD: fromUD.slice(0, 40), api: items.map((it) => ({ id: it.id, author: it.author?.uniqueId, desc: it.desc, cover: it.video?.cover, photo: !!it.imagePost })) });
    console.log(s, 'links', links.length, 'ud', fromUD.length, 'api', items.length);
  } catch (e) { console.log('err', s, String(e).slice(0, 100)); }
  await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
}
fs.writeFileSync(path.join(OUT, 'discover.json'), JSON.stringify(all, null, 1));
