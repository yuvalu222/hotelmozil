import sys, statistics as S, collections as C
from scipy.stats import fisher_exact
from features import *

out = open('captions_results.txt', 'w', encoding='utf-8')
def p(*a): print(*a, file=out)

D = load()
TR = [d for d in D if d['lang'] in ('he', 'mixed') and d['kind'] == 'travel']
TOP, BOT = terciles(TR)
own_items, _ = own()

HASH = R(r'#[\p{L}\p{N}_]+')
MENT = R(r'@[\w.]+')


def cap(desc):
    tags = HASH.findall(desc)
    prose = MENT.sub(' ', HASH.sub(' ', desc)).strip()
    ws = words(prose)
    em = emojis(prose)
    f = {'tags': len(tags), 'prose_words': len(ws), 'prose': prose, '_tags': tags}
    f['hashtags only (no prose)'] = len(ws) == 0
    f['prose 1-5 words'] = 1 <= len(ws) <= 5
    f['prose 6-20 words'] = 6 <= len(ws) <= 20
    f['prose 21+ words'] = len(ws) > 20
    f['prose has emoji'] = len(em) > 0
    f['_em'] = em
    f['fyp/foryou/viral tag'] = any(regex.search(r'(?i)fyp|foryou|viral|explore|פוריו', t) for t in tags)
    f['english tag'] = any(regex.match(r'#[A-Za-z]', t) for t in tags)
    f['hebrew tag'] = any(regex.match(r'#\p{Hebrew}', t) for t in tags)
    t = prose
    f['excl'] = '!' in t; f['excl2+'] = '!!' in t; f['q'] = '?' in t; f['ellipsis'] = bool(ELL.search(t))
    f['stretched'] = bool(STRETCH.search(t)); f['period'] = bool(regex.search(r'(?<![.\d])\.(?!\.)', t))
    f['comma'] = ',' in t; f['dash -'] = bool(regex.search(r'\s-\s', t)); f['en/em dash'] = bool(regex.search(r'[–—]', t))
    f['CTA save'] = bool(SAVE.search(t)); f['CTA follow'] = bool(FOLLOW.search(t))
    f['CTA comment/ask'] = bool(regex.search(r'תגיבו|בתגובות|תכתבו|תגידו|תשאלו|שאלות|בפרטי|תרשמו|כתבו', t))
    f['CTA tag/send'] = bool(regex.search(r'תייגו|תתייגו|שלחו|תשלחו|שתפו|תשתפו|תראו ל', t))
    f['1sg'] = bool(FIRST_SG_W.search(t)) or any(SG_PAST.search(w) and w not in EXCL_TI for w in ws)
    f['1pl'] = bool(FIRST_PL_W.search(t)) or any(PL_PAST.search(w) for w in ws)
    f['2pl'] = bool(SECOND_PL_W.search(t)) or any(FUT_IMP.search(w) and len(w) >= 4 for w in ws) or bool(FORMAL_IMP.search(t))
    f['2sg fem'] = bool(FEM_SG.search(t)) or bool(FEM_PL.search(t))
    for k, r in LEX.items():
        f['lex:' + k] = bool(r.search(t))
    for k, r in AI.items():
        if r is not None:
            f['ai:' + k] = bool(r.search(t))
    f['_first2'] = ' '.join(ws[:2]); f['_last2'] = ' '.join(ws[-2:])
    return f


for d in TR:
    d['c'] = cap(d['desc'])
for x in own_items:
    x['c'] = cap(x['desc'])
OWN26 = [x for x in own_items if x['date'] >= '2026']

p(f'travel posts {len(TR)}; top {len(TOP)} bot {len(BOT)}; own 2026 posts {len(OWN26)}')
p('\n# NUMERIC median/mean: travel | top | bot | own2026')
for k in ('tags', 'prose_words'):
    p(k, ' | '.join(f'{S.median(g):.0f}/{S.mean(g):.1f}' for g in ([d['c'][k] for d in TR], [d['c'][k] for d in TOP], [d['c'][k] for d in BOT], [x['c'][k] for x in OWN26])))
BOOL = [k for k, v in TR[0]['c'].items() if isinstance(v, bool)]
p('\n# BOOLEAN: travel | top | bot | p | own2026')
for k in BOOL:
    a = sum(d['c'][k] for d in TR); t = sum(d['c'][k] for d in TOP); b = sum(d['c'][k] for d in BOT)
    o = sum(x['c'][k] for x in OWN26)
    pv = fisher_exact([[t, len(TOP) - t], [b, len(BOT) - b]])[1]
    if a or o:
        p(f'{k:34s} {a:4d} ({100*a/len(TR):3.0f}%) | {t:3d} ({100*t/len(TOP):3.0f}%) | {b:3d} ({100*b/len(BOT):3.0f}%) | p={pv:.3f} | own {o}/{len(OWN26)}')
p('\n# TOP HASHTAGS travel')
p(' '.join(f'{t}:{c}' for t, c in C.Counter(t.lower() for d in TR for t in d['c']['_tags']).most_common(60)))
p('\n# TOP CAPTION EMOJI')
p(' '.join(f'{e}{c}' for e, c in C.Counter(e for d in TR for e in d['c']['_em']).most_common(30)))
p('\n# PROSE OPENERS (first 2 words)')
p(' | '.join(f'{w}:{c}' for w, c in C.Counter(d['c']['_first2'] for d in TR if d['c']['prose_words']).most_common(40)))
p('\n# PROSE CLOSERS (last 2 words)')
p(' | '.join(f'{w}:{c}' for w, c in C.Counter(d['c']['_last2'] for d in TR if d['c']['prose_words']).most_common(40)))
p('\n# CAPTION WORDS top vs bot (>=8)')
wt = C.Counter(w for d in TOP for w in set(words(d['c']['prose'])))
wb = C.Counter(w for d in BOT for w in set(words(d['c']['prose'])))
for w in sorted([w for w in (wt + wb) if (wt + wb)[w] >= 8], key=lambda w: -(wt[w] + .5) / (wb[w] + .5)):
    p(f'  {w}: top {wt[w]} bot {wb[w]}')
p('\n# CAPTION WORD FREQ (all travel prose)')
p(' '.join(f'{w}:{c}' for w, c in C.Counter(w for d in TR for w in words(d['c']['prose'])).most_common(200)))
p('\n# SAMPLE PROSE CAPTIONS, top third (verbatim, first 50 with prose)')
for d in [d for d in TOP if d['c']['prose_words']][:60]:
    p(f'  [{d["code"]} {d["score"]:.1f}] {d["desc"][:260]!s}')
p('\n# SAMPLE PROSE CAPTIONS, bottom third')
for d in [d for d in BOT if d['c']['prose_words']][:45]:
    p(f'  [{d["code"]} {d["score"]:.1f}] {d["desc"][:260]!s}')
p('\n# OWN 2026 captions')
for x in OWN26:
    p(f'  [{x["date"]} {x["views"]}] tags={x["c"]["tags"]} prose_words={x["c"]["prose_words"]} :: {x["desc"][:200]}')
