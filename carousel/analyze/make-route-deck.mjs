// Assemble a route deck spec from the research files, so no part of it is
// typed twice and nothing is chosen at assembly time.
//
//   stops            research/routes/<id>.json        (from the precedent deck)
//   walking minutes  research/routes/<id>-walks.json  (computed from OSM)
//   price and time   research/<id>-figures.json       (verified, with a source)
//   photo query      research/routes/<id>.json -> shots
//
// The row photo query is written next to the stop it belongs to and carried
// into the spec with `for`, which is what lib/wiring.js checks. Generating
// both from one place is what makes a stale query impossible rather than
// merely detectable.
//
//   node analyze/make-route-deck.mjs <routes-id> <spec-id>
import fs from 'node:fs';

const [rid, sid] = process.argv.slice(2);
const R = JSON.parse(fs.readFileSync(`research/routes/${rid}.json`, 'utf8'));
const W = JSON.parse(fs.readFileSync(`research/routes/${rid}-walks.json`, 'utf8'));
const F = JSON.parse(fs.readFileSync(`research/${rid}-figures.json`, 'utf8')).stops;
const specPath = `specs/${sid}.json`;
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));

const cover = spec.slides[0];
const slides = [cover];
let missing = [];

for (const [label, stops] of Object.entries(R.chains)) {
  const legs = W.legs[label];
  const items = stops.map((name, i) => {
    const f = F[name];
    if (!f) { missing.push(name); return { name: `📍 ${name}` }; }
    const leg = legs[i];
    // a leg the router cannot speak to, replaced by stated text (see the
    // routes file's legText for why each one is there)
    const forced = R.legText && R.legText[label] && R.legText[label][String(i)];
    return {
      name: `📍 ${name}`,
      time: f.time,
      price: f.price,
      // the connector says how you actually get there — the Larnaka chains
      // after the first are drives, and calling a 24 km leg a walk is a lie
      ...(forced ? { to: forced }
        : leg && leg.minutes
          ? { to: `${leg.minutes} דקות ${(R.modeWords && R.modeWords[label]) || (leg.mode === 'car' ? 'ברכב' : 'הליכה')}` }
          : {}),
    };
  });
  // one backdrop, then one photo per row, in order — lib/wiring.js enforces it
  const images = [
    { query: R.backdrop[label], backdrop: true },
    ...stops.map((n) => ({
      query: R.shots[n],
      for: `📍 ${n}`,
      // the stock description has to name the country, or the picker is free
      // to hand back the right subject in the wrong place
      // `must` is any-of and `mustAll` is all-of (lib/stock.js). A row needs
      // its own subject AND its own country, which only mustAll can say: with
      // [cyprus] alone five rows came back as five different seafronts, and
      // with [castle] alone they came back from five different countries.
      ...(R.mustAll || (R.must && R.must[n])
        ? { mustAll: (R.soloMust || []).includes(n) && R.must && R.must[n]
          ? [].concat(R.must[n])
          : [...(R.mustAll ? [R.mustAll] : []), ...(R.must && R.must[n] ? [].concat(R.must[n]) : [])] }
        : {}),
      // A photograph chosen by hand, because the picker kept handing this
      // row to a different one. lib/stock.js honours keep+id+file.
      ...(R.pin && R.pin[n]
        ? { keep: true, id: R.pin[n], file: `cache/${R.pin[n]}.jpg` }
        : {}),
      ...((R.anyCountry || []).includes(n) ? { anyCountry: true } : {}),
    })),
  ];
  slides.push({
    layout: 'tt-route',
    badge: `${R.slideWord} ${label}`,
    title: R.areas[label],
    items,
    images,
  });
}

// The closing slide all three precedents end on: "<CITY> DONE 🇮🇹 / WHICH CITY
// NEXT?" — an ask, on a photograph, with nothing else on it.
slides.push({
  layout: 'tt-tiny',
  pos: 'upper',
  titleCaps: R.closing.line1,
  line: R.closing.line2,
  note: R.closing.emoji,
  alt: R.closing.alt,
  image: { query: R.closing.query, must: R.closing.must },
});

spec.slides = slides;
fs.writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n');
console.log(`${sid}: ${slides.length} slides `
  + `(cover + ${Object.keys(R.chains).length} routes + closing), `
  + `${Object.values(R.chains).flat().length} stops`);
if (missing.length) {
  console.error(`!! no verified figures for: ${missing.join(', ')}`);
  process.exit(1);
}
