# 期遇度假會館 - 圖片壓縮腳本
# 將圖片壓縮至適合網頁使用的大小，提升載入速度

Add-Type -AssemblyName System.Drawing

# 壓縮設定
$maxWidth = 1200          # 最大寬度
$maxHeight = 900          # 最大高度  
$jpegQuality = 85         # JPEG品質 (0-100)
$webpQuality = 80         # WebP品質 (如果支援)

Write-Host "🖼️  期遇度假會館圖片壓縮工具" -ForegroundColor Green
Write-Host "目標：將圖片壓縮至適合網頁載入的大小" -ForegroundColor Yellow
Write-Host "設定：最大尺寸 ${maxWidth}x${maxHeight}，品質 ${jpegQuality}%" -ForegroundColor Cyan
Write-Host ""

# 建立備份文件夾
$backupDir = "images/rooms_original_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "✅ 建立備份文件夾：$backupDir" -ForegroundColor Green
}

# 獲取 JPEG 編碼器
function Get-JpegEncoder {
    $jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    return $jpegCodec
}

# 設定 JPEG 品質參數
function Get-EncoderParameters($quality) {
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, $quality)
    $encoderParams.Param[0] = $qualityParam
    return $encoderParams
}

# 計算新的尺寸（保持比例）
function Get-NewSize($originalWidth, $originalHeight, $maxWidth, $maxHeight) {
    $ratioX = $maxWidth / $originalWidth
    $ratioY = $maxHeight / $originalHeight
    $ratio = [Math]::Min($ratioX, $ratioY)
    
    if ($ratio -ge 1) {
        # 圖片已經夠小，不需要縮放
        return @{
            Width = $originalWidth
            Height = $originalHeight
            NeedResize = $false
        }
    }
    
    return @{
        Width = [Math]::Round($originalWidth * $ratio)
        Height = [Math]::Round($originalHeight * $ratio)
        NeedResize = $true
    }
}

# 壓縮單張圖片
function Compress-Image($inputPath, $outputPath) {
    try {
        $originalImage = [System.Drawing.Image]::FromFile($inputPath)
        $originalSize = (Get-Item $inputPath).Length
        
        # 計算新尺寸
        $newSize = Get-NewSize $originalImage.Width $originalImage.Height $maxWidth $maxHeight
        
        if ($newSize.NeedResize) {
            # 需要縮放
            $resizedImage = New-Object System.Drawing.Bitmap($newSize.Width, $newSize.Height)
            $graphics = [System.Drawing.Graphics]::FromImage($resizedImage)
            
            # 設定高品質縮放
            $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            
            # 縮放圖片
            $graphics.DrawImage($originalImage, 0, 0, $newSize.Width, $newSize.Height)
            
            # 儲存壓縮後的圖片
            $jpegEncoder = Get-JpegEncoder
            $encoderParams = Get-EncoderParameters $jpegQuality
            $resizedImage.Save($outputPath, $jpegEncoder, $encoderParams)
            
            $graphics.Dispose()
            $resizedImage.Dispose()
        } else {
            # 不需要縮放，只壓縮品質
            $jpegEncoder = Get-JpegEncoder
            $encoderParams = Get-EncoderParameters $jpegQuality
            $originalImage.Save($outputPath, $jpegEncoder, $encoderParams)
        }
        
        $originalImage.Dispose()
        
        # 檢查壓縮結果
        $newSize = (Get-Item $outputPath).Length
        $compressionRatio = [Math]::Round((1 - ($newSize / $originalSize)) * 100, 1)
        
        return @{
            Success = $true
            OriginalSize = $originalSize
            NewSize = $newSize
            CompressionRatio = $compressionRatio
            Resized = $newSize.NeedResize
        }
    }
    catch {
        Write-Host "❌ 壓縮失敗：$($_.Exception.Message)" -ForegroundColor Red
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

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
    if (!(Test-Path $roomBackupPath)) {
        New-Item -ItemType Directory -Path $roomBackupPath -Force | Out-Null
    }
    
    $imageFiles = Get-ChildItem -Path $roomPath -Filter "*.jpg"
    
    foreach ($imageFile in $imageFiles) {
        $inputPath = $imageFile.FullName
        $backupPath = Join-Path $roomBackupPath $imageFile.Name
        $outputPath = $inputPath  # 覆蓋原檔案
        
        Write-Host "  📷 處理：$($imageFile.Name)" -NoNewline
        
        # 備份原檔案
        Copy-Item $inputPath $backupPath -Force
        
        # 壓縮圖片
        $result = Compress-Image $inputPath $outputPath
        
        if ($result.Success) {
            $originalMB = [Math]::Round($result.OriginalSize / 1MB, 2)
            $newMB = [Math]::Round($result.NewSize / 1MB, 2)
            
            Write-Host " ✅ $originalMB MB → $newMB MB (省${result.CompressionRatio}%)" -ForegroundColor Green
            
            $totalOriginalSize += $result.OriginalSize
            $totalNewSize += $result.NewSize
            $processedCount++
        }
    }
}

# 顯示總計結果
Write-Host "`n" + "="*60 -ForegroundColor Magenta
Write-Host "🎉 壓縮完成！總結報告：" -ForegroundColor Green
Write-Host "📊 處理圖片數量：$processedCount 張" -ForegroundColor Cyan
Write-Host "📦 原始總大小：$([Math]::Round($totalOriginalSize / 1MB, 2)) MB" -ForegroundColor Yellow
Write-Host "📦 壓縮後大小：$([Math]::Round($totalNewSize / 1MB, 2)) MB" -ForegroundColor Green
Write-Host "💾 節省空間：$([Math]::Round(($totalOriginalSize - $totalNewSize) / 1MB, 2)) MB" -ForegroundColor Green
Write-Host "📈 整體壓縮率：$([Math]::Round((1 - ($totalNewSize / $totalOriginalSize)) * 100, 1))%" -ForegroundColor Green
Write-Host "📁 備份位置：$backupDir" -ForegroundColor Cyan
Write-Host "`n🌐 網頁載入速度將大幅提升！" -ForegroundColor Green
Write-Host "📱 手機用戶體驗將明顯改善！" -ForegroundColor Green
Write-Host "="*60 -ForegroundColor Magenta

Write-Host "`n⚠️  注意事項：" -ForegroundColor Yellow
Write-Host "- 原始圖片已備份至：$backupDir" -ForegroundColor White
Write-Host "- 如需還原，請從備份文件夾複製回來" -ForegroundColor White
Write-Host "- 建議清除瀏覽器快取後測試載入速度" -ForegroundColor White 