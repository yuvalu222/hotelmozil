# Eye-review sheet for one slot of a planned deck: every candidate from that
# slot's queries (both waves), WOW-sorted where scored, minus photos any live
# deck already uses (by id and by look-alike hash), labelled with size.
#   python native/plan/slot-sheet.py <deck> <slot> [extra query substrings...]
# Out: native/pool/s-<deck>-<slot>.jpg + .json (key -> pool id)
import json, os, sys, glob, statistics as st
from PIL import Image, ImageDraw, ImageFont
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pool = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
for f in glob.glob(os.path.join(HERE, 'pool', 'side-*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items(): pool.setdefault(k, v)
wow = json.load(open(os.path.join(HERE, 'pool', 'wow.json')))
NEW = '--new' in sys.argv
args = [a for a in sys.argv[1:] if a != '--new']
deck, slot, extra = args[0], args[1], [x.lower() for x in args[2:]]
SEEN = os.path.join(HERE, 'pool', f's-{deck}-{slot}.seen.json')
seen_ids = set(json.load(open(SEEN))) if os.path.exists(SEEN) else set()
qs = set()
for qf in ('queries.json', 'queries2.json', 'queries3.json'):
    p = os.path.join(HERE, 'plan', qf)
    if os.path.exists(p):
        qs.update(q.lower() for q in json.load(open(p, encoding='utf-8')).get(deck, {}).get(slot, []))

HC = os.path.join(HERE, 'pool', 'ahash.json')
hcache = json.load(open(HC)) if os.path.exists(HC) else {}
def ahash(path):
    k = os.path.basename(path)
    if k not in hcache:
        im = Image.open(path).convert('L').resize((12, 16))
        px = list(im.tobytes()); m = sum(px) / len(px)
        hcache[k] = sum(1 << i for i, x in enumerate(px) if x > m)
    return hcache[k]

used = set()
for f in glob.glob(os.path.join(HERE, 'decks', '*.json')):
    if os.path.basename(f).startswith(deck): continue
    for s in json.load(open(f, encoding='utf-8'))['slides']:
        if 'photo' in s: used.add(os.path.splitext(os.path.basename(s['photo']))[0])
picks = json.load(open(os.path.join(HERE, 'picks.json'), encoding='utf-8'))
def walk(v):
    if isinstance(v, dict):
        if 'id' in v: yield v['id']
        for x in v.values(): yield from walk(x)
    elif isinstance(v, list):
        for x in v: yield from walk(x)
for d, v in picks.items():
    if d != deck: used.update(walk(v))
uh = [ahash(os.path.join(HERE, 'pool', 'thumbs', u + '.jpg')) for u in used if os.path.exists(os.path.join(HERE, 'pool', 'thumbs', u + '.jpg'))]
near = lambda h: any(bin(h ^ x).count('1') < 22 for x in uh)

A = [v['aes'] for v in wow.values()]; W = [v['awe'] for v in wow.values()]
ma, sa, mw, sw = st.mean(A), st.pstdev(A), st.mean(W), st.pstdev(W)
z = lambda i: ((wow[i]['aes'] - ma) / sa + (wow[i]['awe'] - mw) / sw) if i in wow else -9
c = [i for i, p in pool.items() if (p.get('query') or '').lower() in qs or any(e in (p.get('query') or '').lower() for e in extra)]
c = [i for i in c if i not in used and os.path.exists(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg'))]
c = [i for i in c if not near(ahash(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg')))]
# own duplicates (same photo pinned twice): keep the larger
seen = []; keep = []
for i in sorted(c, key=lambda i: -(pool[i].get('w') or 0)):
    h = ahash(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg'))
    if any(bin(h ^ x).count('1') < 14 for x in seen): continue
    seen.append(h); keep.append(i)
c = sorted(keep, key=lambda i: -z(i))
if NEW: c = [i for i in c if i not in seen_ids]
c = c[:120]
json.dump(sorted(seen_ids | set(c)), open(SEEN, 'w'))
# floor mark vs the copied source deck (qa-photos.py): o = passes, ~ = passes with the capped lift, X = cannot
sys.path.insert(0, HERE)
from importlib import import_module
qa = import_module('qa-photos')
import numpy as np
FL = None
if deck in qa.SOURCES:
    src = sorted(glob.glob(os.path.join(HERE, '..', qa.SOURCES[deck], '[0-9][0-9].jpg')))[:-1]
    FL = np.array([qa.measure(f) for f in src]).min(0) * 1.01
def mark(i):
    if FL is None: return ''
    f = os.path.join(HERE, 'pool', 'thumbs', i + '.jpg')
    for b, sa, m in ((1, 1, 'o'), (1.1, 1.15, '~'), (1.2, 1.35, '~')):
        v, s_, c_ = qa.measure(f, b, sa)
        if v >= FL[0] and s_ >= FL[1] and c_ >= FL[2]: return m
    return 'X'
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 15)
TW, TH, COLS = 190, 253, 10
rows = (len(c) + COLS - 1) // COLS
s = Image.new('RGB', (COLS * (TW + 4), max(1, rows) * (TH + 20)), (15, 15, 15)); d = ImageDraw.Draw(s)
keys = {}
for k, i in enumerate(c):
    im = Image.open(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg')).convert('RGB'); w, h = im.size
    ch = min(h, round(w * 4 / 3)); t = (h - ch) // 2
    im = im.crop((0, t, w, t + ch)).resize((TW, TH)); x, y = (k % COLS) * (TW + 4), (k // COLS) * (TH + 20)
    s.paste(im, (x, y)); key = f'{k}'; keys[key] = i
    p = pool[i]
    mk = mark(i); small = (p.get('w') or 9999) < 1300 or (p.get('h') or 9999) < 1740
    d.text((x + 3, y + TH + 1), f"{k} {mk} {p.get('w')}x{p.get('h')}", fill=(255, 60, 60) if mk == 'X' or small else (255, 230, 0), font=font)
out = os.path.join(HERE, 'pool', f's-{deck}-{slot}')
s.save(out + '.jpg', quality=84)
json.dump(keys, open(out + '.json', 'w'))
json.dump(hcache, open(HC, 'w'))
print(len(c), 'candidates ->', out + '.jpg')
