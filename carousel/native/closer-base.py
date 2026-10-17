# The closing slide's background (17.10): his own "Travel" folder screenshot
# with the old one-liner taken out of the folder, so the closer can explain
# what the app does instead (owner: "explain what it is, not just 'it saved
# me money'"). The folder glass is a smooth gradient, so each column of the
# text area is refilled by blending the rows just above and below it.
# Cropped to the 3:4 canvas every other slide uses.
#   python native/closer-base.py
import os
import numpy as np
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'harvest', 'own-full', '7681254316103027989', '06.jpg')
OUT = os.path.join(HERE, 'assets', 'closer-base.jpg')

a = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)  # 1182x2104
X0, X1, Y0, Y1 = 150, 1035, 880, 1215  # the old text and its emoji, inside the folder
top = a[Y0 - 6:Y0].mean(axis=0)[X0:X1]
bot = a[Y1:Y1 + 6].mean(axis=0)[X0:X1]
k = np.linspace(0, 1, Y1 - Y0)[:, None, None]
a[Y0:Y1, X0:X1] = top[None] * (1 - k) + bot[None] * k
im = Image.fromarray(a.clip(0, 255).astype(np.uint8))
# soften the seams of the refill only
patch = im.crop((X0 - 20, Y0 - 20, X1 + 20, Y1 + 20)).filter(ImageFilter.GaussianBlur(8))
im.paste(patch.crop((20, 20, patch.width - 20, patch.height - 20)), (X0, Y0))
# 3:4 crop that keeps the "Travel" title and the whole folder
im = im.crop((0, 150, 1182, 150 + 1576)).resize((1440, 1920), Image.LANCZOS)
im.save(OUT, quality=95)
print(OUT)
