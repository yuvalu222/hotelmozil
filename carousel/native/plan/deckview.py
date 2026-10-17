# Big contact sheet of one rendered deck (4 per row, 450x600 each).
#   python native/plan/deckview.py <dir> <out.jpg>
import sys, glob, os
from PIL import Image
d, out = sys.argv[1], sys.argv[2]
fs = sorted(glob.glob(os.path.join(d, '[0-9][0-9].jpg')))
TW, TH, C = 450, 600, 4
R = (len(fs) + C - 1) // C
s = Image.new('RGB', (C * (TW + 6), R * (TH + 6)), (20, 20, 20))
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB'); im.thumbnail((TW, TH))
    s.paste(im, ((i % C) * (TW + 6), (i // C) * (TH + 6)))
s.save(out, quality=88)
