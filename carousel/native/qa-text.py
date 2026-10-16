# Text safe-zone gate (16.10, research/photos/02-caption-layout.md).
# In the TikTok app a description longer than ~1 line switches photo posts to a
# top-anchored 3:4 box with a like/comment rail on the right. For a 3:4 slide
# (1440x1920) slide text must stay in y 200-1700, x 70-1250.
#   python native/qa-text.py native/out/<deck>[-4k] ...
import sys, glob
import numpy as np
from PIL import Image
from scipy import ndimage as nd
bad = 0
for d in sys.argv[1:]:
    for f in sorted(glob.glob(d + '/[0-9][0-9].jpg')):
        im = Image.open(f).convert('RGB')
        if abs(im.size[1] / im.size[0] - 4 / 3) > 0.02: continue   # his folder screenshot, not ours
        a = np.asarray(im.resize((1440, 1920))).astype(int)
        m = (a.min(2) > 225) & nd.binary_dilation(a.max(2) < 45, iterations=3)
        ys, xs = np.where(nd.binary_opening(m, iterations=1))
        if not len(ys): continue
        y0, y1, x0, x1 = (np.percentile(ys, 0.5), np.percentile(ys, 99.5), np.percentile(xs, 0.5), np.percentile(xs, 99.5))
        if y0 < 200 or y1 > 1700 or x0 < 70 or x1 > 1250:
            bad += 1; print('TEXT OUTSIDE SAFE ZONE', f, f'y {y0:.0f}-{y1:.0f} x {x0:.0f}-{x1:.0f}')
print('text safe-zone issues:', bad)
sys.exit(1 if bad else 0)
