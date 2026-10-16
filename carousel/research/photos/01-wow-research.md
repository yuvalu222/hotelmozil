# 01 - What makes a travel photo a WOW, and how to rank thousands of them

Researched 16.10.2026. Every claim carries a URL, a verbatim quote and a grade:

- **A** = controlled experiment, or a measured benchmark against human ratings
- **B** = large observational study (tens of thousands of items or more)
- **C** = small study, or our own internal corpus
- **D** = opinion, theory, practitioner guidance, or a platform executive's remark

Quotes are copied from the primary source. Where only a secondary source was
reachable, that is said. Where no evidence was found, that is said too, and the
claim is labelled as inference.

---

## 0. The bottom line in eight sentences

1. **Content beats colour statistics.** On 2.3M Flickr images, mean saturation
   correlated with popularity at only 0.05; deep features and detected objects
   predict 2-3x better than colour histograms. A picker that ranks pixel stats
   is ranking the weakest signal there is. (Khosla, B)
2. **Water, coast and mountains are the strongest scene-level beauty cues**;
   construction, parking, highways and flat grass are the strongest negatives;
   "no horizon" is a negative. (White A; Seresinhe B)
3. **Professional quality pays on every platform tested**; faces are
   platform-dependent and, for a vacation scene, a stranger's visible face can
   *lower* how much viewers like the place. (Li and Xie B; JCR 2023 A; Li and Wan 2025 A)
4. **Warmth, exposure and contrast** are the edits that raise engagement;
   brightness and saturation help, but oversaturation is a recognised fault.
   (Bakhshi B; Yu 2020 B; Commons D)
5. **Awe = vastness + something the mind has to stretch to take in.** That is a
   theory (D), but its "small self" mechanism is experimentally confirmed (A).
6. **No primary data exists on sunsets, drones or turquoise water as TikTok
   carousel covers specifically.** Everything in section 3 for those is a proxy
   or an inference, and is labelled so.
7. **Best offline scorer that a business may legally use:** OpenAI CLIP ViT-L/14
   (MIT) + the LAION aesthetic head (Apache-2.0), which is mathematically a
   single 768-number dot product, plus a CLIP prompt content score and a
   technical-sharpness check at the real crop. pyiqa is **non-commercial**.
8. **The exact LAION weights URL** (verified 200 OK, 3,714,759 bytes,
   SHA-256 `21dd590f3ccdc646f0d53120778b296013b096a035a2718c9cb0d511bff0f1e0`):
   `https://github.com/christophschuhmann/improved-aesthetic-predictor/raw/main/sac+logos+ava1-l14-linearMSE.pth`

---

## 1. The science of beauty and awe in landscape and travel images

### 1.1 What generic image popularity research found

**Khosla, Das Sarma, Hamid - "What makes an image popular?" (WWW 2014)** - grade **B**
URL: https://people.csail.mit.edu/khosla/papers/www2014_khosla.pdf

- Scale and ceiling: "Using a dataset of about 2.3 million images from Flickr,
  we demonstrate that we can reliably predict the normalized view count of
  images with a rank correlation of 0.81 using both image content and social
  cues."
- **Simple colour statistics barely matter:** "We find that most simple
  features have very little correlation with popularity, with mean saturation
  having the largest absolute value of 0.05."
- Hue direction: "bluish colors tend to have lower importance as compared to
  more reddish colors. This might occur because images containing more striking
  colors tend to catch the eye of the observer leading to a higher number of
  views."
- Image content alone, Table 1 (rank correlation, one-per-user / user-mix /
  user-specific): color histogram 0.12 / 0.15 / 0.23; gradient 0.26 / 0.32 /
  0.34; deep learning 0.28 / 0.33 / 0.26; objects 0.23 / 0.30 / 0.33; combined
  0.31 / 0.36 / 0.40.
- Scenes in the data: "some of the most common objects present in images are:
  seashore, lakeside, sandbar, valley, volcano."
- Caveat for us: the "strong positive" object list ("miniskirt, maillot,
  bikini, cup, brassiere, perfume, revolver") is Flickr view-count behaviour,
  not beauty.

**Implication:** ranking by saturation or colour histograms is ranking by the
weakest family of features measured. Rank by learned content/aesthetic
features, and use colour only as a minor tie-breaker. This directly explains
the earlier failure in which a colour-ranked picker preferred saturated
rooftops over a sunset.

**Li and Xie - "Is a Picture Worth a Thousand Words?" (Journal of Marketing Research 2020)** - grade **B**
URL: https://doi.org/10.1177/0022243719881113 (abstract via Crossref)

- "They also find that high-quality and professionally shot pictures
  consistently lead to higher engagement on both platforms for both product
  categories. However, the effect of colorfulness varies by product category,
  while the presence of human face and image-text fit can induce higher user
  engagement on Twitter but not on Instagram."

**Bakhshi, Shamma, Kennedy, Gilbert - "Why We Filter Our Photos and How It Impacts Engagement" (ICWSM 2015)** - grade **B** (7.6M Flickr photos)
URL: https://ojs.aaai.org/index.php/ICWSM/article/view/14622

- "We also find that filtered photos are 21% more likely to be viewed and 45%
  more likely to be commented on by consumers of photographs. Specifically,
  filters that increase warmth, exposure and contrast boost engagement the
  most."

**Bakhshi, Shamma, Gilbert - "Faces engage us" (CHI 2014)** - grade **B**
URL: https://www.news.gatech.edu/news/2014/03/20/face-it-instagram-pictures-faces-are-more-popular (university press release; the paper is the primary)

- "Pictures with human faces are 38 percent more likely to receive likes than
  photos with no faces. They're also 32 percent more likely to attract
  comments." Sample: "1.1 million photos on Instagram."
- Conflicts with Li and Xie (no face effect on Instagram) and with the
  travel-specific experiments in 3.2. For **destination** photos, the newer
  travel-specific evidence wins.

**Bakhshi and Gilbert - "Red, Purple and Pink: The Colors of Diffusion on Pinterest" (PLOS ONE 2015)** - grade **B** (1M images)
URL: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0117148

- "Specifically, Red, Purple and pink seem to promote diffusion, while Green,
  Blue, Black and Yellow suppress it."
- This contradicts the tourism finding below on blue. The resolution is that
  colour effects depend on content. Blue helps **nature** scenes; warm and pink
  hues help generally. A sunset over the sea carries both.

### 1.2 Travel- and tourism-specific image studies

**Yu, Xie et al. - "Coloring the destination: The role of color psychology on Instagram" (Tourism Management 80, 2020, 104110)** - grade **B** (sample size not checked)
URL: https://research.modul.ac.at/en/publications/coloring-the-destination-the-role-of-color-psychology-on-instagra/
(The listed authors begin "Joanne Yu, Selina Yuqing Xie, Jun...". The page truncates the rest.)

- "Generally, individuals appeared more likely to respond to brighter and more
  saturated destination pictures. Orange, yellow, blue, and violet contributed
  significantly to post popularity based on different photographic typologies."
- Note: our `00-THE-SPEC.md` states "saturation is the single most critical
  attribute". The abstract supports "brighter and more saturated" but not
  "single most critical". That stronger wording is not visible in the
  abstract, so treat it as unverified until the full text is checked. Khosla's
  0.05 shows that saturation alone ranks poorly.

**Yu and Egger - "Color and engagement in touristic Instagram pictures: A machine learning approach" (Annals of Tourism Research 89, 2021)** - grade **B** (N not checked)
URL: https://ideas.repec.org/a/eee/anture/v89y2021ics0160738321000761.html

- "The findings show that the presence of the color blue in photos featuring
  natural scenery, high-end gastronomy, and sacral architectures contributes to
  user engagement. A red/orange color scheme enhances pictures regarding local
  delicacies and ambience, while the coexistence of violet and warm colors is
  crucial for photographs featuring cityscapes and interior design."

**Zhang, Lee, Singh, Srinivasan - "What Makes a Good Image? Airbnb Demand Analytics" (Management Science 2022)** - grade **B** (difference-in-differences, 7,423 properties)
URL: https://doi.org/10.1287/mnsc.2021.4175 (abstract read at https://academicnewsletter.sufe.edu.cn/info/389933)

- "we find that properties with verified images had 8.98% higher occupancy than
  properties without verified images (images taken by the host). To explore
  what constitutes a good image for an Airbnb property, we quantify 12
  human-interpretable image attributes that pertain to three artistic
  aspects-composition, color, and the figure-ground relationship".
- Use: professional craft (composition, colour, a clear subject against its
  ground) has a measured commercial value in hospitality.

**Dunkel et al. - "From sunrise to sunset" (PLOS ONE 2023)** - grade **B**, but it measures **what people photograph**, not engagement
URL: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0280423

- "The first contains 3,310,400 Flickr posts for sunset-sunrise reactions
  between 2007 to 2018 and includes about 2.9 times more sunset (2,545,460) than
  sunrise (881,320) images."
- "the prevalence of coastal locations from where sunset and sunrise can be
  viewed on a distant horizon, and mountainous locations, speaks to such"
  [visual-quality explanations].
- Use: sunset over a sea horizon is the single most photographed "ephemeral
  landscape event". That shows strong collective preference, but it is not proof
  of more likes.

### 1.3 Landscape aesthetics and environmental psychology

**Seresinhe, Preis, Moat - "Using deep learning to quantify the beauty of outdoor places" (Royal Society Open Science 2017)** - grade **B** (217,000 images, 1.5M+ ratings)
URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC5541537

- "We discover that, as well as natural features such as 'Coast', 'Mountain'
  and 'Canal Natural', man-made structures such as 'Tower', 'Castle' and
  'Viaduct' lead to places being considered more scenic. Importantly, while
  scenes containing 'Trees' tend to rate highly, places containing more bland
  natural green features such as 'Grass' and 'Athletic Fields' are considered
  less scenic."
- "Man-made features such as 'Construction Site', 'Industrial Area',
  'Hospital', 'Parking Lot' and 'Highway' are most associated with lower
  scenicness in both models."
- Prospect-refuge: "'No Horizon' and 'Open Area' are both negatively
  associated with scenicness in our model containing all images" ... "In line
  with Appleton's prospect-refuge theory".
- Machine agreement: "The Scenic CNN trained using the VGG16 CNN architecture
  delivers the best performance for all images, achieving a performance score
  of 0.658 for all images ... measured again using Kendall's rank correlation."

**White et al. - "Blue space" (Journal of Environmental Psychology 30(4), 2010)** - grade **A** (120 standardised photographs, two rating studies)
URL: https://researchportal.plymouth.ac.uk/en/publications/blue-space-the-importance-of-water-for-preference-affect-and-rest/

- "As predicted, both natural and built scenes containing water were associated
  with higher preferences, greater positive affect and higher perceived
  restorativeness than those without water. Effect sizes were consistently
  large." The preference measures included "willingness to pay for a hotel room
  with the view".

**Palmer and Schloss - "An ecological valence theory of human color preference" (PNAS 2010)** - grade **A**
URL: https://palmerlab.berkeley.edu/pdf/Palmer%26Schloss%282010%29.pdf

- "People like colors strongly associated with objects they like (e.g., blues
  with clear skies and clean water) and dislike colors strongly associated with
  objects they dislike (e.g., browns with feces and rotten food)."
- Use: clear blue sky and clean blue-turquoise water are liked colours *because
  of what they signal*. Murky green-brown water is penalised for the same
  reason.

**Fractal complexity - Spehar, Clifford, Newell, Taylor (2003), as summarised in Street et al., Frontiers in Human Neuroscience 2016** - grade **A** (experiments; quote via review)
URL: https://pmc.ncbi.nlm.nih.gov/articles/PMC4877522

- "Humans are consistent in their low preference for patterns with dimensions
  between (1.1-1.2) and (1.6-1.9), preferring fractal images in the 1.3-1.5 FD
  range. This effect is constant regardless of whether these fractals were
  generated by mathematics ..., artists or natural processes."
- The same paper's title flags "Individual Differences", so this is a
  population tendency. Use: **intermediate natural complexity**. Coastline,
  karst, clouds and foliage qualify. Empty grey skies are too simple and a
  cluttered market street is too complex.

**Hasler and Susstrunk - "Measuring Colourfulness in Natural Images" (SPIE 2003)** - grade **C** (small psychophysical scaling)
URL: https://infoscience.epfl.ch/record/33994

- "We set up a psychophysical category scaling experiment, and ask people to
  rate images using 7 categories of colourfulness. We then fit a metric to the
  results, and obtain a correlation of over 90% with the experimental data."
- This metric is already in `lib/colourfulness.js`. It measures *perceived
  colourfulness*, not beauty, so keep it as a minor feature.

### 1.4 Awe and the sublime

**Keltner and Haidt - "Approaching awe" (Cognition and Emotion 2003)** - grade **D** (theory and review)
URL: https://pubmed.ncbi.nlm.nih.gov/29715721/

- "We suggest that two appraisals are central and are present in all clear
  cases of awe: perceived vastness, and a need for accommodation, defined as an
  inability to assimilate an experience into current mental structures. Five
  additional appraisals account for variation in the hedonic tone of awe
  experiences: threat, beauty, exceptional ability, virtue, and the
  supernatural."

**Piff et al. - "Awe, the small self, and prosocial behavior" (JPSP 2015)** - grade **A** (5 studies, N = 2,078)
URL: https://pubmed.ncbi.nlm.nih.gov/25984788/

- "Awe is an emotional response to perceptually vast stimuli that transcend
  current frames of reference." ... "Mediational data demonstrate that the
  effects of awe on prosociality are explained, in part, by feelings of a small
  self."

**Translation into pixels (inference, not tested on photos):** awe needs
*perceived* vastness, meaning scale the viewer can read. That comes from a
known-size reference such as a tiny person, a longtail boat or a hut against a
huge cliff or sea, from depth (foreground, then midground, then a far horizon),
and from something unusual such as karst towers out of turquoise water. The
"accommodation" part is the "how is that real?" reaction.

---

## 2. Computational aesthetic models - accuracy, CPU cost, licence

### 2.1 Agreement with humans on AVA (aesthetics, ~250K photographer-rated photos)

Independent re-benchmark, same protocol for all models (pyiqa, official AVA test split):
URL: https://raw.githubusercontent.com/chaofengc/IQA-PyTorch/main/tests/IAA_benchmark_results.csv - grade **A** (measured benchmark)

| Model (pyiqa name) | AVA PLCC / SRCC / KRCC |
|---|---|
| `qalign` (7B LMM) | 0.8192 / 0.8223 / 0.6307 |
| `topiq_iaa` | 0.7902 / 0.791 / 0.5969 |
| `topiq_iaa_res50` | 0.737 / 0.7359 / 0.5423 |
| `nima` (InceptionResNetV2, retrained) | 0.7172 / 0.7126 / 0.5213 |
| `laion_aes` (official LAION weights) | 0.666 / 0.6653 / 0.4788 |
| `nima-vgg16-ava` | 0.6624 / 0.657 / 0.4719 |
| `clipiqa` (zero-shot quality prompts) | 0.3576 / 0.3383 / 0.2301 |

Numbers reported by the papers themselves (SRCC / PLCC on AVA):

- **MUSIQ** (ICCV 2021), Table 4: "MUSIQ (Ours) 0.815 0.242 0.726 0.738"
  (accuracy, MSE, SRCC, PLCC). https://arxiv.org/pdf/2108.05997 - **A**
- **Q-Align** (ICML 2024), Table 6: "Q-ALIGN (Ours) 236K (92%) 0.822 0.817";
  "Aesthetic Predictor (2023) 236K (92%) 0.721 0.723" (LAION head retrained on
  AVA train); "NIMA (TIP 2018) 0.612 0.636"; "MUSIQ (ICCV 2021) 0.726 0.738".
  https://arxiv.org/pdf/2312.17090 - **A**
- **CLIP zero-shot prompts** (Hentschel, Kobs, Hotho, "CLIP knows image
  aesthetics", Frontiers in AI 2022), table: "Fixed prompt CLIP 0.725 0.435
  0.453 Context-aware prompt CLIP 0.737 0.539 0.554 Ensembling prompt CLIP 0.756
  0.539 0.554 ... Linear probing CLIP 0.800 0.683 0.694 ... Fine-tuned CLIP
  0.816 0.731 0.741" (accuracy, SRCC, PLCC).
  https://pmc.ncbi.nlm.nih.gov/articles/PMC9732445 - **A**

**Reading the numbers.**
- Prompts like "a breathtaking photo" are *weak aesthetic judges*: zero-shot
  SRCC is 0.44-0.54, against 0.67-0.73 for a trained head on the same CLIP
  features. Use prompts for **content** ("is this a sunset over the sea?"),
  not for "how beautiful".
- The ceiling is limited by the humans themselves. AVA voters disagree, so
  SRCC around 0.7-0.8 is close to the practical maximum. 0.67 is good.
- AVA is a *photographers' challenge site* with generic subjects, not travel
  and not TikTok. No model here was trained on "stops a scroll". Section 4
  explains how to calibrate to the owner's own taste.

### 2.2 CPU cost

pyiqa efficiency benchmark, seconds per 1080x800 image on CPU (Xeon E-6150 / M1 Pro):
URL: https://raw.githubusercontent.com/chaofengc/IQA-PyTorch/main/tests/Efficiency_benchmark.csv - grade **A** (measurement)

| Model | CPU Xeon | CPU M1 Pro | Note |
|---|---|---|---|
| `laion_aes` | 0.456 | 0.249 | CLIP ViT-L/14 forward pass dominates |
| `topiq_iaa` | 0.425 | 0.310 | |
| `musiq` / `musiq-ava` | 0.607 / 0.602 | 0.732 / 0.708 | |
| `nima` | 0.166 | 0.152 | |
| `clipiqa+` | 0.858 | 0.547 | |
| `qalign` | not measured on CPU | - | needs 15.4 GB GPU memory per the same table: **not CPU-feasible** |

So 3,000 candidates cost about 20-25 minutes for the CLIP pass on an 8-core
machine. The CLIP embedding is computed once and reused by the aesthetic head,
by every content prompt, and for de-duplication.

### 2.3 Licences - this decides the stack

- **pyiqa (IQA-PyTorch): "PolyForm Noncommercial License 1.0.0"**, plus the
  NTU S-Lab licence for some components.
  https://github.com/chaofengc/IQA-PyTorch/blob/main/LICENSE.
  HotelMozil is a business and the carousels market it. **Do not use pyiqa or
  its bundled weights (TOPIQ, retrained NIMA) in the production picker.** It is
  fine for a private one-off benchmark at most.
- **LAION improved-aesthetic-predictor: Apache-2.0.**
  https://github.com/christophschuhmann/improved-aesthetic-predictor
- **OpenAI CLIP: MIT License** (https://github.com/openai/CLIP). Its model card
  adds a non-binding caution: "**Any** deployed use case of the model - whether
  commercial or not - is currently out of scope."
  (https://github.com/openai/CLIP/blob/main/model-card.md). That is a
  recommendation, not a licence term. Our use, an internal offline ranking
  that a human checks, is low-risk.
- **MUSIQ (google-research): Apache-2.0 code**, checkpoints `ava_ckpt.npz`,
  `koniq_ckpt.npz`, `spaq_ckpt.npz` on gs://gresearch/musiq.
  https://github.com/google-research/google-research/tree/master/musiq. TF/JAX
  only, so it is heavier to set up on Windows.
- **Aesthetic Predictor V2.5 (SigLIP): AGPL-3.0**, `pip install
  aesthetic-predictor-v2-5`; "Unlike V2, 5.5+ is considered to be a great
  aesthetic score." https://github.com/discus0434/aesthetic-predictor-v2-5.
  No AVA benchmark was published, and AGPL is viral. Skip it.

### 2.4 The LAION predictor, verified in detail

- Repo README: "an aesthetic score predictor ( how much people like on average
  an image ) based on a simple neural net that takes CLIP embeddings as inputs."
- Training data (LAION blog, https://laion.ai/blog/laion-aesthetics/): ratings
  for "How much do you like this image on a scale from 1 to 10?". Sources:
  "SAC dataset ... grown in the meanwhile to 176000 image - rating pairs",
  "LAION-Logos, a dataset of 15.000 logo image-text pairs", and AVA. **SAC is
  AI-generated art.** Expect a bias toward glossy, painterly, HDR-ish looks,
  which is why the stack below caps oversaturation and checks real sharpness.
- Thresholds as LAION used them on 2.37B web images: "600M image-text pairs
  with predicted aesthetics scores of 5 or higher", "12M ... 6 or higher", "3M
  ... 6.25 or higher", "625K ... 6.5 or higher". So **6.0+ is roughly the top
  0.5% of the web, and 6.5+ roughly the top 0.03%.** For curated stock photos,
  6.0-6.5 should be common; rank relatively, not by fixed cut-offs.
- **Verified by parsing the weight file (16.10):** layers 0, 2, 4, 6 and 7 are
  `Linear` (768 to 1024 to 128 to 64 to 16 to 1). Layers 1, 3 and 5 are Dropout,
  and there is no activation. The LAION blog confirms: "a simple linear model on
  the top of CLIP ViT/14 produced in our subjective view the visually most
  appealing results". **The whole head therefore collapses to `score = w . x +
  5.2366`** with `w` of length 768 (L2 norm 18.0), where `x` is the
  L2-normalised CLIP ViT-L/14 image embedding. No torch is needed at inference
  if `w` is exported once; see the snippet in 4.4.
- Input: CLIP resizes the shortest side to 224 and **center-crops 224x224**
  (`preprocessor_config.json`: `"shortest_edge": 224`, `"do_center_crop":
  true`, mean `[0.48145466, 0.4578275, 0.40821073]`, std `[0.26862954,
  0.26130258, 0.27577711]`, bicubic). Two consequences:
  1. **Score the crop you will publish.** Crop to 9:16 or 4:5 first, then
     score. Otherwise the model judges a square from the middle of a landscape
     frame.
  2. At 224px the model is **blind to blur, noise and compression** that show
     at 1080px. A separate technical check is required.
- The official `simple_inference.py` hard-codes `model.to("cuda")` and
  `torch.cuda.FloatTensor`. On CPU, change both to CPU types or use the collapsed
  dot product.

### 2.5 Local environment finding

On this PC, `import torch` (2.14.1+cpu) fails with `OSError: [WinError 1114]
... c10.dll`. `System32` has `vcruntime140.dll` and `msvcp140.dll` but no
plain `vcruntime140_1.dll`. The usual fix is to install the current Microsoft
Visual C++ 2015-2022 x64 Redistributable. That diagnosis is likely but not
verified. **A torch-free route works today:** `pip install onnxruntime` plus
the ONNX export `Xenova/clip-vit-large-patch14`, file `onnx/vision_model.onnx`
(1,216 MB fp32; `vision_model_fp16.onnx` 609 MB; `vision_model_quantized.onnx`
307 MB), on https://huggingface.co/Xenova/clip-vit-large-patch14. Use fp32 or
fp16 for the aesthetic head, because the linear head was fit on fp32 OpenAI
embeddings. If you try a quantized file, check that its scores correlate above
0.98 with fp32 on 50 images before trusting it. Confirm that the output named
`image_embeds` is 768-dimensional.

---

## 3. What works on a TikTok or Instagram carousel cover

### 3.1 Format data

- **Fanpage Karma** (industry, about 700,000 posts, 1 Jan - 31 May 2025) - grade
  **B, industry with an unpublished method**.
  https://www.fanpagekarma.com/insights/carousel-vs-video-performance-tiktok-instagram/.
  TikTok: carousels had "3% higher" reach, "81% more engagement", "almost 82%
  more likes than video posts", and shares "around a third lower than for
  classic videos". Instagram: "Carousels achieved a 13% higher reach than
  Reels".
- **Socialinsider** (15M Instagram posts, 417,130 pages, Oct 2025 - Mar 2026) -
  grade **B, industry**.
  https://www.socialinsider.io/social-media-benchmarks/instagram-engagement-report.
  Save rate: carousels 0.05% against Reels 0.04% and images 0.02%.
- **Instagram second chance** - grade **D** (executive remark, secondary
  source). Adam Mosseri, as reported 18.10.2024: "if someone sees a carousel but
  doesn't swipe, it can show up again, showing the second slide."
  https://routenote.com/blog/instagram-carousels-perform-better-than-single-photos-according-to-the-head-of-instagram/.
  **Implication:** on Instagram, slide 2 is a second cover and needs a WOW
  image too.
- **Our own corpus** (`research/05-cover-and-frames.md`, 524 covers, all with
  50K+ likes) - grade **C**, range-restricted. Every colour metric separated the
  top and bottom quartiles by less than +0.2 sd, while text-band height
  separated them by +0.72 sd. Covers with no text: 7 of 131 in the top quartile
  against 35 of 131 in the bottom. **The photo must leave a calm zone (sky or
  sea) for the text block.** A busy full-frame image fights the strongest
  signal we have.

### 3.2 People in the landscape - the most contested variable

| Study | Grade | Finding (verbatim) |
|---|---|---|
| Bakhshi et al. 2014, 1.1M Instagram photos | B | "Pictures with human faces are 38 percent more likely to receive likes" |
| Li and Xie 2020, JMR | B | "presence of human face ... can induce higher user engagement on Twitter but not on Instagram" |
| JCR 2023, "It Looks Like 'Theirs'" (doi 10.1093/jcr/ucad059) - 14,725 Instagram photos of a top travel influencer + 5 experiments | A | "the presence (vs. absence) of another human in the photo of an identity-relevant experience (e.g., a vacation, a wedding) can lower viewers' liking and preference for the venue ... moderated by ... the distinctiveness of the human in the photo." |
| Li and Wan 2025, Tourism Management 106, 104969 - 3 experiments | A | "the presence of a person in photos significantly prompted tourists to imagine their future travel experiences ... However, this favorable effect is mitigated when the photo features an urban (vs. natural) landscape and when the person's face is clearly shown." |

URLs: https://doi.org/10.1093/jcr/ucad059 and
https://thuvienso.hoasen.edu.vn/handle/123456789/15426

**Where the travel evidence agrees:** a **small, non-distinctive, face-hidden
person** (seen from behind, a silhouette, far away) in a **natural** scene
helps the viewer picture themselves there. A **clearly visible stranger's
face** on a vacation scene is the condition both experiments flag as harmful.
This also matches the awe logic: a tiny figure supplies scale. Avoid
recognisable faces anyway, because of stock licence terms on people (section 5).

### 3.3 Sunsets, aerials, turquoise water, cliffs - honest status

- **Sunset over sea:** no engagement study was found. Supporting proxies: warmth
  boosts engagement (Bakhshi 2015, B); reddish beats bluish (Khosla, B); water
  raises preference strongly (White, A); sunsets are photographed 2.9x more
  than sunrises, mostly from coasts (Dunkel, B, volume only). **Strong proxy
  case. No direct test.**
- **Turquoise water and white sand:** blue in nature scenes raises engagement
  (Yu and Egger, B); blue is liked because it signals "clean water" (Palmer and
  Schloss, A); water raises preference (White, A). **Strong proxy case.**
- **Cliffs, karst and mountains:** "Coast", "Mountain" and "Valley" are top
  scenic features (Seresinhe, B). Vastness is the core of awe (theory D,
  mechanism A). **Strong proxy case.**
- **Drone and aerial:** **no engagement study found** (search returned only
  listicles). Caution from Seresinhe: "No Horizon" is a negative scenic
  feature. **Inference:** an oblique, high drone view with a horizon or a far
  coastline should beat a straight-down shot with no horizon. A top-down shot
  can still work when the shape itself is the wonder, such as a reef or a
  lagoon pattern. Treat this as a hypothesis to A/B test.
- **Long exposure and blue hour:** only practitioner evidence (D). Commons:
  "Best light of day is early morning or late afternoon."

---

## 4. Recommended automated pipeline (offline, CPU, commercial-safe)

### 4.1 Stack and weights

Compute one CLIP ViT-L/14 embedding per *published crop* (9:16 for TikTok, 4:5
for Instagram). Every score below derives from it, except Q.

| Signal | What it is | Weight | Why this weight |
|---|---|---|---|
| **A - aesthetic** | LAION linear head on the CLIP embedding (`w . x + b`) | **0.45** | Best-validated human agreement among models that are licence-safe and CPU-cheap (AVA SRCC 0.665 official weights, 0.721 when retrained). |
| **S - WOW content** | CLIP prompt contrast: mean cosine to positive travel prompts minus mean to negative prompts | **0.30** | AVA knows nothing about *travel*. S encodes the scene-level findings (water, coast, cliffs, sunset, no construction or parking, has a horizon). Zero-shot prompts are poor *aesthetic* judges (SRCC 0.54) but dependable *content* detectors. |
| **Q - technical** | Sharpness (variance of Laplacian on the 1080px crop) + clipped-highlight/shadow fraction + pixel count | **0.15**, plus a hard gate | CLIP sees 224px and cannot see blur. Li and Xie and Airbnb show that professional quality pays. |
| **C - colour** | Hasler-Susstrunk colourfulness, mean warmth (R-B), brightness | **0.10**, with an oversaturation cap | Real but weak (Khosla 0.05 for saturation; Bakhshi favours warmth, exposure and contrast). Commons: "Oversaturated colors are not good." |

`final = 0.45*pct(A) + 0.30*pct(S) + 0.15*pct(Q) + 0.10*pct(C)`, where `pct` is
the **percentile rank inside the candidate pool for that slide or query**. Use
relative ranking, as `wow.js` v2 already does, because absolute scales differ
between models and between queries.

**Hard gates, applied before ranking:**
- Published crop under 1080x1920 (TikTok) or 1080x1350 (Instagram). Reject.
- Q below the pool's 20th percentile, or more than 3% of pixels clipped at 255
  in a bright sky. Reject.
- S below 0, meaning closer to the negative prompts than the positive ones.
  Reject.
- A clearly visible face, detected by a face detector, as more than ~2% of the
  frame. Send to manual review, not automatic rejection.
- Near-duplicates: CLIP cosine above 0.95 to a higher-ranked pick. Drop.
- Watermark or text in the image (existing OCR tooling in `analyze/`).

### 4.2 Prompt sets for S

Positive, averaged:
"a breathtaking sunset over a tropical sea", "turquoise lagoon with white sand
beach", "limestone karst cliffs rising from turquoise water", "aerial view of a
tropical island and coastline", "golden hour light on a beach",
"a tiny person standing in front of a vast landscape", "a stunning travel
photograph", "crystal clear water and a long horizon".

Negative, averaged:
"an overcast grey sky", "a parking lot", "a construction site", "a busy road
with traffic", "a crowded street with tourists' faces", "a dim indoor room",
"a flat grass field", "a blurry low quality snapshot", "a photo with text and
a watermark", "a cluttered market stall".

Template note: Hentschel found that adding content to the prompt helped
("a beautiful picture of a dog"). Write prompts about the **scene**, not just
the adjective.

### 4.3 Calibrate to the owner, then lock it with a gate

Model weights are a prior, not the truth. The cheapest proven upgrade is a
**linear probe**. Hentschel's linear probe on CLIP features reached SRCC 0.683
on AVA from frozen embeddings.

1. Run the pipeline on about 300 Thailand candidates. Show the owner a blind
   contact sheet (the existing `blind-sheets.mjs`) and have him mark 40 WOW and
   40 no.
2. Fit a logistic regression on [A, S, Q, C] (4 weights). With more than 300
   labels, fit on the raw 768-dimensional embedding instead (his personal
   head).
3. Report the hold-out AUC. Keep the new weights only if they beat the prior
   weights on held-out picks.
4. Following "prove a new gate bites": plant 10 known-bad frames (grey noon,
   parking lot, blurred, oversaturated rooftop). Assert that none reaches the
   top 20%, and that 10 known-WOW frames do not fall below the 50th percentile.

### 4.4 Torch-free LAION head (export once, then a dot product)

`readpth.py` (scratchpad, verified 16.10) reads the `.pth` zip with a
*restricted* unpickler and multiplies the five Linear layers together:

```python
# W_total = W7 @ W6 @ W4 @ W2 @ W0  ;  b_total = W7@(W6@(W4@(W2@b0+b2)+b4)+b6)+b7
# Result: W shape (1, 768), b = 5.23664584, ||W|| = 18.0
score = float(W @ (emb / np.linalg.norm(emb)) + b)   # emb = CLIP ViT-L/14 image_embeds (768)
```

Safety: the unpickler should allow only `collections.OrderedDict`,
`torch._utils._rebuild_tensor_v2` and `torch.FloatStorage`, and raise on
anything else. A `.pth` is a pickle, and an unrestricted load executes code.

### 4.5 Install, commercial-safe path

```
pip install onnxruntime pillow numpy opencv-python-headless
# CLIP vision ONNX (MIT weights, ONNX export by Xenova):
#   https://huggingface.co/Xenova/clip-vit-large-patch14/resolve/main/onnx/vision_model.onnx
#   text encoder for prompts: .../onnx/text_model.onnx (+ tokenizer.json)
# LAION head:
#   https://github.com/christophschuhmann/improved-aesthetic-predictor/raw/main/sac+logos+ava1-l14-linearMSE.pth
```

Optional, for a private benchmark only (non-commercial licence): `pip install
pyiqa`, then `pyiqa laion_aes topiq_iaa musiq -t <dir> --device cpu`. Use it to
check that the torch-free numbers match `laion_aes`.

---

## 5. Sourcing - where WOW Thailand, beach, sunset and cliff images live

| Source | Licence (verbatim) | Fit for us | Grade |
|---|---|---|---|
| **Unsplash** | "for **Commercial** and **non-commercial** purposes"; "**No permission needed** (though attribution is appreciated!)"; "Images cannot be **sold** without significant modification"; no "Compiling images from Unsplash to replicate a similar or competing service". https://unsplash.com/license | Best editorial/landscape quality per query. API: "50 requests per hour" demo, "1000 requests per hour" production; must "trigger a GET request to this endpoint every time your application performs a download". Watch for **Unsplash+** (paid) results mixed into search; the API docs show no filter, so check every pick's licence. | D (terms) |
| **Pexels** | "Attribution is not required"; "Identifiable people may not appear in a bad light"; "Don't imply endorsement of your product by people or brands on the imagery"; "Don't sell unaltered copies". https://www.pexels.com/license/ | Large and usable. API: "200 requests per hour and 20,000 requests per month"; filters `orientation`, `size` (large = 24MP), `color` including `turquoise`; `per_page` up to 80; `original` size. Known problem (our memory): **matches loosely**, so gate on alt text and on S. | D |
| **Pixabay** | "Use Content without having to attribute the author"; cannot use content with recognisable "trademarks/logos ... for commercial purposes". https://pixabay.com/service/license-summary/ | More amateur and HDR-heavy. Use as a third pool, scored hard on Q and C (oversaturation). | D |
| **Wikimedia Commons Featured Pictures** | Curated "finest on Commons"; "Raster images of lower resolution than 2 million pixels ... are typically rejected". Mostly CC BY-SA, which requires attribution and ShareAlike for adaptations ("If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original", https://creativecommons.org/licenses/by-sa/4.0/) | Highest guaranteed quality, but a text-overlaid cover is an adaptation. **Use only CC0, PD or CC BY files, and credit in the caption.** | D |
| **Flickr CC** | Licence ids: 4 = CC BY 2.0, 9 = CC0, 10 = Public Domain Mark, 11 = CC BY 4.0 (avoid NC = 1, 2, 3, 14, 15, 16 and SA = 5, 12). https://www.flickr.com/services/api/flickr.photos.licenses.getInfo.html | Search with `license=4,9,10,11` and `sort=interestingness-desc` (Flickr's own engagement-based ranking). The `extras` options include `license`. Credit the author for BY. | D |
| **Pinterest** | Not a licence source. Pins are other people's copyrighted photos. | **Inspiration only. Never download for publishing.** | - |

**Query vocabulary photographers use for top-tier shots** (practitioner usage,
grade **D**): `golden hour`, `blue hour`, `sunset` / `sunrise`, `aerial`,
`drone`, `long exposure`, `turquoise`, `crystal clear water`, `limestone`,
`karst`, `longtail boat`, `viewpoint`, `panorama`, `silhouette`, `from above`,
`tropical`, `lagoon`. Thailand place names that carry the iconic scenes: `Phi
Phi viewpoint`, `Maya Bay`, `Railay`, `Phang Nga Bay`, `James Bond Island`,
`Koh Lipe`, `Similan`, `Koh Tao`, `Koh Phangan`, `Krabi`, `Ao Nang`, `Hong
Island`, `Koh Samui`. Combine one place name with one light or angle word ("Railay
golden hour", "Phi Phi aerial"). Light and angle words pull in work by people
who shot on purpose.

---

## 6. The WOW checklist - for eyeballing, ranked by evidence strength

1. **Water is in the frame, and it is clean blue or turquoise.** (White A;
   Palmer A; Yu and Egger B)
2. **Natural grandeur: coast, cliffs, karst, mountain, valley.** No
   construction, parking, highway, industrial or flat-grass dominance.
   (Seresinhe B)
3. **Professional craft: tack-sharp at 1080px, clean exposure, clear subject
   against its ground.** (Li and Xie B; Airbnb B)
4. **People: none, or small, face-hidden or from behind, inside nature.** Never
   a clear stranger's face on a vacation scene. (JCR 2023 A; Li and Wan 2025 A)
5. **Vastness that reads: a scale cue (tiny person or boat) plus depth to a far
   horizon.** (Piff A mechanism; Keltner D theory; Seresinhe "No Horizon"
   negative, B)
6. **Warm light: golden hour or sunset, with exposure and contrast lifted.**
   (Bakhshi filters B; Khosla reddish B; Commons D)
7. **Blue plus warm in one frame: sea and sky blue against orange, pink or
   violet light.** That is the sunset-over-sea palette. (Yu 2020 B; Yu and
   Egger B; Pinterest B)
8. **Bright and saturated, but believable.** Any halo, neon sea or HDR crunch is
   a reject. (Yu 2020 B; Commons D; LAION SAC bias)
9. **Intermediate natural complexity**: textured coastline, clouds, foliage.
   Not an empty grey sky, not a cluttered street. (Spehar A, population
   tendency)
10. **Judge the scene, not the histogram.** A "striking" subject beats colour
    stats 2-3x. (Khosla B)
11. **Has a horizon or long view.** Prefer an oblique drone shot over a
    straight-down one unless the pattern itself is the wonder. (Seresinhe B,
    then inference)
12. **A calm zone (sky, sea, sand) for a 3-row text block** on the cover.
    (Internal corpus C)
13. **Slide 2 is a second cover on Instagram.** It needs a WOW frame too.
    (Mosseri D)
14. **Survives the crop**: at least 2MP, ideally full resolution, with the
    subject still whole in 9:16. (Commons D; practical)
15. **Horizon off-centre, on a third.** (Commons D)

---

## 7. Gaps and how to close them

- No published study tests sunset, drone or turquoise covers on TikTok. Close
  this with our own A/B: same deck and copy, two covers (sunset-sea against
  noon-turquoise; oblique drone against ground), across 6-10 posts, comparing
  saves and shares per 1K views.
- AVA-trained heads encode photographers' taste, not scroll-stopping. The fix
  is the owner-labelled linear probe in 4.3, which is the only calibration
  measured against *our* target.
- The "saturation is the single most critical attribute" line in
  `00-THE-SPEC.md` is not supported by the abstract that was read (section
  1.2). Re-verify it against the full text or soften it.
