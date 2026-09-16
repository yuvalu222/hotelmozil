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

What does the numeral's job instead:
- **A repeating identical template** (מונה טורס, whatshappening365's if/then
  sentence frame) — the rhythm itself signals "another one of these".
- **A proper noun as the item title** (ivskitchen: "📍 Pike Place Market").
- **A date kicker** instead of an ordinal (la_freebies: "SEP 14").

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

### 2.6 Decks do not close
*Corpus-wide — 4 batches, ~30 advertisers. Ads only; organic endings are
unobservable here.*

Of every complete ad deck examined, **not one ended on a CTA, logo, price or
contact card** — including advertisers whose captions carry a phone number. They
simply stop on another photograph, leaving the close to the platform's CTA
button.

**This is the strongest argument for your closing slide.** Your empty-folder
screenshot is a genuine close in a genre where nobody closes. Note also that the
ads *have* a platform CTA button to fall back on — an organic post does not.

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
6. **Your closing slide is a genuine differentiator.** Nobody closes. Keep it
   exactly as it is. *Corpus-wide.*
7. **Crop to frame.** *Corpus-wide.*

### One thing to be careful about

Your closing slide says the app saved you money. That is a price claim, and
HotelMozil's own standing rules forbid price claims and explicitly extend the
branding rules to marketing. The claim is yours, about your own experience, on
your own channel — which is a different thing from the app's store metadata —
but it is worth a deliberate decision rather than an accidental one, and it is
not a call this study should make for you.

---

## 5. Corpus composition

See `harvest/link-list.md` for the full table. Summary at time of writing:

- **Decks harvested and contact-sheeted:** 135+ and still growing
- **Decks examined as images:** 76 in wave 1, wave 2 in progress
- **Organic (Instagram, 2 slides each):** right genre
- **Ads (Meta Ad Library, complete decks):** mostly wrong genre

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
