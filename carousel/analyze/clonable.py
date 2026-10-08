# What is actually clonable right now: decks whose slides are on disk, whose
# destination is one Israelis fly to, ranked by engagement — and marked if a
# clone already exists for that source.

import json, io, sys, re, pathlib

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"

RELEVANT = {
    "יוון": ["greece","greek","athens","crete","rhodes","corfu","santorini","mykonos","paros",
             "naxos","zakynthos","kefalonia","milos","thessaloniki","halkidiki"],
    "קפריסין": ["cyprus","larnaca","ayia napa","paphos","limassol"],
    "דובאי": ["dubai","abu dhabi"],
    "איטליה": ["italy","italian","rome","venice","florence","amalfi","sicily","milan","naples"],
    "תאילנד": ["thailand","thai","bangkok","phuket","samui","krabi","chiang mai"],
    "גאורגיה": ["tbilisi","batumi"],
    "וייטנאם": ["vietnam","hanoi","ho chi minh","da nang"],
    "יפן": ["japan","tokyo","kyoto","osaka"],
    "עיר באירופה": ["prague","budapest","barcelona","madrid","paris","london","amsterdam",
                    "vienna","istanbul","lisbon","porto"],
}

def dest(text):
    t = (text or "").lower()
    for heb, ws in RELEVANT.items():
        for w in ws:
            if re.search(r"\b" + re.escape(w), t):
                return heb, w
    return None, None

# sources already cloned
cloned = set()
for spec in (ROOT / "specs").glob("*.json"):
    try:
        d = json.loads(spec.read_text(encoding="utf-8"))
        if d.get("clonedFrom"):
            cloned.add(d["clonedFrom"])
    except Exception:
        pass

rows, seen = [], set()
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
        k = r.get("shortcode")
        if not k or k in seen:
            continue
        seen.add(k)
        files = [f for f in (r.get("files") or []) if pathlib.Path(f).exists()]
        if len(files) < 2:
            continue
        g, w = dest(f"{r.get('caption','')} {' '.join(r.get('hashtags') or [])}")
        rows.append({
            "id": f"ig-{k}", "account": r.get("account"), "likes": r.get("likes") or 0,
            "followers": r.get("baselineValue") or r.get("followers"),
            "er": r.get("engagementRate"), "dest": g, "hit": w,
            "slides": len(files),
            "cap": re.sub(r"^.*?\bLike\s+Comment\s+Share\s+Save\b\s*(?:[\d,.]+\s*[KMB]?\s+likes?\s*)?",
                          "", re.sub(r"\s+", " ", r.get("caption") or ""))[:70],
        })

print(f"instagram decks with slides on disk: {len(rows)}")
rel = [r for r in rows if r["dest"]]
fresh = [r for r in rel if r["id"] not in cloned]
print(f"  on an Israeli destination : {len(rel)}")
print(f"  of those, not yet cloned  : {len(fresh)}")
print(f"  already cloned            : {sorted(cloned)}")
print()
print(f"{'likes':>8} {'ER':>7} {'sl':>3} {'dest':<12} {'account':<22} opening")
for r in sorted(fresh, key=lambda r: -(r["er"] or 0)):
    print(f"{r['likes']:>8,} {(r['er'] or 0):>7.3f} {r['slides']:>3} {r['dest']:<12} "
          f"{str(r['account'])[:22]:<22} {r['cap'][:48]}")

(H / "clonable.json").write_text(json.dumps(sorted(fresh, key=lambda r: -(r["er"] or 0)),
                                            ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nwrote {H/'clonable.json'}")
