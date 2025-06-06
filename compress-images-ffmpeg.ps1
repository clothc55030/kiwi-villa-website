# 期遇度假會館 - 圖片壓縮腳本 (FFmpeg版本)
# 使用 FFmpeg 壓縮圖片，提升網頁載入速度

Write-Host "🖼️  期遇度假會館圖片壓縮工具 (FFmpeg版)" -ForegroundColor Green
Write-Host "檢查系統中是否有 FFmpeg..." -ForegroundColor Yellow

# 檢查 FFmpeg 是否可用
try {
    $ffmpegVersion = ffmpeg -version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 找到 FFmpeg" -ForegroundColor Green
    } else {
        throw "FFmpeg not found"
    }
} catch {
    Write-Host "❌ 未找到 FFmpeg，正在嘗試安裝..." -ForegroundColor Red
    Write-Host "請手動安裝 FFmpeg 或使用以下方法：" -ForegroundColor Yellow
    Write-Host "1. 使用 winget: winget install ffmpeg" -ForegroundColor Cyan
    Write-Host "2. 使用 chocolatey: choco install ffmpeg" -ForegroundColor Cyan
    Write-Host "3. 從官網下載: https://ffmpeg.org/download.html" -ForegroundColor Cyan
    
    # 嘗試使用 winget 安裝
    Write-Host "`n嘗試自動安裝 FFmpeg..." -ForegroundColor Yellow
    try {
        winget install "Gyan.FFmpeg" --accept-source-agreements --accept-package-agreements
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ FFmpeg 安裝成功！請重新執行此腳本。" -ForegroundColor Green
            exit
        }
    } catch {
        Write-Host "❌ 自動安裝失敗，請手動安裝 FFmpeg" -ForegroundColor Red
        exit 1
    }
}

# 壓縮設定
$maxWidth = 1200
$quality = 85  # CRF 值，越小品質越好，建議 18-28

Write-Host "設定：最大寬度 ${maxWidth}px，品質 CRF ${quality}" -ForegroundColor Cyan

# 建立備份文件夾
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "images/rooms_original_backup_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "✅ 建立備份文件夾：$backupDir" -ForegroundColor Green

# 處理房型文件夾
$roomTypes = @("luxuryFamily", "premiumQuad", "deluxeQuad", "premiumTriple", "premiumTwin", "premiumDouble")
$totalOriginalSize = 0
$totalNewSize = 0
$processedCount = 0

foreach ($roomType in $roomTypes) {
    $roomPath = "images/rooms/$roomType"
    
    if (!(Test-Path $roomPath)) {
        Write-Host "⚠️  跳過不存在的文件夾：$roomPath" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "`n📁 處理 $roomType 文件夾..." -ForegroundColor Cyan
    
    # 建立對應的備份文件夾
    $roomBackupPath = "$backupDir/$roomType"
    New-Item -ItemType Directory -Path $roomBackupPath -Force | Out-Null
    
    $imageFiles = Get-ChildItem -Path $roomPath -Filter "*.jpg"
    
    foreach ($imageFile in $imageFiles) {
        $inputPath = $imageFile.FullName
        $backupPath = Join-Path $roomBackupPath $imageFile.Name
        $tempPath = $inputPath + ".temp.jpg"
        
        Write-Host "  📷 處理：$($imageFile.Name)" -NoNewline
        
        try {
            # 備份原檔案
            Copy-Item $inputPath $backupPath -Force
            
            # 獲取原始大小
            $originalSize = (Get-Item $inputPath).Length
            
            # 使用 FFmpeg 壓縮圖片
            $ffmpegArgs = @(
                "-i", "`"$inputPath`""
                "-vf", "scale='if(gt(iw,$maxWidth),$maxWidth,iw):-2'"
                "-q:v", $quality
                "-y"
                "`"$tempPath`""
            )
            
            $ffmpegProcess = Start-Process -FilePath "ffmpeg" -ArgumentList $ffmpegArgs -Wait -PassThru -WindowStyle Hidden
            
            if ($ffmpegProcess.ExitCode -eq 0 -and (Test-Path $tempPath)) {
                # 檢查壓縮結果
                $newSize = (Get-Item $tempPath).Length
                
                if ($newSize -lt $originalSize) {
                    # 壓縮成功，替換原檔案
                    Move-Item $tempPath $inputPath -Force
                    
                    $originalMB = [Math]::Round($originalSize / 1MB, 2)
                    $newMB = [Math]::Round($newSize / 1MB, 2)
                    $compressionRatio = [Math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
                    
                    Write-Host " ✅ $originalMB MB → $newMB MB (省${compressionRatio}%)" -ForegroundColor Green
                    
                    $totalOriginalSize += $originalSize
                    $totalNewSize += $newSize
                    $processedCount++
                } else {
                    # 壓縮後反而更大，保持原檔案
                    Remove-Item $tempPath -Force
                    Write-Host " ⚠️  壓縮後更大，保持原檔案" -ForegroundColor Yellow
                    $totalOriginalSize += $originalSize
                    $totalNewSize += $originalSize
                    $processedCount++
                }
            } else {
                # 壓縮失敗
                if (Test-Path $tempPath) {
                    Remove-Item $tempPath -Force
                }
                Write-Host " ❌ 壓縮失敗" -ForegroundColor Red
            }
        } catch {
            Write-Host " ❌ 錯誤：$($_.Exception.Message)" -ForegroundColor Red
            if (Test-Path $tempPath) {
                Remove-Item $tempPath -Force
            }
        }
    }
}

# 顯示總計結果
Write-Host "`n" + "="*60 -ForegroundColor Magenta
Write-Host "🎉 壓縮完成！總結報告：" -ForegroundColor Green
Write-Host "📊 處理圖片數量：$processedCount 張" -ForegroundColor Cyan

if ($totalOriginalSize -gt 0) {
    Write-Host "📦 原始總大小：$([Math]::Round($totalOriginalSize / 1MB, 2)) MB" -ForegroundColor Yellow
    Write-Host "📦 壓縮後大小：$([Math]::Round($totalNewSize / 1MB, 2)) MB" -ForegroundColor Green
    Write-Host "💾 節省空間：$([Math]::Round(($totalOriginalSize - $totalNewSize) / 1MB, 2)) MB" -ForegroundColor Green
    Write-Host "📈 整體壓縮率：$([Math]::Round((1 - ($totalNewSize / $totalOriginalSize)) * 100, 1))%" -ForegroundColor Green
}

Write-Host "📁 備份位置：$backupDir" -ForegroundColor Cyan
Write-Host "`n🌐 網頁載入速度將大幅提升！" -ForegroundColor Green
Write-Host "📱 手機用戶體驗將明顯改善！" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Magenta

Write-Host "`n⚠️  注意事項：" -ForegroundColor Yellow
Write-Host "- 原始圖片已備份至：$backupDir" -ForegroundColor White
Write-Host "- 如需還原，請從備份文件夾複製回來" -ForegroundColor White
Write-Host "- 建議清除瀏覽器快取後測試載入速度" -ForegroundColor White 