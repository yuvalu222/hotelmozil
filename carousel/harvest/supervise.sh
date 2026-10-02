#!/bin/sh
# Supervisor: keep the carousel harvester alive no matter how it dies.
#
# Written because the pattern all night was: harvester hits one new error
# class, exits, and nothing runs until a human looks. Every failure seen so
# far — ERR_NAME_NOT_RESOLVED, ERR_NETWORK_CHANGED, "Page crashed",
# an uncaught throw inside the blocked-handler — is survivable by just
# starting again, because the harvester keeps its progress in
# ttf-seen.json / ttf-q.json and skips what it already did.
#
# Also waits for the network to come back before restarting, so a flapping
# connection burns sleep instead of burning queries.

cd "$(dirname "$0")/.." || exit 1
export PATH="/c/Program Files/nodejs:/usr/bin:/bin:$PATH"
# resolve node once, by absolute path: a bare `node` resolved to nothing
# under the supervisor shell and every run exited 127 instantly.
NODE="/c/Program Files/nodejs/node"
[ -x "$NODE" ] || NODE="$(command -v node)"

LOG=harvest/supervisor.log
MAX=400          # restarts before giving up entirely
i=0

echo "=== supervisor start $(date -u +%H:%M:%S) ===" >> "$LOG"

while [ "$i" -lt "$MAX" ]; do
  i=$((i + 1))

  # don't restart into a dead network
  n=0
  while [ "$n" -lt 40 ]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://www.tiktok.com/ 2>/dev/null)
    [ "$code" = "200" ] && break
    n=$((n + 1))
    echo "$(date -u +%H:%M:%S) net not ready (got '$code'), waiting" >> "$LOG"
    sleep 30
  done

  echo "$(date -u +%H:%M:%S) start #$i" >> "$LOG"
  "$NODE" harvest/tt-final.mjs >> harvest/ttf-run.out 2>&1
  rc=$?

  kept=$(wc -l < harvest/tt-final.jsonl 2>/dev/null | tr -d ' ')
  [ -z "$kept" ] && kept=0
  echo "$(date -u +%H:%M:%S) exit rc=$rc after run #$i — kept so far: $kept" >> "$LOG"

  # a clean finish means the query list is exhausted; nothing left to retry
  if [ "$rc" = "0" ] && grep -aq "^DONE " harvest/ttf-run.out 2>/dev/null; then
    echo "$(date -u +%H:%M:%S) harvester finished its query list — stopping" >> "$LOG"
    break
  fi

  # clear any browser the dead process left holding the profile
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -match 'p-final' } | ForEach-Object { try { Stop-Process -Id \$_.ProcessId -Force } catch {} }" >/dev/null 2>&1
  sleep 20
done

echo "=== supervisor done after $i run(s) $(date -u +%H:%M:%S) ===" >> "$LOG"
