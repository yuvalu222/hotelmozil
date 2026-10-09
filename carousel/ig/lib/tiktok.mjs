// Read our own TikTok profile through the JSON the page itself loads.
//
// Loading tiktok.com/@hotelmozil makes the page call /api/post/item_list/,
// and that response already holds everything a mirror needs for the newest
// ~25 posts: id, creation time, the caption as published, the song, and for
// a photo post every slide with its size and CDN address. One page load per
// run, no clicking, no reading text off the screen (measured 9.10).
//
// Rules carried over from harvest/ (TIKTOK.md section 1):
// - Cold sessions only. A session that visited the homepage first gets
//   walled, and the wall lives in the stored profile, so every attempt
//   starts from an empty profile directory.
// - A refused attempt is "unknown", never "no new posts". Three empty
//   attempts end the run with an error, and nothing is marked as seen.

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';

export async function openBrowser(profileDir) {
  fs.rmSync(profileDir, { recursive: true, force: true });
  return chromium.launchPersistentContext(profileDir, {
    channel: 'chrome', headless: true, userAgent: UA,
    viewport: { width: 1280, height: 1400 }, locale: 'en-US',
    args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
  });
}

/** Normalise one item_list entry. Video posts come back with images: []. */
export function toPost(it) {
  const images = (it.imagePost?.images || []).map((im) => ({
    urls: im.imageURL?.urlList || [],
    w: im.imageWidth || null,
    h: im.imageHeight || null,
  }));
  return {
    id: String(it.id),
    createTime: Number(it.createTime) || null,
    desc: it.desc || '',
    music: it.music ? `${it.music.title || ''} - ${it.music.authorName || ''}`.trim() : null,
    pinned: !!it.isPinnedItem,
    // 'unknown' when neither shape is there: a renamed field must not turn
    // every new carousel into a skipped "video" (big-picture check, 9.10).
    kind: images.length ? 'photo' : (it.video?.duration > 0 ? 'video' : 'unknown'),
    images,
  };
}

/**
 * Returns { ctx, posts } with the browser still open, because the slide URLs
 * are signed for this session and the download must use the same context.
 * The caller closes ctx.
 */
export async function readProfile(handle, { workDir, tries = 3, log = console.log } = {}) {
  let lastErr = null;
  for (let attempt = 1; attempt <= tries; attempt++) {
    const ctx = await openBrowser(path.join(workDir, `tt-profile-${attempt}`));
    try {
      const page = await ctx.newPage();
      const lists = [];
      page.on('response', async (r) => {
        if (!r.url().includes('/api/post/item_list/')) return;
        try { lists.push(await r.json()); } catch { /* a refused body is not JSON */ }
      });
      await page.goto(`https://www.tiktok.com/@${handle}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      for (let i = 0; i < 20 && !lists.some((l) => l.itemList?.length); i++) await page.waitForTimeout(500);
      const items = lists.flatMap((l) => l.itemList || []);
      if (items.length) {
        await page.close();
        const seen = new Set();
        const posts = items.map(toPost).filter((p) => !seen.has(p.id) && seen.add(p.id));
        log(`tiktok: @${handle} read on attempt ${attempt}, ${posts.length} posts`);
        return { ctx, posts };
      }
      lastErr = new Error('item_list never arrived (walled or empty)');
      log(`tiktok: attempt ${attempt} returned no item_list`);
    } catch (e) {
      lastErr = e;
      log(`tiktok: attempt ${attempt} failed: ${String(e.message).slice(0, 120)}`);
    }
    await ctx.close();
    await new Promise((r) => setTimeout(r, 4000 + Math.random() * 4000));
  }
  throw new Error(`could not read @${handle}: ${lastErr?.message}`);
}

/** Download one slide, trying each mirror URL TikTok offers. */
export async function downloadSlide(ctx, image) {
  for (const url of image.urls) {
    try {
      const r = await ctx.request.get(url, { timeout: 45000, headers: { Referer: 'https://www.tiktok.com/' } });
      if (!r.ok()) continue;
      const body = await r.body();
      if (body.length > 5000) return body;
    } catch { /* next mirror */ }
  }
  throw new Error('every CDN address for this slide failed');
}

