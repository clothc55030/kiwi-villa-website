# 專案交接文件

## 當前狀態 (2024-12-19)

### ✅ 已完成階段
- **階段 0**: 專案初始化與環境設定
- **階段 0.5**: 設計系統與性能策略

### 🏗️ 專案結構
```
kiwi-villa-astro/
├── src/
│   ├── layouts/
│   │   └── Layout.astro      # 主要佈局，包含性能優化
│   ├── pages/
│   │   └── index.astro       # 測試頁面，展示設計系統
│   └── styles/
│       └── globals.css       # Tailwind CSS v4 配置和設計 tokens
├── public/
│   └── favicon.svg           # 預設 favicon
├── astro.config.mjs          # Astro 配置，包含圖片和性能優化
├── package.json              # 專案依賴
├── DESIGN_SYSTEM.md          # 設計系統文件
└── MIGRATION_PLAN.md         # 遷移計劃（已更新）
```

### 🚀 如何開始

1. **進入專案目錄**
   ```bash
   cd kiwi-villa-astro
   ```

2. **安裝依賴** (如果需要)
   ```bash
   pnpm install
   ```

3. **啟動開發伺服器**
   ```bash
   pnpm dev
   ```
   網站會在 http://localhost:4322/ 運行

### 📋 下一步工作：階段 1 - 靜態資源與共用元件遷移

主要任務：
1. **複製靜態資源**
   - 從根目錄複製 `images/` 到 `kiwi-villa-astro/public/images/`
   - 複製 `assets/manifest.json` 到 `kiwi-villa-astro/public/assets/`
   - 複製 favicon 相關檔案

2. **建立 Header 元件**
   - 路徑：`src/components/Header.astro`
   - 參考原始檔案：根目錄的 HTML 檔案中的 `<nav>` 部分
   - 使用 Tailwind CSS 重寫樣式
   - 使用 astro-icon 取代 Font Awesome

3. **建立 Footer 元件**
   - 路徑：`src/components/Footer.astro`
   - 參考原始檔案：根目錄的 HTML 檔案中的 `<footer>` 部分
   - 保持相同的視覺設計

### ⚠️ 重要提醒

1. **Tailwind CSS v4 語法**
   - 使用 `bg-primary`、`text-secondary` 等自定義顏色
   - 參考 `src/styles/globals.css` 中的 `@theme` 定義

2. **設計原則**
   - 保持莫蘭迪色系（低飽和度藍灰色調）
   - 確保元素有適當的視覺存在感
   - 行動裝置優先，目標 LCP < 2.5s

3. **已知問題**
   - LightningCSS 會對 `@theme` 顯示警告（可忽略）
   - 靜態資源 404 錯誤（待複製資源後解決）

### 📚 參考文件
- **設計系統**: `DESIGN_SYSTEM.md`
- **遷移計劃**: `MIGRATION_PLAN.md`
- **原始網站**: 根目錄的 HTML/CSS/JS 檔案

### 💡 技術棧
- Astro v5.10.1
- Tailwind CSS v4.1.11
- Motion One (待安裝)
- Astro Icon
- Partytown

祝您開發順利！如有問題，請參考設計系統文件和遷移計劃。 