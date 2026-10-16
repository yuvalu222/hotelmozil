// WOW scorer (16.10). Runs CLIP ViT-L/14 inside Chrome (transformers.js on
// WebAssembly): every Python runtime on this PC fails on a missing VC++ DLL,
// and the browser path needs nothing installed. Model files cache in the
// persistent profile, so only the first run downloads them.
//   aes = LAION improved-aesthetic-predictor v2 (AVA+SAC+logos). Its MLP has
//         no activations, so it collapses to one dot product (models/laion_linear.json).
//   awe = CLIP similarity to "dream" prompts minus "ordinary" prompts, written
//         from the owner's own WOW photos (vivid pink/orange sunsets over sea,
//         turquoise water ringed by limestone cliffs, infinity pools).
// Results cached in pool/wow.json keyed by photo id.
//   node native/wow-score.mjs                  score every unscored pool photo
//   node native/wow-score.mjs --files a.jpg …  score arbitrary files (prints)
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const HERE = import.meta.dirname;
const CACHE = path.join(HERE, 'pool', 'wow.json');
const LIN = JSON.parse(fs.readFileSync(path.join(HERE, 'models', 'laion_linear.json'), 'utf8'));
const POS = ['a breathtaking dreamlike photo of a tropical beach at sunset with a pink and orange sky',
  'a stunning turquoise lagoon surrounded by dramatic limestone cliffs, travel photography',
  'an awe-inspiring aerial drone photo of a paradise island with crystal clear water',
  'a jaw-dropping sunset over the sea with silhouettes of palm trees',
  'a luxury infinity pool overlooking the ocean at golden hour',
  'a viral travel photo that makes you want to book a flight immediately'];
const NEG = ['an ordinary snapshot of a beach on a cloudy day', 'a dull, flat, overcast photo',
  'a boring photo of a street or a building', 'a blurry low quality phone photo',
  'a stock photo of a product on a white background'];

const ctx = await chromium.launchPersistentContext(path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'clip-profile'), { channel: 'chrome', headless: true });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('page:', m.text().slice(0, 200)); });
await page.goto('https://huggingface.co/robots.txt');
await page.addScriptTag({ type: 'module', content: `
  import { AutoProcessor, CLIPVisionModelWithProjection, AutoTokenizer, CLIPTextModelWithProjection, RawImage, env }
    from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.5';
  env.backends.onnx.wasm.numThreads = navigator.hardwareConcurrency || 4;
  const M = 'Xenova/clip-vit-large-patch14';
  const processor = await AutoProcessor.from_pretrained(M);
  const vision = await CLIPVisionModelWithProjection.from_pretrained(M, { dtype: 'q8' });
  const tok = await AutoTokenizer.from_pretrained(M);
  const text = await CLIPTextModelWithProjection.from_pretrained(M, { dtype: 'q8' });
  const norm = (a) => { let s = 0; for (const x of a) s += x * x; s = Math.sqrt(s); return Array.from(a, (x) => x / s); };
  window.textEmb = async (prompts) => { const t = tok(prompts, { padding: true, truncation: true }); const { text_embeds } = await text(t);
    const d = text_embeds.dims[1]; return prompts.map((_, i) => norm(text_embeds.data.slice(i * d, (i + 1) * d))); };
  window.imgEmb = async (url) => { const im = await RawImage.fromURL(url); const inp = await processor(im); const { image_embeds } = await vision(inp); return norm(image_embeds.data); };
  window.ready = true;` });
await page.waitForFunction(() => window.ready === true, null, { timeout: 0, polling: 2000 });
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const tp = await page.evaluate((p) => window.textEmb(p), POS);
const tn = await page.evaluate((p) => window.textEmb(p), NEG);

async function scoreFile(f) {
  const url = 'data:image/jpeg;base64,' + fs.readFileSync(f).toString('base64');
  const e = await page.evaluate((u) => window.imgEmb(u), url);
  const aes = dot(e, LIN.w) + LIN.b;
  const awe = (tp.reduce((s, t) => s + dot(e, t), 0) / tp.length - tn.reduce((s, t) => s + dot(e, t), 0) / tn.length) * 100;
  return { aes: +aes.toFixed(3), awe: +awe.toFixed(3) };
}

const fi = process.argv.indexOf('--files');
if (fi > 0) {
  for (const f of process.argv.slice(fi + 1)) console.log(JSON.stringify(await scoreFile(f)), f);
} else {
  const pool = JSON.parse(fs.readFileSync(path.join(HERE, 'pool', 'pool.json'), 'utf8'));
  const cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
  // --only q1,q2 (substring match on the pool query) limits scoring to the slots being filled
  const oi = process.argv.indexOf('--only');
  const only = oi > 0 ? process.argv[oi + 1].split(',').map((s) => s.trim().toLowerCase()) : null;
  const todo = Object.keys(pool).filter((i) => !cache[i] && fs.existsSync(path.join(HERE, 'pool', 'thumbs', i + '.jpg'))
    && (!only || only.some((q) => (pool[i].query || '').toLowerCase().includes(q))));
  let n = 0;
  for (const i of todo) {
    try { cache[i] = await scoreFile(path.join(HERE, 'pool', 'thumbs', i + '.jpg')); } catch (e) { console.log(i, e.message.slice(0, 80)); }
    if (++n % 25 === 0) { fs.writeFileSync(CACHE, JSON.stringify(cache)); console.log(`${n}/${todo.length}`); }
  }
  fs.writeFileSync(CACHE, JSON.stringify(cache));
  console.log('scored', Object.keys(cache).length);
}
await ctx.close();
