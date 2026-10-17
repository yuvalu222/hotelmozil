# Print id, size, query and alt text for sheet keys: python native/plan/alt.py <deck> <slot> k k k
import json, os, sys, glob
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pool = json.load(open(os.path.join(HERE, 'pool', 'pool.json'), encoding='utf-8'))
for f in glob.glob(os.path.join(HERE, 'pool', 'side-*.json')):
    for k, v in json.load(open(f, encoding='utf-8')).items(): pool.setdefault(k, v)
deck, slot, keys = sys.argv[1], sys.argv[2], sys.argv[3:]
m = json.load(open(os.path.join(HERE, 'pool', f's-{deck}-{slot}.json')))
for k in keys:
    i = m[k]; p = pool[i]
    print(slot, k, i, f"{p.get('w')}x{p.get('h')}", '|', p.get('query'), '|', (p.get('alt') or '')[:150], '| pinner:', p.get('pinner'))
