# 澎湖期遇度假會館 - 圖片批次優化腳本
# 使用ImageMagick批次優化圖片

param(
    [string]$InputFolder = "images",
    [string]$Quality = "85",
    [string]$WebPQuality = "80", 
    [string]$AVIFQuality = "75",
    [int]$MaxWidth = 1200,
    [switch]$SkipExisting
)

Write-Host "=== 澎湖期遇度假會館圖片優化腳本 ===" -ForegroundColor Green
Write-Host "輸入資料夾: $InputFolder" -ForegroundColor Yellow
Write-Host "品質設定: JPG($Quality%) WebP($WebPQuality%) AVIF($AVIFQuality%)" -ForegroundColor Yellow

# 檢查ImageMagick是否已安裝
try {
    $magickVersion = magick -version | Select-Object -First 1
    Write-Host "檢測到 ImageMagick: $magickVersion" -ForegroundColor Green
} catch {
    Write-Host "錯誤: 未找到ImageMagick，請先安裝 ImageMagick" -ForegroundColor Red
    exit 1
}

# 取得所有JPG檔案
$jpgFiles = Get-ChildItem -Path $InputFolder -Recurse -Include "*.jpg", "*.jpeg" | 
    Where-Object { $_.Name -notlike "*optimized*" -and $_.Name -notlike "*new*" }

Write-Host "找到 $($jpgFiles.Count) 個JPG檔案需要優化" -ForegroundColor Cyan

foreach ($file in $jpgFiles) {
    $baseName = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
    $directory = $file.Directory.FullName
    
    # 檔案路徑
    $optimizedJpg = Join-Path $directory "$baseName-optimized.jpg"
    $webpFile = Join-Path $directory "$baseName.webp" 
    $avifFile = Join-Path $directory "$baseName.avif"
    
    Write-Host "`n處理: $($file.Name)" -ForegroundColor Yellow
    
    # 檢查檔案大小
    $originalSize = [math]::Round($file.Length / 1KB, 1)
    Write-Host "  原始大小: $originalSize KB"
    
    try {
        # 獲取原始尺寸
        $imageInfo = magick identify $file.FullName
        Write-Host "  圖片資訊: $imageInfo"
        
        # 1. 優化JPG (如果不存在或強制覆蓋)
        if (-not (Test-Path $optimizedJpg) -or -not $SkipExisting) {
            Write-Host "  → 優化JPG..." -ForegroundColor Green
            magick $file.FullName -resize "${MaxWidth}x${MaxWidth}>" -quality $Quality -strip $optimizedJpg
            
            if (Test-Path $optimizedJpg) {
                $newSize = [math]::Round((Get-Item $optimizedJpg).Length / 1KB, 1)
                $compression = [math]::Round(($originalSize - $newSize) / $originalSize * 100, 1)
                Write-Host "    優化完成: $newSize KB (壓縮 $compression%)" -ForegroundColor Green
            }
        } else {
            Write-Host "  → 跳過JPG (已存在)" -ForegroundColor DarkYellow
        }
        
        # 2. 生成WebP
        if (-not (Test-Path $webpFile) -or -not $SkipExisting) {
            Write-Host "  → 生成WebP..." -ForegroundColor Green
            if (Test-Path $optimizedJpg) {
                magick $optimizedJpg -quality $WebPQuality $webpFile
            } else {
                magick $file.FullName -resize "${MaxWidth}x${MaxWidth}>" -quality $WebPQuality $webpFile
            }
            
            if (Test-Path $webpFile) {
                $webpSize = [math]::Round((Get-Item $webpFile).Length / 1KB, 1)
                $webpCompression = [math]::Round(($originalSize - $webpSize) / $originalSize * 100, 1)
                Write-Host "    WebP完成: $webpSize KB (壓縮 $webpCompression%)" -ForegroundColor Green
            }
        } else {
            Write-Host "  → 跳過WebP (已存在)" -ForegroundColor DarkYellow
        }
        
        # 3. 生成AVIF
        if (-not (Test-Path $avifFile) -or -not $SkipExisting) {
            Write-Host "  → 生成AVIF..." -ForegroundColor Green
            if (Test-Path $optimizedJpg) {
                magick $optimizedJpg -quality $AVIFQuality $avifFile
            } else {
                magick $file.FullName -resize "${MaxWidth}x${MaxWidth}>" -quality $AVIFQuality $avifFile
            }
            
            if (Test-Path $avifFile) {
                $avifSize = [math]::Round((Get-Item $avifFile).Length / 1KB, 1)
                $avifCompression = [math]::Round(($originalSize - $avifSize) / $originalSize * 100, 1)
                Write-Host "    AVIF完成: $avifSize KB (壓縮 $avifCompression%)" -ForegroundColor Green
            }
        } else {
            Write-Host "  → 跳過AVIF (已存在)" -ForegroundColor DarkYellow
        }
        
    } catch {
        Write-Host "  ❌ 處理失敗: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== 批次優化完成 ===" -ForegroundColor Green
Write-Host "建議檢查生成的檔案並更新網站中的圖片引用" -ForegroundColor Yellow

# 使用範例
Write-Host "`n使用範例:" -ForegroundColor Cyan
Write-Host "  .\optimize-images.ps1 -InputFolder 'images/rooms'"
Write-Host "  .\optimize-images.ps1 -InputFolder 'images/intro' -Quality 90"
Write-Host "  .\optimize-images.ps1 -SkipExisting" 