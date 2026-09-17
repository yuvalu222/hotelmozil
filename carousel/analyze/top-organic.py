# Rank the organic corpus by absolute reach and by engagement rate, so cloning
# targets are chosen on performance rather than on how interesting the craft
# looked. Prints what the currently-cloned decks actually scored.

import json, io, sys, pathlib, statistics

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
m = json.loads((ROOT / "harvest" / "manifest.json").read_text(encoding="utf-8"))

a2 = [r for r in m if r.get("pile") == "A2"]
have = [r for r in a2 if isinstance(r.get("metricValue"), int) and r.get("baselineValue")]

print(f"organic decks: {len(a2)}   with likes+followers: {len(have)}")
likes = sorted((r["metricValue"] for r in have), reverse=True)
print(f"likes: max {likes[0]:,}  p90 {likes[max(0,len(likes)//10)]:,}  median {statistics.median(likes):,.0f}")
print()

CLONED = {
    "ig-DdOEGuHE1wG": "he-a-athens-free (mustvisitjapan)",
    "ig-DbQrhvojYzv": "he-b-cyprus-20 (travel2losangeles)",
    "ig-Dc-WVj2Dd1U": "he-c-greece-unreal (switzerlandersss)",
    "ig-Db7w740EWZ-": "he-d-bangkok-ifthen (whatshappening365)",
    "ig-DbBEEAVk4km": "he-e-rhodes-notusual (vietnamessence_tours)",
}
print("=== what I actually cloned ===")
for cid, label in CLONED.items():
    r = next((x for x in m if x["id"] == cid), None)
    if not r:
        print(f"  {label}: NOT FOUND"); continue
    print(f"  {r['metricValue'] or 0:>9,} likes  {r['baselineValue'] or 0:>10,} followers  "
          f"ER {r.get('engagementRate') or 0:.4f}   {label}")

print()
print("=== top 25 organic by ABSOLUTE likes ===")
for r in sorted(have, key=lambda r: -r["metricValue"])[:25]:
    print(f"  {r['metricValue']:>9,} likes  {r['baselineValue']:>10,} fol  "
          f"ER {r['engagementRate']:.4f}  {r['id']:<22} {str(r['account'])[:26]}")

print()
print("=== top 15 organic by ENGAGEMENT RATE, min 20k followers ===")
big = [r for r in have if r["baselineValue"] >= 20000]
for r in sorted(big, key=lambda r: -(r["engagementRate"] or 0))[:15]:
    print(f"  ER {r['engagementRate']:.4f}  {r['metricValue']:>9,} likes  "
          f"{r['baselineValue']:>10,} fol  {r['id']:<22} {str(r['account'])[:26]}")
