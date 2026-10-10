# 04 — Hebrew voice: how Israeli creators actually write covers and captions

Written 10.10.2026. Goal: text we write must never read as AI or as a marketer.
Everything below is counted by script, not eyeballed, except where a line says
`[READ]` (I read all 720 travel covers by eye to find misspellings and pick
examples). Scripts and raw outputs: `04-voice-scripts/` next to this file.

## 0. Data, method, caveats

| set | n | what it is |
| --- | ---: | --- |
| coded covers | 1,117 | `harvest/he-search/coded/*.jsonl`, transcribed verbatim |
| creator covers | 905 | lang he/mixed, kind not `ad` |
| **travel covers** | **720** | the main set, 501 authors |
| top third | 240 | log(plays/followers) >= 3.72, 200 authors |
| bottom third | 240 | log(plays/followers) <= 1.72, 179 authors |
| ad covers | 136 | Hebrew/mixed `kind=ad` — used as the **marketer** contrast |
| captions | 720 | `hits.json` desc for the same travel posts |
| owner covers | 13 | his travel covers, `research/own-covers-transcribed.json` |
| owner captions | 26 | his 2026 posts in `own-full/items.json` (the 23 posts from the 2024 AI-image era excluded) |

Tests are Fisher exact on top vs bottom third; `p` is shown. Two sensitivity
checks run on every headline finding:
- **one account dominates the bottom**: `goneneliyahu` has 22 of the 240 bottom
  covers and 1 of the top. Re-run without him (230 vs 230).
- **the "designed" look** (Canva-style infographic) is 49 bottom covers vs 5 top.
  Re-run on the 644 non-designed covers only (214 vs 214).

Caveats that limit every number here:
- Search cross-section, so the sample favours winners; the score punishes big
  accounts (business pages with large followings fall to the bottom).
- The covers were transcribed from images by a model. Exotic punctuation (dash
  types, curly quotes) may have been normalised in transcription.
- ` / ` in the data is a **visual line on the image**. TikTok wraps the text box
  itself, so a line break is not necessarily the author's Enter.
- Correlation only. Nothing here proves a word causes reach.

## 1. Cover — the measured portrait

### 1.1 Length

| | travel | top | bottom | ads | owner |
| --- | ---: | ---: | ---: | ---: | ---: |
| words, median / mean | 7 / 9.9 | 7 / 8.6 | 7 / 11.8 | **30** / 38.1 | 8 / 7.9 |
| characters, median | 42 | 42 | 42 | 170 | 39 |
| lines, median / mean | 2 / 3.3 | 2 / 2.9 | 2 / 4.0 | **10** / 13.0 | — |

- Word distribution (travel): 1-3 words 93 · **4-6: 221** · **7-9: 203** · 10-12: 89 · 13-16: 56 · 17-25: 29 · 26+: 29.
- Line distribution: 1 line 113 · **2 lines 281** · 3 lines 164 · 4 lines 72 · 5-6: 53 · 7+: 37.
- **5+ lines: top 20 vs bottom 46 (p=0.001). 17+ words: 14 vs 28 (p=0.035).**
  The long ones are info-dumps (a whole itinerary typed on the cover).
- Ads are four times longer than creators. Length itself is a marketer tell.

### 1.2 Emoji

| | travel | top | bottom | p |
| --- | ---: | ---: | ---: | ---: |
| has any emoji | 391 (54%) | **158 (66%)** | 108 (45%) | <0.001 |
| 1-2 emoji | — | 112 | 78 | 0.002 |
| 3+ emoji | — | 46 | 30 | 0.060 |
| emoji at end of a line | — | 131 | 87 | <0.001 |
| an emoji-only line (a "row") | 76 (11%) | 37 | 21 | 0.035 |
| a flag | 158 (22%) | 58 | 51 | 0.51 |

The emoji finding survives both checks: without goneneliyahu 153 vs 103;
on non-designed covers 67% vs 49% (p<0.001); inside the native TikTok
outline style alone 100/140 vs 63/118.

**Position** of all 902 emoji in travel covers: **end of line 562 (62%)**,
**on its own line 282 (31%)**, start of line 56 (6%), **middle of a line 2**.
A row on its own line holds 1-8 emoji (commonest 3 and 5).

**Most common** (non-flag): ✨61 ✈️44 📍25 🤍21 ⬅️21 🌴19 🏝️18 ☀️15 🐠11 ❤️10 🥹9 🌸9 🩵8 🐚7 😍7 💕7 🤫7 🍸7 🌺7 🐬7 👙7.
Flags: 🇹🇭42 🇮🇹34 🇬🇷25 🇯🇵21 🇬🇧14 🇨🇾13.
**Ads use a different set**: ⭐40 ✈️23 🔥11 🏨7 💫5 💰4 💎3. Stars, fire, hotel
and diamond are the marketer's emoji; creators almost never use them.

### 1.3 Punctuation

| mark (cover has it) | travel | top | bottom | ads |
| --- | ---: | ---: | ---: | ---: |
| **none of ! ? . … : > at all** | **439 (61%)** | 63% | 59% | 15% |
| ! (any) | 104 (14%) | 36 | 35 | 48% |
| !! or more | 58 (8%) | 22 | 18 | 1% |
| !!! or more | 35 (5%) | 12 | 11 | 1% |
| ? | 99 (14%) | 36 | 30 | 15% |
| first line is a question | 60 | **27** | 14 (p=0.049) | |
| ?? or more | 12 | 2 | 4 | |
| ... / .. / … | 23 (3%) | 5 | 9 | 1% |
| <<< >>> > > > ascii arrows | 55 (8%) | 15 | 15 | 3% |
| arrow emoji ⬅️ 👈 👉 👇 → | 24 (3%) | 7 | 7 | 2% |
| **period at the end of a line** (not ...) | 19 (3%) | **3** | **13** (p=0.019) | 9% |
| comma | 44 (6%) | 15 | 15 | **69%** |
| colon | 38 (5%) | 14 | 13 | **41%** |
| spaced hyphen " - " | 38 (5%) | 7 | 13 | **33%** |
| en dash – | 3 | 1 | 1 | 10% |
| em dash — | 1 (as an arrow "—>>>") | 0 | 0 | 1% |
| semicolon | 1 | 0 | 1 | 0% |
| quotation pair | 11 (2%) | 4 | 5 | 3% |
| *asterisk emphasis* | 15 (2%) | 4 | 5 | 4% |
| space before ! or ? ("בדובאי !!!") | 22 | 7 | 7 | |
| stretched letter, 3+ (המלצותתתתת) | 14 (2%) | 4 | 6 | 1% |

When `!` is used, it is usually doubled: 58 of 104 covers with `!` have `!!`
or more; a single lone `!` appears in 47. Commas, colons and dashes are the
ads' punctuation (69% / 41% / 33%), not the creators' (6% / 5% / 5%).

### 1.4 Register — the vocabulary (derived from the data)

Top cover words (905 creator covers): המלצות 200 · את 149 · הכי 101 · לכם 90 ·
מה 67 · לא 63 · 5 61 · כל 55 · לפני 54 · שאתם 54 · לפספס 53 · דברים 50 ·
תשמרו 44 · 10 44 · טסים 41 · שאסור 40 · שוות 40 · ההמלצות 39 · שלי 38 ·
מקומות 38 · חלק 37 · בקרוב 34 · חייבים 29 · שמרו 28.
Top bigrams: שאסור לכם 26 · לכם לפספס 25 · הכי שוות 24 · תשמרו את 23 ·
שאתם חייבים 23 · את הסרטון 22 · כל מה 20 · את הפוסט 19 · ההמלצות הכי 17 ·
לדעת לפני 17 · מי שטס 13 · לטיול הבא 13 · אם אתם 12 · הבא שלכם 12.

| register word (travel covers) | covers | top | bottom | p |
| --- | ---: | ---: | ---: | ---: |
| המלצ* (המלצות/ממליצה) | 237 (33%) | **93** | 63 | 0.005 |
| הכי | 77 | 21 | 25 | 0.64 |
| שווה/שוות/שווים | 64 | 22 | 22 | 1.0 |
| לפספס | 50 | 21 | 11 | 0.10 |
| חייבים/חייבת | 36 | **18** | 6 | 0.019 |
| אסור | 35 | 16 | 7 | 0.085 |
| בקרוב | 32 | 16 | 9 | 0.22 |
| חלק N | 32 | 15 | 6 | 0.072 |
| חובה | 17 | 5 | 5 | 1.0 |
| בתור מישהי / אחרי N פעמים | 10 | 5 | 0 | 0.061 |
| אמיתי / כנה / מהלב (up to) | 12 | 8 | 2 | — |
| מטורף* | 10 | 2 | 3 | — |
| מושלם* | 8 | 2 | 3 | — |
| ביותר | 7 | **0** | 5 | 0.061 |
| 10/10 | 6 | 2 | 0 | — |
| ממש · פשוט · באמת · דחוף | 4 · 4 · 7 · 3 | | | |

**The slang I would have guessed is not there.** Across all 905 creator
covers: אחי 0 · תכלס 0 · קיצר 0 · בקטנה 0 · פצצה 0 · חיים שלי 0 · וואו 0.
The few regex hits are not slang when read: יאללה 1 (a personal non-travel
post), סוף 1 ("בלי סוף"), וואלה 3 (the news site and "ואלה" = "and these"),
אש 1 ("מופע אש", a fire show). Real but rare: בטירוף 5 (3 of them one deals
account), מלא = lots 6 ("מלאמלא המלצות לפריז").
In the 720 captions (regex hits, an upper bound): אחי 0 · תכלס 1 · קיצר 1 ·
וואלה 1 · אש 5 · וואו 15.
Israeli travel creators write in a plain, warm spoken register — "הכי שוות",
"שאסור לכם לפספס", "חייבים" — not in street slang.

### 1.5 Person and gender of address

| person (travel covers) | covers | top | bottom | p |
| --- | ---: | ---: | ---: | ---: |
| **2nd plural explicit: אתם / לכם / שאתם / שלכם** | 145 (20%) | **67 (28%)** | 35 (15%) | **0.001** |
| future-as-imperative: תשמרו / תטוסו / תעקבו | 89 (12%) | 30 | 29 | 1.0 |
| formal imperative: שמרו / קחו / דפדפו / בואו | 48 (7%) | 14 | 20 | 0.37 |
| implicit opener: טסים..? מגיעים..? מתכננים..? | 61 (8%) | 22 | 19 | 0.74 |
| first word is טסים/טסות/טסה | — | **19** | 6 | 0.012 |
| 1st singular (אני, שלי, הייתי, שאכלתי...) | 110 (15%) | 37 | 36 | 1.0 |
| 1st plural (אנחנו, שלנו, עשינו...) | 42 (6%) | 15 | 19 | 0.59 |
| 2nd **feminine singular** (את טסה, שאת צריכה, תני לי) | 10 (1.4%) | 7 | 1 | 0.068 |
| 2nd feminine plural (טסות, בשבילכן, בא לכן) | 5 (0.7%) | 1 | 4 | |
| 2nd **masculine singular** (אתה) | **0** | 0 | 0 | |
| no person at all | 352 (49%) | 108 | 119 | 0.36 |

The אתם finding holds without goneneliyahu (62 vs 37) and on non-designed
covers (28% vs 16%, p=0.007). Default address is **masculine plural אתם**;
feminine-only address is rare and lives with a few women-targeted accounts
(4 of the 10 are one creator's series "המלצות שאת צריכה לשמור"). **Nobody
writes אתה.** Imperatives: the spoken future form (תשמרו 44 uses) is more common
than the formal imperative (שמרו 28), but neither predicts reach.

### 1.6 Openers and closers (travel covers)

- First word: **המלצות 125** · טסים 31 · 5 21 · איך 18 · כל 17 · מה 17 · מקומות 15 · דברים 13 · אם 12 · ההמלצות 12 · כמה 11 · המלצה 11 · בואו 10.
- First two words: אם אתם 8 · המלצות לרומא 7 · המלצות שוות 7 · ההמלצות הכי 7 · כל מה 6 · 5 דברים 5 · המלון הכי 5 · המלצה למלון 5 · בואו איתי 5 · כמה עלה 5 · כל מי 5.
- Last word: לפספס 15 · 2 11 · לתאילנד 10 · לשמור 9 · הפוסט 8 · הזה 8 · לאילת 8 · שלכם 7 · שלי 7.
- Last two words: חלק 2 9 · את הפוסט 8 · צריכה לשמור 5 · הסרטון הזה 5 · לכם לפספס 5 · את הסרטון 5 · שאסור לפספס 5 · הבא שלכם 4.
- Words most over-represented in the top third (>=8 uses): חייבים 17:3 · שאסור 16:4 · מגיעים 8:2 · טסים 21:7 · אתם 11:4 · הסרטון 10:4 · שלכם 12:5 · לפספס 20:9.
- Most over-represented in the bottom: עם 2:17 · יום 2:11 · לחופשה 2:10 · איך 2:10 · ביפן 2:8 · שלנו 2:7 · חופשה 4:10 · מושלם 3:6.

### 1.7 Spelling, non-standard writing, English `[READ]` + counted

Real errors exist, each in 1-4 covers of 720, none linked to reach:
- בעייני (H0779) — the same creator spells it בעיניי on another cover (H0308)
- אותכם (H0712) · הינה for הנה (H0836, H0217) · סירטון (H0650, H1107; סרטון 27)
- להזהר (H0535) · שאתם מגיעים for כשאתם (4 covers; כשאתם 4) · מהממם, הארוחת בוקר (H0874)
- "הכי חול שיש" — חו"ל written as חול (H0860, the top-scored cover in the set); #חול is among the 11 most common hashtags (35 posts)
- ויאטנם / ויטנאם 10 covers vs וייטנאם 11 — no fixed spelling for foreign names
- digit glued to the prefix: ב5, מ100₪, ב400₪ — **17 covers**, vs hyphenated ב-45: 8
- price as ₪ (21 covers) or שח / ש"ח (32)
- abbreviations: ASCII " in 6 covers, Hebrew ״ in 7; geresh: ASCII ' 19, ׳ 17; curly ’ 0

Stretched letters: 14 covers (המלצותתתתת, פאפוסססס, לברצלונהההה, פראגגגג,
*מושלמיםםםם*) and 39 captions (שתטוסווווו, תהנווו, כיףףף).

English: 12% of covers have a Latin word, almost all names
(Trenitalia, THAILAND, Phuket, New York City) or `POV`/`pov`/`פוב` (11 covers).
Ads: 62%. No creator cover uses English marketing words (guide, ultimate, must).

## 2. Captions — the measured portrait

| caption (travel posts) | all | top | bottom | p | owner 2026 |
| --- | ---: | ---: | ---: | ---: | ---: |
| hashtags only, no prose | 18% | **25%** | 14% | 0.005 | **21/26** |
| prose 21+ words | 29% | 20% | **40%** | <0.001 | 3/26 |
| prose words, median | 8 | 6 | 11 | | 0 |
| hashtags, median | 5 | 5 | 5 | | 5 |
| emoji in prose | 65% | 57% | 70% | 0.004 | 1/26 |
| ! | 27% | 20% | 33% | 0.001 | |
| ? | 24% | 13% | 34% | <0.001 | |
| period | 22% | 16% | 31% | <0.001 | |
| comma | 29% | 23% | 37% | 0.001 | |
| save CTA | 19% | 16% | 27% | 0.005 | 1/26 |
| tag / send a friend | 10% | 7% | 16% | 0.001 | 0 |
| an English tag | 47% | 59% | 35% | <0.001 | 3/26 |
| #fyp / #foryou / #פוריו | 31% | 38% | 21% | <0.001 | 0 |
| **2+ AI tells (list in section 5)** | 15% | **9%** | **22%** | **0.0001** | |

The short-caption pattern is the opposite of what an English corpus showed
(`07-copy.md`: longer captions, more saves per like). Different metric (reach
here, saves/like there) and likely a confound: business pages write long
captions and have big followings, which the score punishes. Treat it as "long
written captions are not what the reach winners do", not as "prose hurts".

Most common hashtags: #המלצות 250 · #חופשה 135 · #פוריו 128 · #תאילנד 124 ·
#foryou 85 · #fyp 55 · #טיסה 52 · #טיול 44.
Caption emoji: ✈️129 ✨121 📍63 ❤️55 👇51 🌴41 🤍35.

Real top-third prose captions, verbatim (the register to copy):
- עד שהאשראי יתאושש #רומא #המלצות (H0487)
- אני כבר מתגעגעת😭😭😭😭😭 #fyp #פוריו #לונדון (H0028)
- מקנאה בכם שתטוסווווו😍🫶🏼✈️🌴 (H0921)
- תשמרו לכם אם מגיעים לבנגקוק (H0574)
- הכנתי לכם המלצות לפוקט+קראבי💘 מקווה שעזרתי! (H0909)
- לרנקה את אנדרייטד ברמות 🇨🇾📍🤌🏾 (H0451)
- שלחו לחברה שתמיד רצתה זנזיבר! (H0084)
- הירי זה המקום המושלם ושמישהו ישכנע אותי אחרת (H0361)

Bottom-third brochure captions, verbatim (the register to avoid; the first two
are goneneliyahu, the rest are four other accounts):
- תאילנד קוראת לכם, אבל מאיפה מתחילים? ... תאילנד היא הרבה יותר מעוד יעד – היא עולם שלם של חוויות שרק מחכות שתגלו אותן (H0162)
- יוון קוראת לכם! חולמים על חופשת הקיץ המושלמת? ריכזנו עבורכם את עשרת החופים היפים, המיוחדים והפוטוגניים ביותר (H0897)
- בואו להכיר את בודפשט דרך 4 גלגלים! בסיור עם נופים עוצרי נשימה (H0039)
- כל מי ששמע על הפיליפינים יודע שפלאוון היא לגמרי גולת הכותרת של המדינה! ובצדק! (H0305)
- ריכזנו לכם 7 רעיונות מקוריים לדייטים מחוץ לקופסה באילת – מכרמים ועד תצפיות שקיעה קסומות. (H0737)
- תשכחו מחנויות המזכרות היקרות של התיירים. אם אתם רוצים להביא הביתה מתנות אמיתיות, איכותיות ועם סיפור (H1031)

## 3. The owner's own voice (the one to match first)

**Covers** (13 travel covers off his grid, views):
- איך עוברים ממקום למקום בתאילנד? — 35.9K
- חד משמעית ההמלצות הכי שוות שיש בסבן אילבן בתאילנד - חלק א — 35.3K
- כמה עלה לנו חצי שנה במזרח? 10 מדינות!!! — 23.4K
- דירגתי את היעדים בתאילנד כדי שלא תבזבזו את הטיול שלכם — 23.1K
- 5 דברים שאסור לעשות בתאילנד — 21K
- אחרי 5 פעמים הנה המסלול המושלם לתאילנד — 19.6K
- כמה עלו לי 6 חודשים בדרום אמריקה? שמונה מדינות! — 17K
- in the corpus: כמה עלו לי 10 חודשים במזרח? / 12 מדינות!!! / 🇹🇭🇳🇵🇱🇦🇻🇳🇰🇭🇸🇬🇵🇭🇹🇼🇰🇷🇭🇰🇮🇳🇱🇰 (H0037) and איך לעבור ממקום למקום / בתאילנד? / 🛍️🏝️🌺🐠🌅😍 / תשמרו שלא תסתבכו! (H0615)

His shape: a spoken question or a first-person claim (לי / לנו / דירגתי /
אחרי 5 פעמים), a number, **no emoji inside the text but a row of emoji on its
own line** (8 of his 9 covers above 12K views have the row; 0 of the 4 below
2.5K do).

His 4 weakest travel covers are the only ones with parenthetical asides, the
formal "שמרו לאחר כך", "טופ 3", and a closing period:
- טופ 3 היעדים שהישראלים עוד לא יודעים עליהם בעולם (אל תהרסו את 1) — 2,391
- 3 היעדים שאסור לכם לפספס בתאילנד - שמרו לאחר כך! — 1,989
- אל תסגרו את הכרטיס לתאילנד. — 1,437
- טופ 3 היעדים הכי מפוצצים בישראלים בתאילנד (ככה חסכתי כסף) — 632

n=13 and confounded by date and topic, but it is the same direction as the corpus.

**Captions**: 21 of his 26 posts in 2026 are **hashtags only**, including his
three best (62.4K, 48K, 38K). 3-5 tags, mostly Hebrew (English tags on 3 of 26),
topic plus a season or trend tag (#סליחות #אלול #ראשהשנה #יוםכיפור #עדןבןזקן #אופקאדנק). Short prose when
present: "תעקבו לחלק 2🥰", "איזה כיף היה בתאילנדד" (his own stretched letter).
Three prose captions (186, 29 and 392 words) break that pattern. Two of them
open with the same formula, "אף אחד לא מספר לך שהחלק הכי ... זה בכלל לא ..., זה ...".
In the 720 corpus captions that formula does not appear; the nearest phrase
("שאף אחד לא יספר לכם") appears once. The 392-word one (Krabi, encyclopedic,
curly quotes ’ “ ”) got 2,007 views, among his lowest of the period.
I cannot tell who wrote them; a formula repeated across posts is itself a tell.

## 4. Style guide — 20 rules

Cover rules first, then captions. Each has data and verbatim examples
(code, plays / followers).

**1. One idea in 4-9 words, 2-3 visual lines.** Median 7 words, 2 lines.
5+ lines: 8% of top vs 19% of bottom (p=0.001).
- המלצות לאילת / 🌊🐬🍦👙🍉☀️🌴 (H0840, 229K / 580)
- מי ידע שפאפוס כזאת יפה (H0623, 282K / 551)
- טסים לאתונה בקרוב?? / זה בשבילכם<< (H0550, 152K / 145)

**2. Open with the topic word or the reader's situation.** המלצות is first
word in 125/720; טסים-first: 19 top vs 6 bottom (p=0.012).
- טסים לרומא? 🇮🇹 / תשמרו את הסרטון >> (H0815)
- מגיעים בקרוב לבנגקוק? / דאגתי לכם למקומות הכי שווים ומומלצים לביקור בעיר / תמשיכו לגלול> (H0176)

**3. Say אתם/לכם out loud.** 28% of top vs 15% of bottom (p=0.001), holds on
both checks. The winning bigrams: שאסור לכם (13:1), שאתם חייבים (13:2).
- מקומות שאסור לכם / לפספס בפראג🇨🇿 (H0286, 209K / 437)
- 7 דברים שאתם חייבים לעשות / בקו סמוי 🏝️ (H0805)
- זה המלון שאתם בטוח לא מכירים / וכן - זה בישראל !!! 😱 (H0700, 901K / 553)

**4. Masculine plural by default; never אתה; את only for a women's series.**
אתה: 0 covers. Feminine singular 10, feminine plural 5.
- בנגקוק / המלצות שאת צריכה לשמור (H0113, 143K / 1.3K) — a deliberate female series
- טסה לרודוס? 🇬🇷 / תני לי דקה לפני שאת אורזת בגדים לא נכונים (H0095)

**5. Use the real words: המלצות, הכי שוות, שאסור לפספס, חייבים, בקרוב, חלק 2.**
Over-represented in the top: חייבים x2.85 (p=0.019), המלצ* 39% vs 26%
(p=0.005), לפספס x1.9, אסור x2.2, חלק N x2.4.
- ההמלצות הכי שוות / לרומא✨ / (ולא רק מזרקת טרווי והפנתיאון) (H0648)
- דברים שחשוב לדעת לפני / שטסים לתאילנד🌺 / חלק 3 >>> (H0370, 502K / 3.1K)

**6. Do not add street slang.** אחי, יאללה, תכלס, קיצר, בקטנה, פצצה, חיים שלי:
0 of 905 covers each. Slang reads as an outsider doing an impression.
The warmth comes from כל מי שטס..., אם אתם..., הנה..., not from אחי.
- מכיוון שכל מדינת ישראל / נמצאת כרגע בתאילנד הנה כמה / המלצות שוות ממני אליכם (H0049, 147K / 1K)

**7. Superlative = הכי. Never ביותר.** הכי 77 covers; ביותר 7, 0 in top,
5 in bottom (6 of 7 from one infographic account). Captions: ביותר 1% top vs
5% bottom (p=0.012).
- the real voice: המלון הכי / מיוחד שהיית בו!! (H0986)
- the bottom voice: טיולי היום הטובים / ביותר מווינה 🇦🇹 (H0021)

**8. Emoji: 1-2 at the end of the line, or a row on its own line. Never in the
middle, rarely at the start.** Has emoji 66% top vs 45% bottom (p<0.001);
position: 62% end of line, 31% own line, 6% start, 0.2% middle.
- 5 טעויות שאסור לכם לעשות / לפני ההגעה לזנזיבר❌ (H0500)
- ריכזתי לכם את כל / ההמלצות לקוסמוי / ✈️🩵✨🌞🧃 (H0797, 127K / 481)
- owner: 🛍️🏝️🌺🐠🌅😍 on its own line (H0615)

**9. Emoji from the creators' set, not the ads' set.** Use ✨ ✈️ 📍 🤍 🌴 🏝️ ☀️ 🥹 + the
destination flag. Avoid ⭐ 🔥 🏨 💎 💫 (ads: ⭐40 🔥11 🏨7 vs creators ✨61 ✈️44).
✨ is **not** an AI tell here: it is the #1 creator emoji and appears in 8% of
top vs 4% of bottom covers.

**10. Default to no punctuation.** 61% of covers have no ! ? . … : > at all.
Commas (6%), colons (5%) and dashes (5%) are rare in creator covers but common
in ads (69% / 41% / 33%).
- המסלול שלי בדרום אמריקה (H0009, 147K / 106)
- למה שווה להגיע לבטומי? (H0261)

**11. Never end a line with a period.** 3 top vs 13 bottom (p=0.019). A full
stop reads like a notice.
- owner: אל תסגרו את הכרטיס לתאילנד. — 1,437 views, his third-lowest travel cover
- exception that works because it is a punchline: מאמינים שזה בארץ? כי / אנחנו לא. (H0667)

**12. If you exclaim, double it; spacing can be loose.** 58 of 104 covers with !
use !! or more. A space before !/? appears in 22 covers.
- כמה עלו לי 10 חודשים במזרח? / 12 מדינות!!! (H0037, owner)
- אם אתם מחפשים יעד זול !!! (H0880)

**13. A question works when it is the reader's own question.** First line is
a question: 27 top vs 14 bottom (p=0.049). Doubled ?? is fine.
- "מה עושים 5 ימים בפראג לא משעמם שם?" / לא!!!! (H0751, 641K / 959)
- איך עוברים ממקום למקום בתאילנד? (owner, 35.9K)

**14. Credentials in plain words, not titles.** בתור מישהי ש... / אחרי N פעמים /
ממישהי שהייתה שם: 5 top, 0 bottom (p=0.061).
- ✨המלצות לרומא✨ / ממישהי שהייתה שם 3 פעמים (H0408)
- ההמלצות שלי ללונדון בתור / מישהי שטיילה שם מעל חודש (H0028)
- owner: אחרי 5 פעמים הנה המסלול המושלם לתאילנד (19.6K)

**15. Honesty markers instead of adjectives.** אמיתי / כנה / מהלב: 8 top vs 2
bottom (small n). Asterisks are how they stress a word.
- אם אתם טסים לבודפשט בקרוב / הנה ההמלצות *הכנות* שלי 🇭🇺 (H0014)
- "מה יש לעשות בקו סמוי?" / תגובתי הכנה: (H0254)

**16. Break lines where the box runs out, not where the rhythm is pretty.**
Lines split mid-phrase all the time (68+ of 607 multi-line covers end a line on a
function word). Do not build balanced, parallel lines.
- 5 דברים שאסור / לעשות בתאילנד / תשמרו אם אתם / טסים בקרוב (H0515, 637K / 2K)
- כמה דברים שאסור לכם / לפספס בניו יורק (H0085)

**17. Write the way a phone types, but do not plant errors.** Digits glued to
the prefix (ב5, מ100₪: 17 vs 8 hyphenated), ₪ or שח, ASCII " in חו"ל,
English only for names and POV. Real misspellings exist (בעייני, אותכם, הינה)
at 1-4 covers each with no link to reach. On a brand account a deliberate error
reads as sloppy.

**18. Captions: short, or tags only.** Hashtags only: 25% top vs 14% bottom
(p=0.005); 21+ words 20% vs 40% (p<0.001). The owner's three best 2026 posts
are tags only. If you write prose, one human line:
- עד שהאשראי יתאושש (H0487)
- מקנאה בכם שתטוסווווו😍🫶🏼✈️🌴 (H0921)
- owner: תעקבו לחלק 2🥰 · איזה כיף היה בתאילנדד

**19. Captions: no brochure sentences.** 2+ AI tells: 9% top vs 22% bottom
(p=0.0001). Bottom captions are written prose: more ! (33 vs 20%), ? (34 vs 13%),
periods (31 vs 16%), commas (37 vs 23%).
No "X קוראת לכם", "ריכזנו עבורכם", "מחכים לכם", "בין אם... ובין אם",
no triplets ("חופים, אוכל טוב וחוויות").

**20. Ask for the save in the spoken form, with a reason; no tag-a-friend.**
On covers save CTAs do not separate top from bottom (12% vs 14%); in captions
they lean bottom (16% vs 27%), as does tag/send a friend (7% vs 16%, p=0.001).
When you ask, use the spoken form and give a reason:
- owner: תשמרו שלא תסתבכו! (H0615)
- המלצות לאתונה / ההמלצות הכי אמיתיות וכנות !!!!!! / לשמור לפני שהולכים (H0006)
Not: "שמרו את הפוסט" as a standalone footer. That is goneneliyahu's sign-off on
his infographics, most of which sit in the bottom third (H0360, H0548, H0774).

## 5. AI tells — checked against the data

Covers = 905 creator covers (travel + other), split top/bottom where travel.
Captions = 720 travel captions. Ads = 136.

| tell | covers (top / bottom) | captions (top / bottom) | ads | verdict |
| --- | --- | --- | --- | --- |
| em dash — | 2 (both used as an arrow "—>>>", "——<<<"); 0 as a sentence dash | 11 (4 / 4) | 1% | **never as punctuation** |
| en dash – | 5 (1 / 1) | 66 (21 / 27), mostly in pasted lists | 10% | never on a cover |
| spaced hyphen " - " | 38 (7 / 13) | 50 (11 / 24, p=0.034) | 33% | allowed as a joiner ("לרנקה - איה נאפה"), not as a pause |
| period at end of line | 19 (3 / 13, p=0.019) | 159 (38 / 75, p<0.001) | 9% | **never on a cover** |
| comma lists of 3+ | 8 (1 / 2) | — | 15% | never |
| triplet "X, Y ו-Z" | 3 (0 / 2) | 105 (21 / 49, p<0.001) | 11% | **never** |
| semicolon | 1 | 2 | 0% | never |
| "מדריך מקיף / המלא / אולטימטיבי" | 1 ("המדריך המלא❤️" as a last line) | 5 (0 / 4) | 0% | never |
| מדריך, any | 16 (3 / 8) | 22 (**1 / 16**, p<0.001) | 2% | avoid; real creators say המלצות |
| גלו (imperative) | 1 (an infographic list) | 0 | 0% | never |
| אל תחמיצו | **0** | 1 (bottom) | 0% | never; real form is "שאסור לכם לפספס" / "אל תפספסו" |
| חוויה בלתי נשכחת / בלתי נשכח | 1 (an agency, bottom) | 8 (0 / 5) | 4% | never |
| חוויה / חוויות | 7 (1 / 5) | 50 (11 / 24, p=0.034) | 10% | avoid |
| פנינה נסתרת / חבויה | 4 (0 / 3) | 2 | 0% | never |
| עוצר נשימה | 2 (0 / 2) | 16 (5 / 8) | 2% | never |
| גן עדן | 3 (0 / 3, one account) | 18 (4 / 7) | 0% | avoid |
| קסום / קסם | 2 | 33 (6 / 16, p=0.047) | 2% | avoid |
| מרהיב | 2 (0 / 2) | 19 (2 / 12, p=0.012) | 1% | never |
| ייחודי · אותנטי · הרפתקה · מסע | 1 · 2 · 1 · 1, all bottom or non-travel | 6 · 10 · 4 · 5 | | never |
| ביותר | 7 (**0** / 5) | 20 (2 / 12, p=0.012) | 1% | **never; say הכי** |
| ניתן · עבור · הינו · על מנת · כמו כן | 2 · 2 · 2 (both הינה for הנה) · 0 · 2 (בנוסף) | 8 · 2 · 1 · 0 · 6 | 3% · 1% | never |
| עבורכם ("ריכזנו עבורכם") | — | 17 (1 / 11) | | never; real form is "ריכזתי לכם" |
| "לא רק... אלא גם" | 1 (non-travel) | 8 (0 / 5) | 0% | never |
| "בין אם... ובין אם" | **0** | 11 (**0 / 9**, p=0.004, 2 authors) | 0% | **never** |
| "X קוראת לכם" | 0 | 3 (0 / 3, one account) | | never |
| "מחכים לכם" | 0 | 12 (0 / 6) | | never |
| "הסוד ... נחשף" | 0 | 10 (5 / 2) | | not discriminative, but it is clickbait copy |
| curly quotes “ ” ’ inside Hebrew | 10 (mostly non-travel) | 22 (9 / 5) | 2% | phone keyboards type " ' ״ ׳; curly = pasted |
| numbered 1. 2. 3. lists / keycap 1️⃣ | infographic covers only | numbered 10 (3 / 5), keycap 5 (1 / 3) | | not on the cover; slides carry lists |
| colon header ending a line ("...שלהם:") | 37 (8 / 12) | 6 | 12% | **allowed** — creators use it as a teaser ("תגובתי הכנה:") |
| ✨ | 48 travel (20 / 10) | 88 (20 / 32) | 2% | **not a tell** — #1 creator emoji; avoid only the ✨X✨ wrap on every line |
| formal imperative chains (הזמינו... התעלמו... בקרו... טעמו... גלו...) | 1 account (H1042) | — | 10% | never chain; one תשמרו is enough |
| a formula reused across posts | — | "אף אחד לא מספר לך ש..." 1 in corpus, 2 in owner's captions | | never reuse an opener verbatim |
| street slang (אחי, יאללה, תכלס) | 0 | 0-1 | | not an AI tell, a fake-native tell; never |

**The composite.** A cover with any of the hard AI tells (ביותר, פנינה, גן עדן,
מרהיב, עוצר נשימה, חוויה, אותנטי, ייחודי, הרפתקה, בלתי נשכח, גלו, חשוב לציין,
triplet, en/em dash, line-final period, ניתן/עבור, comma list, semicolon, curly
quotes): **top 7/240 vs bottom 28/240 (p=0.0003)**; without goneneliyahu 6 vs 18
(p=0.019); on non-designed covers only 5 vs 12 (p=0.135). Read: the AI register
travels **together with the infographic look**, and the pair sits at the
bottom. Separately: 14 of the 47 AI-tell travel covers are one account.
Ads carry it in 51/136 (38%).

## 6. What this does not tell us

- Reach, not sales or saves. A cover that matches the voice can still be a bad
  hook; this file is about **not sounding fake**, `02-hook.md` is about stopping
  the scroll.
- The top/bottom split is by plays per follower. Business accounts are bottom-
  heavy by construction, and they write longer, more formal copy. Part of every
  "formal = bottom" finding is "business account = bottom".
- Feminine address, honesty markers and credentials ("בתור מישהי") are based on
  5-10 covers each.
- Captions from the corpus were not checked for who wrote them. Some are
  visibly templated: one account (unseen.il) posts the same "נחל X הוא אחד
  הנחלים היפים והפחות מוכרים ב... זהו מקום מושלם למי שמחפש שקט, טבע ונופים
  עוצרי נשימה" text for two different streams (H0318, H0667).
