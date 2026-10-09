// State, token, lock, log and toast for the mirror. Everything here lives
// outside every repo, in %LOCALAPPDATA%\HotelMozil\ig, because the token is
// a secret and the site repo is public.

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';

export const HANDLE = 'hotelmozil'; // the same handle on TikTok and Instagram

export const DIR = process.env.HM_IG_DIR || path.join(process.env.LOCALAPPDATA || '.', 'HotelMozil', 'ig');
fs.mkdirSync(DIR, { recursive: true });

const STATE = path.join(DIR, 'state.json');
const TOKEN = path.join(DIR, 'token.json');
const LOCK = path.join(DIR, 'run.lock');
export const LOG = path.join(DIR, 'mirror.log');

const readJson = (f, fallback) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return fallback; } };
const writeJson = (f, v) => { fs.writeFileSync(f + '.tmp', JSON.stringify(v, null, 2)); fs.renameSync(f + '.tmp', f); };

export const loadState = () => readJson(STATE, null);
export const saveState = (s) => writeJson(STATE, s);
export const loadToken = () => readJson(TOKEN, null);
export const saveToken = (t) => writeJson(TOKEN, t);
export const postDir = (id) => path.join(DIR, 'posts', id);

export function log(...a) {
  const line = `[${new Date().toISOString()}] ${a.join(' ')}`;
  console.log(line);
  try { fs.appendFileSync(LOG, line + '\n'); } catch { /* console still has it */ }
}

/** One run at a time. A lock older than 20 minutes belongs to a dead run. */
export function lock() {
  try {
    const st = fs.statSync(LOCK);
    if (Date.now() - st.mtimeMs < 20 * 60 * 1000) return false;
  } catch { /* no lock */ }
  fs.writeFileSync(LOCK, String(process.pid));
  return true;
}
export const unlock = () => { try { fs.rmSync(LOCK); } catch { /* gone */ } };

/**
 * Windows toast. Title and body travel as environment variables, so Hebrew
 * and quotes never pass through PowerShell's parser.
 */
export function toast(title, body) {
  log(`notify: ${title} | ${body}`);
  if (process.platform !== 'win32' || process.env.HM_IG_NO_TOAST) return Promise.resolve();
  const ps = [
    '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null',
    '$t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)',
    '$x = $t.GetElementsByTagName("text")',
    '$x.Item(0).AppendChild($t.CreateTextNode($env:HM_T)) > $null',
    '$x.Item(1).AppendChild($t.CreateTextNode($env:HM_B)) > $null',
    '$app = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe"',
    '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show([Windows.UI.Notifications.ToastNotification]::new($t))',
  ].join('; ');
  const enc = Buffer.from(ps, 'utf16le').toString('base64');
  return new Promise((resolve) => {
    execFile('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', enc],
      { env: { ...process.env, HM_T: title, HM_B: body }, windowsHide: true }, () => resolve());
  });
}
