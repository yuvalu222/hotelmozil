# Which carousels ALREADY on disk clear Yuval's 50,000-like floor and are about
# a place Israelis actually fly to?
#
# Written during an IP cooldown: TikTok and Instagram both stopped answering a
# browser after tonight's harvesting, so this asks what the existing corpus can
# already support instead of scraping more.

import json, io, sys, re, pathlib

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"

FLOOR = 50000
RELEVANT = {
    "greece": ["greece","greek","athens","crete","rhodes","corfu","santorini","mykonos","paros",
               "naxos","zakynthos","kefalonia","thessaloniki","milos","ios","halkidiki"],
    "cyprus": ["cyprus","larnaca","ayia napa","paphos","limassol","protaras"],
    "uae": ["dubai","abu dhabi","emirates"],
    "italy": ["italy","italian","rome","milan","venice","florence","naples","sicily","amalfi","tuscany"],
    "thailand": ["thailand","thai","bangkok","phuket","samui","krabi","chiang mai"],
    "georgia": ["tbilisi","batumi"],
    "vietnam": ["vietnam","hanoi","ho chi minh","da nang","hoi an"],
    "japan": ["japan","tokyo","kyoto","osaka"],
    "eu-city": ["prague","budapest","bucharest","barcelona","madrid","paris","london","amsterdam",
                "vienna","berlin","istanbul","lisbon","porto"],
    "other": ["baku","yerevan","zanzibar","maldives","seychelles","sri lanka","bali","new york"],
}

def place_of(text):
    t = (text or "").lower()
    for g, ws in RELEVANT.items():
        for w in ws:
            if w in t:
                return g, w
    return None, None

rows = []
for name in ("harvest.jsonl", "ig-viral.jsonl"):
    p = H / name
    if not p.exists():
        continue
    for line in p.open(encoding="utf-8"):
        line = line.strip()
        if not line:
            continue
        try: r = json.loads(line)
        except json.JSONDecodeError: continue
        if r.get("source") != "instagram-embed":
            continue
        rows.append(r)

seen, uniq = set(), []
for r in rows:
    k = r.get("shortcode")
    if k and k not in seen:
        seen.add(k); uniq.append(r)

print(f"instagram carousels on disk: {len(uniq)}")
above = [r for r in uniq if (r.get("likes") or 0) >= FLOOR]
print(f"  at or above {FLOOR:,} likes: {len(above)}")

by_likes = sorted(uniq, key=lambda r: -(r.get("likes") or 0))
print("\ntop 12 by likes, with destination match:")
print(f"  {'likes':>9}  {'place':<10} {'account':<24} caption opening")
for r in by_likes[:12]:
    g, w = place_of(f"{r.get('caption','')} {' '.join(r.get('hashtags') or [])}")
    cap = re.sub(r"\s+", " ", r.get("caption") or "")
    cap = re.sub(r"^.*?\bLike\s+Comment\s+Share\s+Save\b\s*(?:[\d,.]+\s*[KMB]?\s+likes?\s*)?", "", cap)
    mark = "OK " if (r.get("likes") or 0) >= FLOOR else "   "
    print(f"{mark}{(r.get('likes') or 0):>9,}  {str(g or '-'):<10} {str(r.get('account'))[:24]:<24} {cap[:58]}")

qualified = [r for r in above if place_of(f"{r.get('caption','')} {' '.join(r.get('hashtags') or [])}")[0]]
print(f"\nclear BOTH bars (>= {FLOOR:,} likes AND an Israeli-relevant destination): {len(qualified)}")
for r in qualified:
    g, w = place_of(f"{r.get('caption','')} {' '.join(r.get('hashtags') or [])}")
    print(f"  {(r.get('likes') or 0):>9,}  {g}/{w}  {r.get('url')}")

(H / "existing-50k.json").write_text(json.dumps(qualified, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nwrote {H/'existing-50k.json'}")
