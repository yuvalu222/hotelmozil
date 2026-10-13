# Apple emoji at 160 px, latest Apple set (Emojipedia version 453), 13.10.
# Why: lib/emoji.js used the 64 px PNGs from emoji-datasource-apple; on a
# 1440-wide slide an emoji is drawn ~100-140 px, so it was upscaled 2x and
# came out blurry (owner: "האימוגים יצאו מטושטשים").
# Collects every emoji used in native/decks/*.json and research/*.json and
# downloads each one once into native/emoji160/<codepoints>.png.
#   python native/emoji-hires.py
import json, glob, os, re, sys, urllib.request, urllib.parse
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'emoji160'); os.makedirs(OUT, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/152.0 Safari/537.36'}
# same sequence grammar as lib/emoji.js
EMOJI = re.compile(r'(?:[\U0001F1E6-\U0001F1FF]{2}|(?:[☀-➿⬀-⯿‼⁉™ℹ↔-↪⌚-⏿Ⓜ▪-◾\U0001F000-\U0001FAFF])[️︎]?[\U0001F3FB-\U0001F3FF]?(?:‍[☀-➿\U0001F000-\U0001FAFF][️]?[\U0001F3FB-\U0001F3FF]?)*)')
hexs = lambda s: '-'.join(f'{ord(c):x}' for c in s)

def collect():
    seqs = set()
    for f in glob.glob(os.path.join(HERE, 'decks', '*.json')) + glob.glob(os.path.join(HERE, 'research', '*.json')):
        for m in EMOJI.finditer(open(f, encoding='utf-8').read()):
            seqs.add(m.group(0))
    return seqs

def fetch(seq):
    dest = os.path.join(OUT, hexs(seq).replace('-fe0f', '') + '.png')
    if os.path.exists(dest):
        return 'have'
    html = urllib.request.urlopen(urllib.request.Request('https://emojipedia.org/' + urllib.parse.quote(seq), headers=UA), timeout=30).read().decode('utf-8', 'ignore')
    names = sorted(set(re.findall(r'source/apple/(\d+)/([a-z0-9_-]+\.png)', html)), key=lambda x: -int(x[0]))
    if not names:
        return 'no apple image'
    v, name = names[0]
    png = urllib.request.urlopen(urllib.request.Request(f'https://em-content.zobj.net/source/apple/{v}/{name}', headers=UA), timeout=30).read()
    open(dest, 'wb').write(png)
    return f'v{v}'

if __name__ == '__main__':
    for s in sorted(collect()):
        try:
            print(s, fetch(s))
        except Exception as e:
            print(s, 'ERR', e)
