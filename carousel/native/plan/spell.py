# Count candidate spellings of a place name in his slides + the Hebrew corpus.
#   python native/plan/spell.py "variant1|variant2" ...
import json, glob, sys, re
sys.stdout.reconfigure(encoding='utf-8')
his = [json.loads(l)['text'] for l in open('research/clickbait/his-slides.jsonl', encoding='utf-8')]
corp = []
for f in glob.glob('harvest/he-search/coded/*.jsonl'):
    for l in open(f, encoding='utf-8'):
        try: corp.append(json.loads(l).get('text', ''))
        except Exception: pass
h = json.load(open('harvest/he-search/hits.json', encoding='utf-8'))
corp += [p.get('desc') or '' for p in h.values()]
for arg in sys.argv[1:]:
    out = []
    for v in arg.split('|'):
        out.append(f"{v}: his {sum(t.count(v) for t in his)} corpus {sum(t.count(v) for t in corp)}")
    print(' ; '.join(out))
