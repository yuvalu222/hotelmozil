#!/bin/sh
# Keep a long session actually moving, without depending on me to remember.
#
# WHY. The Stop hook stops me CLAIMING work that is not running; it cannot make
# work happen. Between turns I do not exist — only a message from the owner or
# a background task FINISHING brings me back. The harvest runs for hours and
# finishes once, so on its own the research in research/GAPS.md would sit still
# until then.
#
# THE FAILURE THIS VERSION FIXES. The first version fired once. After it woke
# me I had to start the next one by hand, so the whole chain rested on me not
# forgetting — which is exactly the thing he has watched break: *"שכשאני חוזר
# בוודאות הכל מוכן ולא נרדמת באמצע כמו שאתה עושה לפעמים."*
#
# So each cycle now SPAWNS THE NEXT ONE BEFORE IT EXITS. The chain continues
# whether or not I do anything, and it also restarts the harvest if that has
# died. The only thing that stops it is `touch harvest/.pacer.stop`, or the
# machine going down.
#
#   sh harvest/pacer.sh [minutes] [cycles-remaining]

MINS="${1:-12}"
LEFT="${2:-40}"
cd "$(dirname "$0")/.." || exit 1
LOG=harvest/pacer.log
STOP=harvest/.pacer.stop

[ -f "$STOP" ] && { printf '%s pacer: stop file present, exiting\n' "$(date -u +%H:%M:%S)" >> "$LOG"; exit 0; }

printf '%s pacer cycle start — %s min, %s left\n' "$(date -u +%H:%M:%S)" "$MINS" "$LEFT" >> "$LOG"
sleep $((MINS * 60))
[ -f "$STOP" ] && { printf '%s pacer: stopped during sleep\n' "$(date -u +%H:%M:%S)" >> "$LOG"; exit 0; }

# The harvest dies quietly when TikTok starts refusing. Bring it back rather
# than reporting a number that stopped moving an hour ago.
if [ -f harvest/.explore.lock ] && kill -0 "$(cat harvest/.explore.lock 2>/dev/null)" 2>/dev/null; then
  STATE="explorer alive"
else
  rm -f harvest/.explore.lock
  nohup sh harvest/supervise-explore.sh >> harvest/explore-run.out 2>&1 &
  STATE="explorer was dead — restarted"
fi

DECKS=$(ls harvest/tt-decks 2>/dev/null | wc -l | tr -d ' ')
ROWS=$(wc -l < harvest/tt-final.jsonl 2>/dev/null | tr -d ' ')

# Hand the baton on BEFORE exiting. This is the whole point: my exit is the
# wake-up, and the next wake-up must already be scheduled by then.
NEXT=$((LEFT - 1))
if [ "$NEXT" -gt 0 ]; then
  nohup sh harvest/pacer.sh "$MINS" "$NEXT" >> harvest/pacer-run.out 2>&1 &
  HANDOFF="next cycle armed ($NEXT left)"
else
  HANDOFF="LAST CYCLE — chain ends here"
fi

printf '%s pacer wake — decks=%s rows=%s · %s · %s\n' \
  "$(date -u +%H:%M:%S)" "$DECKS" "$ROWS" "$STATE" "$HANDOFF" >> "$LOG"
echo "decks=$DECKS rows=$ROWS · $STATE · $HANDOFF"
