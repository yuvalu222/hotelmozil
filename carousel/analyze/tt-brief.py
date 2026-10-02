# Turn harvested TikTok carousels into clone briefs.
#
# Yuval's requirement: nothing invented. So a brief records only what the
# source actually did — its numbers, its hashtags, its sound, its slide count —
# and leaves the per-slide visual reading (what the photo shows, how much text,
# what size, where it sits) to be filled by looking at the slides.
#
# Relevance is destination-based, against Israel Airports Authority figures:
# Athens 1,178,745 passengers, Dubai 1,119,786, Larnaca 1,012,937; leading
# countries Greece, Cyprus, Italy, UAE.

import json, io, sys, re, pathlib, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"
FLOOR = 50000

RELEVANT = {
    "יוון": ["greece","greek","athens","crete","rhodes","corfu","santorini","mykonos","paros",
             "naxos","zakynthos","kefalonia","milos","thessaloniki","halkidiki","ios"],
    "קפריסין": ["cyprus","larnaca","ayia napa","paphos","limassol","protaras"],
    "דובאי": ["dubai","abu dhabi","emirates","uae"],
    "איטליה": ["italy","italian","rome","venice","florence","amalfi","sicily","milan","naples","tuscany"],
    "תאילנד": ["thailand","thai","bangkok","phuket","samui","krabi","chiang mai","phi phi"],
    "גאורגיה": ["tbilisi","batumi","georgia"],
    "וייטנאם": ["vietnam","hanoi","ho chi minh","da nang","hoi an"],
    "יפן": ["japan","tokyo","kyoto","osaka"],
    "עיר באירופה": ["prague","budapest","barcelona","madrid","paris","london","amsterdam",
                    "vienna","istanbul","lisbon","porto","bucharest","krakow","rome"],
    "יעד רחוק נפוץ": ["bali","sri lanka","maldives","zanzibar","seychelles","baku","yerevan"],
}

def destination(text):
    t = (text or "").lower()
    for heb, words in RELEVANT.items():
        for w in words:
            if re.search(r"\b" + re.escape(w), t):
                return heb, w
    return None, None

rows = []
src = H / "tt-final.jsonl"
if src.exists():
    for line in src.open(encoding="utf-8"):
        line = line.strip()
        if line:
            try: rows.append(json.loads(line))
            except json.JSONDecodeError: pass

seen, uniq = set(), []
for r in rows:
    if r.get("id") not in seen:
        seen.add(r.get("id")); uniq.append(r)

print(f"carousels harvested : {len(uniq)}")
if not uniq:
    print("none yet — harvester still running")
    raise SystemExit

over = [r for r in uniq if (r.get("likes") or r.get("likesFromCard") or 0) >= FLOOR]
for r in over:
    blob = f"{r.get('caption','')} {' '.join(r.get('hashtags') or [])} {r.get('query','')}"
    r["_dest"], r["_hit"] = destination(blob)
good = [r for r in over if r["_dest"]]
good.sort(key=lambda r: -(r.get("likes") or r.get("likesFromCard") or 0))

print(f"  at/over {FLOOR:,} likes : {len(over)}")
print(f"  AND an Israeli destination : {len(good)}")
print()

def n(v): return f"{v:,}" if isinstance(v, int) else "—"

for i, r in enumerate(good, 1):
    likes = r.get("likes") or r.get("likesFromCard") or 0
    snd = "סאונד מקורי של היוצר" if r.get("soundIsOriginal") else "טראק מספריית טיקטוק"
    print("=" * 78)
    print(f"{i}. @{r.get('account')}  —  {r['_dest']}  ({r['_hit']})")
    print(f"   {r.get('url')}")
    print(f"   לייקים {n(likes)} · שיתופים {n(r.get('shares'))} · שמירות {n(r.get('saves'))} · תגובות {n(r.get('comments'))}")
    print(f"   שקופיות: {r.get('slideCount')}")
    print(f"   סאונד: {snd}" + (f"  — {r.get('music')}" if r.get('music') else ""))
    tags = r.get("hashtags") or []
    print(f"   האשטגים ({len(tags)}): {' '.join('#'+t for t in tags) if tags else 'אין'}")
    cap = re.sub(r"\s+", " ", r.get("caption") or "")[:200]
    print(f"   כיתוב: {cap}")

if good:
    print("=" * 78)
    tag_counts = [len(r.get("hashtags") or []) for r in good]
    slide_counts = sorted(r.get("slideCount") or 0 for r in good)
    orig = sum(1 for r in good if r.get("soundIsOriginal"))
    print("דפוסים על פני המנצחים:")
    print(f"  האשטגים לפוסט: חציון {sorted(tag_counts)[len(tag_counts)//2]}  טווח {min(tag_counts)}-{max(tag_counts)}")
    print(f"  שקופיות לדק : חציון {slide_counts[len(slide_counts)//2]}  טווח {slide_counts[0]}-{slide_counts[-1]}")
    print(f"  סאונד       : {orig} מקורי · {len(good)-orig} טראק")
    c = collections.Counter(t.lower() for r in good for t in (r.get("hashtags") or []))
    print("  האשטגים נפוצים: " + ", ".join(f"#{t}({k})" for t, k in c.most_common(12)))

(H / "tt-briefs.json").write_text(json.dumps(good, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nwrote {H/'tt-briefs.json'}")
