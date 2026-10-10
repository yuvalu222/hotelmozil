# Numbered contact sheets of the photo pool, grouped by search, so each
# candidate can be judged by eye. Index numbers are stable (pool/index.json).
import json, os, glob
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
pool = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
items = sorted(pool.values(), key=lambda p: (p['query'], -(p.get('likes') or 0)))
items = [p for p in items if os.path.exists(os.path.join(HERE, 'pool', 'thumbs', p['id'] + '.jpg'))]
index = {str(i): p['id'] for i, p in enumerate(items)}
json.dump(index, open(os.path.join(HERE, 'pool', 'index.json'), 'w'))
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
TW, TH, COLS, ROWS = 240, 320, 8, 3
per = COLS * ROWS
for s in range(0, len(items), per):
    chunk = items[s:s + per]
    sheet = Image.new('RGB', (COLS * (TW + 6) + 6, ROWS * (TH + 34) + 6), (25, 25, 25))
    d = ImageDraw.Draw(sheet)
    for k, p in enumerate(chunk):
        i = s + k
        im = Image.open(os.path.join(HERE, 'pool', 'thumbs', p['id'] + '.jpg')).convert('RGB')
        w, h = im.size
        # show the 3:4 centre that a slide would use
        ch = min(h, round(w * 4 / 3)); top = (h - ch) // 2
        im = im.crop((0, top, w, top + ch)).resize((TW, TH))
        x, y = 6 + (k % COLS) * (TW + 6), 6 + (k // COLS) * (TH + 34)
        sheet.paste(im, (x, y))
        cam = 'iPhone' if 'iPhone' in (p.get('camera') or '') else ''
        d.text((x + 4, y + TH + 4), f"{i} {cam} {p['query'][:14]}", fill=(255, 255, 255), font=font)
    sheet.save(os.path.join(HERE, 'pool', f'sheet-{s // per:02d}.jpg'), quality=82)
print(len(items), 'photos,', (len(items) + per - 1) // per, 'sheets')
