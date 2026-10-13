# Place-name spelling gate (13.10, owner: "פיפי instead of קופיפי came from a
# guess, and guessing is forbidden"). Every name is spelled the way HE writes
# it on his own slides (research/clickbait/his-slides.jsonl); a name he never
# wrote uses the most common spelling in the Hebrew corpus (harvest/he-search).
#   python native/spelling.py        check every deck spec, exit 1 on a bad spelling
#   python native/spelling.py --fix  rewrite the research json files in place
import json, glob, os, re, sys
sys.stdout.reconfigure(encoding="utf-8")

HERE = os.path.dirname(os.path.abspath(__file__))
# wrong -> right. Source of each right-hand side in the comment.
FIX = [
    (r'קו פי פי|קו פיפי', 'קופיפי'),                                          # his slides x6, corpus 13
    (r'(^|[\s/(])([בולמהש]?)(?:פיפי|פי פי)(?![א-ת])',r'\1\2קופיפי'),      # bare פיפי, also with a prefix (ו/ב/ל...)
    (r'קו סמוי|קו סאמוי', 'קוסמוי'),                                         # his transport slide; corpus 50
    (r'קו פנגן|קו פאנגן', 'קופנגן'),                                          # his slides; corpus 21
    (r'קוטאו', 'קו טאו'),                                                     # his slides x2
    (r'ריילי ביץ׳|ריילאי', "ריילי ביץ'"),                                      # his slides "ריילי"
    (r'צ\'יאנג מאי', 'צ׳יאנג מאי'),                                          # his slides use geresh ׳
]

def fix_text(t):
    for pat, right in FIX:
        t = re.sub(pat, right, t)
    return t

def walk(o, fn):
    if isinstance(o, str): return fn(o)
    if isinstance(o, list): return [walk(x, fn) for x in o]
    if isinstance(o, dict): return {k: (walk(v, fn) if k not in ('url', 'quote', 'sources', 'photo_queries', 'id') else v) for k, v in o.items()}
    return o

if __name__ == '__main__':
    if '--fix' in sys.argv:
        for f in glob.glob(os.path.join(HERE, 'research', '*.json')):
            d = json.load(open(f, encoding='utf-8'))
            n = walk(d, fix_text)
            if n != d:
                json.dump(n, open(f, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
                print('fixed', os.path.basename(f))
    bad = 0
    for f in glob.glob(os.path.join(HERE, 'decks', '*.json')):
        for s in json.load(open(f, encoding='utf-8'))['slides']:
            for b in s.get('blocks', [{'lines': s.get('lines', [])}]):
                for l in b['lines']:
                    if l.get('t') and fix_text(l['t']) != l['t']:
                        bad += 1; print(os.path.basename(f), '->', l['t'], '=>', fix_text(l['t']))
    print('spelling issues:', bad)
    sys.exit(1 if bad else 0)
