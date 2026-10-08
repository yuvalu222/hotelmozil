#!/usr/bin/env node
// Build a carousel from a spec: source photos, render slides, write a manifest.
//
//   node carousel/build.js specs/example.json
//   node carousel/build.js specs/example.json --debug     # draw safe-zone guides
//   node carousel/build.js specs/example.json --no-fetch  # reuse cached photos
//
// Needs PEXELS_API_KEY, plus api.pexels.com and images.pexels.com in the
// environment's allowed domains.

import fs from 'node:fs/promises';
import { spawn, execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gather } from './lib/stock.js';
import { closeBrowser } from './lib/stock-browser.js';
import { pickColourful, closeColourCheck, aHashOf, hamming } from './lib/colourfulness.js';
import { rank as wowRank, measure as wowMeasure, closeWow } from './lib/wow.js';
import { renderSpec } from './lib/render.js';
import { checkFacts } from './lib/facts.js';
import { checkWiring } from './lib/wiring.js';
import { checkCover } from './lib/cover-copy.js';
import { checkRouteRows } from './lib/route-rows.js';
import { rankCovers } from './lib/cover.js';
import { checkCaption } from './lib/caption.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, 'cache');

// 10 is the ceiling that publishes everywhere: Instagram's API, YouTube and
// Facebook all cap there. TikTok allows more, but a longer deck is a
// TikTok-only asset and stops being one build.
const MAX_SLIDES = 10;

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(1);
}

/** Reject a spec that would produce a deck some platform silently truncates. */
function validate(spec) {
  const problems = [];
  if (!Array.isArray(spec.slides) || spec.slides.length === 0) {
    problems.push('spec has no slides');
  } else {
    if (spec.slides.length < 4) {
      problems.push(`${spec.slides.length} slides — TikTok photo posts need at least 4`);
    }
    // The 10-slide ceiling is Instagram's, not TikTok's, so a deck cloned from
    // a TikTok source says `platform: "tiktok"` and is held to TikTok's limit
    // rather than cut to fit a platform it is not for. 30 is the commonly
    // cited cap and the conservative one — figures between 30 and 35 are
    // quoted around, and nothing here has come close either way (longest deck
    // is 21), so the lower bound costs nothing.
    const ceiling = spec.platform === 'tiktok' ? 30 : MAX_SLIDES;
    if (spec.slides.length > ceiling) {
      problems.push(`${spec.slides.length} slides — over ${ceiling}, `
        + (spec.platform === 'tiktok' ? "past the TikTok photo-post limit"
                                      : 'will not publish to Instagram/YouTube/Facebook'));
    }
  }
  if (spec.caption) {
    // The feed truncates around here, so anything load-bearing has to land first.
    const head = [...spec.caption].slice(0, 125).join('');
    if (!/\d/.test(head) && spec.slides?.some((s) => s.price)) {
      problems.push('caption has no number in its first 125 characters, but the deck leads with a price');
    }
  }
  problems.push(...checkFacts(spec));
  problems.push(...checkWiring(spec));
  // 13 of his 13 travel covers name their destination, and both decks he
  // flagged on 8.10 did not. See lib/cover-copy.js.
  problems.push(...checkCover(spec).map((p) => `cover: ${p}`));
  problems.push(...checkRouteRows(spec));
  // Caption patterns measured over 663 decks (TIKTOK.md §14). Every one of
  // these was already known when the last two decks shipped and none had been
  // applied — which is why it is a gate and not a note.
  const cap = checkCaption(spec);
  problems.push(...cap.problems.map((p) => `caption: ${p}`));
  for (const h of cap.hints) console.log(`  hint: caption ${h}`);
  // The old rule capped this at 5, citing a "measured effect flattens past 5"
  // whose source I could not find again. Measured on the 666-deck corpus
  // (analyze/corpus-stats.mjs), median saves per like by hashtag count:
  //
  //     1-3   0.188 (n=23)    9-12   0.331 (n=32)
  //     4-5   0.300 (n=61)   13-20   0.293 (n=61)
  //     6-8   0.306 (n=22)     21+   0.413 (n=457)
  //
  // Nothing supports a cap at 5, and the busiest bucket performs best. It is
  // also what almost everyone does, so this is a floor, not a ceiling: too few
  // tags is the failure mode, and 25 is simply where TikTok's caption runs out.
  const tags = spec.hashtags?.length ?? 0;
  if (tags && tags < 4) problems.push(`${tags} hashtags — decks with 1-3 sit at 0.19 saves/like against a 0.36 corpus median`);
  if (tags > 25) problems.push(`${tags} hashtags — past what fits in a caption`);
  return problems;
}

async function main() {
  const args = process.argv.slice(2);
  const specArg = args.find((a) => !a.startsWith('--'));
  if (!specArg) fail('usage: build.js <spec.json> [--debug] [--no-fetch]');

  const debug = args.includes('--debug');
  const noFetch = args.includes('--no-fetch');

  const specPath = path.resolve(HERE, specArg);
  const specRaw = await fs.readFile(specPath, 'utf8');
  const spec = JSON.parse(specRaw);

  const problems = validate(spec);
  if (problems.length) {
    console.error('spec problems:');
    for (const p of problems) console.error(`  - ${p}`);
    if (problems.some((p) => p.includes('no slides') || p.includes('at least 4') || p.includes('over '))) {
      process.exit(1);
    }
  }

  const outDir = path.join(HERE, 'out', spec.id || path.basename(specArg, '.json'));

  if (!noFetch) {
    console.log('sourcing photos...');
    // Eight, not four: the colour, contrast and duplicate gates each veto
    // candidates, and with only four the picker ran out and fell back to a
    // photo it had already rejected.
    const gathered = await gather(spec, { cacheDir: CACHE, perSlide: 8 });
    // Perceptual hashes of the photos already chosen for THIS deck, so no two
    // slides land on the same scene.
    const usedHashes = [];
    for (const g of gathered) {
      if (g.local) {
        const file = path.resolve(HERE, g.local);
        try {
          await fs.access(file);
        } catch {
          fail(`slide ${g.index + 1}: local image not found at ${g.local}`);
        }
        spec.slides[g.index].image.file = file;
        console.log(`  slide ${g.index + 1}: local ${g.local}`);
        continue;
      }
      // A slide can legitimately have no photo — the memo card is a cream
      // paper page. Saying "no usable candidate for undefined" about it is
      // noise, and noise is where a real failure hides.
      if (!spec.slides[g.index].image?.query && !spec.slides[g.index].images) continue;
      if (g.subjectMissing) {
        // Not a network error and not an empty search: Pexels returned photos,
        // and none of them is of the thing the slide is about. Loud, because
        // the silent version of this shipped a pool deck with no pools.
        console.error(`  slide ${g.index + 1}: NO PHOTO OF THE SUBJECT`
          + ` (needed ${g.subjectMissing.join('/')}) for "${g.query}"`);
        console.error('     a near-miss was used so the deck still renders —'
          + ' change the query or change the slide.');
      }
      if (g.error) {
        console.error(`  slide ${g.index + 1}: ${g.error}`);
        continue;
      }
      if (g.multi) {
        // Expand { query, count } entries into one resolved entry per photo, so
        // the written-back spec names every file a collage was built from.
        const slide = spec.slides[g.index];
        const expanded = [];
        for (const m of g.multi) {
          if (m.error) { console.error(`  slide ${g.index + 1}: "${m.query}": ${m.error}`); continue; }
          const entry = (slide.images || [])[m.entryIndex] || {};
          // Fields the AUTHOR wrote, as opposed to the ones the search filled
          // in. The write-back below replaces the whole entry, and it used to
          // keep only `query` — so `must` survived exactly one build and then
          // vanished, taking the subject constraint with it. That is how a
          // deck about pools went back to having no pools in it, and it would
          // have silently undone every constraint added today.
          const authored = {};
          // `keep` pins a chosen photograph (lib/stock.js reads it). It was missing
          // from this list, so a pinned photo survived exactly one build and was
          // then re-searched — the same way `must` was lost.
          for (const k of ['query', 'must', 'for', 'count', 'backdrop', 'anyCountry', 'keep']) {
            if (entry[k] !== undefined) authored[k] = entry[k];
          }
          if (m.subjectMissing) {
            console.error(`  slide ${g.index + 1}: NO PHOTO OF THE SUBJECT`
              + ` (needed ${m.subjectMissing.join('/')}) for "${m.query}"`
              + ' — a near-miss was used, change the query.');
          }
          if (m.kept) {
            // Reviewed and locked, same as the single-photo path: no veto, so
            // the frame renders identically on every build.
            for (const p of m.picks) {
              const h = await aHashOf(p.file);
              if (h) usedHashes.push(h);
              expanded.push({ ...authored, ...p });
            }
            continue;
          }
          if (m.picks.length < m.want) {
            console.error(`  slide ${g.index + 1}: "${m.query}" wanted ${m.want}, got ${m.picks.length}`);
          }
          // Same duplicate veto the single-photo path gets. Without it a
          // two-photo slide happily showed one photo twice.
          //
          // SCOPE matters here. A collage asks for several photos of ONE
          // place from ONE query, so its tiles only have to differ from each
          // other — checking them against all 108 tiles of a nine-up deck
          // rejected everything and buried the real warnings in noise. A
          // one-per-entry slide (the two-photo split) keeps the deck-wide
          // veto, because that is the case that actually shipped a repeat.
          // Same ranking on the multi path. The stack layout puts four
          // thumbnails on a slide, so a dull one is four times as visible.
          for (const p of m.picks) {
            if (!p.file || p.m) continue;
            try { p.m = await wowMeasure(p.file); } catch { p.m = null; }
          }
          if (m.picks.length > 1) {
            const sorted = wowRank(m.picks.filter((p) => p.file),
                                   { mode: entry.backdrop ? 'backdrop' : 'hero' });
            if (sorted.length) m.picks = sorted;
          }
          const collage = m.collage || m.want > 1;
          const against = collage ? [] : usedHashes;
          let taken = 0;
          let skipped = 0;
          for (const p of m.picks) {
            if (taken >= m.want) break;
            const h = await aHashOf(p.file);
            if (h && against.some((u) => hamming(h, u) <= 8)) { skipped++; continue; }
            if (h) { against.push(h); if (collage) usedHashes.push(h); }
            expanded.push({ ...authored, ...p });
            taken++;
          }
          if (taken < m.want) {
            // Everything left repeats something already in the deck. Say so
            // rather than padding the slide with the repeat.
            for (const p of m.picks.slice(0, m.want - taken)) expanded.push({ ...authored, ...p });
            console.error(`  slide ${g.index + 1}: "${m.query}" — only ${taken} non-repeating photo(s)`
              + `, ${skipped} repeated something already in the deck. Change the query.`);
          }
        }
        slide.images = expanded;
        console.log(`  slide ${g.index + 1}: ${expanded.length} photos for ${g.multi.length} quer${g.multi.length === 1 ? 'y' : 'ies'}`);
        continue;
      }
      if (g.kept) {
        // Already reviewed and locked. No search and no veto: the whole point
        // is that a frame someone looked at and approved renders the same on
        // every build.
        const h = await aHashOf(g.candidates[0].file);
        if (h) usedHashes.push(h);
        console.log(`  slide ${g.index + 1}: kept ${g.candidates[0].id}`);
        continue;
      }
      // Relevance order still leads; colour and duplication only veto. A
      // greyscale frame reads as art-directed next to the phone photos being
      // copied, and a photo already used in this deck reads as padding: the
      // Larnaca deck shipped one aerial on four of its twenty-one slides.
      // Rank by the measure the tourism literature actually supports —
      // saturation first, then the hue families that predict popularity —
      // relative to the other candidates this query returned, never against a
      // borrowed threshold. See lib/wow.js for why v1 of this was wrong.
      for (const c of g.candidates) {
        if (!c.file) continue;
        try { c.m = await wowMeasure(c.file); } catch { c.m = null; }
      }
      let ordered = wowRank(g.candidates.filter((c) => c.file));
      // The cover is judged differently from every other frame. The visual
      // score cannot tell a sunset over the sea from a saturated alley — to
      // it the alley is the better frame, more edges and more colour variance
      // — and that is exactly the Larnaca cover the owner rejected: "lots of
      // colour, but nothing WOW in it". rankCovers re-reads the stock
      // library's own description of what is in the frame. See lib/cover.js,
      // including what is NOT established about it.
      if (g.index === 0) {
        ordered = rankCovers(ordered, spec.country);
        const top = ordered[0];
        if (top) {
          console.log(`  cover: ${top.coverFactor}x — ${top.coverWhy.join(', ') || 'nothing named'}`);
        }
      }
      const { pick, allGrey, allFlat, allDuplicates, hash } =
        await pickColourful(ordered.length ? ordered : g.candidates, { avoid: usedHashes });
      if (pick) {
        if (hash) usedHashes.push(hash);
        // Default to the top-ranked candidate. Swapping in a different one is a
        // one-line edit to the spec, which is the point of writing the choice down.
        const slide = spec.slides[g.index];
        slide.image = { ...slide.image, ...pick };
        slide.credit = slide.credit || pick.credit?.name;
        console.log(`  slide ${g.index + 1}: ${g.candidates.length} candidates, using ${pick.id}`
          + (allGrey ? '  [every candidate was near-greyscale — check this slide]' : '')
          + (allFlat ? '  [every candidate was flat/hazy — change the query]' : '')
          + (allDuplicates ? '  [every candidate repeats a photo already in this deck — change the query]' : ''));
      } else {
        console.error(`  slide ${g.index + 1}: no usable candidate for "${g.query}"`);
      }
    }
    // Persist the resolved choices so a rebuild is reproducible - but never
    // over an edit made while this build was running.
    //
    // This already happened once: a slide was added to the Larnaca spec while
    // a build of it was in flight, and the write-back silently deleted it. No
    // error, no warning, the slide was simply gone. Sourcing photos takes
    // minutes, which is plenty of time to edit the file you are waiting on.
    const onDisk = await fs.readFile(specPath, 'utf8');
    if (onDisk !== specRaw) {
      console.error('');
      console.error('!! the spec changed on disk while this build was running.');
      console.error('   Resolved photo choices were NOT written back, so your edit is safe.');
      console.error('   Re-run the build to resolve photos against the edited spec.');
    } else {
      await fs.writeFile(specPath, JSON.stringify(spec, null, 2) + '\n');
    }
  }

  console.log('rendering...');
  const written = await renderSpec(spec, { outDir, debug });

  const manifest = {
    id: spec.id,
    built: new Date().toISOString(),
    caption: spec.caption,
    hashtags: spec.hashtags,
    alt: spec.slides.map((s) => s.alt || s.image?.alt || null),
    platforms: {
      tiktok: written.map((w) => path.relative(HERE, w.tiktok)),
      instagram: written.map((w) => path.relative(HERE, w.ig)),
      facebook: written.map((w) => path.relative(HERE, w.ig)),
      youtube: written.map((w) => path.relative(HERE, w.tiktok)),
    },
    credits: spec.slides.map((s) => s.image?.credit ?? null),
  };
  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n${written.length} slides -> ${path.relative(process.cwd(), outDir)}`);
  console.log('  *-tiktok.jpg  1080x1920  TikTok, YouTube');
  console.log('  *-ig.jpg      1080x1350  Instagram, Facebook');
  if (problems.length) console.log(`\n${problems.length} non-fatal spec problem(s) above.`);

  // Run the frame gate here rather than trusting whoever built this to
  // remember. A slide whose text runs past the bottom, or sits under the
  // strip TikTok draws its caption over, looks perfectly fine as a JPEG -
  // it just silently loses a line in the feed. Non-fatal and isolated in a
  // child process: a problem with the checker must never fail a build.
  await new Promise((done) => {
    const id = spec.id || path.basename(specArg, '.json');
    const child = spawn(process.execPath, ['analyze/overflow-check.mjs', id],
      { cwd: HERE, stdio: ['ignore', 'pipe', 'ignore'] });
    let out = '';
    const timer = setTimeout(() => { try { child.kill(); } catch { /* gone */ } }, 90000);
    child.stdout.on('data', (d) => { out += d; });
    child.on('error', () => { clearTimeout(timer); done(); });
    child.on('close', () => {
      clearTimeout(timer);
      const bad = out.split(String.fromCharCode(10))
        .filter((x) => /PROBLEM|past the bottom|under the TikTok|above the frame/.test(x));
      if (bad.length) {
        console.log('');
        console.log('frame check:');
        for (const b of bad) console.log('  ' + b.trim());
      } else if (out.trim()) {
        console.log('frame check: every slide fits and clears the TikTok UI');
        // And check that something was actually drawn. The frame check
        // measures where text sits; text that was never rendered sits
        // nowhere and so collides with nothing, which is how eight black
        // slides passed every gate.
        try {
          execFileSync(process.execPath, ['analyze/ink-check.mjs', spec.id],
            { stdio: 'inherit', cwd: HERE });
        } catch (err) {
          // Exit 1 means the check ran and found empty frames; anything else
          // means the check itself failed and has proved nothing.
          if (err.status === 1) console.error('!! some frames rendered empty — see above');
          else console.error(`!! ink check could not run (${err.status ?? err.code ?? err.message}) — frames NOT verified`);
        }
      }
      done();
    });
  });
}

// The keyless Pexels path holds a Chromium open at module scope, so without an
// explicit close the process keeps its event loop alive long after every file
// has been written — the build looks hung when it has actually finished.
main()
  .catch((err) => { console.error(`error: ${err.stack || err.message}`); process.exitCode = 1; })
  .finally(async () => {
    try { await closeBrowser(); } catch { /* already gone */ }
    try { await closeColourCheck();
  await closeWow(); } catch { /* already gone */ }
  });
