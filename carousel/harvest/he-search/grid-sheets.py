# Sheets of grid covers (Israeli creators) not already transcribed from search.
# Codes G0001... -> grid-codes.json {code: {"id":..., "creator":...}}
import json, glob, os, random
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
GRIDS = os.path.join(HERE, '..', 'grids')
handles = set(open(os.path.join(HERE, 'grid-handles.txt'), encoding='utf-8').read().split()) | \
          set(open(os.path.join(HERE, 'grid-travel.txt'), encoding='utf-8').read().split())
known = set(json.load(open(os.path.join(HERE, 'codes.json'))).values())
items = []
for h in sorted(handles):
    gf = os.path.join(GRIDS, h, '_grid.json')
    if not os.path.exists(gf):
        continue
    g = json.load(open(gf, encoding='utf-8'))
    for p in g['items']:
        f = os.path.join(GRIDS, h, p['id'] + '.jpg')
        if p.get('kind') == 'photo' and p['id'] not in known and os.path.exists(f):
            items.append((p['id'], h, f))
random.seed(3); random.shuffle(items)
codes = {f'G{i+1:04d}': {'id': i_, 'creator': h} for i, (i_, h, f) in enumerate(items)}
json.dump(codes, open(os.path.join(HERE, 'grid-codes.json'), 'w'), indent=0)
os.makedirs(os.path.join(HERE, 'gsheets'), exist_ok=True)
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 30)
TW, TH, COLS, ROWS = 420, 560, 5, 2
lst = list(zip(codes, items))
for s in range(0, len(lst), COLS * ROWS):
    ch = lst[s:s + COLS * ROWS]
    sh = Image.new('RGB', (COLS * (TW + 8) + 8, ROWS * (TH + 48) + 8), (20, 20, 20)); d = ImageDraw.Draw(sh)
    for k, (code, (_, _, f)) in enumerate(ch):
        im = Image.open(f).convert('RGB'); w, h = im.size
        sc = min(TW / w, TH / h); im = im.resize((round(w * sc), round(h * sc)))
        x, y = 8 + (k % COLS) * (TW + 8), 8 + (k // COLS) * (TH + 48)
        sh.paste(im, (x + (TW - im.size[0]) // 2, y))
        d.text((x + 6, y + TH + 6), code, fill=(255, 230, 0), font=font)
    sh.save(os.path.join(HERE, 'gsheets', f'GS{s // (COLS * ROWS) + 1:03d}.jpg'), quality=88)
print(len(lst), 'covers,', (len(lst) + 9) // 10, 'sheets')
