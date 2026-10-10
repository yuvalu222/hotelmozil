from load import *
import collections as C
from scipy.stats import fisher_exact
D=load()
CRE=[d for d in D if d['lang'] in('he','mixed') and d['kind']!='ad']
TR=[d for d in CRE if d['kind']=='travel']
TOP,BOT=terciles(TR)
def cnt(rx, field='text', grp=CRE):
    r=regex.compile(rx); h=[d for d in grp if r.search(d[field] if field=='text' else d['desc'])]
    return h
print('== spelling variants (covers, creator)')
for lab,rx in [('וייטנאם',r'וייטנאם'),('ויאטנם/ויטנאם/וייאטנם/ויאטנאם',r'ויאטנם|ויטנאם|וייאטנם|ויאטנאם|ויטנם'),
  ('prefix glued to digit ב5/מ100',r'(?:^|\s)[בלמהו]\d'),('prefix hyphen ב-5',r'(?:^|\s)[בלמהו]-\d'),
  ('שאתם מגיעים (ש for כש)',r'(?:^|\s)שאתם מגיעים'),('כשאתם',r'כשאתם'),('סירטון',r'סירטון'),('סרטון',r'סרטון'),
  ('הינה (=הנה)',r'(?:^|\s)הינה'),('אותכם',r'אותכם'),('בעייני',r'בעייני'),('בעיניי',r'בעיניי'),('להזהר',r'להזהר'),
  ('חול (=חו"ל)',r'(?:^|\s)(?:ל|ב)?חול(?=\s|$|!)'),('חו"ל any',r'חו["״”]ל'),('₪ sign',r'₪'),('ש"ח/שח',r'ש["״]?ח'),
  ('כ"כ/כלכך',r'כ["״]כ|כלכך'),('POV/pov/פוב',r'(?i)pov|פוב'),('emoji ✨ wrap ✨X✨',r'✨[^✨/]{2,30}✨')]:
    h=cnt(rx); print(f'{lab}: {len(h)} covers |', ' || '.join(d['text'][:60] for d in h[:3]))
print('== same captions (travel desc)')
for lab,rx in [('X קוראת/קורא לכם',r'קורא(?:ת|ים)? לכם'),('ברוכים הבאים',r'ברוכים הבאים'),('X הוא/היא אחד ה',r'(?:הוא|היא|זה|זהו) (?:אחד|אחת) (?:ה|מה)'),
  ('זהו/זוהי',r'(?:^|\s)(?:זהו|זוהי)\s'),('ריכזנו/הכנו עבורכם',r'עבורכם'),('מחכים לכם/מחכה לכם',r'מחכ(?:ים|ה|ות) לכם'),('נחשף/הסוד',r'נחשף|הסוד'),
  ('שיגרמו לכם/שתגרום',r'שיגרמו|שתגרום|יגרמו לכם'),('בין אם',r'בין אם'),('לא רק',r'לא רק'),('em dash —',r'—'),('en dash –',r'–'),('… unicode ellipsis',r'…'),('curly ’',r'’'),
  ('numbered list 1. 2.',r'(?:^|\s)1\.\s.*2\.\s'),('keycap 1️⃣',r'1️⃣'),('"אף אחד לא מספר"',r'אף אחד לא (?:מספר|יספר|יגיד)'),('אחי',r'(?:^|\s)אחי(?=\s|,|$)')]:
    h=cnt(rx,'desc',TR); t=sum(d in TOP for d in h); b=sum(d in BOT for d in h)
    print(f'{lab}: {len(h)} captions (top {t} / bot {b}) authors {len(set(d["author"] for d in h))} |', ' || '.join(regex.sub(r'\s+',' ',d['desc'])[:90] for d in h[:2]))
# caption AI-voice composite: prose with >=2 of the tells
tells=[r'קורא(?:ת|ים)? לכם',r'ברוכים הבאים',r'(?:הוא|היא|זה|זהו) (?:אחד|אחת) (?:ה|מה)',r'(?:^|\s)(?:זהו|זוהי)\s',r'עבורכם',r'מחכ(?:ים|ה|ות) לכם',r'נחשף',r'שיגרמו|שתגרום',r'בין אם',r'לא רק',r'—',r'–',r'מרהיב',r'עוצר\S* נשימה',r'קסומ|קסום',r'חווי',r'ביותר',r'מושלמ\S* למי ש',r'גן עדן',r'פנינ',r'אותנטי',r'בלתי נשכח',r'מדריך',r'\p{L}+, \p{L}+(?: \p{L}+)? ו-?\p{L}+']
def ntell(s): return sum(bool(regex.search(t,s)) for t in tells)
for th in (1,2,3):
    t=sum(ntell(d['desc'])>=th for d in TOP); b=sum(ntell(d['desc'])>=th for d in BOT); a=sum(ntell(d['desc'])>=th for d in TR)
    print(f'captions with >= {th} AI tells: all {a}/{len(TR)} top {t} bot {b} p={fisher_exact([[t,240-t],[b,240-b]])[1]:.4f}')
# stretched words in captions
print('caption stretched:', ' '.join(m.group(0) for d in TR for m in regex.finditer(r'\p{L}*(\p{L})\1\1+\p{L}*',d['desc']))[:600])
# first-person opening line types
print('== covers whose first line is a question:', sum(1 for d in TR if '?' in lines(clean_text(d['text']))[0]) if TR else 0)
for g,n in ((TOP,'top'),(BOT,'bot')):
    print(n,'first line question', sum(1 for d in g if lines(clean_text(d['text'])) and '?' in lines(clean_text(d['text']))[0]))
# lines ending pattern: does line break split mid-phrase? measure share of multi-line covers where a line ends with a preposition/function word
FW=set('של את על עם ב ל מ לכם שאתם שאסור כל הכי לפני אם מה מי שלא אתם'.split())
ml=[d for d in TR if len(lines(clean_text(d['text'])))>=2]
mid=[d for d in ml if any((words(l) and words(l)[-1] in FW) for l in lines(clean_text(d['text']))[:-1])]
print('multi-line covers',len(ml),'with a line that ends on a function word (mid-phrase break):',len(mid), ' e.g.', ' || '.join(d['text'][:50] for d in mid[:6]))
