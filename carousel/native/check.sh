#!/bin/sh
# Every gate before a deck is shown to the owner (13.10). Run from carousel/.
#   sh native/check.sh d1-tips-part2 d5-places ...
python native/qa-photos.py "$@" && python native/spelling.py
ls native/emoji160 | wc -l | xargs echo "emoji at 160px:"
