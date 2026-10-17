# Replace one slot's pick in picks.json: python native/plan/swap.py <deck> <slot> <sheetkey|id> [k=v,...]
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
deck, slot, key = sys.argv[1:4]
i = key if len(key) > 8 else json.load(open(os.path.join(HERE, 'pool', f's-{deck}-{slot}.json')))[key]
f = os.path.join(HERE, 'picks.json'); P = json.load(open(f, encoding='utf-8'))
items = [P[deck]['cover']] + P[deck]['slides']
p = next(x for x in items if x['slot'] == slot)
for k in list(p): 
    if k != 'slot': del p[k]
p['id'] = i
if len(sys.argv) > 4:
    for kv in sys.argv[4].split(','):
        k, v = kv.split('='); p[k] = [float(x) for x in v.split('/')] if k == 'focus' else float(v)
json.dump(P, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(slot, '->', i)
