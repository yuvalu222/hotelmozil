import json, io, sys, pathlib
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
ROOT = pathlib.Path(__file__).resolve().parent.parent
m = json.loads((ROOT / "harvest" / "manifest.json").read_text(encoding="utf-8"))
for wanted in sys.argv[1:]:
    hits = [r for r in m if wanted in r["id"]]
    if not hits:
        print(f"{wanted}: NOT IN MANIFEST")
        continue
    for r in hits:
        print(f"{r['id']}  account={r.get('account')!r}  slides={r.get('slideCount')}  url={r.get('url')}")
        print(f"    caption: {(r.get('caption') or '')[:160]}")
