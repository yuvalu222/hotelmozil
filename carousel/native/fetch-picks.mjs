// Download every picked photo at 1440px wide (Unsplash's own resize), once.
import fs from 'node:fs';
import path from 'node:path';
const HERE = import.meta.dirname;
const pool = JSON.parse(fs.readFileSync(path.join(HERE, 'pool', 'pool.json'), 'utf8'));
const picks = JSON.parse(fs.readFileSync(path.join(HERE, 'picks.json'), 'utf8'));
const out = path.join(HERE, 'pool', 'full');
fs.mkdirSync(out, { recursive: true });
const ids = new Set();
const walk = (v) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { if (v.id) ids.add(v.id); else Object.values(v).forEach(walk); } };
walk(picks);
for (const id of ids) {
  const f = path.join(out, `${id}.jpg`);
  if (fs.existsSync(f)) continue;
  const r = await fetch(`${pool[id].raw}&w=1440&fm=jpg&q=90`);
  if (!r.ok) { console.log(id, r.status); continue; }
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
}
console.log(ids.size, 'photos in', out);
