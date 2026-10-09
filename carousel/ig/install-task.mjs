// Register the scheduled task that runs ig-mirror.cmd every 30 minutes.
//
//   node ig/install-task.mjs [--since 2026-10-09]
//
// Settings that differ from schtasks' defaults, on purpose:
// - runs on battery and keeps running when unplugged (a laptop on battery
//   would otherwise skip every run)
// - StartWhenAvailable: a run missed while asleep happens on wake
// - no console window: wscript + run-hidden.vbs
//
// --since sets where mirroring starts on the very first run. Without it the
// first run starts from "now", so 49 old posts never flood Instagram.

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { loadState, DIR } from './lib/store.mjs';

const NAME = 'HotelMozil-IgMirror';
const here = import.meta.dirname;
const vbs = path.join(here, 'run-hidden.vbs');
const cmd = path.join(here, 'ig-mirror.cmd');

const ps = `
$ProgressPreference = 'SilentlyContinue'
$a = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument '//B //Nologo "${vbs}" "${cmd}"'
$t = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 30)
$s = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 25) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName '${NAME}' -Action $a -Trigger $t -Settings $s -Description 'TikTok carousels to Instagram (hotelmozil-site/carousel/ig)' -Force | Out-Null
(Get-ScheduledTask -TaskName '${NAME}').State
`;

const since = process.argv.includes('--since') ? process.argv[process.argv.indexOf('--since') + 1] : null;
if (since && !loadState()) {
  // Seed the cutoff now so the first scheduled run already knows it.
  execFileSync(process.execPath, [path.join(here, 'mirror.mjs'), '--dry', '--since', since], { stdio: 'inherit', cwd: path.join(here, '..') });
}

const out = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-EncodedCommand', Buffer.from(ps, 'utf16le').toString('base64')], { encoding: 'utf8' });
console.log(`${NAME}: ${out.trim()} · state in ${DIR}`);
