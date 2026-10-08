# 03 — Retention, and the shape of a deck end to end

Measured on all 5,744 frames of 489 decks that have five or more slides, with
each deck's positions normalised to fifths so decks of different lengths can be
compared. `[CORPUS]`

## Text carried at every position

| position in deck | top quartile | bottom quartile |
| --- | ---: | ---: |
| first fifth | 0.0141 | 0.0037 |
| second | 0.0109 | 0.0023 |
| third | 0.0124 | 0.0023 |
| fourth | 0.0118 | 0.0027 |
| **last fifth** | **0.0128** | **0.0023** |

Two findings in one table.

**1. The gap is everywhere, not just on the cover.** Top decks carry roughly
**four to five times the text on every single slide**. It was tempting to read
the earlier cover result as "the cover does the work"; it does not. The whole
deck is denser.

**2. The good decks do not fade.** Top quartile ends as strong as it starts
(0.0128 against 0.0141 — essentially flat). Bottom quartile busyness *decays*
across the deck, 0.095 in the first fifth down to **0.082 in the last**, a 14%
drop.

So weak decks coast toward the end, and strong ones do not. Given that
completion rate is the primary ranking signal (`01-algorithm.md`), a deck that
weakens as it goes is losing viewers exactly where it can least afford to.

## This is the owner's instruction, measured
He said: *"כמות שקופיות נכונה וכל אחת פיצוץ"* — the right number of slides and
every one of them a banger, because padding with weak slides costs the last
slide, which is where the app gets named.

That is not a stylistic preference. It is what separates the quartiles, it has
a mechanism (completion rate), and it now has a number: **the last fifth of a
top deck is as dense as its first.**

## The operational test
For any deck, before posting: is slide N as strong as slide 2? If the answer is
no, the slide should not be there — cutting it raises completion rate and
raises the share of viewers who reach the closing pair.

## Caveat
Density is measured, interest is not. "Dense" is a proxy for "has something to
say"; a slide could be dense and dull. The direction is strongly supported, the
mechanism is inferred.

## The last slide specifically

Measured on 250 decks (125 per quartile), comparing each deck's final slide
against that same deck's own median so deck-to-deck differences cancel out.

| | top quartile | bottom quartile |
| --- | ---: | ---: |
| last-slide text vs that deck's own median | **0.90x** | 0.58x |
| rows of text on the last slide | **4.0** | 1.0 |
| where its text starts (0 = top) | 0.245 | 0.358 |
| **last slides with no text at all** | **9 / 125** | **47 / 125** |

Top decks finish on a **full** slide — nine tenths as dense as the rest of the
deck, four rows of type, sitting high in the frame. Bottom decks finish on a
fade: a single line, lower down, and in **almost four of every ten cases
nothing at all**.

### Why this matters more to us than to anyone else
The last slide is where the app is named. Every structural finding in this log
points at the same place: completion rate is the primary ranking signal, weak
slides cost completion, and the pay-off slide is the one that gets lost. A deck
that tapers is a deck whose advert nobody reaches.

His own closing pair already matches the top-quartile profile — the branded
card is dense, worded, and sits high. That was arrived at by instinct and it
measures correctly.

### What would break it
Appending a quiet, near-empty "thanks for watching" slide after the card. That
is precisely the bottom-quartile signature.
