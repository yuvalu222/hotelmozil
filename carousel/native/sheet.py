# Contact sheet of one rendered deck, slide 1 on the right like TikTok's RTL swipe order
# is not needed: slide 1 at left, in posting order.
import sys, os, glob
from PIL import Image, ImageDraw, ImageFont
deck = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
fs = sorted(glob.glob(os.path.join(HERE, 'out', deck, '[0-9][0-9].jpg')))
TW = int(sys.argv[2]) if len(sys.argv) > 2 else 360
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
th = [Image.open(f).convert('RGB') for f in fs]
th = [t.resize((TW, round(TW * t.size[1] / t.size[0]))) for t in th]
rows = [th[i:i + cols] for i in range(0, len(th), cols)]
H = sum(max(t.size[1] for t in r) + 8 for r in rows) + 8
s = Image.new('RGB', ((TW + 8) * cols + 8, H), (20, 20, 20))
y = 8
for r in rows:
    for i, t in enumerate(r): s.paste(t, (8 + i * (TW + 8), y))
    y += max(t.size[1] for t in r) + 8
s.save(os.path.join(HERE, 'out', deck, 'sheet.jpg'), quality=85)
