#!/bin/sh
# Re-run the Instagram post fetcher as the enumerator feeds it new shortcodes.
# ig-done.json makes each pass skip what is already harvested.
for i in $(seq 1 40); do
  SKIP_ENUM=1 node harvest/ig.mjs >> harvest/ig-fetch.out 2>&1
  sleep 60
done
echo "IG LOOP FINISHED"
