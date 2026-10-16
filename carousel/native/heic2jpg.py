# Pinterest "originals" are sometimes iPhone HEIC saved under .jpg (16.10):
# Chrome and PIL cannot read them, so the render dies. Re-save as real JPEG.
#   python native/heic2jpg.py      (fetch-picks.mjs runs it after downloading)
import glob, os
import pillow_heif
from PIL import Image
pillow_heif.register_heif_opener()
HERE = os.path.dirname(os.path.abspath(__file__))
for d in ('full', 'full2x'):
    for f in glob.glob(os.path.join(HERE, 'pool', d, '*.jpg')):
        with open(f, 'rb') as fh:
            head = fh.read(12)
        if head[4:8] == b'ftyp':
            im = Image.open(f).convert('RGB'); im.save(f, quality=95); print('heic -> jpg', os.path.basename(f), im.size)
