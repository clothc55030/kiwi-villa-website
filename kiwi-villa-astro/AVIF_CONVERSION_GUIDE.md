# AVIF 圖片格式轉換指南

由於系統環境限制，無法直接執行圖片格式轉換。以下是幾種轉換方案：

## 方案一：使用線上轉換工具（推薦）

### 1. Squoosh.app（Google 開發）
- 網址：https://squoosh.app/
- 優點：免費、無需註冊、支援批量處理
- 步驟：
  1. 打開網站
  2. 拖放圖片
  3. 右側選擇 AVIF
  4. 調整品質（建議 80-85）
  5. 下載

### 2. Convertio
- 網址：https://convertio.co/webp-avif/
- 支援批量轉換（免費版最多 2 個檔案）

### 3. CloudConvert
- 網址：https://cloudconvert.com/webp-to-avif
- 每天有免費額度

## 方案二：本地工具安裝

### Windows (使用 WSL)
```bash
# 在 WSL 中安裝 ImageMagick
sudo apt update
sudo apt install imagemagick

# 然後運行轉換腳本
cd /mnt/c/kiwi-villa-website/kiwi-villa-astro
./scripts/convert-images.sh
```

### macOS
```bash
# 使用 Homebrew 安裝
brew install imagemagick

# 運行轉換
./scripts/convert-images.sh
```

### 使用 Node.js (已有腳本)
```bash
# 修復 node_modules 權限問題
sudo chown -R $(whoami) node_modules

# 安裝 sharp
pnpm add -D sharp

# 運行轉換
node scripts/generate-avif.js
```

## 方案三：使用 Python 腳本
```bash
# 安裝必要套件
pip install Pillow pillow-avif-plugin

# 運行轉換
python3 scripts/convert-to-avif.py
```

## 需要轉換的圖片清單

### intro 頁面圖片（優先）
- `/public/images/intro/lobby.webp` → `lobby.avif`
- `/public/images/intro/restaurant.webp` → `restaurant.avif`
- `/public/images/intro/bed.webp` → `bed.avif`
- `/public/images/intro/furniture.webp` → `furniture.avif`
- `/public/images/intro/elevator.webp` → `elevator.avif`
- `/public/images/intro/curtains.webp` → `curtains.avif`

### 轉換參數建議
- **品質**: 80-85（平衡檔案大小和視覺品質）
- **速度**: 4-6（平衡轉換速度和壓縮率）
- **色彩空間**: YUV420（減少檔案大小）

## 驗證轉換結果

轉換完成後，將 AVIF 檔案放置在相應的目錄中。頁面已經配置好支援 AVIF，會自動使用新格式。

```html
<!-- 瀏覽器會自動選擇支援的格式 -->
<picture>
  <source data-srcset="/images/intro/lobby.avif" type="image/avif">
  <source data-srcset="/images/intro/lobby.webp" type="image/webp">
  <img data-src="/images/intro/lobby.webp" ...>
</picture>
```

## 預期效果
- AVIF 比 WebP 檔案大小減少 20-30%
- 保持相同或更好的視覺品質
- 改善頁面載入速度，特別是在行動裝置上