// Is the audit trail actually complete? Every stop on a route needs a figure
// entry, and every figure needs a source that says where it came from.
//
// The point of research/*-figures.json is that a number on a slide can be
// traced back to the operator who set it. A stop with no entry, or an entry
// with no `src`, is a number nobody can check — which is the same as a number
// somebody made up.
//
//   node analyze/audit-research.mjs
import fs from 'node:fs';

let bad = 0;
for (const f of fs.readdirSync('research/routes').filter((x) => /^[a-z]+\.json$/.test(x))) {
  const id = f.replace('.json', '');
  const R = JSON.parse(fs.readFileSync(`research/routes/${f}`, 'utf8'));
  const figFile = `research/${id}-figures.json`;
  if (!fs.existsSync(figFile)) { console.error(`${id}: no figures file`); bad++; continue; }
  const F = JSON.parse(fs.readFileSync(figFile, 'utf8')).stops || {};
  const stops = Object.values(R.chains || {}).flat();
  const missing = stops.filter((s) => !F[s]);
  const unsourced = stops.filter((s) => F[s] && !F[s].src);
  const priceless = stops.filter((s) => F[s] && !F[s].price);
  const orphan = Object.keys(F).filter((s) => !stops.includes(s));
  console.log(`${id.padEnd(9)} ${String(stops.length).padStart(2)} stops`
    + `  ${missing.length ? `${missing.length} with no figures` : 'all have figures'}`
    + `  ${unsourced.length ? `${unsourced.length} unsourced` : 'all sourced'}`
    + `  ${priceless.length ? `${priceless.length} with no price` : 'all priced'}`
    + `${orphan.length ? `  (${orphan.length} entries no longer on a route)` : ''}`);
  for (const s of [...missing, ...unsourced, ...priceless]) console.error(`   ! ${s}`);
  bad += missing.length + unsourced.length + priceless.length;
}
console.log(bad ? `\n${bad} gap(s) in the audit trail` : '\nevery figure on every route traces to a source');
process.exit(bad ? 1 : 0);
