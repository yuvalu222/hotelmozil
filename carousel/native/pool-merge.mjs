// Merge side pools (pin-pool.mjs run with PIN_POOL=...) into pool/pool.json.
//   node native/pool-merge.mjs pool/side-a.json pool/side-b.json ...
import fs from 'node:fs';
import path from 'node:path';
const HERE = import.meta.dirname;
const mainFile = path.join(HERE, 'pool', 'pool.json');
const main = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
let n = 0;
for (const f of process.argv.slice(2)) {
  const side = JSON.parse(fs.readFileSync(path.resolve(f), 'utf8'));
  for (const [k, v] of Object.entries(side)) if (!main[k]) { main[k] = v; n++; }
}
fs.writeFileSync(mainFile, JSON.stringify(main, null, 1));
console.log('merged', n, 'new photos; pool now', Object.keys(main).length);
