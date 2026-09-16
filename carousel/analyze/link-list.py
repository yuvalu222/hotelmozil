# Build the link list the brief demands in §2b:
#   "כל הידע והקישורים של על מה עברת" — every carousel examined, with URL,
#   account, the metric that qualified it, the account's baseline for
#   comparison, slide count, and the format label assigned during viewing.
#
# Format labels live in the viewers' markdown (harvest/lenses/batch*.md), whose
# per-deck headings are:
#   ### <id> — <genre> — <pile> — <n> slides — metric <m>=<v>, baseline <b>=<v>
# Everything else comes from the manifest, which is the authority for metrics —
# a label is taken from the viewer, a number never is.

import json, re, pathlib, sys, io, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"

manifest = {r["id"]: r for r in json.loads((H / "manifest.json").read_text(encoding="utf-8"))}

HEAD = re.compile(r"^###\s+(?P<id>[A-Za-z0-9_-]+)\s+—\s+(?P<genre>[^—]+?)\s+—", re.M)
labels, seen_in = {}, collections.Counter()
lens_dir = H / "lenses"
if lens_dir.exists():
    for f in sorted(lens_dir.glob("batch*.md")):
        txt = f.read_text(encoding="utf-8", errors="replace")
        for m in HEAD.finditer(txt):
            i = m.group("id").strip()
            labels[i] = m.group("genre").strip().strip('"').lower()
            seen_in[f.name] += 1

rows = []
for i, r in manifest.items():
    rows.append({
        "id": i,
        "url": r.get("url"),
        "account": r.get("account"),
        "pile": r.get("pile"),
        "organic": r.get("organic"),
        "metric": r.get("metric"),
        "metricValue": r.get("metricValue"),
        "baseline": r.get("baseline"),
        "baselineValue": r.get("baselineValue"),
        "engagementRate": r.get("engagementRate"),
        "slideCount": r.get("slideCount"),
        "formatLabel": labels.get(i),          # None = not yet viewed
        "viewed": i in labels,
    })

rows.sort(key=lambda r: (r["pile"], -(r["engagementRate"] or 0), r["id"]))
(H / "link-list.json").write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

# markdown table for the playbook
lines = ["| # | id | account | pile | metric | baseline | slides | format | url |",
         "| --- | --- | --- | --- | --- | --- | --- | --- | --- |"]
for n, r in enumerate(rows, 1):
    mv = r["metricValue"]
    bv = r["baselineValue"]
    metric = f"{r['metric']}={mv}" if mv is not None else f"{r['metric']}=null"
    base = f"{r['baseline']}={bv}" if bv is not None else f"{r['baseline']}=null"
    acct = (r["account"] or "?").replace("|", "/")[:34]
    lines.append(f"| {n} | {r['id']} | {acct} | {r['pile']} | {metric} | {base} | "
                 f"{r['slideCount']} | {r['formatLabel'] or '—'} | {r['url']} |")
(H / "link-list.md").write_text("\n".join(lines) + "\n", encoding="utf-8")

viewed = sum(1 for r in rows if r["viewed"])
print(f"carousels in list : {len(rows)}")
print(f"  viewed & labelled: {viewed}")
print(f"  awaiting viewing : {len(rows) - viewed}")
print(f"  organic (A2)     : {sum(1 for r in rows if r['pile'] == 'A2')}")
print(f"  ads (A1)         : {sum(1 for r in rows if r['pile'] == 'A1')}")
if labels:
    print("format labels    :", dict(collections.Counter(v for v in labels.values())))
print("lens files parsed:", dict(seen_in))
print(f"wrote {H/'link-list.md'} and link-list.json")
