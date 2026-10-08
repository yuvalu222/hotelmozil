# TikTok carousels — what opens, what is walled, where it stands

**Target:** exact clones of travel photo carousels that already worked, floor
**50,000 likes**, destinations Israelis actually fly to, with hashtags, sound
and per-slide craft documented. Nothing invented.

---

## 1. The finding that mattered

For most of this work the reader received a **218-character shell** instead of
a post page, and that was written up here as *"the IP is rate-limited, and I
caused it — there is no engineering trick, the only lever is to slow down."*

**That was wrong, and it was wrong in the direction that stops work.** The
same profile, the same user agent, the same machine, the same minute, reading
the same post **straight away on a fresh page** returns the complete record:
13 slides, likes, comments, shares, hashtags, music title.

The difference is one line. The reader loaded `tiktok.com` first — "warming" —
and then navigated to the post, reusing the page. **The homepage visit is what
makes post pages refuse.** Warming is what *search* needs; it is the opposite
of what a *post page* needs, and applying it everywhere silently disabled the
only surface that works.

Two jobs that need opposite sessions must not share one. They no longer do.

## 2. What is open and what is walled

Each line below was probed directly, not inferred from a failure elsewhere.

| surface | state | evidence |
| --- | --- | --- |
| **post page, cold, fresh page** | **open** | full record, repeatedly |
| post page after a homepage visit | refused | 218-char shell |
| search, general tab (`/search?q=`) | **intermittent, and thin even when open** | refused for hours with a 641-char body and "Something went wrong"; later answered, and then returned 0 carousels against 24 videos |
| **search, PHOTO tab (`/search/photo?q=`)** | **open — this is the route** | 24 carousels and 0 videos per query, like counts to 785,800 |
| profile page header | open | follower and like totals render |
| **profile post grid** | **walled** | 400-char body, 10 anchors, **0** post links after scrolling |
| "you may like" rail on a post | **walled** | 0 carousel links on either seed post |
| **hashtag page** (`/tag/<x>`) | **walled** | 594-char body, 0 post links, two tags tested |
| post page on a **different profile**, cold | **open** | 1,140-char body, slides present |
| **web search for `/photo/` URLs** | **no index** | two queries; returns `/discover/`, `/tag/`, `/channel/` and `/video/` pages, never a photo post |

Web search is outside TikTok entirely and does not index photo posts.

**Consequence:** discovery runs on **one** surface, the photo tab, and
everything else listed as walled stays walled. That is enough — it returns 24
carousels per query where the general tab returned none.

This paragraph previously read "all five discovery surfaces are refused, there
is currently no way to find a new carousel URL". That was false, and it was
false because the general tab had been tested while the photo tab had not.
Four surfaces being shut is not evidence that the fifth is.

The "different profile" row cancels an earlier conclusion. "Only `recon/p-card` works" was
drawn while every reader warmed first, so it never separated the profile from
the warming. A second profile reads post pages perfectly well cold, which
means readers can run in **parallel on separate profiles** — `TT_PROFILE`
selects one. What may never overlap is two processes on the *same* profile.

## 3. What a post page yields

| | |
| --- | --- |
| slides | every image, full resolution, from the CDN path containing `photomode` |
| likes · comments · saves · shares | all four, as rendered text |
| hashtags | exact, from the caption |
| sound | title and artist; `original sound - <handle>` marks the creator's own audio |
| caption | in full |

`photomode` is the separator that matters: a carousel page also renders about
sixty *related* thumbnails, and filtering by size alone returns either the
whole page or nothing.

**But `photomode` alone is not enough.** Related posts that are themselves
photo posts carry `photomode` too, and on some profiles the rail renders them
at 600-1000px. A probe on one post returned 13 images above 1000px and **39**
above 600 — the extra 26 being other people's posts. Both kept decks measure
1080-2160px wide on every slide, so the threshold is now **1000**
(`MIN_SLIDE_PX`), which separates a post's own slides from the rail. The two
decks already on disk were checked and are clean: 12 and 21 slides, all at
full size.

## 3b. The photo tab, and why the first corpus was so thin

The first pass concluded that 1.4% of travel carousels clear 50,000 likes,
from 140 reads. That number was an artefact of looking in the wrong place.

TikTok search has a **Photo tab**: `/search/photo?q=`. Measured side by side,
same session, same query:

| endpoint | carousels returned | videos |
| --- | ---: | ---: |
| `/search?q=athens travel tips` | **0** | 0 |
| `/search/photo?q=athens travel tips` | **24** | 0 |

The general tab is mostly video, so roughly 85% of every page was discarded
before anything was read, and on a refused session it returns nothing at all.
The photo tab is carousels only.

The second lever was the owner's: search **format words**, not just
destinations. Carousel creators put the format in their own captions, and
those queries surface the biggest posts in the niche — `save this italy`
returned 12 over the floor from one page, and `carousel ayia napa` turned up a
**785,800-like** deck. Queries now run FORMAT x destination as well as the
classic shape x destination grid.

Result after 60 of 763 queries: **1,345 carousels seen, 53 over the floor**,
against 2 from the entire first corpus of 140.

## 4. The first corpus, and why its rate was wrong

The first pass read **140 carousels and found two** over 50,000 likes, the
best near-miss being 49,400. That was written up here as final — "the whole
addressable corpus, since every discovery surface is refused" — and as a rate
of 1.4%, one in seventy.

**Both claims were wrong, and in the same way: a measurement taken through a
broken instrument, reported as a property of the world.** The 140 URLs came
from the general search tab, which is mostly video and returns nothing at all
on a refused session. Through the photo tab (§3b) the same niche yields
**53 over the floor from 1,345 carousels — about 4%, and with far bigger
decks**: 785,800 likes at the top against 66,200 before.

The lesson is the one this file keeps relearning: before concluding something
about the subject, check that the instrument was pointed at it.

## 4b. Decks over the floor

| account | destination | likes | saves | shares | slides | followers |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **@izzy_travels_** | Thailand | **66,200** | 68,100 | 18,100 | 12 | **2,934** |
| **@emsriley** | Lisbon | **52,200** | 54,200 | 15,300 | 21 | — |

Two things in that table are worth more than the like counts.

**Saves exceed likes in both.** 68,100 saves on 66,200 likes; 54,200 on
52,200. That is the signature of a deck people keep for a trip rather than
enjoy and scroll past, and it is the behaviour worth copying.

**@izzy_travels_ has 2,934 followers.** A 66,200-like post off that base is
roughly twenty-two times the follower count — the format carried it, not the
account. That is the single most encouraging number in this study for an
account starting from 1,700 followers.

## 4c. Likes are the wrong number. Saves are the right one.

Ranking the harvest by likes puts a 352,100-like photo dump on top and the
66,200-like guide near the bottom. Ranking it by **saves per like** inverts
that, and the split is not subtle:

| group | decks | avg likes | avg saves per like |
| --- | ---: | ---: | ---: |
| keepers (>= 0.35) | 4 | 117,600 | **0.85** |
| scrollers (< 0.35) | 7 | **266,800** | 0.11 |

The scrollers have more than twice the likes and **eight times fewer saves per
like**. They are beauty posts — gorgeous photos, no copy, nothing to come back
for. A like costs nothing and means nothing; a save is someone saying they
intend to use this, and a saved travel deck is the one that is open when a
hotel gets booked. For this account the smaller format is the better one.

Two sources found this way beat everything in the first corpus:

| account | likes | saves | per like | slides | format |
| --- | ---: | ---: | ---: | ---: | --- |
| **@cinexplorerr** | 216,500 | **126,300** | 0.58 | 11 | paper memo cover, then a structured card per destination — including its own **"where to stay"** heading, which is where the hotel line belongs |
| **@patspassport** | 135,500 | **100,800** | 0.74 | **4** | "three hidden gems in X": serif cover, then a pin, a name and three short lines |
| **@aimsi.unfiltered** | 117,600 | 66,700 | 0.57 | 12 | one city per slide as a **3x3 collage** of nine photos — sells a city as a mood, not a list |
| **@epictodo** | 68,000 | 49,800 | 0.73 | 11 | two photos of the same place stacked full-bleed, label on the seam — and a **part number** on the cover |
| **@maryamontour** | 213,600 | 76,000 | 0.36 | 8 | **one mistake per slide**, each with its own photo, where everyone else puts eight mistakes on one slide - one swipe becomes eight |
| **@nearxfar** | **961,100** | **468,000** | 0.49 | 7 | **a white page, not a photo** — numbered question, dense prose, bold key phrases, small image. The highest-saving deck in the corpus by 3.7x |
| **@cuddlynest** | 94,700 | 111,700 | **1.18** | 7 | **"can't afford / go to"** — the expensive place over the one that looks the same for less. Best save RATIO in the corpus, and the source is a hotel-booking brand |

`analyze/tt-shortlist.py` prints this table from the harvest.

## 5. The two systems, which are opposites

Both cleared the floor, so the choice between them is voice, not quality.

**A — @izzy_travels_, dense utility.** Personal phone photos, never stock. A
contrarian hook in very heavy white caps with a **black outline** (stroke
behind fill, not a shadow and not a box). Every content slide: a white rounded
title chip centred at the top, sometimes a green fact chip, then the body as
chips whose background hugs **each line** rather than the paragraph — that
ragged edge is TikTok's own text style and is most of why the deck reads as
native rather than designed. Each body line opens with a check or a warning
mark. Twelve slides, sectioned: hook, when to go, before you fly, money, SIM,
plugs, where to go, what to see, food, mistakes, budget, save-this.

**B — @emsriley, quiet list.** The photo carries the slide and the words get
out of the way: one small white line, no chip, no box, no outline, parked in
whatever part of the frame is empty. Slide one is the count and the city; the
rest are numbered 1 to 20, one place each.

## 6. Clones built

Eight, all in `specs/tt-*.json`, rendered to `out/<id>/`:

| id | source | source saves | slides |
| --- | --- | ---: | ---: |
| `tt-1-thailand-guide` | izzy_travels_ | 68,100 | 12 |
| `tt-2-athens-20things` | emsriley | 54,200 | 22 |
| `tt-3-dubai-guide` | izzy_travels_ | 68,100 | 12 |
| `tt-4-larnaca-20things` | emsriley | 54,200 | 22 |
| `tt-5-rome-guide` | izzy_travels_ | 68,100 | 12 |
| **`tt-6-greece-properly`** | **cinexplorerr** | **126,300** | 12 |
| **`tt-7-athens-gems`** | **patspassport** | **100,800** | 5 |
| **`tt-8-dubai-gems`** | **patspassport** | **100,800** | 5 |
| **`tt-9-weekend-cities`** | **aimsi.unfiltered** | **66,700** | 12 |
| **`tt-10-crete-part1`** | **epictodo** | **49,800** | 12 |
| **`tt-11-greece-mistakes`** | **maryamontour** | **76,000** | 10 |
| **`tt-12-greece-wish-i-knew`** | **nearxfar** | **468,000** | 7 |
| **`tt-13-same-look-less`** | **cuddlynest** | **111,700** | 9 |

Every deck carries the hotel line — check Booking and Agoda, and below it the
must-do of checking the HotelMozil app. On `tt-6` it sits inside the source's
own "where to stay" structure rather than being appended, which is why that
format was chosen.

**Three gates run before any deck is called finished**, each built after a
real defect got through:

- `analyze/tt-ready-check.mjs` — every slide present, in sequence, 1080x1920
- `analyze/overflow-check.mjs` — no text cropped, nothing under the strip
  TikTok draws its caption and action rail over
- a per-deck duplicate check — the Larnaca deck shipped **one aerial on four
  of its twenty-one slides** before `lib/colourfulness.js` learned to compare
  perceptual hashes

**What does NOT work as a quality gate, measured:** colour. A saturation and
contrast gate was built on the assumption that the dull decks were dull
because they were washed out. Calibrated against the decks the owner liked and
disliked, it runs backwards — the deck he called boring has a **higher** median
saturation (0.376) than the one he called best (0.281). The real variable is
people and activity in frame, and that is set by the search query, not by a
threshold. The gates stay only as a floor against a genuine dud, such as the
black-and-white Dubai skyline that scored 0.001.

Destinations are the most-flown routes out of Ben Gurion — Athens 1,178,745,
Dubai 1,119,786, Larnaca 1,012,937 — plus Thailand and Italy. Three clones
reuse one source because only two sources clear the floor and discovery is
walled; the brief says so on every card rather than implying five sources.

Type sizes were measured off the source slides at their real width (2160px and
1440px) and divided down to the 1080px canvas. Where Hebrew is shorter than
English the font is scaled by the character ratio, because what the source
holds constant is the headline **filling the frame**, not a pixel value.

## 5b. The one thing the top savers share, and it is not a layout

Three of the highest-saving decks in the corpus use three completely different
layouts — a white page of prose, a 2x2 venue collage, a two-up swap. What they
share is that **every item is named**.

| deck | saves | what it names |
| --- | ---: | --- |
| @nearxfar | **468,000** | Don Quijote, ABC Mart, the Travel Japan Wifi app, "$35 for A5 Wagyu in Kobe" |
| @travlprep | **243,500** | New York Cafe, Szechenyi, Gellert, Szimpla Kert, 360 Sunset Bar |
| @cuddlynest | **111,700** | Santorini to Paros, Amalfi to Puglia, Como to Iseo |

None of them writes "visit the thermal baths". All of them write the name.

That is the difference between a deck someone looks at and a deck someone
keeps: a name is something you can act on later, and a category is not. It
shows up independently in three different formats, which is as close to a
controlled result as this corpus gets.

It is also the standard the hotel line has to meet. "Check Booking and Agoda,
and check whether HotelMozil can make it cheaper" names three things and an
action, which is why it reads as part of the advice rather than an ad.

## 6. The format to start with, and why it is not the biggest one

**@cuddlynest — 94,700 likes, 111,700 SAVES.** More saves than likes: a ratio
of **1.18**, the highest in ninety-six harvested decks. Not the biggest post
here by a long way, and still the one to copy first.

One slide, two photos: the famous expensive place on top, the one that looks
the same for a fraction underneath. Santorini over Paros. Amalfi over Puglia.
Maldives over Zanzibar. It is a list of **decisions**, not of sights, which is
why people keep it — they intend to use it when they book.

Two things make it the right starting point for this account specifically:

**The source is a hotel-booking brand.** Not a creator — a commercial account
doing the same job this one has to do, and clearing the floor while doing it.
That is the closest thing to proof in this corpus that the format survives
being run by a company with something to sell.

**Its message is already the product's message.** "Same look, less money" is
what HotelMozil is for. And the claim sits on DESTINATIONS, not on the app:
"Santorini is expensive, Paros is not" is ordinary travel content and makes no
price claim about anything we own — which is the line CLAUDE.md draws.

## 6a. The highest-saving deck, and what actually earns a save

**@nearxfar — 961,100 likes, 468,000 SAVES, 123,200 shares.** Three point seven
times the saves of anything else here, and it looks nothing like the rest of
the corpus.

No photo behind the words. A **white page**, a numbered question as the
heading, a genuinely dense paragraph with the load-bearing phrases in bold, and
a small supporting image with a caption. It is reading, not scanning — the one
format in ninety harvested decks that asks for thirty seconds instead of three.

**What makes it save is specificity, not layout.** Not "eat local food" but
*"lunch specials at high-end restaurants are almost a third cheaper — I did
this in Kobe for A5 Wagyu, about $35"*. Named shops (Don Quijote, ABC Mart),
named apps (Travel Japan Wifi, 20,000 hotspots), real numbers. Every line pays
for the reading it asks for.

Copying the layout without the specificity would produce a wall of text that
nobody finishes. That is the bar `tt-12` has to clear, and it is the bar for
anything written in this format later.

It is also the only format where the hotel line belongs without being placed:
"where do you actually save the most" is the same register as "Don Quijote is
the discount store", so it is question five rather than an appendix.

## 6b. The one idea that is not visual

Every deck in this corpus is a single post. **@epictodo's is episode one.** Its
cover reads "TOP 10 Things to do — Crete — **Pt.1 Chania**", which turns one
post into a reason to follow and a second post into something people are
already waiting for. Nothing else in forty-six harvested decks does this.

It costs nothing to copy and it is the only mechanic here that compounds, so
`tt-10` carries it: "חלק 1: חאניה", and a caption that ends by asking what
goes in part two.

## 7. Why the TikTok round is a different kind of clone

The Instagram round could never see more than **2 slides per source**: the
public embed caps there, and the post page is behind a login wall. Every one
of the ten Instagram-sourced clones is therefore 2 observed slides plus 5 to 8
that apply the system seen on those two — extrapolation, not copying. Each of
those specs now carries `observedSlides` and a `fidelityCaveat` saying so, so
the gap cannot be lost.

A TikTok post page serves **every** slide. `tt-1` through `tt-5` are cloned
from sources observed in full — 12 slides and 21 slides — which is the whole
reason this round is worth more than the last one, independently of the like
counts.

| round | source slides seen | clone slides | honest description |
| --- | ---: | ---: | --- |
| Instagram (`he-*`, `hi-*`) | 2 | 7-10 | system copied, content extended |
| TikTok (`tt-*`) | 12 and 21 | 12 and 21 | copied slide for slide |

One source deserves a note of its own. **@lexilaube, 354,828 likes on 155,000
followers** — 2.3x the follower count, and by a wide margin the biggest post
in the entire corpus, bigger than anything found on TikTok by about 5x. Only
2 of its slides were ever visible. Recovering the rest needs a logged-in
session; the embed caps at 2 and the post page walls. Until then `hi-3` is a
clone of its first two slides and an extension of the rest.

## Files

- `harvest/tt-drain.mjs` — reads a queue of known post URLs, cold, never warms
- `harvest/tt-explore.mjs` — the same reader plus related-rail expansion
- `harvest/tt-final.mjs` — search harvester, `TT_COLLECT_ONLY=1` for queue-only
- `harvest/supervise-*.sh` — one supervisor each, **single-instance locked**
  (two supervisors kill each other's browser, which looks exactly like a
  TikTok block and cost several hours before the lock existed)
- `analyze/tt-contact.mjs` — contact sheet per deck, numbers in the header
- `analyze/tt-clone-brief.mjs` — the per-clone brief, type read from the render
- `analyze/apply-tt-marks.py` — the check/warning/cross marks, applied centrally
- the probes behind every claim above, each runnable on its own:
  - `recon/tt-dom.mjs` — a post page read cold, the one that disproved the
    rate-limit conclusion
  - `recon/search-probe.mjs` · `recon/acct-probe.mjs` · `recon/tag-probe.mjs`
    — the three walled surfaces, and `tag-probe` also shows a second profile
    reading a post page cold
  - `recon/music-probe.mjs` — where the sound title lives, and how to tell the
    post's own sound from a related post's
  - `recon/ig-post-probe.mjs` — the Instagram login wall behind the 2-slide cap
  - `recon/bidi-check.mjs` — measures where a leading number lands in Hebrew
  - `recon/shot-page.mjs` — screenshots a local page for checking before handover
- `analyze/grey-audit.mjs` · `analyze/tt-ready-check.mjs` — the two gates every
  clone passes before it is called finished

## 7. Round two of the harvest — 230 decks, all at or above 50,000 likes

Ranked by saves per like, which is the metric that separates a deck people keep
from a deck people scroll (see §4). The ranking is reproducible:

    python - <<'PY'   # harvest/tt-final.jsonl, dedupe on id, sort by saves/likes

**The single best-performing shape in the corpus is a list of named photo spots
in ONE city.** Not a country, not a theme — one city, and each slide is an
address.

| saves/like | saves | account | what it is |
| ---: | ---: | --- | --- |
| 1.21 | 66,800 | @thesecretholidayclub | Amsterdam, 11 slides |
| 1.06 | 123,700 | @travellingcloset1 | Paris, caption is literally `📍 Avenue de Camoens 📍 Jardins du Trocadero 📍 Avenue de New York ...` |
| 0.99 | 55,500 | @caitlinnixon1998 | Budapest, 14 slides |
| 0.95 | 57,000 | @klyvytee | "My favourite picture spots in Budapest" |
| 0.91 | 107,400 | @travel.in.the.world1 | London, 22 slides |
| 0.82 | 142,900 | @kelseyinlondon | Budapest |
| 0.71 | 243,500 | @travlprep | Budapest |

Two things fall out of this and neither was visible in round one:

**a. The caption carries the addresses.** @travellingcloset1 puts every pin in
the caption, so the post is savable as a text list on its own. That is probably
WHY it saves: the saver is saving a list, not a mood.

**b. Budapest is four of the top seven.** Not Paris, not Rome — Budapest. The
corpus is not big enough to call that a law, and it may be an artefact of which
queries ran. What it does justify is building the city-spots mechanic on
Budapest first and measuring, rather than guessing a city.

What this does NOT say: nothing here measures the Israeli audience, and nothing
here is evidence that a Hebrew clone of a Budapest deck performs like the
English original. It ranks what already worked, in English, on a global feed.

## 8. The harvest closed — 524 sources, and the §7 finding held

The collector finished its query list and the reader drained the queue to zero
(a clean finish, not a cap): **524 unique photo carousels, every one at or
above 50,000 likes.** That is 2.3x the sample §7 was written on, so the ranking
there can now be checked rather than trusted.

**It held.** Ranked by saves per like, the top of the corpus is still "named
places in ONE city", and it is now the top twelve almost without exception:

| saves/like | saves | account | city |
| ---: | ---: | --- | --- |
| 1.21 | 66,800 | @thesecretholidayclub | Amsterdam |
| 1.12 | 77,800 | @lddn16 | London |
| 1.10 | 82,500 | @ayloparis | Paris |
| 1.09 | 64,600 | @tomassshill | Rome — **restaurants** |
| 1.06 | 123,700 | @travellingcloset1 | Paris — caption is the pin list |
| 1.01 | 53,400 | @breaaad.pitt | Bangkok — **food** |
| 1.00 | 62,600 | @thefoodinbox | Tokyo — **places to eat** |

**What the bigger sample ADDS, and §7 could not see:** the sharpest variant is
not photo spots, it is **named places to EAT in one city**. Three of the top
twelve are restaurant lists, and none of the §7 top seven were. A deck of
"eight restaurants in Rome, by name" is the obvious next build, and it is a
different mechanic from `tt-25`, which lists viewpoints.

**Still not measured:** none of this touches the Israeli audience, and nothing
here says a Hebrew clone performs like the English original. It ranks what
already worked, in English, on a global feed. The first real number will come
from `ai__index` itself.

## 9. Measured, not guessed: what the 524-deck corpus says about layout

Everything below is computed over the harvest with `analyze/measure-slides.mjs`,
which scores every frame for text coverage, text position, colourfulness,
contrast and darkness without OCR (glyphs make dense short-range luminance
gradients in horizontal runs; photographs do not). Decks are split into top and
bottom quartile by saves per like, n=524.

### a. Slide count has a hard ceiling

| slides | n | median saves/like |
| --- | ---: | ---: |
| 2-5 | 53 | 0.30 |
| **6-7** | 102 | **0.50** |
| 8-9 | 92 | 0.44 |
| **10-11** | 106 | **0.51** |
| 12-13 | 51 | 0.50 |
| 14-16 | 41 | 0.39 |
| 17-20 | 35 | 0.32 |
| **21+** | 44 | **0.17** |

Corpus median is 0.44. **Six to thirteen slides is the band. Past sixteen it
falls away and past twenty it collapses to well under half the median.** Two of
our decks, `tt-2` and `tt-4`, are 21 content slides each, which is the worst
band in the corpus.

### b. More text, higher up, beats less text

Content slides, top quartile against bottom:

| | top | bottom | |
| --- | ---: | ---: | ---: |
| text coverage of frame | 0.0130 | 0.0043 | +207% |
| rows of text | 4.0 | 1.5 | +167% |
| where the text starts (0 = top) | 0.242 | 0.412 | starts higher |
| height of the text block | 0.293 | 0.044 | +567% |

This reverses the obvious reading of "too much text". The decks people save
carry MORE text, starting HIGHER, in a TALLER block. What fails is not density,
it is a thin line of copy floating in the middle of a photograph.

### c. The top of the corpus is not a photo with a caption

The two highest saves-per-like decks come from different accounts
(@vitortrip 1.54, @trip.com 1.31) and are built the same way, which makes it a
pattern rather than one creator's style:

- the background is a **blurred** photograph of the destination, so nothing
  competes with the type;
- the slide is a **vertical chain of three to five stops**;
- **every item carries its own small thumbnail**, rounded, rather than one big
  photo per slide;
- titles sit in a **coloured block**, details in a second colour;
- each stop states **hard numbers** — ticket price, opening hours, walking time
  to the next stop;
- the whole city fits in **five to seven slides**.

The density the owner asked for ("four to a slide, each in a quarter") is this.
Our format — one large photograph with a line of outlined text over it — is the
shape of the BOTTOM quartile, not the top.

**What is ours to copy and what is not:** the principles above are the finding.
The specific artwork is theirs. Our build takes the structure (blurred backdrop,
per-item thumbnails, coloured title blocks, hard numbers, few dense slides) and
renders it in our own visual language.

## 10. Outside research, and a correction to section 9

Section 9 concluded that a picker built on colour could not work, because
colour separated the top and bottom quartile of the corpus by only 0.1-0.4
standard deviations. **That conclusion was wrong, and the reason is restriction
of range: every deck in the corpus already cleared 50,000 likes.** Comparing
excellent against excellent cannot show what separates adequate from
excellent. The corpus answers "what distinguishes the best of the good", not
"what makes a photograph work".

### a. What the algorithm actually rewards

TikTok's own figures put carousels at 1.9x the likes, 2.9x the comments and
2.6x the shares of video, and an analysis of 700,000 posts found 81% higher
engagement. The ranking signals for Photo Mode are swipe-through rate, dwell
time, reverse swipes and completion rate, with **completion rate — the share of
slides the average viewer reaches — the primary one.** Save rates on Photo Mode
reach 5%, roughly ten times typical video.

This is the mechanism behind the measured collapse at 21+ slides in section 9a,
and behind the owner's instinct that padding a deck with weak slides costs us
the last slide.

### b. The first slide carries most of the outcome

Practitioner consensus puts roughly **80% of swipe-through rate on slide one**.
What works there is a curiosity gap: state the result, the problem or the bold
claim and withhold the how. Keep slide one to **eight to twelve words**. A
visible swipe cue is reported to lift swipe-through by 15-30%.

### c. Colour, from the tourism literature rather than from taste

Peer-reviewed work on Instagram travel imagery finds **saturation is the single
most critical attribute** viewers respond to, ahead of caption style, hue and
brightness. High saturation on nature subjects shortens perceived psychological
distance, which reads as "I could actually go there". Lightness and chroma
significantly predict likes, and orange, yellow, blue and violet are the hues
that contribute most to popularity.

So the picker is rebuilt on saturation first, warm-hue presence second, chroma
and contrast third — and calibrated against a wide range of candidates rather
than against an elite corpus that has none.

Sources: sciencedirect.com/science/article/pii/S0160738321000761 ·
mdpi.com/2071-1050/15/19/14503 ·
sciencedirect.com/science/article/abs/pii/S0261517720300364 ·
reelbase.io/blog/tiktok-photo-mode-algorithm-explained ·
postnitro.ai/blog/post/carousel-swipe-through-rate-optimization

## 11. The scroll stopper, and the admission that the corpus cannot measure it

Owner, 7.10: **"the SCROLL STOPPER is the most critical thing in a TikTok."**
He also rejected a specific frame — the Larnaca cover — as "good saturation,
but it falls down by being just a photo of rooftops from the street: lots of
colours and nothing WOW in it", while accepting the Amalfi cover because it is
a good sunset. "A sunset is always good. The sea is always good, if it is an
impressive photo."

### a. What this corpus cannot tell me, and why I should have said so earlier

**Everything measured in sections 7-10 is saves per like.** Both numbers are
recorded only after someone has already stopped scrolling. There are no
impressions in the harvest and TikTok does not expose them. So the corpus
describes what makes a deck WORTH KEEPING once it is open, and is silent on
what makes anyone open it.

That is not a small gap. It is the difference between the question he calls
most critical and every number quoted here so far. Section 9 was written as if
layout findings covered the whole funnel; they do not.

### b. What the top of the corpus actually opens with — and the surprise

Covers of the six highest saves-per-like decks, looked at rather than measured:

| deck | s/l | slide 1 is |
| --- | ---: | --- |
| @vitortrip | 1.54 | **already a full itinerary** — Day 1, five stops, thumbnails, prices |
| @itsjustinjapan | 1.50 | a title card for an app, with an explaining sentence |
| @vitortrip | 1.39 | **already an itinerary** |
| @trip.com | 1.31 | **already an itinerary** — Arc de Triomphe, €16-22, walk times |
| @vitortrip | 1.31 | **already an itinerary** |
| @sineadtravels | 1.23 | **already a grid of apps** |

**Five of the six have no cover slide at all.** The first thing in the feed is
the dense content. Our decks all open with a dedicated cover, which is a choice
nothing in the corpus supports and nothing in the corpus refutes — these are
save-rate leaders, and per (a) that is the wrong metric to settle it with.

### c. Outside research, which is where the answer has to come from

- **A carousel's first slide is the thumbnail and the hook at once.** It is the
  only slide anyone sees before deciding, so it has to open a loop rather than
  describe the contents — a curiosity gap, a bold claim, a question.
- **The visual has to stop the scroll on its own**, independently of the words.
  A pattern interrupt is something visually unexpected: an unusual angle,
  jarring contrast, scale.
- **People in the frame outrank colour.** Visual attention research: depictions
  of human beings, heads especially, are prioritised during scene exploration
  INDEPENDENTLY of low-level physical saliency, and the presence of social
  information weakens the influence of colour and edge saliency on gaze.
- Travel publishing says the same as a working rule: a magazine wants a
  landscape **with people for a cover**, and uses the versions without people
  inside, where landscapes alone are "two a penny". Under 2% of travel photos
  shared socially are landscape only.

That last pair is the explanation for the frame he rejected. The picker ranks
saturation, chroma, contrast and busyness. **An aerial of colourful rooftops
beats a sunset on every one of those terms** — more edges, more colour
variance. The measurement was working correctly and measuring the wrong thing.

### d. What was changed

- `lib/cover.js` — the cover alone is re-ranked on what the stock library says
  is IN the frame: a person, sunset or golden hour, sea; penalising alley,
  rooftops, facade. The rejected Larnaca frame scores 0.55, the accepted Amalfi
  frame 1.375, a figure watching a sunset over water 1.86.
- Both covers rewritten from labels into hooks. "חוף אמלפי / בלי לשרוף את כל
  התקציב" withholds nothing, so there is no reason to swipe.

### e. Where the knowledge is still thin — named, not hidden

1. **Scroll-stopping itself is unmeasured here.** No impressions, no reach, no
   3-second retention. Everything in (c) is borrowed, and most of it was
   written about video ads, not Hebrew photo carousels.
2. **Nothing is known about the Israeli feed specifically.** The corpus is
   English and global. Section 7 already established that destination rankings
   do not transfer; there is no reason to assume hook styles do.
3. **The picker has no semantics.** It cannot see a person, a face, a horizon
   or a landmark — only luminance and colour statistics. `lib/cover.js` works
   around this by reading someone else's words about the photo, which is a
   proxy and fails whenever the alt text is thin or wrong.
4. **Composition is entirely absent.** Leading lines, foreground scale, rule of
   thirds, depth, negative space for type — none of it is measured or ranked.
5. **No A/B evidence of our own.** Nothing here has been tested on his account.
   The first real measurement will be the first posts.
6. **Cover versus no cover is untested**, and (b) says the top of the corpus
   leans the other way from us.

### f. How to falsify (d)

Post the same deck twice on different days with the two covers — one a figure
against a sunset, one the rooftops — and compare reach, not likes. Until then
(d) is a reasoned bet, not a result.

Sources: later.com/blog/scroll-stopping-content ·
socialinsider.io/blog/tiktok-carousel · usevisuals.com/blog/tiktok-carousel-post-best-practices ·
ncbi.nlm.nih.gov/pmc/articles/PMC5371661 (social features vs physical saliency) ·
ncbi.nlm.nih.gov/pmc/articles/PMC5526566 · fstoppers.com/travel/one-thing-your-travel-photos-are-missing-718366 ·
tandfonline.com/doi/full/10.1080/13683500.2022.2086451

## 12. The corpus had five more columns than I was reading

Everything below is measured over the 666 decks in `harvest/tt-final.jsonl`
with `analyze/corpus-stats.mjs`. None of it needed new data: comments, shares,
the sound and whether it is original, the hashtag list and the full caption
were harvested from the start and never opened. The only number used until now
was saves per like.

Corpus medians: **saves/like 0.359 · shares/like 0.104 · comments/like 0.0032.**

### a. The hashtag cap I was enforcing has nothing behind it

| hashtags | n | saves/like |
| --- | ---: | ---: |
| 0 | 10 | 0.095 |
| 1-3 | 23 | 0.188 |
| 4-5 | 61 | 0.300 |
| 6-8 | 22 | 0.306 |
| 9-12 | 32 | 0.331 |
| 13-20 | 61 | 0.293 |
| **21+** | **457** | **0.413** |

The build refused any deck with more than five, citing a measurement I could
not find again. It is contradicted: more tags track with better saving, and
the heaviest bucket is both the best and what two thirds of the corpus does.

⚠️ It is also the majority behaviour, so this is correlation at its weakest —
"everyone does it" and "it works" are indistinguishable here. The rule was
changed to a FLOOR (warn under four) rather than a ceiling, because the only
clearly bad bucket is the sparse one.

### b. Our captions were in the right band; very short ones are the failure

| caption | n | saves/like |
| --- | ---: | ---: |
| under 30 chars | 292 | 0.219 |
| 30-69 | 189 | 0.434 |
| **70-119** | 63 | **0.503** |
| 120-219 | 54 | 0.499 |
| 220+ | 68 | 0.420 |

A caption under thirty characters costs more than half the corpus median.

### c. Ten to thirteen slides, and ours are eight

| slides | n | saves/like |
| --- | ---: | ---: |
| 2-5 | 87 | 0.147 |
| 6-7 | 135 | 0.438 |
| 8-9 | 113 | 0.369 |
| **10-13** | 183 | **0.466** |
| 14-20 | 92 | 0.313 |
| 21+ | 56 | 0.137 |

Both tails collapse. Our decks are 8 frames (6 content + his closing pair),
which sits in the weakest of the three middle bands.

### d. Naming the place early is the strongest caption signal found

| caption names a place in the first ~48 chars | n | saves/like |
| --- | ---: | ---: |
| yes | 100 | **0.567** |
| no | 566 | 0.322 |

### e. Sound is not the lever I assumed

| sound | n | saves/like |
| --- | ---: | ---: |
| trending / licensed | 457 | 0.349 |
| original | 209 | 0.376 |

A real difference but a small one, and in the opposite direction to the usual
advice. Worth knowing mostly because it means the caption line telling him to
"pick a trending sound on the day" was handing him a decision that barely
moves the number.

### f. Opener shapes — directional only, every bucket is thin

| caption opens with | n | saves/like |
| --- | ---: | ---: |
| a superlative ("the ultimate…") | 20 | 0.691 |
| a number | 24 | 0.583 |
| a question | 28 | 0.474 |
| how / what / why | 10 | 0.304 |
| anything else | 575 | 0.348 |

⚠️ Twenty decks is not a finding and is not quoted as one. It points the same
way as the outside research on hook formulas, which is the most that can be
said.

## 13. What the top of the corpus actually puts on a slide — read, not inferred

Owner, 6.10: *"Do you notice the problem, that for Paris he talked about the
Eiffel Tower, the Arc de Triomphe and the Champs-Élysées, and you talked about
eating some particular food?"*

He is right, and checking it on our own specs makes it worse than one slide.
The twenty items in the Amalfi deck: 4 towns, 4 transport, 4 attractions,
**4 food**, 4 mistakes. **Eight of twenty are things anyone came for.**

So I opened the frames of the highest-saving decks and read them. Four distinct
forms sit at the top, and what they share matters more than how they differ.

### a. @vitortrip — 1.54 saves/like, the highest in the corpus

Rome, "DAY 2", **five stops on one slide**:

> PIAZZA NAVONA · TIME SPENT: 30 MIN · PRICE: FREE
> ↓ 5 MIN WALK
> THE PANTHEON · TIME SPENT: 45 MIN · PRICE: €5
> ↓ 8 MIN WALK
> TREVI FOUNTAIN · 45 MIN · FREE
> ↓ 10 MIN WALK
> SPANISH STEPS · 30 MIN · FREE
> ↓ 15 MIN WALK
> SUNSET AT VILLA BORGHESE GARDENS · 1 HOUR · FREE

Mechanically: blurred backdrop · "DAY 2" in a white rounded box · landscape
photo left, text right · **the name in a yellow highlighter box** · two
labelled lines under it in white boxes · a dashed arrow down the left with the
walk time in a white pill between every pair.

**Every stop is a landmark.** Not one obscure thing.

### b. @sanazmagole — 1.20, and it has no design at all

Black text on plain white. A heading, `RESTAURANTS`, and twenty restaurant
names with dashes. No photograph on the slide. It reads as a screenshot of the
Notes app, and it is saved more than once per like.

### c. @soff.icina — 1.22, 119,700 saves

A real phone photo — hands holding crêpes, a Paris street, the shopfront of
one of the places named — with **the plain white iOS "add text" box** pasted
over it. Apple emoji inline. Six named crêperies and "and more 👨‍🍳".

### d. @thesecretholidayclub — 1.21

A 2×2 grid of four photographs of ONE place, with the place name in a plain
white rounded box in the middle. `Vondelpark`.

### e. What all four share, and where ours differs

| | top of corpus | ours |
| --- | --- | --- |
| items per slide | one named thing, or a tight list of names | four unrelated items |
| what is named | landmarks and businesses by name | 12/20 niche |
| type treatment | **dark text in a white box** | white type with a heavy black stroke |
| facts | a labelled schema — TIME SPENT, PRICE | one free-prose line |
| order | a route, with transit between stops | themed sections, like a magazine |
| photos | a phone photo, or stock tiles | stock only |

**Three of the four use no outlined type anywhere.** They set a plain white
box and put dark text in it.

⚠️ **This conflicts with a standing instruction** — white text with a black
outline, "exactly like the iPhone" — and that instruction is his, so it is not
being changed here on the strength of this. It is reported. What the top of
the corpus does is the white box; what he asked for is the outline. The two
are different looks and he should get to pick knowing that.

### f. The structural finding, which is the one that matters

Ours is a magazine: "הערים", "איך זזים", "מה עושים", "אוכל ומחיר",
"מה לא לעשות". Theirs is a **route**: Day 2, five stops, in walking order,
with the time between them.

A magazine is read once. A route is saved because tomorrow you walk it.

## 14. Caption patterns, measured — and his instinct is the strongest one

663 captioned decks, median saves/like **0.361**. Each pattern below is a
regex over the caption; lift is against that median. Under 25 decks is marked
thin and is not treated as a finding.

| pattern | n | saves/like | lift |
| --- | ---: | ---: | ---: |
| **the words itinerary / plan / route / guide** | 34 | **0.811** | **+125%** |
| a duration — "5 days", "5 hours" | 17 | 0.781 | +116% ← thin |
| speaks as a local or resident | 6 | 0.663 | +83% ← thin |
| **an explicit save CTA** | 62 | **0.649** | **+80%** |
| "my go-to", "my favourite" | 12 | 0.640 | +77% ← thin |
| **money — free / cheap / budget / a price** | 34 | **0.630** | **+74%** |
| **a superlative** | 58 | **0.581** | **+61%** |
| **a flag emoji** | 95 | **0.500** | **+38%** |
| a count — "20 things", "7 spots" | 19 | 0.469 | +30% ← thin |
| hidden / secret / underrated | 30 | 0.444 | +23% |
| any emoji at all | 249 | 0.440 | +22% |
| a question mark | 49 | 0.436 | +21% |
| first person "my / I" | 139 | 0.386 | +7% |
| a mistake or warning frame | 30 | 0.353 | **−2%** |
| "part 2" — a series | 28 | 0.159 | **−56%** |

### What this changes

1. **Route framing is the single strongest signal measured, anywhere in this
   research.** The owner's own example — *"המסלול המושלם ל-5 ימים בפריז
   (מאחת שגרה שם)"* — is a duration plus a superlative plus a credibility
   claim, which are the first, second and third strongest patterns. He got
   there by instinct before any of this was measured.

2. **A flag emoji is a free 38% and we use none.** 95 decks is a solid n. Now
   possible at all, since Apple emoji only started rendering today.

3. **First person alone does almost nothing (+7%, n=139).** What lifts is the
   SPECIFIC claim — "my go-to", "as someone who lives here". A generic "I" is
   not a persona.

4. ⚠️ **The negative frame does not transfer.** The outside hook research says
   loss aversion makes warning framing win. On this corpus a mistake frame in
   the caption is −2% with n=30. It is still used on a SLIDE in our decks;
   nothing here says that is wrong, only that it earns nothing in the caption.

5. **"Part 2" is the worst pattern found, −56% with n=28.** A deck that
   announces itself as a continuation is a deck most people have no reason to
   open. Worth knowing before splitting a long destination into parts.

6. **Caption length: 19-30 words.** 1-5 words is 0.231 against a 0.361 median.

| words | n | saves/like |
| --- | ---: | ---: |
| 1-5 | 279 | 0.231 |
| 6-10 | 161 | 0.391 |
| 11-18 | 84 | 0.480 |
| **19-30** | 53 | **0.594** |
| 31+ | 86 | 0.420 |

## 15. @hotelmozil, measured for the first time — and it has the number I said we lacked

`analyze/own-account.mjs` over `harvest/own/hotelmozil/`. 27 of his posts were
captured with metadata and have been on disk since 3.10. I wrote in
research/GAPS.md that his account had never been measured and called it the
most relevant data available; it was also already here.

**They carry VIEWS.** Every time I have written that the corpus cannot say
anything about stopping a scroll — because saves and likes are both counted
after someone stops — that was true of the harvested corpus and false of his
own account.

### a. The baseline

| | |
| --- | --- |
| posts with views | 27, all photo carousels |
| median views | **4,000** |
| best post | 8,800 views — only **2× the median** |
| median like rate | **0.96%** of views |
| median save rate | **0.28%** of views |

Two things follow. **There has been no breakout** — the best post is twice the
median, so nothing has ever caught. And the save rate sits at 0.28% against
the 3% that outside writing calls healthy; his two best posts reach 2.38% and
2.35%, which is nearly there, so the ceiling is not the account.

### b. What his best posts have in common

| views | like% | save% | caption |
| ---: | ---: | ---: | --- |
| 8.5k | 1.80% | **2.38%** | איזה כיף היה בתאילנד #תאילנד #טיול #המלצות |
| 6.9k | 1.28% | **2.35%** | #המלצות #תאילנד #חופשה |
| 2.0k | 0.96% | **1.62%** | …קראבי הוא על מפרץ האנדמן… (the one long caption) |
| 8.1k | 1.39% | 1.38% | #7eleven #thailand #המלצות #תאילנד |

Every one is **travel, in Hebrew, tagged #המלצות**. The posts carrying
`#בינה_מלאכותית #ai` — his previous app — run 0.09% to 0.33% save rate, up to
**twenty-six times worse**. The account already told us which half works.

### c. ⚠️ A bug in this analysis, found before it was quoted

`post.json` stores the counts as strings. Every comparison coerced silently
and looked right, but the median of an even-length list concatenated two of
them — `"2518" + "3606"` / 2 reported **12,591,803 views**. Three numbers in
the first run were wrong by four orders of magnitude and all of them looked
like plausible formatted output ("18032k").

Fixed by coercing at load, and `num()` now prints `??` for anything
non-finite rather than formatting it into something readable. This is the same
failure as every other one in this file: the convenient branch produced a
number instead of an error.

## 16. His own two best posts, read frame by frame — and they are far simpler than anything I built

The two highest save rates on @hotelmozil are 2.38% and 2.35%, both Thailand.
I opened their slides.

### a. What they are

- **3:4, not 9:16.** 2160×2880. He already told me his library is 3:4 and I
  render 1080×1920 anyway; his own best posts are the former.
- **One real travel photograph, full bleed.** No blur, no scrim, no backdrop,
  no thumbnails, no grid.
- **White type with a black outline, centred, sitting in the top third.** His
  standing instruction is not a preference he imposed on me — it is what his
  own best-performing posts do.
- **A heading, then a fixed schema**, one line per item:
  `קופיפי 🏝️ - טיסה + מעבורת` · `צפון תאילנד - נובמבר עד פברואר`
- **A repeated emoji as a bullet** on every line of one of them (🏝️), and a
  👇 under the heading. The other has no emoji at all, so they are a tool and
  not a requirement.
- **No brand colour. No boxes. No yellow highlight. No green numbers.**

### b. The thing that makes it read as a person

The bottom of the top post carries a parenthetical aside in his own voice:

> (לפעמים יש גשמים גם בעונה "הטובה" ודווקא לא בעונה שהמזג אוויר טוב) - מאוד דינמי

It hedges. It admits the list is not reliable. It is an opinion, in the first
person, placed after the facts.

**Our decks contain nothing like it.** Every line is a clean verified fact with
a figure in it, which is exactly what I built the gates to enforce. A deck
where every line is a perfect fact reads as generated, because a person
writing from experience always has one line that says "but".

### c. What this settles, and what it does not

**Settles:** the outlined-white-type instruction matches his own best work, so
§13e's "three of the four top corpus decks use a white box instead" is a fact
about other accounts and not a reason to change ours.

**Does not settle:** his posts are a dense list over one photograph, and the
corpus leaders are a route with thumbnails and a labelled schema. Those are
different formats and both perform. His sample is 27 posts with no breakout;
the corpus leaders have 90,000+ saves each. Neither is evidence against the
other, and I should stop treating each new top deck I read as the answer.

## 17. Both harvest routes are closed, and the second one for a structural reason

### a. TikTok — three doors, all shut

| surface | state |
| --- | --- |
| search | refused for this IP, established earlier |
| related-posts rail | returns 0 for every seed |
| profile pages | **794 of 796 returned zero carousels** |

The corpus went from 665 to **846** and then stopped for an entire night while
a supervisor dutifully restarted a crawl that had nothing to crawl. The
supervisor was right to log it; I was slow to read what it was saying.

### b. Instagram — the filter needs a number the source does not have

The Instagram track reaches posts through Brave and DuckDuckGo rather than
Instagram's own surfaces, so the TikTok wall said nothing about it, and it
does answer: ten shortcodes, ten HTTP 200s, each carrying handle, follower
count, post count, caption and images.

**It does not carry likes.** Not once in ten. And the harvester's only
selection rule is `likes >= 50,000`, so `num(null) → null → rejected` on every
post, forever. `kept=0` was never about the content.

Three bugs had to be cleared before that was visible, each of which looked
like success from outside:

1. a crashed launch poisons the browser profile, so every retry on the same
   directory fails — fresh profile per run;
2. the fetch loop marked a code **done before fetching it**, so one crash left
   all 55 recorded as finished and later runs reported `examined=0` while
   exiting 0;
3. enumeration runs all 266 search queries before fetching anything, so codes
   already on disk waited hours — `SKIP_ENUM=1` added.

### c. The judgement, and why the work stops here

Follower count IS available and would serve as a proxy floor. I am not
switching to it, because of what the ten posts turned out to be:
`beautifuldestinations`, `islands.inspiration`, `athenstravel`, `tiptravel` —
large ENGLISH travel accounts. That is the same audience as the 846 decks
already harvested.

So the cost is hours and the yield is more of what I have, while the gap I
marked 🔴 — **nothing at all about what works in a Hebrew feed** — stays
exactly where it was. The only Hebrew data in this project remains his own 27
posts, which are also the only ones with view counts.

⚠️ This is a decision made without asking, and it is reversible: delete
`harvest/.keepalive-ig.stop` and swap `LIKES_FLOOR` for a follower threshold.

## 18. ⚠️ A finding that did not survive its own re-check

I reported, from 829 decks, that a "mistakes / what not to do" framing measures
**0.170 saves per like — half the corpus median**, and drew from it that the
closing slide on both our decks is the one shape that hurts.

Then I ran a near-identical regex over the same rows:

| regex | n | median | lift |
| --- | ---: | ---: | ---: |
| `mistake\|avoid\|don't\|never\|wrong\|regret\|scam` | 42 | 0.291 | **−15%** |
| `mistake\|don't\|avoid\|never\|wrong` | 24 | 0.170 | **−50%** |

Two words of difference moved the answer by a factor of three. And inside the
24 the spread runs 0.001 to 0.745, with **7 of 24 above the corpus median** —
a median over that is barely a description of anything.

**Withdrawn.** There is no basis for saying a mistakes slide costs anything.

**The rule this leaves:** a pattern measured by one regex is a measurement of
the regex. Before quoting a caption finding, run a second phrasing of the same
idea and report the result only if both agree. Applying that test to §14: the
patterns with n ≥ 30 and large effects — route framing, the save CTA, money
words, naming the place early — all hold. The thin ones were already marked.

## 19. The night of 8.10: the route decks rebuilt with nothing left to judgement

His instruction, twice, and it is the whole of this section: *"from now on, by
definition, you guess nothing. Not the size of each tile — check the precedent
you took the inspiration from. Not what is interesting in Paris — check the
precedent. Not even what to do on each day. You don't need to invent the wheel,
you need to do like what already exists and works, with no judgement of yours
at all. In anything."* And then: *"the same goes for copywriting. I don't want
any creativity from you. Pure data. I expect you first to work out what data
you are missing, collect exactly that, and build the examples after every
decision from A to Z, from the largest to the smallest, is based on data."*

What follows is what was collected and what it decided. Where a judgement
remained, it is named rather than hidden.

### 19a. The precedent is three decks, and they agree on everything

The three highest-saving walking-route decks in the 847-deck corpus:

| deck | | saves/like |
|---|---|---|
| `7597919401312111894` | Rome, 3 days | **1.538** |
| `7597489942712945942` | Paris, 5 walks | **1.390** |
| `7600316183270722838` | London, 3 days | **1.307** |

Read frame by frame (`analyze/deck-sheet.mjs`), they do not merely resemble
each other — across their **15 content slides they do not differ once**:

* **exactly five stops a slide**, 15 of 15
* under each name, **two labelled fields and nothing else**: TIME SPENT and
  PRICE. One may be dropped when it does not apply — Rome's "DINNER IN
  TRASTEVERE" carries a price and no duration — but prose never replaces them
* a **travel time on every gap** between stops, beside a drawn arrow
* one heading box at the side reading starts from: "DAY 1", "ITINERARY 1",
  "DAY 2 — THE SOUTH BANK"
* a closing slide that asks: "ROME DONE / WHICH CITY NEXT? / COMMENT"

Our decks had three stops a slide, prose under each name, no travel time at
all, two heading boxes on opposite edges, and a line of commentary across the
bottom that none of the three has. All of that was mine.

### 19b. Measured geometry, and the frame I read by mistake

Every number in `tt-route` now comes off the Rome frame at x2 and x3
(`analyze/crop.mjs`), confirmed against the sharpness bands:

```
heading box    top 264, height 60, inset 144 from the start side
photo tile     355 x 215, radius 14, 4px black border, inset 127
tile -> text   13            text column 293 wide
first tile     top 355       row pitch 267  (tile 215 + connector 52)
name           serif, yellow highlight, ~27px
facts          two labelled lines, ~17px, white highlight
walk chip      white pill, ~21px caps, centred in the 52px gap
```

Two corrections fell out of this. **The first sheet I built read `01.jpg`,
which is the SECOND slide — `00.jpg` is the cover.** A "measured" cover rule
derived entirely from second slides was two minutes from being written down.
**And the row was mirrored the wrong way**: the sources are English and put the
photo on the left, which is where reading starts; in Hebrew that is the right,
and ours had it on the left — the back of the row.

The source runs to y=1638 and we assume TikTok's furniture starts at 1590. The
precedent wins on geometry, and the last 48px of the fifth stop sits inside
that band. Recorded rather than resolved.

### 19c. The cover: his own account, not the corpus

13 of 13 travel covers on @hotelmozil name their destination — from the 35,900
view post down to the 632 one. 12 of the 13 highest-saving covers in the corpus
do the same. It is the only cover property this project has found that is
unanimous, and **two of our three covers failed it**: Larnaca's said "an hour's
flight from Tel Aviv" and never said Larnaca, and the Amalfi deck's said
**"flew to Rome?"**. `lib/cover-copy.js` is now a gate, and it checks both
directions — the destination must appear, and no other destination may appear
instead.

For the wording itself his account outranks the corpus, because it is Hebrew,
it is his audience, and **views are the only scroll-stopping number in this
project** — saves and likes are both counted after someone has already stopped.
His 13 travel covers, by median views:

| | with | without |
|---|---|---|
| emoji row under the headline | **23,250** (n=8) | 1,989 (n=5) |
| first person, or a question | **23,250** (n=8) | 1,989 (n=5) |
| a rank count ("top 3") | 1,989 (n=3) | **22,050** (n=10) |

**The first two rows split the same 8 against the same 5.** They are perfectly
collinear here, so this says the cluster differs, not which feature does the
work. The third is the clean one: every "top 3" cover is in his bottom five.

So the cover copies the single most-viewed one he has — 35,900 views, "how do
you get from place to place in Thailand?": a practical question ending in the
destination, then a wordless emoji row. He named the question for a route deck
himself: *"people flying to Larnaca, who want to know what to do there."*

### 19d. Emoji, decided by counting

His captions are almost emoji-free — **1 of 44**. His slides always have them —
**3 of 3** read by eye, always welded to a name or a sentence end. So the two
go different ways, and neither by preference.

On slides: a pin on every stop. Not chosen — in 829 corpus captions the round
pin appears **100 times**, twice the next (the sparkle, 57) and fourteen times
the square pin we had been using (7). It means "a place", which is what every
row is, so one rule covers every row and none needs a decision.

On the cover: the destination flag, then plane, pin, sparkle. Fixed, so no deck
gets an emoji picked for it.

### 19e. Where the content comes from, destination by destination

* **Paris** — the precedent deck's own 25 stops, so not one landmark was chosen
  here. One substitution: **Centre Pompidou closed on 22.9.2025 and reopens in
  2030.** It is on the precedent deck. Copying content without checking it
  would have shipped a closed museum. Le Marais replaces it, taken from the
  other Paris precedent, which lists it in the same stretch.
* **Larnaca** — no route-format Cyprus deck exists in the corpus (the best
  saves at 0.409 and is a photo dump), so the stop list is the Larnaka Tourism
  Board's and Visit Cyprus's own "main attractions".
* **Amalfi Coast** — likewise none, so the list is italia.it's, the Italian
  national tourism board.

### 19f. Every figure verified, and three the precedent got wrong

Prices come from the operator's own site, never from another deck
(`research/*-figures.json`, a source per line). Copying the precedent's numbers
would have shipped at least three wrong ones, and one pattern it never
mentions:

> **French state monuments now charge non-EEA visitors more, and Israelis are
> non-EEA.** Louvre 22 to **32 euro** (from 14.1.2026), Sainte-Chapelle 16 to
> **22** (from 12.1.2026), Palais Garnier 15 to **25**.

Two rows shipped priced "varies by exhibition" and every gate passed them,
because the facts gate asks for figures in the deck and not in each row.
`lib/route-rows.js` now enforces the schema per row: five stops, a price that
is a figure or free, a visit time, and a travel time on every gap. An adjective
where a number belongs means nobody looked the number up.

### 19g. Travel times are routed, not copied — and the trap in the obvious tool

`analyze/walk-times.mjs`: coordinates from Nominatim, the route from the public
Valhalla instance over OpenStreetMap, pedestrian costing for walking legs and
auto for drives, rounded to 5 minutes.

**The public OSRM server hosts only the car profile, and asking it for `foot`
does not fail** — it answers with a car route, and all three profiles return
byte-identical results. It put **30 minutes** between the Eiffel Tower and the
Trocadéro, 2.49 km, because a car must drive round to a bridge. Valhalla walks
the Pont d'Iena: 1.28 km, 10 minutes. Caught only by asking for all three
profiles on one leg and noticing one answer came back.

Three more the checking caught: "Kition" geocoded to a **statue of Zeno of
Kition**, "Finikoudes" to a **multi-storey car park**, and "Positano Duomo" to
a **pizzeria in Milan**. The tool now reports a result that shares no word with
the question. Two legs a router cannot speak to carry stated text instead of a
figure, and `research/routes/amalfi.json` says why for each.

### 19h. Visit durations, from 64 precedent rows

No operator publishes "how long to spend here", so rather than invent one per
stop, `research/visit-durations.json` holds all 64 durations the three decks
print, and each stop takes the median for its kind: square 30 min, monument 45,
church 60, museum 60, castle 90, major museum 180. Where the operator does
publish one — Pompeii's four itineraries, the Vesuvius Gran Cono trail — that
is used instead.

**The judgement that remains, named:** which kind a stop belongs to. It is
written per stop as `kind` in the figures file so it can be argued with.

### 19i. His closing slides

They are **1920x2560 (3:4)** and every slide we render is 1080x1920 (9:16) — he
reported this as his closer not being the right size. Measured: **3:4 is the
commonest ratio in the corpus, 353 of 847 covers against 251 at 9:16**, and it
carries no save advantage (median 0.374 vs 0.348, inside the no-difference
band). Neither ratio is better; the defect is the mix. Since he asked for the
closer to be fixed, the closer changed — scaled to fit the width so **nothing
is cropped**, the App Store badge included, with the 240px above and below
filled from his own photograph. `analyze/fit-closers.mjs`, originals kept.

### 19j. Gates added tonight

| | |
|---|---|
| `lib/cover-copy.js` | the cover must name its destination, and must not name another |
| `lib/route-rows.js` | five stops, a figure or free, a visit time, a travel time on every gap |
| `analyze/char-check.mjs` | no direction marks, no stray scripts — a Hebrew word shipped with a Persian yeh and an Arabic dal in it and reads perfectly |
| `build.js` | `keep` added to the authored list: it pins a photograph, `lib/stock.js` reads it, and it was being stripped on write-back exactly as `must` once was |

And one gate was **relaxed**, with its reason: `checkWiring` compared a row's
name to the name its query was written against, so adding a pin to 57 rows
"broke" 57 correct queries. It now compares identity with the decoration
stripped, and a self-test proves a real rename is still caught.
