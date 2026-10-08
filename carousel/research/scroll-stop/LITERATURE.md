# What outside evidence says — each item weighted by what it actually is

Ranked strongest first. "Weight" is how much it is allowed to move a decision.

## 1. Randomised experiments on wording — Upworthy Research Archive · weight HIGH for wording

Matias, Munger, Le Quere, Ebersole (2021), *Nature Scientific Data*,
osf.io/jd64p. 32,487 headline A/B tests, US news publisher, 2013-2015.
Re-analysed here (`analyze/upworthy.mjs`): only tests whose arms share one
image, so arms differ in wording alone; each arm centred on its own test;
bootstrap over tests. Looked at on the exploratory file, then re-run
UNCHANGED on the confirmatory file (4.8x larger).

| feature | exploratory (2,307 tests) | confirmatory (11,053 tests) | verdict |
|---|---|---|---|
| question mark | −11.3% | **−9.5%** [−10.5, −8.4] | replicated, harmful |
| a number | +6.5% | **+6.0%** [+4.6, +7.5] | replicated |
| warning (mistake/stop/wrong/avoid) | +6.2% | **+5.4%** [+3.4, +7.3] | replicated |
| superlative (best/worst/most/ever) | +4.1% | **+6.2%** [+4.7, +7.9] | replicated |
| curiosity (this/here's/why/what happened) | +6.3% | **+6.3%** [+5.4, +7.3] | replicated |
| exclamation mark | −12.3% | **−9.6%** [−12.3, −7.0] | replicated, harmful |
| ALL-CAPS word | −7.2% | **−5.8%** [−7.5, −4.2] | replicated, harmful |
| money words ($/cost/price/free/cheap) | −5.7% (n.s.) | **−9.5%** [−12.1, −6.9] | significant in confirmatory only |
| negation (not/never/don't/no) | +1.7% (n.s.) | +2.2% [+1.2, +3.4] | small |
| "N things/ways" list | +15.3% | +3.9% [−0.1, +8.0] | **did not replicate** |
| "you/your" | +0.4% | +0.6% | no effect |
| "I/my/we" | +1.3% | +0.7% | no effect |

**Does the KIND of question matter?** Tested because his most-viewed cover
is a practical question. `analyze/upworthy-questions.mjs`, each kind against
question-free arms of the same story, confirmatory file:

| question kind | tests | vs no question |
|---|---|---|
| practical (how/what/where/which/when) | 1,584 | **−10.2%** [−12.1, −8.3] |
| yes/no | 1,106 | **−11.7%** [−14.0, −9.0] |
| why | 335 | **−9.0%** [−13.0, −5.4] |
| other | 3,075 | **−8.9%** [−10.4, −7.6] |

The hope that a practical question escapes the penalty was tested and
rejected: the cost belongs to the question mark, whatever the question.

**Limits that must travel with these numbers:** English; US; a CLICK on a
headline in a Facebook-era news feed; long headlines (median well over 10
words — so "short headlines lose" does not transfer to a 5-word cover). The
medium differs from a TikTok first slide, which is stopped at, not clicked.
What transfers is the direction of wording effects, and only where the TikTok
data does not contradict it.

## 2. TikTok's own definitions and statements · weight HIGH for mechanism

* **A view is an impression that started to play**, counted once per
  impression session, replays excluded — ads.tiktok.com/help/article/video-play.
  So public view counts measure REACH, not stopping.
* **Ranking signals** — likes, shares, comments, follows, and watching to the
  end ("a strong indicator of interest"); "neither follower count nor whether
  the account has had previous high-performing videos are direct factors" —
  newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you. Each post is
  judged by how its first viewers respond, which is why within-creator
  comparison is the right design.

## 3. TikTok marketing-science claims about VIDEO ADS · weight LOW

From ads.tiktok.com/help/article/creative-best-practices and the Creative
Codes one-pager. Mostly descriptive, base rates not given, video not photo:
* "over 63% of videos with the highest CTR highlight their key message or
  product within the first 3 seconds" — descriptive; no comparison group.
* suspense early: +16% watch time; surprise: 1.7x completion.
* text overlays: "+64% lift in conversion rate" — unspecified comparison.
Direction only: say the value early rather than withhold it.

## 3b. Academic TikTok virality studies · weight LOW

* "Slapping Cats, Bopping Heads, and Oreo Shakes" (arXiv 2111.02452, ACM
  2022): 400 labelled VIDEOS, viral vs not decided between creators.
  "Follower count proved most predictive"; shot scale, text presence and
  point of view also mattered. Between-creator, video, n=400 — exactly the
  follower confound the within-creator design here removes. Direction for
  "text presence" not usable from the abstract; full text not retrieved.

## 4. Thumbnail "research" from tools and blogs · weight ZERO

"Faces raise CTR 20-30% (VidIQ)", "eye contact +20%" — numbers with no
traceable method. Not used. A face/person hypothesis is tested on TikTok data
instead (H1, H2 in PLAN.md).

## Our own evidence so far

* Within one creator, posts spread ×25 (itsjustinjapan) and ×10
  (izzy_travels_) in plays between the 10th and 90th percentile — the room in
  which a post's own properties operate is large.
* Likes per impression correlates r = 0.44 with how far a post was pushed,
  consistent with TikTok's stated mechanism.
