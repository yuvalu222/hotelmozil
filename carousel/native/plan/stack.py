# Stack several slot sheets into one image with a label row each.
#   python native/plan/stack.py <out.jpg> <deck> <slot> <slot> ...
import sys, os
from PIL import Image, ImageDraw, ImageFont
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out, deck, slots = sys.argv[1], sys.argv[2], sys.argv[3:]
ims = []
font = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 22)
for s in slots:
    im = Image.open(os.path.join(HERE, 'pool', f's-{deck}-{s}.jpg'))
    lab = Image.new('RGB', (im.width, 30), (60, 0, 80)); ImageDraw.Draw(lab).text((6, 3), s, fill=(255, 255, 255), font=font)
    ims += [lab, im]
W = max(i.width for i in ims); H = sum(i.height for i in ims)
c = Image.new('RGB', (W, H), (10, 10, 10)); y = 0
for i in ims: c.paste(i, (0, y)); y += i.height
c.save(out, quality=84)
print(W, H)
