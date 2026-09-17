# Travel carousel playbook

**Built 2026-09-17.** Every claim below traces to a deck that was harvested to
disk and looked at as an image. The complete link list — every carousel
examined, with its URL, account, metric, baseline, slide count and format label
— is in [`harvest/link-list.md`](harvest/link-list.md), and the raw per-deck
notes are in [`harvest/lenses/`](harvest/lenses/).

Read [`RECON.md`](RECON.md) first if you want to know why the corpus looks the
way it does. The short version is below, because it changes how much weight each
finding can carry.

---

## 0. Read this before you believe anything else here

### Nothing in this playbook is labelled "works"

The brief's §3 is unambiguous: a pattern only counts as working if it appears in
posts that beat **their own account's median**, from **≥3 different accounts**.
That test cannot be run on this corpus, and saying so plainly matters more than
producing a confident-sounding document.

Why it cannot be run:

- **Organic account medians are unreachable.** Computing an account's median
  needs its recent post list. TikTok's grid and Instagram's profile API are both
  walled to logged-out clients — verified with real requests, see `RECON.md`.
- **Enumeration spreads instead of digging.** Search-based discovery returned
  **55 different accounts across 57 organic decks**. Almost every post is from a
  different account, so even an approximate per-account baseline is impossible.
- **Ad run-duration medians need ≥3 ads per advertiser**, and the harvest is
  similarly spread across advertisers.

So every pattern below is labelled one of:

| Label | Means |
| --- | --- |
| **Corpus-wide (N accounts)** | Seen in N different accounts/advertisers. A description of what this genre *does*, not evidence that it works. |
| **Observed once** | Seen in a single account. Recorded so it can be tested, never treated as a finding. |
| **Measured** | An actual number from the data, with its denominator stated. |

That is the honest ceiling of this study as run. What would lift it is in §6.

### The corpus is two unequal halves

| | Meta Ad Library (A1) | Instagram embed (A2) |
| --- | --- | --- |
| Organic? | **No — ads** | **Yes** |
| Deck completeness | **Complete** | **First 2 slides only** (hard platform cap) |
| Denominator | advertiser's median run days | likes / followers |
| Genre fit to your format | **Poor** — see §1 | **Good** |

**The single most consequential fact in this study:** the two halves do not
overlap in genre. The ads are complete decks in the wrong genre; the organic
posts are the right genre, truncated to two slides.

---

## 1. The finding that reframes the question

**Text-on-image is an organic form. Advertisers do not do it.**
*Corpus-wide — 5 independent batches, ~35 different advertisers, no
disagreement between batches.*

Across wave 1, essentially every Israeli travel/hospitality advertiser shipped
carousels with **zero words on the creative** — no headline, no price, no logo,
no watermark, no end card. The entire proposition (package price, dates, flight
times, named hotel, phone number) lived only in the Facebook caption, which the
feed truncates.

The organic Instagram decks did the exact opposite: **every single one** burned
a hook into slide 1.

Counted exceptions, out of roughly 35 advertisers — these are the only ad-side
peers for your format, and they are worth studying individually:

- **מונה טורס** (`ad-1431186982197538`) — navy knock-out headline bar, white
  sub-card, orange circular price sticker, five identical cards, zero emoji
  in frame. The only ad lockup in wave 1 whose text cannot be lost against a
  bright photo.
- **רמי גרינברג / עיריית פתח תקווה** — templated typographic deck, enumerated
  by a rhyming Hebrew verb chain (התפעלנו / התרגשנו / התפתחנו / התרשמנו /
  התרחבנו) rather than digits.
- **flyeast** — burns a headline in, but it is a 2019 ad.

**What this means for you.** You are not competing with Israeli travel
advertisers on craft — they are not doing the thing you do. Do not look to the
local paid feed for hook typography; there is nothing there. It also means the
bar in your own market is low.

### 1.1 The better explanation: it is not ads vs organic, it is what is being sold

*Corpus-wide — the split holds across all 11 batches, ~70 advertisers.*

Wave 2 replaced the wave-1 framing with a sharper one. The dividing line is not
paid vs organic. It is **what the deck is selling**:

- **Property-sellers** — hotels, spas, villas, apartments, salons, restaurants —
  put **zero text on the image**. The photograph *is* the product, so the deck is
  a shot-list and the words go in the caption.
- **Explainer / experience-sellers** — guides, itineraries, tools, lodges with a
  story to tell — **build templates**. Every one of them designs a repeating
  text-on-image system.

You sell an explanation ("same hotel, different connection"), not a property.
**The templated cluster is your peer group**, not the Israeli hotel feed.

### 1.2 Your actual peer group, named

Seven advertisers across the corpus build proper templated text-on-image decks.
These are the decks worth opening one by one:

| Deck | What it does |
| --- | --- |
| **Kapawi Amazon Lodge** (`ad-1218885413399738` area, batch 10, 9 slides) | Cream panel cover + dark-green rounded pill, then 7 identical all-caps white-on-scrim slides, genuine CTA end-card with a solid button. The only deck in its batch with a **→ swipe arrow**. |
| **madetoroamfam** (`ad-988072893658215`, 11 slides) | Text on 10 of 11 slides via **per-line white rounded knock-out stickers**, heavy serif, phone snaps, no colour grade, no numbers. Built entirely on the type device. |
| **AYANA Phuket** (`ad-1325122952874845`, `ad-938391302530187`) | Locked wordmark, two-weight sans pair, three contrast devices from **one kit** (translucent swoosh / bare white on a naturally dark area / solid knock-out bar), one sentence running across all four slides, closes on price + SIGN UP. Zero letterboxing. |
| **YumTravel** (`ad-2401324727007268`) | Constant graph-paper ground, two fixed type roles (handwritten script = voice, heavy geometric sans = claim), opaque knock-out bar used **only** where artwork sits underneath, photo-free CTA slide. |
| **Rome2Rio** (batch 10) | Magazine-cover lockup, then every slide = photo + white rounded product-screenshot card + opaque caption pill at the bottom edge. |
| **מונה טורס** (`ad-1431186982197538`) | Navy knock-out headline bar + white sub-card + orange price sticker, five identical cards. |
| **רמי גרינברג / עיריית פתח תקווה** | Templated typographic deck enumerated by a rhyming Hebrew verb chain. |

**The device they share:** one identical recurring container, applied to every
slide, and contrast bought explicitly rather than hoped for.

---

## 2. Craft patterns

### 2.1 Contrast is the whole ballgame, and a backing device is how it is won
*Corpus-wide — 4 batches, 12+ accounts.*

The organic decks solve text legibility in one of three ways:

1. **Opaque light box / pill behind the text** — the most common solution.
   (steveandnes, whatshappening365, crete_travel_guide, travel2losangeles,
   vietnamessence_tours, withsumegha)
2. **Bottom-up gradient scrim**, type directly on the photo. (nypost,
   mustvisitjapan, anushkarathod98)
3. **Exploit an empty region** of the photo — sky, a blank wall, a flat plane —
   and use no device at all. (la_freebies, veeceecheng, uaz_findyourenviro)

**The failure mode is specific and repeated:** the decks with *no* backing
device are the ones with legibility problems. `uaz_findyourenviro` is legible on
slide 1 only because the text sits on blue sky, and is already marginal on slide
2 where it crosses concrete and grass. `la_freebies` sets white serif on a pale
dusk sky — borderline — then sidesteps the problem on slide 2 by moving the text
off the photo onto white.

**Practical rule:** option 3 is not a style, it is a bet on the photograph. If
the photo is not controlled, use a box or a scrim.

### 2.2 The count is a promise, not a navigation device
*Corpus-wide — 5 batches, 12+ accounts.*

This is the most consistent and most surprising craft pattern in the study.

Decks routinely **announce a number in the hook** — "7 TRAVEL HACKS", "20 Things
To Do In", "15 THINGS TO DO IN", "11", "12", "8" — and then **never print a
numeral again**. No badge, no circle, no oversized digit, no per-slide counter.

Counted: of roughly 14 structurally-listicle decks across wave 1, only **three**
put any numeral on an item slide — mustvisitjapan (a red "1." pill), thechortshow
(an inline "1." at body weight), moresocialclub (a decorative "00"). Several
announce a count and number nothing: travel2losangeles, vietnamessence_tours,
vnexpress.guide, anushkarathod98, nyctheloop, switzerlandersss.

Wave 2 made this stronger, not weaker: in batch 10, **0 of 12 decks used a
counter at all** — including both fully designed templated decks. Kapawi runs
seven numbered-in-spirit slides with no numerals anywhere.

What does the numeral's job instead:
- **A repeating identical template** (מונה טורס, Kapawi's seven identical
  slides, whatshappening365's if/then sentence frame) — the rhythm itself
  signals "another one of these".
- **Parallel grammar** — every item phrased in the same shape, so the ear
  counts even when the eye has nothing to count. This is how the designed decks
  get listicle legibility without digits.
- **A proper noun as the item title** (ivskitchen: "📍 Pike Place Market").
- **A date kicker** instead of an ordinal (la_freebies: "SEP 14").

*Observed in 2 advertisers, worth testing:* **one sentence running across the
swipe**. AYANA runs a single sentence across all four slides; madetoroamfam
breaks a line across the 5→6 swipe. The sentence cannot resolve without the
swipe, which is a stronger pull than an arrow.

### 2.3 Slide 2 splits cleanly by pile — and this is the clearest structural lesson
*Corpus-wide — 3 batches, 10+ accounts.*

Slide 2 is the highest-drop-off position. The two halves of the corpus treat it
in opposite ways:

- **Organic decks deliver a real item at slide 2.** In every organic deck
  examined across batches 4 and 5, slide 2 is already list item 1 — a labelled
  grid, a named dish with body copy, a dated freebie with an address. There is
  no agenda slide, no "here's why", no bridge.
- **Ads waste it.** Slide 2 is another photo of the same subject in at least 9
  different advertisers (Hotel Metropolitan TLV, מונה טורס, Stone wall Israel,
  יעדים, Iren travel, R.N. Pastries, יוני פארג', בסט סטונס, התאחדות המלונות).

*Observed once, but worth testing:* `lexilaube` makes slide 2 the entire payoff —
the hook is an unfinished sentence ("I'm not saying we SHOULD, but…") and slide 2
completes it ("we coulddd.."). An open loop that only closes on swipe.

### 2.4 Emoji are a caption device, not an image device
*Corpus-wide — 6 batches, 25+ accounts, near-unanimous.*

Roughly **1 deck in 12** puts any emoji on the artwork, while the same accounts'
captions are dense with them. Documented emoji-heavy captions paired with
completely bare creative across both piles.

The handful of on-slide exceptions all use emoji **structurally, not
decoratively**: a 📍 pin inside a title box as a location marker
(travel2losangeles, vietnamessence_tours, ivskitchen), a four-emoji row as a
visual contents list (vnexpress.guide), flag glyphs as evidence
(anushkarathod98, switzerlandersss 🇨🇭).

**Rule:** emoji belong in your caption. If one appears on a slide, it should be
doing a job a word would otherwise do.

### 2.5 Type: display serif for the title, heavy grotesque for the body
*Corpus-wide — 4 accounts in one batch, echoed in others. Treat as a strong
tendency, not a law.*

All four organic accounts in batch 6 used a high-contrast display serif for the
hook or item title, and three of the four paired it against a heavy grotesque
for body copy — **switching family by role, not by slide**.

### 2.6 Photo-only decks never close. Templated decks almost always do.
*Corpus-wide — 9 batches, ~60 advertisers.*

**This corrects a wave-1 claim.** After 76 decks the finding read "no deck ever
ends on a CTA", and that was wrong — it was true of the sample, not of the
genre. Wave 2 found the exception cluster and it is systematic, not incidental.

- **Photo-only decks: no close.** Across roughly 60 advertisers, these stop on
  another photograph — including advertisers whose captions carry a phone
  number. The close is left entirely to the platform's CTA button.
- **Templated decks: a real close.** Kapawi ends on a CTA card with a solid
  "DOWNLOAD THE GUIDE" button. AYANA ends on price + SIGN UP + award badge.
  YumTravel ends on a photo-free CTA slide whose URL is set in a colour used
  nowhere else in the deck.

**What this means for your closing slide.** The earlier version of this document
told you the close was a differentiator because nobody closes. That was the
wrong reason. The right one: **everybody in your actual genre closes**, and your
empty-folder screenshot is the closing slide — it is table stakes for a
templated explainer deck, not a quirk. Two details worth stealing from the
cluster: they drop the photograph entirely on the last slide, and they introduce
one colour there that appears nowhere else.

And the asymmetry that makes it matter more for you than for them: an ad has a
platform CTA button underneath it. An organic post has nothing but its last
slide.

### 2.6b The listicle gets written — in the caption — and then not drawn
*Corpus-wide — 3 batches, 12+ advertisers.*

The clearest single illustration of §1.1. Advertiser after advertiser wrote a
fully formed listicle — a day-by-day itinerary, an 8-line price table, tiered
packages, an explicit "1. 2. 3. 4." — and then shipped **untouched photographs**
on the slides, leaving the entire structure in a caption the feed truncates.

Four advertisers did this in batch 8, four more in batch 7, four more in batch
11. Meta's link-card chrome is used the same way: GolfNow carries per-slide item
labels including a numbered one ("10 Scottish Courses for <£30") — in the card
chrome, **never in the pixels**.

The work is being done. It is just not being put where the viewer looks.

### 2.7 Craft hygiene the ads fail and the organic decks do not
*Corpus-wide — 2 batches, 11 advertisers.*

**Aspect-ratio letterboxing is endemic on the ad side and absent from organic.**
Seven of eight advertisers in one batch shipped photos that did not fit the
frame and got grey bars; all four organic decks filled the frame exactly. Four
of eight ads in another batch had the same problem.

This is free: crop to the frame.

---

## 3. What was measured, with denominators

*These are numbers, not patterns. Each states what it is divided by.*

- **Engagement rate (likes ÷ followers), organic Instagram decks:**
  median **0.0234**, p90 **0.2427**, max **3.836** (n=75 at time of measurement).
  The max exceeds 1.0 because likes can exceed follower count on posts that
  travel beyond the account's audience — which is itself the interesting case.
- **Follower count does not predict engagement rate in this corpus.** The
  highest-engagement deck in batch 6 (`switzerlandersss`, 0.078) outperformed a
  1.3M-follower creator's deck in the same batch (0.00092) by roughly 85×.
  *Measured, single comparison — not a general claim.*
- **An obviously AI-generated deck was the highest-engagement deck in its
  batch.** `switzerlandersss`, a 2×2 AI collage, engagement rate 0.078.
  *Observed once.* This sits uncomfortably beside the brief's §6 finding that AI
  slop is a credibility crisis in travel. Both can be true: AI imagery can win
  engagement while costing trust. **Do not act on this one.**

---

## 4. What this says for your carousels

Stated as implications, with their evidence class attached. None of these is
"proven to work" — see §0.

1. **Keep burning text into slide 1.** It is what every organic deck does and no
   advertiser does. *Corpus-wide.*
2. **Put a backing device behind your Hebrew type** — a box or a scrim — unless
   you control the photograph and it has genuine empty space. The decks that
   skipped this are the decks with legibility failures. *Corpus-wide, with a
   named failure mode.*
3. **Announce the count in the hook. Do not bother numbering every slide.** The
   corpus overwhelmingly does the former and skips the latter; a repeating
   template carries the rhythm instead. *Corpus-wide.* This also eases your
   10-slide cross-post ceiling (§9 of the brief): "8 tips" reads as complete
   whether or not digits appear.
4. **Make slide 2 your first real tip, not a preamble.** *Corpus-wide.*
5. **Keep emoji in the caption.** *Corpus-wide.*
6. **Keep your closing slide — it is table stakes in your genre, not a quirk.**
   Every templated explainer deck closes; only photo-dumps don't. Steal two
   details: drop the photo entirely on the last slide, and use one colour there
   that appears nowhere else. *Corpus-wide.*
7. **Crop to frame.** *Corpus-wide.*
8. **Pick one container and repeat it on every slide.** This is the single
   device every deck in your peer group shares (§1.2), and it is what buys
   listicle legibility without numerals. *Corpus-wide.*
9. **Consider running one sentence across a swipe.** *Observed in 2
   advertisers — test it, don't trust it.*

### One thing to be careful about

Your closing slide says the app saved you money. That is a price claim, and
HotelMozil's own standing rules forbid price claims and explicitly extend the
branding rules to marketing. The claim is yours, about your own experience, on
your own channel — which is a different thing from the app's store metadata —
but it is worth a deliberate decision rather than an accidental one, and it is
not a call this study should make for you.

---

## 4b. The five carousels — direct clones

The first attempt at this section was wrong in two ways Yuval named precisely:
the type looked machine-made and nothing like the sources, and the topics were
invented ("how to get around Bangkok") instead of copied from decks that already
work ("things to do in <place>"). That attempt is kept under `he-01`…`he-05`
only so the difference is visible; it is superseded.

The replacement rule is simpler and stricter: **each carousel is a clone of one
specific deck in the corpus** — its visual system copied element by element
(font character, box shape, placement, amount of text, colour), and its *topic
idea* copied verbatim, with only the destination swapped to one Israelis fly to
(Athens and Larnaca are the top two, Greek islands are rising, Bangkok is the
long-haul default — verified against 2026 airport-authority figures).

Each spec carries `clonedFrom` (the deck id), `clonedAccount`, and a
`demonstrates` field listing exactly what was copied. `out/preview.html` shows
every clone beside its source with a live link.

| Spec | Cloned from | Copied system | Topic idea, transposed |
| --- | --- | --- | --- |
| `he-a-athens-free` | **mustvisitjapan** `ig-DdOEGuHE1wG` (highest-ER organic listicle) | red "did you know?" pill · heavy condensed caps over a bottom scrim · thin arrow · item = 2×2 collage of one place, red numbered pill, red pin-bar, white why/tip box | "7 free things in Tokyo actually worth your time" → **7 דברים בחינם באתונה** |
| `he-b-cyprus-20` | **travel2losangeles** `ig-DbQrhvojYzv` | 2×2 white-gutter grid every slide · cover = two stacked white rounded stickers in a heavy rounded sans · items = four cells each labelled at the foot, no numbers | "20 things to do in Los Angeles" → **20 דברים לעשות בקפריסין** |
| `he-c-greece-unreal` | **switzerlandersss** `ig-Dc-WVj2Dd1U` (highest ER in its batch, 0.078) | 2×2 collage · white display serif with a soft shadow on the seam · items carry only the place name | "8 Swiss places that feel unreal" → **8 מקומות ביוון שלא נראים אמיתיים** |
| `he-d-bangkok-ifthen` | **whatshappening365** `ig-Db7w740EWZ-` | two photos stacked · sharp white box · heavy black text with one hot-pink keyword · the if/then sentence repeats unchanged | "If you are at X, you must visit Y" → **אם אתם ב־X, חייבים לבקר ב־Y** in Bangkok |
| `he-e-rhodes-notusual` | **vietnamessence_tours** `ig-DbBEEAVk4km` | creator-style full photo · Stories-style white stickers in a plain medium sans · cover = count / pin+place / parenthetical · item = bold title sticker over a first-person body sticker | "20 things to do in Hanoi (not the usual tourist list)" → **8 דברים לעשות ברודוס (לא הרשימה הרגילה)** |

Mechanically this needed a second template (`lib/template2.html`) and a skin
per source (`lib/skins.js`), plus multi-photo slides in the builder for the
collages. Two things the copies cannot reproduce and say so: flag emoji, which
Windows Chrome draws as letter pairs and were therefore dropped; and the
sources' own photography — the clones use Pexels, and mustvisitjapan-style
collages of one place come from four candidates of a single search.

**The closing slide is a marked placeholder in all five.** It is your screenshot
and your idea, and §2.6 says it works because it looks unstyled. Designing a
fake one would have destroyed the only thing that makes it work. Swap
`assets/closing-placeholder.jpg` for the real file and rebuild.

Two things the build changed in the tool itself, both applied straight from this
study:

- **The scrim now ramps from 48% of the frame instead of 62%.** Bottom-aligned
  text starts around 57%, so the old gradient left the headline sitting on
  unprotected pixels — the exact failure §2.1 names. Caught by looking at the
  first render, not by reading the CSS.
- **The safe band gained bottom padding.** The swipe affordance is absolutely
  positioned and was overlapping the body line on every bottom-aligned slide.

## 5. Corpus composition

See `harvest/link-list.md` for the full table. Summary at time of writing:

- **Decks harvested and contact-sheeted:** 260
- **Decks examined as images:** **135**, across 11 batches and 11 independent
  viewers (the brief's floor is 100)
- **Organic (Instagram, 2 slides each):** 57 — right genre, truncated
- **Ads (Meta Ad Library, complete decks):** 203 — complete, mostly the wrong
  genre, but containing the 7-advertiser templated cluster that is the real
  peer group (§1.2)

Known contamination, flagged by viewers rather than hidden:
- **Keyword false positives** — a hair salon located inside a hotel, a villa
  described as "like a hotel", a fitness post tagged #חופשה, a paving company
  advertising through a hotel lobby, a bakery selling frozen dough *to* hotels.
  A hotel-keyword harvest pulls in a lot of adjacent-trade creative.
- **Duplicate creatives under separate Library IDs** — the same Lear Sense deck
  appeared under four different IDs across batches. Counts of "distinct
  creatives" are lower than counts of decks.
- **Event photo albums** posted as ads (19 unedited snapshots, no text, no
  ordering logic). Excluded from craft comparison by the viewers who found them.

---

## 6. What would actually make this study conclusive

In descending order of value:

1. **Your own analytics.** ~250k views across your own Hebrew posts to an
   Israeli audience, where you know the account, the baseline and the outcome.
   It is the only dataset in existence with a real denominator *for your format,
   your language and your audience* — and it is free. Everything above is
   other people's work in other languages; this would be yours.
2. **A logged-in session on Instagram or TikTok.** It reopens account grids,
   which restores the §3 algorithm, and lifts the 2-slide cap so full decks and
   closing slides become observable.
3. **The travel-carousel platform link** you mentioned. If it exposes organic
   decks with metrics it could replace most of the scaffolding here.
4. **Four weeks of your own A/B tests.** For slide count, hook wording and text
   density, the brief's §6 is right that published sources are vendor folklore.
   The fastest honest answer is your own data.
