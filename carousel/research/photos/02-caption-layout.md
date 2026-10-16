# 02 - Why the photos sit higher when the caption is long, and what it means for slide text

Researched 16.10.2026, following the owner's observation on @hotelmozil: "when a
post's description is more than one line, all the photos in the carousel appear
higher on screen."

Grades, as in 01:

- **A** = measured (pixels, controlled)
- **B** = large observational, or official documentation
- **C** = creator anecdote
- **D** = opinion, or an unsupported design-blog claim

Every number below is tagged **[measured]**, **[computed]** (arithmetic on
measured numbers) or **[inferred]** (my reasoning, not observed).

Raw material is in `research/photos/caption-layout/`:

- `shots/` and `mobile.jsonl`: 31 web-player measurements
- `evidence/`: the app frames measured below
- `probe.mjs`, `batch.mjs`, `measure.py`, `discover.mjs`, `dlvid.mjs`: the scripts

---

## 0. Bottom line

1. **The effect is real, and it is the app, not the web.** In the TikTok app, a
   photo post whose description runs past about one line, **or that has a Title**,
   switches to a second layout.
   - **Split layout:** the photo sits in a fixed box at the top of the screen. The
     username, Title, description, sound and anchors sit on black **below** it,
     not over it.
   - **Normal layout:** a short caption lies over the photo, which sits lower.
   - Several creators report this, with thousands of agreeing comments, and TikTok
     has auto-generated search pages for it (B/C). I measured it on three real app
     frames (A, n=3).
2. **The split-layout box measures 3:4.** It is the full screen width, ratio
   0.729-0.743, from 5.6-5.7% to 67.8-69.0% of screen height [measured, 2 clean
   iPhone frames].
   - The photo is **cropped to fill the box, not shrunk**: same width, same scale
     as in the editor [measured].
   - A **3:4 photo (1440x1920) fits whole**. A **9:16 photo loses about 11-12.5%
     at the top and the same at the bottom** [measured on 9:16 / computed].
3. **The mobile web player does not reproduce any of this.** Its photo box is
   fixed: 393x528 at 660 px viewport height, 393x590 at 852 [measured].
   - Across 31 page loads (15 posts, 0 to 2,171 characters, 9:16 / 3:4 / 4:5 /
     2:3), the image box did not move by 1 px with caption length.
   - It also did not move in 21 "See more" expansions [measured].
   - On the web the caption is an overlay that grows **upward over the photo**, so
     the web is useless as a proxy for this question.
4. **Rules** (section 5):
   - Make photo-mode slides **3:4**.
   - With 3:4, a long caption costs nothing on the image.
   - With 9:16, keep the description to one line and add no Title, or keep all
     slide text inside y = 380-1590 of 1920.

---

## 1. What the sources say

### 1.1 The split layout: creator reports with a measurable screen

| # | Source | Verbatim | Grade |
|---|---|---|---|
| 1 | @thekeirajones (TikTok coach), 25.8.2025, 5,348 likes. https://www.tiktok.com/@thekeirajones/video/7542662864071429431 | "it looks good in preview and then it ends up doing this where it has this black section at the bottom ... the reason it does this is to make room for the caption. So if you shorten the caption to just like basically one sentence, it will have the photo take up the entire screen. But if you do any more than like one line, that's when it will look like this." | C (the screenshot behind her is measurable, see 2.1) |
| 2 | Comment under #1, 45 likes, 2.9.2025 | "oh also delete the title if you made a title! i made it just the one line caption and no title and it finally fixed it" | C |
| 3 | Comment under #1, 66 likes, 28.1.2026 | "I reduced my caption and the black box is still there! It cuts off the top of the photo and it didn't do that before" | C |
| 4 | Comment under #1, 928 likes, 4.1.2026 | "I have no caption and it's cutting off still" | C (counter-report) |
| 5 | Comment under #1 | "But the first photo is regular but the rest are like that" | C |
| 6 | @trinn_starlight, 28.5.2026. https://www.tiktok.com/@trinn_starlight/video/7644754003837930766 | Caption: "EDIT: answer is in the comments!! (I also found out that you can't make the description too long so just do hashtags)". Top comment, 500 likes: "When you add a title, it automatically does that. Just do a normal title and it'll keep it the way you want it." Second comment: "It's the caption, if you have a shorter caption it'll look like the beginning" | C (her editor-vs-preview frame is measured, see 2.1) |
| 7 | @.swanito, about 15.7.2026. https://www.tiktok.com/@.swanito/video/7662846955881581838 | "when I post it, TikTok automatically shifts all the pictures up and there's this massive black bar." Comment: "i'm pretty sure it's only when your caption is longer than 1 line" | C |
| 8 | @sabaledita, 2.12.2025. https://www.tiktok.com/@sabaledita/video/7579412072237206805 | Caption: "Solucion Tik Tok me recorta las imagenes" (TikTok crops my images). A screen recording of the split layout on an iPhone. | C (frame measured, see 2.1) |
| 9 | TikTok's own search-generated pages, e.g. https://www.tiktok.com/discover/when-i-post-photos-on-tiktok-my-caption-pushes-up-my-photos (keyword created 13.5.2024), plus "how-to-fix-tiktok-photo-cropping-long-caption" and "why-does-the-photo-on-my-tiktok-keep-getting-placed-up" | Page summary: "TikTok may crop your photos to make room for the caption, which can result in a black bar at the bottom of the image ... shortening your caption to a single line" | B as a volume signal (these pages exist because people search the phrase); D as an explanation (machine summary) |

**Timeline [from post dates]:**

- First complaints: early-to-mid 2025.
- Waves: January-February 2026 and May-October 2026.
- Counter-reports (#4, #5, and "My caption is so short and it is still doing
  this") show the trigger is **not uniform across users or versions**. That looks
  like a staged rollout or an A/B test [inferred].

### 1.2 Official TikTok material

**Nothing official describes the photo-mode layout.** The nearest statements are
about ads:

| # | Source | Verbatim | Grade |
|---|---|---|---|
| 10 | TikTok Ads, TopView spec. https://ads.tiktok.com/resources/help/article/tiktok-reservation-topview | "The safe zone size is determined by the ad caption length and any Interactive Add-on usage; the longer the caption, the smaller the safe zone will be." Also: up to 4 caption lines are shown, beyond which "the text would be covered by a See more message". | B (video ads, not photo mode) |
| 11 | TikTok Ads, In-Feed safe zone (already in `research/clickbait/05-visual-attention.md` 5.2) | "The safe zone size is determined by the dimension (vertical, horizontal, or square), ad caption length, and any additional formats used." | B (ads) |
| 12 | TikTok Image/Carousel Ads Playbook (PDF). https://ads.tiktok.com/business/library/Image_Ads_Carousel_Ads_Playbook.pdf | "Vertical, horizontal and square images are all supported, but vertical ones are most recommended for TikTok. (Other aspect ratios may result in black cut-off in feed.)" | B |
| 13 | Creator Academy, photo posting. https://www.tiktok.com/creator-academy/en/article/photo-posting | "Create a compelling title that will instantly hook in users and convince them to stop scrolling and swipe through your photo post." · "Crop all photos to the same ratio to give it a cleaner look." | B (says nothing about layout) |
| 14 | Content Posting API, photo post. https://developers.tiktok.com/doc/content-posting-api-reference-photo-post | Title: "maximum length for photo posts is 90 in UTF-16 runes". Description: "maximum length for photo posts is 4000". | B |

### 1.3 Design blogs (all D, none show evidence)

- **reelcarousel.app (22.7.2026):**
  - "Upload something narrower than 9:16 and TikTok fills the gap with a
    stretched, heavily blurred copy of your own image."
  - 4:5 "Sits inside the screen rather than filling it, so TikTok has room to
    place the caption below your artwork instead of over it."
  - "A long caption pushes this band even higher."
- **postwaffle.com (10.2.2026):** 4:5 "leaves a gap below the image where TikTok
  displays your caption".
- **cadenus.io:** "130 px clear at the top, 484 px at the bottom, 44 px on the
  left and 140 px on the right" (1080x1920, video).

None of these accounts for the split layout.

### 1.4 Instagram

- **Feed carousels:** the caption renders **below** the media, so its length
  cannot move the images. No report says otherwise [inferred from the layout; no
  source found that tests it].
- **Per-slide captions:** igeeksblog (22.7.2026): "As viewers swipe through the
  carousel, the caption automatically changes to match the content currently
  displayed on screen" (B/C).
- **Feed sizes:** 4:5 (1080x1350) is the API ceiling we already crop to, per
  `IG_CROP` in `lib/render.js`.
- **Reels:** the caption is an overlay. The usual secondary-source safe zone is
  14% top, 35% bottom and 6% sides (about 270 / 670 / 65 px on 1080x1920). I could
  not open Meta's own page to confirm the wording (B-).
- **Not found:** anything on caption length changing the Reels overlay.

---

## 2. Measurements

### 2.1 The app (real phone frames inside creators' videos)

| Frame | Device | Screen in frame | Photo box (x, y) | Box ratio W/H | Box top / bottom as % of screen | Notes |
|---|---|---|---|---|---|---|
| @trinn_starlight, editor vs Preview (`evidence/app-trinn-editor-vs-preview.png`) | iPhone, 19.5:9 | 591x1280 | full width x y 72..883 | **0.729** | **5.6% / 69.0%** | Title (one emoji) plus a 4-line description. Same width and same on-photo type size as in the editor ⇒ **no rescale**. The overlay text sits about 120 px higher relative to the box, and about 127 px is lost at the bottom ⇒ **centred cover-crop**, about 11-12% off each end of a 9:16 image. |
| @sabaledita, feed (`evidence/app-sabaledita-split.png`, right half) | iPhone, phone filmed on a monitor | about 249x540 | x 166..415, y 383..718 | **0.743** | **5.7% / 67.8%** | Screen ratio 249/540 = 0.461 matches 19.5:9 (0.462), so the box spans the full width. Photo-mode dots, then "Sabale Edita [Foto]", a 4-line description and the music line, all on black below the photo. Two different posters fill the same box. |
| @thekeirajones, her own posted photo (`evidence/app-keirajones-posted.png`) | iPhone, greenscreen | 576x1024 crop | photo ends at y=645 | n/a | bottom about 63% | The greenscreen crop may hide the true top. Title "Trend alert 8/25", a 5-line description, music, "Search" anchor and view count on black. The username line overlaps the bottom ~3% of the photo. |

**Results.**

- **Split-layout box:** full width, ratio **0.73-0.74 (≈ 3:4 = 0.75)**. It is
  anchored just under the status bar and ends at about **68-69% of screen
  height** [measured, n=2 clean].
- **Overlays on the photo inside that box:**
  - top bar (tabs, or "Preview"/"Buscar"): about **7% of the box height**
  - right action rail (avatar, like, comment, save, share): about **13% of the
    box width**
  - bottom: nothing, except in one frame where the username overlaps about 3%

  [measured on the two clean frames, ±2%]
- **Converted to the iPhone 14/15/16 (393x852 pt):**
  - box ≈ 393 x 530-540 pt, y ≈ 48 → 580 pt
  - description panel ≈ 580 → 770 pt
  - tab bar below that

  [computed]

**Not measured: the normal (short-caption) layout in the app.** I found no
clean frame of a 3:4 photo posted with a one-line caption. What creators say is
that the photo "take[s] up the entire screen" and the text lies over it.

- **9:16 photo:** fills the player area [inferred].
- **3:4 photo:** has to be letterboxed with a black or blurred fill and placed
  lower than in the split layout, which is the owner's "higher" when the layout
  switches [inferred].
- **Size of the jump:**
  - centred in a 393x769 pt player (above an 83 pt tab bar), a 3:4 image would
    start at about 122 pt
  - in the split layout it starts at 48 pt
  - **the jump would be ≈ 75 pt ≈ 9% of screen height** [inferred geometry, not
    observed]

### 2.2 The mobile web player (iPhone 14 Pro emulation, Chrome, fresh profile per page)

All figures are CSS px, viewport 393 wide. **Caption block** = the overlay from
the username top to the bottom of the music line, which is always 514 (660-high
viewport) or 576 (852-high). **Overlap** = how far the caption block reaches up
into the rendered photo.

| Post (tag) | Image | Caption chars | Photo box at 660 / 852 | Caption block top at 660 | Overlap at 660 | Box after "See more" |
|---|---|---|---|---|---|---|
| X4 adar.mosha | 3:4 | 0 | 0..528 / 0..590 | 468 (username only) | 58 | n/a |
| F own | 9:16 | 17 | same | 442 (1 line) | 86 | n/a |
| J own | 3:4 | 37 | same | 442 | 84 | n/a |
| C own | 3:4 | 46 | same | 424 (2 lines + See more) | 102 | **unchanged** |
| B own | 9:16 | 52 | same | 424 | 104 | **unchanged** |
| A own | 9:16 | 182 | same | 388 (4 lines, the clamp) | 140 | n/a |
| E own | 3:4 | 1,008 | same | 388 | 138 | **unchanged** |
| D own | 3:4 | 2,171 | same | 388 | 136 | **unchanged** |
| X0/X1 holysale1 | 9:16 | 1,664 / 1,705 | same | 388 | 140 | **unchanged** |

The full 31-row table, including 4:5 and 2:3 posts and the 852-high runs, is
`python -I research/photos/caption-layout/measure.py mobile.jsonl shots` (run
from `research/photos/caption-layout/`).

**How the web player behaves:**

- **Box size:** the photo box is a fixed `object-fit: contain` box, 528 high at
  660 and 590 high at 852 (= min(80% of viewport height, 1.5 x width) [computed
  from two points]).
- **Fit by aspect:**
  - 3:4 fills the width
  - 9:16 is pillarboxed with a blurred copy of itself
  - at 852, a 3:4 image is centred: 33..557
- **Caption growth:** the caption grows **upward over the photo** at 18 px per
  line and stops at 4 lines, then shows "See more".
- **Expansion:** the expanded text also overlays the photo. TikTok adds an
  AI-written title and keywords block in the expanded state (`evidence/web-collapsed-vs-expanded.png`).
- **The photo never moves** [measured, 31/31 loads, 21/21 expansions].

**Desktop:** the 1280x900 page rendered blank in two attempts and was not
pursued. The desktop layout puts the caption in a side column, so it could not
show the effect either.

---

## 3. Mechanism

**[measured where marked; otherwise inferred]**

1. The app has **two photo-mode layouts**, chosen per post.
   - **Trigger:** a description longer than about one line, **or any Title**
     [C, many reports]. The exact threshold and rollout vary [C counter-reports].
   - **Normal layout:** the photo fills the player and the caption is laid over
     its bottom, like a video.
   - **Split layout:** the photo is moved into a **top-anchored, full-width box
     of about 3:4** [measured], and the text panel is drawn on black underneath.
2. **Inside the box the photo is cover-cropped and centred, not shrunk.**
   - Same scale as in the editor [measured].
   - **3:4 fits** [measured box ratio 0.73-0.74].
   - **9:16 loses (1 - 0.5625/0.74)/2 ≈ 12% at the top and 12% at the bottom**
     [computed; Trinity's overlay text moved about 11-12%, measured].
   - **4:5 (0.8)** would lose about 4% on each **side** [computed].
3. **The box size does not grow line by line.** Two frames with 4- and 5-line
   descriptions give the same box. That suggests a fixed second layout, not a
   continuous push [inferred from n=2].
4. **"Photos higher" is the switch itself.**
   - For 3:4 slides: the image goes from a lower, letterboxed position to the top
     box, about 9% of screen height up [inferred geometry].
   - For 9:16 slides: the image also loses about 12% at each end, so text near
     the top or bottom edge vanishes [computed].
5. **Instagram does not do this.** The feed caption is below the media, so there
   is nothing to move. Reels overlay the caption with a fixed safe zone.

---

## 4. Safe zones

### 4.1 For our two canvases

Coordinates are image pixels. Each zone is the area that stays visible and
uncovered in **both** layouts, so a post is safe whatever caption it gets.

**3:4, 1440x1920**

| | Split layout (long caption / Title) [measured box + overlays] | Normal layout (1-line caption) [inferred] | Use this |
|---|---|---|---|
| Top | header covers about 7% of box ⇒ 135 px | photo starts below the tabs (letterboxed) ⇒ about 0 | **≥ 200** (10%, with margin) |
| Bottom | nothing over the photo (1 frame: username over about 3% ⇒ 60 px) | the caption block lies over the lowest part of the photo on short (16:9) phones; on 19.5:9 phones it mostly sits in the bar [inferred] | **≤ 1700** (keep the bottom 11% free) |
| Right | rail covers about 13% ⇒ 190 px | rail about 13% of screen width ⇒ 190 px | **≤ 1250** (190 px free) |
| Left | 0 | 0 | ≥ 70 (margin) |
| Text band | | | **y 200-1700 = 78% of the height** |

**9:16, 1080x1920**

| | Split layout [computed from measured box] | Normal layout (existing checker values) | Use this |
|---|---|---|---|
| Top | 220-240 px **cropped away**, plus the header over 7% of the box (about 105 px) ⇒ 345 | `SAFE_TOP = 240` | **≥ 380** |
| Bottom | 220-240 px cropped ⇒ visible to about 1680 | `SAFE_BOTTOM = 330` ⇒ 1590 | **≤ 1590** |
| Right | rail ≈ 13% ⇒ 140 px | `SAFE_RIGHT = 150` | **≤ 930** |
| Text band | | | **y 380-1590 = 63% of the height** |

**Consequence for the current tool [computed].**

- `analyze/overflow-check.mjs` and `lib/render.js` use `SAFE_TOP = 240` on a
  1080x1920 canvas.
- 240 px is **exactly** the strip the split layout cuts off a 9:16 slide.
- So on any 9:16 post with a long description or a Title, text that starts at
  y=240 starts at the crop line and runs under the app header.
- Under the split layout the top limit for 9:16 has to be about 380.

I have **not changed** the checker. That decision belongs to the owner, because
it interacts with his preference for 9:16 full-bleed (`lib/render.js` header,
`research/10-corrections.md` § 4).

### 4.2 The caption itself

- **Split layout:** the description is shown on black below the photo, roughly 4
  lines then "... more", and never over the image [measured on 3 frames].
- **Normal layout:** one line lies over the photo [C].
- **Web:** up to 4 lines over the photo, 18 px per line [measured].

---

## 5. Rules

| Rule | Basis |
|---|---|
| **(a) Render photo-mode slides at 3:4 (1440x1920 or 1080x1440).** It is the only ratio that survives both layouts uncropped: the split-layout box *is* 3:4. Text band y 200-1700, x 70-1250 on 1440x1920. | measured box + computed |
| **(a') If a deck stays 9:16** (the owner's full-bleed preference), keep all text in y 380-1590, x ≤ 930 on 1080x1920. That is 63% of the frame instead of the 70% the current checker allows. | computed |
| **(b) Caption length:** **with 3:4 slides, write the caption as long as it needs to be.** The split layout costs nothing on a 3:4 image, and the text sits on black instead of over the photo, which is cleaner. **With 9:16 slides, keep the description to one line and add no Title**, or accept losing about 12% at each end. | measured + C |
| **(b') Do not use the photo-mode Title field with 9:16 decks.** Several creators say a Title alone switches the layout. | C |
| **(c) Keep the layout consistent across a deck and across the grid.** A deck whose posts flip between layouts looks inconsistent. Short captions put 3:4 slides lower in the frame, long captions put them at the top. Pick one caption style per series. | inferred |
| **(d) Instagram:** caption length does not matter for the feed (it sits below the media). For the 4:5 crop, keep the existing `IG_CROP` window. | inferred from layout |

---

## 6. What is still unknown, and how to settle it in five minutes

1. **The normal-layout position of a 3:4 photo in the app** (centred? how far
   down?), and the exact "one line" threshold for Hebrew text plus hashtags.

   *To test (owner's phone, one screen recording, or I measure his screenshots):*
   - post the same 3:4 slide twice, as private or friends-only drafts
   - one copy with a 1-line hashtag description, one with a 3-line description
   - screenshot both in the feed
   - `measure.py`-style edge detection then gives the jump in px and the
     threshold.
2. **Whether the switch applies to every slide or only after the first** (one
   report says "the first photo is regular but the rest are like that").
3. **Android.** Every clean frame here is an iPhone. One Android demo
   (@dianasaucedahn) shows the normal layout only.
4. **Rollout.** Counter-reports mean some accounts or versions never switch, or
   always switch. Our own account's behaviour is the one that matters, and the
   test in point 1 settles it.
