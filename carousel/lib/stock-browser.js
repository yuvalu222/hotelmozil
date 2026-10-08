// Keyless Pexels sourcing, by browsing the site the way a person does.
//
// lib/stock.js needs PEXELS_API_KEY and returns 401 without one. The brief says
// photos should come from Pexels with "no API key needed, browse and download
// like a person", and `api.pexels.com` is no longer the blocker — the site
// renders fine in a real browser (see RECON.md).
//
// Pexels serves every photo through an image CDN that takes sizing parameters
// in the query string, so the grid thumbnails can be turned into full-size
// portrait downloads without ever hitting the API.

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36';

let browser = null;
let context = null;

async function ctx() {
  if (context) return context;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  context = await browser.newContext({ userAgent: UA, viewport: { width: 1400, height: 1200 }, locale: 'en-US' });
  await context.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => undefined }));
  return context;
}

export async function closeBrowser() {
  if (browser) { await browser.close(); browser = null; context = null; }
}

/** Rewrite a Pexels CDN url to the size we actually render at. */
function atSize(url, w = 1080, h = 1920) {
  const base = url.split('?')[0];
  return `${base}?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;
}

/**
 * Search Pexels by browsing. Returns the same candidate shape as
 * searchPexels() in stock.js so callers do not care which one ran.
 */
export async function searchPexelsBrowser(query, { perPage = 8 } = {}) {
  const c = await ctx();
  const page = await c.newPage();
  try {
    const url = `https://www.pexels.com/search/${encodeURIComponent(query)}/?orientation=portrait`;
    await page.goto(url, { timeout: 45000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);
    await page.mouse.wheel(0, 1600);
    await page.waitForTimeout(1800);

    const found = await page.evaluate(() => {
      const out = [];
      for (const a of document.querySelectorAll('a[href*="/photo/"]')) {
        const img = a.querySelector('img') || a.parentElement?.querySelector('img');
        if (!img || !/images\.pexels\.com\/photos\//.test(img.src)) continue;
        const m = img.src.match(/\/photos\/(\d+)\//);
        if (!m) continue;
        out.push({
          photoId: m[1],
          src: img.src,
          page: a.href,
          alt: img.alt || '',
        });
      }
      return out;
    });

    const seen = new Set();
    const candidates = [];
    for (const f of found) {
      if (seen.has(f.photoId)) continue;
      seen.add(f.photoId);
      candidates.push({
        id: `pexels-${f.photoId}`,
        source: 'pexels',
        url: atSize(f.src),
        width: 1080,
        height: 1920,
        // The photographer's name is not reliably in the grid markup, so the
        // photo page is recorded instead. Provenance stays traceable; it is
        // not invented.
        credit: { name: null, url: null, page: f.page },
        alt: f.alt || query,
        // The RAW alt, never backfilled from the query. A subject gate can
        // only work on what Pexels actually said about the photo; filling
        // the blank with the query makes every candidate look like a match.
        altRaw: f.alt || '',
      });
      if (candidates.length >= perPage) break;
    }
    return candidates;
  } finally {
    await page.close();
  }
}

/** Download a browsed candidate. Uses the browser context so the CDN sees a real session. */
export async function downloadBrowser(candidate, cacheDir) {
  await fs.mkdir(cacheDir, { recursive: true });
  const file = path.join(cacheDir, `${candidate.id}.jpg`);
  try { await fs.access(file); return file; } catch { /* not cached */ }

  const c = await ctx();
  const res = await c.request.get(candidate.url, { timeout: 45000 });
  if (!res.ok()) throw new Error(`download ${candidate.url} -> ${res.status()}`);
  const body = await res.body();
  if (body.length < 10000) throw new Error(`download ${candidate.id} too small (${body.length}B)`);
  await fs.writeFile(file, body);
  return file;
}
