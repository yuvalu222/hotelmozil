// Download a public TikTok video (the creator's own screen demo) for frame
// measurement. Reads playAddr from the page's hydration JSON, fetches it with
// the same browser context so the signed URL is honoured.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const OUT = path.resolve('research/photos/caption-layout/discover');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const ref of process.argv.slice(2)) {
  const [handle, id] = ref.split('/');
  const dir = path.resolve(`recon/p-dl-${process.pid}`); fs.rmSync(dir, { recursive: true, force: true });
  const ctx = await chromium.launchPersistentContext(dir, { channel: 'chrome', headless: true, locale: 'en-US', viewport: { width: 1280, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36',
    args: ['--disable-blink-features=AutomationControlled'] });
  const page = await ctx.newPage();
  try {
    await page.goto(`https://www.tiktok.com/@${handle}/video/${id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sleep(6000);
    const info = await page.evaluate(() => {
      const t = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__')?.textContent; if (!t) return null;
      const j = JSON.parse(t); const it = j.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct;
      return it ? { play: it.video?.playAddr || it.video?.downloadAddr, desc: it.desc, create: it.createTime, w: it.video?.width, h: it.video?.height } : null;
    });
    if (!info?.play) { console.log('no play', ref); } else {
      const r = await ctx.request.get(info.play, { headers: { Referer: 'https://www.tiktok.com/' } });
      const buf = await r.body();
      fs.writeFileSync(path.join(OUT, `${handle}_${id}.mp4`), buf);
      fs.writeFileSync(path.join(OUT, `${handle}_${id}.json`), JSON.stringify(info, null, 1));
      console.log('ok', ref, buf.length, info.w, info.h, new Date(info.create * 1000).toISOString().slice(0, 10));
    }
  } catch (e) { console.log('err', ref, String(e).slice(0, 100)); }
  await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
  await sleep(3000);
}
