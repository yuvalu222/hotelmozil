# Enlarge chosen keys from a q-sheet for an eye decision: python native/big.py <sheet> K1 K2 ...
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
sheet, keys = sys.argv[1], sys.argv[2:]
k = json.load(open(os.path.join(HERE, 'pool', f'q-{sheet}.json'))); p = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26)
TW, TH, C = 420, 560, min(6, len(keys)); R = (len(keys) + C - 1) // C
s = Image.new('RGB', (C * (TW + 6), R * (TH + 34)), (15, 15, 15)); d = ImageDraw.Draw(s)
for n, key in enumerate(keys):
    i = k[key]; im = Image.open(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg')).convert('RGB'); w, h = im.size
    ch = min(h, round(w * 4 / 3)); t = (h - ch) // 2
    im = im.crop((0, t, w, t + ch)).resize((TW, TH)); x, y = (n % C) * (TW + 6), (n // C) * (TH + 34); s.paste(im, (x, y))
    d.text((x + 4, y + TH + 4), f"{key} {p[i].get('w')}x{p[i].get('h')}", fill=(255, 230, 0), font=font)
s.save(os.path.join(HERE, 'pool', '_big.jpg'), quality=88)
