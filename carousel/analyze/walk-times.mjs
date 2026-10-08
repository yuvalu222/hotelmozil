// Minutes between consecutive stops, from real routed distance.
//
// The route decks live or die on the connector between stops — it is what
// makes the slide a route rather than a list. The precedent prints its own
// numbers; copying them would be taking a stranger's figures as fact. These
// are computed instead, by a method stated in full:
//
//   1. each stop's coordinates from OpenStreetMap Nominatim (open data)
//   2. the route between them from the public Valhalla instance at
//      valhalla1.openstreetmap.de, with the PEDESTRIAN costing for walking
//      legs and AUTO for driving legs — a real router over the real footpath
//      graph, bridges, stairs and cut-throughs included
//   3. rounded to 5 minutes — a one-minute figure would be false precision
//
// ⚠️ WHY NOT OSRM. The public OSRM server hosts only the car profile, and
// asking it for `foot` does not fail: it answers with a car route, and all
// three profiles return byte-identical results. Using it put 30 minutes
// between the Eiffel Tower and the Trocadéro, 2.49 km, because a car has to
// drive round to a bridge. Valhalla walks the Pont d'Iéna: 1.28 km, 19 min.
// Caught on 8.10 by asking OSRM for all three profiles on one leg.
//
//   node analyze/walk-times.mjs research/routes/<file>.json
//
// Input: { city, en?: {he->lookup}, chains: { "1": [...stops] },
//          modes?: { "1": "foot" | "car" } }     default foot
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('usage: node analyze/walk-times.mjs <routes.json>'); process.exit(1); }
const spec = JSON.parse(fs.readFileSync(file, 'utf8'));
const UA = 'HotelMozil-carousel/1.0 (hotelmozil@gmail.com)';
const CACHE = 'research/geocode-cache.json';
const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(q) {
  if (q in cache) return cache[q];
  const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='
    + encodeURIComponent(q);
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`nominatim ${r.status} for ${q}`);
  const j = await r.json();
  await sleep(1100);                                   // their policy: 1 req/s
  if (!j.length) return null;        // NOT cached: a miss is a gap to fix, not a fact
  // "Kition" came back as a statue of Zeno of Kition, and "Finikoudes" as a
  // multi-storey car park. A result sharing no significant word with the
  // question is a different place, and is reported rather than used quietly.
  const want = q.split(',')[0].toLowerCase().split(/s+/).filter((w) => w.length > 3);
  const got = String(j[0].display_name).toLowerCase();
  if (want.length && !want.some((w) => got.includes(w))) {
    console.error(`  !! "${q}" matched "${j[0].display_name.slice(0, 60)}" — `
      + 'nothing in common. Check the name.');
  }
  cache[q] = { lat: +j[0].lat, lon: +j[0].lon, name: j[0].display_name };
  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1));
  return cache[q];
}

/** Real routed minutes and km for a costing, or null. */
async function leg(a, b, costing) {
  const body = JSON.stringify({
    locations: [{ lat: a.lat, lon: a.lon }, { lat: b.lat, lon: b.lon }],
    costing, units: 'kilometers',
  });
  for (let try_ = 0; try_ < 3; try_++) {
    try {
      const r = await fetch('https://valhalla1.openstreetmap.de/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
        body,
      });
      await sleep(700);
      if (!r.ok) continue;
      const j = await r.json();
      const s = j.trip && j.trip.summary;
      if (s) return { km: s.length, min: s.time / 60 };
    } catch { await sleep(1500); }
  }
  return null;
}

const R = 6371;
const straight = (a, b) => {
  const rad = (d) => d * Math.PI / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const WALK_KMH = 4.8;
const r5 = (m) => Math.max(5, Math.round(m / 5) * 5);
const out = {};
let fell = 0;
for (const [label, stops] of Object.entries(spec.chains)) {
  const mode = (spec.modes && spec.modes[label]) || 'foot';
  out[label] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const look = (n) => (spec.at && spec.at[n]) || (spec.en && spec.en[n]) || n;
    const qa = look(stops[i]);
    const qb = look(stops[i + 1]);
    // A miss on "<stop>, <city>" is usually the suffix confusing Nominatim,
    // so the bare name is tried too before the leg is given up on.
    const A = await geocode(`${qa}, ${spec.city}`) || await geocode(qa);
    const B = await geocode(`${qb}, ${spec.city}`) || await geocode(qb);
    if (!A || !B) {
      console.error(`  ??  ${stops[i]} -> ${stops[i + 1]}: ${!A ? qa : qb} not found`);
      out[label].push({ from: stops[i], to: stops[i + 1], minutes: null, mode });
      continue;
    }
    const costing = mode === 'car' ? 'auto' : 'pedestrian';
    let rt = await leg(A, B, costing);
    let how = `valhalla ${costing}`;
    if (!rt) {                                  // straight line, declared as such
      const km = straight(A, B) * 1.3;
      rt = { km, min: (km / WALK_KMH) * 60 };
      how = 'straight line x1.3 (router unreachable)';
      fell++;
    }
    const minutes = r5(rt.min);
    out[label].push({ from: stops[i], to: stops[i + 1], km: +rt.km.toFixed(2), minutes, mode, how });
    console.log(`  ${String(minutes).padStart(3)} min ${mode === 'car' ? 'drive' : 'walk '}`
      + `  ${stops[i]} -> ${stops[i + 1]}  (${rt.km.toFixed(2)} km, ${how})`);
  }
}
const dest = file.replace(/\.json$/, '-walks.json');
fs.writeFileSync(dest, JSON.stringify({
  _: 'Routed by the public Valhalla instance at valhalla1.openstreetmap.de over '
    + 'OpenStreetMap: pedestrian costing for walking legs, auto for driving. '
    + 'Coordinates from Nominatim. Rounded to 5 minutes.',
  city: spec.city, legs: out,
}, null, 2) + '\n');
console.log(`\n-> ${dest}${fell ? `  (${fell} leg(s) fell back to a straight line)` : ''}`);
