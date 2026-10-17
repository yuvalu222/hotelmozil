# Full-resolution check of finalists (AI artefacts, sharpness, subject):
# downloads the original once into pool/full/<id>.jpg (the file render.mjs
# uses) and writes pool/_look.jpg = the whole frame + two 100% crops per photo.
#   python native/plan/look.py <deck> <slot> <key> [<slot> <key> ...]
import json, os, sys, glob, urllib.request, io
from PIL import Image, ImageDraw, ImageFont
try:
    import pillow_heif; pillow_heif.register_heif_opener()
except Exception: pass
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pool = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
for f in glob.glob(os.path.join(HERE, 'pool', 'side-*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items(): pool.setdefault(k, v)
deck, rest = sys.argv[1], sys.argv[2:]
pairs = list(zip(rest[0::2], rest[1::2]))
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 26)
tiles = []
for slot, key in pairs:
    i = json.load(open(os.path.join(HERE, 'pool', f's-{deck}-{slot}.json')))[key] if not key.startswith(('pin-', 'pexels-', 'unsplash')) and len(key) < 6 else key
    p = pool[i]; dst = os.path.join(HERE, 'pool', 'full', i + '.jpg')
    if not os.path.exists(dst):
        src = p['raw'] if p.get('source') == 'pinterest' else (p['raw'] + '?auto=compress&cs=tinysrgb&w=3000' if p.get('source') == 'pexels' else p['raw'] + '&w=3000&fm=jpg&q=90')
        data = urllib.request.urlopen(urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0 Chrome/152.0'}), timeout=60).read()
        im = Image.open(io.BytesIO(data)).convert('RGB'); im.save(dst, quality=95)
    im = Image.open(dst).convert('RGB'); W, H = im.size
    whole = im.copy(); whole.thumbnail((600, 800))
    c1 = im.crop((W // 2 - 300, H // 2 - 400, W // 2 + 300, H // 2 + 400))
    c2 = im.crop((W // 2 - 300, H // 4 - 400 if H // 4 > 400 else 0, W // 2 + 300, (H // 4 + 400) if H // 4 > 400 else 800))
    t = Image.new('RGB', (600 * 3 + 20, 840), (20, 20, 20)); d = ImageDraw.Draw(t)
    t.paste(whole, (0, 36)); t.paste(c1, (610, 36)); t.paste(c2, (1220, 36))
    d.text((6, 4), f'{slot} {key} {W}x{H} {i[:28]}', fill=(255, 230, 0), font=font)
    tiles.append(t)
out = Image.new('RGB', (tiles[0].width, sum(x.height for x in tiles)))
y = 0
for x in tiles: out.paste(x, (0, y)); y += x.height
out.save(os.path.join(HERE, 'pool', '_look.jpg'), quality=86)
print('ok', len(tiles))
