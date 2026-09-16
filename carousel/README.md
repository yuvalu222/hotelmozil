# carousel

Builds one carousel from one JSON spec and emits the image sets four platforms need.

**Status: unrun.** The renderer has never executed — `api.pexels.com` and
`images.pexels.com` are blocked by this environment's network policy, so the
photo-sourcing step cannot complete. Treat everything here as untested until it
has produced a slide.

## What it does

A spec lists slides. Each slide carries its copy and an image brief. The build
searches Pexels for photos matching each brief, renders every slide through
headless Chromium, and writes two JPEGs per slide.

```
node build.js specs/example.json
node build.js specs/example.json --debug     # draw the safe-zone guides
node build.js specs/example.json --no-fetch  # reuse cached photos
```

Output per slide:

| File | Size | Goes to |
| --- | --- | --- |
| `NN-tiktok.jpg` | 1080×1920 | TikTok, YouTube |
| `NN-ig.jpg` | 1080×1350 | Instagram, Facebook |

## Why one render and not four

All four platforms accept 1080px width, so the only real difference between them
is vertical extent. Slides are laid out on a 1080×1920 canvas with every
load-bearing element — price, hotel name, dates, CTA — confined to a 1080×1150
band centred at y=845. The Instagram file is a centre crop of the same render,
not a second layout. No font rescaling, no reflow.

That band is also what keeps text clear of TikTok's caption bar and sound rail
at the bottom and the username row at the top. `--debug` draws both the band and
the Instagram crop so you can check a design against them.

## Constraints worth knowing before you design

- **10 slides maximum.** Instagram's publishing API, YouTube and Facebook all cap
  there. TikTok allows 35, but a longer deck is a TikTok-only asset. A "10 tips"
  listicle plus a hook slide plus a closing slide is 12 — it will not
  cross-post. `build.js` refuses to build over 10.
- **4 slides minimum** for a TikTok photo post.
- **JPEG only.** Instagram's API rejects PNG; TikTok's API rejects PNG. Output is
  JPEG at q88, sRGB.
- **1080px wide, never more.** Instagram's API scales down past 1440, and some
  publishers reject a shorter side above 1080.
- **1080×1440 (3:4) cannot be published through any scheduler**, despite being a
  valid size in the Instagram app. The API floor is 0.8 (4:5).
- **Facebook has no organic swipeable carousel.** Multi-photo Page posts render
  as a mosaic. True swipe on Facebook is an ads-only format.
- **YouTube has no publishing API for image posts.** That platform is manual,
  permanently. Budget a couple of minutes per post.

## Copy conventions in the spec

These come from the few carousel tactics with real samples behind them, rather
than from the large body of vendor-blog advice that has nothing behind it:

- **Put the number in the first ~125 characters of the caption.** The feed
  truncates around there.
- **End the caption on a question.** Measured at +26% comments across 2.3M posts —
  the best-evidenced single tactic available.
- **1–5 specific hashtags.** The effect is real but small, and flattens past 5.
  Skip `#fyp`.
- **Fill in `alt` on every slide.** TikTok supports ALT text on photo posts and
  not on video. For deal content that should still surface in search months
  later, it is free indexed text and almost nobody uses it.

Slide count, hook wording, text density and audio choice are *not* on this list.
They are untested folklore — reasonable, but you will learn more from four weeks
of your own A/B tests than from anything published.

## Why prices are drawn as text

The price, hotel name and dates render through a deterministic template, never
as generated imagery. Current best-in-class image models reach roughly 94–96%
text accuracy, which still misprints about one number in twenty. When the number
*is* the product, that is disqualifying.

## Setup

1. A free Pexels API key: https://www.pexels.com/api/ → `PEXELS_API_KEY`.
2. Add `api.pexels.com` and `images.pexels.com` to the environment's allowed
   domains (environment selector → Network access → Custom, or Full).
3. Playwright with Chromium on the path.

## Not built yet

- A **tips** slide template (numbered listicle) alongside the deal template.
- Local-image slides, for screenshots that should look like a real phone rather
  than a designed slide.
- Publishing. This builds files; it does not post them. Instagram and Facebook
  can be automated against your own accounts with no Meta App Review — an app in
  Development Mode with your account as an Instagram Tester is enough. TikTok
  needs its Content Posting API audit before it can post anything publicly;
  unaudited clients are limited to private posts.
