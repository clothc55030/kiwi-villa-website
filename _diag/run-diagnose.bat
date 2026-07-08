@echo off
setlocal
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo 需要系統管理員權限，正在跳出 UAC，請按「是」...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
echo 正在執行唯讀診斷，掃描大檔可能需要 1-3 分鐘，請稍候...
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\kiwi-villa-website\_diag\diagnose.ps1"
echo.
echo 完成。報告：C:\kiwi-villa-website\_diag\disk-diagnostic-report.txt
timeout /t 6 >nul
