import sys, statistics as S, collections as C
from scipy.stats import fisher_exact, mannwhitneyu
from features import *

out = open(sys.argv[1] if len(sys.argv) > 1 else 'results.txt', 'w', encoding='utf-8')
def p(*a): print(*a, file=out)

D = load()
CRE = [d for d in D if d['lang'] in ('he', 'mixed') and d['kind'] != 'ad']
TR = [d for d in CRE if d['kind'] == 'travel']
ADS = [d for d in D if d['kind'] == 'ad' and d['lang'] in ('he', 'mixed')]
TOP, BOT = terciles(TR)
own_items, owncov = own()
OWNC = [{'text': x['text'], 'code': 'OWN', 'author': 'hotelmozil'} for x in owncov['travel']]
TR_NOGON = [d for d in TR if d['author'] != 'goneneliyahu']
TOP2, BOT2 = terciles(TR_NOGON)


def feats(text):
    t = clean_text(text)
    ls = lines(t)
    ws = words(t)
    em = emojis(t)
    f = {}
    f['words'] = len(ws)
    f['chars'] = len(t.replace(' / ', ' '))
    f['lines'] = len(ls)
    f['n_emoji'] = len(em)
    f['n_flags'] = sum(is_flag(e) for e in em)
    f['has_emoji'] = len(em) > 0
    f['has_flag'] = f['n_flags'] > 0
    f['emoji_only_line'] = any(l and not words(l) and emojis(l) for l in ls)
    # positions
    pos = C.Counter()
    for l in ls:
        lw = words(l)
        el = emoji.emoji_list(l)
        if not el:
            continue
        if not lw:
            pos['own line'] += len(el); continue
        # index of first and last word char
        first = l.find(lw[0]); last = l.rfind(lw[-1]) + len(lw[-1])
        for e in el:
            if e['match_end'] <= first: pos['start of line'] += 1
            elif e['match_start'] >= last: pos['end of line'] += 1
            else: pos['middle'] += 1
    f['_pos'] = pos
    f['_emojis'] = em
    f['excl'] = bool(EXCL.search(t)); f['excl2+'] = bool(EXCL2.search(t)); f['excl3+'] = bool(EXCL3.search(t))
    f['q'] = bool(Q.search(t)); f['q2+'] = bool(Q2.search(t)); f['?! combo'] = bool(QE.search(t))
    f['ellipsis'] = bool(ELL.search(t))
    f['arrow ascii <<< >>>'] = bool(ARROW_ASCII.search(t)); f['arrow emoji'] = bool(ARROW_EMOJI.search(t))
    f['arrow any'] = bool(ARROW_ANY.search(t))
    f['quote pair'] = bool(QUOTE.search(t)); f['asterisk'] = bool(ASTER.search(t))
    f['spaced hyphen -'] = bool(HYPH_SP.search(t)); f['en dash'] = bool(EN.search(t)); f['em dash'] = bool(EM.search(t))
    f['colon'] = bool(COLON.search(t)); f['comma'] = bool(COMMA.search(t)); f['parens'] = bool(PAREN.search(t))
    f['semicolon'] = bool(SEMI.search(t))
    f['stretched letter (3+)'] = bool(STRETCH.search(t))
    f['any period at line end'] = any(PERIOD_END.search(l) for l in ls)
    f['ends with period'] = bool(ls) and bool(PERIOD_END.search(ls[-1]))
    f['no end punctuation at all'] = bool(ls) and not regex.search(r'[!?.‼…:>]', t)
    f['number/digit'] = bool(NUMBER.search(t))
    f['POV'] = bool(POV.search(t))
    f['latin word'] = any(regex.match(r'[A-Za-z]', w) for w in ws)
    f['latin word (excl. place/handle)'] = False
    # person
    toks = ws
    sg_past = [w for w in toks if SG_PAST.search(w) and w not in EXCL_TI and not w.startswith('תאילנד')]
    f['1sg'] = bool(FIRST_SG_W.search(t)) or bool(sg_past)
    f['1pl'] = bool(FIRST_PL_W.search(t)) or any(PL_PAST.search(w) for w in toks)
    fut = [w for w in toks if FUT_IMP.search(w) and len(w) >= 4]
    f['2pl explicit (אתם/לכם)'] = bool(SECOND_PL_W.search(t))
    f['2pl future-imperative (תשמרו)'] = bool(fut)
    f['2pl formal imperative (שמרו)'] = bool(FORMAL_IMP.search(t))
    f['2pl implicit opener (טסים..?)'] = bool(PRES_PL_ADDR.search(t))
    f['2pl any'] = f['2pl explicit (אתם/לכם)'] or f['2pl future-imperative (תשמרו)'] or f['2pl formal imperative (שמרו)'] or f['2pl implicit opener (טסים..?)']
    f['2sg fem (את)'] = bool(FEM_SG.search(t))
    f['2pl fem (אתן/טסות)'] = bool(FEM_PL.search(t))
    f['2sg masc (אתה)'] = bool(MASC_SG.search(t))
    f['2sg ambiguous (לך/מצאת)'] = bool(SG_AMBIG.search(t))
    f['no person at all'] = not (f['1sg'] or f['1pl'] or f['2pl any'] or f['2sg fem (את)'] or f['2pl fem (אתן/טסות)'] or f['2sg masc (אתה)'] or f['2sg ambiguous (לך/מצאת)'])
    f['שמרו (bare)'] = bool(regex.search(r'(?:^|[\s/*])שמרו(?=$|[\s/!.,])', t))
    f['תשמרו'] = 'תשמרו' in t
    f['CTA save'] = bool(SAVE.search(t)); f['CTA follow'] = bool(FOLLOW.search(t)); f['CTA comment'] = bool(COMMENT.search(t))
    f['CTA send/share'] = bool(SEND.search(t)); f['CTA swipe'] = bool(SWIPE.search(t))
    for k, r in LEX.items():
        f['lex:' + k] = bool(r.search(t))
    for k, r in AI.items():
        if r is not None:
            f['ai:' + k] = bool(r.search(t))
    f['ai:list with commas (3+ commas)'] = t.count(',') >= 3
    f['ai:line ends with period'] = f['any period at line end']
    f['ai:formal imperative (שמרו etc.)'] = f['2pl formal imperative (שמרו)']
    f['_first2'] = ' '.join(ws[:2]); f['_last2'] = ' '.join(ws[-2:]); f['_first1'] = ws[0] if ws else ''
    f['_last1'] = ws[-1] if ws else ''
    return f


for grp in (CRE, ADS, OWNC, D):
    for d in grp:
        d['f'] = feats(d['text'])

BOOL = [k for k, v in CRE[0]['f'].items() if isinstance(v, bool)]
NUM = ['words', 'chars', 'lines', 'n_emoji', 'n_flags']


def rate(g, k): return sum(d['f'][k] for d in g)


def pct(n, N): return f'{100*n/N:.0f}%' if N else '-'


p('# SAMPLE SIZES')
p(f'all coded {len(D)} | creator he/mixed non-ad {len(CRE)} | travel {len(TR)} | ads {len(ADS)} | own travel covers {len(OWNC)}')
p(f'top third {len(TOP)} (score >= {TOP[0]["score"]:.2f}) | bottom third {len(BOT)} (score <= {BOT[-1]["score"]:.2f})')
p(f'authors: travel {len(set(d["author"] for d in TR))}, top {len(set(d["author"] for d in TOP))}, bottom {len(set(d["author"] for d in BOT))}')
p('goneneliyahu in top/bottom:', sum(d['author'] == 'goneneliyahu' for d in TOP), sum(d['author'] == 'goneneliyahu' for d in BOT))

p('\n# NUMERIC (median / mean)  groups: travel | top | bottom | ads | own')
for k in NUM:
    row = []
    for g in (TR, TOP, BOT, ADS, OWNC):
        v = [d['f'][k] for d in g]
        row.append(f'{S.median(v):.0f} / {S.mean(v):.1f}')
    mw = mannwhitneyu([d['f'][k] for d in TOP], [d['f'][k] for d in BOT]).pvalue
    p(f'{k:10s} ' + ' | '.join(row) + f'   MW p(top vs bot)={mw:.3f}')
# distributions
for k in ('words', 'lines'):
    p(f'\n{k} distribution (travel): ' + ', '.join(f'{lo}-{hi}: {sum(lo <= d["f"][k] <= hi for d in TR)}' for lo, hi in ([(1, 3), (4, 6), (7, 9), (10, 12), (13, 16), (17, 25), (26, 999)] if k == 'words' else [(1, 1), (2, 2), (3, 3), (4, 4), (5, 6), (7, 99)])))
    p(f'  top: ' + ', '.join(f'{lo}-{hi}: {sum(lo <= d["f"][k] <= hi for d in TOP)}' for lo, hi in ([(1, 3), (4, 6), (7, 9), (10, 12), (13, 16), (17, 25), (26, 999)] if k == 'words' else [(1, 1), (2, 2), (3, 3), (4, 4), (5, 6), (7, 99)])))
    p(f'  bot: ' + ', '.join(f'{lo}-{hi}: {sum(lo <= d["f"][k] <= hi for d in BOT)}' for lo, hi in ([(1, 3), (4, 6), (7, 9), (10, 12), (13, 16), (17, 25), (26, 999)] if k == 'words' else [(1, 1), (2, 2), (3, 3), (4, 4), (5, 6), (7, 99)])))

p('\n# BOOLEAN FEATURES: travel n(%) | top n(%) | bottom n(%) | ratio top/bot | fisher p | top-no-gon | bot-no-gon | ads % | own n')
rows = []
for k in BOOL:
    t, b = rate(TOP, k), rate(BOT, k)
    t2, b2 = rate(TOP2, k), rate(BOT2, k)
    pv = fisher_exact([[t, len(TOP) - t], [b, len(BOT) - b]])[1]
    ratio = (t + 0.5) / (b + 0.5)
    rows.append((k, rate(TR, k), t, b, ratio, pv, t2, b2, rate(ADS, k), rate(OWNC, k)))
for k, a, t, b, ratio, pv, t2, b2, ad, ow in rows:
    p(f'{k:40s} {a:4d} ({pct(a,len(TR)):>4s}) | {t:3d} ({pct(t,len(TOP)):>4s}) | {b:3d} ({pct(b,len(BOT)):>4s}) | x{ratio:4.2f} | p={pv:.3f} | {t2:3d}/{len(TOP2)} | {b2:3d}/{len(BOT2)} | ads {pct(ad,len(ADS)):>4s} | own {ow}/{len(OWNC)}')

p('\n# EMOJI')
ec = C.Counter(e for d in TR for e in d['f']['_emojis'])
p('total emoji in travel covers', sum(ec.values()), 'distinct', len(ec))
p('top 40:', ' '.join(f'{e}{c}' for e, c in ec.most_common(40)))
ecn = C.Counter(e for d in TR for e in d['f']['_emojis'] if not is_flag(e))
p('top non-flag 30:', ' '.join(f'{e}{c}' for e, c in ecn.most_common(30)))
pos = C.Counter()
for d in TR: pos.update(d['f']['_pos'])
p('positions (all emoji occurrences):', dict(pos))
for nm, g in (('top', TOP), ('bot', BOT)):
    pc = C.Counter()
    for d in g: pc.update(d['f']['_pos'])
    p(f'positions {nm}:', dict(pc))
    p(f'top emoji {nm}:', ' '.join(f'{e}{c}' for e, c in C.Counter(e for d in g for e in d['f']['_emojis']).most_common(20)))
# covers by emoji count
p('emoji count dist travel:', sorted(C.Counter(min(d['f']['n_emoji'], 8) for d in TR).items()))
# same emoji repeated in a row
rep = sum(1 for d in TR if regex.search(r'(\p{Extended_Pictographic}️?)\1', d['text']))
p('covers with the same emoji repeated back-to-back:', rep)
p('ads top emoji:', ' '.join(f'{e}{c}' for e, c in C.Counter(e for d in ADS for e in d['f']['_emojis']).most_common(20)))

p('\n# OPENERS / CLOSERS (travel)')
for key in ('_first1', '_first2', '_last1', '_last2'):
    p(key, ' | '.join(f'{w}:{c}' for w, c in C.Counter(d['f'][key] for d in TR).most_common(40)))
    p('  top:', ' | '.join(f'{w}:{c}' for w, c in C.Counter(d['f'][key] for d in TOP).most_common(20)))
    p('  bot:', ' | '.join(f'{w}:{c}' for w, c in C.Counter(d['f'][key] for d in BOT).most_common(20)))

p('\n# FIRST LINE (exact, travel, normalized: no emoji, collapse spaces) most common')
fl = C.Counter(regex.sub(r'\s+', ' ', emoji.replace_emoji(lines(clean_text(d['text']))[0], '')).strip(' !?') for d in TR if lines(clean_text(d['text'])))
p(' | '.join(f'{w}:{c}' for w, c in fl.most_common(30)))

p('\n# WORD FREQUENCY: top vs bottom (travel), words with >=8 total uses, sorted by ratio')
wt = C.Counter(w for d in TOP for w in set(words(clean_text(d['text']))))
wb = C.Counter(w for d in BOT for w in set(words(clean_text(d['text']))))
allw = wt + wb
items = [(w, wt[w], wb[w], (wt[w] + .5) / (wb[w] + .5)) for w in allw if allw[w] >= 8]
for w, a, b, r in sorted(items, key=lambda x: -x[3]):
    p(f'  {w}: top {a} bot {b} x{r:.2f}')

p('\n# BIGRAMS top vs bottom (>=5 total)')
def bg(g): return C.Counter(bb for d in g for bb in set(zip(words(clean_text(d['text'])), words(clean_text(d['text']))[1:])))
bt, bb_ = bg(TOP), bg(BOT)
allb = bt + bb_
for x in sorted([x for x in allb if allb[x] >= 5], key=lambda x: -((bt[x] + .5) / (bb_[x] + .5))):
    p(f'  {" ".join(x)}: top {bt[x]} bot {bb_[x]}')

p('\n# LATIN WORDS in travel covers')
lat = C.Counter(w for d in TR for w in words(clean_text(d['text'])) if regex.match(r'[A-Za-z]', w))
p(' '.join(f'{w}:{c}' for w, c in lat.most_common(60)))

p('\n# STRETCHED WORDS (3+ repeated letter) all creator covers')
p(' '.join(m.group(0) for d in CRE for m in regex.finditer(r'\p{L}*(\p{L})\1\1+\p{L}*', d['text'])))
p('word-final doubled letter (e.g. בתאילנדד) candidates:')
p(' '.join(sorted(set(w for d in CRE for w in words(d['text']) if len(w) > 3 and w[-1] == w[-2] and w[-1] not in 'וי' and regex.match(r'\p{Hebrew}', w)))))

p('\n# GERSHAYIM / GERESH usage (abbreviations & foreign sounds)')
for lab, r in (('ASCII "', r'\p{Hebrew}"\p{Hebrew}'), ('Hebrew ״', r'\p{Hebrew}״\p{Hebrew}'), ('curly ” mid-word', r'\p{Hebrew}[”“]\p{Hebrew}'),
               ("ASCII '", r"\p{Hebrew}'"), ('Hebrew ׳', r'\p{Hebrew}׳'), ('curly ’', r'\p{Hebrew}’')):
    p(f'  {lab}: {sum(1 for d in CRE if regex.search(r, d["text"]))} covers')

p('\n# AI TELL EXAMPLES (verbatim covers that contain each tell, creator covers incl. non-travel)')
for k in AI:
    hits = [d for d in CRE if d['f'].get('ai:' + k)]
    p(f'\n## {k}: {len(hits)} creator covers ({sum(1 for d in hits if d in TOP)} top / {sum(1 for d in hits if d in BOT)} bottom), ads {sum(1 for d in ADS if d["f"].get("ai:"+k))}/{len(ADS)}; authors {len(set(d["author"] for d in hits))}')
    for d in hits[:6]:
        p(f'   [{d["code"]} {d["author"]} {d.get("score",0):.1f}] {d["text"][:160]}')

p('\n# PERSON EXAMPLES')
for k in ('2sg fem (את)', '2pl fem (אתן/טסות)', '2sg masc (אתה)', '2sg ambiguous (לך/מצאת)', 'POV'):
    p(f'\n## {k}')
    for d in [d for d in CRE if d['f'][k]]:
        p(f'   [{d["code"]} {d["kind"]} {d.get("score",0):.1f}] {d["text"][:150]}')

p('\n# OWN COVERS feature rows')
for d in OWNC:
    f = d['f']
    p(d['text'], {k: v for k, v in f.items() if isinstance(v, bool) and v and not k.startswith(('lex:', 'ai:'))})

import pickle
pickle.dump({'D': D}, open('features.pkl', 'wb'))

p('\n# STYLE CONFOUND')
for st in ('outline', 'plain', 'designed', 'box', 'none'):
    g = [d for d in TR if d['style'] == st]
    p(f'{st}: travel {len(g)} top {sum(d in TOP for d in g)} bot {sum(d in BOT for d in g)} | has_emoji top {sum(d["f"]["has_emoji"] for d in g if d in TOP)}/{sum(d in TOP for d in g)} bot {sum(d["f"]["has_emoji"] for d in g if d in BOT)}/{sum(d in BOT for d in g)} | 2pl explicit top {sum(d["f"]["2pl explicit (אתם/לכם)"] for d in g if d in TOP)} bot {sum(d["f"]["2pl explicit (אתם/לכם)"] for d in g if d in BOT)}')
AIKEYS = ['ai:ביותר (formal superlative)', 'ai:פנינה נסתרת/חבויה', 'ai:גן עדן', 'ai:מרהיב', 'ai:עוצר נשימה', 'ai:חוויה/חוויות', 'ai:אותנטי', 'ai:ייחודי', 'ai:הרפתקה', 'ai:בלתי נשכח', 'ai:גלו (imperative)', 'ai:חשוב לציין/כדאי לדעת', 'ai:triplet "X, Y ו-Z"', 'ai:en dash –', 'ai:em dash —', 'ai:line ends with period', 'ai:ניתן (formal "can")', 'ai:עבור (formal "for")', 'ai:הטוב ביותר/הטובים ביותר', 'ai:list with commas (3+ commas)', 'ai:semicolon ;', 'ai:curly quotes “ ” ’']
for d in TR + ADS:
    d['f']['AI composite (any)'] = any(d['f'].get(k) for k in AIKEYS)
for nm, (a, b) in (('all', (TOP, BOT)), ('no goneneliyahu', (TOP2, BOT2))):
    t, bb = sum(d['f']['AI composite (any)'] for d in a), sum(d['f']['AI composite (any)'] for d in b)
    p(f'AI composite {nm}: top {t}/{len(a)} bot {bb}/{len(b)} p={fisher_exact([[t,len(a)-t],[bb,len(b)-bb]])[1]:.4f}; ads {sum(d["f"]["AI composite (any)"] for d in ADS)}/{len(ADS)}; travel all {sum(d["f"]["AI composite (any)"] for d in TR)}/{len(TR)}')
p('authors of AI-composite travel covers:', C.Counter(d['author'] for d in TR if d['f']['AI composite (any)']).most_common(12))
p('\n# PERIOD END (fixed, excludes ellipsis) examples travel:')
for d in TR:
    if d['f']['any period at line end']:
        p(f'  [{d["code"]} {d["author"]} {d["score"]:.1f}] {d["text"][:130]}')
