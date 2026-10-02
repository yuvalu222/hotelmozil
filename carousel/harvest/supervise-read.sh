#!/bin/sh
# Keep the carousel reader alive overnight.
#
# The reader is the patient one: it waits before its first request, moves at
# roughly a post a minute, and backs off for minutes when TikTok answers with
# its 218-character refusal shell. This wrapper exists so that a crash, a DNS
# blip or a killed browser never ends the night's work — the reader keeps its
# place in ttr-done.json, so a restart resumes rather than repeats.

cd "$(dirname "$0")/.." || exit 1
export PATH="/c/Program Files/nodejs:/usr/bin:/bin:$PATH"
NODE="/c/Program Files/nodejs/node"
[ -x "$NODE" ] || NODE="$(command -v node)"

LOG=harvest/supervisor-read.log
i=0

echo "=== read supervisor start $(date -u +%H:%M:%S) ===" >> "$LOG"

while [ "$i" -lt 200 ]; do
  i=$((i + 1))

  n=0
  while [ "$n" -lt 60 ]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://www.tiktok.com/ 2>/dev/null)
    [ "$code" = "200" ] && break
    n=$((n + 1))
    echo "$(date -u +%H:%M:%S) net not ready ('$code'), waiting" >> "$LOG"
    sleep 30
  done

  # only the first run waits out the cold start; restarts get straight to work
  if [ "$i" = "1" ]; then TT_COLD_MS=900000; else TT_COLD_MS=120000; fi
  export TT_COLD_MS

  echo "$(date -u +%H:%M:%S) start #$i (cold ${TT_COLD_MS}ms)" >> "$LOG"
  "$NODE" harvest/tt-read.mjs >> harvest/ttread-run.out 2>&1
  rc=$?

  kept=$(wc -l < harvest/tt-final.jsonl 2>/dev/null | tr -d ' ')
  [ -z "$kept" ] && kept=0
  seen=$(node -e "try{console.log(JSON.parse(require('fs').readFileSync('harvest/ttr-done.json','utf8')).length)}catch(e){console.log(0)}" 2>/dev/null)
  echo "$(date -u +%H:%M:%S) exit rc=$rc — kept $kept, read $seen" >> "$LOG"

  if grep -aq "^DONE reader" harvest/ttread-run.out 2>/dev/null; then
    echo "$(date -u +%H:%M:%S) queue drained — stopping" >> "$LOG"
    break
  fi

  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -match 'p-read' } | ForEach-Object { try { Stop-Process -Id \$_.ProcessId -Force } catch {} }" >/dev/null 2>&1
  sleep 30
done

echo "=== read supervisor done after $i run(s) $(date -u +%H:%M:%S) ===" >> "$LOG"
