// TikTok -> Instagram carousel mirror. Runs every 30 minutes (scheduled task HotelMozil-IgMirror).
//
// Every photo carousel he publishes on TikTok @hotelmozil is published again
// on Instagram @hotelmozil: the same slides in the same order, fitted to 4:5,
// with the same caption and its 5 hashtags.
//
// What it deliberately mirrors from TikTok rather than from our decks: he
// edits before posting (drops slides, adds his own 3:4 designs, rewrites the
// caption), so the TikTok post is the only record of what he chose.
//
// Each run:
//   1. refresh the Instagram token when it is a week old (it dies at 60 days)
//   2. finish a publish that a previous run left half-done
//   3. read the TikTok profile; every new photo post becomes "new"
//   4. a post at least MIN_AGE old is downloaded and fitted -> "ready"
//      (the hour gives him time to delete or fix a post before it spreads)
//   5. publish the oldest "ready" post, at most one per run and MIN_GAP
//      after the previous one, so a backlog never lands as a burst
//
// Held, never guessed: more than 10 slides (the API cap), a single slide, a
// video. Those get a toast and wait for him.
//
//   node ig/mirror.mjs                    normal run
//   node ig/mirror.mjs --dry              read + prepare only, publish nothing
//   node ig/mirror.mjs --since 2026-10-09 first run: mirror posts from this date on
//   node ig/mirror.mjs --now              ignore MIN_AGE and MIN_GAP (testing)

import fs from 'node:fs';
import path from 'node:path';
import { readProfile, downloadSlide } from './lib/tiktok.mjs';
import { fitSlide } from './lib/fit.mjs';
import { igCaption } from './lib/caption.mjs';
import { client, buildCarousel, publish, GraphError, MAX_ITEMS } from './lib/graph.mjs';
import { hostFiles, unhost } from './lib/host.mjs';
import { HANDLE, DIR, loadState, saveState, loadToken, saveToken, postDir, log, lock, unlock, toast } from './lib/store.mjs';

export const MIN_AGE_MIN = 60;
export const MIN_GAP_H = 3;
const MAX_ATTEMPTS = 3;
const REFRESH_AFTER_DAYS = 7;

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const DRY = flag('--dry');
const NOW = flag('--now');
const now = () => Math.floor(Date.now() / 1000);

async function refreshToken(tok) {
  const age = (Date.now() - Date.parse(tok.refreshedAt || tok.savedAt)) / 86400000;
  if (age < REFRESH_AFTER_DAYS) return tok;
  try {
    const r = await client(tok.token).refresh();
    const next = { ...tok, token: r.access_token, refreshedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + (r.expires_in || 5184000) * 1000).toISOString() };
    saveToken(next);
    log(`token: refreshed, valid until ${next.expiresAt.slice(0, 10)}`);
    return next;
  } catch (e) {
    log(`token: refresh failed: ${e.message}`);
    const left = (Date.parse(tok.expiresAt || 0) - Date.now()) / 86400000;
    if (left < 10) await toast('אינסטגרם: החיבור עומד לפוג', `נשארו ${Math.max(0, Math.floor(left))} ימים. לחיצה כפולה על "חיבור אינסטגרם" בשולחן העבודה`);
    return tok;
  }
}

/** A run that died between "container built" and "state saved as published". */
async function resume(state, tok) {
  const api = client(tok.token);
  for (const p of Object.values(state.posts).filter((x) => x.status === 'publishing')) {
    let code = null;
    try { code = (await api.get(p.creationId, { fields: 'status_code' })).status_code; } catch (e) { log(`resume ${p.id}: ${e.message}`); }
    if (code === 'PUBLISHED') {
      // It went out; find it so the record carries the link.
      const recent = await api.get(`${tok.igUserId}/media`, { fields: 'id,permalink,caption,timestamp', limit: 10 }).catch(() => ({ data: [] }));
      const hit = (recent.data || []).find((m) => (m.caption || '').trim() === p.caption.trim());
      Object.assign(p, { status: 'published', mediaId: hit?.id || null, permalink: hit?.permalink || null, publishedAt: new Date().toISOString() });
      log(`resume ${p.id}: was already published ${p.permalink || ''}`);
    } else if (code === 'FINISHED') {
      try {
        const r = await publish(api, tok.igUserId, p.creationId);
        Object.assign(p, { status: 'published', ...r, publishedAt: new Date().toISOString() });
        state.lastPublishedAt = p.publishedAt;
        log(`resume ${p.id}: published ${r.permalink}`);
      } catch (e) {
        p.attempts = (p.attempts || 0) + 1;
        p.error = e.message;
        if (p.attempts >= MAX_ATTEMPTS) { p.status = 'failed'; await toast('אינסטגרם: העלאה נכשלה', e.message.slice(0, 100)); }
        log(`resume ${p.id}: publish failed (attempt ${p.attempts}): ${e.message}`);
      }
    } else if (code === null) {
      log(`resume ${p.id}: status unknown, will ask again next run`);
    } else {
      Object.assign(p, { status: 'ready', creationId: null });
      log(`resume ${p.id}: container ${code || 'unknown'}, back to ready`);
    }
    saveState(state);
  }
}

async function prepare(ctx, page, p) {
  const dir = postDir(p.id);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const slides = [];
  for (const [i, im] of p.tiktok.images.entries()) {
    const raw = await downloadSlide(ctx, im);
    const name = `${String(i + 1).padStart(2, '0')}.jpg`;
    fs.writeFileSync(path.join(dir, `tt-${name}`), raw);
    const fit = await fitSlide(page, raw);
    fs.writeFileSync(path.join(dir, name), fit.buffer);
    slides.push({ name, mode: fit.mode, size: fit.size });
  }
  const { caption, tags, dropped } = igCaption(p.tiktok.desc);
  Object.assign(p, { status: 'ready', slides, caption, tags, droppedTags: dropped, preparedAt: new Date().toISOString() });
  log(`prepared ${p.id}: ${slides.length} slides (${slides.map((s) => s.mode).join(',')}), tags ${tags.join(' ')}`);
}

async function publishOne(state, tok, p) {
  const api = client(tok.token);
  const files = p.slides.map((s) => ({ name: s.name, path: path.join(postDir(p.id), s.name) }));
  try {
    const { urls } = await hostFiles(`${p.id}-${Date.now()}`, files, { workDir: DIR, log });
    const { creationId } = await buildCarousel(api, tok.igUserId, urls, p.caption);
    Object.assign(p, { status: 'publishing', creationId });
    saveState(state);
    const r = await publish(api, tok.igUserId, creationId);
    Object.assign(p, { status: 'published', ...r, publishedAt: new Date().toISOString(), error: null });
    state.lastPublishedAt = p.publishedAt;
    saveState(state);
    log(`PUBLISHED ${p.id} -> ${r.permalink}`);
    await toast('עלה לאינסטגרם ✅', `${p.slides.length} שקופיות. ${(p.caption.split('\n')[0] || '').slice(0, 60)}`);
  } catch (e) {
    p.attempts = (p.attempts || 0) + 1;
    p.error = e.message;
    if (p.status === 'publishing') {
      // The container exists; resume() asks Instagram what happened to it.
    } else if (e instanceof GraphError && e.isAuth) {
      p.status = 'ready';
      await toast('אינסטגרם: צריך להתחבר מחדש', 'החיבור לאינסטגרם פג או בוטל. לחיצה כפולה על "חיבור אינסטגרם" בשולחן העבודה');
    } else if (p.attempts >= MAX_ATTEMPTS) {
      p.status = 'failed';
      await toast('אינסטגרם: העלאה נכשלה', `אחרי ${p.attempts} ניסיונות: ${e.message.slice(0, 90)}`);
    } else {
      p.status = 'ready';
    }
    saveState(state);
    log(`publish ${p.id} failed (attempt ${p.attempts}): ${e.message}`);
  } finally {
    unhost({ workDir: DIR, log });
  }
}

async function main() {
  let state = loadState();
  if (!state) {
    const since = opt('--since');
    const cutoff = since ? Math.floor(Date.parse(since) / 1000) : now();
    state = { handle: HANDLE, cutoff, posts: {}, lastPublishedAt: null, notified: {} };
    log(`first run: mirroring TikTok posts created from ${new Date(cutoff * 1000).toISOString()}`);
  }
  state.notified ||= {};

  let tok = loadToken();
  if (tok && !DRY) {
    tok = await refreshToken(tok);
    await resume(state, tok);
  }

  // ---- TikTok: discover + prepare ----------------------------------------
  let ctx = null;
  try {
    const r = await readProfile(HANDLE, { workDir: DIR, log });
    ctx = r.ctx;
    for (const tp of r.posts) {
      if (state.posts[tp.id] || !tp.createTime || tp.createTime < state.cutoff) continue;
      if (tp.kind === 'video') { log(`skip ${tp.id}: video`); state.posts[tp.id] = { id: tp.id, status: 'skipped-video', createTime: tp.createTime }; continue; }
      if (tp.kind === 'unknown') {
        // Not marked seen: once the reader is fixed, the post is still picked up.
        log(`unknown post shape ${tp.id}: no images and no video`);
        if (!state.notified.unknownShape) {
          state.notified.unknownShape = new Date().toISOString();
          await toast('אינסטגרם: טיקטוק שינה משהו', 'פוסט חדש בלי שקופיות ובלי וידאו. המראה לא יעלה אותו עד שהקוד יתוקן.');
        }
        continue;
      }
      state.posts[tp.id] = { id: tp.id, createTime: tp.createTime, status: 'new', tiktok: tp, seenAt: new Date().toISOString(), attempts: 0 };
      log(`new TikTok carousel ${tp.id}: ${tp.images.length} slides`);
    }
    // Refresh the signed slide URLs of anything still waiting to be downloaded.
    for (const tp of r.posts) if (state.posts[tp.id]?.status === 'new') state.posts[tp.id].tiktok = tp;
    saveState(state);

    const page = await ctx.newPage();
    for (const p of Object.values(state.posts).filter((x) => x.status === 'new')) {
      if (!NOW && now() - p.createTime < MIN_AGE_MIN * 60) { log(`wait ${p.id}: younger than ${MIN_AGE_MIN} min`); continue; }
      const n = p.tiktok.images.length;
      if (n > MAX_ITEMS || n < 2) {
        p.status = 'held';
        p.held = n > MAX_ITEMS ? `${n} שקופיות, ובאינסטגרם דרך ה-API מותר עד ${MAX_ITEMS}` : 'שקופית אחת, זו לא קרוסלה';
        await toast('קרוסלה לא הועלתה לאינסטגרם', p.held);
        saveState(state);
        continue;
      }
      try { await prepare(ctx, page, p); } catch (e) { p.attempts++; p.error = e.message; log(`prepare ${p.id} failed: ${e.message}`); if (p.attempts >= MAX_ATTEMPTS) { p.status = 'failed'; await toast('אינסטגרם: הכנה נכשלה', e.message.slice(0, 100)); } }
      saveState(state);
    }
  } catch (e) {
    // Unknown, not "nothing new": nothing is marked seen, the next run retries.
    log(`tiktok read failed: ${e.message}`);
    state.tiktokFailures = (state.tiktokFailures || 0) + 1;
    if (state.tiktokFailures === 6) await toast('אינסטגרם: לא מצליח לקרוא את הטיקטוק', '3 שעות ברצף. הקרוסלות יחכו עד שזה יחזור.');
  } finally {
    if (ctx) { state.tiktokFailures = 0; await ctx.close(); }
    // The throwaway browser profiles are tens of MB each; never let them pile up.
    for (const d of fs.readdirSync(DIR)) if (d.startsWith('tt-profile-')) fs.rmSync(path.join(DIR, d), { recursive: true, force: true });
    saveState(state);
  }

  // ---- Instagram: publish ------------------------------------------------
  const ready = Object.values(state.posts).filter((x) => x.status === 'ready').sort((a, b) => a.createTime - b.createTime);
  if (!ready.length) return;
  if (DRY) { log(`dry: ${ready.length} ready, not publishing`); return; }
  if (!tok) {
    if (!state.notified.noToken) {
      await toast('קרוסלה מוכנה לאינסטגרם', 'מחכה לחיבור החשבון. לחיצה כפולה על "חיבור אינסטגרם" בשולחן העבודה');
      state.notified.noToken = new Date().toISOString();
      saveState(state);
    }
    log(`${ready.length} ready, waiting for ig/connect.mjs`);
    return;
  }
  const gapH = state.lastPublishedAt ? (Date.now() - Date.parse(state.lastPublishedAt)) / 3600000 : Infinity;
  if (!NOW && gapH < MIN_GAP_H) { log(`${ready.length} ready, next in ${(MIN_GAP_H - gapH).toFixed(1)}h (gap rule)`); return; }
  await publishOne(state, tok, ready[0]);
}

if (!lock()) { log('another run holds the lock, exiting'); process.exit(0); }
try { await main(); } catch (e) { log(`run failed: ${e.stack || e.message}`); process.exitCode = 1; } finally { unlock(); }
