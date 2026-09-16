# Build harvest/manifest.json — one entry per deck that actually has a contact
# sheet on disk, carrying the identifiers every finding must stay anchored to.
#
# The brief requires the final link list to name, per carousel: URL, account,
# the metric that qualified it, the account's baseline for comparison, slide
# count and format label. Everything except the format label (which viewing
# assigns) is known here, so it is written now and the viewers only add labels.

import json, pathlib, sys, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"
SHEETS = H / "sheets"

rows = []
seen = set()
for line in (H / "harvest.jsonl").open(encoding="utf-8"):
    line = line.strip()
    if not line:
        continue
    try:
        r = json.loads(line)
    except json.JSONDecodeError:
        continue
    if r.get("pile") == "A2":
        key, tag = r.get("shortcode"), "ig"
    else:
        key, tag = r.get("libraryId"), "ad"
    if not key or key in seen:
        continue
    sheet = SHEETS / f"{tag}-{key}.jpg"
    if not sheet.exists():
        continue
    seen.add(key)

    if tag == "ig":
        rows.append({
            "id": f"ig-{key}",
            "sheet": str(sheet.relative_to(ROOT)).replace("\\", "/"),
            "pile": "A2", "organic": True, "source": "instagram",
            "url": r.get("url"),
            "account": r.get("account"),
            "metric": "likes", "metricValue": r.get("likes"),
            "baseline": "followers", "baselineValue": r.get("followers"),
            "engagementRate": r.get("engagementRate"),
            "slideCount": r.get("slideCount"),
            "caption": (r.get("caption") or "")[:600],
        })
    else:
        rows.append({
            "id": f"ad-{key}",
            "sheet": str(sheet.relative_to(ROOT)).replace("\\", "/"),
            "pile": "A1", "organic": False, "source": "meta-ad-library",
            "url": r.get("url"),
            "account": r.get("advertiser"),
            "metric": "runDays", "metricValue": r.get("runDays"),
            "baseline": "advertiser median runDays", "baselineValue": None,
            "engagementRate": None,
            "slideCount": r.get("slideCount"),
            "caption": (r.get("text") or "")[:600],
            "country": r.get("country"),
        })

# fill advertiser medians from the full ad population
import statistics, collections, re
pop = collections.defaultdict(list)
raw = H / "adlib-raw.jsonl"
if raw.exists():
    for line in raw.open(encoding="utf-8"):
        line = line.strip()
        if not line:
            continue
        try: r = json.loads(line)
        except json.JSONDecodeError: continue
        m = re.search(r"See ad details\s+(.*?)\s+Sponsored", r.get("text", ""))
        a = m.group(1).strip() if m else None
        if a and isinstance(r.get("runDays"), int):
            pop[re.sub(r"\s+", " ", a)].append(r["runDays"])
for row in rows:
    if row["pile"] == "A1" and row["account"] in pop and len(pop[row["account"]]) >= 3:
        row["baselineValue"] = statistics.median(pop[row["account"]])

(H / "manifest.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
a2 = [r for r in rows if r["pile"] == "A2"]
withrate = [r for r in a2 if r.get("engagementRate") is not None]
print(f"manifest entries : {len(rows)}")
print(f"  organic (A2)   : {len(a2)}  ({len(withrate)} with engagement rate)")
print(f"  ads (A1)       : {len(rows) - len(a2)}")
print(f"wrote {H/'manifest.json'}")
