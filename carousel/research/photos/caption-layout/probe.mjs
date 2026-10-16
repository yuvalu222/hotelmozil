// Open one TikTok photo post in a fresh profile, mobile or desktop emulation,
// screenshot it and dump the boxes of every big image and every text block.
//   node probe.mjs <handle> <id> <mode: mobile|desktop|tall> <tag>
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const [handle, id, mode = 'mobile', tag = id] = process.argv.slice(2);
const OUT = path.resolve('research/photos/caption-layout/shots');
const dir = path.resolve(`recon/p-cap-${process.pid}`);
fs.rmSync(dir, { recursive: true, force: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let opts;
if (mode === 'desktop') {
  opts = { viewport: { width: 1280, height: 900 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36' };
} else {
  const d = devices['iPhone 14 Pro'];
  opts = { ...d };
  delete opts.defaultBrowserType;
  if (mode === 'tall') opts.viewport = { width: d.screen.width, height: d.screen.height };
}
const ctx = await chromium.launchPersistentContext(dir, {
  channel: 'chrome', headless: true, locale: 'en-US', ...opts,
  args: ['--disable-blink-features=AutomationControlled', '--disable-dev-shm-usage'],
});
const page = await ctx.newPage();
const res = { handle, id, mode, tag };
try {
  await page.goto(`https://www.tiktok.com/@${handle}/photo/${id}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await sleep(8000);
  for (const sel of ['[data-e2e="launch-popup-close"]']) { try { await page.click(sel, { timeout: 3000 }); } catch {} }
  await sleep(2500);
  res.url = page.url();
  res.vp = page.viewportSize();
  Object.assign(res, await page.evaluate(() => {
    const box = (e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    const imgs = [...document.querySelectorAll('img')].filter((i) => i.getBoundingClientRect().width > 100 && i.getBoundingClientRect().height > 100)
      .map((i) => ({ box: box(i), nat: [i.naturalWidth, i.naturalHeight], fit: getComputedStyle(i).objectFit, src: i.src.slice(0, 80), cls: i.className.slice(0, 60) }));
    const e2e = [...document.querySelectorAll('[data-e2e]')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; })
      .map((e) => ({ k: e.getAttribute('data-e2e'), box: box(e), t: (e.innerText || '').slice(0, 60).replace(/\s+/g, ' ') }));
    const bgs = [...document.querySelectorAll('*')].filter((e) => { const b = getComputedStyle(e).backgroundImage; const r = e.getBoundingClientRect(); return b && b !== 'none' && b.includes('url') && r.width > 100 && r.height > 100; })
      .map((e) => ({ box: box(e), tag: e.tagName, cls: String(e.className).slice(0, 60), size: getComputedStyle(e).backgroundSize, pos: getComputedStyle(e).backgroundPosition, bg: getComputedStyle(e).backgroundImage.slice(0, 90) }));
    const media = [...document.querySelectorAll('video,canvas,picture')].map((e) => ({ tag: e.tagName, box: box(e) }));
    const texts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n; while ((n = walker.nextNode())) {
      const t = n.textContent.trim(); if (!t) continue;
      const e = n.parentElement; const r = e.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.top > window.innerHeight || r.bottom < 0) continue;
      const lh = parseFloat(getComputedStyle(e).lineHeight) || null;
      texts.push({ t: t.slice(0, 40), box: box(e), tag: e.tagName, cls: String(e.className).slice(0, 50), lh, lines: lh ? Math.round(r.height / lh) : null });
    }
    // The block that holds the caption: walk up from the first text containing '#' or long text
    return { imgs, bgs, media, e2e, texts, title: document.title, text: document.body.innerText.slice(0, 600) };
  }));
  await page.screenshot({ path: path.join(OUT, `${tag}-${mode}.png`) });
} catch (e) { res.err = String(e).slice(0, 300); }
fs.writeFileSync(path.join(OUT, `${tag}-${mode}.json`), JSON.stringify(res, null, 1));
console.log(JSON.stringify({ tag, mode, url: res.url, imgs: res.imgs?.length, err: res.err }));
await ctx.close();
fs.rmSync(dir, { recursive: true, force: true });
