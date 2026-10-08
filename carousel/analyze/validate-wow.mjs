// Does the wow score actually separate decks people save from decks they
// scroll? If it does not, it is worth nothing and must not be wired in — the
// first colour gate ran backwards against his verdicts and shipped anyway.
import fs from 'node:fs';
import path from 'node:path';
import { wow, closeWow } from '../lib/wow.js';

const perf = new Map();
const seen = new Set();
for (const line of fs.readFileSync('harvest/tt-final.jsonl', 'utf8').split('\n')) {
  const t = line.trim(); if (!t) continue;
  let d; try { d = JSON.parse(t); } catch { continue; }
  if (seen.has(d.id)) continue; seen.add(d.id);
  if (d.saves && d.likes) perf.set(String(d.id), d.saves / d.likes);
}
const decks = [...perf.entries()].sort((a, b) => b[1] - a[1]);
const take = 45;
const groups = { top: decks.slice(0, take), bottom: decks.slice(-take) };

for (const [name, list] of Object.entries(groups)) {
  const scores = [];
  for (const [id] of list) {
    const dir = path.join('harvest/tt-decks', id);
    if (!fs.existsSync(dir)) continue;
    const f = fs.readdirSync(dir).filter((x) => /\.jpg$/i.test(x)).sort()[1];
    if (!f) continue;
    try { scores.push((await wow(path.join(dir, f))).total); } catch { /* skip */ }
  }
  scores.sort((a, b) => a - b);
  const med = scores[Math.floor(scores.length / 2)];
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  console.log(`${name.padEnd(7)} n=${String(scores.length).padStart(3)}  median ${med.toFixed(3)}  mean ${mean.toFixed(3)}`
    + `  p25 ${scores[Math.floor(scores.length*0.25)].toFixed(3)}  p75 ${scores[Math.floor(scores.length*0.75)].toFixed(3)}`);
}
await closeWow();
