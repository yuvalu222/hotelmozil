# Cover census (10.10): hook formulas on the first slide, English + Hebrew.
#
# English: research/scroll-stop/cover-rows.json, lift = log10(plays / creator median).
#   Base = every cover with plays from creators with >= 8 such covers.
#   Top list = top 150 by lift among those with plays >= 50,000.
# Hebrew: harvest/he-search (search cross-section), travel kind, he/mixed,
#   followers >= 200, measure = ln(plays/followers) minus the set median.
#
# A cover can belong to several clusters (multi-label). Clusters are regexes on
# the transcribed text, never hand-assigned. Outputs census-tables.md + census.json.
import json, glob, math, os, random, re, statistics as st
from collections import defaultdict, Counter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
random.seed(7)

BIDI = ''.join(chr(c) for c in [0x200E, 0x200F, 0x061C, 0x202A, 0x202B, 0x202C,
                                0x202D, 0x202E, 0x2066, 0x2067, 0x2068, 0x2069])
BIDI_RX = re.compile('[' + re.escape(BIDI) + ']')


def clean(t):
    t = BIDI_RX.sub('', t or '')
    t = t.replace('|', '/').replace('\n', ' / ')
    return re.sub(r'\s+', ' ', t).strip()


# ---------------------------------------------------------------- English
EN = [
    ('secret_hidden', 'Secret / hidden / underrated',
     r"\b(secret|hidden|underrated|niche|gems?|nobody knows|no one knows|unknown|lesser[- ]known|off the beaten|skip the (crowds|tourist)|(discover|experience) the real|(should|need to) know about|don'?t know about|didn'?t know|least visited|undiscovered|without knowing)\b"),
    ('warning', 'Warning / mistake / what NOT to do',
     r"\b(mistakes?|avoid(ed|ing)?|don'?t|do not|never|not to (do|skip|miss)|what not|warning|scams?|tourist traps?|regrets?|stop (visiting|doing|going)|overrated|worst|dying|banned|illegal)\b"),
    ('need_to_know', 'Wish I knew / need to know / tips',
     r"(wish i (had )?knew|before (you|going|visiting|travel|your|coming|booking|heading)|need to know|should know|things to know|know before|\btips?\b|\bfacts\b|nobody tells|no one tells)"),
    ('cost', 'Cost reveal / price / budget / free',
     r"(\bcosts?\b|\bspent\b|\bspend\b|\bprices?\b|budget|\bcheap|\bfree\b|[$£€]|afford|how much|per night|\bpp\b|expensive|saving)"),
    ('callout', 'Identity call-out ("going to X?", "if you are...")',
     r"(if you('?re| are)|you'?re going|going to [^/?]{1,30}\?|first time (in|to|visiting)|visiting [^/?]{1,30}\?|heading to|planning (a|your|to)|for your (next|first|\d|trip|summer|euro)|\?\s*/\s*here'?s|girls? who|as a (girl|single|local)|girly)"),
    ('versus', 'Comparison / vs / instead',
     r"(\bvs\.?\b|versus|instead|alternatives?|better than|compared to|cheaper than|\bnot\s*/\s*\w|-->|->)"),
    ('ranking', 'Ranking / rated / review',
     r"(\brat(ing|ed)\b|\brank(ing|ed)?\b|tier list|\b\d{1,2}\s?/\s?10\b|out of 10|\breview)"),
    ('objection', 'Objection quote ("but X is so expensive")',
     r"(^\s*[\"“”'][^/]{0,12}\b(but|is so|so)\b|so expensive|(people|everyone) (say|said|says|think)|you said|is \"dying\")"),
    ('pov', 'POV / scenario / "this is your sign"',
     r"(\bpov\b|when you|imagine|one day|your sign|welcome to|good morning|me (after|when)|that feeling|here to remind)"),
    ('list_n', 'List of N / Top N',
     r"(^\W*(top\s*)?\d+\b|\btop\s*\d+|\b\d+\s+(\w+\s+)?(things|places|hotels|cities|countries|destinations|reasons|spots|tips|cafes|restaurants|beaches|islands|must|hidden|best|european|greek|photo|airbnbs?|mistakes|rules|truths|lessons))"),
    ('superlative', 'Superlative (best / top / most / ultimate / only)',
     r"\b(best|top|most|ultimate|perfect|only|iconic|coolest|prettiest|nicest|greatest|insane|craziest|cheapest|beautiful|stunning|dreamiest|favou?rite)\b"),
    ('must', 'Must / need to / can\'t miss (imperative)',
     r"(\bmust\b|\bneed to (do|see|go|try|visit)|\bhave to\b|can'?t miss|don'?t miss|not to skip|\bshould\b|you need)"),
    ('bucket', 'Bucket list / desire ("places I need to see")',
     r"(need to see|want to visit|need to visit|desperately|\bdream|bucket|before you die|once in (your|ur|a) life|lifetime|wonders)"),
    ('plain_recs', 'Plain recommendations (things to do / places to visit)',
     r"(things to do|places to (visit|go|see)|what to (do|see)|activities|to visit in|must do|to do in)"),
    ('itinerary', 'Itinerary / guide / N days / route',
     r"(itinerar|\bguide\b|\broute\b|\b\d+\s*days?\b|day trip|\b\d+\s*hours\b|road ?trip|interrail|\bby month)"),
    ('hotel', 'Hotel / Airbnb / where to stay',
     r"(hotel|airbnb|resort|villa|where to stay|\bstay\b|accommodation)"),
    ('confession', 'Confession / insider truth ("the real reason", "truths")',
     r"(confess|honest|real reason|truths?\b|realities|reality of|lessons|spill|untold|moved|why i\b|how i\b|unexpected)"),
    ('first_person', 'First person (I / my / we)',
     r"\b(i|i'?m|i'?ve|i'?d|my|we|we'?re|our|us|me)\b"),
    ('authority', 'Credential ("after 5 years in", "as a local")',
     r"(after (travel|living|\d)|\d+\s*(years|times|months)|many times|who lives|as a local|i (made|created))"),
    ('local_tourist', 'Local vs tourist',
     r"(\blocals?\b|\btourists?\b|like a local|who lives here)"),
    ('before_after', 'Before / after / expectation vs reality',
     r"(before\s*(/|&|and|vs)\s*after|expectations?|reality\b|then\s*(vs|and|/)\s*now|camera roll after)"),
    ('season', 'Season / year / month',
     r"(\b20\d\d\b|summer|winter|\bfall\b|autumn|spring|january|february|march|april|may\b|june|july|august|september|october|november|december|by month|this year|christmas)"),
    ('photo', 'Photo spots / photo ideas',
     r"(photo|pictures|camera|recreate|instagram)"),
    ('question', 'Contains a question mark', r"\?"),
    ('part', 'Part N (series)', r"\b(part|pt)\.?\s*\d"),
]

# ---------------------------------------------------------------- Hebrew
HE = [
    ('secret_hidden', 'Secret / not everyone knows',
     r"(סוד|נסתר|לא מכיר|לא כולם מכירים|בטוח לא|אף אחד לא|לא יודעים|פחות מוכר|רק מקומיים|שהמקומיים|לא סיפרו|לא יגידו|מגלה לכם|שלא שמעתם|נדירות|נדיר|מקוריות|יכעסו|לא הכרתם|לא דמיינתם|הצד האפל|הזווית ש|הצד ש)"),
    ('warning', 'Warning / mistake / what NOT to do',
     r"(אסור(?![!\s]*(לכם\s+)?(לפספס|לוותר))|אל ת|לא לעשות|מה \**לא|טעות|טעויות|להימנע|תיזהרו|תזהרו|להזהר|להיזהר|זהירות|הונאה|עקיצ|מלכודת|לא צריך להביא|בלי \d)"),
    ('need_to_know', 'Wish I knew / before you fly / tips',
     r"(הלוואי|לפני ש|לפני הטיסה|לפני הטיול|לפני :|חשוב לדעת|צריך לדעת|לדעת|טיפ|למדתי)"),
    ('cost', 'Cost reveal / price ("כמה עלה לנו")',
     r"(כמה עלה|כמה עלו|כמה באמת|עלה לנו|עלה לי|עלו לנו|₪|ש\"ח|שקל|יורו|דולר|זול|חינם|חסכ|מחיר|כסף|תקציב|עלות)"),
    ('callout', 'Identity call-out ("טסים ל...?", "כל מי שטס")',
     r"(טסים|טסה ל|טס ל|שטס|למי ש|לכל מי|כל מי ש|אם אתם|אם את |מגיעים|מגיע ל|מתכננים|מתלבטים|חולמים על|טיול ראשון|לאחת ש|למתחילים|בשבילכם|את טסה)"),
    ('versus', 'Comparison / "it is not the Maldives" / Google vs reality',
     r"(לעומת|\bמול\b|במקום|במציאות|בגוגל|vs|כאילו|לא במלדיביים|זה בישראל)"),
    ('ranking', 'Ranking / rating (מדרגת, דירוג)',
     r"(דירוג|מדרג|ציון|\d+/10|מאחד עד עשר|ביקורת)"),
    ('objection', 'Objection / question quote (starts with a quote)',
     r"(^\s*[\"“”״]|תגובתי|שאלתם|שואלים אותי)"),
    ('pov', 'POV / scenario ("כאן כדי להזכיר", "מי ידע")',
     r"(pov|Pov|POV|הסימן|דמיינו|להזכיר לכם|בואו איתנו|בואו נ|תכירו|מי ידע|מרגישה כאילו|תמונה ראשונה|הגלריה|איך נראית|ככה נראית)"),
    ('list_n', 'List of N / Top N (digit on cover)', r"(\d|טופ)"),
    ('superlative', 'Superlative (הכי / המושלם / זהב)',
     r"(הכי|המושלם|המושלמת|הטוב ביותר|הטובים ביותר|מטורף|המיוחד|זהב|חלומי)"),
    ('must', 'Must / worth / don\'t miss (חובה, שווה, אסור לפספס)',
     r"(חובה|חייבים|חייב|לפספס|לוותר|שווה|שווים|שוות|צריכים|צריכה|מומלץ|מומלצים)"),
    ('plain_recs', 'Plain "המלצות ל<place>"', r"(המלצ)"),
    ('itinerary', 'Itinerary / route / N days',
     r"(מסלול|ימים|יום \d|שבועות|שבוע|חודש|לילות|תכנון|מדריך|Day)"),
    ('hotel', 'Hotel / resort', r"(מלון|מלונות|ריזורט|resort|hotel|וילה|airbnb)"),
    ('confession', 'Confession / honest ("האמת", "שיקרתי")',
     r"(האמת|כנה|הכנה|כנות|אמיתי|שיקרתי|מגלה|יכעסו|\*אמיתיות\*)"),
    ('first_person', 'First person (אני / שלי / אנחנו / עשינו)',
     r"(שלי|אני|אנחנו|שלנו|עשינו|טיילנו|הייתי|טסתי|גיליתי|למדתי|שיקרתי|ריכזתי|ממני|עברנו|הגעתי|מרגישה)"),
    ('authority', 'Credential ("אחרי 3 פעמים", "בתור מישהי ש")',
     r"(אחרי (\d|שלוש|טיול|חודש)|פעמים|בתור מישהי|שהייתה שם|מעל חודש|חודשים)"),
    ('local_tourist', 'Local vs tourist', r"(מקומי|תיירים|תיירותי|תיירות)"),
    ('before_after', 'Before/after / Google vs reality', r"(לפני ואחרי|בגוגל|במציאות|ציפיות)"),
    ('season', 'Season / year / holiday', r"(20\d\d|קיץ|חורף|חגים|השנה|סתיו|אביב)"),
    ('save_cta', 'Save call to action (שמרו / תשמרו)', r"(שמרו|תשמרו|לשמור|סייב|שומרים)"),
    ('question', 'Contains a question mark', r"\?"),
    ('part', 'Part N (חלק)', r"(חלק)"),
]

CONTENT_KEYS = {'secret_hidden', 'warning', 'need_to_know', 'cost', 'callout', 'versus', 'ranking',
                'objection', 'pov', 'list_n', 'superlative', 'must', 'bucket', 'plain_recs', 'itinerary',
                'hotel', 'confession', 'first_person', 'authority', 'local_tourist', 'before_after',
                'photo', 'save_cta'}


def words(t):
    return [w for w in re.split(r'[\s/]+', t) if re.search(r'[\w֐-׿]', w)]


def classify(text, rules, flags):
    t = text or ''
    hits = [k for k, _, rx in rules if re.search(rx, t, flags)]
    w = words(t)
    if not w:
        hits.append('no_text')
    elif len(w) <= 4 and not (set(hits) & CONTENT_KEYS) and '?' not in t and not re.search(r'\d', t):
        hits.append('place_only')
    return hits


LABELS = {k: lab for k, lab, _ in EN}
LABELS_HE = {k: lab for k, lab, _ in HE}
for d in (LABELS, LABELS_HE):
    d['place_only'] = 'Bare place name / few words, no hook (<=4 words)'
    d['no_text'] = 'No text on cover'


def boot_ci(groups, stat, n=2000):
    """groups: list of per-creator value lists; resample creators."""
    vals = []
    for _ in range(n):
        s = [groups[random.randrange(len(groups))] for _ in groups]
        v = stat(s)
        if v is not None:
            vals.append(v)
    vals.sort()
    if not vals:
        return (None, None)
    return (vals[int(0.025 * len(vals))], vals[int(0.975 * len(vals)) - 1])


def sign_p(k, m):
    """two-sided binomial sign test, p=0.5."""
    if m == 0:
        return 1.0
    tail = sum(math.comb(m, i) for i in range(max(k, m - k), m + 1)) / 2 ** m
    return min(1.0, 2 * tail)


def contrast(rows, key, measure, creator):
    """per creator: mean(measure | key) - mean(measure | not key), weighted n1*n0/(n1+n0).
    Returns point, ci, creators-won, creators-compared."""
    by = defaultdict(lambda: ([], []))
    for r in rows:
        by[r[creator]][0 if key in r['cl'] else 1].append(r[measure])
    pairs = [(a, b) for a, b in by.values() if a and b]
    if len(pairs) < 3:
        return None

    def est(ps):
        num = den = 0.0
        for a, b in ps:
            w = len(a) * len(b) / (len(a) + len(b))
            num += w * (st.mean(a) - st.mean(b)); den += w
        return num / den if den else None
    pt = est(pairs)
    lo, hi = boot_ci(pairs, est)
    won = sum(1 for a, b in pairs if st.mean(a) > st.mean(b))
    return pt, lo, hi, won, len(pairs)


def cluster_table(rows, rules_labels, measure, creator, base10, top_ids, ex_field):
    keys = list(rules_labels.keys())
    out = []
    ntop = len(top_ids)
    for k in keys:
        cl = [r for r in rows if k in r['cl']]
        if not cl:
            continue
        ms = [r[measure] for r in cl]
        med = st.median(ms)
        share = sum(1 for x in ms if x > 0) / len(ms)
        # per-creator: does this creator's cluster median beat 0 (its own median / set median)?
        per = defaultdict(list)
        for r in cl:
            per[r[creator]].append(r[measure])
        cr_win = sum(1 for v in per.values() if st.median(v) > 0)
        cr_tot = len(per)
        lo, hi = boot_ci(list(per.values()), lambda s: st.mean([x for g in s for x in g]))
        con = contrast(rows, k, measure, creator)
        intop = sum(1 for r in cl if r['id'] in top_ids)
        share_base = len(cl) / len(rows)
        over = (intop / ntop) / share_base if share_base else None
        ex = sorted(cl, key=lambda r: -r[measure])
        # 3 examples from 3 different creators if possible
        seen, exs = set(), []
        for r in ex:
            if r[creator] in seen:
                continue
            seen.add(r[creator]); exs.append(r)
            if len(exs) == 3:
                break
        out.append(dict(key=k, label=rules_labels[k], n=len(cl), creators=cr_tot,
                        med=med, mult=(base10 ** med), share=share,
                        cr_win=cr_win, sign_p=sign_p(cr_win, cr_tot),
                        mean_ci=(lo, hi), contrast=con, intop=intop, over=over,
                        examples=[(r['text'], r['plays'], r[creator], base10 ** r[measure]) for r in exs]))
    return out


def fmt_x(v):
    if v is None:
        return '-'
    return f"x{v:.2f}" if v < 10 else f"x{v:.0f}"


def md_cluster_table(res, base10, title_n):
    lines = ['| formula | n | in top 150 (over-rep.) | creators | median | % beat median | creators beat (sign p) | within-creator contrast [95% CI], creators won |',
             '|---|---|---|---|---|---|---|---|']
    for r in sorted(res, key=lambda r: -r['n']):
        c = r['contrast']
        if c:
            cs = f"{fmt_x(base10 ** c[0])} [{fmt_x(base10 ** c[1])}, {fmt_x(base10 ** c[2])}], {c[3]}/{c[4]}"
        else:
            cs = '- (too few creators)'
        lines.append(f"| {r['label']} | {r['n']} | {r['intop']} ({r['over']:.2f}) | {r['creators']} | {fmt_x(r['mult'])} | {r['share']*100:.0f}% | {r['cr_win']}/{r['creators']} (p={r['sign_p']:.2g}) | {cs} |")
    return '\n'.join(lines)


def md_examples(res):
    lines = []
    for r in sorted(res, key=lambda r: -r['n']):
        lines.append(f"**{r['label']}** (n={r['n']})")
        for t, p, c, m in r['examples']:
            lines.append(f"- \"{t}\" - @{c}, {p:,} plays, {fmt_x(m)}")
        lines.append('')
    return '\n'.join(lines)


# ================================================================ run English
rows = json.load(open(os.path.join(ROOT, 'research', 'scroll-stop', 'cover-rows.json'), encoding='utf-8'))
rows = [r for r in rows if r.get('plays') and r.get('lift') is not None]
cnt = Counter(r['creator'] for r in rows)
base = []
for r in rows:
    if cnt[r['creator']] >= 8:
        r = dict(r); r['text'] = clean(r['text']); r['cl'] = classify(r['text'], EN, re.I)
        base.append(r)
pool50 = sorted([r for r in base if r['plays'] >= 50000], key=lambda r: -r['lift'])
top = pool50[:150]
top_ids = {r['id'] for r in top}
en_res = cluster_table(base, LABELS, 'lift', 'creator', 10, top_ids, 'text')

# ================================================================ run Hebrew
HS = os.path.join(ROOT, 'harvest', 'he-search')
coded = {}
for f in glob.glob(os.path.join(HS, 'coded', '*.jsonl')):
    for line in open(f, encoding='utf-8'):
        line = line.strip()
        if line:
            try:
                d = json.loads(line); coded[d['code']] = d
            except Exception:
                pass
codes = json.load(open(os.path.join(HS, 'codes.json')))
hits = json.load(open(os.path.join(HS, 'hits.json'), encoding='utf-8'))
he = []
for c, d in coded.items():
    h = hits.get(codes.get(c))
    if not h or d.get('kind') != 'travel' or d.get('lang') not in ('he', 'mixed'):
        continue
    if not h.get('followers') or h['followers'] < 200 or not h.get('plays'):
        continue
    t = clean(d['text'])
    he.append(dict(id=h['id'], text=t, plays=h['plays'], followers=h['followers'],
                   creator=h['author'], raw=math.log(h['plays'] / h['followers'])))
med_he = st.median(r['raw'] for r in he)
for r in he:
    r['m'] = r['raw'] - med_he
    r['cl'] = classify(r['text'].replace(' / ', ' '), HE, 0)  # Hebrew phrases often break across lines
he_sorted = sorted(he, key=lambda r: -r['m'])
he_top = he_sorted[:150]
he_top_ids = {r['id'] for r in he_top}
he_res = cluster_table(he, LABELS_HE, 'm', 'creator', math.e, he_top_ids, 'text')

# ================================================================ write
out = []
out.append(f"<!-- generated by cover_census.py -->\n")
out.append(f"## EN-BASE\nbase covers: {len(base)}, creators: {len({r['creator'] for r in base})}, plays>=50k pool: {len(pool50)} from {len({r['creator'] for r in pool50})} creators; top 150 from {len({r['creator'] for r in top})} creators\n")
out.append('## EN-TOP150\n| # | xmedian | plays | creator | cover text (verbatim) | formulas |\n|---|---|---|---|---|---|')
for i, r in enumerate(top, 1):
    out.append(f"| {i} | {fmt_x(10 ** r['lift'])} | {r['plays']:,} | @{r['creator']} | {r['text'] or '(no text)'} | {', '.join(r['cl'])} |")
out.append('\n## EN-CLUSTERS\n' + md_cluster_table(en_res, 10, 150))
out.append('\n## EN-EXAMPLES\n' + md_examples(en_res))
out.append(f"\n## HE-BASE\nHebrew travel covers: {len(he)}, creators: {len({r['creator'] for r in he})}, median ln(plays/followers) = {med_he:.3f} (plays = x{math.exp(med_he):.1f} followers)\n")
out.append('## HE-TOP150\n| # | x set median | plays | followers | creator | cover text (verbatim) | formulas |\n|---|---|---|---|---|---|---|')
for i, r in enumerate(he_top, 1):
    t = r['text'] if len(r['text']) < 220 else r['text'][:220] + ' [...]'
    out.append(f"| {i} | {fmt_x(math.exp(r['m']))} | {r['plays']:,} | {r['followers']:,} | @{r['creator']} | {t} | {', '.join(r['cl'])} |")
out.append('\n## HE-CLUSTERS\n' + md_cluster_table(he_res, math.e, 150))
out.append('\n## HE-EXAMPLES\n' + md_examples(he_res))
open(os.path.join(HERE, 'census-tables.md'), 'w', encoding='utf-8').write('\n'.join(out))


def ser(res):
    return [{k: v for k, v in r.items() if k != 'examples'} for r in res]


json.dump({'en': ser(en_res), 'he': ser(he_res)}, open(os.path.join(HERE, 'census.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)

# console summary
for name, res, b in (('EN', en_res, 10), ('HE', he_res, math.e)):
    print('=====', name)
    for r in sorted(res, key=lambda r: (r['sign_p'])):
        c = r['contrast']
        cs = f"{b ** c[0]:.2f} [{b ** c[1]:.2f},{b ** c[2]:.2f}] {c[3]}/{c[4]}" if c else '-'
        print(f"{r['key']:14} n={r['n']:4} top={r['intop']:3} over={r['over']:.2f} cr={r['creators']:3} med={r['mult']:.2f} share={r['share']:.2f} crwin={r['cr_win']}/{r['creators']} p={r['sign_p']:.3f} con={cs}")


# ================================================================ extras
NARROW_EN = [
    ('"underrated"', r"underrated"), ('"hidden gem(s)"', r"hidden gems?"), ('"secret"', r"\bsecret"),
    ('"Top N ..."', r"\btop\s*\d+"), ('"N things to do in"', r"\d+\s+(\w+\s+)?things to do"),
    ('"things to do in" (any)', r"things to do"), ('"places to visit"', r"places to visit"),
    ('"must do / must visit"', r"must (do|visit|see)"), ('"what NOT to do / never"', r"(not to do|\bnever\b|don'?t)"),
    ('"before going / wish I knew"', r"(wish i knew|before (going|you go|visiting))"),
    ('"N day itinerary"', r"\d+\s*days?\s*itinerar|itinerary"), ('"this is your sign"', r"your sign"),
    ('"but X is so expensive" quote', r"so expensive"), ('"how much it cost(s)"', r"(how much|cost)"),
    ('"N countries in 1 trip"', r"countries .*1 trip|in 1 trip|in one trip"), ('"hotels"', r"hotels?"),
    ('"X? Here\'s where to go"', r"\?\s*/\s*here'?s"), ('"Oh you\'re going to X?"', r"you'?re going to"),
    ('"tourist trap(s)"', r"tourist trap"), ('"rating / rated"', r"\brat(ing|ed)\b"),
]
NARROW_HE = [
    ('"המלצות ל..."', r"המלצות ל"), ('"טסים ל...?"', r"טסים ל"), ('"כמה עלה/עלו לנו"', r"(כמה עלה|כמה עלו|כמה באמת)"),
    ('"הלוואי (שהייתי יודע/ת)"', r"הלוואי"), ('"לפני שטסים/לפני שאתם"', r"לפני ש"),
    ('"לא מכירים / לא כולם מכירים"', r"(לא מכיר|לא כולם מכירים|בטוח לא מכירים)"),
    ('"אסור לכם לפספס"', r"אסור[!\s]*(לכם\s+)?לפספס"), ('"אסור/אל ת... (warning, not FOMO)"', r"(אסור(?![!\s]*(לכם\s+)?(לפספס|לוותר))|אל ת|לא לעשות|טעויות)"),
    ('"הכי"', r"הכי"), ('"מלון/מלונות"', r"מלון"), ('"מדרג/דירוג"', r"(מדרג|דירוג)"),
    ('"תשמרו/שמרו"', r"(שמרו|תשמרו|לשמור)"), ('"חלק N"', r"חלק"), ('"N דברים"', r"\d+\s*דברים"),
    ('"טיפים"', r"טיפ"), ('"מסלול"', r"מסלול"), ('"pov"', r"(?i:pov)"),
]


def narrow(rows, pats, measure, b, flags):
    out = ['| phrase | n | creators | median | % beat median | creators beat |', '|---|---|---|---|---|---|']
    for lab, rx in pats:
        cl = [r for r in rows if re.search(rx, (r['text'] or '') if flags else (r['text'] or '').replace(' / ', ' '), flags)]
        if len(cl) < 3:
            out.append(f"| {lab} | {len(cl)} | - | - | - | - |"); continue
        per = defaultdict(list)
        for r in cl: per[r['creator']].append(r[measure])
        w = sum(1 for v in per.values() if st.median(v) > 0)
        ms = [r[measure] for r in cl]
        out.append(f"| {lab} | {len(cl)} | {len(per)} | {fmt_x(b ** st.median(ms))} | {sum(1 for x in ms if x > 0)/len(ms)*100:.0f}% | {w}/{len(per)} (p={sign_p(w, len(per)):.2g}) |")
    return '\n'.join(out)


extra = ['\n## EN-NARROW\n' + narrow(base, NARROW_EN, 'lift', 10, re.I),
         '\n## HE-NARROW\n' + narrow(he, NARROW_HE, 'm', math.e, 0)]

# noise floor from our own data: same creator, same text (normalised) posted more than once
def norm(t):
    return re.sub(r'[^\w֐-׿]+', ' ', (t or '').lower()).strip()

grp = defaultdict(list)
for r in base:
    if norm(r['text']):
        grp[(r['creator'], norm(r['text']))].append(r)
reps = {k: v for k, v in grp.items() if len(v) >= 2}
lines = ['| creator | identical cover text | posts | plays (each) | max/min |', '|---|---|---|---|---|']
spreads = []
for (c, _), v in sorted(reps.items(), key=lambda kv: -max(x['plays'] for x in kv[1]) / max(1, min(x['plays'] for x in kv[1]))):
    ps = sorted((x['plays'] for x in v), reverse=True)
    sp = ps[0] / max(1, ps[-1]); spreads.append(sp)
    lines.append(f"| @{c} | {v[0]['text'][:90]} | {len(v)} | {', '.join(f'{p:,}' for p in ps)} | x{sp:.1f} |")
sd_all = st.pstdev([r['lift'] for r in base])
# within-repeat SD of lift (pooled)
dev = [x['lift'] - st.mean(y['lift'] for y in v) for v in reps.values() for x in v]
sd_rep = math.sqrt(sum(d * d for d in dev) / max(1, len(dev) - len(reps)))
extra.append(f"\n## NOISE\nrepeated identical covers: {len(reps)} groups, {sum(len(v) for v in reps.values())} posts; median max/min spread x{st.median(spreads):.1f}, largest x{max(spreads):.0f}\n"
             f"SD of lift across all base covers: {sd_all:.3f} log10 (one SD = x{10**sd_all:.2f}); SD inside identical-cover groups: {sd_rep:.3f} log10 (x{10**sd_rep:.2f}) = {sd_rep**2/sd_all**2*100:.0f}% of total variance\n\n" + '\n'.join(lines[:42]))

# Hebrew robustness: residual of ln(plays) on ln(followers) instead of the ratio
xs = [math.log(r['followers']) for r in he]; ys = [math.log(r['plays']) for r in he]
mx, my = st.mean(xs), st.mean(ys)
slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / sum((x - mx) ** 2 for x in xs)
for r, x, y in zip(he, xs, ys):
    r['res'] = y - (my + slope * (x - mx))
mres = st.median(r['res'] for r in he)
for r in he: r['res'] -= mres
rob = ['| formula | n | median (ratio measure) | median (residual measure) | % beat (residual) |', '|---|---|---|---|---|']
for k, lab in LABELS_HE.items():
    cl = [r for r in he if k in r['cl']]
    if len(cl) < 5: continue
    rob.append(f"| {lab} | {len(cl)} | {fmt_x(math.exp(st.median(r['m'] for r in cl)))} | {fmt_x(math.exp(st.median(r['res'] for r in cl)))} | {sum(1 for r in cl if r['res'] > 0)/len(cl)*100:.0f}% |")
extra.append(f"\n## HE-ROBUST\nslope of ln(plays) on ln(followers) = {slope:.2f} (1.0 would mean the ratio is size-neutral)\n\n" + '\n'.join(rob))
with open(os.path.join(HERE, 'census-tables.md'), 'a', encoding='utf-8') as f:
    f.write('\n'.join(extra))
print(extra[-2][:600]); print(extra[-1])
