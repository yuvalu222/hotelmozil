# 06 — Type on social video

## The iPhone-look question, answered by lineage

Owner's requirement: the white-with-black-outline Hebrew must read one to one
like an iPhone.

`[LIT]` iOS uses **SF Hebrew**, the Hebrew cut of San Francisco. Published
similarity scores put **Roboto at ~78% to SF Pro** — the closest widely
available match — ahead of Public Sans (74%) and Noto Sans (72%).

**Heebo, which the renderer already uses, is a Hebrew extension built on
Roboto.** (Confidence: high on the Roboto lineage, which is documented; I have
not verified glyph-by-glyph against SF Hebrew.) So the typeface family is
already as close as a freely licensed font gets.

Which means the remaining gap is **not the typeface**. It is:
- weight (Heebo 900 vs whatever his slides use)
- optical size relative to frame width
- stroke width and `paint-order`
- letter-spacing and line-height

All four are measurable against his own posted slides rather than guessed, and
that is the next step: render the same Hebrew string at a range of settings,
compare against a crop of his slide, and pick the closest.

**Not doing:** installing Apple's fonts from third-party mirrors. They are
Apple's to license, and there are repositories that redistribute them. Using
one would put his commercial posts on an unlicensed font.

## Sizes, from practice
`[PRACTICE]` Hook line 70-100pt. Headlines no smaller than 36-40px, body
24-30px, on a 1080-wide frame. Sans-serif. High contrast between type and
background — which is what the outline buys us over a drop shadow.

`[PRACTICE]` Slide one: **8-12 words maximum.** More than that and the hook
stops being a hook.

Sources: typewolf.com/san-francisco · fontalternatives.com/alternatives/sf-pro-display ·
discussions.apple.com SF Hebrew thread · postnitro.ai carousel swipe-through
