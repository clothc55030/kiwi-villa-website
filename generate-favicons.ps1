# 生成Favicon和Apple Touch Icon腳本
# 使用ImageMagick從kiwi-villa-logo.png生成各種尺寸的圖標

Write-Host "🎨 開始生成Favicon和Apple Touch Icon..." -ForegroundColor Green

# 檢查ImageMagick是否安裝
try {
    magick -version | Out-Null
    Write-Host "✅ ImageMagick已安裝" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到ImageMagick，請先安裝：" -ForegroundColor Red
    Write-Host "   方法1: winget install ImageMagick.ImageMagick" -ForegroundColor Yellow
    Write-Host "   方法2: 從 https://imagemagick.org/script/download.php#windows 下載" -ForegroundColor Yellow
    exit 1
}

# 設定路徑
$logoPath = "images/logo/kiwi-villa-logo.png"
$logoDir = "images/logo"

# 檢查原始logo是否存在
if (-not (Test-Path $logoPath)) {
    Write-Host "❌ 找不到原始logo檔案: $logoPath" -ForegroundColor Red
    exit 1
}

Write-Host "📂 使用原始logo: $logoPath" -ForegroundColor Cyan

# 生成各種尺寸的favicon
$faviconSizes = @(16, 32, 96, 192, 512)
foreach ($size in $faviconSizes) {
    $outputPath = "$logoDir/favicon-${size}x${size}.png"
    Write-Host "🔄 生成 ${size}x${size} favicon..." -ForegroundColor Yellow
    
    magick "$logoPath" -resize "${size}x${size}" -background transparent "$outputPath"
    
    if (Test-Path $outputPath) {
        Write-Host "✅ 已生成: $outputPath" -ForegroundColor Green
    } else {
        Write-Host "❌ 生成失敗: $outputPath" -ForegroundColor Red
    }
}

# 生成Apple Touch Icons
$appleSizes = @(57, 60, 72, 76, 114, 120, 144, 152, 180)
foreach ($size in $appleSizes) {
    $outputPath = "$logoDir/apple-touch-icon-${size}x${size}.png"
    Write-Host "🔄 生成 ${size}x${size} Apple Touch Icon..." -ForegroundColor Yellow
    
    magick "$logoPath" -resize "${size}x${size}" -background transparent "$outputPath"
    
    if (Test-Path $outputPath) {
        Write-Host "✅ 已生成: $outputPath" -ForegroundColor Green
    } else {
        Write-Host "❌ 生成失敗: $outputPath" -ForegroundColor Red
    }
}

# 生成Microsoft Tile圖標
Write-Host "🔄 生成 144x144 Microsoft Tile Icon..." -ForegroundColor Yellow
$msTilePath = "$logoDir/ms-icon-144x144.png"
magick "$logoPath" -resize "144x144" -background transparent "$msTilePath"

if (Test-Path $msTilePath) {
    Write-Host "✅ 已生成: $msTilePath" -ForegroundColor Green
} else {
    Write-Host "❌ 生成失敗: $msTilePath" -ForegroundColor Red
}

# 生成主要的favicon.ico檔案
Write-Host "🔄 生成主要的favicon.ico檔案..." -ForegroundColor Yellow
$favicoPath = "favicon.ico"

# 使用多個尺寸創建ico檔案
magick "$logoPath" -resize "16x16" -resize "32x32" -resize "48x48" "$favicoPath"

if (Test-Path $favicoPath) {
    Write-Host "✅ 已生成: $favicoPath" -ForegroundColor Green
} else {
    Write-Host "❌ 生成失敗: $favicoPath" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Favicon生成完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 生成的檔案清單：" -ForegroundColor Cyan
Write-Host "   favicon.ico" -ForegroundColor White
Write-Host "   images/logo/favicon-16x16.png" -ForegroundColor White
Write-Host "   images/logo/favicon-32x32.png" -ForegroundColor White
Write-Host "   images/logo/favicon-96x96.png" -ForegroundColor White
Write-Host "   images/logo/favicon-192x192.png" -ForegroundColor White
Write-Host "   images/logo/favicon-512x512.png" -ForegroundColor White
Write-Host "   images/logo/apple-touch-icon-[各種尺寸].png" -ForegroundColor White
Write-Host "   images/logo/ms-icon-144x144.png" -ForegroundColor White
Write-Host ""
Write-Host "✨ 請記得將這些檔案上傳到網站伺服器！" -ForegroundColor Green 