#!/bin/sh
# Keep the photo-tab collector alive. Runs on recon/p-final and WARMS, which is
# what search needs; the cold reader on p-card must never share this profile.
cd "$(dirname "$0")/.." || exit 1
export PATH="/c/Program Files/nodejs:/usr/bin:/bin:$PATH"
NODE="/c/Program Files/nodejs/node"
[ -x "$NODE" ] || NODE="$(command -v node)"
LOG=harvest/supervisor-photo.log
LOCK=harvest/.photo.lock
if [ -f "$LOCK" ] && kill -0 "$(cat "$LOCK" 2>/dev/null)" 2>/dev/null; then
  echo "$(date -u +%H:%M:%S) already running" >> "$LOG"; exit 0
fi
echo $$ > "$LOCK"; trap 'rm -f "$LOCK"' EXIT INT TERM
i=0
while [ "$i" -lt 80 ]; do
  i=$((i + 1))
  n=0
  while [ "$n" -lt 40 ]; do
    code=$(curl -s -o /dev/null -w "%{http_code}" -m 10 https://www.tiktok.com/ 2>/dev/null)
    [ "$code" = "200" ] && break
    n=$((n + 1)); echo "$(date -u +%H:%M:%S) net not ready ('$code')" >> "$LOG"; sleep 20
  done
  powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \"Name='chrome.exe'\" | Where-Object { \$_.CommandLine -match 'p-final' } | ForEach-Object { try { Stop-Process -Id \$_.ProcessId -Force } catch {} }" >/dev/null 2>&1
  sleep 2
  echo "$(date -u +%H:%M:%S) photo start #$i" >> "$LOG"
  "$NODE" harvest/tt-photo.mjs >> harvest/ttphoto-run.out 2>&1
  echo "$(date -u +%H:%M:%S) photo exit rc=$? — queue $(node -e "try{console.log(JSON.parse(require('fs').readFileSync('harvest/ttf-seen.json','utf8')).length)}catch(e){console.log(0)}")" >> "$LOG"
  # ORDER MATTERS. The collector prints SEARCH WALLED and then falls through
  # to its DONE line, so checking DONE first made the supervisor treat a wall
  # as "finished the sweep" and exit for good — 618 queries left unrun.
  #
  # A session-wide login wall is not something a quick restart fixes. Give it
  # a long rest instead of hammering, which is what deepened it in the first
  # place. The reader keeps working through the queue meanwhile.
  if grep -aq "^SEARCH WALLED" harvest/ttphoto-run.out 2>/dev/null; then
    # Measured, not guessed: while this profile was walled, a FRESH profile
    # answered every one of the same queries with 24 carousels. The wall lives
    # in the profile's stored state, so the profile is what gets thrown away.
    # Resting does nothing for it; only rotation does.
    echo "$(date -u +%H:%M:%S) walled — rotating the profile and continuing" >> "$LOG"
    rm -rf recon/p-final 2>/dev/null
    : > harvest/ttphoto-run.out
    sleep 30
    continue
  fi

  grep -aq "^DONE photo-tab" harvest/ttphoto-run.out 2>/dev/null && break
  sleep 25
done
echo "$(date -u +%H:%M:%S) photo supervisor done after $i run(s)" >> "$LOG"
