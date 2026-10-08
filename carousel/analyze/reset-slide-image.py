# Strip a slide's resolved photo back to its query so the next build re-picks.
# Used when a slide failed a check (greyscale, framing) and needs another
# candidate rather than a hand-chosen one.
#   python analyze/reset-slide-image.py specs/x.json 1 3
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
d = json.loads(p.read_text(encoding='utf-8'))
for arg in sys.argv[2:]:
    i = int(arg) - 1
    img = d['slides'][i].get('image') or {}
    q = img.get('query')
    if not q:
        print(f'slide {i+1}: no query, left alone'); continue
    d['slides'][i]['image'] = {'query': q}
    print(f'slide {i+1}: reset to query "{q}"')
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
