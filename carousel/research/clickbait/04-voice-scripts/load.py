import json, glob, math, os, re
import emoji, regex

HS = r'C:/Users/Yuval/Desktop/hotelmozil-site/carousel/harvest/he-search'
OWN = r'C:/Users/Yuval/Desktop/hotelmozil-site/carousel/harvest/own-full/items.json'
OWNCOV = r'C:/Users/Yuval/Desktop/hotelmozil-site/carousel/research/own-covers-transcribed.json'


def load():
    rows = [json.loads(l) for f in sorted(glob.glob(HS + '/coded/*.jsonl'))
            for l in open(f, encoding='utf-8') if l.strip()]
    codes = json.load(open(HS + '/codes.json'))
    hits = json.load(open(HS + '/hits.json', encoding='utf-8'))
    out = []
    for r in rows:
        h = hits.get(codes.get(r['code']))
        if not h:
            continue
        d = dict(r)
        d['id'] = h['id']; d['author'] = h['author']; d['desc'] = h.get('desc') or ''
        d['plays'] = h.get('plays') or 0; d['followers'] = h.get('followers') or 0
        d['saves'] = h.get('saves') or 0; d['likes'] = h.get('likes') or 0
        d['score'] = math.log((d['plays'] + 1) / (d['followers'] + 1))
        out.append(d)
    return out


def own():
    return json.load(open(OWN, encoding='utf-8')), json.load(open(OWNCOV, encoding='utf-8'))


HEB = regex.compile(r'[\u0590-\u05FF]')
WORD = regex.compile(r"[\p{L}\p{N}][\p{L}\p{N}'\"\u05f3\u05f4-]*")


def clean_text(t):
    # drop transcriber marks
    return t.replace('[?]', ' ').strip()


def words(t):
    t = emoji.replace_emoji(t, ' ')
    return [w.strip("-'\"") for w in WORD.findall(t) if w.strip("-'\"")]


def norm_words(t):
    return [w for w in words(t)]


def emojis(t):
    return [e['emoji'] for e in emoji.emoji_list(t)]


def is_flag(e):
    return all(0x1F1E6 <= ord(c) <= 0x1F1FF for c in e if c not in '\ufe0f\u200d')


def lines(t):
    return [l.strip() for l in t.split(' / ') if l.strip()]


def terciles(items, key='score'):
    s = sorted(items, key=lambda d: d[key])
    n = len(s) // 3
    return s[-n:], s[:n]
