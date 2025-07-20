# CLAUDE.md - 澎湖期遇度假會館網站專案

請您**永遠使用繁體中文回覆我**

## 專案概述

澎湖期遇度假會館 (Kiwi Villa) 官方網站 - 一個優化過的**純靜態網站**，專注於性能、使用者體驗和 SEO。

### 專案資訊
- **專案名稱**: 澎湖期遇度假會館網站
- **網站域名**: www.kiwi-villa.com
- **專案類型**: 純靜態網站 (Pure Static Website)
- **架構限制**: **不使用任何後端功能**，僅前端技術
- **主要語言**: 繁體中文 (zh-TW)
- **部署平台**: Cloudflare Pages

### 重要約束
⚠️ **此專案為純靜態網站，後續開發嚴格限制**：
- ❌ 不得加入任何後端功能 (Node.js, PHP, Python 等)
- ❌ 不得使用伺服器端資料庫
- ❌ 不得加入需要伺服器處理的表單
- ❌ 不得使用任何需要後端 API 的功能
- ✅ 僅能使用前端技術 (HTML, CSS, JavaScript)
- ✅ 可使用第三方前端服務 (Google Analytics, 外部 API 等)

## 技術架構

### 前端技術棧
- **HTML5**: 語義化標記，完整的 meta 標籤和 SEO 優化
- **CSS3**: 響應式設計，使用 CSS Variables，Flexbox/Grid 佈局
- **Vanilla JavaScript**: 原生 JavaScript，模組化設計
- **圖片格式**: WebP, AVIF (現代格式) + JPG (向後相容)

### 效能優化特色
- **圖片懶載入**: 使用 Intersection Observer API
- **圖片格式優化**: 多格式支援 (AVIF > WebP > JPG)
- **CSS 模組化**: 分離的樣式表，優化載入順序
- **JavaScript 優化**: DOM 緩存、事件委派、節流機制
- **PWA 功能**: manifest.json，favicon 完整設定

### 安全性配置
- **CSP 政策**: 嚴格的內容安全政策
- **安全標頭**: X-Frame-Options, HSTS, X-Content-Type-Options
- **緩存策略**: 靜態資源長期緩存，HTML 短期緩存

## 檔案結構

```
/
├── index.html              # 首頁
├── intro.html             # 會館介紹
├── rooms.html             # 房型介紹
├── location.html          # 地理位置
├── reviews.html           # 客戶評價
├── faq.html              # 常見問題
├── policy.html           # 隱私政策
├── css/                  # 樣式表目錄
│   ├── core.css         # 核心樣式 (合併版)
│   ├── core.min.css     # 壓縮版核心樣式
│   ├── base.css         # 基礎樣式
│   ├── layout.css       # 佈局樣式
│   ├── index.css        # 首頁樣式
│   ├── intro.css        # 介紹頁樣式
│   ├── rooms.css        # 房型頁樣式
│   ├── location.css     # 位置頁樣式
│   ├── reviews.css      # 評價頁樣式
│   ├── faq.css          # FAQ 頁樣式
│   └── policy.css       # 隱私頁樣式
├── js/                   # JavaScript 目錄
│   ├── main.js          # 主要腳本
│   ├── main-optimized.js # 優化版主腳本
│   ├── lazy-load.js     # 懶載入功能
│   ├── lightbox-optimized.js # 燈箱效果
│   ├── room-gallery-optimized.js # 房型相簿
│   └── modules/         # 模組化腳本
│       ├── animations.js
│       ├── dom-cache.js
│       ├── faq.js
│       ├── lazy-loading.js
│       ├── loading.js
│       ├── navigation.js
│       ├── room-features.js
│       └── utils.js
├── images/              # 圖片資源
│   ├── hero/           # 主視覺圖片
│   ├── intro/          # 介紹頁圖片
│   ├── rooms/          # 房型圖片
│   ├── facilities/     # 設施圖片
│   ├── location/       # 位置相關圖片
│   ├── logo/           # Logo 和 Favicon
│   └── ...
├── assets/             # 其他資源
│   ├── manifest.json   # PWA 配置
│   └── og-image.webp   # 社群分享圖片
├── _headers            # Cloudflare Pages 安全標頭
├── _redirects          # 重定向規則
├── CNAME              # 域名配置
├── robots.txt         # 搜尋引擎指令
└── sitemap.xml        # 網站地圖
```

## 開發指南

### 🚫 開發限制與約束
**嚴格遵守純靜態網站原則**：
- 僅使用 HTML、CSS、JavaScript 前端技術
- 禁止任何形式的後端整合
- 所有互動功能必須在瀏覽器端完成
- 不得引入需要伺服器處理的依賴

### 代碼風格
- **HTML**: 使用語義化標籤，保持良好的縮排
- **CSS**: 使用 CSS Variables，遵循 BEM 命名規範概念
- **JavaScript**: ES6+ 語法，模組化設計，避免全域變數，僅使用前端 API

### 圖片處理
- **格式優先順序**: AVIF > WebP > JPG
- **響應式圖片**: 提供多種尺寸版本
- **懶載入**: 所有非關鍵圖片使用懶載入
- **壓縮**: 所有圖片都經過優化壓縮

### 效能最佳化
- **關鍵資源預載**: Hero 圖片使用 preload
- **CSS 關鍵路徑**: 內聯關鍵 CSS，延遲載入非關鍵 CSS
- **JavaScript 延遲**: 非關鍵腳本使用 defer/async
- **字體優化**: 預連接 Google Fonts

### SEO 優化
- **結構化資料**: 使用適當的 meta 標籤
- **Open Graph**: 完整的社群分享設定
- **網站地圖**: 定期更新 sitemap.xml
- **頁面標題**: 每頁獨特且描述性的標題

## 常用命令

由於這是靜態網站專案，沒有 package.json 或建置系統，主要是直接編輯檔案。

### 本地開發
```bash
# 使用 Python 簡易伺服器
python -m http.server 8000

# 或使用 Node.js live-server (需先安裝)
npx live-server --port=8000
```

### 圖片優化
```bash
# 如果有圖片需要優化，可以使用以下工具
# ImageOptim (macOS)
# TinyPNG/TinyJPG (線上)
# Squoosh (線上)
```

## 注意事項

### 安全性
- 所有外部資源都經過 CSP 驗證
- 避免使用 `unsafe-inline` 和 `unsafe-eval`
- 定期檢查依賴的外部 CDN

### 相容性
- 支援現代瀏覽器 (Chrome 80+, Firefox 80+, Safari 14+)
- 提供優雅降級機制
- 圖片格式回退支援

### 維護
- 定期檢查連結有效性
- 更新 sitemap.xml
- 監控網站載入速度
- 檢查行動裝置相容性

## 部署說明

網站部署在 Cloudflare Pages，自動從 Git Repository 部署。

### 環境變數
- 生產環境: Cloudflare Pages
- 域名: www.kiwi-villa.com
- SSL: 自動配置

### 快取策略
- 靜態資源: 1年快取
- HTML: 1小時快取
- 使用 immutable 標記提升效能

---

*最後更新: 2025年*