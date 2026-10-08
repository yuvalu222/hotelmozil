# Which harvested carousel is actually worth cloning?
#
# NOT the one with the most likes. Likes are what makes a post look big; SAVES
# are what mean someone intends to use it, and a saved travel deck is the one
# that is open when a hotel gets booked. The ratio between the two separates
# two formats that otherwise both read as wins:
#
#     utility guide (heavy text, sectioned)   ~1.0  saves per like
#     beauty / photo dump (little or no text) ~0.15 saves per like
#
# Measured on this corpus, not assumed — the numbers are printed below so the
# split can be checked rather than taken on trust. A 350,000-like photo dump
# and a 66,000-like guide are not the same product, and for an account whose
# job is to be remembered at booking time, the smaller one is the better one.
#
# Relevance is destination-based, against where Israelis actually fly (Israel
# Airports Authority: Athens 1,178,745 passengers, Dubai 1,119,786, Larnaca
# 1,012,937). A deck about an Arizona road trip can be excellent and is still
# useless here.
#
#   python analyze/tt-shortlist.py

import json, pathlib, re, sys, io, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"

RELEVANT = {
    "יוון": ["greece", "greek", "athens", "crete", "rhodes", "corfu", "santorini", "mykonos",
             "paros", "naxos", "zakynthos", "kefalonia", "milos", "thessaloniki", "halkidiki",
             "naoussa", "karpathos", "ios"],
    "קפריסין": ["cyprus", "larnaca", "ayia napa", "paphos", "limassol", "protaras"],
    "דובאי": ["dubai", "abu dhabi", "uae", "emirates"],
    "איטליה": ["italy", "italia", "italian", "rome", "roma", "venice", "florence", "amalfi",
               "sicily", "milan", "naples", "positano", "tuscany"],
    "תאילנד": ["thailand", "thai", "bangkok", "phuket", "samui", "krabi", "chiang mai"],
    "גאורגיה": ["tbilisi", "batumi", "georgia"],
    "וייטנאם": ["vietnam", "hanoi", "da nang", "hoi an"],
    "יפן": ["japan", "tokyo", "kyoto", "osaka"],
    "עיר באירופה": ["prague", "budapest", "barcelona", "madrid", "paris", "london", "amsterdam",
                    "vienna", "istanbul", "lisbon", "porto", "krakow"],
}

def destination(text):
    t = (text or "").lower()
    for heb, words in RELEVANT.items():
        for w in words:
            if re.search(r"\b" + re.escape(w), t):
                return heb
    return None

rows, seen = [], set()
src = H / "tt-final.jsonl"
if not src.exists():
    print("nothing harvested yet"); raise SystemExit

for line in src.read_text(encoding="utf-8").split("\n"):
    line = line.strip()
    if not line:
        continue
    try:
        r = json.loads(line)
    except json.JSONDecodeError:
        continue
    if r.get("id") in seen:
        continue
    seen.add(r.get("id"))
    on_disk = len([f for f in (r.get("files") or []) if pathlib.Path(f).exists()])
    if on_disk < 2:
        continue
    likes = r.get("likes") or 0
    saves = r.get("saves") or 0
    blob = f"{r.get('caption','')} {' '.join(r.get('hashtags') or [])} {str(r.get('fullText',''))[:400]}"
    rows.append({
        "id": r["id"], "url": r.get("url"), "account": r.get("account"),
        "likes": likes, "saves": saves, "shares": r.get("shares") or 0,
        "comments": r.get("comments") or 0, "slides": on_disk,
        "spl": (saves / likes) if likes else 0,
        "dest": destination(blob),
        "music": r.get("music"),
        "hashtags": r.get("hashtags") or [],
        "cap": re.sub(r"\s+", " ", str(r.get("caption") or ""))[:46],
    })

rows.sort(key=lambda r: -r["likes"])
rel = [r for r in rows if r["dest"]]
print(f"{len(rows)} decks with slides on disk · {len(rel)} on a destination Israelis fly to\n")

print(f"{'likes':>9} {'saves':>8} {'per like':>9} {'sl':>3}  {'dest':<12} {'account':<22} opening")
for r in rows:
    print(f"{r['likes']:>9,} {r['saves']:>8,} {r['spl']:>9.2f} {r['slides']:>3}  "
          f"{(r['dest'] or '—'):<12} {str(r['account'])[:22]:<22} {r['cap']}"
          + ("" if r["dest"] else "   <- off topic"))

# the split, stated as a measurement rather than a claim
hi = [r for r in rows if r["spl"] >= 0.35]
lo = [r for r in rows if r["spl"] < 0.35 and r["likes"]]
def avg(xs, k): return (sum(x[k] for x in xs) / len(xs)) if xs else 0
print(f"\nformat split by saves per like")
print(f"  keepers  (>=0.35): {len(hi):>2} decks, avg {avg(hi,'spl'):.2f} saves/like, avg {avg(hi,'likes'):>9,.0f} likes")
print(f"  scrollers (<0.35): {len(lo):>2} decks, avg {avg(lo,'spl'):.2f} saves/like, avg {avg(lo,'likes'):>9,.0f} likes")

worth = [r for r in rel if r["likes"] >= 50000 and r["spl"] >= 0.35 and r["slides"] >= 6]
print(f"\nshortlist — on topic, 50K+, keeps people, enough slides to carry a guide: {len(worth)}")
for r in sorted(worth, key=lambda r: -r["saves"]):
    print(f"  {r['saves']:>8,} saves  {r['likes']:>9,} likes  {r['spl']:.2f}/like  "
          f"{r['slides']:>2} slides  {r['dest']:<10} @{r['account']}")
    print(f"           {r['url']}")

if rel:
    c = collections.Counter(h.lower() for r in rel for h in r["hashtags"])
    print("\nmost used hashtags on the relevant decks:",
          ", ".join(f"#{h}({n})" for h, n in c.most_common(12)))

(H / "tt-shortlist.json").write_text(
    json.dumps({"all": rows, "shortlist": worth}, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nwrote {H / 'tt-shortlist.json'}")
