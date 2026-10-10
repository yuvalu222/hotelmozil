# Cover census: what the first slide says on viral travel carousels (10.10)

Question: which hook formulas on the cover (first slide) of travel photo
carousels go with more reach, and how sure can we be? Three sources:
1,375 English covers measured against each creator's own median (section 1),
613 Hebrew covers from TikTok search (section 2), and published viral
examples from the web (section 3). Section 4 is the noise floor, section 5 the
ranked answer.

Everything in sections 1-2 is computed by `cover_census.py` in this folder
(regexes on the transcribed text, never hand-assigned; rerun it to reproduce).
`census-tables.md` and `census.json` are its raw output. This page is built
by `build_report.py` from `report-prose.tmpl` + `web-findings.tmpl` + the
generated tables.

## How to read the numbers

* **Multiplier (x)**: plays relative to the creator's own median (English)
  or relative to the median plays-per-follower of the whole Hebrew set.
  x2.0 = twice the typical post.
* **% beat median**: share of covers in the formula above their baseline.
  50% = coin flip.
* **creators beat (sign p)**: for each creator who used the formula, does
  that creator's median cover in it sit above baseline? k/m creators, with a
  two-sided sign test. **This is the main evidence-strength column**: a formula
  that works for 17 of 19 creators is a pattern; one that rests on one viral
  post is not.
* **within-creator contrast**: inside each creator, average lift of covers
  WITH the formula minus covers WITHOUT, pooled across creators (weighted by
  n1*n0/(n1+n0)), 95% interval by resampling whole creators. If the interval
  excludes x1.00, the effect survives the creator-level noise.
* **in top 150 (over-rep.)**: how many of the formula's covers made the top
  150 list, and that share divided by the formula's share of the whole base.
  Over 1 = over-represented among the winners. **Read this column last**: it
  is exactly the "survivorship" view that viral-post articles use, and section
  1 shows where it misleads.
* A cover can sit in several formulas ("Top 10 hidden gems in Wales" is list +
  superlative + secret). Clusters overlap; they are not exclusive.

---

## 1. English: 1,375 covers, 56 creators, within-creator

base covers: 1375, creators: 56, plays>=50k pool: 524 from 51 creators; top 150 from 40 creators

Source: `research/scroll-stop/cover-rows.json`, lift = log10(plays / that
creator's median plays). Base for the cluster statistics = every cover from
the 56 creators with 8 or more measured covers. The top-150 list is drawn, as
asked, from covers with plays >= 50,000 in that base. (Cluster statistics use
the full base, not the top 150, because inside the top 150 every cover beats
its median by construction.)

### 1.1 The cluster table

| formula | n | in top 150 (over-rep.) | creators | median | % beat median | creators beat (sign p) | within-creator contrast [95% CI], creators won |
|---|---|---|---|---|---|---|---|
| First person (I / my / we) | 326 | 23 (0.65) | 47 | x0.86 | 41% | 12/47 (p=0.0011) | x0.60 [x0.43, x0.83], 13/47 |
| List of N / Top N | 318 | 47 (1.35) | 40 | x1.23 | 55% | 19/40 (p=0.87) | x1.73 [x1.14, x2.66], 23/40 |
| Superlative (best / top / most / ultimate / only) | 252 | 46 (1.67) | 48 | x1.27 | 56% | 30/48 (p=0.11) | x1.79 [x1.19, x2.70], 29/48 |
| Plain recommendations (things to do / places to visit) | 148 | 29 (1.80) | 29 | x1.64 | 59% | 22/29 (p=0.0081) | x1.92 [x1.28, x2.92], 20/29 |
| Must / need to / can't miss (imperative) | 140 | 19 (1.24) | 38 | x1.11 | 56% | 23/38 (p=0.26) | x1.41 [x0.95, x2.02], 23/38 |
| Itinerary / guide / N days / route | 131 | 18 (1.26) | 26 | x1.05 | 54% | 12/26 (p=0.85) | x1.40 [x0.99, x2.28], 14/26 |
| Bare place name / few words, no hook (<=4 words) | 118 | 5 (0.39) | 28 | x0.97 | 46% | 10/28 (p=0.18) | x0.74 [x0.43, x1.23], 9/28 |
| Cost reveal / price / budget / free | 115 | 12 (0.96) | 29 | x1.01 | 50% | 14/29 (p=1) | x1.42 [x0.80, x2.45], 16/29 |
| Season / year / month | 108 | 14 (1.19) | 37 | x0.81 | 40% | 13/37 (p=0.099) | x0.68 [x0.47, x1.06], 14/37 |
| Hotel / Airbnb / where to stay | 91 | 14 (1.41) | 20 | x1.03 | 56% | 15/20 (p=0.041) | x1.51 [x0.69, x3.26], 12/19 |
| Part N (series) | 86 | 10 (1.07) | 18 | x0.99 | 49% | 11/18 (p=0.48) | x0.94 [x0.57, x1.88], 9/18 |
| Identity call-out ("going to X?", "if you are...") | 83 | 9 (0.99) | 20 | x1.18 | 55% | 11/20 (p=0.82) | x1.81 [x0.81, x3.40], 11/20 |
| Contains a question mark | 71 | 6 (0.77) | 23 | x0.64 | 42% | 11/23 (p=1) | x0.56 [x0.24, x1.40], 11/23 |
| Confession / insider truth ("the real reason", "truths") | 70 | 7 (0.92) | 9 | x1.00 | 50% | 3/9 (p=0.51) | x1.14 [x0.64, x1.84], 3/9 |
| Wish I knew / need to know / tips | 66 | 7 (0.97) | 23 | x1.12 | 53% | 13/23 (p=0.68) | x1.35 [x0.93, x2.16], 14/23 |
| Local vs tourist | 61 | 5 (0.75) | 11 | x1.05 | 52% | 6/11 (p=1) | x1.42 [x0.87, x2.88], 7/11 |
| Ranking / rated / review | 57 | 3 (0.48) | 17 | x0.91 | 46% | 8/17 (p=1) | x0.73 [x0.45, x1.38], 4/17 |
| Bucket list / desire ("places I need to see") | 57 | 8 (1.29) | 26 | x0.98 | 49% | 13/26 (p=1) | x0.85 [x0.41, x1.81], 12/26 |
| Warning / mistake / what NOT to do | 53 | 11 (1.90) | 24 | x1.08 | 55% | 13/24 (p=0.84) | x1.66 [x0.99, x2.88], 14/24 |
| Photo spots / photo ideas | 46 | 8 (1.59) | 19 | x0.97 | 43% | 8/19 (p=0.65) | x1.04 [x0.51, x2.18], 8/19 |
| POV / scenario / "this is your sign" | 40 | 5 (1.15) | 18 | x0.96 | 48% | 9/18 (p=1) | x1.33 [x0.61, x2.41], 8/18 |
| Secret / hidden / underrated | 36 | 9 (2.29) | 19 | x3.68 | 78% | 17/19 (p=0.00073) | x4.32 [x2.04, x11], 14/19 |
| Credential ("after 5 years in", "as a local") | 34 | 4 (1.08) | 3 | x1.18 | 59% | 2/3 (p=1) | x1.40 [x0.20, x4.14], 1/3 |
| No text on cover | 20 | 3 (1.38) | 8 | x0.43 | 35% | 1/8 (p=0.07) | x0.66 [x0.11, x1.28], 1/8 |
| Before / after / expectation vs reality | 16 | 3 (1.72) | 8 | x0.65 | 38% | 3/8 (p=0.73) | x1.02 [x0.33, x2.86], 4/8 |
| Objection quote ("but X is so expensive") | 12 | 4 (3.06) | 8 | x0.37 | 42% | 3/8 (p=0.73) | x0.81 [x0.08, x7.28], 3/8 |
| Comparison / vs / instead | 8 | 3 (3.44) | 5 | x4.82 | 100% | 5/5 (p=0.062) | x7.86 [x1.91, x22], 4/5 |

What it says, strongest first:

* **Secret / hidden / underrated is the one formula that wins almost
  everywhere**: 17 of 19 creators who used it beat their median with it
  (p=0.001), within-creator contrast x4.3 [x2.0, x10.6], 78% of its covers
  above median. The single word "underrated" won for 6 of 6 creators (90% of
  covers). This reproduces the earlier FINDINGS result (14 of 19 creators) on
  a regex-built cluster, not a hand-coded one.
* **The plain recommendation ("things to do in X", "places to visit in X")
  beats creators' medians for 22 of 29 creators** (p=0.008), contrast x1.9
  [x1.3, x2.9]. The boring evergreen format outperforms most clever hooks.
* **Superlative (best/top/most/only)** and **list of N** both carry a
  within-creator contrast whose interval excludes 1 (x1.8 and x1.7), but they
  win for only 30/48 and 19-23/40 creators: real on average, not reliable per
  creator.
* **Hotel** wins for 15 of 20 creators (p=0.04), contrast x1.5 with an
  interval that includes 1. Directional, and agrees with Hebrew (section 2).
* **Comparison / vs / instead** (TOURIST TRAPS VS ALTERNATIVES, "you travel
  to Japan, not Japan"): all 5 creators won, contrast x7.9 [x1.9, x22], but
  only 8 covers. The most promising thin result; worth testing, not trusting.
* **Losers, consistently:** first person (I/my/we) x0.60 [x0.43, x0.83],
  lost for 35 of 47 creators (p=0.001), the strongest negative in the data.
  Question mark x0.56, season/month x0.68, bare place name x0.74, no text
  x0.66, ranking/rated x0.73 (lost for 13 of 17 by contrast).
* **The outlier trap, in one row: the objection quote** ("But London is so
  expensive", 6.0M plays, x358). It is 3x over-represented in the top 150,
  yet its typical cover sits at x0.37 and only 3 of 8 creators win with it.
  @travel_guide_g owns the three wins; @routes__app ("But South of France is
  so expensive" x0.14, "But Korea is so expensive" x0.13) and
  @travelfreegems ("But New York is so expensive" x0.03) used the identical
  formula and sank. Confession ("insane truths", "the real reason I moved")
  is the same story: 70 covers but most of them from one creator
  (@thejapancodes); 3 of 9 creators win.

### 1.2 Narrow phrases (exact wording, English)

| phrase | n | creators | median | % beat median | creators beat |
|---|---|---|---|---|---|
| "underrated" | 10 | 6 | x2.72 | 90% | 6/6 (p=0.031) |
| "hidden gem(s)" | 8 | 6 | x1.54 | 62% | 4/6 (p=0.69) |
| "secret" | 6 | 4 | x3.75 | 83% | 3/4 (p=0.62) |
| "Top N ..." | 63 | 12 | x2.45 | 67% | 7/12 (p=0.77) |
| "N things to do in" | 28 | 13 | x1.60 | 54% | 7/13 (p=1) |
| "things to do in" (any) | 69 | 17 | x1.57 | 57% | 12/17 (p=0.14) |
| "places to visit" | 35 | 12 | x1.73 | 63% | 8/12 (p=0.39) |
| "must do / must visit" | 39 | 12 | x1.18 | 64% | 9/12 (p=0.15) |
| "what NOT to do / never" | 27 | 18 | x1.06 | 56% | 11/18 (p=0.48) |
| "before going / wish I knew" | 28 | 10 | x1.02 | 50% | 5/10 (p=1) |
| "N day itinerary" | 36 | 15 | x1.32 | 56% | 8/15 (p=1) |
| "this is your sign" | 9 | 3 | x2.45 | 78% | 3/3 (p=0.25) |
| "but X is so expensive" quote | 6 | 4 | x3.83 | 67% | 2/4 (p=1) |
| "how much it cost(s)" | 40 | 5 | x1.70 | 60% | 3/5 (p=1) |
| "N countries in 1 trip" | 28 | 3 | x1.07 | 50% | 1/3 (p=1) |
| "hotels" | 31 | 11 | x1.13 | 58% | 8/11 (p=0.23) |
| "X? Here's where to go" | 19 | 3 | x1.27 | 53% | 2/3 (p=1) |
| "Oh you're going to X?" | 4 | 2 | x4.05 | 100% | 2/2 (p=0.5) |
| "tourist trap(s)" | 5 | 4 | x6.79 | 60% | 2/4 (p=1) |
| "rating / rated" | 24 | 10 | x1.09 | 54% | 6/10 (p=0.75) |

### 1.3 Three verbatim examples per formula (best cover per creator, three different creators)

**First person (I / my / we)** (n=326)
- "Secret places in italy / i need to see / part. 2" - @globe.tipper, 857,200 plays, x666
- "Small ways I avoided / looking like a "tourist" / in Italy..." - @italianinspo, 4,600,000 plays, x587
- "The real reason I packed / up everything and moved / us to Switzerland..." - @angelicauratips, 3,500,000 plays, x80

**List of N / Top N** (n=318)
- "Top 10 Places to Visit in / Bali" - @downtoearthtravel25, 1,200,000 plays, x134
- "Top 10 most beautiful / islands in Europe" - @travel.destinations7, 278,400 plays, x130
- "5 must do things to do in / TAKAYAMA Japan" - @m_o_life26, 203,800 plays, x85

**Superlative (best / top / most / ultimate / only)** (n=252)
- "WHERE TO TRAVEL: / BEST COUNTRIES TO VISIT / BY MONTH" - @travel_guide_g, 6,800,000 plays, x406
- "What most people visit in / Greece" - @travel.destinations7, 323,000 plays, x151
- "Top 10 Places to Visit in / Bali" - @downtoearthtravel25, 1,200,000 plays, x134

**Plain recommendations (things to do / places to visit)** (n=148)
- "Top 10 Places to Visit in / Bali" - @downtoearthtravel25, 1,200,000 plays, x134
- "5 must do things to do in / TAKAYAMA Japan" - @m_o_life26, 203,800 plays, x85
- "10 / things you NEED to do in / COSTA RICA" - @yoshandtils, 368,200 plays, x42

**Must / need to / can't miss (imperative)** (n=140)
- "Secret places in italy / i need to see / part. 2" - @globe.tipper, 857,200 plays, x666
- "5 must do things to do in / TAKAYAMA Japan" - @m_o_life26, 203,800 plays, x85
- "The only hotel you need in / greece" - @architinerary, 827,300 plays, x49

**Itinerary / guide / N days / route** (n=131)
- "WHERE TO TRAVEL: / BEST COUNTRIES TO VISIT / BY MONTH" - @travel_guide_g, 6,800,000 plays, x406
- "7 day itinerary / HURGHADA EGYPT" - @maryamontour, 384,400 plays, x44
- "our guide to / SORRENTO, ITALY" - @galswhotravel, 77,100 plays, x36

**Bare place name / few words, no hook (<=4 words)** (n=118)
- "THAILAND" - @destinationdiary_, 1,100,000 plays, x436
- "You" - @dreamrreve, 2,300,000 plays, x196
- "Palermo, Sicily" - @dreamiestdeals, 2,700,000 plays, x39

**Cost reveal / price / budget / free** (n=115)
- ""But London is so expensive"" - @travel_guide_g, 6,000,000 plays, x358
- "Budget-saving / tips / in Japan / Part 1" - @izzy_travels_, 250,100 plays, x134
- "this Airbnb in Sicily, Italy / costs only £43pp per / night" - @thestayarchive, 299,200 plays, x13

**Season / year / month** (n=108)
- "WHERE TO TRAVEL: / BEST COUNTRIES TO VISIT / BY MONTH" - @travel_guide_g, 6,800,000 plays, x406
- "Zanzibar in 2026?" - @sheida.travels, 1,400,000 plays, x100
- "TOP Hurghada hotels / 2026" - @maryamontour, 342,200 plays, x39

**Hotel / Airbnb / where to stay** (n=91)
- "The only hotel you need in / greece" - @architinerary, 827,300 plays, x49
- "Luxury hotels / around the world" - @ineed_tobe.famous67, 1,400,000 plays, x47
- "TOP Hurghada hotels / 2026" - @maryamontour, 342,200 plays, x39

**Part N (series)** (n=86)
- "Secret places in italy / i need to see / part. 2" - @globe.tipper, 857,200 plays, x666
- "Budget-saving / tips / in Japan / Part 1" - @izzy_travels_, 250,100 plays, x134
- "10 must visit cafes in / PARIS / Part. 1" - @travellingcloset1, 964,100 plays, x38

**Identity call-out ("going to X?", "if you are...")** (n=83)
- "Insane lessons first time in / Japan..." - @thejapancodes, 79,500 plays, x28
- "Oh you're going to Greece? / I love Santorini!" - @sheida.travels, 282,200 plays, x20
- "what NOT to do on your / visit to vatican city / save for your next trip so you don't make these mistakes!" - @megs_onthemove, 55,900 plays, x12

**Contains a question mark** (n=71)
- "Zanzibar in 2026?" - @sheida.travels, 1,400,000 plays, x100
- "First Time in Paris? / Here's The Only Itinerary You'll Need" - @parisexplore, 50,000 plays, x11
- "Puglia, Italy? / Here's where to go!!" - @houseofhela_, 2,300,000 plays, x8.03

**Confession / insider truth ("the real reason", "truths")** (n=70)
- "The real reason I packed / up everything and moved / us to Switzerland..." - @angelicauratips, 3,500,000 plays, x80
- "Insane truths why I moved / to Japan..." - @thejapancodes, 142,000 plays, x49
- "How I avoided the / "clueless" tourist look / in Italy..." - @italianinspo, 67,800 plays, x8.65

**Wish I knew / need to know / tips** (n=66)
- "Budget-saving / tips / in Japan / Part 1" - @izzy_travels_, 250,100 plays, x134
- "5 things you NEED to know / before going to Japan" - @soft.nrt, 556,100 plays, x26
- "road trips to take / before you die / part 2" - @aimsi.unfiltered, 289,300 plays, x21

**Local vs tourist** (n=61)
- "Small ways I avoided / looking like a "tourist" / in Italy..." - @italianinspo, 4,600,000 plays, x587
- "TOURIST TRAPS / VS / ALTERNATIVES / ~ Croatia edition ~" - @travel.destinations7, 434,400 plays, x203
- "5 Hidden / Gems in / Osaka / You Can't Miss / Skip the tourist traps. / Discover the real Osaka." - @nearxfar, 165,500 plays, x28

**Ranking / rated / review** (n=57)
- "Ranking Asian / capitals / Pt. 20 Islamabad" - @travel.destinations7, 47,100 plays, x22
- "Rating Activities we did / in Kyoto" - @sxthiya, 341,900 plays, x15
- "RATING / ITALY TRIP / 19 DAYS" - @travel_guide_g, 255,000 plays, x15

**Bucket list / desire ("places I need to see")** (n=57)
- "Secret places in italy / i need to see / part. 2" - @globe.tipper, 857,200 plays, x666
- "rich because I've seen one of the / seven wonders of the world" - @annilee, 58,300 plays, x33
- "Places I want to visit" - @ineed_tobe.famous67, 976,000 plays, x32

**Warning / mistake / what NOT to do** (n=53)
- "Small ways I avoided / looking like a "tourist" / in Italy..." - @italianinspo, 4,600,000 plays, x587
- "TOURIST TRAPS / VS / ALTERNATIVES / ~ Croatia edition ~" - @travel.destinations7, 434,400 plays, x203
- "5 Hidden / Gems in / Osaka / You Can't Miss / Skip the tourist traps. / Discover the real Osaka." - @nearxfar, 165,500 plays, x28

**Photo spots / photo ideas** (n=46)
- "Best Eiffel Tower / photo spots" - @travellingcloset1, 1,900,000 plays, x74
- "Photo ideas to / take in LA" - @avaa.morgann, 249,700 plays, x29
- "my camera roll after road / tripping lofoten, norway" - @aligoingabroad, 303,400 plays, x20

**POV / scenario / "this is your sign"** (n=40)
- "Welcome to the underrated / tropical side of Japan" - @soft.nrt, 9,800,000 plays, x454
- "good morning / LONDON" - @annilee, 357,600 plays, x199
- "THIS IS YOUR SIGN TO BOOK / THE SWIM-UP ROOM" - @travelista.vip, 42,400 plays, x50

**Secret / hidden / underrated** (n=36)
- "Secret places in italy / i need to see / part. 2" - @globe.tipper, 857,200 plays, x666
- "Welcome to the underrated / tropical side of Japan" - @soft.nrt, 9,800,000 plays, x454
- "5 HIDDEN GEMS IN / KYOTO YOU CAN'T / MISS / Skip the crowds. / Experience the real Kyoto." - @nearxfar, 310,400 plays, x53

**Credential ("after 5 years in", "as a local")** (n=34)
- "After travelling to South / Korea for almost 5 years / I made the ultimate travel / guide for you" - @dreamrreve, 209,600 plays, x18
- "pt 2 / PLACES NOT TO SKIP WHEN / VISITING LONDON / guide as a girly who lives here!!" - @livs_london, 786,700 plays, x8.17
- "my camera roll after 2 / weeks in Japan" - @sxthiya, 4,660 plays, x0.21

**No text on cover** (n=20)
- "" - @dreamiestdeals, 4,000,000 plays, x57
- "" - @annilee, 44,000 plays, x25
- "" - @parisexplore, 1,140 plays, x0.26

**Before / after / expectation vs reality** (n=16)
- "my camera roll after road / tripping lofoten, norway" - @aligoingabroad, 303,400 plays, x20
- "The unexpected reality of / moving to Switzerland / ALONE at 35 yrs old..." - @angelicauratips, 430,800 plays, x9.84
- "My Camera Roll after / visiting Japan's most / underrated Prefecture" - @thattravelguy_, 27,200 plays, x3.83

**Objection quote ("but X is so expensive")** (n=12)
- ""But London is so expensive"" - @travel_guide_g, 6,000,000 plays, x358
- "Japan is "dying"... / here is why" - @dreamrreve, 110,400 plays, x9.40
- ""Everything in Paris / is so expensive..."" - @parisexplore, 5,907 plays, x1.33

**Comparison / vs / instead** (n=8)
- "TOURIST TRAPS / VS / ALTERNATIVES / ~ Croatia edition ~" - @travel.destinations7, 434,400 plays, x203
- "you travel to / Japan / not / Japan" - @dreamrreve, 737,600 plays, x63
- "pics I wanted in sevilla / vs / pic I got in sevilla" - @megs_onthemove, 14,400 plays, x3.12

### 1.4 Top 150 by lift (plays >= 50,000; creators with >= 8 covers), verbatim

Text exactly as transcribed; " / " marks a line break on the slide. The
formula column is the regex output for that cover.

| # | xmedian | plays | creator | cover text (verbatim) | formulas |
|---|---|---|---|---|---|
| 1 | x666 | 857,200 | @globe.tipper | Secret places in italy / i need to see / part. 2 | secret_hidden, must, bucket, first_person, part |
| 2 | x587 | 4,600,000 | @italianinspo | Small ways I avoided / looking like a "tourist" / in Italy... | warning, first_person, local_tourist |
| 3 | x563 | 724,600 | @globe.tipper | Secret places in italy / i need to see | secret_hidden, must, bucket, first_person |
| 4 | x454 | 9,800,000 | @soft.nrt | Welcome to the underrated / tropical side of Japan | secret_hidden, pov |
| 5 | x436 | 1,100,000 | @destinationdiary_ | THAILAND | place_only |
| 6 | x406 | 6,800,000 | @travel_guide_g | WHERE TO TRAVEL: / BEST COUNTRIES TO VISIT / BY MONTH | superlative, itinerary, season |
| 7 | x358 | 6,000,000 | @travel_guide_g | "But London is so expensive" | cost, objection |
| 8 | x203 | 434,400 | @travel.destinations7 | TOURIST TRAPS / VS / ALTERNATIVES / ~ Croatia edition ~ | warning, versus, local_tourist |
| 9 | x199 | 357,600 | @annilee | good morning / LONDON | pov |
| 10 | x196 | 2,300,000 | @dreamrreve | You | place_only |
| 11 | x151 | 323,000 | @travel.destinations7 | What most people visit in / Greece | superlative |
| 12 | x149 | 2,500,000 | @travel_guide_g | "but Paris is so expensive" | cost, objection |
| 13 | x134 | 1,200,000 | @downtoearthtravel25 | Top 10 Places to Visit in / Bali | list_n, superlative, plain_recs |
| 14 | x134 | 250,100 | @izzy_travels_ | Budget-saving / tips / in Japan / Part 1 | need_to_know, cost, part |
| 15 | x130 | 278,400 | @travel.destinations7 | Top 10 most beautiful / islands in Europe | list_n, superlative |
| 16 | x113 | 1,900,000 | @travel_guide_g | ITALY TRIP / 19 DAYS | itinerary |
| 17 | x112 | 1,000,000 | @downtoearthtravel25 | Top 10 Most Iconic Places / to Visit / In the UK | list_n, superlative |
| 18 | x101 | 901,900 | @downtoearthtravel25 | Top 10 Things to do in / Corfu Greece | list_n, superlative, plain_recs |
| 19 | x100 | 1,400,000 | @sheida.travels | Zanzibar in 2026? | season, question |
| 20 | x97 | 862,600 | @downtoearthtravel25 | Top 10 Places to Visit in / Portugal | list_n, superlative, plain_recs |
| 21 | x85 | 203,800 | @m_o_life26 | 5 must do things to do in / TAKAYAMA Japan | list_n, must, plain_recs |
| 22 | x80 | 3,500,000 | @angelicauratips | The real reason I packed / up everything and moved / us to Switzerland... | confession, first_person |
| 23 | x76 | 678,100 | @downtoearthtravel25 | Top 10 Places to Visit in / Milan | list_n, superlative, plain_recs |
| 24 | x74 | 1,900,000 | @travellingcloset1 | Best Eiffel Tower / photo spots | superlative, photo |
| 25 | x74 | 176,900 | @m_o_life26 | 5 must do things to do in / HAKONE | list_n, must, plain_recs |
| 26 | x73 | 655,000 | @downtoearthtravel25 | Top 10 Places to Visit in / New Orleans | list_n, superlative, plain_recs |
| 27 | x72 | 643,000 | @downtoearthtravel25 | Stranger Things / Filming Locations / That you can visit! |  |
| 28 | x63 | 737,600 | @dreamrreve | you travel to / Japan / not / Japan | versus |
| 29 | x57 | 4,000,000 | @dreamiestdeals | (no text) | no_text |
| 30 | x53 | 127,600 | @m_o_life26 | must visit places in TOKYO | must |
| 31 | x53 | 310,400 | @nearxfar | 5 HIDDEN GEMS IN / KYOTO YOU CAN'T / MISS / Skip the crowds. / Experience the real Kyoto. | secret_hidden, list_n |
| 32 | x49 | 142,000 | @thejapancodes | Insane truths why I moved / to Japan... | superlative, confession, first_person |
| 33 | x49 | 827,300 | @architinerary | The only hotel you need in / greece | superlative, must, hotel |
| 34 | x48 | 2,100,000 | @travelnova.app | 3 countries you can visit in / 1 trip | list_n |
| 35 | x47 | 547,700 | @dreamrreve | And one day you just decide / to go To Kamakura in Japan / for a walk | pov |
| 36 | x47 | 1,400,000 | @ineed_tobe.famous67 | Luxury hotels / around the world | hotel |
| 37 | x46 | 3,200,000 | @dreamiestdeals | (no text) | no_text |
| 38 | x45 | 404,700 | @downtoearthtravel25 | Top 5 Seaside Places in / the UK | list_n, superlative |
| 39 | x44 | 384,400 | @maryamontour | 7 day itinerary / HURGHADA EGYPT | list_n, itinerary |
| 40 | x43 | 103,600 | @m_o_life26 | 5 things to do in okiniwa. | list_n, plain_recs |
| 41 | x42 | 368,200 | @yoshandtils | 10 / things you NEED to do in / COSTA RICA | list_n, must, plain_recs |
| 42 | x39 | 342,200 | @maryamontour | TOP Hurghada hotels / 2026 | superlative, hotel, season |
| 43 | x39 | 2,700,000 | @dreamiestdeals | Palermo, Sicily | place_only |
| 44 | x38 | 964,100 | @travellingcloset1 | 10 must visit cafes in / PARIS / Part. 1 | list_n, must, part |
| 45 | x37 | 1,100,000 | @ineed_tobe.famous67 | Bahamas | place_only |
| 46 | x36 | 77,100 | @galswhotravel | our guide to / SORRENTO, ITALY | itinerary, first_person |
| 47 | x35 | 313,900 | @downtoearthtravel25 | Top 10 Places to Visit / in Miami Florida | list_n, superlative, plain_recs |
| 48 | x33 | 58,300 | @annilee | rich because I've seen one of the / seven wonders of the world | bucket, first_person |
| 49 | x32 | 976,000 | @ineed_tobe.famous67 | Places I want to visit | bucket, first_person |
| 50 | x29 | 493,500 | @travel_guide_g | Museums in Paris that are free for EU / people under the age of 25. | cost |
| 51 | x29 | 249,700 | @avaa.morgann | Photo ideas to / take in LA | photo |
| 52 | x28 | 165,500 | @nearxfar | 5 Hidden / Gems in / Osaka / You Can't Miss / Skip the tourist traps. / Discover the real Osaka. | secret_hidden, warning, list_n, must, local_tourist |
| 53 | x28 | 79,500 | @thejapancodes | Insane lessons first time in / Japan... | callout, superlative, confession |
| 54 | x28 | 827,300 | @ineed_tobe.famous67 | Places to visit in Paris | plain_recs |
| 55 | x27 | 1,900,000 | @dreamiestdeals | (no text) | no_text |
| 56 | x26 | 311,200 | @dreamrreve | Things you should NEVER do / in Japan / And what you should do instead | warning, versus, must |
| 57 | x26 | 224,800 | @maryamontour | TOP 5 hotels / KRABI THAILAND | list_n, superlative, hotel |
| 58 | x26 | 556,100 | @soft.nrt | 5 things you NEED to know / before going to Japan | need_to_know, list_n, must |
| 59 | x26 | 1,800,000 | @dreamiestdeals | Taormina, Sicily | place_only |
| 60 | x25 | 291,200 | @dreamrreve | 12 / Must do things in / KYOTO | list_n, must, plain_recs |
| 61 | x24 | 68,500 | @thejapancodes | Real spill as a single mom / in Japan... | callout, confession |
| 62 | x23 | 705,300 | @ineed_tobe.famous67 | Castles uneed to visit / once in ur life | bucket |
| 63 | x23 | 208,100 | @downtoearthtravel25 | Top 5 Luxury Hotels in / Benidorm | list_n, superlative, hotel |
| 64 | x22 | 958,500 | @travelnova.app | 3 countries you can visit in / 1 trip | list_n |
| 65 | x22 | 952,900 | @travelnova.app | places in europe with the / best beaches | superlative |
| 66 | x22 | 188,700 | @maryamontour | TOP 10 cities / ITALY | list_n, superlative |
| 67 | x22 | 193,100 | @downtoearthtravel25 | Top 10 Hidden Gems in / Wales / Make sure to add to your / favourites! | secret_hidden, list_n, superlative |
| 68 | x21 | 289,300 | @aimsi.unfiltered | road trips to take / before you die / part 2 | need_to_know, bucket, itinerary, part |
| 69 | x21 | 191,200 | @downtoearthtravel25 | Facts you need to know / about Lake Como | need_to_know, must |
| 70 | x20 | 303,400 | @aligoingabroad | my camera roll after road / tripping lofoten, norway | first_person, before_after, photo |
| 71 | x20 | 282,200 | @sheida.travels | Oh you're going to Greece? / I love Santorini! | callout, first_person, question |
| 72 | x20 | 174,800 | @maryamontour | Places to visit / NEWYORK | plain_recs |
| 73 | x19 | 168,100 | @maryamontour | Places to visit / CORNWALL | plain_recs |
| 74 | x19 | 165,500 | @maryamontour | Top 10 hotels / SHARM EL SHEIKH | list_n, superlative, hotel |
| 75 | x19 | 487,800 | @travellingcloset1 | Lapland / Mini guide / Rovaniemi edition | itinerary |
| 76 | x19 | 479,100 | @travellingcloset1 | 15 things to do in / Paris / Part 1 | list_n, plain_recs, part |
| 77 | x19 | 477,200 | @travellingcloset1 | Best photo spots in / Amalfi Coast | superlative, photo |
| 78 | x18 | 156,200 | @yoshandtils | Top 5 Hiking Spots in the / Peak District | list_n, superlative |
| 79 | x18 | 209,600 | @dreamrreve | After travelling to South / Korea for almost 5 years / I made the ultimate travel / guide for you | superlative, itinerary, first_person, authority |
| 80 | x18 | 51,400 | @thejapancodes | Untold realities visiting / Japan... | confession |
| 81 | x18 | 2,000,000 | @ellastraveldiaries0 | underrated destinations for your / 2026 euro summer / part 4 | secret_hidden, season, part |
| 82 | x17 | 521,600 | @ineed_tobe.famous67 | Activities to do in Lapland / (best trip for this winter) | superlative, plain_recs, season |
| 83 | x17 | 150,100 | @downtoearthtravel25 | Top 10 Traditional Foods / in England | list_n, superlative |
| 84 | x16 | 476,600 | @ineed_tobe.famous67 | Cities to visit during / FALL / Part 2 | season, part |
| 85 | x16 | 262,500 | @travel_guide_g | Beautiful castles and / palaces in Germany | superlative |
| 86 | x16 | 134,700 | @maryamontour | 10 things to do / TOKYO | list_n, plain_recs |
| 87 | x15 | 341,900 | @sxthiya | Rating Activities we did / in Kyoto | ranking, plain_recs, first_person |
| 88 | x15 | 255,000 | @travel_guide_g | RATING / ITALY TRIP / 19 DAYS | ranking, itinerary |
| 89 | x15 | 323,800 | @soft.nrt | 7 must do things in / Tokyo | list_n, must, plain_recs |
| 90 | x15 | 1,700,000 | @ellastraveldiaries0 | places in Italy I desperately need to / visit | bucket, first_person |
| 91 | x14 | 128,500 | @downtoearthtravel25 | Top 5 Most Beautiful / Places in the / Almalfi Coast Italy | list_n, superlative |
| 92 | x14 | 128,400 | @downtoearthtravel25 | Top 10 Places to Visit / In 2026 | list_n, superlative, plain_recs, season |
| 93 | x14 | 168,400 | @dreamrreve | A random place in Japan. |  |
| 94 | x14 | 1,000,000 | @dreamiestdeals | This is your sign to go to Capri | pov |
| 95 | x14 | 605,500 | @travelnova.app | 3 countries you can visit in / 1 trip | list_n |
| 96 | x14 | 414,700 | @ineed_tobe.famous67 | Photos to recreate in LA | photo |
| 97 | x14 | 350,400 | @travellingcloset1 | Amalfi Coast / Trip itinerary / You have to do once in your life | must, bucket, itinerary |
| 98 | x13 | 115,300 | @maryamontour | 10 day itinerary / EGYPT | list_n, itinerary |
| 99 | x13 | 59,600 | @megs_onthemove | the best food spots we visited / in rome / warning: includes A / LOT of pasta | warning, superlative, first_person |
| 100 | x13 | 299,200 | @thestayarchive | this Airbnb in Sicily, Italy / costs only £43pp per / night | cost, superlative, hotel |
| 101 | x13 | 547,000 | @travelnova.app | my euro summer girls trip / itinerary that I would / 100% recommend | itinerary, first_person, season |
| 102 | x12 | 1,800,000 | @itsjustinjapan | whimsical stores to / check out in Tokyo |  |
| 103 | x12 | 266,000 | @soft.nrt | 1 thing you MUST do in / Tokyo | list_n, must, plain_recs |
| 104 | x12 | 144,500 | @dreamrreve | Top 8 / Tokyo night spots / (For pictures) | list_n, superlative, photo |
| 105 | x12 | 106,200 | @maryamontour | Things to do / Kuala Lumpur | plain_recs |
| 106 | x12 | 55,900 | @megs_onthemove | what NOT to do on your / visit to vatican city / save for your next trip so you don't make these mistakes! | warning, callout |
| 107 | x12 | 104,200 | @maryamontour | TOP 5* Hotels / CYPRUS | list_n, superlative, hotel |
| 108 | x12 | 177,600 | @aligoingabroad | My camera roll after going / to the coolest surf town in / Morocco | superlative, first_person, before_after, photo |
| 109 | x12 | 821,600 | @dreamiestdeals | This Is Your Sign To Go To Sardinia | pov |
| 110 | x12 | 83,100 | @luxury.escapes | BEYOND THE MALDIVES: / Overwater Villas You / Should Know About | secret_hidden, need_to_know, must, hotel |
| 111 | x12 | 157,900 | @aimsi.unfiltered | 10 european destinations to / visit in september | list_n, season |
| 112 | x11 | 50,000 | @parisexplore | First Time in Paris? / Here's The Only Itinerary You'll Need | callout, superlative, itinerary, question |
| 113 | x11 | 96,900 | @maryamontour | Free Things to do / PARIS | cost, plain_recs |
| 114 | x11 | 185,100 | @travel_guide_g | "Hotels in Paris are so expensive" | cost, objection, hotel |
| 115 | x11 | 129,400 | @dreamrreve | I travelled to South Korea / many times / So here is for you the / ultimate travel guide / SWIPE FOR MORE | superlative, itinerary, first_person, authority |
| 116 | x11 | 239,200 | @sxthiya | All Inclusive Resort / Review / Barcelo Maya Riviera / Adults Only | ranking, superlative, hotel |
| 117 | x11 | 470,700 | @travelnova.app | the perfect europe / interrail route | superlative, itinerary |
| 118 | x10 | 194,600 | @womenpassport | The best party in Paris is / completely FREE / 21st June, 2026 | cost, superlative, season |
| 119 | x10 | 88,000 | @avaa.morgann | What to do and see in LA, / USA | plain_recs |
| 120 | x9.84 | 430,800 | @angelicauratips | The unexpected reality of / moving to Switzerland / ALONE at 35 yrs old... | confession, before_after |
| 121 | x9.75 | 131,600 | @aimsi.unfiltered | 10 destinations / perfect for 48 hours | list_n, superlative, itinerary |
| 122 | x9.40 | 110,400 | @dreamrreve | Japan is "dying"... / here is why | warning, objection |
| 123 | x9.35 | 175,900 | @womenpassport | Where the girls lunch in / Paris |  |
| 124 | x9.29 | 1,800,000 | @traveltheworldz | Things to do in Rome, / Italy / and how much they cost! | cost, plain_recs |
| 125 | x9.24 | 124,700 | @aimsi.unfiltered | europe's most scenic / train journeys to take / this year | superlative, season |
| 126 | x9.13 | 398,100 | @travelnova.app | places in europe with the / best beaches | superlative |
| 127 | x9.05 | 214,500 | @thestayarchive | this Airbnb in Italy costs / only £60 pp per night / (airbnb at the end) | cost, superlative, hotel |
| 128 | x9.05 | 75,300 | @ig_adelle | Hidden in Venice there's a / stone unlike any other... / it's shaped like a | secret_hidden |
| 129 | x8.97 | 77,500 | @avaa.morgann | Photos to take in / France/Paris | photo |
| 130 | x8.87 | 210,300 | @thestayarchive | This Airbnb in / Rome, Italy is only / £76 pp per night... | cost, superlative, hotel |
| 131 | x8.83 | 123,600 | @sheida.travels | Oh you're going to Cape Verde? / I love Sal! | callout, first_person, question |
| 132 | x8.73 | 76,200 | @yoshandtils | 10 / things to do in / LA FORTUNA / Costa Rica | list_n, plain_recs |
| 133 | x8.69 | 61,700 | @luxury.escapes | When the stay steals the show... / 9 HOTELS THAT ARE / THE DESTINATION | list_n, hotel |
| 134 | x8.65 | 67,800 | @italianinspo | How I avoided the / "clueless" tourist look / in Italy... | warning, confession, first_person, local_tourist |
| 135 | x8.63 | 101,400 | @dreamrreve | Things to do at / night in / BEIJING | plain_recs |
| 136 | x8.61 | 50,100 | @nearxfar | 5 things I wish I knew / before going to Japan / part 16 | need_to_know, list_n, first_person, part |
| 137 | x8.60 | 185,600 | @soft.nrt | 1 thing I HIGHLY recommend / doing in OKINAWA / (more specifically in Naha) | list_n, first_person |
| 138 | x8.59 | 1,400,000 | @adventurers00 | 8 reasons / why you / HAVE / to visit / MONTANA | list_n |
| 139 | x8.58 | 115,800 | @aimsi.unfiltered | 10 greek / island hopping routes / for your next summer | callout, list_n, season |
| 140 | x8.37 | 278,000 | @ohyes.travel | What to do and see in / Rome, Italy | plain_recs |
| 141 | x8.34 | 98,000 | @dreamrreve | After travelling for 5 years / in South Korea / I created the ultimate / travel guide for you | superlative, itinerary, first_person, authority |
| 142 | x8.26 | 1,600,000 | @traveltheworldz | Things to do in Barcelona, / Spain / and how much they cost! | cost, plain_recs |
| 143 | x8.25 | 1,200,000 | @itsjustinjapan | What NOT to do / on your 1st trip / to Japan | warning |
| 144 | x8.19 | 110,500 | @aimsi.unfiltered | the milos guide / you'll actually need | itinerary |
| 145 | x8.17 | 786,700 | @livs_london | pt 2 / PLACES NOT TO SKIP WHEN / VISITING LONDON / guide as a girly who lives here!! | warning, callout, must, itinerary, authority, local_tourist, part |
| 146 | x8.03 | 2,300,000 | @houseofhela_ | Puglia, Italy? / Here's where to go!! | callout, question |
| 147 | x7.96 | 907,600 | @ellastraveldiaries0 | 2 countries in 1 trip / part 1 | list_n, part |
| 148 | x7.92 | 237,900 | @ineed_tobe.famous67 | Cities / to / visit / during / FALL | season |
| 149 | x7.87 | 174,000 | @sxthiya | Make Charm Bracelets / with us in Tokyo! | first_person |
| 150 | x7.82 | 172,900 | @sxthiya | Visiting Japan in the / Summer? / Tips + Must Haves | need_to_know, must, season, question |

---

## 2. Hebrew: 613 travel covers, 411 creators, search cross-section

Hebrew travel covers: 613, creators: 411, median ln(plays/followers) = 2.477 (plays = x11.9 followers)

Source: `harvest/he-search/` (hits.json + codes.json + coded/*.jsonl), kind =
travel, language he or mixed, followers >= 200. Measure = ln(plays /
followers) minus the set median; x2.0 = twice the typical plays-per-follower
of the set. **Weaker design than English**: 411 creators for 613 covers means
most creators appear once, so "creators beat" compares a creator to the whole
set, not to their own baseline, and the within-creator contrast rests on the
few creators who appear several times (the last column, usually 5-40
creators). Search results also favour posts that already did well. Clusters
adapted to Hebrew: "המלצות ל<place>" (the dominant Hebrew format), "טסים
ל...?", "כמה עלה לנו", "אסור לכם לפספס" (FOMO, separated from real
warnings), save call-to-action. Hebrew phrases often break across slide
lines, so matching is done on the text with line breaks joined.

### 2.1 The cluster table

| formula | n | in top 150 (over-rep.) | creators | median | % beat median | creators beat (sign p) | within-creator contrast [95% CI], creators won |
|---|---|---|---|---|---|---|---|
| Plain "המלצות ל<place>" | 199 | 58 (1.19) | 167 | x1.33 | 57% | 96/167 (p=0.063) | x1.47 [x0.88, x2.44], 14/25 |
| List of N / Top N (digit on cover) | 175 | 44 (1.03) | 121 | x0.98 | 50% | 60/121 (p=1) | x1.45 [x0.92, x2.18], 22/37 |
| Must / worth / don't miss (חובה, שווה, אסור לפספס) | 156 | 48 (1.26) | 125 | x1.39 | 58% | 72/125 (p=0.11) | x0.67 [x0.38, x1.02], 15/40 |
| Contains a question mark | 123 | 28 (0.93) | 101 | x1.02 | 50% | 53/101 (p=0.69) | x0.82 [x0.56, x1.23], 19/42 |
| Superlative (הכי / המושלם / זהב) | 93 | 18 (0.79) | 75 | x0.78 | 47% | 35/75 (p=0.64) | x0.65 [x0.44, x1.08], 10/28 |
| Itinerary / route / N days | 92 | 18 (0.80) | 62 | x0.65 | 45% | 29/62 (p=0.7) | x1.06 [x0.73, x1.73], 12/24 |
| Identity call-out ("טסים ל...?", "כל מי שטס") | 87 | 38 (1.78) | 73 | x2.97 | 62% | 43/73 (p=0.16) | x1.63 [x0.98, x2.98], 15/25 |
| First person (אני / שלי / אנחנו / עשינו) | 79 | 22 (1.14) | 74 | x1.00 | 51% | 38/74 (p=0.91) | x0.93 [x0.53, x1.76], 13/25 |
| Save call to action (שמרו / תשמרו) | 75 | 18 (0.98) | 52 | x0.87 | 48% | 24/52 (p=0.68) | x0.94 [x0.52, x1.48], 7/15 |
| Wish I knew / before you fly / tips | 65 | 19 (1.19) | 56 | x0.90 | 49% | 28/56 (p=1) | x1.01 [x0.56, x1.75], 10/21 |
| Cost reveal / price ("כמה עלה לנו") | 55 | 10 (0.74) | 34 | x1.08 | 53% | 19/34 (p=0.61) | x1.67 [x1.07, x2.58], 10/17 |
| Hotel / resort | 51 | 11 (0.88) | 44 | x1.46 | 63% | 29/44 (p=0.049) | x1.33 [x0.66, x2.67], 11/19 |
| Warning / mistake / what NOT to do | 38 | 9 (0.97) | 31 | x0.88 | 47% | 14/31 (p=0.72) | x1.41 [x0.69, x2.70], 12/18 |
| Part N (חלק) | 34 | 14 (1.68) | 27 | x1.95 | 62% | 17/27 (p=0.25) | x0.83 [x0.37, x1.71], 6/12 |
| Secret / not everyone knows | 28 | 8 (1.17) | 23 | x1.43 | 61% | 15/23 (p=0.21) | x0.85 [x0.49, x2.15], 4/9 |
| POV / scenario ("כאן כדי להזכיר", "מי ידע") | 22 | 10 (1.86) | 20 | x2.38 | 68% | 14/20 (p=0.12) | x1.05 [x0.39, x5.59], 2/5 |
| Season / year / holiday | 22 | 3 (0.56) | 17 | x0.43 | 36% | 6/17 (p=0.33) | x0.87 [x0.37, x2.77], 6/10 |
| Bare place name / few words, no hook (<=4 words) | 22 | 3 (0.56) | 19 | x0.34 | 32% | 6/19 (p=0.17) | x0.74 [x0.49, x1.88], 2/5 |
| Ranking / rating (מדרגת, דירוג) | 19 | 5 (1.08) | 18 | x2.61 | 74% | 13/18 (p=0.096) | x0.96 [x0.32, x2.74], 3/5 |
| Confession / honest ("האמת", "שיקרתי") | 14 | 8 (2.34) | 11 | x4.19 | 79% | 8/11 (p=0.23) | x0.76 [x0.12, x4.82], 2/4 |
| Credential ("אחרי 3 פעמים", "בתור מישהי ש") | 13 | 7 (2.20) | 13 | x5.12 | 77% | 10/13 (p=0.092) | x0.74 [x0.19, x3.88], 2/5 |
| Comparison / "it is not the Maldives" / Google vs reality | 7 | 5 (2.92) | 6 | x19 | 71% | 4/6 (p=0.69) | - (too few creators) |
| Objection / question quote (starts with a quote) | 7 | 3 (1.75) | 6 | x1.07 | 57% | 3/6 (p=1) | x1.48 [x0.54, x7.48], 2/3 |
| Local vs tourist | 6 | 0 (0.00) | 4 | x1.10 | 50% | 2/4 (p=1) | x1.69 [x0.57, x2.09], 2/3 |
| Before/after / Google vs reality | 1 | 1 (4.09) | 1 | x11 | 100% | 1/1 (p=1) | - (too few creators) |

What it says:

* **Hotel** is the only Hebrew formula whose creator count clears p<0.05
  (29 of 44, x1.46), the same direction as English (15 of 20). Two
  independent samples agree.
* **"המלצות ל<place>"** (plain recommendations): 96 of 167 creators above
  the set median (p=0.06), x1.33. The plain format again, as in English.
* **Identity call-out ("טסים ל...?", "כל מי שטס ל...")**: x2.97 median, 62%
  above, 43 of 73 creators, within-creator contrast x1.63 [x0.98, x2.98].
  Directional in both languages; never quite clears the bar in either.
* **Cost reveal**: within-creator contrast x1.67 [x1.07, x2.58], the only
  Hebrew contrast whose interval excludes 1; the narrow phrase "כמה עלה/עלו
  לנו" sits at x5.3 with 7 of 9 creators above. Strong per post, small n.
* **Secret ("לא כולם מכירים", "בטוח לא מכירים")**: x1.43, 15 of 23, but the
  within-creator contrast is flat (4 of 9). The English signal does not
  replicate cleanly in Hebrew; the #1 Hebrew cover is a secret hook (x137)
  and pulls the median.
* **High medians on tiny clusters**: comparison (x19, n=7), credential
  "אחרי 3 פעמים ברומא" (x5.1, n=13), confession "תגובתי הכנה" (x4.2, n=14),
  ranking "מדרגת" (x2.6, n=19). All small, all inside the noise band of
  section 4.
* **Flat or negative**: superlative "הכי" x0.78 (35 of 75), itinerary x0.65,
  season x0.43, bare place name x0.34, save call-to-action x0.87, warning
  proper ("אל תטוסו", "טעויות") x0.88. Note the split: FOMO "אסור לכם
  לפספס" x1.97 vs real warning x0.76 (narrow table). "הלוואי שידעתי" is
  x9.7 but on 6 covers from 6 creators, 4 above: the earlier x13.8 claim in
  COVERS-HE.md rests on n=6 and should be read that way.

### 2.2 Narrow phrases (Hebrew)

| phrase | n | creators | median | % beat median | creators beat |
|---|---|---|---|---|---|
| "המלצות ל..." | 75 | 64 | x1.19 | 55% | 37/64 (p=0.26) |
| "טסים ל...?" | 33 | 26 | x2.97 | 67% | 16/26 (p=0.33) |
| "כמה עלה/עלו לנו" | 9 | 9 | x5.28 | 78% | 7/9 (p=0.18) |
| "הלוואי (שהייתי יודע/ת)" | 6 | 6 | x9.74 | 67% | 4/6 (p=0.69) |
| "לפני שטסים/לפני שאתם" | 30 | 26 | x1.16 | 57% | 15/26 (p=0.56) |
| "לא מכירים / לא כולם מכירים" | 5 | 5 | x2.71 | 60% | 3/5 (p=1) |
| "אסור לכם לפספס" | 27 | 22 | x1.97 | 59% | 14/22 (p=0.29) |
| "אסור/אל ת... (warning, not FOMO)" | 32 | 26 | x0.76 | 44% | 10/26 (p=0.33) |
| "הכי" | 75 | 67 | x0.88 | 49% | 32/67 (p=0.81) |
| "מלון/מלונות" | 37 | 34 | x1.67 | 65% | 23/34 (p=0.058) |
| "מדרג/דירוג" | 12 | 12 | x1.10 | 58% | 7/12 (p=0.77) |
| "תשמרו/שמרו" | 73 | 50 | x0.87 | 48% | 23/50 (p=0.67) |
| "חלק N" | 34 | 27 | x1.95 | 62% | 17/27 (p=0.25) |
| "N דברים" | 21 | 18 | x3.60 | 62% | 10/18 (p=0.81) |
| "טיפים" | 26 | 23 | x1.17 | 58% | 14/23 (p=0.4) |
| "מסלול" | 16 | 13 | x1.04 | 50% | 6/13 (p=1) |
| "pov" | 4 | 4 | x4.09 | 75% | 3/4 (p=0.62) |

### 2.3 Robustness: plays/followers favours small accounts

The ratio measure assumes plays scale 1:1 with followers. They do not here:

slope of ln(plays) on ln(followers) = 0.23 (1.0 would mean the ratio is size-neutral)

| formula | n | median (ratio measure) | median (residual measure) | % beat (residual) |
|---|---|---|---|---|
| Secret / not everyone knows | 28 | x1.43 | x1.32 | 54% |
| Warning / mistake / what NOT to do | 38 | x0.88 | x0.95 | 50% |
| Wish I knew / before you fly / tips | 65 | x0.90 | x0.68 | 43% |
| Cost reveal / price ("כמה עלה לנו") | 55 | x1.08 | x1.86 | 62% |
| Identity call-out ("טסים ל...?", "כל מי שטס") | 87 | x2.97 | x2.46 | 62% |
| Comparison / "it is not the Maldives" / Google vs reality | 7 | x19 | x8.93 | 71% |
| Ranking / rating (מדרגת, דירוג) | 19 | x2.61 | x1.10 | 63% |
| Objection / question quote (starts with a quote) | 7 | x1.07 | x0.87 | 43% |
| POV / scenario ("כאן כדי להזכיר", "מי ידע") | 22 | x2.38 | x1.84 | 77% |
| List of N / Top N (digit on cover) | 175 | x0.98 | x0.94 | 48% |
| Superlative (הכי / המושלם / זהב) | 93 | x0.78 | x0.91 | 49% |
| Must / worth / don't miss (חובה, שווה, אסור לפספס) | 156 | x1.39 | x1.31 | 56% |
| Plain "המלצות ל<place>" | 199 | x1.33 | x1.44 | 59% |
| Itinerary / route / N days | 92 | x0.65 | x0.71 | 43% |
| Hotel / resort | 51 | x1.46 | x1.56 | 59% |
| Confession / honest ("האמת", "שיקרתי") | 14 | x4.19 | x3.96 | 64% |
| First person (אני / שלי / אנחנו / עשינו) | 79 | x1.00 | x1.05 | 52% |
| Credential ("אחרי 3 פעמים", "בתור מישהי ש") | 13 | x5.12 | x2.28 | 77% |
| Local vs tourist | 6 | x1.10 | x0.89 | 50% |
| Season / year / holiday | 22 | x0.43 | x1.25 | 55% |
| Save call to action (שמרו / תשמרו) | 75 | x0.87 | x1.32 | 56% |
| Contains a question mark | 123 | x1.02 | x0.94 | 48% |
| Part N (חלק) | 34 | x1.95 | x1.08 | 53% |
| Bare place name / few words, no hook (<=4 words) | 22 | x0.34 | x0.30 | 36% |

With a slope of 0.23, an account with 10x the followers gets only ~1.7x the
plays, so the ratio rewards small accounts. The residual measure (plays
relative to what that account size predicts) keeps the direction of call-out,
secret, hotel, plain recommendations, cost, POV and comparison, and removes
most of the edge of ranking (x2.6 to x1.1), credential (x5.1 to x2.3) and
"חלק N" (x1.95 to x1.08): those were partly small-account effects.

### 2.4 Three verbatim examples per formula

**Plain "המלצות ל<place>"** (n=199)
- "המלצות לאילת / 🌊🐬🍦👙🍉☀️🌴" - @lee.sharabii8, 229,300 plays, x33
- "טסים ללימסול? / קחו כמה המלצות שוות 😘" - @lian.talker, 118,700 plays, x31
- "המלצות למקומות שאתם חייבים להכיר / לביקור הקרוב שלכם בקפריסין! / חלק 3" - @larnaca_israel, 73,100 plays, x27

**List of N / Top N (digit on cover)** (n=175)
- ""מה עושים 5 ימים בפראג לא משעמם שם?" / לא!!!!" - @liri.turgeman, 641,000 plays, x56
- "10 מקומות שווים באילת / ששווה לשמור לפעם הבאה 👣 / כולל כאלה שלא כולם מכירים 🤫" - @topaztravel, 416,700 plays, x36
- "המלצות לאילת חלק 2 / [?]" - @lee.sharabii8, 196,600 plays, x28

**Must / worth / don't miss (חובה, שווה, אסור לפספס)** (n=156)
- "מקומות שאסור לכם / לפספס בפראג🇨🇿" - @danaaviv, 208,800 plays, x40
- "10 מקומות שווים באילת / ששווה לשמור לפעם הבאה 👣 / כולל כאלה שלא כולם מכירים 🤫" - @topaztravel, 416,700 plays, x36
- "טסים ללימסול? / קחו כמה המלצות שוות 😘" - @lian.talker, 118,700 plays, x31

**Contains a question mark** (n=123)
- ""מה עושים 5 ימים בפראג לא משעמם שם?" / לא!!!!" - @liri.turgeman, 641,000 plays, x56
- "אז כן זה [?] לא במלדיביים" - @amor_cohen, 132,100 plays, x31
- "טסים ללימסול? / קחו כמה המלצות שוות 😘" - @lian.talker, 118,700 plays, x31

**Superlative (הכי / המושלם / זהב)** (n=93)
- "האטרקציות הכי שוות באילת / 🎡🐚🐠☀️🐬🤿" - @lee.sharabii8, 196,100 plays, x28
- "המלצות למקומות שאתם חייבים להכיר / לביקור הקרוב שלכם בקפריסין! / חלק 3" - @larnaca_israel, 73,100 plays, x27
- "המלון הכי / מיוחד שהיית בו!! / 🌺✨" - @kamihotel, 197,100 plays, x24

**Itinerary / route / N days** (n=92)
- ""מה עושים 5 ימים בפראג לא משעמם שם?" / לא!!!!" - @liri.turgeman, 641,000 plays, x56
- "קבלו מסלול מושלם לחודש / בתאילנד / 🏝️✨🌅🪸🐠🐚🍍 / <<<< / תעקבו לעוד המלצות 😊" - @travel.with.dorina, 292,000 plays, x21
- "כמה עלה לנו 3 שבועות / בתאילנד 🌴👙☀️" - @eden_amar22, 521,500 plays, x20

**Identity call-out ("טסים ל...?", "כל מי שטס")** (n=87)
- "טסים ללימסול? / קחו כמה המלצות שוות 😘" - @lian.talker, 118,700 plays, x31
- "5 דברים שאסור / לעשות בתאילנד / תשמרו אם אתם / טסים בקרוב" - @traberg6, 636,900 plays, x26
- "טסים לקפריסין בקרוב? / אלה החופים שאתם צריכים לשמור 📌" - @larnaca_israel, 68,700 plays, x25

**First person (אני / שלי / אנחנו / עשינו)** (n=79)
- "טיפים שהלוואי והייתי יודע / לפני : / תאילנד 🇹🇭" - @daniel.a.levi, 204,700 plays, x45
- "אני מרגישה כאילו הגעתי לעיירה / קטנה באיטליה. / תמשיכו לדפדף🫴🏻" - @edenganon20, 277,900 plays, x34
- "דברים שהלוואי שהייתי יודעת לפני / שטסתי לתאילנד #חלק1" - @chanelavramov, 873,500 plays, x22

**Save call to action (שמרו / תשמרו)** (n=75)
- "10 מקומות שווים באילת / ששווה לשמור לפעם הבאה 👣 / כולל כאלה שלא כולם מכירים 🤫" - @topaztravel, 416,700 plays, x36
- "5 דברים שאסור / לעשות בתאילנד / תשמרו אם אתם / טסים בקרוב" - @traberg6, 636,900 plays, x26
- "טסים לקפריסין בקרוב? / אלה החופים שאתם צריכים לשמור 📌" - @larnaca_israel, 68,700 plays, x25

**Wish I knew / before you fly / tips** (n=65)
- "טיפים שהלוואי והייתי יודע / לפני : / תאילנד 🇹🇭" - @daniel.a.levi, 204,700 plays, x45
- "דברים שהלוואי שהייתי יודעת לפני / שטסתי לתאילנד #חלק1" - @chanelavramov, 873,500 plays, x22
- "10 / הטיפים הכי חשובים לפני / שמתכננים טיול ליפן🤩🗾⛩️ / ⬅️⬅️⬅️" - @lotemraban, 35,800 plays, x15

**Cost reveal / price ("כמה עלה לנו")** (n=55)
- "כמה עלה לנו 3 שבועות / בתאילנד 🌴👙☀️" - @eden_amar22, 521,500 plays, x20
- "מחירים מצחיקים לטיסות בחברת / וויז אייר! / שעות טיסה מעולות" - @flyandsavee, 125,200 plays, x19
- "כמה עלה לנו חודש בתאילנד / כולל הכל / <<<<<<<<<<<< / 🐠🐠🐠🐠🐠🐠 / תעקבו לעוד המלצות ותוכן ✨" - @travel.with.dorina, 261,800 plays, x18

**Hotel / resort** (n=51)
- "זה המלון שאתם בטוח לא מכירים / וכן - זה בישראל !!! 😱" - @lee.ohana4, 901,100 plays, x137
- "המלון הכי / מיוחד שהיית בו!! / 🌺✨" - @kamihotel, 197,100 plays, x24
- "תכירו את המלון החדש מרשת / ישרוטל / שתרגישו בו - כאילו טסתם / לטוסקנה [?]" - @edenganon20, 156,300 plays, x19

**Warning / mistake / what NOT to do** (n=38)
- "5 דברים שאסור / לעשות בתאילנד / תשמרו אם אתם / טסים בקרוב" - @traberg6, 636,900 plays, x26
- "5 טעויות שאסור לכם לעשות / לפני ההגעה לזנזיבר❌" - @lets__travel1, 125,700 plays, x23
- "日本 / דברים שלא צריך להביא / ליפן" - @ronbushkin, 68,700 plays, x22

**Part N (חלק)** (n=34)
- "המלצות לאילת חלק 2 / [?]" - @lee.sharabii8, 196,600 plays, x28
- "המלצות למקומות שאתם חייבים להכיר / לביקור הקרוב שלכם בקפריסין! / חלק 3" - @larnaca_israel, 73,100 plays, x27
- "דברים שהלוואי שהייתי יודעת לפני / שטסתי לתאילנד #חלק1" - @chanelavramov, 873,500 plays, x22

**Secret / not everyone knows** (n=28)
- "זה המלון שאתם בטוח לא מכירים / וכן - זה בישראל !!! 😱" - @lee.ohana4, 901,100 plays, x137
- "10 מקומות שווים באילת / ששווה לשמור לפעם הבאה 👣 / כולל כאלה שלא כולם מכירים 🤫" - @topaztravel, 416,700 plays, x36
- "המלצות זהב / לתאילנד / 2026 / שיצילו אותכם / מבטיחה!!! / מי שרוצה שאצרף לו הכל מסודר / או שאלות בכיף אפשר לרשום / בתגובות💫" - @sivanii7, 98,500 plays, x16

**POV / scenario ("כאן כדי להזכיר", "מי ידע")** (n=22)
- "כאן כדי להזכיר לכם איך נראית / חופשה בלפקדה יוון.." - @saraishaul92, 216,100 plays, x55
- "מי ידע שפאפוס כזאת יפה" - @ziv_adler, 282,500 plays, x43
- "אני מרגישה כאילו הגעתי לעיירה / קטנה באיטליה. / תמשיכו לדפדף🫴🏻" - @edenganon20, 277,900 plays, x34

**Season / year / holiday** (n=22)
- "אם אתם מחפשים יעד זול !!! / בשביל לחדש ארון לכבוד השנה / החדשה / לאכול ופשוט לנוח מהחגים 🐣" - @batelshemtov6, 72,400 plays, x16
- "המלצות זהב / לתאילנד / 2026 / שיצילו אותכם / מבטיחה!!! / מי שרוצה שאצרף לו הכל מסודר / או שאלות בכיף אפשר לרשום / בתגובות💫" - @sivanii7, 98,500 plays, x16
- "המלצות לבודפשט מהלב!!!! / (יעד מושלם במיוחד לשומרי / כשרות) / 2026/12/22" - @shiravideosh1t, 57,500 plays, x5.87

**Bare place name / few words, no hook (<=4 words)** (n=22)
- "פאפוסססס 🍸🪩✨" - @maya_admoni, 190,600 plays, x52
- "Batumi / באטומי" - @idan_netter, 78,600 plays, x25
- "🪬 הריביירה של אתונה בתמונות" - @kaviarjewelry, 41,100 plays, x2.45

**Ranking / rating (מדרגת, דירוג)** (n=19)
- "מקומות שהייתי בקוסמוי והדירוג / שלהם:" - @_may_yamin, 59,900 plays, x20
- "מדרגת מקומות בדרום אמריקה / והמלצות🇲🇽🇧🇷🇨🇱🇦🇷" - @koren.steinberg, 91,300 plays, x17
- "שיקרתי למלונות בתאילנד / שבאנו לירח דבש / מדרגת מה הביאו לנו" - @romybenzeev, 214,000 plays, x12

**Confession / honest ("האמת", "שיקרתי")** (n=14)
- "שיקרתי למלונות בתאילנד / שבאנו לירח דבש / מדרגת מה הביאו לנו" - @romybenzeev, 214,000 plays, x12
- "חודש בתאילנד לזוג עלה לנו🌴🦀💦 / ורק את האמת!!! / ⬅️⬅️⬅️⬅️" - @aviva_levi_, 111,100 plays, x9.10
- "Pov: ״נתקעת״ בלונדון קצת יותר ממה [?] / אז המלצות אמיתיות מהלב" - @yarinaviv, 18,000 plays, x6.93

**Credential ("אחרי 3 פעמים", "בתור מישהי ש")** (n=13)
- "כל מי שטס לרומא זה בשבילכם✨ / אז אחרי 3 פעמים ברומא / ואינסוף פעמים באיטליה / החלטתי לעשות המלצות / על מקומות שלא הייתי ממליצה / לפספס ברומא! / Roma🇮🇹" - @nili_mediuoni, 66,500 plays, x15
- "✨המלצות לרומא✨ / ממישהי שהייתה שם 3 פעמים" - @_noadekel_, 53,200 plays, x12
- "אז כמה עלה לי הטיול / הגדול במזרח? ✈️ / 4 וחצי חודשים ב5 מדינות / [?]" - @kellyfarhan, 37,000 plays, x12

**Comparison / "it is not the Maldives" / Google vs reality** (n=7)
- "זה המלון שאתם בטוח לא מכירים / וכן - זה בישראל !!! 😱" - @lee.ohana4, 901,100 plays, x137
- "אני מרגישה כאילו הגעתי לעיירה / קטנה באיטליה. / תמשיכו לדפדף🫴🏻" - @edenganon20, 277,900 plays, x34
- "אז כן זה [?] לא במלדיביים" - @amor_cohen, 132,100 plays, x31

**Objection / question quote (starts with a quote)** (n=7)
- ""מה עושים 5 ימים בפראג לא משעמם שם?" / לא!!!!" - @liri.turgeman, 641,000 plays, x56
- ""מה יש לעשות בקו סמוי?" / תגובתי הכנה:" - @romybenzeev, 127,300 plays, x7.07
- "”מה כבר יש לעשות / בניו יורק?”" - @hatiyul, 9,422 plays, x1.07

**Local vs tourist** (n=6)
- "כולם מכירים את בנגקוק של התיירים / הנה הצד שאף אחד לא מגלה לכם / תשמרו לטיול הבא שלכם לתאילנד" - @maoravinoam, 193,900 plays, x3.61
- "איך לבלות את היום המושלם / בלונדון - המלצות של מקומית!" - @noamontour, 3,863 plays, x1.44
- "New York City / כל מה שחייבים לעשות בניו יורק / חובה לראות / פסל החירות ואליס איילנד / סנטרל פארק / טיימס סקוור / גשר ברוקלין / אמפייר סטייט בילדינג / מוזיאון המטרופוליטן לאמנות / תיאטראות ברודוויי / אנדרטה ומוזיאון ה-11 בספטמבר / גן החיות של הברונקס / חובה לאכול / פיצה ב-Joe’s Pizza / נקניקייה ב-Gray’s Papaya / בייגל ב-Russ & Daughters / כריך פסטרמה ב-Katz’s Delicatessen / עוגת גבינה ב-Junior’s / חובה לקנות / לבוש מעצבים / מזכרות בנושא ניו יורק / שוקולדי גורמה / תקליטי ויניל / מוצרי ספורט / אמנות ועבודות יד מקומיות / אלקטרוניקה / חובה לחוות / צפייה בהקלטה חיה של תוכניות כמו SNL / משחק של הניקס במדיסון סקוור גארדן / הצגה בברודווי / החללים הפנימיים המרשימים של הספרייה הציבורית של ניו יורק / גלריות ואמנות רחוב בבושוויק / חובה לעשות / שייט קיאקים בנהר ההדסון / טיול לאורך ההיי ליין / טיפוס על בניין (City Climb) / הליכה לרוחב גשר ברוקלין / נסיעה בסאבוויי מתחנת גראנד סנטרל / החלקה על הקרח במרכז רוקפלר / ביקור במוזיאון האמריקאי לתולדות הטבע / צפייה במשחק בייסבול / הזמן הטוב ביותר לבקר / מרץ עד נובמבר / עלות ממוצעת לאדם / 12,000₪ - 15,000₪ לאדם עבור / עבור 4 לילות/5 ימים / שמרו את הפוסט" - @goneneliyahu, 25,100 plays, x0.84

**Before/after / Google vs reality** (n=1)
- "יעדים בטיול שלי / בגוגל --> במציאות / והדירוגים שלהם / מאחד עד עשר" - @dani333ela1, 33,700 plays, x11

### 2.5 Top 150 Hebrew travel covers by plays/followers, verbatim

| # | x set median | plays | followers | creator | cover text (verbatim) | formulas |
|---|---|---|---|---|---|---|
| 1 | x137 | 901,100 | 553 | @lee.ohana4 | זה המלון שאתם בטוח לא מכירים / וכן - זה בישראל !!! 😱 | secret_hidden, versus, hotel |
| 2 | x56 | 641,000 | 959 | @liri.turgeman | "מה עושים 5 ימים בפראג לא משעמם שם?" / לא!!!! | objection, list_n, itinerary, question |
| 3 | x55 | 216,100 | 331 | @saraishaul92 | כאן כדי להזכיר לכם איך נראית / חופשה בלפקדה יוון.. | pov |
| 4 | x52 | 190,600 | 310 | @maya_admoni | פאפוסססס 🍸🪩✨ | place_only |
| 5 | x45 | 204,700 | 384 | @daniel.a.levi | טיפים שהלוואי והייתי יודע / לפני : / תאילנד 🇹🇭 | need_to_know, first_person |
| 6 | x43 | 282,500 | 551 | @ziv_adler | מי ידע שפאפוס כזאת יפה | pov |
| 7 | x40 | 208,800 | 437 | @danaaviv | מקומות שאסור לכם / לפספס בפראג🇨🇿 | must |
| 8 | x36 | 416,700 | 983 | @topaztravel | 10 מקומות שווים באילת / ששווה לשמור לפעם הבאה 👣 / כולל כאלה שלא כולם מכירים 🤫 | secret_hidden, list_n, must, save_cta |
| 9 | x34 | 277,900 | 695 | @edenganon20 | אני מרגישה כאילו הגעתי לעיירה / קטנה באיטליה. / תמשיכו לדפדף🫴🏻 | versus, pov, first_person |
| 10 | x33 | 229,300 | 580 | @lee.sharabii8 | המלצות לאילת / 🌊🐬🍦👙🍉☀️🌴 | plain_recs |
| 11 | x31 | 132,100 | 354 | @amor_cohen | אז כן זה [?] לא במלדיביים | versus, question |
| 12 | x31 | 118,700 | 321 | @lian.talker | טסים ללימסול? / קחו כמה המלצות שוות 😘 | callout, must, plain_recs, question |
| 13 | x28 | 196,600 | 580 | @lee.sharabii8 | המלצות לאילת חלק 2 / [?] | list_n, plain_recs, question, part |
| 14 | x28 | 196,100 | 580 | @lee.sharabii8 | האטרקציות הכי שוות באילת / 🎡🐚🐠☀️🐬🤿 | superlative, must |
| 15 | x27 | 74,000 | 227 | @larnaca_israel | מקומות שאסור לכם לפספס לפני / החופשה הבאה שלכם בלרנקה📍 | must |
| 16 | x27 | 73,100 | 227 | @larnaca_israel | המלצות למקומות שאתם חייבים להכיר / לביקור הקרוב שלכם בקפריסין! / חלק 3 | list_n, superlative, must, plain_recs, part |
| 17 | x26 | 636,900 | 2,080 | @traberg6 | 5 דברים שאסור / לעשות בתאילנד / תשמרו אם אתם / טסים בקרוב | warning, callout, list_n, save_cta |
| 18 | x25 | 68,700 | 227 | @larnaca_israel | טסים לקפריסין בקרוב? / אלה החופים שאתם צריכים לשמור 📌 | callout, must, save_cta, question |
| 19 | x25 | 78,600 | 266 | @idan_netter | Batumi / באטומי | place_only |
| 20 | x24 | 96,300 | 337 | @moshe.lion.haviv | טסים לרומא? 🇮🇹 / תשמרו את הסרטון >> | callout, save_cta, question |
| 21 | x24 | 197,100 | 690 | @kamihotel | המלון הכי / מיוחד שהיית בו!! / 🌺✨ | superlative, hotel |
| 22 | x24 | 63,300 | 224 | @eynavcohen_ | המלצות לחופשה / בפאפוס קפריסין / 🏝️🐳🦋🩵 | plain_recs |
| 23 | x23 | 125,700 | 450 | @lets__travel1 | 5 טעויות שאסור לכם לעשות / לפני ההגעה לזנזיבר❌ | warning, list_n |
| 24 | x23 | 60,700 | 222 | @sun_shine.nails | למה שווה להגיע לבטומי? | must, question |
| 25 | x22 | 873,500 | 3,264 | @chanelavramov | דברים שהלוואי שהייתי יודעת לפני / שטסתי לתאילנד #חלק1 | need_to_know, callout, list_n, first_person, part |
| 26 | x22 | 68,700 | 258 | @ronbushkin | 日本 / דברים שלא צריך להביא / ליפן | warning |
| 27 | x22 | 126,700 | 481 | @orcooper6 | ריכזתי לכם את כל / ההמלצות לקוסמוי / ✈️🩵✨🌞🧃 | plain_recs, first_person |
| 28 | x21 | 103,000 | 414 | @sapirberko | טסים לפאפוס בקרוב? / 🪸🐬🐚👙⛱️ / דפדפו להמלצות שלא תרצו / לפספס >> / שמרו את הסרטון 🌞 | callout, must, plain_recs, save_cta, question |
| 29 | x21 | 65,800 | 267 | @imbardarmon | טסים לאיה נאפה בקרוב ? | callout, question |
| 30 | x21 | 292,000 | 1,195 | @travel.with.dorina | קבלו מסלול מושלם לחודש / בתאילנד / 🏝️✨🌅🪸🐠🐚🍍 / <<<< / תעקבו לעוד המלצות 😊 | plain_recs, itinerary |
| 31 | x20 | 521,500 | 2,147 | @eden_amar22 | כמה עלה לנו 3 שבועות / בתאילנד 🌴👙☀️ | cost, list_n, itinerary |
| 32 | x20 | 59,900 | 251 | @_may_yamin | מקומות שהייתי בקוסמוי והדירוג / שלהם: | ranking, first_person |
| 33 | x19 | 126,300 | 561 | @danielle.nakel | 12 דברים שלא הייתי / מפספסת ביפן: | list_n, first_person |
| 34 | x19 | 156,300 | 695 | @edenganon20 | תכירו את המלון החדש מרשת / ישרוטל / שתרגישו בו - כאילו טסתם / לטוסקנה [?] | versus, pov, hotel, question |
| 35 | x19 | 101,000 | 450 | @lets__travel1 | 7 אטרקציות שאסור לכם / לפספס🌟 / Dubai🥂 / Hen_travels | list_n, must |
| 36 | x19 | 125,200 | 568 | @flyandsavee | מחירים מצחיקים לטיסות בחברת / וויז אייר! / שעות טיסה מעולות | cost |
| 37 | x18 | 261,800 | 1,195 | @travel.with.dorina | כמה עלה לנו חודש בתאילנד / כולל הכל / <<<<<<<<<<<< / 🐠🐠🐠🐠🐠🐠 / תעקבו לעוד המלצות ותוכן ✨ | cost, plain_recs, itinerary |
| 38 | x18 | 227,900 | 1,085 | @orlivlog | תמונה ראשונה מדרום אמריקה | pov |
| 39 | x17 | 91,300 | 441 | @koren.steinberg | מדרגת מקומות בדרום אמריקה / והמלצות🇲🇽🇧🇷🇨🇱🇦🇷 | ranking, plain_recs |
| 40 | x17 | 52,600 | 256 | @_noyaron | בואו איתנו לפראג / 🎀🍦🍓✨🥹 | pov |
| 41 | x17 | 60,200 | 294 | @tamar_benchemo | המלצות לרומא🏛️ | plain_recs |
| 42 | x17 | 85,400 | 424 | @avigailzan | 📍המלון הכי מושלם בקוסמוי / 🌴🌺🥥 | superlative, hotel |
| 43 | x16 | 50,400 | 257 | @daniellenahari | טסים לקוסמוי? / הנה כמה המלצות שאתם חייבים ללכת | callout, must, plain_recs, question |
| 44 | x16 | 70,000 | 357 | @debbie__222 | מקומות חובה לביקור / בדובאי !!! / שמרו לכם ושלחו לחברים🫶🏼 | must, save_cta |
| 45 | x16 | 72,400 | 378 | @batelshemtov6 | אם אתם מחפשים יעד זול !!! / בשביל לחדש ארון לכבוד השנה / החדשה / לאכול ופשוט לנוח מהחגים 🐣 | cost, callout, season |
| 46 | x16 | 98,500 | 531 | @sivanii7 | המלצות זהב / לתאילנד / 2026 / שיצילו אותכם / מבטיחה!!! / מי שרוצה שאצרף לו הכל מסודר / או שאלות בכיף אפשר לרשום / בתגובות💫 | secret_hidden, list_n, superlative, plain_recs, season |
| 47 | x15 | 50,800 | 278 | @or_yhia | איך טיילנו 26 ימים / בויאטנם? 🇻🇳 / בתור 2 מפונקים | list_n, itinerary, first_person, question |
| 48 | x15 | 66,500 | 372 | @nili_mediuoni | כל מי שטס לרומא זה בשבילכם✨ / אז אחרי 3 פעמים ברומא / ואינסוף פעמים באיטליה / החלטתי לעשות המלצות / על מקומות שלא הייתי ממליצה / לפספס ברומא! / Roma🇮🇹 | callout, list_n, must, plain_recs, first_person, authority |
| 49 | x15 | 35,800 | 206 | @lotemraban | 10 / הטיפים הכי חשובים לפני / שמתכננים טיול ליפן🤩🗾⛩️ / ⬅️⬅️⬅️ | need_to_know, callout, list_n, superlative |
| 50 | x14 | 234,200 | 1,392 | @dani_and_sharon | 6 דברים שאתם חייבים / לעשות כשאתם מגיעים / לבנגקוק🇹🇭 | callout, list_n, must |
| 51 | x14 | 367,700 | 2,219 | @hila_and_guy | המלצות שוות / לאילת / 🫶 | must, plain_recs |
| 52 | x14 | 50,900 | 309 | @shahar_nissim_ | 10 דברים שהלוואי והייתי / יודעת לפני הטיול שלי / בקפריסין ✈️ | need_to_know, list_n, first_person |
| 53 | x14 | 493,700 | 3,017 | @shiraztravel | המלצות למה אפשר / לעשות באילת ☀️ | plain_recs |
| 54 | x14 | 501,500 | 3,105 | @stavbenbenisti | דברים שחשוב לדעת לפני / שטסים לתאילנד🌺 / חלק 3 >>> | need_to_know, callout, list_n, part |
| 55 | x13 | 92,900 | 586 | @romizaguri_ | טסה לרודוס? 🇬🇷 / תני לי דקה לפני שאת אורזת בגדים לא נכונים / והולכת למקומות מיותרים😋 | need_to_know, callout, question |
| 56 | x13 | 86,000 | 557 | @meitar_zrihen | המלצות לאתונה / שאסור לכם לפספס!🇬🇷 | must, plain_recs |
| 57 | x12 | 81,300 | 549 | @mikabenzion1 | מלון בבנגקוק תאילנד 📍 / מומלץ / חדר גדול והכל [?]!!!! ואין שירות / כזה. / מיני בר חופשי, עמדת קפה... | must, hotel, question |
| 58 | x12 | 95,500 | 650 | @yeelachaprak | מה **לא** / לעשות בפאפוס: / 🤍☀️👙🐬 | warning |
| 59 | x12 | 254,000 | 1,733 | @maayan_tigist | המלצות לבודפשט 🤍🇭🇺 | plain_recs |
| 60 | x12 | 53,200 | 365 | @_noadekel_ | ✨המלצות לרומא✨ / ממישהי שהייתה שם 3 פעמים | list_n, plain_recs, authority |
| 61 | x12 | 371,000 | 2,557 | @kimnacc | טסים לתאילנד? / הנה 3 דברים שאתם חייבים / להזהר מהם ‼️ | warning, callout, list_n, must, question |
| 62 | x12 | 370,900 | 2,557 | @kimnacc | לפני שאתם טסים לתאילנד / אתם חייבים לדעת 5 דברים | need_to_know, callout, list_n, must |
| 63 | x12 | 134,100 | 932 | @rina1_k | המלצות לרודוס✈️✈️🫰🫰🤭🤭 | plain_recs |
| 64 | x12 | 146,600 | 1,020 | @lirysas | מכיוון שכל מדינת ישראל / נמצאת כרגע בתאילנד הנה כמה / המלצות שוות ממני אליכם | must, plain_recs, first_person |
| 65 | x12 | 177,600 | 1,247 | @socialmoment.hodaia | כמה עלה לי שבוע באתונה🇬🇷🌸✨ / ✈️🍸💕 | cost, itinerary |
| 66 | x12 | 218,300 | 1,537 | @jenny.sviatkin | אתם חייבים / להכיר את / האטרקציה הזו / באילת / [?] | superlative, must, question |
| 67 | x12 | 214,000 | 1,512 | @romybenzeev | שיקרתי למלונות בתאילנד / שבאנו לירח דבש / מדרגת מה הביאו לנו | ranking, hotel, confession, first_person |
| 68 | x12 | 37,000 | 269 | @kellyfarhan | אז כמה עלה לי הטיול / הגדול במזרח? ✈️ / 4 וחצי חודשים ב5 מדינות / [?] | cost, list_n, itinerary, authority, question |
| 69 | x11 | 42,000 | 309 | @shahar_nissim_ | טסים לאיטליה / אל תעשו את הטעויות האלה / 🇮🇹❌ | warning, callout |
| 70 | x11 | 280,700 | 2,145 | @yuval.lavy1 | 📍Elissa lifestyle beach resort / הגיע הזמן לדבר על המלון הכי / מדובר ברודוס | superlative, hotel |
| 71 | x11 | 75,100 | 579 | @orelamram | המלצות לרומא 💌🍸🍸🥢 | plain_recs |
| 72 | x11 | 33,700 | 262 | @dani333ela1 | יעדים בטיול שלי / בגוגל --> במציאות / והדירוגים שלהם / מאחד עד עשר | versus, ranking, first_person, before_after |
| 73 | x11 | 32,200 | 251 | @sunbeni0 | מקומות בניו יורק לאחת / שמבינה😌 | callout |
| 74 | x11 | 27,100 | 212 | @noyahazan18 | המלצות לסיקיהור שבפיליפינים🪸🏝️ / שמרו לכם לא לפספס את היעד הזה הוא חובה >>>> | must, plain_recs, save_cta |
| 75 | x10 | 31,200 | 252 | @lital_gabot | אחרי טיול של שבוע בקפריסין / הינה המלצות שהן חובה! / 👉🏼👉🏼👉🏼👉🏼👉🏼 | must, plain_recs, itinerary, authority |
| 76 | x10 | 78,800 | 641 | @ester_sahno | מה עושים ברומא העיר המושלמת / ביקום❤️ | superlative |
| 77 | x10 | 64,700 | 532 | @neta.fuchs | דברים שלמדתי בתור / סטודנטית בחילופים / באיטליה / 🫶🏻 | need_to_know, first_person |
| 78 | x9.91 | 38,600 | 327 | @roni_avrahamm | טסים לדרום איטליה בקרוב? / קבלו כמה המלצות שאסור / לכם לפספס✨🍋 | callout, must, plain_recs, question |
| 79 | x9.70 | 26,800 | 232 | @edenbasson | מלונות / קו סמוי / אנחנו עברנו 3 מלונות בקו סמוי / Mercure samui / קצת רחוק מהמרכז | list_n, hotel, first_person |
| 80 | x9.64 | 55,200 | 481 | @orcooper6 | ריכזתי לכם את כל הטיפים / ✨✨לתאילנד✨✨ / 🦋🇹🇭✨🌅 | need_to_know, first_person |
| 81 | x9.42 | 142,600 | 1,271 | @benshoshantravel | בנגקוק / המלצות שאת צריכה לשמור | must, plain_recs, save_cta |
| 82 | x9.14 | 155,400 | 1,427 | @tamar_234 | המלצות ללימסול חלק 2 | list_n, plain_recs, part |
| 83 | x9.13 | 80,900 | 744 | @yardenaloni_ | הגלריה שלי אחרי זנזיבר 🇹🇿 | pov, first_person |
| 84 | x9.10 | 111,100 | 1,025 | @aviva_levi_ | חודש בתאילנד לזוג עלה לנו🌴🦀💦 / ורק את האמת!!! / ⬅️⬅️⬅️⬅️ | cost, itinerary, confession |
| 85 | x8.91 | 27,700 | 261 | @lee_oh10 | 7 המלצות שאסור לפספס בניו יורק! / 🇺🇸🗽 / חלק 1 / 7 places you Must visit in nyc! | list_n, must, plain_recs, part |
| 86 | x8.91 | 46,800 | 441 | @danamanes11111 | המלצות תאילנד 🇹🇭 / BANGKOK 📍 | plain_recs |
| 87 | x8.81 | 70,700 | 674 | @liorrami | ההמלצות הכי שוות / לרומא✨ / (ולא רק מזרקת טרווי והפנתיאון) | superlative, must, plain_recs |
| 88 | x8.48 | 98,300 | 973 | @galidayan | אם אתם מגיעים לקוסמוי / בקרוב 10 המקומות שחובה / שתבקרו בהם😍 | callout, list_n, must |
| 89 | x8.44 | 21,000 | 209 | @tair_saycheese | המלצות לפראג בתור מישהי / שהייתה שם פעמיים | plain_recs, authority |
| 90 | x8.42 | 45,200 | 451 | @noa.danino1 | טיפים שאתם חייבים לשמור / לפני שאתם מגיעים / לתאילנד !!🇹🇭 | need_to_know, callout, must, save_cta |
| 91 | x8.42 | 45,800 | 457 | @_hennahum_ | המלצות שוות לבנגקוק!! | must, plain_recs |
| 92 | x8.28 | 106,100 | 1,076 | @noamkoma | מי שטס לאתונה בקרוב / תעשו סייב למקומות שאסור לכם / לפספס📍🇬🇷 | callout, must, save_cta |
| 93 | x8.21 | 52,600 | 538 | @koren.tamir | המלון הזה פוטוגני מדי בשביל להישאר אצלי בגלריה.. | hotel |
| 94 | x7.77 | 24,600 | 266 | @idan_netter | Paphos / פאפוס | place_only |
| 95 | x7.25 | 47,500 | 550 | @yarin_knafo_ | שבוע בדובאי✈️ / יום 7 | list_n, itinerary |
| 96 | x7.22 | 63,900 | 743 | @daniel.cohen05 | טסים לרומא? / תשמרו את ההמלצות לטיול הבא שלכם / 🇮🇹🎄✨ | callout, plain_recs, save_cta, question |
| 97 | x7.07 | 127,300 | 1,512 | @romybenzeev | "מה יש לעשות בקו סמוי?" / תגובתי הכנה: | objection, confession, question |
| 98 | x6.94 | 114,000 | 1,380 | @lorinsaady_ | המלצות ללימסול💕🪼🌊🌸💛 | plain_recs |
| 99 | x6.93 | 18,000 | 218 | @yarinaviv | Pov: ״נתקעת״ בלונדון קצת יותר ממה [?] / אז המלצות אמיתיות מהלב | pov, plain_recs, confession, question |
| 100 | x6.91 | 43,700 | 531 | @sivanii7 | 📌המלצות זהב / קופנגן אהובתי!! / הכל כולל הכל / אחרי שלושה / חודשים / הכי שווה אחרון 🥹 | superlative, must, plain_recs, itinerary, authority |
| 101 | x6.90 | 95,300 | 1,160 | @rotembaranch | המלצות הכי שוות / ומקוריות לאתונה 📍✨ / שמרו לכם דחוף 🚨 | secret_hidden, superlative, must, plain_recs, save_cta |
| 102 | x6.86 | 181,300 | 2,219 | @hila_and_guy | 10 / טיפים והמלצות לתאילנד / שהלוואי וידענו / לפני שטסנו 🇹🇭 | need_to_know, callout, list_n, plain_recs |
| 103 | x6.86 | 22,700 | 278 | @zoharelmaleh | כל ההמלצות שאתם צריכים לדעת / לפריז✨ | need_to_know, must, plain_recs |
| 104 | x6.82 | 38,900 | 479 | @bathen_mamoya1 | אתונה המלצותתתתת💖💖💖💖 | plain_recs |
| 105 | x6.73 | 28,300 | 353 | @barmantsor_ | המלצות ל / פאפוס | plain_recs |
| 106 | x6.72 | 248,400 | 3,105 | @stavbenbenisti | דברים שחשוב לדעת לפני / שטסים לתאילנד🥥 / חלק 2 <<< | need_to_know, callout, list_n, part |
| 107 | x6.72 | 71,600 | 895 | @yuvalmiali | כל מי שטס לרומא בקרוב עדיף לא / לדלג ולשמור את הסרטון🫶🏼🤌🏼 / טיפים שלא יגידו לכם בשום מקום!! | secret_hidden, need_to_know, callout, save_cta |
| 108 | x6.64 | 37,300 | 472 | @travi.odedthemapper | ככה הייתי מחלק / שבועיים בויאטנם / OdedTheMapper.com | itinerary, first_person, part |
| 109 | x6.58 | 105,300 | 1,343 | @adihaim | המלצות נדירות לכל מי / שטס ללימסול קפריסין✈️ | secret_hidden, callout, plain_recs |
| 110 | x6.40 | 190,900 | 2,504 | @thailand_vibes | 15 / מקומות / שלא כדאי לפספס / פוקט / PHUKET | list_n, must |
| 111 | x6.30 | 95,300 | 1,271 | @benshoshantravel | פוקט / המלצות שאת צריכה לשמור 📍 | must, plain_recs, save_cta |
| 112 | x6.18 | 27,800 | 378 | @spa_gan_eden_ | Pov: זה הסימן שלכם לסגור חופשה לדובאי [?] | pov, question |
| 113 | x6.05 | 22,900 | 318 | @maya_avital4 | המסלול שלנו 3 שבועות בפליפינים 🇵🇭☀️ | list_n, itinerary, first_person |
| 114 | x5.87 | 57,500 | 822 | @shiravideosh1t | המלצות לבודפשט מהלב!!!! / (יעד מושלם במיוחד לשומרי / כשרות) / 2026/12/22 | list_n, plain_recs, season |
| 115 | x5.84 | 42,500 | 611 | @shiramizrachii | ההמלצות הכי שוות לחופשת בנות בקפריסין / לרנקה - נאפה | superlative, must, plain_recs |
| 116 | x5.78 | 104,000 | 1,512 | @romybenzeev | ”מה יש לעשות (בעיקר לאכול) / בבנגקוק?” / תגובתי הכנה: | objection, confession, question |
| 117 | x5.67 | 37,200 | 551 | @ziv_adler | למי שמגיע לסרי לנקה | callout |
| 118 | x5.67 | 46,100 | 683 | @meital_vasser | המלצות [?] / המלצות לפוקט, / תאילנד 🇹🇭🦋 | plain_recs, question |
| 119 | x5.66 | 219,000 | 3,247 | @mega_tours | 6 דברים שאסור לכם לפספס / כשאתם מגיעים לפוקט 🇹🇭 / חלק ב | callout, list_n, must, part |
| 120 | x5.63 | 122,500 | 1,828 | @travel_mor | לכל מי שטס לפיליפינים / תשמרו את הסרטון הזה!! / אטרקציות/המלצות/טיפים / המדריך המלא❤️ | need_to_know, callout, plain_recs, itinerary, save_cta |
| 121 | x5.51 | 83,400 | 1,271 | @benshoshantravel | קראבי / המלצות שאת צריכה לשמור 📍 | must, plain_recs, save_cta |
| 122 | x5.49 | 99,300 | 1,520 | @gefen_gender | המלצות לניו יורק🇺🇸🗽🍎 | plain_recs |
| 123 | x5.30 | 23,500 | 372 | @karinosh2004 | אטרקציות / שאסור / לכם / לפספס / בפאפוס / 🇨🇾 | must |
| 124 | x5.28 | 145,700 | 2,318 | @bari_travel_ | 🌊🏝️🪸🐚🍕🍝🇮🇹 / כמה באמת עלו לנו 11 ימים / בדרום איטליה??? | cost, list_n, itinerary, question |
| 125 | x5.18 | 85,800 | 1,392 | @dani_and_sharon | הקניונים הכי מומלצים / בבנגקוק🛍️🛒 | superlative, must |
| 126 | x5.17 | 159,700 | 2,595 | @danitravel3 | טסים לפראג? 🇨🇿 / הנה 6 מקומות שאסור לכם לפספס / 🍽️🍨 / *תשמרו את הסרטון לטיסה הבאה / שלכם✈️💕 / DANI TRAVEL / חופשה בהתאמה אישית! | callout, list_n, must, save_cta, question |
| 127 | x5.12 | 40,200 | 659 | @maayannhen | ההמלצות שלי ללונדון בתור / מישהי שטיילה שם מעל חודש / חלק 1🥹❤️❄️💕🇬🇧 | list_n, plain_recs, itinerary, first_person, authority, part |
| 128 | x5.08 | 39,900 | 659 | @konnichimap | 1/7 / 日本 / טיול ראשון ליפן? / 5 הטעויות / שכולם עושים / בטיול הראשון / ליפן / מספר 3 עולה הכי הרבה כסף / [?] | warning, cost, callout, list_n, superlative, question |
| 129 | x5.02 | 38,300 | 641 | @meet.us.abroad | האפליקציות שצריך להוריד / לפלאפון לפני שמגיעים ליפן! / ⛩️🎏🎍🎎🎋🍜🍡🏯🇯🇵 / חלק ב׳ | need_to_know, callout, part |
| 130 | x5.00 | 133,000 | 2,235 | @matan.japan | היפנים יכעסו עליי שאני מגלה / לכם את זה / אל תטוסו ליפן בלי 7 הלוקיישנים / האלה | secret_hidden, warning, list_n, confession, first_person |
| 131 | x4.98 | 68,100 | 1,148 | @noyshaba_ | את טסה לחו״ל!! / ~ חלק ג׳ ~ | callout, part |
| 132 | x4.97 | 75,300 | 1,271 | @benshoshantravel | קוסמי / המלצות שאת צריכה לשמור 📌 | must, plain_recs, save_cta |
| 133 | x4.86 | 104,000 | 1,798 | @danitapelbaum | המלצות לימסול🩵 | plain_recs |
| 134 | x4.83 | 186,900 | 3,247 | @mega_tours | Phuket / 7 דברים שאסור לכם לפספס / כשאתם מגיעים לפוקט-חלק ג | callout, list_n, must, part |
| 135 | x4.77 | 57,900 | 1,020 | @lirysas | בעקבות ההצלחה של הסרטון הקודם, / חלק 2 להמלצות לתאילנד | list_n, plain_recs, part |
| 136 | x4.69 | 75,500 | 1,352 | @nofeshboutiqe | רומא למתחילים 🇮🇹 / מה חשוב לדעת לפני הטיול הראשון | need_to_know, callout |
| 137 | x4.58 | 17,500 | 321 | @shaharaharon | המלצות לאי המושלם- / קופיפי 🇹🇭✈️ | superlative, plain_recs |
| 138 | x4.51 | 57,600 | 1,073 | @dani_tours1 | אם אתם חולמים על זנזיבר / אל תסגרו לפני שאתם / קוראים את זה / הטעות שרוב האנשים עושים / יכולה לשנות לגמרי את החופשה שלהם / 👉🏻👉🏻 | warning, need_to_know, callout |
| 139 | x4.36 | 13,400 | 258 | @ronbushkin | 5 דברים שאתם חייבים לבדוק / לפני שאתם סוגרים מלון ביפן / 🍙🐱🌸🍜👘🥷 / הפרטים הקטנים בבחירת המלון יכולים לשנות לחלוטין את האווירה של הטיול שלכם, הנה חמישה דברים שלמדנו מהטיול שלנו שישדרגו לכם את החוויה, טיפ מספר שלוש הוא גיים [...] | need_to_know, list_n, must, hotel, confession, first_person |
| 140 | x4.27 | 221,300 | 4,350 | @s.travel9 | מלונות שווים ביוון שהם 10/10 / בעייני עד 260₪ ללילה!!!🤭 / 🍒🍸🌴👙⛱️ | cost, ranking, list_n, must, hotel |
| 141 | x4.24 | 34,000 | 674 | @liorrami | ההמלצות הכי שוות / לברצלונה✨ | superlative, must, plain_recs |
| 142 | x4.09 | 93,800 | 1,926 | @travel_w_hadar | תכנון טיול מומלץ לדרום איטליה✨ / (סורנטו, קאפרי, אמאלפי, פוזיטנו, נאפולי) | must, itinerary |
| 143 | x4.07 | 40,300 | 832 | @mohini_braverman_ | טיול חלומי למילוס🤍 | superlative |
| 144 | x4.03 | 49,400 | 1,029 | @tomerturel | המלצות לרומא עד היעד הבא🇮🇹🥰 | plain_recs |
| 145 | x4.03 | 319,100 | 6,652 | @zohar_zilberman | המלצות *אמיתיות* לבודפשט🇭🇺🍁 | plain_recs, confession |
| 146 | x4.01 | 99,900 | 2,092 | @agamakniin | ✨ מה עשינו בפראג 5 ימים ✨ / Day 1 ✨✨ | list_n, itinerary, first_person |
| 147 | x3.93 | 11,600 | 248 | @travel.with.me0179 | 10 דברים שלא סיפרו / לכם על קופיפי ☀️ | secret_hidden, list_n |
| 148 | x3.90 | 115,900 | 2,497 | @goneneliyahu | אם ביקרתם ב-5 מהערים האלה, / טיילתם יותר מ-90% מהמטיילים / 1. בנגקוק / 2. טוקיו / 3. פריז / 4. ניו יורק סיטי / 5. לונדון / 6. דובאי / 7. ולנסיה / 8. סינגפור / 9. פירנצה / 10. ונקובר / 11. איסטנבול / 12. אמסטרדם / 13. סיא [...] | list_n |
| 149 | x3.74 | 55,900 | 1,254 | @tehilam1 | המלצות ל / THAILAND | plain_recs |
| 150 | x3.69 | 47,100 | 1,073 | @dani_tours1 | מתלבטים לאן / לטוס ביוון? / בואו נעשה לכם סדר ✈️ / יוון לפי סגנון חופשה🇬🇷 / 👉👉👉 | callout, pov, question |

---

## 3. The web: published viral travel carousels with numbers

**Status: not completed in this run.** A separate web-search pass (viral travel
carousels with published view/like counts; marketing case studies; no page on
agoda.com, booking.com, cj.com or any affiliate link) was started but had not
returned when this report was built, so this section has no data and the
"web recurrence" column in section 5 is marked "not measured". Nothing here
was guessed. Sections 1, 2, 4 and 5 stand on the local data alone.

---

## 4. The noise floor, and what it does to every number above

FINDINGS.md (scroll-stop) documents the cleanest natural experiment we have:
@travelnova.app posted "3 countries you can visit in 1 trip" 25 times with
only the photo changed, and the same image with the same text three times
came out x21.98, x0.61 and x0.25 (958,500 vs 11,100 plays). Identical inputs,
~90x apart. @thejapancodes (one destination, one template, one layout, 48
posts) spans x0.36 to x49, with a 10th-90th percentile band of x0.44 to
x2.86.

Measured again on this census's base (same creator, identical cover text,
posted 2+ times; the photo may differ):

repeated identical covers: 38 groups, 103 posts; median max/min spread x2.9, largest x726
SD of lift across all base covers: 0.751 log10 (one SD = x5.63); SD inside identical-cover groups: 0.682 log10 (x4.81) = 82% of total variance

| creator | identical cover text | posts | plays (each) | max/min |
|---|---|---|---|---|
| @travelnova.app | 3 countries you can visit in / 1 trip | 25 | 2,100,000, 958,500, 605,500, 250,800, 204,000, 118,500, 90,000, 87,300, 72,500, 65,500, 64,700, 60,600, 36,200, 32,200, 31,600, 26,700, 16,200, 15,900, 14,200, 13,100, 11,100, 6,657, 5,889, 5,795, 2,893 | x725.9 |
| @dreamrreve | You | 2 | 2,300,000, 5,104 | x450.6 |
| @travellingcloset1 | 10 must visit cafes in / PARIS / Part 1 | 2 | 964,100, 10,400 | x92.7 |
| @dreamrreve | 12 / Must do things in / KYOTO | 2 | 291,200, 4,710 | x61.8 |
| @livs_london | ultimate photo booth guide for london / SAVE FOR YOUR NEXT DAY OUT! PT 2 | 2 | 739,600, 14,100 | x52.5 |
| @travelnova.app | places in europe with the / best beaches | 4 | 952,900, 398,100, 340,900, 18,600 | x51.2 |
| @itsjustinjapan | whimsical stores to / check out in Tokyo | 2 | 1,800,000, 46,300 | x38.9 |
| @thejapancodes | Untold realities visiting / Japan... | 2 | 51,400, 1,396 | x36.8 |
| @m_o_life26 | 5 things to do in okiniwa. | 2 | 103,600, 3,901 | x26.6 |
| @architinerary | The only hotel you need in / greece | 2 | 827,300, 55,100 | x15.0 |
| @ig_adelle | simple lessons / I learned while living in Italy | 2 | 11,300, 1,006 | x11.2 |
| @hotelmozil | כמה עלה לנו חצי שנה במזרח? / 10 מדינות!!! | 2 | 23,400, 2,705 | x8.7 |
| @livs_london | photo inspo for the girlies coming to london pt2 | 2 | 208,800, 24,700 | x8.5 |
| @travlprepinspo | you, me & hawaii | 2 | 1,100,000, 154,400 | x7.1 |
| @dreamrreve | 9 Mistakes to Avoid while / you are in TOKYO, Japan / (Tips from my friend who lives in To | 2 | 83,600, 14,100 | x5.9 |
| @itsjustinjapan | Brands to / know before your / trip to Japan | 2 | 200,900, 45,300 | x4.4 |
| @soft.nrt | The Japan they want to go to | 3 | 4,729, 4,115, 1,263 | x3.7 |
| @routes__app | 6 / things you've walked past in Paris / without knowing what they mean | 2 | 31,500, 9,470 | x3.3 |
| @italianinspo | after visiting over 50 cities / in Italy, here are my / awards... | 2 | 9,982, 3,377 | x3.0 |
| @hotelmozil | איך עוברים ממקום למקום / בתאילנד? | 2 | 35,900, 12,300 | x2.9 |
| @architinerary | The only 5 star resort you / need in Greece | 2 | 45,700, 16,800 | x2.7 |
| @daaci_01 | scotland | 2 | 208,100, 82,400 | x2.5 |
| @thejapancodes | Shocking truths visiting / Japan... | 3 | 3,074, 2,842, 1,246 | x2.5 |
| @m_o_life26 | 5 things to do in japan >>> | 2 | 3,909, 1,738 | x2.2 |
| @houseofhela_ | Going to / Puerto Rico? / Here's where to go;) | 2 | 1,100,000, 507,000 | x2.2 |
| @m_o_life26 | let's go to / japan | 2 | 19,400, 9,457 | x2.1 |
| @itsjustinjapan | whimsical experiences / to check out in Tokyo | 2 | 446,800, 227,000 | x2.0 |
| @soft.nrt | 1 thing you MUST do in / OKINAWA | 2 | 129,300, 66,300 | x2.0 |
| @izzy_travels_ | places to visit while being / young, dumb and broke | 2 | 3,230, 2,034 | x1.6 |
| @itsjustinjapan | Apps you need to / Prepare Before / Travelling to Japan | 2 | 266,000, 171,200 | x1.6 |
| @izzy_travels_ | niche destinations / on my travel bucket list | 2 | 9,852, 6,933 | x1.4 |
| @izzy_travels_ | i think about it / all the time... | 2 | 1,333, 952 | x1.4 |
| @soft.nrt | 3 things you NEED to know / before going to Japan | 2 | 30,800, 23,900 | x1.3 |
| @dreamrreve | The ultimate Travel guide / for Japan | 2 | 19,800, 16,200 | x1.2 |
| @downtoearthtravel25 | You & Me | 2 | 1,901, 1,559 | x1.2 |
| @izzy_travels_ | rating snacks I bought in / 7/11 Thailand | 2 | 2,042, 1,676 | x1.2 |
| @corpus:itsjustinjapan | "I wish I knew / about / these apps / before my / trip to Japan" | 2 | 54,700, 50,500 | x1.1 |
| @travel.destinations7 | let's play / "stay, visit, skip" | 2 | 2,225, 2,156 | x1.0 |

**What it implies for the clusters:**

1. **The cover text explains a small part of reach.** Covers with identical
   text still vary with 82% of the variance that the whole base has. Text,
   photo, destination and timing together share the remaining fifth. Any
   statement of the form "formula X gets Nx" is a statement about averages
   across many posts, never about the next post.
2. **One viral post proves nothing about its formula.** At this noise, a
   x100 post is roughly a 1-in-100 draw from an ordinary formula. That is why
   the objection quote ("But London is so expensive", 6M plays) and the bare
   place name ("THAILAND", 1.1M) lead the top-150 list yet sit at or below
   median across creators.
3. **Required sample size.** With a per-cover SD of ~0.7 log10, detecting a
   true x1.5 effect at two standard errors needs ~60 covers spread across
   many creators, and more once creator-to-creator variation is counted.
   Clusters below ~30 covers or ~10 creators (comparison, credential,
   confession in Hebrew, POV in Hebrew, "הלוואי", "כמה עלה") are hypotheses,
   whatever their multiplier.
4. **Trust the creator count over the multiplier.** A formula that wins for
   17 of 19 creators survived 19 independent draws of that noise; a x19
   median on 7 covers survived none. The ranking in section 5 is built on
   that rule.
5. **Practical corollary already in FINDINGS:** since the same cover can land
   anywhere in a ~6x band, re-posting a cover that is believed to work is a
   legitimate tactic, and no single post of ours should be read as a verdict
   on its wording.

---

## 5. Formulas ranked by evidence strength

Ranking rule: (1) number of creators for whom it beats their median, with a
sign test; (2) whether the within-creator interval excludes x1.00; (3)
agreement between English and Hebrew; (4) whether it recurs in published
viral examples (section 3). A big multiplier from few creators ranks low.

| rank | formula | English (within-creator) | Hebrew (cross-section) | web recurrence | verdict |
|---|---|---|---|---|---|
| 1 | **Secret / hidden / underrated** | 17/19 creators (p=0.001), x4.3 [2.0, 10.6] | 15/23, x1.43; contrast flat | not measured | **Use.** The only formula that is both large and consistent. |
| 2 | **Plain recommendation: "things to do / places to visit in <place>", "המלצות ל<place>"** | 22/29 (p=0.008), x1.9 [1.3, 2.9] | 96/167 (p=0.06), x1.33 | not measured | **Use as the default.** Unglamorous, reliable. |
| 3 | **Hotel / where to stay** | 15/20 (p=0.04), x1.5 [0.7, 3.3] | 29/44 (p=0.049), x1.46 | not measured | **Use.** Two samples agree; directly on our subject. |
| 4 | **Superlative (best / top / only)** | 30/48 (p=0.11), x1.8 [1.2, 2.7] | 35/75, x0.78 | not measured | Use in English; no Hebrew support ("הכי" is flat). |
| 5 | **List of N / Top N** | 23/40 by contrast, x1.7 [1.1, 2.7] | 60/121, x0.98 | not measured | Average lift in English, not reliable per creator; neutral in Hebrew. |
| 6 | **Identity call-out ("Going to X?", "טסים ל...?")** | 11/20, x1.8 [0.8, 3.4] | 43/73, x2.97, contrast x1.6 [0.98, 3.0] | not measured | Directional in both languages; good bet, not proven. |
| 7 | **Cost reveal ("how much it cost", "כמה עלה לנו")** | 14/29, x1.4 [0.8, 2.5] | contrast x1.7 [1.1, 2.6]; "כמה עלה" 7/9 | not measured | Hebrew-specific lean; small n. |
| 8 | **Must / need to / "אסור לכם לפספס"** | 23/38, x1.4 [0.95, 2.0] | x1.39; FOMO phrase x1.97 | not measured | Mild lean. |
| 9 | **Warning / mistake / what NOT to do** | 14/24, x1.7 [0.99, 2.9] | 14/31, x0.88 | not measured | Mixed: helps in English (Upworthy +5%, A-grade), not in Hebrew. |
| 10 | **Wish I knew / need to know** | 14/23, x1.35 [0.9, 2.2] | 28/56, x0.90; "הלוואי" x9.7 on n=6 | not measured | Unproven; the Hebrew headline number rests on 6 covers. |
| 11 | **Comparison / vs / instead** | 5/5, x7.9 [1.9, 22] on 8 covers | x19 on 7 covers | not measured | **Best candidate to test**: large in both, thin in both. |
| 12 | POV / scenario, credential, confession, ranking, "part N", bucket list, local vs tourist, photo spots | coin flip or one-creator clusters | small n, partly small-account effects | not measured | No evidence either way. |
| - | **Avoid:** first person (I/my/we), question mark, season/month, bare place name, no text, objection quote | first person 12/47 (p=0.001), x0.60 [0.43, 0.83]; question x0.56; place-only x0.74; objection 3/8, median x0.37 | place-only x0.34; season x0.43; superlative and itinerary below 1 | not measured | Consistent losers, or (objection quote) a one-creator outlier mistaken for a formula. |

**Bottom line for HotelMozil covers:** the strongest-supported cover is a
plain "where to go / where to stay in <place>" line with a secret/underrated
angle ("the underrated side of <place>", "מקומות שלא כולם מכירים ב<place>"),
optionally a hotel angle and a call-out to people flying there; no first
person, no question mark. Everything beyond that is inside the noise of
section 4 and should be tested by posting, more than once.
