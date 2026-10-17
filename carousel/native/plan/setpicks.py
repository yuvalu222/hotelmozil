# Write a deck's picks into native/picks.json from sheet keys.
#   python native/plan/setpicks.py <deck> <folder> cover=<slot>:<key> <slot>:<key>[:k=v,k=v] ...
# Options after the key: top=0.6, focus=0.5/0.3, zoom=1.2, bright=1.05, sat=1.1
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
deck, folder, items = sys.argv[1], sys.argv[2], sys.argv[3:]
def one(spec):
    parts = spec.split(':')
    slot, key = parts[0], parts[1]
    i = key if key.startswith(('pin-', 'pexels-')) or len(key) > 8 else json.load(open(os.path.join(HERE, 'pool', f's-{deck}-{slot}.json')))[key]
    p = {'id': i, 'slot': slot}
    if len(parts) > 2:
        for kv in parts[2].split(','):
            k, v = kv.split('=')
            p[k] = [float(x) for x in v.split('/')] if k == 'focus' else float(v)
    return p
cover = one(items[0].split('=', 1)[1])
slides = [one(s) for s in items[1:]]
f = os.path.join(HERE, 'picks.json')
P = json.load(open(f, encoding='utf-8'))
P[deck] = {'cover': cover, 'slides': slides, 'folder': folder}
json.dump(P, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps(P[deck], ensure_ascii=False)[:600])
