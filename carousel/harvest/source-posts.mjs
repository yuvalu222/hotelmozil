// Download whole source carousels (every slide + caption + stats) for the
// formats being copied (10.10). Reads /api/item/detail/ that the post page
// itself loads; one fresh cold profile per post (TIKTOK.md section 1).
//
//   node harvest/source-posts.mjs <handle>/<id> ...
// Out: harvest/sources/<handle>-<id>/NN.jpg + post.json

import fs from 'node:fs';
import path from 'node:path';
import { openBrowser, downloadSlide } from '../ig/lib/tiktok.mjs';

const OUT = path.join(import.meta.dirname, 'sources');
for (const arg of process.argv.slice(2)) {
  const [handle, id] = arg.split('/');
  const dir = path.join(OUT, `${handle}-${id}`);
  if (fs.existsSync(path.join(dir, 'post.json'))) { console.log(`${arg}: have it`); continue; }
  let done = false;
  for (let attempt = 1; attempt <= 2 && !done; attempt++) {
    const ctx = await openBrowser(path.join(process.env.TEMP, `hm-src-${attempt}`));
    try {
      const page = await ctx.newPage();
      let item = null;
      page.on('response', async (r) => {
        if (!r.url().includes('/api/item/detail/')) return;
        try { item = (await r.json()).itemInfo?.itemStruct || item; } catch { /* refused */ }
      });
      await page.goto(`https://www.tiktok.com/@${handle}/photo/${id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      for (let i = 0; i < 20 && !item; i++) await page.waitForTimeout(500);
      if (item?.imagePost) {
        fs.mkdirSync(dir, { recursive: true });
        const imgs = item.imagePost.images;
        for (const [k, im] of imgs.entries()) {
          try { fs.writeFileSync(path.join(dir, `${String(k + 1).padStart(2, '0')}.jpg`), await downloadSlide(ctx, { urls: im.imageURL.urlList })); } catch (e) { console.log(`  slide ${k + 1}: ${e.message}`); }
        }
        const s = item.statsV2 || item.stats || {};
        fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify({ handle, id, desc: item.desc, plays: +s.playCount, likes: +s.diggCount, saves: +s.collectCount, slides: imgs.length, music: item.music?.title }, null, 1));
        console.log(`${arg}: ${imgs.length} slides, ${(+s.playCount).toLocaleString()} plays`);
        done = true;
      } else console.log(`${arg}: attempt ${attempt} no item`);
    } catch (e) { console.log(`${arg}: ${e.message.slice(0, 80)}`); }
    await ctx.close();
    await new Promise((r) => setTimeout(r, 4000 + Math.random() * 4000));
  }
}
