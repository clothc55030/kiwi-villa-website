# Windows resource / disk read-only diagnostic (ASCII only, always writes a report)
$ErrorActionPreference = 'SilentlyContinue'
$dir  = 'C:\kiwi-villa-website\_diag'
$out  = Join-Path $dir 'disk-diagnostic-report.txt'
$done = Join-Path $dir 'DONE.txt'
Remove-Item $done -Force -ErrorAction SilentlyContinue
Remove-Item $out  -Force -ErrorAction SilentlyContinue

$lines = New-Object System.Collections.Generic.List[string]
function W($s){ [void]$lines.Add([string]$s) }

try {
  $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

  W "========================================================"
  W " Windows resource/disk read-only diagnostic report"
  W (" Time    : " + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))
  W (" Computer: " + $env:COMPUTERNAME + "   User: " + $env:USERNAME)
  W (" Elevated: " + $(if($isAdmin){'YES'}else{'NO (some items skipped)'}))
  W "========================================================"

  # [1] Disk space
  W ""
  W "[1] DISK SPACE"
  try {
    Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | ForEach-Object {
      $t=[math]::Round($_.Size/1GB,1); $f=[math]::Round($_.FreeSpace/1GB,1)
      $u=[math]::Round($t-$f,1); $p= if($t){[math]::Round($u/$t*100,1)}else{0}
      W ("  {0}  total {1} GB  used {2} GB ({3}%)  free {4} GB" -f $_.DeviceID,$t,$u,$p,$f)
    }
  } catch { W ("  ERR: " + $_.Exception.Message) }

  # [2] Active trace sessions (WPR / ETW / netsh trace / perfmon)
  W ""
  W "[2] ACTIVE TRACE / RECORDING SESSIONS  (key section)"
  W "  -- WPR status --"
  W ("     " + (((cmd /c "wpr -status 2>&1") -join "`n") -replace "`n","`n     "))
  W "  -- netsh trace status --"
  W ("     " + (((cmd /c "netsh trace show status 2>&1") -join "`n") -replace "`n","`n     "))
  W "  -- logman -ets (event trace sessions) --"
  W ("     " + (((cmd /c "logman query -ets 2>&1") -join "`n") -replace "`n","`n     "))
  W "  -- logman (data collector sets) --"
  W ("     " + (((cmd /c "logman query 2>&1") -join "`n") -replace "`n","`n     "))

  # [3] Big files in common leak locations (>200MB), flag .etl
  W ""
  W "[3] BIG FILES IN COMMON LEAK LOCATIONS (>200MB)"
  $scan = @(
    $env:TEMP, $env:TMP, 'C:\Windows\Temp', 'C:\PerfLogs',
    'C:\ProgramData\Microsoft\Windows\WER',
    'C:\Windows\LiveKernelReports', 'C:\Windows\Minidump',
    'C:\Windows\Logs', 'C:\Windows\System32\LogFiles',
    'C:\ProgramData\Microsoft\Diagnosis',
    (Join-Path $env:LOCALAPPDATA 'Temp')
  ) | Select-Object -Unique
  $big = foreach($d in $scan){
    if(Test-Path $d){
      Get-ChildItem -LiteralPath $d -Recurse -File -Force -ErrorAction SilentlyContinue |
        Where-Object { $_.Length -gt 200MB }
    }
  }
  $big = $big | Sort-Object Length -Descending | Select-Object -First 40
  if($big){
    foreach($f in $big){ W ("  {0,9:N2} GB  {1}" -f ($f.Length/1GB), $f.FullName) }
    $etl = $big | Where-Object { $_.Extension -eq '.etl' }
    if($etl){
      W "  !! The above .etl files are trace recordings - likely left running:"
      foreach($f in $etl){ W ("     {0,7:N2} GB  {1}" -f ($f.Length/1GB),$f.FullName) }
    }
  } else { W "  (no files > 200MB found in scanned locations)" }

  # [4] Fixed system large files
  W ""
  W "[4] FIXED SYSTEM LARGE FILES"
  foreach($p in 'C:\pagefile.sys','C:\hiberfil.sys','C:\swapfile.sys','C:\Windows\MEMORY.DMP'){
    $i = Get-Item -LiteralPath $p -Force -ErrorAction SilentlyContinue
    if($i){ W ("  {0,7:N2} GB  {1}" -f ($i.Length/1GB),$p) }
  }

  # [5] Common heavy folders
  W ""
  W "[5] COMMON HEAVY FOLDER SIZES"
  $dirs = @(
    'C:\Windows\Temp','C:\PerfLogs','C:\ProgramData\Microsoft\Windows\WER',
    'C:\Windows\SoftwareDistribution\Download','C:\Windows\Installer','C:\Windows.old',
    (Join-Path $env:LOCALAPPDATA 'Temp'),
    'C:\Windows\ServiceProfiles\NetworkService\AppData\Local\Microsoft\Windows\DeliveryOptimization'
  ) | Select-Object -Unique
  foreach($d in $dirs){
    if(Test-Path $d){
      $sz = (Get-ChildItem -LiteralPath $d -Recurse -File -Force -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
      W ("  {0,9:N2} GB  {1}" -f ($(if($sz){$sz/1GB}else{0})),$d)
    }
  }

  # [6] Top processes by memory and CPU
  W ""
  W "[6] TOP PROCESSES BY MEMORY (top 12)"
  Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 12 |
    ForEach-Object { W ("  {0,9:N0} MB  {1,-28} (PID {2})" -f ($_.WorkingSet64/1MB), $_.ProcessName, $_.Id) }
  W ""
  W "[6b] TOP PROCESSES BY CPU-SECONDS (top 12)"
  Get-Process | Sort-Object CPU -Descending | Select-Object -First 12 |
    ForEach-Object { W ("  {0,11:N0} s  {1,-28} (PID {2})" -f $_.CPU, $_.ProcessName, $_.Id) }

  # [7] Scheduled tasks
  W ""
  W "[7] SCHEDULED TASKS CURRENTLY RUNNING"
  try {
    $run = Get-ScheduledTask | Where-Object { $_.State -eq 'Running' }
    if($run){ foreach($t in $run){ W ("  {0}{1}" -f $t.TaskPath,$t.TaskName) } } else { W "  (none running)" }
  } catch { W "  (cannot enumerate scheduled tasks)" }
  W ""
  W "[7b] SCHEDULED TASKS WHOSE ACTION MENTIONS trace/wpr/logman/netsh/perfmon"
  try {
    Get-ScheduledTask | ForEach-Object {
      $a = ($_.Actions | ForEach-Object { "$($_.Execute) $($_.Arguments)" }) -join ' '
      if($a -match 'wpr|tracelog|logman|netsh\s+trace|perfmon'){ W ("  {0}{1}  ->  {2}" -f $_.TaskPath,$_.TaskName,$a) }
    }
  } catch {}

  # [8] VSS + recycle bin
  W ""
  W "[8] VOLUME SHADOW COPY (VSS) USAGE"
  if($isAdmin){
    W ("     " + (((cmd /c "vssadmin list shadowstorage 2>&1") -join "`n") -replace "`n","`n     "))
  } else { W "  (needs admin, skipped)" }
  W ""
  W "[8b] RECYCLE BIN SIZE"
  try {
    $rb = (New-Object -ComObject Shell.Application).NameSpace(0xA)
    $rbsize = 0; $rb.Items() | ForEach-Object { $rbsize += $_.Size }
    W ("  {0,9:N2} GB" -f ($rbsize/1GB))
  } catch { W "  (cannot read recycle bin)" }

  W ""
  W "========================================================"
  W " End of diagnostic. Read-only: nothing was deleted or changed."
  W "========================================================"
}
catch {
  W ""
  W ("FATAL ERROR: " + $_.Exception.Message)
  W ($_.ScriptStackTrace)
}
finally {
  try {
    [System.IO.File]::WriteAllText($out, ($lines -join "`r`n"), (New-Object System.Text.UTF8Encoding($false)))
  } catch {
    $lines -join "`r`n" | Set-Content -LiteralPath $out -Encoding ASCII
  }
  Set-Content -LiteralPath $done -Value 'ok' -Encoding ascii
}
