# ig — TikTok carousels to Instagram, automatically

Every photo carousel published on TikTok **@hotelmozil** is published again on
Instagram **@hotelmozil**: same slides in the same order, fitted to 4:5, same
caption with its 5 hashtags. Built 9.10.2026.

## How it runs

Scheduled task **HotelMozil-IgMirror**, every 30 minutes while the computer is
on (on battery too). Each run:

1. Reads the TikTok profile once. The page's own `/api/post/item_list/`
   response carries every post's slides, caption and song, so nothing is read
   off the screen.
2. A new photo post waits **1 hour** (time to delete or fix it on TikTok),
   then its slides are downloaded and fitted to 1080x1350.
3. Publishes the oldest waiting post through the official Instagram API
   (Instagram Login, `graph.instagram.com`), at most one per run and **3 hours**
   apart, so a backlog never lands as a burst.
4. Windows toast on every publish, hold or failure.

Mirroring started from **9.10.2026** (`cutoff` in state). Older posts are never
touched.

## Decisions it does not make

Held with a toast, never guessed:

| case | why |
| --- | --- |
| more than 10 slides | the API caps a carousel at 10 ("Carousels are limited to 10 images, videos, or a mix of the two") |
| one slide | not a carousel |
| a video | out of scope |

**No sound.** The API cannot attach music to a carousel. On Instagram, music
is added in the phone app only.

## The 4:5 fit (`lib/fit.mjs`)

The API refuses anything taller than 4:5. His slides come in three shapes:

- **3:4** (his own designs): fitted whole over a blurred copy of itself. The
  side bands are 34px each, and nothing is ever cut.
- **9:16** (our decks): the rows holding outlined text are found, and a 4:5
  window is cropped that keeps all of them. If the text spans more than one
  window, the slide is fitted whole like a 3:4 slide.
- **4:5**: resized only.

Calibrated on all 438 of his slides already on disk (`node ig/calibrate.mjs`
draws the contact sheet). On those slides, the only thing a crop removed was
the "Travel" folder label above an iPhone-screenshot slide.

## Images reach Instagram how

The API takes a URL only. Slides are force-pushed as a fresh root commit to a
throwaway branch, `ig-media`, of the public site repo. They are read back from
`raw.githubusercontent.com/<repo>/<sha>/...`, which is pinned to the commit
SHA so the cache can never serve a stale file. The branch is deleted right
after publishing. `main`, which is the Pages branch with `hm.pac`, is never
touched, and neither is the working tree.

## Files

| | |
| --- | --- |
| `mirror.mjs` | the run (`--dry` prepare only · `--now` skip the waits · `--since <date>` first run) |
| `connect.mjs` | one-time: store the Instagram token (reads it from the clipboard) |
| `status.mjs` | page: every post, TikTok next to Instagram, status. Opens in Chrome |
| `install-task.mjs` | registers the scheduled task |
| `calibrate.mjs` | fitter contact sheet over his real slides |
| `lib/` | `tiktok` · `fit` · `caption` · `graph` · `host` · `store` |
| `../test/ig.test.mjs` | caption, API call order against a fake Graph, fitter on synthetic slides |

State, token and logs live **outside the repo**, in
`%LOCALAPPDATA%\HotelMozil\ig\`, because this repo is public.

## The token

The token is generated in the Meta App Dashboard: Instagram > API setup with
Instagram business login > Generate token. It lasts 60 days, per Meta: "Access
tokens from the App Dashboard are long-lived and are valid for 60 days".
`mirror.mjs` refreshes it weekly (`ig_refresh_token`), so connecting is a
one-time step. If a refresh fails, a toast warns 10 days before expiry. A
revoked token gets its own toast, and the post waits.

## Safety against double posts

The carousel container is built first and its id is saved before
`media_publish` is called. A run that dies in between is resolved on the next
run by asking Instagram for the container's status. `PUBLISHED` is recorded as
published, `FINISHED` is published, and an unknown status is asked again
later. An unknown status is never treated as "not published".
