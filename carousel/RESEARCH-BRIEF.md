# Research brief — travel carousel study

**Written 2026-09-16.** This file exists so a fresh session can execute the study
with no other context. Read it top to bottom before doing anything. If something
here contradicts a memory or an assumption, this file wins.

---

## 0. How to start

The user will open a new session and say roughly "read
`carousel/RESEARCH-BRIEF.md` and start". When that happens:

1. Read this whole file.
2. Read `carousel/README.md` — the builder that renders the final deliverable.
3. Run **Phase 1 (recon)** below and **report back before harvesting**. Do not
   commit to a research structure until you know which sources are actually
   navigable.

Do **not** produce example carousels, slide templates or copy before the study
is done. That mistake was already made once in the previous session, and the
user stopped it twice. The study comes first. The examples are its output, not
its substitute.

---

## 1. Who this is for

**Yuval** (`yuvalu222@gmail.com`) runs **HotelMozil**, an Israeli hotel-deals
iPhone app. The repo is the product's public site.

He markets the app almost entirely through **Hebrew photo carousels** aimed at
an **Israeli audience**.

### What he actually posts

Value-first travel listicles. Real examples in his words:

- "10 tips you must know before flying to Thailand"
- "5 tips"
- "the best destinations"
- "how to get from place to place"
- "what to buy at 7-Eleven in Thailand"

The topic varies constantly. What is fixed is the **shape**: a hook slide,
numbered value slides, and a closing slide.

### The closing slide — do not redesign this

His last slide is a **screenshot of an empty iPhone folder containing only the
HotelMozil app**, plus a line saying it is the most important recommendation
because the app saved him money.

This is the single most important thing about his funnel and it must be
preserved:

- The CTA is **not a link**. It is an app name people then search for in the App
  Store.
- TikTok has been suppressing off-platform links hard — bio-link CTR fell from
  1.5–3% (2024) to often below 0.5% (2026). His format **routes around that
  entirely**, which is very likely why his numbers beat the published
  benchmarks.
- The slide works *because it looks unstyled*. It reads as a real phone. In a
  2026 feed full of AI-generated travel imagery, that is what buys trust.

**Never propose replacing it with a link, and never propose "designing" it.**

### His results

- **~250,000 views in 2 months**
- **~700 app downloads** (iPhone only; no Android build yet)
- **$10k+/month in bookings** — this is booking volume (GMV), not his revenue.
  At normal hotel affiliate rates his cut is roughly $400–600/mo. He has not
  corrected this, so treat it as unconfirmed.
- View→download is roughly 0.28%.

He does all of this **manually**. The goal is to do it automatically and
**better than he does by hand** — not merely as fast.

---

## 2. What the study must deliver

Three things, in this order.

### 2a. Genuine understanding of the format

You must actually **look at travel carousels as images** — not read articles
about them. Screenshot them and view them. Hundreds.

### 2b. A playbook file in this repo

`carousel/PLAYBOOK.md`. Everything learned, **plus the full list of links to
every carousel examined**. The user was explicit:

> "כל הידע והקישורים של על מה עברת. פחות מ-100 וזה לא גמור מבחינתי"

**Acceptance: fewer than 100 carousels examined means the job is not done.**
100 is the floor, not the target.

Each entry in the link list needs: URL, account, the metric that qualified it,
the account's median for comparison, slide count, and the format label you
assigned it.

### 2c. Five Hebrew carousels

Built with the existing builder, demonstrating everything learned, using free
photos from Pexels. See §8.

---

## 3. What "works" means — read this twice

The user rejected volume-based selection in the strongest terms:

> "עובד לפי מטריקות של צפיות לייקים שמירות וכו. מעניין אותי רק מה שעובד ועקבי.
> לא נפח בשום צורה"

Browsing lots of carousels teaches you what is **common**. That is worthless
here. You need what **consistently outperforms**.

### The selection algorithm — follow it exactly

**Per account:**

1. Load the account's grid and record the view (or save/like) count for its
   most recent ~30 posts.
2. Compute that **account's own median**.
3. A post qualifies as a winner if it reaches **≥2× that account's median**.
   Comparing a post against its own account controls for follower count, which
   is the confound that ruins every published carousel study.
4. The account itself only qualifies for deep study if it has **≥3 qualifying
   carousel posts**. One viral hit is luck. Three is a repeatable format.

**Across accounts:**

5. A format, layout or copy pattern only enters the playbook as "working" if it
   appears in winning posts from **≥3 different accounts**. Anything seen in
   only one account is logged as "observed, unconfirmed" — never as a finding.

**Always record the account median alongside the post metric.** A number with no
denominator is the exact failure mode that made the published research
worthless.

---

## 4. What to look at

The user's focus, in his words: images and format — "גם על חיתוך וקולאז', גודל
טקסט וצבע וסוג וכו. אימוג'ים, קופי והכל".

**Sound and hashtags are a bonus, not the point.** Record them if visible; do
not spend the study on them. The algorithm/benchmark side is already done (§6) —
do not redo it.

Capture for every carousel studied:

**Image treatment**
- Crop and framing: full-bleed photo, photo with border, collage/grid, split
  screen, photo-on-colour-field
- Collage structure when present: how many images per slide, how divided
- Whether photos are stock, shot-by-creator, screenshots, or AI-generated —
  and whether that is detectable at a glance
- Colour treatment: filters, overlays, scrims, duotone
- Subject: landscape, hotel room, food, street, person-in-frame, map,
  screenshot, pure text card

**Typography**
- Size relative to frame, weight, family character (system / rounded / serif /
  handwritten / condensed)
- Colour and contrast method: solid fill, outline, drop shadow, highlight box,
  scrim behind text
- Placement: top / centre / bottom, aligned or centred
- How much text per slide
- How the number is presented in a numbered listicle

**Emojis** — used or not, where, how many, which ones, do they replace words or
decorate

**Copy**
- The hook sentence on slide 1, verbatim
- How each item is titled, and the relationship between title and body
- The closing slide's exact structure
- Caption structure, and where the payload sits relative to the truncation point

**Sequencing**
- Slide count
- What sits on slide 2 — the highest-drop-off position
- Whether the strongest item leads or closes
- How the deck signals "keep swiping"
- How it ends

---

## 5. Sources

The user is opening **Full network access**. He also said he has previously been
sent a link to a platform showing only travel carousels — **ask him for it if he
has not pasted it**; it may be better than everything below.

Assume nothing about reachability. **Phase 1 is to test each of these and report
what actually works.**

| Source | Gives | Risk |
| --- | --- | --- |
| **TikTok web** (`tiktok.com`) | Organic carousels, view counts on the grid, full decks. The best fit for the user's actual channel. | Aggressive bot blocking. May need slow, human-paced navigation. **Assume this is the one that fails.** |
| **Pinterest** | Enormous travel volume, and it exposes **saves** — the metric that actually matters for reference content. Very scrapable. | Not TikTok. Format conventions differ. |
| **TikTok Creative Center → Top Ads** (`ads.tiktok.com`) | Officially ranked by performance, filterable by country and industry. | Ads, not organic. |
| **Meta Ad Library** (`facebook.com/ads/library`) | Free, public, no login, filterable by country — **including Israel**. Full carousel creatives. How long an ad has been running is a real performance proxy: advertisers kill what loses. EU-targeted ads also expose reach. | Ads, not organic. No direct engagement metrics outside the EU. |
| **Instagram** public profiles | Carousels with like counts. | Heavy bot blocking. |

If TikTok organic proves unreachable, **say so plainly and pivot** to
Pinterest saves + Creative Center rankings + Ad Library run-duration. Do not
quietly substitute a weaker source and present it as the same thing.

### Scope

**Travel only.** The user was asked whether to study carousel craft outside the
niche and said travel — his reasoning is that it is how he reaches the right
audience for HotelMozil. Respect that.

### Language

Hebrew travel carousels barely exist as a scene (§6). **Study English/global
content, output Hebrew.** The user confirmed this explicitly.

---

## 6. What is already known — do not re-research this

Three research reports were completed in the previous session. Their findings,
compressed. Treat these as settled and build on them.

### Format economics

- The widely-quoted "carousels get +81% engagement" (Fanpage Karma, 698K posts,
  Jan–May 2025) is contradicted by two much larger datasets: Buffer (45M+ posts)
  finds video 3.39% median ER vs 1.92% for carousels; Metricool (2.3M posts)
  finds video wins every metric.
- Metricool measured the same methodology a year apart: **image/carousel
  engagement collapsed 5.24% → 2.62% while video held at 3.67%**, and carousel
  supply grew **+140% YoY**. The early-mover advantage is gone.
- Reconciliation: carousels get **fewer views but more interactions per viewer**.
  They are a **conversion format, not a reach format**.
- **Instagram carousels get ~4.7× the views and ~5.8× the interactions of
  TikTok carousels.** If carousels are the format, Instagram is arguably the
  stronger home.
- The US TikTok algorithm was rebuilt in 2026 (Oracle JV retrained on US-only
  data). US benchmarks from 2025 describe a platform that no longer exists
  there. **The user's audience is Israeli, so it sits on the global feed** — much
  of that turbulence does not apply to him, and US-derived data is less relevant
  than it looks.

### Tactics with real evidence behind them

- **A question in the caption: +26.19% comments** (Metricool, 2.3M posts). The
  best-evidenced single tactic available.
- **1–5 specific hashtags.** Real but small (~+5% views, +9% interactions).
  Skip `#fyp`.
- **Price/number inside the first ~125 characters** — the feed truncates there.
- **ALT text on photo-post images** — supported on TikTok photo posts and not on
  video. Free indexed text, almost nobody uses it.
- **96% of a post's reach happens in the first 10 days.**

### Tactics with *no* evidence — this matters for the study

Slide count, hook wording, text density and audio choice are **untested
folklore**. Every "optimal 5–10 slides" and "70% completion threshold" claim
traces to carousel-tool vendor blogs with no sample size.

**This is precisely the gap the visual study exists to fill.** Published sources
cannot answer it; looking at winners can.

### Niche findings

- "Useful/planning content beats inspiration" — Dash Social 2026 travel
  benchmarks. Travel brands post less and views rose 181%.
- **Saves and shares are the KPI**, not views or comments. Shares per post +45%
  while comments fell 24%.
- Travel brands average 3.5% engagement by views; target band 3.0–3.5%.
- **AI slop is a credibility crisis in this exact vertical.** Skift (Aug 2026)
  documented AI-generated TikTok GO videos selling a hotel suite that does not
  exist; only 1 of 17 flagged videos carried an AI label. A viewer's default
  assumption about a polished hotel image with a price on it is now "probably
  fake". **Verifiability is table stakes, not a differentiator.**
- **Israeli travel creators are small** — top Travel & Adventure accounts sit at
  86–91K followers, while top Israeli accounts overall reach 2–6.8M. Travel is
  ~50× smaller in this market.
- **The Israeli deals ecosystem lives on Facebook, Telegram and WhatsApp** —
  טוס בזול, טרוולליסט, טיסות סודיות, Hulyo. Not TikTok. Either genuine
  whitespace, or evidence those channels simply suit deal distribution better.
- Closest analogue found: **Chelsea Dickenson (Cheap Holiday Expert)** — built
  an identity as the person who verifies prices, monetised through her own media
  property rather than per-post commission. Her largest channel is Instagram.
- Seasonality: **January and September are the planning peaks**; December
  browsers are 4× likelier to book in Q1; 30%+ of travellers book within two
  weeks of departure.
- FTC affiliate disclosure: **$53,000+ per violation, per post, and the
  obligation does not expire with the deal**. The user has already fought
  compliance battles with Booking and Play — he knows the terrain. His closing
  slide promotes his own product, which is a material connection; "my app" is
  enough disclosure.

### Two research reports may still be pending

The previous session launched two more agents whose reports may not have landed
before the session ended:

1. **Carousel craft at slide level** — hook taxonomy, sequencing, closing-slide
   patterns, text-on-image conventions, failure patterns.
2. **Israeli travel audience** — where Israelis travel now, segments, Jewish-
   calendar seasonality, Hebrew travel register, concrete Thailand substance.

If their findings are not in the repo, **re-run them**. They are needed for §8.

---

## 7. Method

### Phase 1 — Recon (do this first, then report)

Test every source in §5. For each, establish: does it load, does it block
automation, are metrics visible, can you reach a full deck, can you paginate.
**Report to the user which sources are live before harvesting.** Do not design
the study on a source that turns out to be a wall.

### Phase 2 — Harvest

Use Playwright with the preinstalled Chromium
(`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; do **not** run
`playwright install`).

- Screenshot **full decks**, every slide. The user was blunt: "ברור שדקים
  מלאים איך תלמד משקופית אחת".
- Save to **disk**, never into your context.
- Record metrics and the account median alongside each deck.
- Maintain a running `harvest.jsonl` — one line per carousel: url, account,
  metric, account median, slide count, local screenshot paths.

### Phase 3 — Viewing, via parallel agents

**This is the step that makes "hundreds" real rather than a slogan.** Images
consume context fast; viewing 100+ decks in one context window is impossible.

Fan out **6–8 subagents**, each with its own context window. Give each a batch
of decks and the §4 checklist, and have each return a **structured written
analysis** — never raw images. Then synthesise.

Practical: downscale screenshots before viewing, and tile a deck's slides into a
single contact sheet where sequence still reads.

### Phase 4 — Playbook

Write `carousel/PLAYBOOK.md`: every pattern, with the §3 confirmation rule
applied and confidence labelled, plus the complete link list (§2b).

### Phase 5 — Five carousels

See §8.

### Discipline throughout

- Commit and push to `claude/video-platforms-carousels-a4yyvg` as you go. A stop
  hook enforces this.
- Keep findings in files, not in the conversation. Conversations get compacted.
- Label every claim: seen-in-winners across N accounts / observed once /
  inferred.

---

## 8. The five carousels

Built with the existing builder (`carousel/build.js`, see `carousel/README.md`).

- **Hebrew**, for an Israeli audience.
- Photos from **Pexels** — no API key needed, browse and download like a person.
  If `PEXELS_API_KEY` happens to be set, `lib/stock.js` will use the API instead.
- Each should demonstrate a different pattern the study actually found, and the
  playbook should say which one and why.
- Include his closing-slide pattern. Since there is no real screenshot to hand,
  leave it as a clearly-marked placeholder slide for him to swap — **do not
  design a fake one**.
- Topics should come from real Israeli travel substance, not invented filler.
  Thailand is confirmed territory (he has posted 7-Eleven recommendations).

### Hebrew voice

A skill named **`anthropic-skills:human`** exists for writing Hebrew in this
user's voice without AI tells. **Load it before writing any carousel copy.** The
copy is published under his name.

---

## 9. Hard constraints the builder already encodes

Verified against platform documentation. Do not relitigate these.

- **10 slides maximum.** Instagram's publishing API, YouTube and Facebook all
  cap there. TikTok allows 35, but a longer deck is a TikTok-only asset. Note:
  **a "10 tips" listicle plus hook plus closing slide is 12 and will not
  cross-post.** His current format already has this problem. 8 tips + hook +
  close = 10 fits everywhere.
- **4 slides minimum** for a TikTok photo post.
- **JPEG only, sRGB.** Instagram's API rejects PNG; TikTok's API rejects PNG.
- **1080px wide, never more.**
- **1080×1440 (3:4) cannot be published by any scheduler** despite being valid in
  the Instagram app. The API floor is 0.8 (4:5).
- **Facebook has no organic swipeable carousel** — multi-photo Page posts render
  as a mosaic. True swipe there is an ads-only format.
- **YouTube has no publishing API for image posts.** Permanently manual.
- Layout is authored once at 1080×1920 with everything load-bearing inside a
  centred 1080×1150 band; the Instagram/Facebook 1080×1350 file is a **crop of
  that same render**, not a second layout.

### Publishing, for later

- **Instagram and Facebook need no Meta App Review** to publish to your own
  accounts — an app in Development Mode with the account added as an Instagram
  Tester is enough. This is free and available immediately.
- **TikTok requires its Content Posting API audit.** Unaudited clients are
  limited to `SELF_ONLY` private posts. Self-hosted Postiz currently fails that
  audit (issue #1563).
- So: **start with Meta, not TikTok.**

---

## 10. Repo state

Branch: `claude/video-platforms-carousels-a4yyvg`

```
carousel/
  README.md              builder docs and platform constraints
  RESEARCH-BRIEF.md      this file
  build.js               spec -> photos -> slides -> manifest
  lib/stock.js           Pexels/Unsplash search + download
  lib/render.js          HTML -> Chromium -> JPEG, both crops
  lib/template.html      slide CSS: hook, tip, price, screenshot roles
  specs/example.json     shape reference (a deal carousel, not his format)
  package.json
```

Status: the renderer **has run successfully once**. Five slides out, Hebrew RTL
correct, webfont resolved before first screenshot, both 1080×1920 and 1080×1350
written. Photo sourcing has **never run** — Pexels was blocked.

Run it with:

```
cd carousel
node build.js specs/example.json           # full build
node build.js specs/example.json --debug   # draw safe-zone guides
node build.js specs/example.json --no-fetch
```

Playwright is installed globally, not locally. `carousel/node_modules/playwright`
is a symlink to the global package and is gitignored — **recreate it** if
imports fail:

```
ln -sfn "$(npm root -g)/playwright" carousel/node_modules/playwright
```

---

## 11. Things that will go wrong, and what to do

**TikTok blocks the browser.** Most likely failure. Report it, pivot to
Pinterest saves + Creative Center + Ad Library run-duration. Do not pretend a
weaker source is equivalent.

**Metrics not visible on a source.** Then that source cannot contribute to the
"what works" count — it can only contribute craft observation. Keep the two
piles separate and say which is which.

**Context fills up.** Files on disk, agents for viewing, never raw images in the
main thread.

**Fewer than 100 decks available.** Say so early and plainly rather than padding
the count with unqualified posts. The 100 floor and the §3 quality bar are both
real; if they conflict, tell the user rather than quietly dropping one.

**The urge to start producing carousels before the study is finished.** This
already happened twice. Resist it.

---

## 12. Open items for the user

1. The link to the travel-carousel platform he mentioned — ask if not provided.
2. His own analytics screenshots. His ~250k views across his own Hebrew posts to
   an Israeli audience is the most relevant dataset in existence for this
   problem, and it is free. Worth more than any external source. **Ask again.**
3. Confirmation of whether $10k/month is GMV or his own revenue.

---

## 13. Standing notes on working with this user

- He wants **brevity**. Long preamble gets called out. Lead with the answer.
- He wants **honesty about limits**, stated up front, not discovered later.
  Several times the right move was saying plainly "I can't do that here".
- He corrects hard and fast when the work drifts. Take the correction, adjust,
  do not over-apologise.
- He is technically competent and running a real business with real revenue.
  Do not explain basics he has not asked about.
- **Verify rather than assume.** Several conclusions in this brief only exist
  because a claim was tested — the network block was confirmed with a real
  request, the Hebrew rendering was confirmed by looking at the output image.
  Keep doing that.
