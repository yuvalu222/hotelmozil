# 10 — What I got wrong, and what caught it

Kept deliberately. A correction is worth more than a new finding, and burying
one is how a wrong model keeps running.

## 1. "A colour-based image picker cannot work"
**Claimed** after building a scorer, testing it on the 524-deck corpus and
finding 0.1-0.4 sd separation between top and bottom quartile.

**Wrong, and the flaw was mine.** Every deck in that corpus had already cleared
50,000 likes. Comparing excellent against excellent cannot reveal what
separates adequate from excellent — textbook restriction of range. The tourism
literature, measured across a full range, finds **saturation is the single most
critical attribute** viewers respond to in travel imagery.

**Caught by:** going outside my own data, after the owner said the picker was
critical and had to work.

## 2. "Too much text" taken at face value
The owner said text amount and position were wrong. I was about to reduce text.
`[CORPUS]` says decks that get saved carry **3x the text**, starting higher, in
a block 6.7x taller. What actually failed was a thin line of copy floating over
a photo, and his own instruction — four items to a slide, each in a quarter —
is the fix. Density was never the problem; structure was.

## 3. No top safe area existed at all
`SAFE_BOTTOM = 330` had been in the checker from the start. Nothing ever
reserved the top, so every layout put copy under TikTok's own header. He found
it by hand-cropping a deck before posting. Three layouts were starting text at
30px, 80px and 134px against a 240px safe line.

**Caught by:** him, not by me, and only because he did the work manually.

## 4. Rendering 9:16 when his whole library is 3:4
Found by measuring his re-crop: 1080x1920 -> 1284x1712, which is exactly 3:4.
`[CORPUS]` 3:4 frames median 0.46 saves/like against 0.39 for 9:16. He has
since decided to stay full-bleed anyway, which is his call; the measurement is
recorded in case it matters later.

## 5. Over-blocking images
A filter written to catch one unpostable frame also caught `sensual`,
`lingerie`, `provocative`, `seductive` — words that describe ordinary poolside
photography, which is most of a travel carousel. He corrected it: swimwear is
fine and good for reach. Narrowed to explicit terms only.
