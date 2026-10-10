// Profile grids: every post a creator has, with its exact view count, its
// age, its caption and its cover — including the ones that flopped.
//
// WHY. The 847-deck corpus has no views at all, and it was harvested above
// 50K likes, so it holds no post that failed to stop anybody. A creator's
// grid holds winners and losers together, and comparing a creator's posts
// with each other holds the account, the audience and the niche constant.
//
// HOW. The profile page builds its grid from /api/post/item_list/, which it
// fetches itself. This only LISTENS to those responses — it reads what the
// page already loaded. That gives what the DOM cannot:
//   * stats.playCount exactly, not "1.4M"
//   * createTime — views depend on how old a post is, and without its age a
//     three-day-old post would read as a flop
//   * the caption, the hashtags, and every slide's image URL
//
// The first version scraped the DOM and called two of three accounts
// "walled": its wall detector matched the "Log in to TikTok" text that sits
// in the header of every logged-out page, and the tiles had not rendered at
// six seconds. Neither account was walled.
//
//   node harvest/grid.mjs <handles-file | @handle ...> [--pages=N]

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const PAGES = Number((args.find((a) => a.startsWith('--pages=')) || '--pages=4').split('=')[1]);
// One browser per creator by default. Tested 8.10: in every run only the
// FIRST profile loaded in a context got its posts; every later one in the
// same context got an empty item_list (izzy first worked, vitortrip second
// did not; itsjustinjapan first worked, the next seven did not).
const BATCH = Number((args.find((a) => a.startsWith('--batch=')) || '--batch=1').split('=')[1]);
let handles = args.filter((a) => !a.startsWith('--'));
if (handles.length === 1 && fs.existsSync(handles[0])) {
  handles = fs.readFileSync(handles[0], 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
handles = [...new Set(handles.map((h) => h.replace(/^@/, '')))];
if (!handles.length) { console.error('usage: node harvest/grid.mjs <handles-file | @handle ...>'); process.exit(1); }

const OUT = path.join('harvest', 'grids');
fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const jitter = (a, b) => a + Math.random() * (b - a);
// Built from its code point: typing the escape through a shell is how this
// file once ended up with a raw line break inside a string literal.
const NL = String.fromCharCode(10);
const LAUNCH = {
  channel: 'chrome', headless: true, userAgent: UA,
  viewport: { width: 1280, height: 1400 }, locale: 'en-US',
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage', '--disable-gpu'],
};

/** The fields that matter, from one item in an item_list response. */
function slim(it) {
  const imgs = it.imagePost?.images || [];
  const firstUrl = (im) => im?.imageURL?.urlList?.[0] || null;
  return {
    id: it.id,
    createTime: it.createTime,
    kind: imgs.length ? 'photo' : 'video',
    desc: it.desc || '',
    title: it.imagePost?.title || '',
    plays: it.stats?.playCount ?? it.statsV2?.playCount ?? null,
    likes: it.stats?.diggCount ?? null,
    saves: it.stats?.collectCount ?? null,
    shares: it.stats?.shareCount ?? null,
    comments: it.stats?.commentCount ?? null,
    slides: imgs.length,
    cover: imgs.length ? firstUrl(imgs[0]) : (it.video?.cover || it.video?.originCover || null),
    slideUrls: imgs.map(firstUrl),
    music: it.music?.title || null,
    musicOriginal: it.music?.original ?? null,
    pinned: !!it.isPinnedItem,
    ad: !!it.isAd,
    hashtags: (it.textExtra || []).map((t) => t.hashtagName).filter(Boolean),
  };
}

let done = 0;
let empty = 0;
let streak = 0;
for (let b = 0; b < handles.length; b += BATCH) {
  const batch = handles.slice(b, b + BATCH);
  const dir = path.join('recon', `p-grid-${Date.now()}`);
  const ctx = await chromium.launchPersistentContext(dir, LAUNCH);
  for (const h of batch) {
    const dest = path.join(OUT, h);
    if (fs.existsSync(path.join(dest, '_grid.json'))) { done++; continue; }
    const items = new Map();
    let author = null;
    const page = await ctx.newPage();
    page.on('response', async (r) => {
      if (!r.url().includes('/api/post/item_list')) return;
      try {
        const j = await r.json();
        for (const it of j.itemList || []) {
          if (!author && it.author) {
            author = { uniqueId: it.author.uniqueId, nickname: it.author.nickname,
              followers: it.authorStats?.followerCount ?? null, hearts: it.authorStats?.heartCount ?? null,
              videos: it.authorStats?.videoCount ?? null, region: it.author.region || null,
              language: it.author.language || null };
          }
          // /api/post/item_list is the creator's own posts, but the page also
          // calls repost and explore lists that hold OTHER people's posts.
          // The URL filter already excludes those; this makes it certain.
          if (it.author?.uniqueId && it.author.uniqueId.toLowerCase() !== h.toLowerCase()) continue;
          if (it.id && !items.has(it.id)) items.set(it.id, slim(it));
        }
      } catch { /* a non-JSON or challenged response just adds nothing */ }
    });
    try {
      await page.goto(`https://www.tiktok.com/@${h}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await sleep(jitter(6000, 8000));
      for (let i = 0; i < PAGES * 3; i++) {
        await page.mouse.wheel(0, 2200);
        await sleep(jitter(1200, 2000));
      }
      await sleep(2500);
      const bio = await page.evaluate(() => ({
        followers: document.querySelector('[data-e2e="followers-count"]')?.innerText || null,
        bio: document.querySelector('[data-e2e="user-bio"]')?.innerText || null,
      }));
      const list = [...items.values()];
      // An empty answer is far more often a challenged session than a creator
      // with no posts (vitortrip returned 0 once and 48 the next time). It is
      // queued for a second pass instead of being written down as a fact.
      if (!list.length) {
        fs.appendFileSync(path.join(OUT, '_retry.txt'), `${h}${NL}`);
        console.log(`  @${h}: no posts this time — queued for retry`);
        empty++; streak++;
        await page.close();
        await sleep(jitter(5000, 9000));
        continue;
      }
      fs.mkdirSync(dest, { recursive: true });
      fs.writeFileSync(path.join(dest, '_grid.json'), JSON.stringify({
        handle: h, author, bio, harvestedAt: new Date().toISOString(), items: list,
      }, null, 1));
      // Covers only, full resolution. Every slide URL is kept in the JSON for
      // later, but downloading whole decks for 100+ creators is not needed to
      // study the FIRST frame.
      let got = 0;
      for (const it of list) {
        if (it.kind !== 'photo' || !it.cover) continue;
        const f = path.join(dest, `${it.id}.jpg`);
        if (fs.existsSync(f)) { got++; continue; }
        try {
          const r = await ctx.request.get(it.cover, { timeout: 30000, headers: { Referer: 'https://www.tiktok.com/' } });
          if (r.ok()) { fs.writeFileSync(f, await r.body()); got++; }
        } catch { /* recorded by its absence */ }
      }
      const photos = list.filter((x) => x.kind === 'photo').length;
      console.log(`  @${h}: ${list.length} posts (${photos} photo, ${got} covers) `
        + `followers ${author?.followers ?? bio.followers ?? '?'}`);
      done++; streak = 0;
    } catch (e) {
      console.log(`  @${h}: error ${String(e.message).split('\n')[0]}`);
    }
    await page.close();
    // GRID_GAP=25000 slows the pace after TikTok starts refusing (10.10: refused after 6 at the default).
    const gap = Number(process.env.GRID_GAP || 5000);
    await sleep(jitter(gap, gap * 1.6));
  }
  await ctx.close();
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
  // Stop on a RUN of empty answers. The first version compared a running
  // total against min(done, 5) and could never be true once one creator had
  // succeeded — it let seven empty answers in a row go by on 8.10.
  if (streak >= 6) {
    console.log(`${streak} empty answers in a row — the session is being refused; stopping`);
    process.exit(2);
  }
}
console.log(`done: ${done} creators, ${empty} returned no posts`);
