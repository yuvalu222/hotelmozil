# The izzy_travels_ deck opens every body chip with a mark: a green check on a
# tip, a double-exclamation on a warning, a cross on the mistakes slide. That
# mark is part of the visual system being copied, so it is applied from one
# place rather than typed into each spec by hand.
import json, pathlib, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

C = chr
CHECK = C(0x2705)
WARN = C(0x203C) + C(0xFE0F)
CROSS = C(0x274C)
MARKS = (CHECK, WARN, CROSS)

# lines the source would mark as a warning rather than a tip
WARN_STARTS = ('המילוי חינם', 'לא להחליף כסף', 'סים בשדה התעופה',
               'יש תרופות נפוצות', 'להיכנס לרכב לאזור')

def strip(t):
    for m in MARKS:
        if t.startswith(m):
            return t[len(m):]
    return t

for name in sys.argv[1:]:
    p = pathlib.Path(name)
    d = json.loads(p.read_text(encoding='utf-8'))
    n = 0
    for s in d.get('slides', []):
        if 'items' not in s:
            continue
        title = s.get('title', '')
        # the "when to go" slide carries weather emoji instead, leave it alone
        if title.startswith('מתי'):
            continue
        out = []
        for t in s['items']:
            body = strip(t)
            if title.startswith('טעויות'):
                out.append(CROSS + body)
            elif any(body.startswith(w) for w in WARN_STARTS):
                out.append(WARN + body)
            else:
                out.append(CHECK + body)
        s['items'] = out
        n += len(out)
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'{p.name}: {n} chips marked')
