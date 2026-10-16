# How photos are chosen (16.10, after the 2-week-route deck flopped on photos)

Photo choice is most of the work on a deck. For every slide:

1. **Candidates, wide.** Pinterest (`native/pin-pool.mjs`, logged-out, full-resolution
   originals, 25 per query, so 10-20 query variants per place), plus Unsplash
   (`photo-pool.mjs`) and Pexels (`pexels-pool.mjs`). Queries per place: `<place>
   aesthetic / sunset / drone / viewpoint / beach` plus his palette ("pink sunset",
   "turquoise lagoon cliffs", "infinity pool sunset").
2. **Score.** `native/wow-score.mjs`: CLIP ViT-L/14 in Chrome (no Python, no DLLs),
   LAION aesthetic (collapsed to one dot product) + "awe" prompts built from his own
   WOW photos. Sanity check: it ranked the Maya Bay aerial he praised top, the
   mother-and-baby shot he rejected bottom. ~5 s per photo, so score only the slot's
   queries (`--only`).
3. **Eye review, big.** `qsheet.py` per place, then `big.py` on the best 12. Ask:
   would a person say "wow" out loud? Dream sunset, turquoise water + cliffs, or the
   exact place at its most beautiful.
4. **Reject AI images.** Pinterest is full of them: impossible reflections, smeared
   rock texture, "painted" trees, glowing-through objects, too-perfect skin, 941x1672 /
   PNG originals. Check every finalist at full resolution (D18, the pink Railay sunset,
   looked perfect as a thumbnail and was AI at 100%).
5. **Gates.** `native/check.sh`: photo floor vs the source deck, duplicates, too small
   for 1440x1920 (4K needs the full2x copy), spelling. Watermarks: crop them out with
   `zoom` + `focus`.
6. **Order of preference.** First the exact place, at its most stunning. If nothing of
   the place is WOW, use a dream image: a pink/orange sunset over sea, karst cliffs, or
   turquoise water. Never "correct but ordinary".
7. **Text vs subject.** The landmark must not sit under the text block. Pick a photo
   whose calm zone (sky, sea) carries the text (Wat Arun low in frame, sky above).

Research behind it: `01-wow-research.md` (water, coast, cliffs and warm light beat
colour stats; small face-hidden people only; avoid oversaturated or HDR looks).
