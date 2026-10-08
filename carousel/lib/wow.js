// Ranking photographs the way the tourism research says viewers actually
// respond to them.
//
// HISTORY, because this is the second attempt and the first was wrong.
//
// v1 scored frames against absolute targets taken from the top quartile of the
// 524-deck corpus, tested itself on that corpus, found almost no separation
// (0.1-0.4 sd) and concluded a picker could not work. That conclusion was a
// methodological mistake: **every deck in the corpus had already cleared
// 50,000 likes**, so it compares excellent against excellent. Restriction of
// range hides exactly the effect being looked for.
//
// What the literature on travel imagery finds, across a full range rather than
// an elite one:
//
//   - **saturation is the single most critical attribute** viewers respond to,
//     ahead of caption style, hue and brightness;
//   - high saturation on nature subjects shortens perceived psychological
//     distance, which reads as "I could go there";
//   - lightness and chroma significantly predict likes;
//   - orange, yellow, blue and violet are the hues that contribute most to
//     popularity, which is why a colourful sunset beats a flat one.
//
// So v2 ranks RELATIVELY, inside the set of candidates one query returned.
// That set spans the whole range — a vivid sunset next to a hazy noon shot —
// which is the population the research describes and the one a picker is
// actually choosing from. No absolute thresholds are used for ranking; they
// are used only to reject duds.

import { chromium } from 'playwright';
import fs from 'node:fs';

let browser = null;
let page = null;

async function ensure() {
  if (page) return page;
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  page = await browser.newPage();
  // A real document: a canvas on about:blank is tainted for getImageData in
  // some builds, and that failure returns null rather than throwing — which is
  // how a black-and-white frame once passed a colour check.
  await page.setContent('<!doctype html><title>wow</title><body></body>');
  await page.addScriptTag({ content: `
window.__wow = async (dataUri) => {
  const im = new Image();
  await new Promise((ok, no) => { im.onload = ok; im.onerror = no; im.src = dataUri; });
  const W = 150, H = Math.max(1, Math.round(W * im.height / im.width));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(im, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const n = W * H;

  let satSum = 0, satHigh = 0, dark = 0, blown = 0, warm = 0, vivid = 0;
  const lum = new Float32Array(n);
  const rg = new Float32Array(n), yb = new Float32Array(n);
  for (let i = 0, p = 0; i < d.length; i += 4, p++) {
    const r = d[i], g = d[i+1], b = d[i+2];
    const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
    const s = mx ? (mx - mn) / mx : 0;
    const l = 0.2126*r + 0.7152*g + 0.0722*b;
    lum[p] = l;
    satSum += s;
    if (s > 0.45) satHigh++;
    if (l < 52) dark++;
    if (l > 246) blown++;
    // Hue family, only where the pixel is colourful enough to read as a hue.
    if (s > 0.30 && mx > 60) {
      let h;
      if (mx === r) h = ((g - b) / (mx - mn || 1)) * 60;
      else if (mx === g) h = (2 + (b - r) / (mx - mn || 1)) * 60;
      else h = (4 + (r - g) / (mx - mn || 1)) * 60;
      if (h < 0) h += 360;
      // orange/yellow and blue/violet: the hue families the research names
      if ((h >= 10 && h <= 65) || (h >= 185 && h <= 280)) vivid++;
      if (h >= 10 && h <= 65) warm++;
    }
    rg[p] = r - g; yb[p] = 0.5*(r+g) - b;
  }
  const mean = (a) => { let s=0; for (const v of a) s+=v; return s/a.length; };
  const sd = (a,m) => { let s=0; for (const v of a) s+=(v-m)*(v-m); return Math.sqrt(s/a.length); };
  const mrg = mean(rg), myb = mean(yb);
  const chroma = Math.sqrt(sd(rg,mrg)**2 + sd(yb,myb)**2)
               + 0.3*Math.sqrt(mrg*mrg + myb*myb);
  const lm = mean(lum), contrast = sd(lum, lm);
  let busy = 0, cells = 0;
  for (let y = 1; y < H; y++) for (let xx = 1; xx < W; xx++) {
    if (Math.abs(lum[y*W+xx] - lum[y*W+xx-1]) > 22) busy++;
    cells++;
  }
  return {
    sat: +(satSum/n).toFixed(4),
    satHigh: +(satHigh/n).toFixed(4),
    chroma: +chroma.toFixed(2),
    contrast: +contrast.toFixed(2),
    warm: +(warm/n).toFixed(4),
    vivid: +(vivid/n).toFixed(4),
    dark: +(dark/n).toFixed(4),
    blown: +(blown/n).toFixed(4),
    busy: +(busy/cells).toFixed(4),
    lum: +lm.toFixed(1),
  };
}
`});
  return page;
}

/** Raw measurements for one image file. */
export async function measure(file) {
  const p = await ensure();
  const b64 = fs.readFileSync(file).toString('base64');
  return p.evaluate((u) => window.__wow(u), `data:image/jpeg;base64,${b64}`);
}

/** A frame nobody should ship, whatever else it scores. */
export function isDud(m) {
  if (!m) return 'unmeasurable';
  if (m.dark > 0.46) return 'mostly black';
  if (m.blown > 0.12) return 'blown out';
  if (m.sat < 0.10) return 'almost greyscale';
  if (m.busy < 0.035) return 'empty frame, nothing to look at';
  if (m.contrast < 24) return 'flat and hazy';
  return null;
}

// Weights follow the order the research puts them in: saturation first, then
// the hue families that predict popularity, then chroma and contrast. Busyness
// is kept small — it was the one term that showed any separation even inside
// the elite corpus, so it carries a little weight rather than none.
const W = { sat: 0.34, satHigh: 0.12, vivid: 0.16, warm: 0.08, chroma: 0.14, contrast: 0.10, busy: 0.06 };

// A blurred backdrop wants the opposite of a hero frame. Ranking backdrops on
// saturation picked a vivid orange sunset, which blurred into a single orange
// field that swallowed the whole slide and fought the type. A backdrop's job
// is to sit still: low texture, low contrast, colour present but not shouting.
//
// THIRD ATTEMPT, and the first two both produced the same thing on the frame.
// Minimising texture gave a sheet of open water. Aiming at the middle of the
// range still gave open water, because in a set of coastline photographs the
// middle IS the sea. Two decks rendered with a flat teal rectangle behind the
// copy — no place visible in it at all — which fails the standing rule that
// every image has to be a WOW.
//
// So the backdrop is now ranked like a hero: the frames the research says
// people respond to, which are the ones that look like somewhere. Legibility
// was never the backdrop's job — the scrim and the black stroke on the glyphs
// do that, and they do it whatever the photograph is. The one thing a hero
// frame can do wrong here is be so busy that blurring turns it to mush, so
// extreme texture is penalised and nothing else is.
const BUSY_PENALTY = 0.35;

/**
 * Rank candidates against EACH OTHER. Every term is min-max normalised inside
 * the set, so the score answers "which of these is the most vivid" and never
 * "does this clear a threshold borrowed from somewhere else".
 *
 * @param {Array<{file:string, m:object}>} cands measured candidates
 * @returns the same list, scored and sorted best first
 */
export function rank(cands, { mode = 'hero' } = {}) {
  const live = cands.filter((c) => c.m && !isDud(c.m));
  const pool = live.length ? live : cands;
  const norm = (key) => {
    const vals = pool.map((c) => c.m?.[key] ?? 0);
    const lo = Math.min(...vals), hi = Math.max(...vals);
    return (v) => (hi - lo < 1e-9 ? 0.5 : (v - lo) / (hi - lo));
  };
  const f = Object.fromEntries(Object.keys(W).map((k) => [k, norm(k)]));
  if (mode === 'backdrop') {
    const nb = norm('busy');
    for (const c of cands) {
      // A backdrop may be darker than a hero would be allowed to be — it sits
      // under a scrim either way. But an empty frame must be rejected here
      // too: the whole backdrop failure was a photograph with nothing in it,
      // and this branch had no such test, so a blank sheet of water was
      // always eligible to win.
      const dud = !c.m ? 'unmeasurable'
        : c.m.dark > 0.6 ? 'mostly black'
        : c.m.busy < 0.045 ? 'empty frame, nothing to blur'
        : null;
      c.dud = dud;
      const hero = dud ? 0
        : Object.entries(W).reduce((s, [k, w]) => s + w * f[k](c.m[k] ?? 0), 0);
      // Only the busiest frames in the set lose anything: blurred, a crowded
      // market becomes noise, while a coastline keeps its shape.
      const tooBusy = dud ? 0 : Math.max(0, nb(c.m.busy) - 0.7) / 0.3;
      c.score = +(hero - BUSY_PENALTY * tooBusy).toFixed(3);
    }
    return [...cands].sort((a, b) => b.score - a.score);
  }
  for (const c of cands) {
    const dud = isDud(c.m);
    c.dud = dud;
    c.score = dud ? 0
      : +Object.entries(W).reduce((s, [k, w]) => s + w * f[k](c.m[k] ?? 0), 0).toFixed(3);
  }
  return [...cands].sort((a, b) => b.score - a.score);
}

/** Measure a list of files and rank them in one call. */
export async function rankFiles(files) {
  const cands = [];
  for (const file of files) {
    let m = null;
    try { m = await measure(file); } catch { /* unreadable */ }
    cands.push({ file, m });
  }
  return rank(cands);
}

export async function closeWow() {
  if (browser) { await browser.close(); browser = null; page = null; }
}
