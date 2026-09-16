#!/bin/sh
# Search engines rate-limited this IP (Brave returned 429, DDG 202-with-no-results).
# Throttles lift with time, so retry in long cycles through the night. Queries
# that got no answer were deliberately left unmarked, so each pass picks them up.
for i in $(seq 1 24); do
  echo "--- enum pass $i at $(date) ---"
  node harvest/ig-enum.mjs >> harvest/ig-enum.out 2>&1
  SKIP_ENUM=1 node harvest/ig.mjs >> harvest/ig-fetch.out 2>&1
  sleep 900
done
echo "ENUM RETRY LOOP FINISHED"
