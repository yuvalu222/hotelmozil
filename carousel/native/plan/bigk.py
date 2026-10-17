# Enlarge chosen sheet keys: python native/plan/bigk.py <deck> <slot> k k k ...  (or slot:key pairs with --mix)
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
deck = sys.argv[1]; args = sys.argv[2:]
if args[0] == '--mix': pairs = [a.split(':') for a in args[1:]]
else: pairs = [(args[0], k) for k in args[1:]]
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26)
TW, TH, C = 400, 533, min(5, len(pairs)); R = (len(pairs) + C - 1) // C
s = Image.new('RGB', (C * (TW + 6), R * (TH + 34)), (15, 15, 15)); d = ImageDraw.Draw(s)
for n, (slot, key) in enumerate(pairs):
    i = json.load(open(os.path.join(HERE, 'pool', f's-{deck}-{slot}.json')))[key]
    im = Image.open(os.path.join(HERE, 'pool', 'thumbs', i + '.jpg')).convert('RGB'); w, h = im.size
    ch = min(h, round(w * 4 / 3)); t = (h - ch) // 2
    im = im.crop((0, t, w, t + ch)).resize((TW, TH)); x, y = (n % C) * (TW + 6), (n // C) * (TH + 34); s.paste(im, (x, y))
    d.text((x + 4, y + TH + 4), f"{slot} {key}", fill=(255, 230, 0), font=font)
s.save(os.path.join(HERE, 'pool', '_big.jpg'), quality=88)
