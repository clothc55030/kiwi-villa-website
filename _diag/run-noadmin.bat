@echo off
echo 正在執行唯讀診斷（無系統管理員權限），請稍候...
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\kiwi-villa-website\_diag\diagnose.ps1"
echo.
echo 完成。報告：C:\kiwi-villa-website\_diag\disk-diagnostic-report.txt
timeout /t 6 >nul
