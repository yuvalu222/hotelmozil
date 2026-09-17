// Stock image sourcing. Pexels primary, Unsplash optional fallback.
//
// PEXELS_API_KEY (free: https://www.pexels.com/api/) enables the API path.
// Without a key, gather() falls back to browsing pexels.com in a real browser
// (lib/stock-browser.js), which needs no key and is the path that actually runs
// here. The old note about the environment blocking api.pexels.com no longer
// applies — see RECON.md.

import fs from 'node:fs/promises';
import path from 'node:path';
import { searchPexelsBrowser, downloadBrowser } from './stock-browser.js';

const PEXELS = 'https://api.pexels.com/v1/search';
const UNSPLASH = 'https://api.unsplash.com/search/photos';

// 1080x1920 slides, so we want portrait sources big enough to cover without upscaling.
const MIN_W = 1080;
const MIN_H = 1350;

/**
 * Search Pexels for candidates matching a slide's image brief.
 * Returns candidates ranked by the API's own relevance, trimmed to those
 * large enough to fill a slide.
 */
export async function searchPexels(query, { perPage = 8, orientation = 'portrait' } = {}) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error('PEXELS_API_KEY is not set');

  const url = `${PEXELS}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=${orientation}`;
  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`);

  const { photos = [] } = await res.json();
  return photos
    .filter((p) => p.width >= MIN_W && p.height >= MIN_H)
    .map((p) => ({
      id: `pexels-${p.id}`,
      source: 'pexels',
      url: p.src.large2x || p.src.large,
      width: p.width,
      height: p.height,
      // Pexels' license does not require credit, but naming the photographer is
      // both courteous and useful provenance when a slide is questioned later.
      credit: { name: p.photographer, url: p.photographer_url, page: p.url },
      alt: p.alt || query,
    }));
}

export async function searchUnsplash(query, { perPage = 8 } = {}) {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) throw new Error('UNSPLASH_ACCESS_KEY is not set');

  const url = `${UNSPLASH}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`;
  const res = await fetch(url, { headers: { Authorization: `Client-ID ${key}` } });
  if (!res.ok) throw new Error(`Unsplash ${res.status}: ${await res.text()}`);

  const { results = [] } = await res.json();
  return results.map((p) => ({
    id: `unsplash-${p.id}`,
    source: 'unsplash',
    url: p.urls.full,
    width: p.width,
    height: p.height,
    credit: { name: p.user.name, url: p.user.links.html, page: p.links.html },
    alt: p.alt_description || query,
  }));
}

/** Download a candidate into the cache, skipping work if it is already there. */
export async function download(candidate, cacheDir) {
  await fs.mkdir(cacheDir, { recursive: true });
  const file = path.join(cacheDir, `${candidate.id}.jpg`);

  try {
    await fs.access(file);
    return file; // cached
  } catch {
    // not cached yet
  }

  const res = await fetch(candidate.url);
  if (!res.ok) throw new Error(`download ${candidate.url} -> ${res.status}`);
  await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
  return file;
}

/**
 * Fetch candidates for every slide brief in a spec and write a contact sheet
 * manifest. The manifest is what a human (or Claude) reviews before render:
 * the point is to look at a handful of finalists, not hundreds of images.
 */
export async function gather(spec, { cacheDir, perSlide = 4 }) {
  const out = [];
  for (const [i, slide] of spec.slides.entries()) {
    // A slide can name its own file — a screenshot, or a photo you shot
    // yourself. Those never go to a stock search.
    if (slide.image?.local) {
      out.push({ index: i, local: slide.image.local, candidates: [] });
      continue;
    }
    // Collage skins take several photos per slide: `images` is a list of
    // { query, count } entries, and `count` asks for that many distinct
    // photos from ONE query (a 2x2 collage of a single place, for instance).
    if (Array.isArray(slide.images)) {
      const viaBrowser = !process.env.PEXELS_API_KEY;
      const multi = [];
      for (const [k, entry] of slide.images.entries()) {
        const want = Math.max(1, entry.count || 1);
        let cands = [];
        try {
          cands = viaBrowser
            ? await searchPexelsBrowser(entry.query, { perPage: want * 2 + 2 })
            : await searchPexels(entry.query, { perPage: want * 2 + 2 });
        } catch (err) {
          multi.push({ entryIndex: k, query: entry.query, error: String(err.message), picks: [] });
          continue;
        }
        const picks = [];
        for (const c of cands) {
          if (picks.length >= want) break;
          try {
            c.file = viaBrowser ? await downloadBrowser(c, cacheDir) : await download(c, cacheDir);
            picks.push(c);
          } catch (err) { /* try the next candidate */ }
        }
        multi.push({ entryIndex: k, query: entry.query, want, picks });
      }
      out.push({ index: i, multi, candidates: [] });
      continue;
    }
    if (!slide.image?.query) {
      out.push({ index: i, candidates: [] });
      continue;
    }
    // With a key, use the API. Without one, browse the site — no key needed,
    // and that is the path that runs here.
    const viaBrowser = !process.env.PEXELS_API_KEY;
    let candidates = [];
    try {
      candidates = viaBrowser
        ? await searchPexelsBrowser(slide.image.query, { perPage: perSlide * 2 })
        : await searchPexels(slide.image.query, { perPage: perSlide * 2 });
    } catch (err) {
      out.push({ index: i, error: String(err.message), candidates: [] });
      continue;
    }
    const picked = candidates.slice(0, perSlide);
    for (const c of picked) {
      try {
        c.file = viaBrowser
          ? await downloadBrowser(c, cacheDir)
          : await download(c, cacheDir);
      } catch (err) {
        c.error = String(err.message);
      }
    }
    out.push({ index: i, query: slide.image.query, candidates: picked });
  }
  return out;
}
