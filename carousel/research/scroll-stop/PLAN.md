# Scroll-stopping research — the plan, written before any data was read

Owner, 8.10: *"you just stated how many stops in how many routes. Not bad, but
certainly not data driven. A huge research effort in which you check exactly
what has to be done to make scroll-stopping as effective as possible. Map
everything you need to know and work for hours to get it."*

## Why nothing measured so far can answer this

* The 847-deck corpus holds likes, saves, shares, comments. **No views.** All
  four are counted after someone has already stopped.
* It was harvested at ≥50K likes. Every deck in it already stopped people.
  You cannot learn what makes a post stop the scroll from a sample containing
  no posts that failed to.
* His own grid (38 posts with views) is the only stop-adjacent data so far.

## The outcome, defined

**Lift = log10(views of a post) − median log10(views of that creator's photo
posts).** A post's own creator is its control: same followers, same niche,
same audience, same posting habits. What is left over is what that post did
differently — and the first frame is the largest part of what a passive feed
viewer sees before deciding.

Honest limits, stated now so they cannot be forgotten later:
1. TikTok's "views" for photo posts must be checked — if a view is counted on
   impression, lift measures how far the algorithm pushed the post, which is
   driven by early engagement, of which stopping is the first step. It is a
   proxy for stopping, not stopping itself.
2. Topic, sound, posting time and trend timing also move views. Within-creator
   comparison removes account-level confounds, not post-level ones.
3. Observational. Where a feature is found, ask whether something else
   travels with it.

## What has to be known — the map

| # | Question | Source |
|---|---|---|
| Q1 | What does TikTok count as a view on a photo post? | TikTok's own docs |
| Q2 | What does the ranking reward on photo posts? | TikTok newsroom, Creator Academy |
| Q3 | Does the cover matter at all, against topic and account? | variance split, within vs between creators |
| Q4 | Which VISUAL properties of a first frame track lift? | grid covers, measured from pixels |
| Q5 | Which COPY properties track lift? | text on the cover, transcribed |
| Q6 | Is the Hebrew audience different? | Israeli creators' grids, separately |
| Q7 | What does experimental research say about attention in feeds? | papers, platform marketing science |
| Q8 | What does experimental research say about headline wording? | the Upworthy Research Archive (real A/B tests) |
| Q9 | What does his own account say, re-read with the same method? | his grid |

## Hypotheses fixed in advance (the ones to test, not the ones to find)

Visual: H1 a person in frame · H2 a face / eye contact · H3 high brightness ·
H4 high colourfulness · H5 text coverage (more vs less) · H6 text in the top
third · H7 a single photo vs a collage/grid · H8 sea or sky dominant ·
H9 a landmark recognisable · H10 a screenshot / app UI.

Copy: H11 the destination named · H12 a question · H13 a number · H14 a
warning / negation ("don't", "mistakes", "אסור") · H15 first person
("I", "we") · H16 addressed to "you" · H17 money / price · H18 a superlative ·
H19 word count (short vs long) · H20 a "top N" list · H21 a curiosity gap
(withheld answer) · H22 "part N" · H23 emoji present.

Anything significant that is NOT on this list gets reported as exploratory,
never as a rule.

## Bar for calling something a finding

* within-creator, with ≥8 photo posts per creator
* effect reported with its n and a bootstrap 95% interval
* a sign test across creators: in how many creators do posts with the feature
  beat that creator's median? A feature that wins in 9 of 10 creators is a
  finding; one carried by a single viral post is not
* measured two independent ways where possible (§18: one regex = one
  measurement of the regex)
