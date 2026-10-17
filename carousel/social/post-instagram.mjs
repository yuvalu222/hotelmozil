// Upload to Instagram through instagram.com (17.10). Off-screen, in the
// logged-in social profile. DRY RUN by default: selects the media, sets the
// crop, writes the caption, screenshots every step, and closes WITHOUT
// sharing. --post clicks Share, only after the owner said go for that post.
//
// IRON RULE (owner, 17.10): never a post without music.
//   - A carousel can't carry music from the web or the API (the phone app is
//     the only place), so a carousel is never shared from here.
//   - A Reel carries its own soundtrack: make it with social/make-reel.mjs
//     (licensed music baked in). Sharing a video requires an audio stream,
//     checked with ffprobe before anything is clicked.
//
//   node social/post-instagram.mjs --video <reel.mp4> --caption "..." [--post]
//   node social/post-instagram.mjs <ig-folder> --caption "..."      (dry run only)
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
const video = opt('--video');
const folder = video ? path.dirname(video) : argv[0];
const caption = opt('--caption') || '';
const POST = argv.includes('--post');
if (/[؀-ۿ]/.test(caption)) throw new Error('Arabic in caption');

// Owner, 17.10, after the traps deck went up as a Reel video: "awful, you
// uploaded it as a video, not as photos you can swipe through". A deck is
// never posted as a video. Instagram posts are swipeable photo carousels with
// music, and music on a carousel is added in the Instagram app only.
if (video) throw new Error('refused: decks go up as swipeable photos, never as a video (owner, 17.10)');

let files;
if (video) {
  const info = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height', '-of', 'json', video], { encoding: 'utf8' }));
  if (!info.streams.some((s) => s.codec_type === 'audio')) throw new Error('refused: the reel has no audio stream, and no post goes up without music');
  files = [video];
} else {
  if (POST) throw new Error('refused: Instagram web cannot add music to a carousel; post a Reel (social/make-reel.mjs) instead');
  files = fs.readdirSync(folder).filter((f) => /^\d\d\.jpg$/.test(f)).sort().map((f) => path.join(folder, f));
  if (!files.length || files.length > 10) throw new Error('Instagram takes 1-10 slides, got ' + files.length);
}
const shots = path.join(folder, '_upload'); fs.mkdirSync(shots, { recursive: true });

const PROFILE = path.join(process.env.LOCALAPPDATA, 'HotelMozil', 'social-profile');
const ctx = await chromium.launchPersistentContext(PROFILE, {
  channel: 'chrome', headless: false, viewport: { width: 1400, height: 1000 },
  args: ['--disable-blink-features=AutomationControlled', '--window-position=-32000,-32000', '--window-size=1400,1000'],
});
const page = await ctx.newPage();
let step = 0;
const shot = async (n) => page.screenshot({ path: path.join(shots, `ig-${String(++step).padStart(2, '0')}-${n}.png`) });
const dialogText = async () => (await page.locator('[role=dialog]').last().innerText().catch(() => '')).replace(/\s*\n+\s*/g, ' | ').slice(0, 500);
const clickText = async (re, what) => {
  const el = page.locator('[role=dialog] [role=button], [role=dialog] button, [role=dialog] div[role=button]').filter({ hasText: re }).last();
  if (!(await el.count())) throw new Error('not found: ' + what + ' | dialog: ' + (await dialogText()));
  await el.click();
};
try {
  await page.goto('https://www.instagram.com/', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(8000);
  // "Create" in the side bar, then "Post" if a sub-menu opens
  await page.locator('svg[aria-label="פוסט חדש"], svg[aria-label="New post"], svg[aria-label="יצירה"], svg[aria-label="Create"]').first().click();
  await page.waitForTimeout(2500);
  const postItem = page.locator('a, div[role=button], span').filter({ hasText: /^(פוסט|Post)$/ }).first();
  if (await postItem.count()) { await postItem.click().catch(() => {}); await page.waitForTimeout(2500); }
  await shot('create');
  const fileInput = page.locator('input[type=file]').last();
  await fileInput.waitFor({ state: 'attached', timeout: 60000 });
  await fileInput.setInputFiles(files);
  await page.waitForTimeout(video ? 15000 : 8000);
  // a notice that video posts are now shared as reels: accept it
  const ok = page.locator('[role=dialog] button, [role=dialog] [role=button]').filter({ hasText: /^(אישור|OK)$/ }).last();
  if (await ok.count()) { await ok.click().catch(() => {}); await page.waitForTimeout(2000); }
  await shot('selected');
  // crop: carousel -> 4:5 so nothing is cut; reel -> original (it is already 9:16)
  const cropBtn = page.locator('svg[aria-label*="חיתוך"], svg[aria-label*="crop" i]').first();
  await cropBtn.click();
  await page.waitForTimeout(1500);
  const want = video ? /^(מקור|Original)$/ : /^4:5$/;
  await page.locator('[role=dialog] [role=button], [role=dialog] button, [role=dialog] div').filter({ hasText: want }).last().click();
  await page.waitForTimeout(1500);
  await shot('crop');
  await clickText(/^(הבא|Next)$/, 'Next (crop)');
  await page.waitForTimeout(4000);
  await shot('edit');
  // switches by their visible label: returns [checked, handle]; checked is read from aria-checked/checked
  const switchState = async (labelRe) => page.evaluate((src) => {
    const re = new RegExp(src);
    const sw = [...document.querySelectorAll('[role=dialog] input[type=checkbox], [role=dialog] [role=switch]')];
    for (const s of sw) {
      let el = s, txt = '';
      for (let k = 0; k < 6 && el && !re.test(txt); k++) { el = el.parentElement; txt = el ? el.innerText || '' : ''; }
      if (re.test(txt)) { s.setAttribute('data-hm-switch', src); return s.checked ?? (s.getAttribute('aria-checked') === 'true'); }
    }
    return null;
  }, labelRe.source);
  if (video) {
    // the reel's own soundtrack must stay on: no post goes up without music
    let on = await switchState(/צליל|Sound|Audio/);
    console.log('sound switch before:', on);
    if (on === false) { await page.locator('[data-hm-switch]').first().click({ force: true }); await page.waitForTimeout(1000); on = await switchState(/צליל|Sound|Audio/); }
    if (on !== true) throw new Error('refused: could not confirm the reel sound switch is on (state ' + on + ')');
    console.log('sound switch: on');
  }
  await clickText(/^(הבא|Next)$/, 'Next (edit)');
  await page.waitForTimeout(4000);
  const box = page.locator('[role=dialog] [contenteditable="true"], [role=dialog] textarea').first();
  await box.click();
  await page.keyboard.insertText(caption);
  await page.waitForTimeout(1500);
  // a trailing space closes the hashtag suggestion list
  await page.keyboard.type(' ');
  await page.waitForTimeout(1500);
  // the photos are real: the "made with AI" label must stay off
  const ai = await switchState(/AI/);
  console.log('AI label switch:', ai);
  if (ai === true) { await page.locator('[data-hm-switch]').last().click({ force: true }); await page.waitForTimeout(800); }
  if ((await switchState(/AI/)) === true) throw new Error('refused: the AI label is on');
  await shot('caption');
  console.log('DIALOG', await dialogText());
  if (POST) {
    await clickText(/^(שיתוף|Share)$/, 'Share');
    let done = false;
    for (let i = 0; i < 120 && !done; i++) {
      const t = await dialogText();
      if (/שותף|שותפה|has been shared|Post shared|Reel shared|הפוסט שלך שותף|הסרטון שלך שותף/.test(t)) { console.log('SHARED:', t); done = true; break; }
      await page.waitForTimeout(2000);
    }
    await shot('shared');
    if (!done) throw new Error('no "shared" confirmation within 4 minutes | dialog: ' + (await dialogText()));
  } else console.log('DRY RUN: not shared. Screenshots in', shots);
} catch (e) {
  await shot('error').catch(() => {});
  throw e;
} finally { await ctx.close(); }
