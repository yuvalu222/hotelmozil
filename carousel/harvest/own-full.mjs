// Every post on @hotelmozil, with its numbers, from the JSON the profile page
// itself loads (/api/post/item_list/, one page per scroll). 10.10: the
// dataset behind "copy his format exactly" — which of his posts work, what
// each slide is.
//
//   node harvest/own-full.mjs
// Out: harvest/own-full/items.json + <id>/NN.jpg

import fs from 'node:fs';
import path from 'node:path';
import { openBrowser, toPost, downloadSlide } from '../ig/lib/tiktok.mjs';

const OUT = path.join(import.meta.dirname, 'own-full');
fs.mkdirSync(OUT, { recursive: true });

let items = [];
for (let attempt = 1; attempt <= 3 && !items.length; attempt++) {
  const ctx = await openBrowser(path.join(process.env.TEMP, `hm-ownfull-${attempt}`));
  const page = await ctx.newPage();
  const lists = [];
  page.on('response', async (r) => {
    if (!r.url().includes('/api/post/item_list/')) return;
    try { lists.push(await r.json()); } catch { /* refused */ }
  });
  await page.goto('https://www.tiktok.com/@hotelmozil', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(6000);
  for (let i = 0; i < 25; i++) {
    await page.mouse.wheel(0, 3000);
    await page.waitForTimeout(1800);
    if (lists.length && lists[lists.length - 1].hasMore === false) break;
  }
  items = lists.flatMap((l) => l.itemList || []);
  console.log(`attempt ${attempt}: ${lists.length} pages, ${items.length} items`);
  if (items.length) {
    const seen = new Set();
    items = items.filter((it) => !seen.has(it.id) && seen.add(it.id));
    const rows = [];
    for (const it of items) {
      const p = toPost(it);
      const s = it.statsV2 || it.stats || {};
      const row = {
        id: p.id, createTime: p.createTime, date: new Date(p.createTime * 1000).toISOString().slice(0, 10),
        kind: p.kind, slides: p.images.length, sizes: p.images.map((x) => `${x.w}x${x.h}`),
        views: +s.playCount || 0, likes: +s.diggCount || 0, saves: +s.collectCount || 0,
        shares: +s.shareCount || 0, comments: +s.commentCount || 0,
        desc: p.desc, music: p.music, original: it.music?.original ?? null, pinned: p.pinned,
      };
      rows.push(row);
      const dir = path.join(OUT, p.id);
      if (p.kind === 'photo' && !fs.existsSync(path.join(dir, '01.jpg'))) {
        fs.mkdirSync(dir, { recursive: true });
        for (const [k, im] of p.images.entries()) {
          try { fs.writeFileSync(path.join(dir, `${String(k + 1).padStart(2, '0')}.jpg`), await downloadSlide(ctx, im)); } catch (e) { console.log(`  ${p.id} slide ${k + 1}: ${e.message}`); }
        }
      }
    }
    fs.writeFileSync(path.join(OUT, 'items.json'), JSON.stringify(rows, null, 1));
    fs.writeFileSync(path.join(OUT, 'raw.json'), JSON.stringify(items));
  }
  await ctx.close();
}
