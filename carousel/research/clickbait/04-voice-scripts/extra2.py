import sys
sys.argv=['x','junk.txt']
exec(open('analyze.py',encoding='utf-8').read())
from scipy.stats import fisher_exact
def fx(name, fn, groups=((TOP,BOT),)):
    for a,b in groups:
        t=sum(1 for d in a if fn(d)); bb=sum(1 for d in b if fn(d))
        print(f'{name}: top {t}/{len(a)} bot {bb}/{len(b)} p={fisher_exact([[t,len(a)-t],[bb,len(b)-bb]])[1]:.3f}')
fx('first line is a question', lambda d: lines(clean_text(d['text'])) and '?' in lines(clean_text(d['text']))[0])
fx('first word המלצות', lambda d: d['f']['_first1']=='המלצות')
fx('first word טסים', lambda d: d['f']['_first1'] in ('טסים','טסות','טסה'))
fx('emoji at START of a line', lambda d: d['f']['_pos'].get('start of line',0)>0)
fx('emoji at END of a line', lambda d: d['f']['_pos'].get('end of line',0)>0)
fx('emoji on OWN line', lambda d: d['f']['_pos'].get('own line',0)>0)
fx('flag emoji', lambda d: d['f']['has_flag'])
fx('3+ emoji', lambda d: d['f']['n_emoji']>=3)
fx('1-2 emoji', lambda d: 1<=d['f']['n_emoji']<=2)
fx('5+ lines', lambda d: d['f']['lines']>=5)
fx('17+ words', lambda d: d['f']['words']>=17)
fx('<=9 words', lambda d: d['f']['words']<=9)
fx('number at start', lambda d: regex.match(r'\d', lines(clean_text(d['text']))[0] if lines(clean_text(d['text'])) else ''))
fx('place name in cover (any of PLACES list) proxy: ל/ב+capital?', lambda d: False)
fx('style designed', lambda d: d['style']=='designed')
fx('style outline', lambda d: d['style']=='outline')
# distribution of emoji per cover among covers that have emoji
import statistics as S
print('median emoji per cover among covers with emoji: top', S.median([d['f']['n_emoji'] for d in TOP if d['f']['n_emoji']]), 'bot', S.median([d['f']['n_emoji'] for d in BOT if d['f']['n_emoji']]))
print('emoji-only line lengths (count of emoji on own line):', C.Counter(min(len(emojis(l)),8) for d in TR for l in lines(clean_text(d['text'])) if not words(l) and emojis(l)))
