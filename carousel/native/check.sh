#!/bin/sh
# Every gate before a deck is shown to the owner (13.10). Run from carousel/.
#   sh native/check.sh d1-tips-part2 d5-places ...
python native/qa-photos.py "$@" && python native/spelling.py
ls native/emoji160 | wc -l | xargs echo "emoji at 160px:"
for d in "$@"; do python native/qa-text.py "native/out/$d" "native/out/$d-4k" 2>/dev/null | tail -1; done
# 17.10: every visible text row centred on the photo, no emoji wrapped onto its own row
node native/qa-center.mjs "$@" | tail -3
