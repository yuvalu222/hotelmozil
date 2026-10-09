// Register the scheduled task that runs the mirror every 30 minutes.
//
//   node ig/install-task.mjs [--since 2026-10-09]
//
// Settings that differ from schtasks' defaults, on purpose:
// - runs on battery and keeps running when unplugged (a laptop on battery
//   would otherwise skip every run)
// - StartWhenAvailable: a run missed while asleep happens on wake
// - no console window: wscript + run-hidden.vbs
//
// The task does not point into the repo. ig/ exists only on the carousel
// branch, so checking out `main` in hotelmozil-site would delete the files
// the task runs, and the failure would surface only in a log. The launcher
// and the .vbs are therefore written into the state folder, which no branch
// switch touches. When the launcher finds mirror.mjs missing, it raises a
// toast (once, until the code is back).
//
// --since sets where mirroring starts on the very first run. Without it the
// first run starts from "now", so 49 old posts never flood Instagram.

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { loadState, DIR } from './lib/store.mjs';

const NAME = 'HotelMozil-IgMirror';
const here = import.meta.dirname;
const carousel = path.join(here, '..');
const vbs = path.join(DIR, 'run-hidden.vbs');
const launcher = path.join(DIR, 'launch.cmd');

// The toast for "code missing", pre-encoded so the .cmd carries no Hebrew.
const missingToast = [
  '[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null',
  '$t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)',
  '$x = $t.GetElementsByTagName("text")',
  '$x.Item(0).AppendChild($t.CreateTextNode("המראה לאינסטגרם לא רץ")) > $null',
  `$x.Item(1).AppendChild($t.CreateTextNode("הקוד חסר ב-${carousel.replace(/\\/g, '/')}/ig. כנראה הוחלף ענף ב-hotelmozil-site.")) > $null`,
  '$app = "{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\\WindowsPowerShell\\v1.0\\powershell.exe"',
  '[Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($app).Show([Windows.UI.Notifications.ToastNotification]::new($t))',
].join('; ');

const cmd = [
  '@echo off',
  'REM Written by carousel/ig/install-task.mjs. Lives here, outside the repo, on purpose.',
  `set "CAR=${carousel}"`,
  'if not exist "%CAR%\\ig\\mirror.mjs" goto missing',
  'if exist "%~dp0missing.flag" del "%~dp0missing.flag"',
  'cd /d "%CAR%"',
  'call node ig/mirror.mjs >> "%~dp0run.log" 2>&1',
  'goto :eof',
  ':missing',
  'echo [%DATE% %TIME%] mirror.mjs missing in %CAR% >> "%~dp0run.log"',
  'if exist "%~dp0missing.flag" goto :eof',
  'echo 1 > "%~dp0missing.flag"',
  `powershell.exe -NoProfile -NonInteractive -EncodedCommand ${Buffer.from(missingToast, 'utf16le').toString('base64')}`,
  '',
].join('\r\n');

fs.writeFileSync(launcher, cmd);
fs.copyFileSync(path.join(here, 'run-hidden.vbs'), vbs);

const ps = `
$ProgressPreference = 'SilentlyContinue'
$a = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument '//B //Nologo "${vbs}" "${launcher}"'
$t = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30)
$s = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 25) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName '${NAME}' -Action $a -Trigger $t -Settings $s -Description 'TikTok carousels to Instagram (hotelmozil-site/carousel/ig)' -Force | Out-Null
(Get-ScheduledTask -TaskName '${NAME}').State
`;

const since = process.argv.includes('--since') ? process.argv[process.argv.indexOf('--since') + 1] : null;
if (since && !loadState()) {
  // Seed the cutoff now so the first scheduled run already knows it.
  execFileSync(process.execPath, [path.join(here, 'mirror.mjs'), '--dry', '--since', since], { stdio: 'inherit', cwd: carousel });
}

const out = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')], { encoding: 'utf8' });
console.log(`${NAME}: ${out.trim()} · launcher ${launcher}`);
