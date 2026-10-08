#!/bin/sh
# Search-only collector. Runs on its own profile (p-final) because search needs
# a warmed session and post pages refuse one — see tt-final.mjs. It never opens
# a post: it only drops qualifying URLs into the drain's queue.
cd "$(dirname "$0")/.." || exit 1
export PATH="/c/Program Files/nodejs:/usr/bin:/bin:$PATH"
NODE="/c/Program Files/nodejs/node"
[ -x "$NODE" ] || NODE="$(command -v node)"
LOG=harvest/supervisor-search.log
LOCK=harvest/.search.lock
if [ -f "$LOCK" ] && kill -0 "$(cat "$LOCK" 2>/dev/null)" 2>/dev/null; then
  echo "$(date -u +%H:%M:%S) already running" >> "$LOG"; exit 0
fi
echo $$ > "$LOCK"; trap 'rm -f "$LOCK"' EXIT INT TERM
i=0
while [ "$i" -lt 40 ]; do
  i=$((i + 1))
  echo "$(date -u +%H:%M:%S) search start #$i" >> "$LOG"
  TT_COLLECT_ONLY=1 "$NODE" harvest/tt-final.mjs >> harvest/ttsearch-run.out 2>&1
  echo "$(date -u +%H:%M:%S) search exit rc=$?" >> "$LOG"
  grep -aq "queries exhausted\|DONE" harvest/ttsearch-run.out 2>/dev/null && break
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -match 'p-final' } | ForEach-Object { try { Stop-Process -Id \$_.ProcessId -Force } catch {} }" >/dev/null 2>&1
  sleep 25
done
echo "$(date -u +%H:%M:%S) search supervisor done after $i run(s)" >> "$LOG"
