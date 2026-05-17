@echo off
setlocal
set "TOOL_ROOT=%~dp0"
node "%TOOL_ROOT%index.js" %*
exit /b %errorlevel%

