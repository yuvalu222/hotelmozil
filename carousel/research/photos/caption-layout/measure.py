# Measure rendered photo edges in each screenshot by pixels, and compare with
# the geometry implied by the DOM (object-fit: contain of natural size in box).
# Usage: python -I measure.py mobile.jsonl shots_dir
import json, sys, os
from PIL import Image
recs = [json.loads(l) for l in open(sys.argv[1], encoding='utf8') if l.strip()]
SH = sys.argv[2]
def contain(box, nat):
    x, y, w, h = box; nw, nh = nat
    s = min(w / nw, h / nh); rw, rh = nw * s, nh * s
    return [x + (w - rw) / 2, y + (h - rh) / 2, rw, rh]
def pixel_edges(png, box, dpr=3):
    im = Image.open(png).convert('L')
    x, y, w, h = [v * dpr for v in box]
    # middle column strip, avoid side rail: use columns 10%..60% of width
    xs = range(int(x + w * 0.10), int(x + w * 0.60), 6)
    rows = []
    for yy in range(int(y), int(y + h)):
        vals = [im.getpixel((xx, yy)) for xx in xs]
        rows.append(max(vals) - min(vals) > 12 or sum(vals) / len(vals) > 30)
    # first/last row that has content (not flat black letterbox)
    top = next((i for i, r in enumerate(rows) if r), None)
    bot = next((i for i, r in enumerate(reversed(rows)) if r), None)
    return (None if top is None else round((y + top) / dpr), None if bot is None else round((y + h - bot) / dpr))
print('tag|vp|vpH|descLen|lines(col)|img box|nat|rendered top..bottom (DOM)|pixel top..bottom|caption block top..bottom|overlap px of caption over photo|expanded lines|img box expanded')
for r in recs:
    c = r['collapsed']; e = r.get('expanded') or {}
    if not c.get('img'): continue
    rend = contain(c['img']['box'], c['img']['nat'])
    png = os.path.join(SH, f"{r['tag']}-{r['vp']}-a.png")
    px = pixel_edges(png, c['img']['box']) if os.path.exists(png) else (None, None)
    capTop = min([b[1] for b in [c.get('user'), c.get('desc')] if b] or [None]) if (c.get('user') or c.get('desc')) else None
    capBot = (c['music'][1] + c['music'][3]) if c.get('music') else None
    ov = None if capTop is None else max(0, round(rend[1] + rend[3] - capTop))
    eb = e.get('img', {}).get('box') if e.get('img') else None
    print('|'.join(str(v) for v in [r['tag'], r['vp'], r['vpSize']['height'], r['descLen'], c.get('descLines'), c['img']['box'], c['img']['nat'],
          f"{rend[1]:.0f}..{rend[1]+rend[3]:.0f}", f"{px[0]}..{px[1]}", f"{capTop}..{capBot}", ov, e.get('descLines'), eb]))
