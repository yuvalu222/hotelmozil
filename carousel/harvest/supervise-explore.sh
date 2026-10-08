#!/bin/sh
# Keep the explorer alive. It holds recon/p-card, so nothing else may run
# against that profile at the same time — a second holder looks exactly like a
# TikTok block and already cost this session several hours.
cd "$(dirname "$0")/.." || exit 1
export PATH="/c/Program Files/nodejs:/usr/bin:/bin:$PATH"
NODE="/c/Program Files/nodejs/node"
[ -x "$NODE" ] || NODE="$(command -v node)"
LOG=harvest/supervisor-explore.log
LOCK=harvest/.explore.lock
if [ -f "$LOCK" ] && kill -0 "$(cat "$LOCK" 2>/dev/null)" 2>/dev/null; then
  echo "$(date -u +%H:%M:%S) already running" >> "$LOG"; exit 0
fi
echo $$ > "$LOCK"; trap 'rm -f "$LOCK"' EXIT INT TERM
i=0
while [ "$i" -lt 60 ]; do
  i=$((i + 1))
  n=0
  while [ "$n" -lt 40 ]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://www.tiktok.com/ 2>/dev/null)
    [ "$code" = "200" ] && break
    n=$((n + 1)); echo "$(date -u +%H:%M:%S) net not ready ('$code')" >> "$LOG"; sleep 20
  done
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -match 'p-card' } | ForEach-Object { try { Stop-Process -Id \$_.ProcessId -Force } catch {} }" >/dev/null 2>&1
  sleep 2
  echo "$(date -u +%H:%M:%S) explore start #$i" >> "$LOG"
  "$NODE" harvest/tt-explore.mjs >> harvest/ttexplore-run.out 2>&1
  echo "$(date -u +%H:%M:%S) explore exit rc=$? — kept $(wc -l < harvest/tt-final.jsonl 2>/dev/null | tr -d ' ')" >> "$LOG"
  grep -aq "^DONE explore" harvest/ttexplore-run.out 2>/dev/null && break
  sleep 20
done
echo "$(date -u +%H:%M:%S) explore supervisor done after $i run(s)" >> "$LOG"
