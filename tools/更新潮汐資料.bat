@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo.
echo   =============================================
echo    Kiwi Villa - Moses tide data yearly updater
echo   =============================================
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  py -X utf8 update-tide-data.py %*
) else (
  python -X utf8 update-tide-data.py %*
)
echo.
pause
