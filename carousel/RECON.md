# Phase 1 — Recon results

**Run 2026-09-17, on Yuval's Windows machine.** Every line below was produced by
a real request from a real Chrome, not inferred. Raw results are in
`recon/probe*-results.json`; screenshots in `recon/shots/`.

The brief said to test every source in §5 and report before harvesting. This is
that report.

---

## Environment corrections to the brief

The brief was written for a Linux cloud sandbox. Three of its assumptions are
false here, and all three are now fixed:

| Brief says | Reality on this machine | Done |
| --- | --- | --- |
| `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, do not install | Path does not exist. Playwright was not installed at all. | Installed `playwright` into `carousel/`, driving the **system Chrome** (`channel: 'chrome'`) instead of downloading Chromium. Real Chrome is also the better choice against bot detection. |
| Repo is the current working dir | The brief's repo is `hotelmozil-site` (`github.com/yuvalu222/hotelmozil`), not `HotelMozil`. | Checked out `claude/video-platforms-carousels-a4yyvg`. |
| Pexels is blocked by network policy | **Pexels loads fine in a real browser.** The old block was environmental and is gone. | §8 photo sourcing is unblocked for the first time. |

The machine's IP is Israeli, so TikTok `/explore` serves an Israeli feed. That is
an accidental advantage — it is the user's actual audience.

---

## Verdict per source

### Live and usable

**1. Meta Ad Library — the strongest source available.** No login.

- Israel country filter works. Hebrew keyword search works.
- `country=IL&q=טיסות` returned **~2,200 results**.
- First page alone exposed **37 Library IDs and 37 "Started running on" dates**.
- Start date is the run-duration performance proxy the brief describes:
  advertisers kill what loses.
- Full carousel creatives are visible as images.

Note: the initial navigation returns HTTP 403 while the page still renders and
functions. Landing on `/ads/library/` first, then navigating to the query URL,
works reliably.

**2. TikTok Creative Center → Top Ads.** No login.

- **92 cards** rendered, with `Likes`, `Reach`, `Budget`, and a **CTR percentile
  ("Top 94%", "Top 93%")** — already a normalised rank, which is exactly the
  denominator problem §3 cares about.
- Filters live: Region, Objective, Ad Language, Ad Format. Sort by Reach or CTR.

**3. TikTok organic — individual post pages only.** No login.

- A post URL renders with **like / comment / share counts** in the DOM
  (`data-e2e="like-count"` etc.). Verified: `15.9K / 111 / 1268` on one,
  `22.6K / 561 / 878` on another.
- Post URLs are enumerable through **`/discover/<slug>`** pages — 26 post links
  per page, and there are many slugs — and through **`/explore`** (25 links).

**4. Pexels.** Loads in a real browser. `api.pexels.com` returns 401 without a
key, so either set `PEXELS_API_KEY` or have `lib/stock.js` browse the site.

### Walls — confirmed by test, not assumed

| Source | What happens |
| --- | --- |
| **TikTok profile grids** | Header loads (follower counts correct — `@cheapholidayexpert` 220.2K), but **the post grid is empty: 0 items, 0 view counts**. The embedded `__UNIVERSAL_DATA_FOR_REHYDRATION__` blob is 259KB and contains `webapp.user-detail` but **zero `playCount` entries**. TikTok no longer ships the item list to logged-out clients. |
| **TikTok search** | Renders "Something went wrong". |
| **TikTok tag pages** | Login wall, 0 posts. |
| **Pinterest** | Login wall on search *and* on direct pin URLs. Dead without an account. |
| **Instagram** | Logged-out profile shows 0 post links, 0 like counts. |
| **Search engines (Google / Bing / DDG / WebSearch)** | Return 0 usable `tiktok.com/@user/photo/` URLs. TikTok's indexed surface is `/discover/` and `/channel/` pages, not posts. |

---

## The consequence, stated plainly

**The §3 selection algorithm cannot run on TikTok organic.** It requires an
account's ~30 recent posts to compute that account's median. The grid is the
only place that list exists, and it is walled. No amount of patience fixes this;
it is not rate-limiting, it is a product decision.

This matters because TikTok organic is the user's actual channel.

**Two piles, kept separate, as §11 requires:**

- **Pile A — counts as "what works", has a denominator.** Meta Ad Library
  (per-advertiser median run-duration) and Creative Center (CTR percentile).
  Both are **ads, not organic**. They will never be presented as organic.
- **Pile B — craft observation only, no denominator.** Organic TikTok decks
  harvested from `/discover/` and `/explore/`. Absolute like/comment/share get
  recorded, but with no account median these are logged as
  **"observed, unconfirmed"** and never as findings.

**Proposed adaptation of §3 to Pile A**, which preserves its logic rather than
abandoning it: the advertiser page is the account analogue. Compute each
advertiser's **median run duration**, treat an ad running **≥2× that median** as
a winner, require **≥3 winners** before the advertiser qualifies, and require a
pattern in **≥3 advertisers** before it enters the playbook. Same algorithm,
same own-baseline principle, different metric — and labelled as such everywhere.

**On the 100-deck floor:** reachable, but it will be made up mostly of ad
creatives, not organic TikTok carousels. Flagging this now rather than padding
the count later.

---

## Open, needs Yuval

1. **The travel-carousel platform link** he was sent (§12.1). If it exposes
   organic decks with metrics it could restore Pile A to organic content, which
   would be worth more than everything above.
2. **His own analytics screenshots** (§12.2). With TikTok organic walled, his own
   250k views are now not merely the most relevant dataset — they are the *only*
   organic dataset with a real denominator available to this study.
3. **$10k/month — GMV or his own revenue?** (§12.3)
4. **A TikTok or Pinterest login** would reopen profile grids and Pinterest saves
   entirely. Not requested, and not to be assumed — noted only because it is the
   single change that would lift the main constraint.
