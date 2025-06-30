# Claude AI 助手記錄

## 語言偏好
- 使用繁體中文進行對話

## 專案概述
這是一個名為「Kiwi Villa」（奇異果別墅）的飯店/住宿業靜態網站專案。

## 技術架構
- **前端**：靜態 HTML/CSS/JavaScript 網站
- **託管平台**：Cloudflare Pages（免費方案）
- **版本控制**：GitHub
- **部署方式**：GitHub 自動推送觸發部署

## 專案結構
### 主要頁面
- `index.html` - 首頁
- `rooms.html` - 房型頁面
- `location.html` - 位置資訊
- `reviews.html` - 評價頁面
- `faq.html` - 常見問題
- `intro.html` - 介紹頁面
- `policy.html` - 政策頁面

### 樣式與腳本
- CSS 樣式表：base.css、rooms.css、layout.css 等
- JavaScript：main.js
- Service Worker：sw.js（離線功能）

### 媒體資源
- 飯店房型照片（多種格式：webp、avif、jpg）
- Logo 和圖示檔案
- 響應式圖片資源

### 配置檔案
- `manifest.json` - 網頁應用程式清單
- `sitemap.xml` - 網站地圖
- `robots.txt` - 搜尋引擎指令
- `_redirects` - Cloudflare Pages 重導向規則

## 部署特點
- 快速載入
- CDN 全球加速
- 免費 SSL 憑證
- 自動 HTTPS 重導向
- 無伺服器維護成本

## 資料庫
此專案為純靜態網站，無後端資料庫架構。

## 優化分析
詳細的網站優化分析報告已記錄在 `OPTIMIZATION_ANALYSIS.md` 檔案中，包含：
- SEO 優化狀況分析
- 視覺效果和性能評估
- 程式碼錯誤清單
- 傳統和創新的優化方案
- 實施優先級建議

## 主要優化重點
1. **立即修復**：Schema.org 錯誤、console.log 清理、Service Worker 404
2. **性能優化**：CSS 合併（106KB → <50KB）、圖片壓縮、懶載入
3. **創新方案**：Motion One 動畫、Blurhash 佔位符、Astro 重構

## 備忘錄
- to memorize