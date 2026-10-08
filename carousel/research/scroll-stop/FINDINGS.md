# Scroll-stopping — findings so far, each with its strength

Updated as data arrives. Strength scale:
**A** randomised experiment, replicated · **B** within-creator, interval
excludes zero, many creators agree · **C** within-creator, directional ·
**D** one account or a handful of posts.

## ⭐⭐ REACH, 23 creators, ~440 covers with exact view counts (11:20, 8.10)

Within-creator, pooled, interval by resampling whole creators
(`analyze/cover-effects.mjs`, "POOLED — plays"):

| on the cover | plays | 95% interval | creators | independent check |
|---|---|---|---|---|
| **names the place** | **×1.34** | [1.04, 1.82] | 8 of 12 | his account 13/13; the "destination decides" pattern in 7 creators |
| **a number** | **×1.49** | [1.12, 2.04] | 6 of 12 | Upworthy +6%, 3,573 randomised tests |
| **text in the top third** | **×0.52** | [0.37, 0.84] | 3 of 11 | corpus likes ×0.68; holds with sky fixed (×0.58) and for small text (×0.54) |
| **first person ("I/my/we")** | **×0.68** | [0.51, 0.91] | 1 of 11 | corpus likes ×0.90 |
| short (≤8 words) | ×1.23 | [0.80, 1.88] | **11 of 12** | — direction very consistent, size uncertain |
| blue sky on top | ×0.54 vs likes ×1.53 | — | — | **contradicts itself across samples: unusable** |

**Update at 24 creators:** names the place ×1.16 [0.73, 1.66] — one added
creator moved it from ×1.34 and it no longer excludes 1. Downgraded to
directional; the destination gate stays because his own 13/13 covers and the
owner's instruction require it, not because reach proves it. Held firm:
number ×1.56 [1.11, 2.08] · text in top third ×0.54 [0.39, 0.88] · first
person ×0.65 [0.48, 0.90] · short ≤8 words, 12 of 13 creators.

**Update at 30 creators, 616 covers (11:50, 8.10):** number ×1.42 [1.08,
1.84], 11 of 18 creators: still holds, the most stable reach finding. First
person ×0.64 [0.40, 0.89], 5 of 18: still holds. Short ≤8 words 17 of 19
creators, ×1.28 (interval touches 1). Place ×1.32 [0.89, 1.91], 13 of 19.
Text in the top third weakened on plays to ×0.66 [0.47, 1.06], but on likes
it is ×0.68 [0.45, 0.90]: the two together still point the same way, so
`pos: mid` stays. Blue sky on top: ×0.69 on plays, ×1.40 on likes, the
contradiction persists. Template "underrated / hidden / niche": 9 of 12
creators, 71% beat own median, ×1.50, unchanged.


Text at the BOTTOM beat text mid-frame in 6 of 6 creators (×2.6), but only
24 bottom covers, mostly big bare place names (PORTO, Puglia): exploratory.

**Applied:** cover text moved from the top third to mid-frame (`pos: mid`).
Already true of our covers: place named, a number, ≤8 words, no ? or !.
Not applied: anything resting on one creator or one sample.

## ⭐ What WORKS — real covers, copied, not assembled (owner, 8.10: "invent zero")

Method: each cover against its OWN creator's median; a template "works" when
it wins repeatedly (`analyze/templates.mjs`).

* **Across 14 creators, no wording template wins reliably** — most sit at
  40-60% of covers beating their creator's median, a coin flip. Best:
  "underrated / hidden" 4 of 7 creators.
* **The destination moves views far more than the wording.** @maryamontour
  (179K followers) uses one fixed layout on 46 posts — "[what it is] /
  DESTINATION 🏳" — and "Places to visit" alone spans ×20 (New York) to ×0.26
  (Croatia): identical words, 77× apart.
* **Replicated in a second creator with a different style:** @emsriley (19K
  followers, small text over her own photos) — "Places I would take you in X
  if I loved you" runs from ×3.87 (New York) to ×0.28 (Copenhagen); "N FREE
  things to do in London" from ×3.42 to ×0.82. Same words, the place and
  the season differ. Two creators who hold the format fixed both show that
  the spread INSIDE a template is larger than the gap BETWEEN templates.
  A third creator, @laurabruehl_ (81K, bare place names over her own photos):
  "PORTO" ×16.0 and "Porto" ×1.93 — both Porto covers in her top 3 — while
  "LJUBLJANA" in the identical format ×0.65. Three creators, three styles,
  one result.
  A fourth, @houseofhela_ (28K): one sentence on nearly every cover —
  "Going to X? Here's where to go!" — from ×8.0 (Puglia, 2.3M plays) to
  ×0.03 (Biarritz). Identical words, 270× apart. That template carries a
  question mark and an exclamation mark and still reached millions: the ~10%
  wording effects from the experiments are real but tiny next to this.
  A fifth, @routes__app (75K, almost all PARIS — the destination held fixed,
  the wording varied): the IDENTICAL sentence about the identical city, "N
  things you've walked past in Paris without knowing what they mean", posted
  three times, came out ×4.27, ×1.84 and ×0.55 — 8× apart with nothing in
  the words changing. The run-to-run noise on one fixed cover is larger
  than any wording effect measured anywhere in this project. Her Korea and
  south-of-France covers sit at ×0.13–0.26: the destination effect again.
  A sixth, @thejapancodes (117K) is the cleanest test there will be: 48
  covers, ONE destination (Japan), ONE template ("<adjective> truths … in
  Japan…"), same layout, same white sticker. Plays run ×0.36 to ×49 — 137×
  — and the 10th-90th percentile alone is ×0.44 to ×2.86. With place,
  wording and design all held fixed, a post can still land anywhere in a
  6× band by chance. Any single cover result, ours included, must be read
  against that noise.
  ★ A seventh, @travelnova.app (40K), ran the experiment by accident:
  "3 countries you can visit in 1 trip" posted 25 times with only the photo
  changed — ×0.07 to ×48. And THE SAME IMAGE WITH THE SAME TEXT posted three
  times: ×21.98, ×0.61, ×0.25 (958,500 vs 11,100 plays). Another pair:
  ×1.50 and ×0.13. Nothing changed between those posts. That is the
  noise floor of a single TikTok photo post — ~90× from identical inputs.
  No property of one cover can be judged from one post; only patterns
  across many posts and creators mean anything. This also says the most
  productive thing to do with a cover that works is post it again.
  Consequence: for a given destination the cover wording is a small lever;
  which destination to make a deck about is the large one.
* Within that one fixed layout, holding everything but the first line:
  * **"TOP N hotels / DESTINATION": 4 of 4 hotel covers in her top 11 of 46**
    (×12 – ×39). For HotelMozil this is the most relevant single result.
  * **"N day itinerary / DESTINATION": median ×3.56** (5 covers)
  * "Places to visit / DESTINATION": median ×0.94 (9 covers)
* ~~The itinerary line is the copy to take~~ — **WITHDRAWN at 19 creators.**
  Across creators, "itinerary / route / N days" beat its creator's median in
  only 1 of 7 creators, 31% of covers, typical ×0.63 — among the weakest
  templates. maryamontour's ×3.56 did not generalise. On our own subject:
  @ellastraveldiaries0 "5 day itinerary for the amalfi coast, capri +
  pompeii" ×0.47. (It still tops the corpus on SAVES — Rome 1.538 — but
  saves come after the stop; on reach it underperforms.)
* Most consistent so far: **"underrated / hidden / niche"** — at 21
  creators, 6 of 9, 63% of covers above their creator's median, typical ×1.52
  (the only template whose typical cover is clearly above 1). New example on
  our own kind of deck: @travelzy.pl "5 Hidden Gems in Rome (Stop visiting
  only the tourist traps!)" ×6.8, 1.4M plays — her best of 16. Best real example:
  "underrated destinations for your 2026 euro summer" ×17.5 (2.0M plays).
  Close behind, same creator: "places in Italy I desperately need to visit"
  ×14.9 (1.7M). Still small per template; keep collecting.

## Wording (what the cover SAYS) — feature effects, for reference only

| finding | strength | evidence |
|---|---|---|
| A question mark costs clicks — **about −10%**, whatever kind of question (how/what/why/yes-no all −9 to −12%) | **A** | Upworthy, 11,053 randomised tests, replicated exploratory → confirmatory |
| An exclamation mark costs **about −10%** | **A** | Upworthy, 881 tests, replicated |
| A number helps, **about +6%** | **A** | Upworthy, 3,573 tests, replicated |
| A warning (mistake / avoid / don't / regret) helps, **about +5%** | **A** | Upworthy, 1,734 tests, replicated · corpus likes ×1.34, 8 of 11 creators (C) |
| A superlative (best / ultimate / perfect / must) helps, **about +6%** | **A** | Upworthy, 2,438 tests, replicated |
| A curiosity pointer (this / here's / why / what happened) helps, **about +6%** | **A** | Upworthy, 6,915 tests |
| ALL-CAPS words cost **about −6%** | **A** | Upworthy, 1,728 tests |
| A colon or dash splitting one line into two parts costs **about −6%** | **A** | Upworthy, −7.5% → −6.2%, 2,218 tests, replicated |
| Opening with "this / these" helps **about +5%** | **A** | Upworthy, +6.4% → +5.0%, 1,998 tests, replicated |
| Where the number sits (leading vs inside the line) | not replicated | leading: −0.4% then +3.7%; inside: +7.1% then +5.4% — the number helps, its position is unclear |
| Imperative opener ("Don't…", "Stop…") | not replicated | −3.7% (n.s.) then +3.0% |
| Trailing "..." | no effect | +1.9%, +1.6%, both cross zero |
| Money words cost **about −9%** in news headlines | A, but… | Upworthy confirmatory only; and in TRAVEL, money is the content — not transferred |
| A "top N / N things" list count does **worse** than the same creator's other covers | **B/C** | corpus likes ×0.62 [0.48, 0.95]; his own account: all three "top 3" covers are in his bottom five; Upworthy's +15% did NOT replicate (+3.9%, interval crosses 0) |
| Short cover text (≤8 words) gets more plays | **C** | plays pilot ×1.61 [1.02, 2.67], 3 of 3 creators — but only 3 creators |

## Picture (what the cover SHOWS) — objective pixel measures

| finding | strength | evidence |
|---|---|---|
| **Open blue sky (or sea) across the top of the frame** — for LIKES | **B for likes · unconfirmed for reach** | corpus likes ×1.53 [1.06, 2.11], 10 of 15 creators; holds with text position held fixed (×1.66); spans landmark, city and sea. ⚠️ On PLAYS (3 creators) it points the other way, ×0.80 [0.50, 1.25], 1 of 3. Not usable as a stopping rule until the plays sample grows |
| Small text placed in the top third does worse than small text mid-frame | **C** | corpus likes ×0.68 [0.47, 0.94], 3 of 13 creators; among small-text covers ×0.65 |
| A person in frame | C | corpus ×1.27 [0.95, 1.66], 11 of 16 — interval touches 1 |
| Brighter, higher-contrast covers | C | ×1.29 and ×1.23, intervals touch 1 |

## What is NOT known yet

* Whether any of this moves **plays** (reach) and not only likes — the plays
  sample is 3 creators. The paced grid harvest is running for that.
* Hebrew specifically — every experimental number is English.
* Multiple comparisons: 30 features were tested on the corpus; one or two
  "significant" results are expected by chance alone. Only findings that
  agree with an independent source (Upworthy, his account) are treated as
  more than directional.
