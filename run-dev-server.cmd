@echo off
setlocal
chcp 65001 >nul

set "PROJECT_DIR=%~dp0"
for %%I in ("%PROJECT_DIR%.") do set "PROJECT_DIR=%%~fI"
start "Orchard Dev Server" powershell.exe -NoExit -ExecutionPolicy Bypass -File "%PROJECT_DIR%\run-dev-server.ps1"
exit /b %ERRORLEVEL%
