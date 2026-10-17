// Upload a carousel to Instagram through instagram.com (17.10). Off-screen, in
// the logged-in social profile. DRY RUN by default: selects the photos, sets
// the 4:5 crop, writes the caption, screenshots every step, and closes
// WITHOUT sharing. --post clicks Share, only after the owner said go.
// Use the 4:5 set from social/prep-ig.mjs (clean images, no TikTok watermark).
//   node social/post-instagram.mjs <ig-folder> --caption "..." [--post]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const folder = argv[0], caption = opt('--caption') || '';
const POST = argv.includes('--post');
// IRON RULE (owner, 17.10): never a post without music. instagram.com has no
// music option for feed posts or carousels (checked on the create flow and on
// Edit), and the Graph API has none for carousels either. So this route may
// never share: it stays a dry run until a route with music exists.
if (POST) throw new Error('refused: Instagram web cannot add music, and no post goes up without music');
const files = fs.readdirSync(folder).filter((f) => /^\d\d\.jpg$/.test(f)).sort().map((f) => path.join(folder, f));
if (!files.length || files.length > 10) throw new Error('Instagram takes 1-10 slides, got ' + files.length);
if (/[؀-ۿ]/.test(caption)) throw new Error('Arabic in caption');
const shots = path.join(folder, '_upload'); fs.mkdirSync(shots, { recursive: true });

const PROFILE = path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'social-profile');
const ctx = await chromium.launchPersistentContext(PROFILE, {
  channel: 'chrome', headless: false, viewport: { width: 1400, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--window-position=-32000,-32000', '--window-size=1400,1000'],
});
const page = await ctx.newPage();
let step = 0;
const shot = async (n) => page.screenshot({ path: path.join(shots, `ig-${String(++step).padStart(2, '0')}-${n}.png`) });
const dialogText = async () => (await page.locator('[role=dialog]').last().innerText().catch(() => '')).replace(/\s*\n+\s*/g, ' | ').slice(0, 400);
const clickText = async (re, what) => {
  const el = page.locator('[role=dialog] [role=button], [role=dialog] button, [role=dialog] div[role=button]').filter({ hasText: re }).last();
  if (!(await el.count())) throw new Error('not found: ' + what + ' | dialog: ' + (await dialogText()));
  await el.click();
};
try {
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  // "Create" in the side bar (svg aria-label), then "Post" if a sub-menu opens
  await page.locator('svg[aria-label="פוסט חדש"], svg[aria-label="New post"], svg[aria-label="יצירה"], svg[aria-label="Create"]').first().click();
  await page.waitForTimeout(2500);
  const postItem = page.locator('a, div[role=button], span').filter({ hasText: /^(פוסט|Post)$/ }).first();
  if (await postItem.count()) { await postItem.click().catch(() => {}); await page.waitForTimeout(2500); }
  await shot('create');
  const fileInput = page.locator('input[type=file][accept*="image"]').last();
  await fileInput.waitFor({ state: 'attached', timeout: 60000 });
  await fileInput.setInputFiles(files);
  await page.waitForTimeout(8000);
  await shot('selected');
  // crop: Instagram defaults to 1:1; set 4:5 so nothing is cut
  const labels = await page.$$eval('svg[aria-label]', (a) => a.map((s) => s.getAttribute('aria-label')));
  console.log('svg labels', JSON.stringify([...new Set(labels)]));
  const cropBtn = page.locator('svg[aria-label*="חיתוך"], svg[aria-label*="crop" i]').first();
  await cropBtn.click();
  await page.waitForTimeout(1500);
  await page.locator('[role=dialog] [role=button], [role=dialog] button, [role=dialog] div').filter({ hasText: /^4:5$/ }).last().click();
  await page.waitForTimeout(1500);
  await shot('crop-4x5');
  await clickText(/^(הבא|Next)$/, 'Next (crop)');
  await page.waitForTimeout(3000);
  await shot('filters');
  await clickText(/^(הבא|Next)$/, 'Next (filters)');
  await page.waitForTimeout(3000);
  const box = page.locator('[role=dialog] [contenteditable="true"], [role=dialog] textarea').first();
  await box.click();
  await page.keyboard.insertText(caption);
  await page.waitForTimeout(1500);
  // a trailing space closes the hashtag suggestion list
  await page.keyboard.type(' ');
  await page.waitForTimeout(1500);
  await shot('caption');
  console.log('DIALOG', await dialogText());
  if (POST) {
    await clickText(/^(שיתוף|Share)$/, 'Share');
    for (let i = 0; i < 60; i++) {
      const t = await dialogText();
      if (/שותף|has been shared|Post shared|הפוסט שלך שותף/.test(t)) { console.log('SHARED:', t); break; }
      await page.waitForTimeout(2000);
    }
    await shot('shared');
  } else console.log('DRY RUN: not shared. Screenshots in', shots);
} catch (e) {
  await shot('error').catch(() => {});
  throw e;
} finally { await ctx.close(); }
