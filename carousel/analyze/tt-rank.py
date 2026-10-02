# Rank harvested TikTok carousels and build the shortlist to clone from.
#
# The floor is Yuval's: >=50,000 likes. Relevance is destination-based, against
# the places Israelis actually fly to (Israel Airports Authority: Athens
# 1,178,745 passengers, Dubai 1,119,786, Larnaca 1,012,937; top countries
# Greece, Cyprus, Italy, UAE). A deck about an Arizona road trip can be
# excellent and is still useless here.

import json, io, sys, re, pathlib, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"
src = H / "tt-carousels.jsonl"

RELEVANT = {
    "greece": ["greece","greek","athens","crete","rhodes","corfu","santorini","mykonos",
               "paros","naxos","zakynthos","kefalonia","thessaloniki","halkidiki","milos","ios"],
    "cyprus": ["cyprus","larnaca","ayia napa","paphos","limassol","protaras","nicosia"],
    "uae":    ["dubai","abu dhabi","uae","emirates"],
    "italy":  ["italy","italian","rome","milan","venice","florence","naples","sicily","amalfi","tuscany"],
    "thailand":["thailand","thai","bangkok","phuket","samui","krabi","chiang mai","phi phi"],
    "georgia":["tbilisi","batumi","georgia"],
    "vietnam":["vietnam","hanoi","ho chi minh","da nang","hoi an"],
    "japan":  ["japan","tokyo","kyoto","osaka"],
    "europe-city":["prague","budapest","bucharest","barcelona","madrid","paris","london",
                   "amsterdam","vienna","berlin","istanbul","lisbon","porto","krakow"],
    "other-flown":["baku","yerevan","zanzibar","maldives","seychelles","sri lanka","bali",
                   "new york","azerbaijan","armenia"],
}
IRRELEVANT = ["arizona","utah","colorado","montana","texas","florida","california road",
              "banff","yellowstone","alberta","ontario","queensland","tasmania","iceland ring"]

def classify(text):
    t = (text or "").lower()
    if any(w in t for w in IRRELEVANT):
        hits = [g for g, ws in RELEVANT.items() if any(w in t for w in ws)]
        if not hits:
            return None, "irrelevant-destination"
    for g, ws in RELEVANT.items():
        for w in ws:
            if w in t:
                return g, w
    return None, "no-destination-match"

rows = []
if src.exists():
    for line in src.open(encoding="utf-8"):
        line = line.strip()
        if line:
            try: rows.append(json.loads(line))
            except json.JSONDecodeError: pass

print(f"carousels harvested (already >=50k likes): {len(rows)}")
if not rows:
    print("none yet — harvester still running")
    raise SystemExit

for r in rows:
    blob = f"{r.get('desc','')} {' '.join(r.get('hashtags') or [])} {r.get('query','')}"
    g, why = classify(blob)
    r["_group"], r["_why"] = g, why

ok = [r for r in rows if r["_group"]]
no = [r for r in rows if not r["_group"]]
print(f"  relevant to Israeli travellers : {len(ok)}")
print(f"  excluded                       : {len(no)}")
if no:
    print("    " + ", ".join(f"{r['_why']}" for r in no[:6]))

print()
print("=" * 104)
print(f"{'likes':>9} {'views':>11} {'shares':>8} {'saves':>8} {'sl':>3} {'group':<12} {'sound':<9} account / hook")
print("=" * 104)
for r in sorted(ok, key=lambda r: -(r.get("likes") or 0)):
    snd = "original" if (r.get("music") or {}).get("isOriginal") else "trending"
    print(f"{(r.get('likes') or 0):>9,} {(r.get('views') or 0):>11,} {(r.get('shares') or 0):>8,} "
          f"{(r.get('saves') or 0):>8,} {r.get('slideCount',0):>3} {r['_group']:<12} {snd:<9} "
          f"@{str(r.get('author'))[:16]:18} {re.sub(r'\\s+',' ',r.get('desc',''))[:46]}")

print()
print("=" * 104)
print("HASHTAG PRACTICE ACROSS THE RELEVANT WINNERS")
print("=" * 104)
counts = [len(r.get("hashtags") or []) for r in ok]
if counts:
    counts.sort()
    print(f"  hashtags per post: min {counts[0]}  median {counts[len(counts)//2]}  max {counts[-1]}")
    c = collections.Counter(h.lower() for r in ok for h in (r.get("hashtags") or []))
    print("  most used:", ", ".join(f"#{h}({n})" for h, n in c.most_common(14)))
snd = collections.Counter("original" if (r.get("music") or {}).get("isOriginal") else "trending" for r in ok)
print(f"  sound: {dict(snd)}")
slides = sorted(r.get("slideCount", 0) for r in ok)
if slides:
    print(f"  slides per deck: min {slides[0]}  median {slides[len(slides)//2]}  max {slides[-1]}")

(H / "tt-shortlist.json").write_text(
    json.dumps(sorted(ok, key=lambda r: -(r.get("likes") or 0)), ensure_ascii=False, indent=2),
    encoding="utf-8")
print(f"\nwrote {H/'tt-shortlist.json'}")
