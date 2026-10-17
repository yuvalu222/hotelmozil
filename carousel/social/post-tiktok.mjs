// Upload a photo carousel to TikTok through TikTok Studio on the web (16.10).
// Off-screen, in the logged-in social profile. DRY RUN by default: uploads the
// photos, fills title + hashtags + sound, screenshots, and closes WITHOUT
// posting. --post clicks "לפרסם", only after the owner said go for this post.
//   node social/post-tiktok.mjs <folder> --title "..." --tags "#a #b #c #d #e" --sound "<search>" --sound-match "<author>" [--post]
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const folder = argv[0], title = opt('--title'), tags = opt('--tags') || '', sound = opt('--sound'), soundMatch = opt('--sound-match') || sound;
const POST = argv.includes('--post');
const shots = path.join(folder, '_upload'); fs.mkdirSync(shots, { recursive: true });
const files = fs.readdirSync(folder).filter((f) => /^\d\d\.jpg$/.test(f)).sort().map((f) => path.join(folder, f));
if (!files.length || files.length > 35) throw new Error('slides: ' + files.length);
if ([...tags.matchAll(/#\S+/g)].length !== 5) throw new Error('need exactly 5 hashtags');
if (/[\u0600-\u06FF]/.test(tags + title)) throw new Error('Arabic in title/hashtags');
if (title.length > 90) throw new Error('title over 90 chars');
// IRON RULE (owner, 17.10): never a post without music
if (!sound) throw new Error('refused: --sound is required, no post goes up without music');

const PROFILE = path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'social-profile');
const ctx = await chromium.launchPersistentContext(PROFILE, {
  channel: 'chrome', headless: false, viewport: { width: 1400, height: 1100 },
  args: ['--disable-blink-features=AutomationControlled', '--window-position=-32000,-32000', '--window-size=1400,1100'],
});
const page = await ctx.newPage();
const shot = (n) => page.screenshot({ path: path.join(shots, n + '.png'), fullPage: true });
try {
  await page.goto('https://www.tiktok.com/tiktokstudio/upload?from=webapp', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(10000);
  await page.getByText('תמונות', { exact: true }).first().click();
  await page.waitForTimeout(2500);
  await page.setInputFiles('input[type=file][accept*="image"]', files);
  // wait for every thumbnail
  for (let i = 0; i < 90; i++) {
    const n = await page.locator('text=/לפרסם/').count();
    if (n) break; await page.waitForTimeout(1000);
  }
  await page.waitForTimeout(8000);

  // title (0/90) and description editor
  const titleBox = page.locator('input[placeholder*="כותרת"], textarea[placeholder*="כותרת"]').first();
  await titleBox.click(); await titleBox.fill(title);
  const desc = page.locator('[contenteditable="true"]').first();
  await desc.click();
  for (const t of tags.split(/\s+/).filter(Boolean)) {
    await page.keyboard.type(t, { delay: 60 });
    await page.waitForTimeout(1500);
    await page.keyboard.press('Escape').catch(() => {});
    await page.keyboard.type(' ', { delay: 30 });
  }
  await page.waitForTimeout(1500);

  // sound
  if (sound) {
    await page.getByText('להוסיף סאונד').first().click();
    await page.waitForTimeout(4000);
    const search = page.locator('input[placeholder*="סאונד"], input[placeholder*="ound"]').first();
    await search.fill(sound); await search.press('Enter');
    await page.waitForTimeout(6000);
    await shot('sound-search');
    const rows = page.locator('[class*="music" i], [class*="Music" i], li, [role=listitem]').filter({ hasText: soundMatch }).filter({ has: page.getByText('Use', { exact: true }) });
    const n = await rows.count();
    console.log('sound rows matching', soundMatch, n);
    if (!n) {
      const list = (await page.locator('[role=dialog]').last().innerText().catch(() => '')).replace(/\s*\n+\s*/g, ' | ');
      console.log('search results:', list.slice(0, 900));
      await page.getByText('מועדפים', { exact: true }).click().catch(() => {});
      await page.waitForTimeout(4000);
      console.log('favorites tab:', (await page.locator('[role=dialog]').last().innerText().catch(() => '')).replace(/\s*\n+\s*/g, ' | ').slice(0, 900));
      throw new Error('sound not found: ' + soundMatch);
    }
    // the innermost element holding the match and exactly one "Use" button is the row
    const use = await page.evaluateHandle((m) => {
      const els = [...document.querySelectorAll('[role=dialog] *')].filter((e) => e.innerText && e.innerText.includes(m));
      const rowsOne = els.filter((e) => [...e.querySelectorAll('button, [role=button], div, span')].filter((b) => b.innerText?.trim() === 'Use').length >= 1)
        .filter((e) => [...e.querySelectorAll('*')].filter((b) => b.children.length === 0 && b.innerText?.trim() === 'Use').length === 1);
      rowsOne.sort((a, b) => a.innerText.length - b.innerText.length);
      const row = rowsOne[0]; if (!row) return null;
      window.__hmRow = row.innerText;
      return [...row.querySelectorAll('*')].find((b) => b.children.length === 0 && b.innerText?.trim() === 'Use');
    }, soundMatch);
    console.log('chosen sound row:', (await page.evaluate(() => window.__hmRow || '')).replace(/\s*\n+\s*/g, ' | ').slice(0, 160));
    if (!(await use.asElement())) throw new Error('no Use button for ' + soundMatch);
    await use.asElement().click();
    await page.waitForTimeout(4000);
  }
  await shot('filled');
  const form = (await page.evaluate(() => document.body.innerText)).replace(/\s*\n+\s*/g, ' | ');
  console.log('FORM', form.slice(form.indexOf('פרטים'), form.indexOf('פרטים') + 700));
  if (POST) {
    // the form's own "סאונד" field (the sidebar also says "סאונדים ללא תמלוגים", which comes first in the page text)
    const at = form.indexOf('| סאונד |', form.indexOf('פרטים'));
    const end = form.indexOf('| תמונות', at);
    if (at < 0 || end < 0 || !/להחליף/.test(form.slice(at, end))) throw new Error('refused: no sound is attached to the post');
    await page.getByRole('button', { name: 'לפרסם', exact: true }).click();
    await page.waitForTimeout(15000);
    await shot('posted');
    console.log('after post url', page.url());
    console.log((await page.evaluate(() => document.body.innerText)).replace(/\s*\n+\s*/g, ' | ').slice(0, 600));
  } else console.log('DRY RUN: not posted. Screenshots in', shots);
} finally { await ctx.close(); }
