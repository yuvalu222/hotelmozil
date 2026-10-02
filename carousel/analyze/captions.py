# The caption study the first pass skipped entirely.
#
# Every lens file says "the copy lives in the caption" and then analyses the
# image. The captions were on disk the whole time — 57 of 57 organic decks —
# and nobody read them. This reads them.
#
# It also correlates caption features against engagement rate, which is the
# only place in this whole study where a tactic can be tested rather than
# described. N is small (57) and that is stated, not hidden.

import json, io, sys, re, statistics, pathlib, collections

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
H = ROOT / "harvest"
man = json.loads((H / "manifest.json").read_text(encoding="utf-8"))

# The embed wraps every caption in chrome, and the stored field is flattened to
# a single line, so a naive strip leaves it in. The real shape is:
#
#   <handle> <n> followers View profile <handle> <n> posts · <n> followers
#   View more on Instagram Like Comment Share Save <n> likes <handle> <CAPTION>
#
# A first attempt matched only as far as "Save" and left "Like Comment Share
# Save 354,828 likes lexilaube" inside the text — which then scored as a
# "comment" CTA in all 57 rows, and put the like count inside the first 125
# characters. Every number below was Instagram's furniture. Anchor on the
# like-count instead, then drop the handle that follows it.
CHROME = re.compile(
    r"^.*?\bLike\s+Comment\s+Share\s+Save\b\s*"
    r"(?:[\d,.]+\s*[KMB]?\s+likes?\s*)?", re.S | re.I)
TAIL = re.compile(
    r"(?:Add a comment|View all \d+ comments|See translation|"
    r"\b\d+\s*(?:w|d|h|m)\b\s*$).*$", re.S | re.I)

def strip_lead_handle(s, handle):
    """The handle is repeated once more immediately before the caption text."""
    if handle:
        s = re.sub(r"^\s*" + re.escape(handle) + r"\b[\s:]*", "", s, count=1)
    return s

EMOJI = re.compile(
    "[" "\U0001F300-\U0001FAFF" "\U00002600-\U000027BF" "\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF" "\U00002B00-\U00002BFF" "]")

CTA = {
    "save":    re.compile(r"\bsave (this|it|for later)|\bsaving this\b", re.I),
    "share":   re.compile(r"\bshare (this )?with\b|\bsend this to\b|\btag (a|someone|your)\b", re.I),
    "comment": re.compile(r"\bcomment\b|\bdrop a\b|\blet me know\b", re.I),
    "follow":  re.compile(r"\bfollow (me|us|for)\b", re.I),
    "bio":     re.compile(r"\blink in bio\b|\bin my bio\b", re.I),
}

def clean(raw, handle=None):
    s = CHROME.sub("", raw or "", count=1)
    s = strip_lead_handle(s, handle)
    s = TAIL.sub("", s)
    return s.strip()

def tags(s):      return re.findall(r"#[^\s#]+", s)
def emojis(s):    return EMOJI.findall(s)
def firstnum(s):
    m = re.search(r"\d", s)
    return m.start() if m else None

rows = []
for r in man:
    if r.get("pile") != "A2":
        continue
    body = clean(r.get("caption"), r.get("account"))
    if len(body) < 12:
        continue
    ht = tags(body)
    # hashtags are usually parked at the end; measure the prose without them
    prose = re.sub(r"#[^\s#]+", "", body).strip()
    rows.append({
        "id": r["id"], "account": (r.get("account") or "").split()[0] if r.get("account") else None,
        "er": r.get("engagementRate"), "likes": r.get("metricValue"),
        "len": len(prose),
        "firstline": prose.split("\n")[0][:110],
        "q": "?" in prose,
        "q_at_end": prose.rstrip().endswith("?"),
        "numpos": firstnum(prose),
        "num_in_125": (firstnum(prose) is not None and firstnum(prose) < 125),
        "tags": len(ht),
        "emoji": len(emojis(prose)),
        "cta": [k for k, rx in CTA.items() if rx.search(prose)],
    })

n = len(rows)
print(f"captions read: {n}  (every organic deck that carried one)\n")

def pct(f):
    k = sum(1 for r in rows if f(r))
    return f"{k:>3}/{n}  {100*k//n:>3}%"

print("=" * 70)
print("WHAT THE CAPTIONS ACTUALLY DO")
print("=" * 70)
print(f"  contains a question        {pct(lambda r: r['q'])}")
print(f"  ENDS on a question         {pct(lambda r: r['q_at_end'])}")
print(f"  a number inside 125 chars  {pct(lambda r: r['num_in_125'])}")
print(f"  carries any hashtag        {pct(lambda r: r['tags'] > 0)}")
print(f"  carries 1-5 hashtags       {pct(lambda r: 1 <= r['tags'] <= 5)}")
print(f"  carries 6+ hashtags        {pct(lambda r: r['tags'] >= 6)}")
print(f"  carries any emoji          {pct(lambda r: r['emoji'] > 0)}")
lens = sorted(r["len"] for r in rows)
print(f"\n  prose length  median {statistics.median(lens):.0f} chars"
      f"   p10 {lens[n//10]}   p90 {lens[int(n*.9)]}   max {lens[-1]}")
print(f"  hashtags      median {statistics.median([r['tags'] for r in rows]):.0f}"
      f"   max {max(r['tags'] for r in rows)}")
print(f"  emoji         median {statistics.median([r['emoji'] for r in rows]):.0f}"
      f"   max {max(r['emoji'] for r in rows)}")

c = collections.Counter(k for r in rows for k in r["cta"])
print(f"\n  explicit CTA in caption: {sum(1 for r in rows if r['cta'])}/{n}")
for k, v in c.most_common():
    print(f"      {k:8} {v}")

# ---- the only testable thing in the whole study ----
print()
print("=" * 70)
print("DOES ANY OF IT TRACK ENGAGEMENT?  (n is small — read as a hint)")
print("=" * 70)
withEr = [r for r in rows if isinstance(r.get("er"), (int, float))]
def split(name, f):
    a = [r["er"] for r in withEr if f(r)]
    b = [r["er"] for r in withEr if not f(r)]
    if len(a) < 3 or len(b) < 3:
        print(f"  {name:26} too few on one side ({len(a)} vs {len(b)}) — no read")
        return
    ma, mb = statistics.median(a), statistics.median(b)
    arrow = "higher" if ma > mb else "lower "
    print(f"  {name:26} with {ma:.4f} (n={len(a)})  vs without {mb:.4f} (n={len(b)})   -> {arrow}")

split("ends on a question", lambda r: r["q_at_end"])
split("contains a question", lambda r: r["q"])
split("number inside 125 chars", lambda r: r["num_in_125"])
split("1-5 hashtags", lambda r: 1 <= r["tags"] <= 5)
split("6+ hashtags", lambda r: r["tags"] >= 6)
split("any emoji", lambda r: r["emoji"] > 0)
split("explicit CTA", lambda r: bool(r["cta"]))
split("prose under 200 chars", lambda r: r["len"] < 200)

print()
print("=" * 70)
print("FIRST LINE — what survives the feed's truncation")
print("=" * 70)
for r in sorted(withEr, key=lambda r: -(r["er"] or 0))[:10]:
    print(f"  ER {r['er']:.3f}  {str(r['account'])[:20]:22} {r['firstline'][:80]}")

out = H / "caption-study.json"
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nwrote {out}")
