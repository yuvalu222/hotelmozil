// Stock image sourcing. Pexels primary, Unsplash optional fallback.
//
// PEXELS_API_KEY (free: https://www.pexels.com/api/) enables the API path.
// Without a key, gather() falls back to browsing pexels.com in a real browser
// (lib/stock-browser.js), which needs no key and is the path that actually runs
// here. The old note about the environment blocking api.pexels.com no longer
// applies — see RECON.md.

import fs from 'node:fs/promises';
import fsSync from 'node:fs';
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
      altRaw: p.alt || '',
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
// Pexels matches loosely: "rooftop pool athens acropolis night" returns the
// Acropolis at night with no pool in it, and nothing in the response says the
// subject is missing. A whole deck of pools shipped with seven city photos
// before this existed.
//
// `image.must` names the subject in the photographer's words. A candidate is
// kept only if its RAW alt (never the query) carries one of them. Nothing is
// silently substituted: when no candidate survives, the caller is told, and a
// deck that cannot show its subject gets its copy changed instead.
// Owner, 3.10: swimwear is fine and beach and pool frames are good for
// reach, so this blocks only what the account genuinely cannot post. The
// first version also caught "sensual", "lingerie", "provocative" and
// "seductive", which would have thrown away perfectly ordinary poolside
// photographs.
//
// Matched against the photographer's own words, so it only rejects a photo
// that was described that way. It is a floor, not a substitute for looking at
// the contact sheet.
// WARNING: THIS FILTER WAS DEAD UNTIL 8.10. The word boundaries at either
// end were written through a heredoc, which turned each two-character escape
// into a real backspace byte: the pattern became /<BS>(nude|...)<BS>/, never
// matched anything, and every run reported zero dropped. A check that cannot
// fire reports the convenient answer forever. Built from code points here so
// no escape is typed, and analyze/char-check.mjs now fails on a control
// character anywhere in the source.
const WB = String.fromCharCode(92) + "b";
const NOT_POSTABLE = new RegExp(
  WB + "(nude|nudity|naked|topless|nsfw|explicit)" + WB, "i",
);

function postable(candidates) {
  const kept = candidates.filter((c) => !NOT_POSTABLE.test(String(c.altRaw || '')));
  return { kept, dropped: candidates.length - kept.length };
}

// Accents. A query token is typed without them and the photographer writes
// them: "elysees" never matched "Champs-Élysées", "trocadero" never matched
// "Trocadéro", and both rows quietly fell back to a near-miss of the Arc de
// Triomphe. Folding the marks away makes the token mean what it looks like.
// The combining-mark range is built from its code points rather than typed as
// a character class: written literally it is a run of invisible characters in
// the source, which is the same hazard as the backspace this file carried in
// its content filter until tonight.
const MARKS = new RegExp(`[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`, 'g');
const fold = (s) => String(s).normalize('NFD').replace(MARKS, '').toLowerCase();

function subjectFilter(candidates, must) {
  if (!must || !must.length) return { kept: candidates, dropped: 0 };
  const words = must.map(fold);
  const kept = candidates.filter((c) => {
    const alt = fold(c.altRaw || '');
    return alt && words.some((w) => alt.includes(w));
  });
  return { kept, dropped: candidates.length - kept.length };
}

// `must` is ANY-of, because several decks use it for a synonym list
// (thermal|bath|spa|pool). That cannot express "this country AND this
// subject": asking for [cyprus, castle] let a castle in Italy through, and
// asking for [castle] alone let five of them through from five countries.
// `mustAll` is the other half — every token has to be in the description.
function allFilter(candidates, mustAll) {
  if (!mustAll || !mustAll.length) return { kept: candidates, dropped: 0 };
  const words = mustAll.map(fold);
  const kept = candidates.filter((c) => {
    const alt = fold(c.altRaw || '');
    return alt && words.every((w) => alt.includes(w));
  });
  return { kept, dropped: candidates.length - kept.length };
}

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

      // A nine-up collage lists the SAME query nine times, once per tile. Run
      // independently, every entry searched that query and took the top hit,
      // so eight of the nine tiles were one photograph of Rome repeated. The
      // fix is to treat the slide as one request: search each distinct query
      // ONCE, deep enough for everything the slide asks of it, and never hand
      // the same photo to two tiles.
      const demand = new Map();
      for (const e of slide.images) {
        const w = Math.max(1, e.count || 1);
        demand.set(e.query, (demand.get(e.query) || 0) + w);
      }
      const searched = new Map();
      const usedInSlide = new Set();
      const collage = slide.images.length >= 3;

      for (const [k, entry] of slide.images.entries()) {
        const want = Math.max(1, entry.count || 1);
        // Same lock as the single-photo path. Leaving it off here would have
        // left five decks — every one with a split or a collage — still
        // re-rolling their photos on each build, which is the half-covered
        // state that let both the duplicate and the subject bug through today.
        if (entry.keep && entry.id && entry.file && fsSync.existsSync(entry.file)) {
          usedInSlide.add(entry.id);
          multi.push({ entryIndex: k, query: entry.query, want, collage,
                       kept: true, picks: [entry] });
          continue;
        }
        if (!searched.has(entry.query)) {
          const need = (demand.get(entry.query) || 1) + 4;
          try {
            searched.set(entry.query, viaBrowser
              ? await searchPexelsBrowser(entry.query, { perPage: need })
              : await searchPexels(entry.query, { perPage: need }));
          } catch (err) {
            searched.set(entry.query, { error: String(err.message) });
          }
        }
        const found = searched.get(entry.query);
        if (!Array.isArray(found)) {
          multi.push({ entryIndex: k, query: entry.query, error: found.error, picks: [] });
          continue;
        }
        let cands = found.filter((c) => !usedInSlide.has(c.id));

        const safeM = postable(cands);
        if (safeM.dropped) {
          console.error(`  slide ${i + 1}: dropped ${safeM.dropped} photo(s) the account cannot post`);
        }
        cands = safeM.kept;
        const mg = subjectFilter(cands, entry.must);
        const entryMissing = entry.must && !mg.kept.length ? entry.must : null;
        if (!entryMissing) cands = mg.kept;
        // and then every token of `mustAll`, which is how a row asks for its
        // own subject AND its own country at the same time
        const ag = allFilter(cands, entry.mustAll);
        const allMissing = entry.mustAll && !ag.kept.length ? entry.mustAll : null;
        if (!allMissing) cands = ag.kept;

        // Download a little more than the tile needs, so the caller's
        // duplicate veto has something to fall back to.
        const picks = [];
        for (const c of cands) {
          if (picks.length >= want + 2) break;
          try {
            c.file = viaBrowser ? await downloadBrowser(c, cacheDir) : await download(c, cacheDir);
            picks.push(c);
          } catch (err) { /* try the next candidate */ }
        }
        for (const p of picks.slice(0, want)) usedInSlide.add(p.id);
        multi.push({ entryIndex: k, query: entry.query, want, picks, collage,
                     subjectMissing: entryMissing || allMissing });
      }
      out.push({ index: i, multi, candidates: [] });
      continue;
    }
    if (!slide.image?.query) {
      out.push({ index: i, candidates: [] });
      continue;
    }
    // A reviewed frame stays put. Every build used to search again and
    // overwrite the stored id with whatever came back that minute, so the
    // resolved ids were a record and never a lock — a cover I had already
    // checked and approved quietly regressed to a dim one on the next
    // rebuild. `keep: true` reuses the cached file and skips the search.
    // Dropping `keep`, or changing the query, is how you ask for a new photo.
    if (slide.image.keep && slide.image.id && slide.image.file
        && fsSync.existsSync(slide.image.file)) {
      out.push({ index: i, query: slide.image.query, kept: true, candidates: [slide.image] });
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
    const safe = postable(candidates);
    if (safe.dropped) {
      console.error(`  slide ${i + 1}: dropped ${safe.dropped} photo(s) the account cannot post`);
    }
    candidates = safe.kept;
    const gate = subjectFilter(candidates, slide.image.must);
    // When nothing carries the subject, the slide still gets a photo — a hole
    // in the deck is worse than a near-miss — but `subjectMissing` is set so
    // the caller says so loudly and the frame gets looked at.
    const subjectMissing = slide.image.must && !gate.kept.length
      ? slide.image.must : null;
    const picked = (subjectMissing ? candidates : gate.kept).slice(0, perSlide);
    for (const c of picked) {
      try {
        c.file = viaBrowser
          ? await downloadBrowser(c, cacheDir)
          : await download(c, cacheDir);
      } catch (err) {
        c.error = String(err.message);
      }
    }
    out.push({
      index: i,
      query: slide.image.query,
      subjectDropped: gate.dropped,
      subjectMissing,
      candidates: picked,
    });
  }
  return out;
}
