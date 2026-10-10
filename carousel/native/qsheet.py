# Contact sheet of pool candidates for given queries, each labelled with a short
# key (query initials + n) and the first words of the source's own alt text, so
# the subject can be checked against what the photo really shows.
import json, os, sys, textwrap
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.abspath(__file__))
pool = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
out, queries = sys.argv[1], sys.argv[2:]
items = [p for p in pool.values() if p['query'] in queries and os.path.exists(os.path.join(HERE, 'pool', 'thumbs', p['id'] + '.jpg'))]
items.sort(key=lambda p: (queries.index(p['query']), p['id']))
keys = {}
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 17); small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 13)
TW, TH, COLS = 220, 293, 9
rows = (len(items) + COLS - 1) // COLS
s = Image.new('RGB', (COLS * (TW + 6) + 6, rows * (TH + 62) + 6), (20, 20, 20)); d = ImageDraw.Draw(s)
for i, p in enumerate(items):
    k = f'{out[0].upper()}{i}'; keys[k] = p['id']
    im = Image.open(os.path.join(HERE, 'pool', 'thumbs', p['id'] + '.jpg')).convert('RGB'); w, h = im.size
    ch = min(h, round(w * 4 / 3)); t = (h - ch) // 2
    im = im.crop((0, t, w, t + ch)).resize((TW, TH)); x, y = 6 + (i % COLS) * (TW + 6), 6 + (i // COLS) * (TH + 62)
    s.paste(im, (x, y)); d.text((x + 3, y + TH + 2), f"{k} {p['query'][:16]} {'P' if p.get('source')=='pexels' else 'U'}", fill=(255, 230, 0), font=font)
    d.text((x + 3, y + TH + 22), textwrap.shorten(p.get('alt') or '', 60), fill=(200, 200, 200), font=small)
s.save(os.path.join(HERE, 'pool', f'q-{out}.jpg'), quality=82)
json.dump(keys, open(os.path.join(HERE, 'pool', f'q-{out}.json'), 'w'))
print(len(items))
