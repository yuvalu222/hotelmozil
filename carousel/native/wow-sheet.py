# Top-N candidates by WOW score for a slot, big enough to judge by eye.
#   python native/wow-sheet.py <name> <N> "<query>" "<query>" ...
# wow = z(aes) + z(awe) within the pool; hard gates first: portrait-ish and
# >= 1440x1920 at full resolution (fetchable), not already used by a live deck.
import json, os, sys, statistics as st
from PIL import Image, ImageDraw, ImageFont
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
pool = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
wow = json.load(open(os.path.join(HERE, 'pool', 'wow.json')))
name, N, queries = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
A = [v['aes'] for v in wow.values()]; W = [v['awe'] for v in wow.values()]
ma, sa, mw, sw = st.mean(A), st.pstdev(A), st.mean(W), st.pstdev(W)
z = lambda i: (wow[i]['aes'] - ma) / sa + (wow[i]['awe'] - mw) / sw
def big_enough(p):
    w, h = p.get('w'), p.get('h')
    if not w or not h: return True   # Pexels: size unknown, fetch decides
    return w >= 1400 and h >= 1800 and h / w >= 1.1
c = [i for i, p in pool.items() if p['query'] in queries and i in wow and big_enough(p)]
c.sort(key=lambda i: -z(i))
c = c[:N]
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
TW, TH, COLS = 340, 453, 6
rows = (len(c) + COLS - 1) // COLS
s = Image.new('RGB', (COLS * (TW + 6), rows * (TH + 30)), (15, 15, 15)); d = ImageDraw.Draw(s)
keys = {}
for k, i in enumerate(c):
    im = Image.open(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg')).convert('RGB'); w, h = im.size
    ch = min(h, round(w * 4 / 3)); t = (h - ch) // 2
    im = im.crop((0, t, w, t + ch)).resize((TW, TH)); x, y = (k % COLS) * (TW + 6), (k // COLS) * (TH + 30)
    s.paste(im, (x, y)); key = f'{name[:2].upper()}{k}'; keys[key] = i
    d.text((x + 4, y + TH + 3), f"{key}  {z(i):.1f}  {pool[i]['source'][:3]}", fill=(255, 230, 0), font=font)
s.save(os.path.join(HERE, 'pool', f'w-{name}.jpg'), quality=85)
json.dump(keys, open(os.path.join(HERE, 'pool', f'w-{name}.json'), 'w'))
print(len(c), 'shown of', sum(1 for i, p in pool.items() if p['query'] in queries))
