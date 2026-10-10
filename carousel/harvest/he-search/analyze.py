# Hebrew cover wording vs reach (10.10).
#
# Two independent measures, so a finding has to show up in both:
#   W  within-creator: each cover's plays / that creator's median plays, from
#      full profile grids (harvest/grids/<handle>/_grid.json), creators with
#      >= 6 photo posts. Account size and audience are held fixed.
#   S  search cross-section: plays / followers for every Hebrew carousel the
#      photo search returned. Noisier (search favours winners), used only as
#      a second opinion.
# Interval: 95% bootstrap over creators (whole creators resampled).
# Features are derived from the transcribed text by regex, never by eye.
import json, glob, math, os, random, re, sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
GRIDS = os.path.join(HERE, '..', 'grids')
random.seed(1)

coded = {}
for f in glob.glob(os.path.join(HERE, 'coded', '*.jsonl')):
    for line in open(f, encoding='utf-8'):
        line = line.strip()
        if line:
            try:
                d = json.loads(line); coded[d['code']] = d
            except Exception:
                pass
codes = json.load(open(os.path.join(HERE, 'codes.json')))
hits = json.load(open(os.path.join(HERE, 'hits.json'), encoding='utf-8'))
text_by_id = {codes[c]: d for c, d in coded.items() if c in codes}
gcodes_f = os.path.join(HERE, 'grid-codes.json')
gcodes = json.load(open(gcodes_f)) if os.path.exists(gcodes_f) else {}
for f in glob.glob(os.path.join(HERE, 'coded-grid', '*.jsonl')):
    for line in open(f, encoding='utf-8'):
        line = line.strip()
        if line:
            try:
                d = json.loads(line)
                if d.get('code') in gcodes:
                    text_by_id[gcodes[d['code']]['id']] = d
            except Exception:
                pass

PLACES = ('תאילנד|בנגקוק|פוקט|קוסמוי|קופנגן|קוטאו|קו טאו|קופיפי|פי פי|קראבי|צ.יאנג|פאי|יוון|אתונה|כרתים|רודוס|סנטוריני|מיקונוס|כרתים|'
          'קפריסין|לרנקה|פאפוס|לימסול|איה נאפה|רומא|איטליה|מילאנו|פירנצה|ונציה|אמלפי|סיציליה|פריז|צרפת|לונדון|אנגליה|ברצלונה|ספרד|מדריד|'
          'בודפשט|פראג|וינה|אמסטרדם|ברלין|דובאי|אבו דאבי|גאורגיה|טביליסי|בטומי|ניו יורק|אמריקה|יפן|טוקיו|וייטנאם|באלי|מלדיביים|זנזיבר|'
          'סיישל|פיליפינים|אילת|הודו|סרי לנקה|מקסיקו|קולומביה|פרו|ברזיל|דרום אמריקה|טורקיה|איסטנבול|מונטנגרו|קרואטיה|אלבניה|פורטוגל|ליסבון|'
          'אירופה|המזרח|מזרח|שווייץ|אוסטריה|מרוקו|מצרים|סיני|ירדן|אוסטרליה|קנדה|בלגיה|הולנד|גרמניה|מונקו|ניס|קורפו|זקינתוס|חלקידיקי|'
          'סלוניקי|פולין|קרקוב|רומניה|בולגריה|סופיה|בוקרשט|מלטה|איסלנד|נורבגיה|פינלנד|לפלנד|סקוטלנד|אירלנד|קוסטה ריקה|הוואי|לאס וגאס|מיאמי')
F = {
    'number': r'\d|אחד|שתיים|שניים|שלוש|ארבע|חמש|שש|שבע|שמונה|תשע|עשר',
    'place': PLACES,
    'superlative': r'הכי|המושלם|המושלמת|הטוב ביותר|הטובים ביותר|הכי טוב|חובה|מטורף|מטורפים|הכי יפ',
    'secret': r'סוד|סודי|נסתר|לא מכיר|אף אחד לא|לא יודעים|פחות מוכר|לא תיירות|רק מקומיים|שהמקומיים|לא מספר|לא סיפר',
    'warning': r'אסור|אל ת|לא לעשות|טעות|טעויות|להימנע|תיזהרו|תזהרו|זהירות|הונאה|עקיצ',
    'must_not_miss': r'אסור לפספס|חובה|לא לפספס|שווה',
    'question': r'\?',
    'exclaim': r'!',
    'first_person': r'שלי\b|אני\b|אנחנו|שלנו|חסכתי|גיליתי|הייתי|טסתי|עשיתי|למדתי|ידעתי|הלוואי',
    'you': r'אתם|לכם|שלכם|תעשו|תשמרו|תטוסו|טסים',
    'money': r'₪|ש"ח|שקל|יורו|דולר|זול|חינם|חסכ|מחיר|כסף|תקציב|עלות|עולה',
    'part': r'חלק',
    'hotel': r'מלון|מלונות',
    'curiosity': r'ככה|הסיבה|האמת|מה ש|למה|איך|זה מה|הנה',
    'save_cta': r'תשמרו|שמרו|לשמור',
    'time': r'יום|ימים|לילות|שבוע|חודש',
    'before_trip': r'לפני ש|לפני הטיסה|לפני הטיול|לפני שאתם',
    'list_tips': r'טיפ|המלצ|דברים',
    'emoji': r'[\U0001F300-\U0001FAFF☀-➿]',
}
RX = {k: re.compile(v) for k, v in F.items()}

def feats(text):
    t = text or ''
    d = {k: int(bool(r.search(t))) for k, r in RX.items()}
    words = len([w for w in re.split(r'[\s/]+', t) if re.search(r'[א-ת\w]', w)])
    d['words'] = words
    d['short'] = int(0 < words <= 8)
    d['long'] = int(words >= 15)
    d['notext'] = int(words == 0)
    return d

def med(v):
    v = sorted(v); n = len(v)
    return (v[n // 2] + v[(n - 1) // 2]) / 2

def effect(rows, key):
    per = defaultdict(list)
    for c, lv, f in rows:
        if f.get(key):
            per[c].append(lv)
    cs = list(per)
    if len(cs) < 3:
        return None
    vals = [v for c in cs for v in per[c]]
    g = sum(vals) / len(vals)
    bs = []
    for _ in range(2000):
        s = [random.choice(cs) for _ in cs]
        vv = [v for c in s for v in per[c]]
        bs.append(sum(vv) / len(vv))
    bs.sort()
    won = sum(1 for c in cs if sum(per[c]) / len(per[c]) > 0)
    return len(vals), len(cs), won, math.exp(g), math.exp(bs[50]), math.exp(bs[1949])

# ---- W: within-creator from grids --------------------------------------
W = []
grid_creators = 0
for gf in glob.glob(os.path.join(GRIDS, '*', '_grid.json')):
    g = json.load(open(gf, encoding='utf-8'))
    posts = [p for p in g.get('posts', g.get('items', [])) if p.get('kind') == 'photo' and p.get('plays') and not p.get('pinned')]
    posts = [p for p in posts if p['id'] in text_by_id]
    if len(posts) < 6:
        continue
    he = sum(1 for p in posts if re.search(r'[א-ת]', text_by_id[p['id']].get('text', '') + p.get('desc', '')))
    if he < len(posts) / 2:
        continue
    grid_creators += 1
    m = med([p['plays'] for p in posts])
    c = os.path.basename(os.path.dirname(gf))
    for p in posts:
        W.append((c, math.log(p['plays'] / m), feats(text_by_id[p['id']].get('text', ''))))

# ---- S: search cross-section --------------------------------------------
S = []
for iid, d in text_by_id.items():
    h = hits.get(iid)
    if not h or not h.get('followers') or h['followers'] < 200 or not h['plays']:
        continue
    if d.get('kind') == 'ad' or d.get('lang') not in ('he', 'mixed'):
        continue
    S.append((h['author'], math.log(h['plays'] / h['followers']), feats(d.get('text', ''))))
# centre S on its own median so x1 = typical
ms = med([lv for _, lv, _ in S]) if S else 0
S = [(c, lv - ms, f) for c, lv, f in S]

print(f'W: {len(W)} covers from {grid_creators} creators   S: {len(S)} covers from {len(set(c for c,_,_ in S))} creators')
print(f'{"feature":16} {"W within-creator":>44} | {"S plays/followers":>34}')
out = {}
for k in list(F) + ['short', 'long', 'notext']:
    w = effect(W, k); s = effect(S, k)
    out[k] = {'W': w, 'S': s}
    fw = f'n={w[0]:4} cr={w[1]:3} won={w[2]:3} x{w[3]:.2f} [{w[4]:.2f},{w[5]:.2f}]' if w else '-'
    fs = f'n={s[0]:4} x{s[3]:.2f} [{s[4]:.2f},{s[5]:.2f}]' if s else '-'
    print(f'{k:16} {fw:>44} | {fs:>34}')
json.dump(out, open(os.path.join(HERE, 'effects.json'), 'w'), indent=1)
