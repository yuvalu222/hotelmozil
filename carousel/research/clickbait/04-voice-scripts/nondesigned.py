import sys
sys.argv=['x','junk.txt']
exec(open('analyze.py',encoding='utf-8').read())
from scipy.stats import fisher_exact
nd=[d for d in TR if d['style']!='designed']
T,B=terciles(nd)
print('non-designed travel',len(nd),'thirds',len(T))
keys=['has_emoji','emoji_only_line','2pl explicit (אתם/לכם)','lex:המלצ*','lex:חייבים/חייבת','lex:אסור','lex:לפספס','lex:בקרוב','lex:חלק N','AI composite (any)','any period at line end','ai:✨ sparkles','2sg fem (את)','1sg','1pl','excl','q','CTA save','no person at all','arrow any','number/digit','lex:הכי','lex:שווה/שוות/שווים','2pl future-imperative (תשמרו)','2pl formal imperative (שמרו)','2pl implicit opener (טסים..?)','latin word','ellipsis','spaced hyphen -','colon']
for k in keys:
    t=sum(d['f'][k] for d in T); b=sum(d['f'][k] for d in B)
    print(f'{k:35s} top {t:3d} ({100*t/len(T):.0f}%) bot {b:3d} ({100*b/len(B):.0f}%) p={fisher_exact([[t,len(T)-t],[b,len(B)-b]])[1]:.3f}')
import statistics as S
for k in ('words','lines','n_emoji'):
    print(k, S.median(d['f'][k] for d in T), S.mean(d['f'][k] for d in T), S.median(d['f'][k] for d in B), S.mean(d['f'][k] for d in B))
