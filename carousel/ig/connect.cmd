@echo off
REM Double-click after copying the token from Meta (Generate token).
REM Stores it, checks publishing permission, opens the status page.
cd /d "%~dp0.."
call node ig/connect.mjs
call node ig/status.mjs
echo.
pause
