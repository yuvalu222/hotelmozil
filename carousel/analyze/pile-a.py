# Pile A analysis — the brief's §3 algorithm, mapped onto ad run duration.
#
# §3 compares a post against its OWN account's median, because comparing across
# accounts is the confound that ruins published carousel research. The same
# logic applies here: an ad is compared against its OWN advertiser's median run
# duration. Advertisers kill what loses, so a long run is a revealed preference.
#
# Thresholds are the brief's, unchanged:
#   winner            = >= 2x its advertiser's median run duration
#   advertiser counts = >= 3 winners (one hit is luck, three is a format)
#   pattern counts    = seen in winners from >= 3 different advertisers
#
# This is ads, not organic. Never merge with Pile B.

import json, re, statistics, sys, io, pathlib, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"

def load(name):
    p = H / name
    if not p.exists():
        return []
    rows = []
    for line in p.open(encoding="utf-8"):
        line = line.strip()
        if line:
            try: rows.append(json.loads(line))
            except json.JSONDecodeError: pass
    return rows

def advertiser(r):
    a = r.get("advertiser")
    if a and not re.match(r"^(This ad has|\d+ ads use|Open Dropdown|See ad details)", a):
        return a.strip()
    m = re.search(r"See ad details\s+(.*?)\s+Sponsored", r.get("text", ""))
    if m:
        cand = m.group(1).strip()
        if cand and not re.match(r"^(This ad has|\d+ ads use)", cand):
            return re.sub(r"\s+", " ", cand)
    return None

raw   = load("adlib-raw.jsonl")     # every ad seen (the denominator)
decks = load("harvest.jsonl")       # carousels only (the study objects)

# ---- build per-advertiser run-duration medians from the FULL ad population ----
by_adv = collections.defaultdict(list)
for r in raw + decks:
    a = advertiser(r)
    d = r.get("runDays")
    if a and isinstance(d, int) and d >= 0:
        by_adv[a].append(d)

medians = {a: statistics.median(v) for a, v in by_adv.items() if len(v) >= 3}

print(f"ads in population      : {len(raw)}")
print(f"carousel decks harvested: {len(decks)}")
print(f"advertisers seen        : {len(by_adv)}")
print(f"advertisers with >=3 ads (median computable): {len(medians)}")
print()

# ---- winners ----
winners, unqualified = [], []
for r in decks:
    a = advertiser(r)
    d = r.get("runDays")
    if not a or not isinstance(d, int):
        continue
    med = medians.get(a)
    if med is None:
        unqualified.append((a, d, "no median — advertiser has <3 ads in sample"))
        continue
    r["_adv"], r["_median"] = a, med
    r["_ratio"] = round(d / med, 2) if med else None
    (winners if med and d >= 2 * med else unqualified).append(r if med and d >= 2*med else (a, d, f"{d}d vs median {med}d"))

qual = collections.Counter(w["_adv"] for w in winners)
qualified_advertisers = {a for a, n in qual.items() if n >= 3}

print(f"decks meeting >=2x own-advertiser median : {len(winners)}")
print(f"advertisers with >=3 such decks          : {len(qualified_advertisers)}")
if qualified_advertisers:
    for a in qualified_advertisers:
        print(f"   {a}  ({qual[a]} winners, median {medians[a]}d)")
print()

if len(qualified_advertisers) < 3:
    print("!! Fewer than 3 qualifying advertisers.")
    print("   Per the brief's §3, NO pattern can be recorded as 'working' yet —")
    print("   a pattern needs winners from >=3 different advertisers.")
    print("   Everything harvested so far is 'observed, unconfirmed'.")
    print("   This is a sample-size statement, not a finding.")

out = {
    "generated": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
    "adsInPopulation": len(raw),
    "decksHarvested": len(decks),
    "advertisers": len(by_adv),
    "advertisersWithMedian": len(medians),
    "winners": [
        {k: w[k] for k in ("libraryId", "url", "_adv", "runDays", "_median", "_ratio",
                            "slideCount", "country", "query", "startDate")}
        for w in winners
    ],
    "qualifiedAdvertisers": sorted(qualified_advertisers),
    "medians": {a: m for a, m in sorted(medians.items(), key=lambda kv: -kv[1])},
}
(H / "pile-a-analysis.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wrote {H/'pile-a-analysis.json'}")
