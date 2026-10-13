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
  if (fs.existsSync(f) && !process.argv.includes('--refresh')) continue;
  // 13.10: a fixed w=1440 left wide photos short of 1920 tall, so the slide
  // upscaled them (blurry). Ask for the width that covers 1440x1920.
  const ar = pool[id].w && pool[id].h ? pool[id].w / pool[id].h : 0.75;
  const W = Math.min(4000, Math.max(1440, Math.ceil(1920 * ar * 1.02)));
  const src = pool[id].source === 'pexels' ? `${pool[id].raw}?auto=compress&cs=tinysrgb&w=${W}` : `${pool[id].raw}&w=${W}&fm=jpg&q=90`;
  const r = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/152.0' } });
  if (!r.ok) { console.log(id, r.status); continue; }
  fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
}
console.log(ids.size, 'photos in', out);
