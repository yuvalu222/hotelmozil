# TikTok carousels — what opened, what blocks, where it stands

**Target:** five exact clones of travel carousels that already worked, floor
**50,000 likes**, destinations Israelis actually fly to, with hashtags, sound
and per-slide craft documented. Nothing invented.

---

## 1. Three things that turned out to be wrong

Each was written off earlier in this work, and each was wrong. The corrections
matter more than the conclusions, because every one of them came from a single
under-tested probe.

**"TikTok search is dead."** It is not. A **cold** request to
`tiktok.com/search?q=` returns *"Something went wrong"*. The same request from
a session that has loaded the homepage and cleared the cookie banner answers
normally. One cold probe early on wrote off the entire platform — the one Yuval
actually publishes to — for most of the work.

**"Carousel pages are walled."** Their `__UNIVERSAL_DATA_FOR_REHYDRATION__`
blob really does carry no `webapp.video-detail` scope (6 of 6 tested), while a
video post's blob carries everything. A JSON-only reader therefore sees nothing
and concludes the page is empty. **The page is not empty.** It renders the
slides, the likes, comments, saves, shares, the caption, the hashtags and the
music title — all in the DOM. Reading the rendered page instead of the blob
turns a dead end into a complete record.

**"Find the slides by size."** A carousel page also renders roughly sixty
related-post thumbnails at exactly the same 1200×1600 as the slides, so a size
filter returns the whole page and a strict one returns nothing. The post's own
slides come from a CDN path containing **`photomode`**. That string is the
separator.

## 2. What a carousel page yields

Verified on real posts, not inferred:

| | |
| --- | --- |
| slides | every image, full resolution, from the `photomode` CDN path |
| likes · comments · saves · shares | all four, as rendered text |
| hashtags | exact, from the caption |
| sound | title and artist; `original sound - <handle>` marks the creator's own audio, anything else is a library track |
| caption | in full |

Search result cards additionally print their like count, so the 50,000 floor
can be applied **before** opening a post.

## 3. Carousels read so far

| account | destination | likes | shares | slides |
| --- | --- | ---: | ---: | ---: |
| **@izzy_travels_** | Thailand | **66,200** | 18,100 | 12 |
| **@emsriley** | Lisbon | **52,200** | 15,300 | 15 |
| @greekality_ | Naxos, Greece | 1,192 | 318 | 13 |

Two clear the floor. 138 further carousel URLs were collected from search and
are queued; the highest like count seen on a search card so far is **148,400**,
so decks well above the floor exist in this niche.

## 4. What is blocking, honestly

**The IP is rate-limited, and I caused it.** TikTok now answers post pages with
a **218-character shell** — just the nav chrome — instead of the ~17,000
character page it served earlier in the session. Search is refused outright.
This is the direct consequence of how fast I was requesting, and the only
lever I have is to slow down.

There is no engineering trick here, and I am not going to pretend otherwise.

## 5. How it is set up to survive the night

The pattern all evening was: one new error class, process exits, nothing runs
until a human looks. That is fixed structurally, not case by case.

**The reader cannot throw out of its loop.** Every `warm()` is guarded, a
crashed renderer is rebuilt, a failed URL is left unmarked so it retries, and a
218-character shell is treated as *"we are being refused"* rather than *"this
post is empty"* — it backs off 2 to 30 minutes and keeps the URL.

**It is paced like a person.** Fifteen minutes before the first request, about
a post a minute after that.

**A supervisor restarts it** after any exit, up to 200 times, waits for the
network to answer before restarting, and kills any browser left holding the
profile. Progress lives in `ttr-done.json`, so a restart resumes instead of
repeating.

## 6. What happens at each outcome

- **Five or more decks clear the floor** → five clones, each with its source's
  numbers, hashtags, sound, slide count and per-slide craft.
- **Fewer than five** → exactly what cleared it, with the real numbers and the
  count of what was examined. No padding with decks that did not qualify, and
  no quiet substitution of video posts for carousels.

## Files

- `harvest/tt-read.mjs` — the patient reader
- `harvest/supervise-read.sh` — the supervisor
- `harvest/tt-final.mjs` — search-based harvester (parked while search is refused)
- `analyze/tt-contact.mjs` — contact sheet per deck, numbers in the header
- `analyze/tt-brief.py` — ranks by likes, filters to Israeli destinations
- `harvest/tt-final.jsonl` — harvested decks
- `harvest/supervisor-read.log` — restart history
