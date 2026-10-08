#!/usr/bin/env bash
# One command to close the loop after a photo build: restore the copy a
# concurrent build.js reverted, re-render every deck on the current CSS,
# check the characters, package, and open the review page in Chrome.
set -e
cd "$(dirname "$0")/.."
node analyze/reapply-copy.mjs
for d in tt-29-paris-route tt-28-larnaca-route tt-27-amalfi-route; do
  echo "--- $d"
  node build.js "specs/$d.json" --no-fetch 2>&1 | tail -4
done
node analyze/char-check.mjs
node analyze/package-upload.mjs
