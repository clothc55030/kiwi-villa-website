# 期遇度假會館 - 房型圖片批次重新命名腳本
# 執行前請先備份圖片檔案！

Write-Host "開始重新命名房型圖片..." -ForegroundColor Green
Write-Host "建議先備份 images/rooms/ 文件夾！" -ForegroundColor Yellow

# 豪華家庭房 (luxuryFamily) - 10張圖片
Write-Host "`n處理豪華家庭房圖片..." -ForegroundColor Cyan
Set-Location "images/rooms/luxuryFamily"

if (Test-Path "luxury-family-room.jpg") {
    Rename-Item "luxury-family-room.jpg" "penghu-kiwi-villa-luxury-family-room1.jpg"
    Write-Host "✓ luxury-family-room.jpg → penghu-kiwi-villa-luxury-family-room1.jpg"
}

if (Test-Path "304A0169.jpg") {
    Rename-Item "304A0169.jpg" "penghu-kiwi-villa-luxury-family-room2.jpg"
    Write-Host "✓ 304A0169.jpg → penghu-kiwi-villa-luxury-family-room2.jpg"
}

if (Test-Path "304A0140.jpg") {
    Rename-Item "304A0140.jpg" "penghu-kiwi-villa-luxury-family-room3.jpg"
    Write-Host "✓ 304A0140.jpg → penghu-kiwi-villa-luxury-family-room3.jpg"
}

if (Test-Path "304A0195.jpg") {
    Rename-Item "304A0195.jpg" "penghu-kiwi-villa-luxury-family-room4.jpg"
    Write-Host "✓ 304A0195.jpg → penghu-kiwi-villa-luxury-family-room4.jpg"
}

if (Test-Path "304A0142.jpg") {
    Rename-Item "304A0142.jpg" "penghu-kiwi-villa-luxury-family-room5.jpg"
    Write-Host "✓ 304A0142.jpg → penghu-kiwi-villa-luxury-family-room5.jpg"
}

if (Test-Path "304A0209.jpg") {
    Rename-Item "304A0209.jpg" "penghu-kiwi-villa-luxury-family-room6.jpg"
    Write-Host "✓ 304A0209.jpg → penghu-kiwi-villa-luxury-family-room6.jpg"
}

if (Test-Path "304A0135.jpg") {
    Rename-Item "304A0135.jpg" "penghu-kiwi-villa-luxury-family-room7.jpg"
    Write-Host "✓ 304A0135.jpg → penghu-kiwi-villa-luxury-family-room7.jpg"
}

if (Test-Path "304A0202.jpg") {
    Rename-Item "304A0202.jpg" "penghu-kiwi-villa-luxury-family-room8.jpg"
    Write-Host "✓ 304A0202.jpg → penghu-kiwi-villa-luxury-family-room8.jpg"
}

if (Test-Path "304A0177.jpg") {
    Rename-Item "304A0177.jpg" "penghu-kiwi-villa-luxury-family-room9.jpg"
    Write-Host "✓ 304A0177.jpg → penghu-kiwi-villa-luxury-family-room9.jpg"
}

if (Test-Path "304A0200.jpg") {
    Rename-Item "304A0200.jpg" "penghu-kiwi-villa-luxury-family-room10.jpg"
    Write-Host "✓ 304A0200.jpg → penghu-kiwi-villa-luxury-family-room10.jpg"
}

# 回到根目錄
Set-Location "../../.."

# 高級四人房 (premiumQuad) - 8張圖片
Write-Host "`n處理高級四人房圖片..." -ForegroundColor Cyan
Set-Location "images/rooms/premiumQuad"

if (Test-Path "304A0323.jpg") {
    Rename-Item "304A0323.jpg" "penghu-kiwi-villa-premium-quad-room1.jpg"
    Write-Host "✓ 304A0323.jpg → penghu-kiwi-villa-premium-quad-room1.jpg"
}

if (Test-Path "304A0280.jpg") {
    Rename-Item "304A0280.jpg" "penghu-kiwi-villa-premium-quad-room2.jpg"
    Write-Host "✓ 304A0280.jpg → penghu-kiwi-villa-premium-quad-room2.jpg"
}

if (Test-Path "304A0295.jpg") {
    Rename-Item "304A0295.jpg" "penghu-kiwi-villa-premium-quad-room3.jpg"
    Write-Host "✓ 304A0295.jpg → penghu-kiwi-villa-premium-quad-room3.jpg"
}

if (Test-Path "304A0290.jpg") {
    Rename-Item "304A0290.jpg" "penghu-kiwi-villa-premium-quad-room4.jpg"
    Write-Host "✓ 304A0290.jpg → penghu-kiwi-villa-premium-quad-room4.jpg"
}

if (Test-Path "304A0278.jpg") {
    Rename-Item "304A0278.jpg" "penghu-kiwi-villa-premium-quad-room5.jpg"
    Write-Host "✓ 304A0278.jpg → penghu-kiwi-villa-premium-quad-room5.jpg"
}

if (Test-Path "304A0293.jpg") {
    Rename-Item "304A0293.jpg" "penghu-kiwi-villa-premium-quad-room6.jpg"
    Write-Host "✓ 304A0293.jpg → penghu-kiwi-villa-premium-quad-room6.jpg"
}

if (Test-Path "304A0277.jpg") {
    Rename-Item "304A0277.jpg" "penghu-kiwi-villa-premium-quad-room7.jpg"
    Write-Host "✓ 304A0277.jpg → penghu-kiwi-villa-premium-quad-room7.jpg"
}

if (Test-Path "304A0338.jpg") {
    Rename-Item "304A0338.jpg" "penghu-kiwi-villa-premium-quad-room8.jpg"
    Write-Host "✓ 304A0338.jpg → penghu-kiwi-villa-premium-quad-room8.jpg"
}

# 回到根目錄
Set-Location "../../.."

# 奢華四人房 (deluxeQuad) - 10張圖片
Write-Host "`n處理奢華四人房圖片..." -ForegroundColor Cyan
Set-Location "images/rooms/deluxeQuad"

if (Test-Path "304A0356.jpg") {
    Rename-Item "304A0356.jpg" "penghu-kiwi-villa-deluxe-quad-room1.jpg"
    Write-Host "✓ 304A0356.jpg → penghu-kiwi-villa-deluxe-quad-room1.jpg"
}

if (Test-Path "304A0397.jpg") {
    Rename-Item "304A0397.jpg" "penghu-kiwi-villa-deluxe-quad-room2.jpg"
    Write-Host "✓ 304A0397.jpg → penghu-kiwi-villa-deluxe-quad-room2.jpg"
}

if (Test-Path "304A0351.jpg") {
    Rename-Item "304A0351.jpg" "penghu-kiwi-villa-deluxe-quad-room3.jpg"
    Write-Host "✓ 304A0351.jpg → penghu-kiwi-villa-deluxe-quad-room3.jpg"
}

if (Test-Path "304A0350.jpg") {
    Rename-Item "304A0350.jpg" "penghu-kiwi-villa-deluxe-quad-room4.jpg"
    Write-Host "✓ 304A0350.jpg → penghu-kiwi-villa-deluxe-quad-room4.jpg"
}

if (Test-Path "304A0353.jpg") {
    Rename-Item "304A0353.jpg" "penghu-kiwi-villa-deluxe-quad-room5.jpg"
    Write-Host "✓ 304A0353.jpg → penghu-kiwi-villa-deluxe-quad-room5.jpg"
}

if (Test-Path "304A0384.jpg") {
    Rename-Item "304A0384.jpg" "penghu-kiwi-villa-deluxe-quad-room6.jpg"
    Write-Host "✓ 304A0384.jpg → penghu-kiwi-villa-deluxe-quad-room6.jpg"
}

if (Test-Path "304A0374.jpg") {
    Rename-Item "304A0374.jpg" "penghu-kiwi-villa-deluxe-quad-room7.jpg"
    Write-Host "✓ 304A0374.jpg → penghu-kiwi-villa-deluxe-quad-room7.jpg"
}

if (Test-Path "304A0365.jpg") {
    Rename-Item "304A0365.jpg" "penghu-kiwi-villa-deluxe-quad-room8.jpg"
    Write-Host "✓ 304A0365.jpg → penghu-kiwi-villa-deluxe-quad-room8.jpg"
}

if (Test-Path "304A0401.jpg") {
    Rename-Item "304A0401.jpg" "penghu-kiwi-villa-deluxe-quad-room9.jpg"
    Write-Host "✓ 304A0401.jpg → penghu-kiwi-villa-deluxe-quad-room9.jpg"
}

if (Test-Path "304A0372.jpg") {
    Rename-Item "304A0372.jpg" "penghu-kiwi-villa-deluxe-quad-room10.jpg"
    Write-Host "✓ 304A0372.jpg → penghu-kiwi-villa-deluxe-quad-room10.jpg"
}

# 回到根目錄
Set-Location "../../.."

# 高級三人房 (premiumTriple) - 8張圖片
Write-Host "`n處理高級三人房圖片..." -ForegroundColor Cyan
Set-Location "images/rooms/premiumTriple"

if (Test-Path "304A0651.jpg") {
    Rename-Item "304A0651.jpg" "penghu-kiwi-villa-premium-triple-room1.jpg"
    Write-Host "✓ 304A0651.jpg → penghu-kiwi-villa-premium-triple-room1.jpg"
}

if (Test-Path "304A0647.jpg") {
    Rename-Item "304A0647.jpg" "penghu-kiwi-villa-premium-triple-room2.jpg"
    Write-Host "✓ 304A0647.jpg → penghu-kiwi-villa-premium-triple-room2.jpg"
}

if (Test-Path "304A0685.jpg") {
    Rename-Item "304A0685.jpg" "penghu-kiwi-villa-premium-triple-room3.jpg"
    Write-Host "✓ 304A0685.jpg → penghu-kiwi-villa-premium-triple-room3.jpg"
}

if (Test-Path "304A0642.jpg") {
    Rename-Item "304A0642.jpg" "penghu-kiwi-villa-premium-triple-room4.jpg"
    Write-Host "✓ 304A0642.jpg → penghu-kiwi-villa-premium-triple-room4.jpg"
}

if (Test-Path "304A0641.jpg") {
    Rename-Item "304A0641.jpg" "penghu-kiwi-villa-premium-triple-room5.jpg"
    Write-Host "✓ 304A0641.jpg → penghu-kiwi-villa-premium-triple-room5.jpg"
}

if (Test-Path "304A0658.jpg") {
    Rename-Item "304A0658.jpg" "penghu-kiwi-villa-premium-triple-room6.jpg"
    Write-Host "✓ 304A0658.jpg → penghu-kiwi-villa-premium-triple-room6.jpg"
}

if (Test-Path "304A0673.jpg") {
    Rename-Item "304A0673.jpg" "penghu-kiwi-villa-premium-triple-room7.jpg"
    Write-Host "✓ 304A0673.jpg → penghu-kiwi-villa-premium-triple-room7.jpg"
}

if (Test-Path "304A0689.jpg") {
    Rename-Item "304A0689.jpg" "penghu-kiwi-villa-premium-triple-room8.jpg"
    Write-Host "✓ 304A0689.jpg → penghu-kiwi-villa-premium-triple-room8.jpg"
}

# 回到根目錄
Set-Location "../../.."

# 高級雙床房 (premiumTwin) - 9張圖片
Write-Host "`n處理高級雙床房圖片..." -ForegroundColor Cyan
Set-Location "images/rooms/premiumTwin"

if (Test-Path "304A0545.jpg") {
    Rename-Item "304A0545.jpg" "penghu-kiwi-villa-premium-twin-room1.jpg"
    Write-Host "✓ 304A0545.jpg → penghu-kiwi-villa-premium-twin-room1.jpg"
}

if (Test-Path "304A0544.jpg") {
    Rename-Item "304A0544.jpg" "penghu-kiwi-villa-premium-twin-room2.jpg"
    Write-Host "✓ 304A0544.jpg → penghu-kiwi-villa-premium-twin-room2.jpg"
}

if (Test-Path "304A0542.jpg") {
    Rename-Item "304A0542.jpg" "penghu-kiwi-villa-premium-twin-room3.jpg"
    Write-Host "✓ 304A0542.jpg → penghu-kiwi-villa-premium-twin-room3.jpg"
}

if (Test-Path "304A0556.jpg") {
    Rename-Item "304A0556.jpg" "penghu-kiwi-villa-premium-twin-room4.jpg"
    Write-Host "✓ 304A0556.jpg → penghu-kiwi-villa-premium-twin-room4.jpg"
}

if (Test-Path "304A0537.jpg") {
    Rename-Item "304A0537.jpg" "penghu-kiwi-villa-premium-twin-room5.jpg"
    Write-Host "✓ 304A0537.jpg → penghu-kiwi-villa-premium-twin-room5.jpg"
}

if (Test-Path "304A0539.jpg") {
    Rename-Item "304A0539.jpg" "penghu-kiwi-villa-premium-twin-room6.jpg"
    Write-Host "✓ 304A0539.jpg → penghu-kiwi-villa-premium-twin-room6.jpg"
}

if (Test-Path "304A0564.jpg") {
    Rename-Item "304A0564.jpg" "penghu-kiwi-villa-premium-twin-room7.jpg"
    Write-Host "✓ 304A0564.jpg → penghu-kiwi-villa-premium-twin-room7.jpg"
}

if (Test-Path "304A0570.jpg") {
    Rename-Item "304A0570.jpg" "penghu-kiwi-villa-premium-twin-room8.jpg"
    Write-Host "✓ 304A0570.jpg → penghu-kiwi-villa-premium-twin-room8.jpg"
}

if (Test-Path "304A0548.jpg") {
    Rename-Item "304A0548.jpg" "penghu-kiwi-villa-premium-twin-room9.jpg"
    Write-Host "✓ 304A0548.jpg → penghu-kiwi-villa-premium-twin-room9.jpg"
}

# 回到根目錄
Set-Location "../../.."

# 高級雙人房 (premiumDouble) - 26張圖片
Write-Host "`n處理高級雙人房圖片..." -ForegroundColor Cyan
Set-Location "images/rooms/premiumDouble"

$doubleRoomFiles = @(
    "304A0425.jpg", "304A0409.jpg", "304A0490.jpg", "304A0479.jpg", "304A0451.jpg",
    "304A0444.jpg", "304A0493.jpg", "304A0487.jpg", "304A0454.jpg", "304A0520.jpg",
    "304A0494.jpg", "304A0456.jpg", "304A0467.jpg", "304A0506.jpg", "304A0458.jpg",
    "304A0475.jpg", "304A0449.jpg", "304A0529.jpg", "304A0528.jpg", "304A0448.jpg",
    "304A0489.jpg", "304A0404.jpg", "304A0411.jpg", "304A0416.jpg", "304A0429.jpg",
    "304A0414.jpg"
)

for ($i = 0; $i -lt $doubleRoomFiles.Length; $i++) {
    $oldName = $doubleRoomFiles[$i]
    $newName = "penghu-kiwi-villa-premium-double-room$($i + 1).jpg"
    
    if (Test-Path $oldName) {
        Rename-Item $oldName $newName
        Write-Host "✓ $oldName → $newName"
    }
}

# 回到根目錄
Set-Location "../../.."

Write-Host "`n🎉 所有圖片重新命名完成！" -ForegroundColor Green
Write-Host "現在所有圖片檔名都符合 SEO 標準了。" -ForegroundColor Green
Write-Host "`n請重新載入網頁查看效果。" -ForegroundColor Yellow 