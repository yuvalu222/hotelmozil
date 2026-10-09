@echo off
REM ============================================================================
REM  ig-mirror.cmd - TikTok carousels -> Instagram, every 30 minutes.
REM
REM  Scheduled task:  HotelMozil-IgMirror  (install: node ig/install-task.mjs)
REM  Runs only while the computer is on; a missed run catches up on the next.
REM  Log:     %LOCALAPPDATA%\HotelMozil\ig\mirror.log
REM  Status:  node ig/status.mjs
REM  Remove:  schtasks /Delete /TN HotelMozil-IgMirror /F
REM ============================================================================

cd /d "%~dp0.."
call node ig/mirror.mjs >> "%LOCALAPPDATA%\HotelMozil\ig\run.log" 2>&1
