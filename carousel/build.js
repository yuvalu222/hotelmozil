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
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gather } from './lib/stock.js';
import { closeBrowser } from './lib/stock-browser.js';
import { renderSpec } from './lib/render.js';

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
    if (spec.slides.length > MAX_SLIDES) {
      problems.push(`${spec.slides.length} slides — over ${MAX_SLIDES}, will not publish to Instagram/YouTube/Facebook`);
    }
  }
  if (spec.caption) {
    // The feed truncates around here, so anything load-bearing has to land first.
    const head = [...spec.caption].slice(0, 125).join('');
    if (!/\d/.test(head) && spec.slides?.some((s) => s.price)) {
      problems.push('caption has no number in its first 125 characters, but the deck leads with a price');
    }
  }
  const tags = spec.hashtags?.length ?? 0;
  if (tags > 5) problems.push(`${tags} hashtags — the measured effect flattens past 5`);
  return problems;
}

async function main() {
  const args = process.argv.slice(2);
  const specArg = args.find((a) => !a.startsWith('--'));
  if (!specArg) fail('usage: build.js <spec.json> [--debug] [--no-fetch]');

  const debug = args.includes('--debug');
  const noFetch = args.includes('--no-fetch');

  const specPath = path.resolve(HERE, specArg);
  const spec = JSON.parse(await fs.readFile(specPath, 'utf8'));

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
    const gathered = await gather(spec, { cacheDir: CACHE, perSlide: 4 });
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
          if (m.picks.length < m.want) {
            console.error(`  slide ${g.index + 1}: "${m.query}" wanted ${m.want}, got ${m.picks.length}`);
          }
          for (const p of m.picks) expanded.push({ query: m.query, ...p });
        }
        slide.images = expanded;
        console.log(`  slide ${g.index + 1}: ${expanded.length} photos for ${g.multi.length} quer${g.multi.length === 1 ? 'y' : 'ies'}`);
        continue;
      }
      const pick = g.candidates.find((c) => c.file);
      if (pick) {
        // Default to the top-ranked candidate. Swapping in a different one is a
        // one-line edit to the spec, which is the point of writing the choice down.
        const slide = spec.slides[g.index];
        slide.image = { ...slide.image, ...pick };
        slide.credit = slide.credit || pick.credit?.name;
        console.log(`  slide ${g.index + 1}: ${g.candidates.length} candidates, using ${pick.id}`);
      } else {
        console.error(`  slide ${g.index + 1}: no usable candidate for "${g.query}"`);
      }
    }
    // Persist the resolved choices so a rebuild is reproducible.
    await fs.writeFile(specPath, JSON.stringify(spec, null, 2) + '\n');
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
}

// The keyless Pexels path holds a Chromium open at module scope, so without an
// explicit close the process keeps its event loop alive long after every file
// has been written — the build looks hung when it has actually finished.
main()
  .catch((err) => { console.error(`error: ${err.stack || err.message}`); process.exitCode = 1; })
  .finally(async () => {
    try { await closeBrowser(); } catch { /* already gone */ }
  });
