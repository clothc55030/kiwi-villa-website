# 期遇度假會館 - 圖片大小分析工具
# 分析目前圖片大小，提供壓縮建議

Write-Host "📊 期遇度假會館圖片大小分析" -ForegroundColor Green
Write-Host "分析所有房型圖片的大小和載入速度影響" -ForegroundColor Yellow
Write-Host ""

# 房型文件夾
$roomTypes = @{
    "luxuryFamily" = "豪華家庭房"
    "premiumQuad" = "高級四人房"
    "deluxeQuad" = "奢華四人房"
    "premiumTriple" = "高級三人房"
    "premiumTwin" = "高級雙床房"
    "premiumDouble" = "高級雙人房"
}

$totalSize = 0
$totalFiles = 0
$largestFile = $null
$largestSize = 0

Write-Host "房型" -ForegroundColor Cyan -NoNewline
Write-Host "`t`t圖片數量`t總大小`t`t平均大小`t最大檔案" -ForegroundColor White
Write-Host "-" * 80 -ForegroundColor Gray

foreach ($roomType in $roomTypes.Keys) {
    $roomPath = "images/rooms/$roomType"
    $roomName = $roomTypes[$roomType]
    
    if (!(Test-Path $roomPath)) {
        Write-Host "$roomName`t`t0`t`t0 MB`t`t0 MB`t`t-" -ForegroundColor Yellow
        continue
    }
    
    $imageFiles = Get-ChildItem -Path $roomPath -Filter "*.jpg"
    $roomSize = 0
    $roomLargest = 0
    $roomLargestFile = ""
    
    foreach ($file in $imageFiles) {
        $fileSize = $file.Length
        $roomSize += $fileSize
        
        if ($fileSize -gt $roomLargest) {
            $roomLargest = $fileSize
            $roomLargestFile = $file.Name
        }
        
        if ($fileSize -gt $largestSize) {
            $largestSize = $fileSize
            $largestFile = "$roomType/$($file.Name)"
        }
    }
    
    $fileCount = $imageFiles.Count
    $roomSizeMB = [Math]::Round($roomSize / 1MB, 1)
    $avgSizeMB = if ($fileCount -gt 0) { [Math]::Round($roomSize / $fileCount / 1MB, 1) } else { 0 }
    $largestMB = [Math]::Round($roomLargest / 1MB, 1)
    
    Write-Host "$roomName`t$fileCount`t`t$roomSizeMB MB`t`t$avgSizeMB MB`t`t$largestMB MB" -ForegroundColor White
    
    $totalSize += $roomSize
    $totalFiles += $fileCount
}

Write-Host "-" * 80 -ForegroundColor Gray
$totalSizeMB = [Math]::Round($totalSize / 1MB, 1)
$avgSizeMB = if ($totalFiles -gt 0) { [Math]::Round($totalSize / $totalFiles / 1MB, 1) } else { 0 }
$largestFileMB = [Math]::Round($largestSize / 1MB, 1)

Write-Host "總計`t`t$totalFiles`t`t$totalSizeMB MB`t`t$avgSizeMB MB`t`t$largestFileMB MB" -ForegroundColor Green
Write-Host "最大檔案：$largestFile" -ForegroundColor Cyan

# 載入速度分析
Write-Host "`n🌐 載入速度分析" -ForegroundColor Yellow
Write-Host "-" * 40

$speeds = @{
    "4G行動網路" = @{ speed = 25; unit = "Mbps" }
    "家用WiFi" = @{ speed = 100; unit = "Mbps" }
    "高速光纖" = @{ speed = 500; unit = "Mbps" }
}

foreach ($speedName in $speeds.Keys) {
    $speed = $speeds[$speedName].speed
    $speedMbps = $speed * 1024 * 1024 / 8  # 轉換為 bytes per second
    
    $avgLoadTime = [Math]::Round(($avgSizeMB * 1024 * 1024) / $speedMbps, 1)
    $maxLoadTime = [Math]::Round(($largestFileMB * 1024 * 1024) / $speedMbps, 1)
    $totalLoadTime = [Math]::Round(($totalSizeMB * 1024 * 1024) / $speedMbps, 1)
    
    Write-Host "$speedName ($($speeds[$speedName].speed) $($speeds[$speedName].unit)):" -ForegroundColor Cyan
    Write-Host "  單張圖片：$avgLoadTime 秒（平均）, $maxLoadTime 秒（最大）" -ForegroundColor White
    Write-Host "  全部載入：$totalLoadTime 秒" -ForegroundColor White
    Write-Host ""
}

# 壓縮建議
Write-Host "💡 壓縮建議" -ForegroundColor Yellow
Write-Host "-" * 40

Write-Host "目前問題：" -ForegroundColor Red
Write-Host "• 平均圖片大小 $avgSizeMB MB 遠超建議的 0.5-1 MB" -ForegroundColor White
Write-Host "• 總檔案大小 $totalSizeMB MB 會導致載入速度過慢" -ForegroundColor White
Write-Host "• 行動裝置用戶體驗極差" -ForegroundColor White

Write-Host "`n建議解決方案：" -ForegroundColor Green
Write-Host "1. 📏 尺寸調整：限制最大寬度為 1200px" -ForegroundColor Cyan
Write-Host "2. 🗜️  品質壓縮：JPEG 品質設為 80-85%" -ForegroundColor Cyan
Write-Host "3. 🔄 格式轉換：考慮使用 WebP 格式（節省 25-35%）" -ForegroundColor Cyan
Write-Host "4. ⚡ 延遲載入：只載入可見的圖片" -ForegroundColor Cyan

Write-Host "`n預期效果：" -ForegroundColor Green
$targetSizePerImage = 0.8  # MB
$expectedTotalSize = $totalFiles * $targetSizePerImage
$savingPercent = [Math]::Round((1 - ($expectedTotalSize / $totalSizeMB)) * 100, 1)

Write-Host "• 目標：每張圖片 $targetSizePerImage MB" -ForegroundColor White
Write-Host "• 預計總大小：$expectedTotalSize MB" -ForegroundColor White
Write-Host "• 預期節省：$savingPercent%" -ForegroundColor White
Write-Host "• 載入速度提升：5-10 倍" -ForegroundColor White

Write-Host "`n🔧 推薦工具：" -ForegroundColor Yellow
Write-Host "線上壓縮（推薦）：" -ForegroundColor Cyan
Write-Host "• TinyPNG - https://tinypng.com/" -ForegroundColor White
Write-Host "• Squoosh - https://squoosh.app/" -ForegroundColor White
Write-Host "• CompressJPEG - https://compressjpeg.com/" -ForegroundColor White

Write-Host "`n桌面軟體：" -ForegroundColor Cyan
Write-Host "• Adobe Photoshop（存為網路用途）" -ForegroundColor White
Write-Host "• GIMP（免費替代方案）" -ForegroundColor White
Write-Host "• XnConvert（批次處理）" -ForegroundColor White

Write-Host "`n⚡ 立即行動建議：" -ForegroundColor Green
Write-Host "1. 選擇 3-5 張代表性圖片先手動壓縮測試" -ForegroundColor White
Write-Host "2. 確認壓縮後的品質可接受" -ForegroundColor White
Write-Host "3. 批次處理所有圖片" -ForegroundColor White
Write-Host "4. 重新載入網站測試速度" -ForegroundColor White 