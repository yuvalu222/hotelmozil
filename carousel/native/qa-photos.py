# Photo-quality gate (13.10, owner: "do you notice the quality difference?").
# For every deck, measures each slide's photo against the deck it copies:
#   V  = mean brightness (HSV value, 0-1)
#   S  = mean saturation
#   C  = colourfulness (Hasler & Suesstrunk 2003)
# A slide FAILS when any measure is below the lowest value among the source's
# photo slides (the closer / folder screenshot excluded on both sides).
# Measured on the raw photo, not the rendered slide, so our text doesn't count.
#   python native/qa-photos.py            all decks
import json, os, glob, sys
import numpy as np
from PIL import Image, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
CAR = os.path.join(HERE, '..')
SOURCES = {
    'd1-tips-part2': 'harvest/own-full/7675637726456073493',
    'd2-transport-part2': 'harvest/own-full/7678361608925482261',
    'd3-forbidden': 'harvest/own-full/7676865634118110484',
    'd4-route-andaman': 'harvest/own-full/7680247925468957972',
    'd4-route-main': 'harvest/own-full/7680247925468957972',
    'd5-places': 'harvest/own-full/7677199779247508757',
    'e1-traps': 'harvest/sources/travel.destinations7-7536621547851631904',
    'e2-islands': 'harvest/sources/berigold-7536886752477285654',
    'e3-hotel': 'harvest/sources/architinerary-7626837497342954774',
    'e4-not-tourist': 'harvest/sources/italianinspo-7436610520557440287',
    'e5-photospots': 'harvest/sources/travellingcloset1-7533911575296527638',
    'g1-seven-eleven': 'harvest/own-full/7682476408320380180',  # his own 7-Eleven post
}

def measure(path, bright=1, sat=1):
    im = Image.open(path).convert('RGB'); im.thumbnail((400, 400))
    if bright != 1:
        im = ImageEnhance.Brightness(im).enhance(bright)  # the slide's own exposure lift (render.mjs)
    if sat != 1:
        im = ImageEnhance.Color(im).enhance(sat)  # the slide's own saturation lift (render.mjs, CSS saturate)
    a = np.asarray(im).astype(float)
    hsv = np.asarray(im.convert('HSV')).astype(float) / 255
    rg = a[..., 0] - a[..., 1]; yb = 0.5 * (a[..., 0] + a[..., 1]) - a[..., 2]
    c = np.sqrt(rg.std() ** 2 + yb.std() ** 2) + 0.3 * np.sqrt(rg.mean() ** 2 + yb.mean() ** 2)
    return hsv[..., 2].mean(), hsv[..., 1].mean(), c / 100

def run(deck):
    spec = json.load(open(os.path.join(HERE, 'decks', f'{deck}.json'), encoding='utf-8'))
    src = sorted(glob.glob(os.path.join(CAR, SOURCES[deck], '[0-9][0-9].jpg')))[:-1]
    ref = np.array([measure(f) for f in src])
    lo = ref.min(0)
    fails = []
    for i, s in enumerate(spec['slides'], 1):
        if 'photo' not in s:
            continue
        v, sat, c = measure(os.path.join(CAR, s['photo']), s.get('bright', 1), s.get('sat', 1))
        bad = [n for n, x, l in (('bright', v, lo[0]), ('sat', sat, lo[1]), ('colour', c, lo[2])) if x < l]
        if bad:
            fails.append((i, os.path.basename(s['photo']), bad, round(v, 2), round(sat, 2), round(c, 2)))
    print(f'{deck}: source floor V{lo[0]:.2f} S{lo[1]:.2f} C{lo[2]:.2f} -> {len(fails)} slide(s) below')
    for f in fails:
        print('   slide', *f)
    return fails

def duplicates(decks):
    # 13.10: the same photo twice in one deck, or across decks, is a gate failure
    from collections import defaultdict
    seen = defaultdict(list)
    for d in decks:
        for i, s in enumerate(json.load(open(os.path.join(HERE, 'decks', f'{d}.json'), encoding='utf-8'))['slides'], 1):
            if 'photo' in s: seen[os.path.basename(s['photo'])].append(f'{d}#{i}')
    dup = {k: v for k, v in seen.items() if len(v) > 1}
    # 13.10: a photo smaller than the slide gets upscaled = blurry
    for k, v in seen.items():
        w, h = Image.open(os.path.join(HERE, 'pool', 'full', k)).size if os.path.exists(os.path.join(HERE, 'pool', 'full', k)) else (9999, 9999)
        if max(1440 / w, 1920 / h) > 1.1: print('TOO SMALL (blurry)', k, f'{w}x{h}', v)
    for k, v in dup.items(): print('DUPLICATE', k, v)
    return dup

if __name__ == '__main__':
    decks = sys.argv[1:] or [d for d in SOURCES if os.path.exists(os.path.join(HERE, 'decks', f'{d}.json'))]
    for d in decks:
        run(d)
    duplicates(decks)
