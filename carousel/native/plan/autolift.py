# Smallest exposure/saturation lift that brings each slide's photo up to the
# source deck's floor (qa-photos.py), the same per-slide lift the earlier decks
# use (render.mjs bright/sat). Caps: bright 1.2, sat 1.35 - beyond that the
# photo is the wrong photo, so it is reported, not forced.
#   python native/plan/autolift.py <deck> [--write]
import json, os, sys, glob
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from importlib import import_module
qa = import_module('qa-photos')
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); CAR = os.path.join(HERE, '..')
deck = sys.argv[1]
src = sorted(glob.glob(os.path.join(CAR, qa.SOURCES[deck], '[0-9][0-9].jpg')))[:-1]
lo = np.array([qa.measure(f) for f in src]).min(0) * 1.01
P = json.load(open(os.path.join(HERE, 'picks.json'), encoding='utf-8'))
picks = [P[deck]['cover']] + P[deck]['slides']
B = [1, 1.03, 1.06, 1.09, 1.12, 1.15, 1.18, 1.2]; S = [1, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35]
def lift(f):
    best = None
    for b in B:
        for s in S:
            v, sa, c = qa.measure(f, b, s)
            if v >= lo[0] and sa >= lo[1] and c >= lo[2]:
                cost = (b - 1) * 2 + (s - 1)
                if best is None or cost < best[0]: best = (cost, b, s)
    return best
if len(sys.argv) > 2 and sys.argv[2] == '--keys':
    slot = sys.argv[3]
    m = json.load(open(os.path.join(HERE, 'pool', f's-{deck}-{slot}.json')))
    for k in (sys.argv[4:] or m.keys()):
        r = lift(os.path.join(HERE, 'pool', 'thumbs', m[k] + '.jpg'))
        print(slot, k, 'X' if r is None else f'b{r[1]} s{r[2]}')
    sys.exit(0)
for n, p in enumerate(picks, 1):
    f = os.path.join(HERE, 'pool', 'full', p['id'] + '.jpg')
    best = None
    for b in B:
        for s in S:
            v, sa, c = qa.measure(f, b, s)
            if v >= lo[0] and sa >= lo[1] and c >= lo[2]:
                cost = (b - 1) * 2 + (s - 1)
                if best is None or cost < best[0]: best = (cost, b, s)
    if best is None: print(n, p['slot'], 'CANNOT reach floor', [round(x, 2) for x in qa.measure(f)], 'floor', lo.round(2)); continue
    _, b, s = best
    if b > 1 or s > 1: print(n, p['slot'], 'bright', b, 'sat', s)
    if '--write' in sys.argv:
        p.pop('bright', None); p.pop('sat', None)
        if b > 1: p['bright'] = b
        if s > 1: p['sat'] = s
if '--write' in sys.argv: json.dump(P, open(os.path.join(HERE, 'picks.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
