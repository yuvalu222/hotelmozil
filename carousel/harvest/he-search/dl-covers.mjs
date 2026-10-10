import fs from 'node:fs';
const h = Object.values(JSON.parse(fs.readFileSync('hits.json', 'utf8'))).filter((x) => x.heb && x.cover);
let ok = 0, bad = 0;
const queue = [...h];
async function worker() {
  for (let x; (x = queue.shift());) {
    const f = `covers/${x.id}.jpg`;
    if (fs.existsSync(f)) { ok++; continue; }
    try {
      const r = await fetch(x.cover, { headers: { Referer: 'https://www.tiktok.com/', 'User-Agent': 'Mozilla/5.0 Chrome/152.0' } });
      if (!r.ok) { bad++; continue; }
      fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); ok++;
    } catch { bad++; }
  }
}
await Promise.all(Array.from({ length: 8 }, worker));
console.log('ok', ok, 'bad', bad);
