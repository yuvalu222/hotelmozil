#!/bin/sh
# Keep the harvest alive for hours, as ONE long-running task.
#
# WHAT THIS REPLACES, AND WHY. pacer.sh tried to be self-renewing: each cycle
# spawned its successor with `nohup ... &` before exiting, so the chain would
# survive me forgetting. It did not survive at all. A process started with
# nohup from inside a tool shell call is killed when that call ends — the log
# proves it, with a chain that announced "next cycle armed (47 left)" at
# 19:28 and never wrote another line. For three hours I believed it was
# running because I had watched the first cycle work inside the same window.
#
# What DOES survive is a background task started by the harness itself. So the
# design is now honest about which half is which:
#
#   this script          one harness task, loops for hours, keeps the harvest
#                        running. Survives whether or not I do anything.
#   pacer.sh             one short harness task per turn, whose exit wakes me.
#                        Depends on me starting it, which the Stop hook forces.
#
# Nothing here wakes me. That is the point: this is the part that must not
# depend on me being awake.
#
#   sh harvest/keepalive.sh [hours]     # default 8

HOURS="${1:-8}"
cd "$(dirname "$0")/.." || exit 1
LOG=harvest/keepalive.log
STOP=harvest/.keepalive.stop
END=$(( $(date +%s) + HOURS * 3600 ))

printf '%s keepalive start — %sh\n' "$(date -u +%H:%M:%S)" "$HOURS" >> "$LOG"

while [ "$(date +%s)" -lt "$END" ]; do
  [ -f "$STOP" ] && { printf '%s keepalive: stop file\n' "$(date -u +%H:%M:%S)" >> "$LOG"; break; }

  if [ -f harvest/.explore.lock ] && kill -0 "$(cat harvest/.explore.lock 2>/dev/null)" 2>/dev/null; then
    STATE="alive"
  else
    rm -f harvest/.explore.lock
    sh harvest/supervise-explore.sh >> harvest/explore-run.out 2>&1 &
    STATE="was dead — restarted"
  fi

  DECKS=$(ls harvest/tt-decks 2>/dev/null | wc -l | tr -d ' ')
  printf '%s keepalive — decks=%s explorer %s\n' "$(date -u +%H:%M:%S)" "$DECKS" "$STATE" >> "$LOG"
  sleep 600
done

DECKS=$(ls harvest/tt-decks 2>/dev/null | wc -l | tr -d ' ')
printf '%s keepalive done — decks=%s\n' "$(date -u +%H:%M:%S)" "$DECKS" >> "$LOG"
echo "keepalive finished — decks=$DECKS"
