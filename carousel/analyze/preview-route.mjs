// Render one tt-route slide and open it, before converting any deck to it.
//
// The last format change went the other way round — I changed the layout, then
// rebuilt two decks, then looked, three times. Rendering one slide first costs
// seconds and is the step that was missing.
//
//   node analyze/preview-route.mjs

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { slideMarkup2 } from '../lib/skins.js';

// Real content and real photographs from the Amalfi deck, re-cut to three
// stops with the lines the source format has room for.
const spec = JSON.parse(fs.readFileSync('specs/tt-26-amalfi.json', 'utf8'));
const move = spec.slides.find((s) => s.title === 'איך זזים');
const files = (move.images || []).map((e) => e.file).filter(Boolean);

const toDataUri = (f) => {
  if (!f || !fs.existsSync(f)) return '';
  return `data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}`;
};
const photos = files.map(toDataUri);

const slide = {
  layout: 'tt-route',
  badge: 'יום 2',
  title: 'חוף אמלפי ברגל',
  items: [
    { name: 'פוזיטאנו', time: 'שעתיים', price: 'חינם', to: 'מעבורת 30 דקות' },
    { name: 'קתדרלת אמלפי', time: '45 דקות', price: '3 יורו', to: 'אוטובוס 25 דקות' },
    { name: 'וילה רופולו, ראוולו', time: 'שעה', price: '7 יורו', to: 'הליכה 10 דקות' },
    { name: 'וילה צימברונה', time: 'שעה', price: '10 יורו', to: 'אוטובוס 40 דקות' },
    { name: 'שקיעה בסורנטו', time: 'שעה', price: 'חינם' },
  ],
};

const browser = await chromium.launch({
  channel: 'chrome', headless: true,
  args: ['--force-color-profile=srgb', '--font-render-hinting=none'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(path.resolve('lib/template2.html')).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.evaluate((h) => { document.getElementById('slide').innerHTML = h; },
  slideMarkup2(slide, { photos, debug: false }));
await page.evaluate(() => document.fonts.ready);

fs.mkdirSync(path.join('out', '_preview'), { recursive: true });
const out = path.join('out', '_preview', 'route.jpg');
await page.screenshot({ path: out, type: 'jpeg', quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1920 } });

// What the gates would say about it.
const m = await page.evaluate(() => {
  const r = (sel) => [...document.querySelectorAll(sel)].map((n) => {
    const b = n.getBoundingClientRect();
    const cs = getComputedStyle(n);
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    return { t: (n.textContent || '').trim().slice(0, 30), right: Math.round(b.right),
             lines: Math.max(1, Math.round(b.height / lh)) };
  });
  const all = [...document.querySelectorAll('.rt-name,.rt-line-txt,.rt-thumb')];
  const maxRight = Math.max(...all.map((n) => n.getBoundingClientRect().right));
  const tops = [...document.querySelectorAll('.rt-badge,.rt-head')].map((n) => n.getBoundingClientRect().top);
  const minTop = Math.min(...tops);
  return { rows: r('.rt-line-txt'), maxRight: Math.round(maxRight), minTop: Math.round(minTop) };
});
console.log(`right edge ${m.maxRight} (rail starts at 930)  head top ${m.minTop} (header ends at 240)`);
for (const x of m.rows) console.log(`  ${x.lines} line(s)  "${x.t}"`);
console.log(path.resolve(out));
await browser.close();
