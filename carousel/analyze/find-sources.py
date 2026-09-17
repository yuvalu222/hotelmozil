# Locate, in the harvested corpus, the decks each of the five Hebrew carousels
# was modelled on. Writes analyze/sources.json.
#
# The mapping is the one PLAYBOOK states: each carousel demonstrates a named
# pattern, and each pattern was observed in named accounts/advertisers. This
# resolves those names to deck ids, contact sheets and live URLs, so the source
# can be opened next to the thing built from it.

import json, io, sys, pathlib, re

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
m = json.loads((ROOT / "harvest" / "manifest.json").read_text(encoding="utf-8"))

# carousel -> (pattern, playbook ref, [account-name fragments to match])
MAP = {
    "he-01-thailand-seven-eleven": (
        "הספירה מוכרזת בפתיחה ואז לא מצוירת אף פעם. מה שנושא את הקצב הוא דקדוק מקבילי.",
        "§2.2",
        ["kapawi", "mustvisitjapan", "thechortshow", "vnexpress", "travel2losangeles",
         "vietnamessence", "anushkarathod", "switzerlandersss", "whatshappening365",
         "מונה טורס", "nyctheloop"],
    ),
    "he-02-bangkok-getting-around": (
        "שקופית 2 היא הפריט הראשון, לא גשר. במקום הנשירה הגבוה ביותר יושב תוכן אמיתי.",
        "§2.3",
        ["travel2losangeles", "vietnamessence", "la_freebies", "veeceecheng",
         "steveandnes", "whatshappening365", "mustvisitjapan", "lexilaube",
         "thetaiwanderers", "ivskitchen"],
    ),
    "he-03-georgia-mistakes": (
        "מיכל אחד חוזר, זהה, בכל שקופית. זה המכשיר היחיד שכל אשכול התבניות חולק.",
        "§1.2",
        ["kapawi", "madetoroam", "ayana", "yumtravel", "rome2rio", "מונה טורס",
         "רמי גרינברג", "גרינברג"],
    ),
    "he-04-greece-before-you-book": (
        "משפט אחד שרץ על פני ההחלקה. נצפה בשני מפרסמים בלבד, ולכן מסומן כניסוי.",
        "§2.2 (נצפה פעם אחת)",
        ["ayana", "madetoroam", "lexilaube"],
    ),
    "he-05-vietnam-packing": (
        "הסגירה. דקים שהם תמונות בלבד לא סוגרים, וכל דק מתובנת כן סוגר.",
        "§2.6",
        ["kapawi", "ayana", "yumtravel", "rome2rio"],
    ),
}

out = {}
for cid, (why, ref, frags) in MAP.items():
    found, seen = [], set()
    for frag in frags:
        for r in m:
            acct = str(r.get("account") or "")
            if frag.lower() in acct.lower() and r["id"] not in seen:
                seen.add(r["id"])
                found.append({
                    "id": r["id"],
                    "account": acct,
                    "url": r.get("url"),
                    "sheet": r.get("sheet"),
                    "pile": r.get("pile"),
                    "organic": r.get("organic"),
                    "slideCount": r.get("slideCount"),
                    "metric": r.get("metric"),
                    "metricValue": r.get("metricValue"),
                    "engagementRate": r.get("engagementRate"),
                    "matched": frag,
                })
    out[cid] = {"why": why, "ref": ref, "sources": found}
    print(f"{cid:32} {ref:22} {len(found)} sources")
    for f in found:
        print(f"    {f['id']:24} {f['account'][:34]:36} slides={f['slideCount']}")

missing = []
for cid, (why, ref, frags) in MAP.items():
    got = {s["matched"] for s in out[cid]["sources"]}
    for fr in frags:
        if fr not in got:
            missing.append((cid, fr))
if missing:
    print("\nNOT FOUND in corpus (named in PLAYBOOK but not harvested as a deck):")
    for cid, fr in missing:
        print(f"  {cid:32} {fr}")

(ROOT / "analyze" / "sources.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nwrote {ROOT/'analyze'/'sources.json'}")
