#!/bin/sh
# Keep the Instagram harvest running for hours, as ONE harness task.
#
# WHY INSTAGRAM. The TikTok crawl is walled: 794 of 796 profiles returned zero
# carousels, the related rail returns nothing, and search was already refused.
# That is three closed doors, so the corpus stopped at 846 and no amount of
# restarting moved it.
#
# The Instagram track reaches posts through Brave and DuckDuckGo rather than
# through Instagram's own surfaces, so TikTok's wall says nothing about it.
# Owner, 7.10: "continue in the coming hours with the KEEPALIVE, the whole
# task. Instagram is fine too."
#
# ⚠️ WHAT THIS SOURCE CANNOT GIVE, stated up front so no finding is quoted
# from it that it cannot support:
#   - no view counts, so nothing here speaks to stopping a scroll
#   - no sound, so the original-vs-trending question stays closed
#   - the embed exposes only the first two slides of a carousel
# What it does give in full: likes, follower count, the whole caption, the
# exact hashtags, and the cover frame — which is the one that has to work.
#
#   sh harvest/keepalive-ig.sh [hours]      # default 6

HOURS="${1:-6}"
cd "$(dirname "$0")/.." || exit 1
LOG=harvest/keepalive-ig.log
STOP=harvest/.keepalive-ig.stop
END=$(( $(date +%s) + HOURS * 3600 ))
NODE="/c/Program Files/nodejs/node"
[ -x "$NODE" ] || NODE="$(command -v node)"

count() { wc -l < harvest/ig-viral.jsonl 2>/dev/null | tr -d ' '; }

printf '%s ig-keepalive start — %sh, %s rows\n' "$(date -u +%H:%M:%S)" "$HOURS" "$(count)" >> "$LOG"

PASS=0
while [ "$(date +%s)" -lt "$END" ]; do
  [ -f "$STOP" ] && { printf '%s ig-keepalive: stop file\n' "$(date -u +%H:%M:%S)" >> "$LOG"; break; }
  PASS=$((PASS + 1))
  BEFORE=$(count)

  "$NODE" harvest/ig-viral.mjs >> harvest/ig-viral.out 2>&1
  RC=$?

  AFTER=$(count)
  GAINED=$(( ${AFTER:-0} - ${BEFORE:-0} ))
  printf '%s ig-keepalive pass %s — rc=%s rows %s (+%s)\n' \
    "$(date -u +%H:%M:%S)" "$PASS" "$RC" "${AFTER:-0}" "$GAINED" >> "$LOG"

  # A pass that gains nothing twice running means the source is walled too,
  # and restarting it forever is what wasted last night on TikTok. Say so in
  # the log rather than looping silently.
  if [ "$GAINED" -eq 0 ] && [ "$PASS" -ge 2 ]; then
    printf '%s ig-keepalive: two passes with zero new rows — source may be walled\n' \
      "$(date -u +%H:%M:%S)" >> "$LOG"
  fi

  sleep 120
done

printf '%s ig-keepalive done — %s rows after %s pass(es)\n' "$(date -u +%H:%M:%S)" "$(count)" "$PASS" >> "$LOG"
echo "ig-keepalive finished — $(count) rows after $PASS pass(es)"
