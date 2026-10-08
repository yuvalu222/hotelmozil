// Does a Cypriot photograph of this stop exist at all? Probe before writing a
// query, and gate on the alt text — the picker will happily hand back the
// right subject in the wrong country (a flamingo lagoon in Gruissan, France,
// an Istanbul mosque, Göbeklitepe in Türkiye).
import { searchPexelsBrowser, closeBrowser } from '../lib/stock-browser.js';
const need = (process.argv[2] || 'cyprus').toLowerCase();
const queries = process.argv.slice(3);
for (const q of queries) {
  let r = [];
  try { r = await searchPexelsBrowser(q, { perPage: 12 }); } catch (e) { console.log(`  ERR ${q}: ${e.message}`); continue; }
  const hit = r.filter((x) => (x.alt || '').toLowerCase().includes(need));
  console.log(`"${q}" -> ${r.length} results, ${hit.length} say ${need}`);
  for (const x of hit.slice(0, 3)) console.log(`     ${x.id}  ${(x.alt || '').slice(0, 100)}`);
}
await closeBrowser();
