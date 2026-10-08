# Round two — ten new decks, ten distinct mechanics

Every deck here answers a **decision** or opens a **narrow category**, because
that is what the harvest says gets saved (see TIKTOK.md §4c and §5b). None
repeats a mechanic already built, and none reuses a source already cloned.

| # | id | mechanic | from | source saves |
| --- | --- | --- | --- | ---: |
| 15 | `tt-15-screen-locations` | the real place behind a film or series | @wabisabi.trips.japan | 113,400 |
| 16 | `tt-16-what-to-bring-home` | what to buy before you fly home | @mendezsan_ | 106,000 |
| 17 | `tt-17-hotel-pools` | an absurdly narrow category, shot beautifully | @thaleadesign | **244,000** |
| 18 | `tt-18-month-by-month` | **when**, not where — one destination per month | decision shape |
| 19 | `tt-19-under-four-hours` | everything reachable from Tel Aviv in under four hours | decision shape |
| 20 | `tt-20-what-a-day-costs` | what a day actually costs, in numbers | @nearxfar register |
| 21 | `tt-21-first-vs-fifth` | first visit versus fifth visit to the same city | decision shape |
| 22 | `tt-22-israeli-mistakes` | the mistakes Israelis specifically make abroad | @maryamontour shape, new angle |
| 23 | `tt-23-thermal-baths` | second narrow category: Europe's baths and hot springs | @thaleadesign shape |
| 24 | `tt-24-three-day-version` | the three-day cut of a classic week-long trip | decision shape |
| 25 | `tt-25-budapest-spots` | a list of named photo spots in ONE city | @klyvytee | 57,000 |

## Rules carried into every one of them

- **No numbers on slides.** The count goes on the cover only.
- **Outlined white text, iPhone emoji**, sized to the measured source band:
  3.5-4.2% of frame width for body and label, 6.7-8.7% for a headline.
- **Every image a wow.** Queries ask for light, weather, crowds, close-ups —
  never a bare place name. Each deck is reviewed as a contact sheet before it
  ships, and a merely correct photo is re-queried.
- **The hotel line** closes every deck: Booking and Agoda, then HotelMozil.
- Destinations are the ones Israelis actually fly to.


## What the first render caught

The rule "every image a wow" is not a gate anyone can automate, and the first
pass proved it. Reviewed as contact sheets, these came back wrong:

- **`tt-17` had no pools in it.** Seven of eight slides were the city, because
  Pexels matches loosely and nothing in its response says the subject is
  missing. Fixed at the root: `image.must` now names the subject and `build.js`
  prints `NO PHOTO OF THE SUBJECT` rather than substituting the near-miss.
  `analyze/probe-pexels.mjs` asks Pexels what it really has, before a slide is
  written around it.
- **`tt-15` credited Narnia to Lake Bled.** Prince Caspian filmed on the Soca,
  not at Bled. The slide moved to the Soca, which is also the better photo.
- **`tt-16` illustrated mastic with gold Christmas baubles.** Pexels cannot
  shoot mastic resin, so the item changed to one it can — the evil-eye charm.
- **`tt-21` and `tt-24` rendered their labels in pink**, from the source. The
  owner's white-with-black-outline rule outranks the clone; `.swap-p` is white.
- **`tt-22` was illustrated like a brochure** — exchange counters, shuttered
  shops, a stock waiter. The copy carries the mistake; the picture has to carry
  the stop. Every frame is now a place worth looking at, which is what the
  highest-performing mistakes decks in the corpus do.
- **`tt-20` and `tt-12` left the bottom 40% of every page blank white.**
  `.pg-art` now takes the height that is left.
- **Two-photo slides never got the duplicate veto**, so `tt-10` showed the same
  Chania harbour as both halves of one slide and again on another. The veto now
  runs on every path that places a photo.
- **The memo card was labelled "Memo No.01" / "Memo No.11"** — slide numbers by
  another name, and they break the moment a slide is dropped. The label is now
  just "Memo".
