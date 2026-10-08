// Reject near-greyscale photos.
//
// Why this exists: the Dubai deck came back with a black-and-white skyline on
// its hook slide. Every slide in both source decks is in colour — they are
// phone photos, not art direction — so a greyscale frame reads as "designed"
// at a glance and breaks the one thing the clone is trying to copy. Pexels
// ranks by relevance and has no colour signal, so the check has to happen
// after download.
//
// Measured by sampling the decoded pixels in a headless page: mean HSV
// saturation over a small grid. A true black-and-white photo scores near 0.
//
// SCOPE, because this was over-claimed once already: these numbers catch a
// genuine dud (the black-and-white Dubai skyline, sat 0.001) and nothing more.
// They do NOT measure whether a photo is interesting. Calibrated against the
// decks the owner liked and disliked, saturation runs BACKWARDS to his verdict
// — the deck he called boring has a higher median (0.376) than the one he
// called best (0.281). What separates them is people and activity in frame,
// and that is controlled by the search query, not by a threshold here.

import { chromium } from 'playwright';
import fs from 'node:fs';

let browser = null;
let page = null;

async function getPage() {
  if (page && !page.isClosed()) return page;
  if (!browser) browser = await chromium.launch({ channel: 'chrome', headless: true });
  page = await browser.newPage({ viewport: { width: 64, height: 64 } });
  // A page left on about:blank has an opaque origin and canvas reads throw,
  // which is what made this check return "unknown" for every image. Giving it
  // a real document is the whole fix.
  await page.setContent('<!doctype html><html><body></body></html>');
  return page;
}

export async function closeColourCheck() {
  try { if (browser) await browser.close(); } catch { /* already gone */ }
  browser = null;
  page = null;
}

/** { sat, contrast } for one image file, each 0..1. Null if it cannot be read. */
export async function saturationOf(file) {
  try {
    const p = await getPage();
    // A file:// image taints the canvas, getImageData throws, and the whole
    // check silently returns "unknown" — which is how a black-and-white photo
    // passed a colour test. A data URI is same-origin, so the pixels are
    // actually readable.
    const buf = fs.readFileSync(file);
    const src = 'data:image/jpeg;base64,' + buf.toString('base64');
    return await p.evaluate(async (src) => {
      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = src;
      });
      const N = 48;
      const c = document.createElement('canvas');
      c.width = N; c.height = N;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, N, N);
      const d = ctx.getImageData(0, 0, N, N).data;
      let sum = 0;
      const lum = [];
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        sum += max === 0 ? 0 : (max - min) / max;
        lum.push((r * 299 + g * 587 + b * 114) / 1000);
      }
      // Contrast as well as colour. A hazy pale frame — the Larnaca salt lake
      // shot the owner called boring — passes a saturation test and still has
      // no life in it, because everything sits in a narrow band of grey-blue.
      // Spread of luminance is what separates it from a frame with a subject.
      const mean = lum.reduce((a, b) => a + b, 0) / lum.length;
      const variance = lum.reduce((a, v) => a + (v - mean) ** 2, 0) / lum.length;
      return { sat: sum / (N * N), contrast: Math.sqrt(variance) / 128 };
    }, src);
  } catch {
    return null;
  }
}

/**
 * Average hash of an image: 8x8 greyscale, each cell a bit for "brighter than
 * the mean". Two photos of the same scene land within a few bits of each
 * other even at different crops or exposures.
 *
 * This exists because the Larnaca deck shipped the SAME aerial shot on four of
 * its twenty-one slides. Pexels has thin coverage for small destinations, so
 * several different queries returned the same top photo, and nothing in the
 * pipeline noticed. Exact-id matching would have caught those four; near
 * duplicates (the same promenade from two angles) it would not.
 */
export async function aHashOf(file) {
  try {
    const p = await getPage();
    const src = 'data:image/jpeg;base64,' + fs.readFileSync(file).toString('base64');
    return await p.evaluate(async (src) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
      const N = 8;
      const c = document.createElement('canvas');
      c.width = N; c.height = N;
      const ctx = c.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0, N, N);
      const d = ctx.getImageData(0, 0, N, N).data;
      const grey = [];
      for (let i = 0; i < d.length; i += 4) grey.push((d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000);
      const mean = grey.reduce((a, b) => a + b, 0) / grey.length;
      return grey.map((g) => (g > mean ? 1 : 0)).join('');
    }, src);
  } catch {
    return null;
  }
}

/** How many bits differ. 0 = identical, under ~8 of 64 = the same scene. */
export function hamming(a, b) {
  if (!a || !b || a.length !== b.length) return 64;
  let n = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) n++;
  return n;
}

/**
 * Pick the first candidate that is in colour.
 *
 * Order is Pexels relevance, so the first colourful candidate is preferred
 * over the most colourful one — relevance still leads, colour only vetoes.
 * If every candidate is greyscale the most colourful is returned, because a
 * weak photo beats no photo.
 */
export async function pickColourful(candidates, {
  min = 0.15, minContrast = 0.17, avoid = [], maxDist = 8,
} = {}) {
  const withFiles = candidates.filter((c) => c.file);
  if (!withFiles.length) return { pick: null, scores: [] };
  const scores = [];
  let dupSkipped = 0, flatSkipped = 0;
  for (const c of withFiles) {
    const m = await saturationOf(c.file);
    const h = await aHashOf(c.file);
    const s = m ? m.sat : null;
    scores.push({ id: c.id, sat: s, contrast: m ? m.contrast : null, hash: h });
    // A failed measurement is NOT a pass. If the check cannot see the pixels
    // it says so rather than waving the candidate through.
    if (s === null || s < min) continue;
    if (m.contrast < minContrast) { flatSkipped++; continue; }
    const near = avoid.find((prev) => hamming(prev, h) <= maxDist);
    if (near) { dupSkipped++; continue; }
    return { pick: c, scores, hash: h, dupSkipped, flatSkipped };
  }
  // Nothing passed both gates. Say which gate failed rather than silently
  // handing back a photo that was already rejected.
  const measured = scores.filter((x) => x.sat !== null);
  if (!measured.length) {
    return { pick: withFiles[0], scores, unmeasured: true, dupSkipped, flatSkipped };
  }
  const best = measured.reduce((a, b) => (b.sat > a.sat ? b : a));
  const pick = withFiles.find((c) => c.id === best.id) || withFiles[0];
  const hash = scores.find((x) => x.id === best.id)?.hash || null;
  return {
    pick, scores, hash, dupSkipped, flatSkipped,
    allGrey: best.sat < min,
    allFlat: flatSkipped > 0 && best.sat >= min,
    allDuplicates: dupSkipped > 0 && best.sat >= min,
  };
}
