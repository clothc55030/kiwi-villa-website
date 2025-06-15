# 澎湖期遇度假會館 - 清理不需要的舊圖片檔案

Write-Host "=== 澎湖期遇度假會館圖片清理腳本 ===" -ForegroundColor Green

# 警告提示
Write-Host "⚠️  警告: 此腳本將刪除舊的、未最佳化的圖片檔案" -ForegroundColor Yellow
Write-Host "建議先備份重要檔案，或在測試環境中執行" -ForegroundColor Yellow
$confirm = Read-Host "確定要繼續嗎？(輸入 'YES' 確認)"

if ($confirm -ne "YES") {
    Write-Host "❌ 已取消操作" -ForegroundColor Red
    exit
}

# 定義需要清理的檔案
$filesToClean = @(
    # Hero 目錄中的大型原始檔案
    "images/hero/main-hall-environment.jpg",              # 2.8MB 原始檔案
    "images/hero/main-hall-environment.webp",             # 724KB 舊WebP
    "images/hero/main-hall-environment.avif",             # 606KB 舊AVIF
    "images/hero/main-hall-environment-mobile.webp",      # 53KB 舊手機版WebP
    "images/hero/main-hall-environment-mobile.avif"       # 606KB 舊手機版AVIF (錯誤大小)
)

$totalSpaceSaved = 0
$cleanedFiles = 0

Write-Host "`n📁 開始清理檔案..." -ForegroundColor Cyan

foreach ($file in $filesToClean) {
    if (Test-Path $file) {
        try {
            $fileInfo = Get-Item $file
            $fileSize = $fileInfo.Length
            $fileSizeKB = [math]::Round($fileSize / 1KB, 1)
            $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
            
            Write-Host "🗑️  刪除: $($fileInfo.Name) ($fileSizeKB KB)" -ForegroundColor Yellow
            
            # 顯示檔案大小
            if ($fileSizeMB -gt 1) {
                Write-Host "   大小: $fileSizeMB MB" -ForegroundColor DarkYellow
            }
            
            Remove-Item $file -Force
            $totalSpaceSaved += $fileSize
            $cleanedFiles++
            
            Write-Host "   ✅ 已刪除" -ForegroundColor Green
            
        } catch {
            Write-Host "   ❌ 刪除失敗: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⏭️  跳過: $file (檔案不存在)" -ForegroundColor DarkGray
    }
}

# 計算節省的空間
$spaceSavedKB = [math]::Round($totalSpaceSaved / 1KB, 1)
$spaceSavedMB = [math]::Round($totalSpaceSaved / 1MB, 2)

Write-Host "`n=== 清理完成 ===" -ForegroundColor Green
Write-Host "📊 已清理檔案: $cleanedFiles 個" -ForegroundColor Cyan
Write-Host "💾 節省空間: $spaceSavedKB KB ($spaceSavedMB MB)" -ForegroundColor Cyan

# 顯示保留的優化檔案
Write-Host "`n📋 保留的優化檔案:" -ForegroundColor Green
$optimizedFiles = @(
    "images/hero/main-hall-environment-new.webp",
    "images/hero/main-hall-environment-new.avif", 
    "images/hero/main-hall-environment-mobile-new.webp",
    "images/hero/main-hall-environment-mobile-new.avif",
    "images/hero/main-hall-environment-optimized.jpg"
)

foreach ($file in $optimizedFiles) {
    if (Test-Path $file) {
        $fileInfo = Get-Item $file
        $fileSizeKB = [math]::Round($fileInfo.Length / 1KB, 1)
        Write-Host "✅ $($fileInfo.Name) - $fileSizeKB KB" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - 檔案不存在" -ForegroundColor Red
    }
}

Write-Host "`n🎯 建議後續動作:" -ForegroundColor Yellow
Write-Host "1. 測試網站載入是否正常"
Write-Host "2. 使用 Lighthouse 測試性能改善"
Write-Host "3. 檢查是否有其他頁面引用了已刪除的圖片"
Write-Host "4. 考慮使用 .\optimize-images.ps1 優化其他目錄的圖片"

# 檢查是否有其他大型圖片需要優化
Write-Host "`n🔍 檢查其他大型圖片檔案..." -ForegroundColor Cyan
$largeImages = Get-ChildItem -Path "images" -Recurse -Include "*.jpg", "*.jpeg", "*.png" | 
    Where-Object { $_.Length -gt 500KB -and $_.Name -notlike "*optimized*" -and $_.Name -notlike "*new*" } |
    Sort-Object Length -Descending |
    Select-Object -First 10

if ($largeImages.Count -gt 0) {
    Write-Host "發現 $($largeImages.Count) 個大型圖片檔案可能需要優化:" -ForegroundColor Yellow
    foreach ($img in $largeImages) {
        $sizeMB = [math]::Round($img.Length / 1MB, 2)
        Write-Host "📷 $($img.Name) - $sizeMB MB" -ForegroundColor Yellow
    }
    Write-Host "建議使用 .\optimize-images.ps1 進行批次優化" -ForegroundColor Cyan
} else {
    Write-Host "✅ 沒有發現其他大型圖片檔案" -ForegroundColor Green
} 