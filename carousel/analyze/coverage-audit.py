# Audit the study against the brief's own §4 checklist: for each element the
# brief asked us to capture, is the raw data on disk, and was it analysed?
#
# "Analysed" means a lens file or the playbook actually says something about it.
# Raw data sitting unread counts as NOT mapped — that is the distinction this
# script exists to make visible.

import json, io, sys, re, pathlib, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"

man = json.loads((H / "manifest.json").read_text(encoding="utf-8"))
a2 = [r for r in man if r.get("pile") == "A2"]
a1 = [r for r in man if r.get("pile") == "A1"]

lens_text = ""
for f in sorted((H / "lenses").glob("batch*.md")):
    lens_text += f.read_text(encoding="utf-8", errors="replace").lower()
play = (ROOT / "PLAYBOOK.md").read_text(encoding="utf-8", errors="replace").lower()
both = lens_text + play

def mentions(*words):
    return sum(both.count(w) for w in words)

print("=" * 72)
print("RAW DATA ON DISK")
print("=" * 72)
caps_a2 = [r for r in a2 if (r.get("caption") or "").strip()]
print(f"organic decks                 : {len(a2)}")
print(f"  with caption text stored    : {len(caps_a2)}")
print(f"ad decks                      : {len(a1)}")
slide_files = list((H / "ig-decks").rglob("*.jpg")) + list((H / "decks").rglob("*.jpg"))
print(f"slide images on disk          : {len(slide_files)}")

# what a caption actually contains
def tags(c): return re.findall(r"#\S+", c or "")
def has_q(c): return "?" in (c or "")
tagcounts = [len(tags(r.get("caption"))) for r in caps_a2]
qs = sum(1 for r in caps_a2 if has_q(r.get("caption")))
print()
print("=" * 72)
print("CAPTIONS — the brief asks for structure + payload vs truncation point")
print("=" * 72)
print(f"captions available            : {len(caps_a2)}")
print(f"  ending-or-containing a '?'  : {qs}  ({100*qs//max(1,len(caps_a2))}%)")
print(f"  hashtag count  min/median/max: {min(tagcounts) if tagcounts else 0}"
      f"/{sorted(tagcounts)[len(tagcounts)//2] if tagcounts else 0}/{max(tagcounts) if tagcounts else 0}")
print(f"  mentions of captions in all analysis: {mentions('caption')} "
      f"(but zero systematic caption study exists)")

print()
print("=" * 72)
print("§4 CHECKLIST COVERAGE")
print("=" * 72)
rows = [
    ("crop / framing",            "framing", mentions("crop", "framing", "letterbox"), True),
    ("collage structure",         "collage", mentions("collage", "grid", "2x2"), True),
    ("photo provenance",          "provenance", mentions("stock", "ai-generated", "creator-shot", "phone-snap"), True),
    ("colour treatment",          "colour", mentions("duotone", "filter", "scrim", "overlay"), True),
    ("subject matter",            "subject", mentions("landscape", "hotel room", "food", "street"), True),
    ("type size vs frame",        "typesize", mentions("display size", "size relative"), False),
    ("type weight / family",      "typeface", mentions("serif", "grotesque", "condensed", "sans"), True),
    ("contrast method",           "contrast", mentions("knock-out", "scrim", "highlight box", "outline"), True),
    ("text placement",            "placement", mentions("centred", "bottom", "top-centre"), True),
    ("amount of text per slide",  "density", mentions("how much text", "text density"), False),
    ("numeral presentation",      "numerals", mentions("numeral", "counter", "badge"), True),
    ("emoji use",                 "emoji", mentions("emoji"), True),
    ("hook sentence verbatim",    "hooks", mentions("hook"), True),
    ("item title -> body",        "titles", mentions("title"), True),
    ("CLOSING SLIDE structure",   "closing", mentions("closing slide", "end-card", "cta slide"), True),
    ("CAPTION structure",         "captions", 0, False),
    ("caption truncation point",  "trunc", mentions("125 characters", "truncation"), False),
    ("slide count",               "count", mentions("slide count"), True),
    ("what sits on slide 2",      "slide2", mentions("slide 2"), True),
    ("strongest item first/last", "order", mentions("strongest"), True),
    ("keep-swiping signal",       "swipe", mentions("swipe"), True),
    ("how the deck ends",         "ends", mentions("ends on", "how it ends"), True),
]
for label, _k, hits, _x in rows:
    status = "MAPPED" if hits >= 8 else ("thin" if hits >= 2 else "NOT MAPPED")
    print(f"  {label:28} {hits:>5} mentions   {status}")

print()
print("=" * 72)
print("NEVER CAPTURED AT ALL (not on disk, so not analysable)")
print("=" * 72)
sample = a2[0] if a2 else {}
for field, why in [
    ("comments",  "the metric the caption-question tactic actually moves (+26%)"),
    ("saves",     "§6 calls saves/shares THE kpi for reference content"),
    ("shares",    "same"),
    ("views",     "what Yuval asked to rank by; embed never exposes it"),
    ("postedAt",  "cannot tell whether winners are recent or years old"),
    ("slideCount (true)", "organic capped at 2 by the embed"),
]:
    have = field.split()[0] in sample
    print(f"  {field:20} {'present' if have else 'ABSENT':8}  — {why}")

print()
print("=" * 72)
print("ACCOUNT-LEVEL VIEW")
print("=" * 72)
accts = collections.Counter(r.get("account") for r in a2)
multi = [a for a, n in accts.items() if n >= 2]
print(f"  organic accounts                 : {len(accts)}")
print(f"  accounts with >=2 posts harvested: {len(multi)}")
print("  -> no account was ever studied as an account: no repertoire, no")
print("     cadence, no sense of whether a winner is typical or a one-off.")

print()
print("=" * 72)
print("ISRAELI / HEBREW SCENE")
print("=" * 72)
heb = [r for r in a2 if re.search(r"[֐-׿]", (r.get("caption") or ""))]
print(f"  organic decks with Hebrew in the caption: {len(heb)}")
print("  -> the output is Hebrew for an Israeli audience, and the organic")
print("     corpus contains essentially none of it. Local conventions are")
print("     inferred from English decks, never observed.")
