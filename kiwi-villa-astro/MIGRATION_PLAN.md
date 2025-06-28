# 重構藍圖：期遇度假會館 Astro 遷移計畫

**專案結構說明：**
- **原始專案位置：** 根目錄 `/` （包含現有的 HTML、CSS、JS 檔案）
- **新 Astro 專案位置：** `/kiwi-villa-astro/` 資料夾
- **遷移方式：** 逐步將原專案內容遷移到 Astro 專案中，完成後將 Astro 專案提升為主專案

**最終目標：** 將專案完全遷移到 Astro + Tailwind CSS + Motion One，同時保持現有的視覺外觀和 SEO 表現，並提升開發體驗與可維護性。

**核心工具集:**
- **框架:** Astro
- **樣式:** Tailwind CSS
- **動畫:** Motion One
- **圖示:** Astro Icon
- **圖片優化:** Astro Assets (`<Image />`)
- **SEO:** Astro Sitemap
- **性能:** Partytown

**設計原則:**
- 保持現有視覺設計不變
- 使用莫蘭迪色系配色
- 確保所有元素有適當的視覺存在感
- 優先考慮行動裝置性能（LCP < 2.5s）

---

### **階段 0：專案初始化與環境設定 (已完成)**
- **任務**:
    1. ✅ 初始化 Astro 專案 (`kiwi-villa-astro`)
    2. ✅ 整合 Tailwind CSS, Prettier, Astro Icon, Astro Sitemap, Partytown
    3. ✅ 分析 `core.css` 並將設計規範遷移至 `tailwind.config.cjs`
    4. ✅ 配置 `astro.config.mjs`
    5. ✅ 建立基礎 `Layout.astro`
    6. ✅ 建立 `src/styles/globals.css`
- **產出**: 一個配置完善、準備好開始遷移的 Astro 專案。

### **階段 0.5：設計系統與性能策略 (已完成)**
- **目標**: 建立一致的設計系統和性能優化基礎。
- **完成時間**: 2024-12-19
- **步驟**:
    1. **建立設計 tokens**: ✅
        - 設定字體堆疊：`fontFamily: { sans: ['-apple-system', 'PingFang TC', 'Microsoft YaHei', 'Noto Sans TC', 'sans-serif'] }`
        - 定義間距、圓角、陰影等設計變數
        - **註：已改用 Tailwind CSS v4.1.11**，設計 tokens 定義在 `src/styles/globals.css` 中使用 `@theme` 語法
    2. **圖片優化策略**: ✅
        - 在 `astro.config.mjs` 中配置圖片服務
        - 建立圖片尺寸斷點標準（mobile: 768px, tablet: 1024px, desktop: 1920px）
        - 配置 Vite 優化選項（內聯小於 4kb 的資源、CSS 代碼分割、壓縮等）
    3. **性能優化基礎**: ✅
        - 規劃關鍵 CSS 內聯策略（已在 Layout.astro 實作）
        - 設定資源載入優先級（預載入 hero 圖片）
        - 配置 Partytown 用於第三方腳本
        - **移除 Google Fonts，改用系統字體**提升行動裝置 LCP 性能
        - 添加性能監測腳本（PerformanceObserver）
- **產出**: 
    - ✅ 完整的設計系統文件 (`DESIGN_SYSTEM.md`)
    - ✅ 性能優化配置 (Layout.astro 中的關鍵 CSS 內聯)
    - ✅ Tailwind CSS v4 配置 (`src/styles/globals.css`)
    - ✅ 測試頁面 (`src/pages/index.astro`)
- **技術決策**:
    1. **使用 Tailwind CSS v4.1.11** 而非 v3，採用新的 CSS 配置方式
    2. **刪除了 tailwind.config.cjs**，改用 CSS 中的 `@theme` 語法
    3. **移除 @astrojs/tailwind 整合**，改用 @tailwindcss/vite
    4. **字體策略**：優先使用系統字體，Noto Sans TC 作為降級方案
    5. **CSS 代碼品質標準**: 嚴格遵循 Tailwind CSS 最佳實踐，禁用 `!important`、內聯樣式，所有自訂樣式透過 `@layer utilities` 定義，顏色系統統一管理於 `@theme` 區塊。
- **已知問題與注意事項**:
    1. **LightningCSS 警告**：會出現關於 `@theme` 和 `@tailwind` 的警告，這是正常的，不影響功能
    2. **404 錯誤**：靜態資源（圖片、favicon、manifest）尚未複製，將在階段 1 處理
    3. **Astro 組件語法**：確保所有 .astro 檔案的 frontmatter 部分用 `---` 正確包圍
    4. **開發伺服器**：運行在 http://localhost:4322/
- **給下一位開發者的提示**:
    - 設計系統已完整建立，請參考 `DESIGN_SYSTEM.md` 了解顏色、字體、間距等規範
    - 所有樣式應使用 Tailwind CSS utility classes，自定義顏色使用 `text-primary`、`bg-secondary` 等
    - 保持莫蘭迪色系的視覺風格，避免使用過於鮮豔的顏色
    - 確保所有元素有適當的視覺存在感，不要過於淡化
    - **CSS 代碼品質要求**：
      - 🚫 **禁止使用 `!important`**：改用更具體的選擇器或 Tailwind 的層級系統
      - 🚫 **禁止內聯樣式**：所有樣式透過 CSS classes 或 Tailwind utilities 實現
      - ✅ **新增顏色時**：必須加入 `@theme` 區塊，不可硬編碼 hex 值
      - ✅ **自訂工具類別**：使用 `@layer utilities` 正確定義
      - ✅ **動畫定義**：移除未使用的 keyframes，保持 CSS 檔案精簡
      - ✅ **品牌顏色**：統一使用設計系統變數（如 `bg-facebook`、`bg-line`）

---

### **階段 1：靜態資源與共用元件遷移 (已完成)**
- **目標**: 將網站的靜態資源 (圖片、字體、 manifest 等) 和共用 UI 元件 (導覽列、頁腳) 遷移至新專案。
- **完成時間**: 2025-06-28
- **前置需求**: ✅ 階段 0 和 0.5 已完成
- **步驟**:
    1. **複製靜態資源**: ✅
        - ✅ 將原專案的 `images/` 和 `assets/` 目錄完整複製到新專案的 `public/` 目錄下
        - ✅ 保留原有的 WebP 和 AVIF 格式圖片作為降級方案
        - ✅ 複製 `favicon.ico`、`robots.txt`、`_redirects`、`CNAME` 等檔案
    2. **建立 `Header` 元件**: ✅
        - ✅ 在 `src/components/` 中建立 `Header.astro`
        - ✅ 將原 `index.html` 中的 `<nav>` 結構複製進來
        - ✅ 使用 Tailwind utility classes 替換原有的 CSS class
        - ✅ 使用內聯 SVG 取代 Font Awesome 的 `<i>` 標籤
        - ✅ 將漢堡選單互動邏輯移植到 `Header.astro` 的 `<script>` 標籤中
        - ✅ **確保導覽列在行動裝置上的載入性能**
        - ✅ 實作當前頁面高亮顯示功能
    3. **建立 `Footer` 元件**: ✅
        - ✅ 在 `src/components/` 中建立 `Footer.astro`
        - ✅ 複製 `<footer>` 結構
        - ✅ 使用 Tailwind classes 重建樣式
        - ✅ 使用內聯 SVG 取代社群媒體連結的 `<i>` 標籤
        - ✅ 將動態年份的 JS 邏輯移植進來
        - ✅ 保持莫蘭迪色系設計風格
    4. **更新 `Layout.astro`**: ✅
        - ✅ 在 `Layout.astro` 中引入並使用 `Header` 和 `Footer` 元件
        - ✅ 建立語意化的頁面結構（header、main、footer）
        - ✅ 關鍵 CSS 內聯機制已保持
        - ✅ 預載入資源配置已保持
- **測試檢查點**:
    - ✅ 視覺回歸測試：與原網站對比
    - ✅ 性能測試：開發伺服器正常運行
    - ✅ 響應式測試：檢查各種裝置尺寸
- **技術決策**:
    1. **圖標系統**：改用內聯 SVG 取代 Font Awesome，提升載入性能
    2. **元件架構**：使用 Astro 元件系統實現模組化
    3. **樣式系統**：完全使用 Tailwind CSS utility classes
    4. **性能優化**：移除外部字體和圖標庫的依賴
- **產出**: 
    - ✅ 完整的網站骨架 (`Header.astro`, `Footer.astro`)
    - ✅ 更新的 `Layout.astro` 整合所有元件
    - ✅ 所有靜態資源正確複製到 `public/` 目錄
    - ✅ 開發伺服器運行測試（http://localhost:4322）
    - ✅ 階段完成報告文件 (`PHASE1_COMPLETE.md`)

---

### **階段 2：首頁 (`index.html`) 遷移 (已完成)**
- **目標**: 完整重建首頁，確保視覺和功能與原網站完全一致。
- **完成時間**: 2025-06-29
- **前置需求**: ✅ 階段 1 已完成
- **步驟**:
    1. **建立 `index.astro`**: ✅
        - ✅ 將原 `index.html` 的內容區塊遷移至 `src/pages/index.astro`
        - ✅ 使用 Tailwind CSS utility classes 取代所有樣式
    2. **遷移內容區塊**: ✅
        - ✅ Hero 區域：使用 `<picture>` 元素和 `<img>` 進行圖片優化，並確保 LCP 性能
        - ✅ Quick Intro：保持文字對比度和視覺衝擊力
        - ✅ Social Media：使用 `<Icon />` 元件取代 Font Awesome
        - ✅ CTA 區域：使用 Tailwind CSS 重建漸層動畫背景，確保按鈕的視覺存在感
    3. **引入 Motion One**: ✅
        - ✅ 安裝 `motion` 套件 (`pnpm add motion`)
        - ✅ 使用 Motion One 的 `animate` 和 `scroll` API 取代 AOS 動畫
        - ✅ 實作漸進式動畫載入（Hero 區塊載入時動畫，其餘區塊滾動時觸發）
    4. **性能優化**: ✅
        - ✅ Hero 圖片使用 `loading="eager"` 和 `fetchpriority="high"`
        - ✅ 其餘內容區塊的圖片和互動元素採用延遲載入策略
- **測試檢查點**:
    - ✅ LCP < 2.5s（基本達成，後續可持續監控）
    - ✅ 動畫流暢度測試
    - ✅ 圖片載入順序驗證
- **技術決策**:
    1. **動畫系統**: Motion One 取代 AOS，提供更佳的性能和更細膩的控制。
    2. **圖示系統**: Astro Icon (`<Icon/>`) 全面取代 Font Awesome。最終選定 `heroicons` (UI) 和 `simple-icons` (品牌Logo) 作為主要圖示庫，以確保語意正確性與未來擴充性。
    3. **樣式實現**: 100% 使用 Tailwind CSS utility classes，未撰寫額外 CSS 檔案。
    4. **Hero 圖片策略**: 由於 `public` 目錄下的圖片無法直接使用 Astro 的 `<Image>` 元件進行處理，故沿用 `<picture>` + `<img>` 標籤以保留複雜的圖片 art direction，同時手動添加性能屬性 (`loading`, `fetchpriority`)。
    5. **CSS 代碼品質標準**: 嚴格遵循 Tailwind CSS 最佳實踐，禁用 `!important`、內聯樣式，所有自訂樣式透過 `@layer utilities` 定義，顏色系統統一管理於 `@theme` 區塊。
- **產出**: ✅ 一個功能完整、樣式一致的首頁 (`src/pages/index.astro`)。
- **後續調整與清理**:
    1. **圖示庫問題排查**: ✅
        - 遷移後出現 `heroicons` 和 `mdi` 圖示集遺失的錯誤。
        - **解決方案**: 安裝對應的 `@iconify-json/*` 套件並更新 `astro.config.mjs`。
        - 接著發現 `mdi:line` 圖示名稱錯誤。
        - **解決方案**: 為了語意化和標準化，改為安裝並使用 `simple-icons` 圖示集來處理所有品牌 Logo，並將 `index.astro` 中的社群圖示統一。
    2. **依賴清理**: ✅
        - 根據使用者要求，移除了不再需要的 `@iconify-json/mdi` 套件。
        - 從 `astro.config.mjs` 中清除了對 `fas`、`fab` 和 `mdi` 的無用引用，保持專案乾淨。
    3. **Hero 區域設計改善**: ✅
        - **問題**: 使用者反映 Hero 區域設計不夠好看，文字不夠顯眼。
        - **解決方案**: 
          - 增強背景遮罩：使用雙層漸層（垂直 + 徑向）提升文字對比度
          - 優化文字層次：放大字體尺寸，增加 `drop-shadow` 效果
          - 改善視覺存在感：加強容器背景、邊框和陰影效果
          - 升級按鈕設計：更大尺寸、微互動動畫、更強視覺回饋
          - 保持莫蘭迪美學：使用柔和但有存在感的設計風格
    4. **CSS 代碼品質優化**: ✅
        - **發現的問題**:
          - 使用了 `!important` 宣告（違反 Tailwind CSS 最佳實踐）
          - 存在內聯樣式 `style="animation-delay: 0.2s"`
          - 重複的 keyframes 動畫定義
          - 硬編碼的品牌顏色值
          - 未使用的 CSS 動畫定義
        - **解決方案**:
          - **移除 `!important`**: 在 `prefers-reduced-motion` 中改用標準 CSS 覆蓋
          - **消除內聯樣式**: 建立 `.animate-delay-200` 和 `.animate-delay-400` 工具類別
          - **清理重複動畫**: 移除 `fade-in-up`、`slide-in-left` 等未使用的 keyframes，只保留 `gradientShift`
          - **建立品牌色彩系統**: 新增 `--color-instagram-start/end`、`--color-facebook`、`--color-line` 到設計系統
          - **統一顏色管理**: 將所有硬編碼顏色值移至設計系統變數
        - **最佳實踐遵循**:
          - 100% 使用 Tailwind utility classes 或設計系統變數
          - 正確使用 `@layer utilities` 定義自訂工具類別
          - 所有顏色統一在 `@theme` 區塊管理
          - 無任何 `!important` 宣告或內聯樣式
          - 維持代碼可讀性和可維護性

---

### **階段 3：遷移其餘靜態頁面 (`intro`, `location`, `policy`, `faq`)**
- **目標**: 將內容相對簡單的靜態頁面遷移過來。
- **步驟**: (對每個頁面重複以下步驟)
    1. 建立對應的 `.astro` 檔案
    2. 使用 `Layout.astro` 作為佈局，並複製 HTML 內容
    3. 用 Tailwind classes 取代原有的 CSS classes
    4. **特別注意 `faq.html`**: 
        - 將 FAQ 的手風琴和篩選器 JS 邏輯移植到 `faq.astro` 的 `<script>` 標籤中
        - 確保手風琴動畫的流暢性
    5. **圖片優化**:
        - 所有圖片使用 `<Image />` 元件
        - 設定適當的尺寸和品質參數
- **測試檢查點**:
    - [ ] 每個頁面的視覺一致性
    - [ ] 互動功能正常運作
    - [ ] 頁面載入時間 < 3s
- **產出**: 網站的靜態資訊頁面全部完成遷移。

---

### **階段 4：遷移複雜頁面 (`rooms.html`, `reviews.html`) + 資料管理**
- **目標**: 遷移包含複雜 JS 互動和動態內容的頁面，並優化資料管理。
- **步驟**:
    1. **建立 Content Collections**:
        - 在 `src/content/` 建立 `rooms` 和 `reviews` 集合
        - 將房型和評論資料抽離成 JSON/YAML 檔案
        - 定義資料結構 schema
    2. **遷移 `reviews.html`**:
        - 使用 Content Collections 管理評論資料
        - 建立 `ReviewCard.astro` 元件
        - 實作評論的動態載入
    3. **遷移 `rooms.html`**:
        - 將房型卡片抽離成 `RoomCard.astro` 元件
        - 使用 Content Collections 管理房型資料
        - 實作圖片藝廊功能：
          - 滑動功能使用 Motion One
          - Lightbox 功能移植到 `RoomCard.astro`
        - 實作房型直接導航的滾動和高亮邏輯
    4. **圖片最佳化**:
        - 為每個房型建立響應式圖片集
        - 實作漸進式圖片載入
- **測試檢查點**:
    - [ ] 圖片藝廊功能測試
    - [ ] 燈箱效果測試
    - [ ] 資料載入性能測試
- **產出**: 網站所有頁面遷移完畢，功能與原網站一致。

---

### **階段 5：最終清理、優化與部署**
- **目標**: 確保專案品質，並準備上線。
- **步驟**:
    1. **程式碼審查**: 
        - 移除無用的程式碼和註解
        - 統一程式碼風格
        - 檢查元件複用性
    2. **全面性能優化**:
        - 實施關鍵 CSS 內聯策略
        - 配置資源預載入
        - 使用 Partytown 處理第三方腳本
        - 確保所有圖片使用 `<Image />` 元件
    3. **SEO 與 Sitemap 驗證**:
        - 執行 `pnpm build`，驗證 sitemap 生成
        - 使用 Lighthouse 檢查 SEO 分數
        - 設定 301 重定向（如需要）
    4. **無障礙性檢查**: 
        - 執行 WAVE 或 axe 測試
        - 確保鍵盤導航正常
    5. **跨瀏覽器測試**:
        - Chrome, Firefox, Safari, Edge
        - iOS Safari, Chrome Android
    6. **部署準備**:
        - 環境變數配置
        - 建立部署腳本
        - 設定 CI/CD pipeline
    7. **部署與監控**:
        - 部署到 Netlify/Vercel/Cloudflare Pages
        - 設定性能監控（Web Vitals）
        - 設定錯誤追蹤
- **最終檢查清單**:
    - [ ] 所有頁面 LCP < 2.5s
    - [ ] 視覺設計完全一致
    - [ ] SEO 分數 > 95
    - [ ] 無障礙性分數 > 90
    - [ ] 零控制台錯誤
- **產出**: 一個現代化、高性能、易於維護的全新網站。

---

### **風險管理與回滾計劃**
1. **版本控制**: 每個階段完成後建立 Git tag
2. **A/B 測試**: 可考慮使用 Netlify Split Testing
3. **監控指標**: 
   - Core Web Vitals
   - 錯誤率
   - 使用者回饋
4. **回滾觸發條件**:
   - 性能指標下降 > 20%
   - 重大功能故障
   - SEO 排名顯著下降 