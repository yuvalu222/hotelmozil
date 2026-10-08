#!/bin/sh
# Keep the drain running until the queue is empty.
#
# The reader itself cannot throw out of its loop, so this wrapper is only for
# the failures above it: a killed browser, a crashed node, a DNS blip. Progress
# lives in ttd-done.json, so every restart resumes instead of repeating.

cd "$(dirname "$0")/.." || exit 1
export PATH="/c/Program Files/nodejs:/usr/bin:/bin:$PATH"
NODE="/c/Program Files/nodejs/node"
[ -x "$NODE" ] || NODE="$(command -v node)"

LOG=harvest/supervisor-drain.log
i=0

# Only one supervisor may ever run: two of them kill each other's browser
# (each clears chrome on p-card before starting), which looks exactly like a
# TikTok block and cost most of this session.
LOCK=harvest/.drain.lock
if [ -f "$LOCK" ]; then
  owner=$(cat "$LOCK" 2>/dev/null)
  if kill -0 "$owner" 2>/dev/null; then
    echo "$(date -u +%H:%M:%S) another supervisor ($owner) holds the lock — exiting" >> "$LOG"
    exit 0
  fi
fi
echo $$ > "$LOCK"
trap 'rm -f "$LOCK"' EXIT INT TERM

echo "=== drain supervisor start $(date -u +%H:%M:%S) ===" >> "$LOG"

while [ "$i" -lt 400 ]; do
  i=$((i + 1))

  # wait for the network, but never forever
  n=0
  while [ "$n" -lt 40 ]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://www.tiktok.com/ 2>/dev/null)
    [ "$code" = "200" ] && break
    n=$((n + 1))
    echo "$(date -u +%H:%M:%S) net not ready ('$code')" >> "$LOG"
    sleep 20
  done

  # nothing else may hold the profile
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -match 'p-card' } | ForEach-Object { try { Stop-Process -Id \$_.ProcessId -Force } catch {} }" >/dev/null 2>&1
  sleep 2

  echo "$(date -u +%H:%M:%S) start #$i" >> "$LOG"
  "$NODE" harvest/tt-drain.mjs >> harvest/ttdrain-run.out 2>&1
  rc=$?

  kept=$(wc -l < harvest/tt-final.jsonl 2>/dev/null | tr -d ' ')
  [ -z "$kept" ] && kept=0
  echo "$(date -u +%H:%M:%S) exit rc=$rc — kept $kept" >> "$LOG"

  # Draining the queue is NOT a reason to stop while the collector is still
  # finding URLs. The collector runs for hours and keeps appending to
  # ttf-seen.json; a reader that exits the moment it catches up leaves every
  # later find unread, with nothing in any log saying why. So: if the
  # collector still holds its lock, wait and go round again.
  if grep -aq "^DONE drain" harvest/ttdrain-run.out 2>/dev/null; then
    if [ -f harvest/.photo.lock ] && kill -0 "$(cat harvest/.photo.lock 2>/dev/null)" 2>/dev/null; then
      echo "$(date -u +%H:%M:%S) caught up, collector still running — waiting for more" >> "$LOG"
      : > harvest/ttdrain-run.out
      sleep 240
      continue
    fi
    echo "$(date -u +%H:%M:%S) queue drained and collector finished — stopping" >> "$LOG"
    break
  fi
  sleep 20
done

echo "=== drain supervisor done after $i run(s) $(date -u +%H:%M:%S) ===" >> "$LOG"
