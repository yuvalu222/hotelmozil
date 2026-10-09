// One-time: connect the mirror to Instagram @hotelmozil.
//
// Copy the token from the Meta App Dashboard (Instagram > API setup with
// Instagram business login > Generate token), then run this. It reads the
// clipboard, so there is nothing to paste into a terminal:
//
//   node ig/connect.mjs            reads the token from the clipboard
//   node ig/connect.mjs <token>
//
// A dashboard token is long-lived, 60 days ("Access tokens from the App
// Dashboard are long-lived and are valid for 60 days", get-started doc,
// 9.10.2026). mirror.mjs refreshes it weekly, so this runs once, not every
// two months.

import { execFileSync } from 'node:child_process';
import { client } from './lib/graph.mjs';
import { saveToken, loadState, saveState, log, HANDLE } from './lib/store.mjs';

const fromClipboard = () => {
  try {
    return execFileSync('powershell.exe', ['-NoProfile', '-Command', 'Get-Clipboard -Raw'], { encoding: 'utf8' }).trim();
  } catch { return ''; }
};

const token = (process.argv[2] || fromClipboard()).replace(/\s+/g, '');
if (!/^[A-Za-z0-9_|-]{40,}$/.test(token)) {
  console.error('לא נמצא טוקן. העתק את הטוקן מ-Meta (Generate token) והרץ שוב.');
  process.exit(2);
}

const api = client(token);
let me;
try {
  me = await api.get('me', { fields: 'user_id,username,account_type,media_count' });
  if (Array.isArray(me.data)) me = me.data[0];
} catch (e) {
  console.error(`הטוקן לא עובד: ${e.message}`);
  process.exit(1);
}
if (String(me.username).toLowerCase() !== HANDLE) {
  console.error(`הטוקן שייך ל-@${me.username}, לא ל-@${HANDLE}. לא נשמר.`);
  process.exit(1);
}

// Publishing quota doubles as a permission check: it needs the publish scope.
let quota = null;
try { quota = await api.get(`${me.user_id}/content_publishing_limit`, { fields: 'quota_usage,config' }); } catch (e) { quota = { error: e.message }; }

saveToken({
  token,
  igUserId: String(me.user_id),
  username: me.username,
  accountType: me.account_type,
  savedAt: new Date().toISOString(),
  refreshedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
});

// The "waiting for you to connect" toast fires once; reset it for the future.
const st = loadState();
if (st?.notified?.noToken) { delete st.notified.noToken; saveState(st); }

log(`connect: @${me.username} (${me.account_type}, ${me.media_count} posts) id ${me.user_id}`);
console.log(`מחובר: @${me.username} · סוג חשבון ${me.account_type}`);
if (quota?.error) console.log(`⚠️ בדיקת הרשאת פרסום נכשלה: ${quota.error}`);
else console.log(`הרשאת פרסום: תקינה (${JSON.stringify(quota.data?.[0] || quota)})`);
console.log('הקרוסלה הבאה שעולה לטיקטוק תעלה לאינסטגרם אוטומטית.');
