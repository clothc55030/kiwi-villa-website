# 澎湖期遇度假會館 Kiwi Villa 官方網站

## 專案概述

這是澎湖期遇度假會館 Kiwi Villa 的官方網站，採用現代簡約設計風格，使用莫蘭迪色系，具備完整的響應式設計（RWD）、SEO 優化和動畫效果。

## 🎯 設計特色

- **現代簡約風格**：使用莫蘭迪色系，營造溫馨舒適的視覺體驗
- **響應式設計**：完美適配桌面、平板和手機設備
- **SEO 優化**：完整的 meta 標籤、Open Graph 和結構化資料
- **動畫效果**：使用 AOS.js 實現流暢的滾動動畫
- **模組化架構**：CSS 和功能按頁面拆分，便於維護

## 📁 檔案結構

```
kiwi-villa/
├── index.html              # 首頁
├── intro.html              # 細說期遇
├── location.html           # 地理資訊
├── rooms.html              # 房型設施
├── reviews.html            # 客戶評價
├── faq.html               # 常見問題
├── policy.html            # 訂房須知
├── css/
│   ├── base.css           # 全站共用基礎樣式
│   ├── layout.css         # 導航和 Footer 樣式
│   ├── index.css          # 首頁樣式
│   ├── intro.css          # 細說期遇樣式
│   ├── location.css       # 地理資訊樣式
│   ├── rooms.css          # 房型設施樣式
│   ├── reviews.css        # 客戶評價樣式
│   ├── faq.css           # 常見問題樣式
│   └── policy.css         # 訂房須知樣式
├── js/
│   └── main.js            # 主要 JavaScript 功能
├── images/
│   ├── hero/              # 首頁 banner 圖片
│   ├── rooms/             # 房型圖片
│   ├── gallery/           # 圖片畫廊
│   └── icons/             # 圖標檔案
├── assets/
│   ├── favicon.ico        # 網站圖標
│   ├── manifest.json      # PWA 配置檔
│   └── logo.webp          # 網站 Logo
└── README.md              # 專案說明
```

## 🎨 設計規範

### 色彩配置（莫蘭迪藍灰色系）
- **主色調**：`#7c9bb5` (深藍灰)
- **淺色調**：`#9bb0c4` (淺藍灰)
- **次要色**：`#a8b8c8` (柔和藍灰)
- **強調色**：`#b8c7d6` (最淺藍灰)
- **輔助色**：`#8fa3b3` (中等藍灰)
- **文字色**：`#4a453f` (炭灰)

### 字型設定
- **標題**：Playfair Display (serif)
- **內文**：Noto Sans TC (sans-serif)

### 響應式斷點
- **手機**：< 768px
- **平板**：768px - 992px
- **桌面**：> 992px

## 🔧 技術規格

### 前端技術
- **HTML5**：語義化標籤
- **CSS3**：Flexbox、Grid、CSS Variables
- **JavaScript ES6+**：模組化開發
- **AOS.js**：滾動動畫效果
- **Font Awesome**：圖標庫

### SEO 優化
- 完整的 meta 標籤配置
- Open Graph 社群分享優化
- 結構化資料 (JSON-LD)
- 語義化 HTML 標籤
- 圖片 alt 屬性優化

重要###禁止使用important！！

## 🌟 功能特色

### 首頁 (index.html)
- Hero Banner 區塊含動態背景
- 民宿特色介紹卡片
- 設施服務列表
- 行動呼籲區塊

### 細說期遇 (intro.html)
- 民宿故事介紹
- 設計理念展示
- 空間特色說明

### 地理資訊 (location.html)
- Google Map 地圖嵌入
- 周邊景點介紹
- 交通資訊說明

### 房型設施 (rooms.html)
- 房型卡片展示
- 設施圖標說明
- 可滑動房型列表

### 客戶評價 (reviews.html)
- Google Review 嵌入
- 評價卡片展示
- 星級評分系統

### 常見問題 (faq.html)
- Accordion 展開式設計
- 分類篩選功能
- 純 CSS 動畫效果

### 訂房須知 (policy.html)
- 條列式資訊展示
- 重要提醒區塊
- 聯絡方式整合

## 🚀 部署說明

1. **檔案上傳**：將所有檔案上傳至網站根目錄
2. **圖片設置**：在 `images/` 資料夾中放置對應的 .webp 格式圖片
3. **Logo 設置**：在 `assets/` 資料夾中放置 logo.webp
4. **網站測試**：檢查所有頁面連結和功能是否正常

## 📱 瀏覽器支援

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- iOS Safari 12+
- Android Chrome 60+

## 🛠️ 維護指南

### 新增頁面
1. 建立 HTML 檔案
2. 在 `css/` 資料夾中建立對應的 CSS 檔案
3. 在所有頁面的導航選單中加入連結
4. 更新 sitemap.xml

### 修改樣式
- 全站共用樣式：編輯 `css/base.css`
- 導航和 Footer：編輯 `css/layout.css`
- 頁面專用樣式：編輯對應的 CSS 檔案


### 新增功能
- 在 `js/main.js` 中添加 JavaScript 功能
- 保持程式碼模組化和註解完整

## 📞 聯絡資訊

- **網站**：澎湖期遇度假會館
- **訂房熱線**：0933-636373
- **地址**：澎湖縣馬公市西衛里347號
- **線上訂房**：https://booking.owlting.com/kiwi-villa
- **LINE 官方帳號**：https://page.line.me/ucz4004x
- **Facebook**：https://www.facebook.com/kiwivilla.home/
- **Instagram**：https://www.instagram.com/kiwi_villa/
- **WeChat**：rickywang4159

---

© 2025 澎湖期遇度假會館. All rights reserved. 

images/intro/ 資料夾中放置以下圖片檔案：
intro-hero-bg.webp - Hero 區塊背景圖
intro-og.webp - 社群分享圖片
lobby.webp - 期遇環境圖-大廳
restaurant.webp - 期遇環境圖-餐廳
bed.webp - 期遇設備圖-床組
furniture.webp - 期遇家具圖-桌椅
elevator.webp - 期遇設備圖-電梯
curtains.webp - 期遇設備圖-電動窗簾
cta-bg.webp - CTA 區塊背景圖

images/location/ 資料夾中放置以下圖片檔案：
location-hero-bg.webp - Hero 區塊背景圖
location-og.webp - 社群分享圖片
cta-bg.webp - CTA 區塊背景圖
penghu-map.jpg - 澎湖地圖 (已存在)

