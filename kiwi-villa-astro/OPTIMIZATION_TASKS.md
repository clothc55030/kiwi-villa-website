# 網站優化任務清單 - Intro 頁面及全站改進

## 概述
本文檔記錄了針對 intro 頁面深入分析後發現的優化項目，並擴展到全站通用的改進建議。任務按優先級分為三個批次，確保循序漸進地提升網站品質。

## 批次一：高優先級任務（立即修復）

### 1.1 性能優化
- [ ] **清理 console.log**
  - 檔案：`main.js` (第 510、849 行)
  - 解決方案：使用 `import.meta.env.DEV` 條件判斷
  - 影響：減少生產環境的不必要輸出

- [ ] **圖片壓縮**
  - 目標：減少 30-40% 檔案大小
  - 工具：Squoosh.app 或 ImageOptim
  - 優先處理：首頁 hero 圖片、房型照片
  
- [ ] **避免 CLS（累積版面配置位移）**
  - 為所有圖片添加明確的 width 和 height 屬性
  - 特別注意：hero 圖片、房型圖片庫

### 1.2 無障礙性修復
- [ ] **文字對比度**
  - 問題區域：淺色背景上的文字
  - 目標：符合 WCAG AA 標準（4.5:1）
  - 工具：Chrome DevTools 的對比度檢查器

- [ ] **圖標無障礙性**
  ```html
  <!-- 修改前 -->
  <iconify-icon icon="heroicons:beaker"></iconify-icon>
  
  <!-- 修改後 -->
  <iconify-icon icon="heroicons:beaker" aria-label="淨水系統"></iconify-icon>
  ```

- [ ] **焦點樣式增強**
  ```css
  /* 添加到 globals.css */
  @layer utilities {
    *:focus-visible {
      @apply ring-2 ring-primary ring-offset-2 outline-none;
    }
  }
  ```

### 1.3 SEO 基礎優化
- [ ] **改善圖片 ALT 文字**
  - 現況：過於簡單（如 "房間照片"）
  - 改進：描述性文字（如 "雙人房內部照片，展示木質地板與莫蘭迪色系裝潢"）

- [ ] **增加內部連結**
  - 在 intro 頁面適當位置連結到：
    - 房型頁面（rooms）
    - 位置資訊（location）
    - 訂房政策（policy）

## 批次二：中優先級任務（一週內完成）

### 2.1 CSS 優化
- [ ] **合併重複樣式**
  - 分析 `intro.css` 的 409 行代碼
  - 識別並合併相似的媒體查詢
  - 預期減少 20-30% CSS 大小

- [ ] **實施 Critical CSS**
  - 提取首屏必要樣式
  - 內聯到 `<head>` 中
  - 延遲載入非關鍵 CSS

### 2.2 動畫性能優化
- [ ] **優化動畫元素**
  ```css
  /* 為動畫元素添加 will-change */
  .animate-element {
    will-change: transform, opacity;
  }
  
  /* 動畫完成後移除 */
  .animation-done {
    will-change: auto;
  }
  ```

- [ ] **行動裝置動畫降級**
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

### 2.3 進階圖片優化
- [ ] **實施真正的懶加載**
  ```javascript
  // 創建 utils/lazyload.js
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  // 應用到所有懶加載圖片
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
  ```

- [ ] **添加 AVIF 格式支援**
  - 為主要圖片生成 AVIF 版本
  - 更新 `<picture>` 元素優先使用 AVIF

## 批次三：長期優化任務（一個月內完成）

### 3.1 進階性能優化
- [ ] **實施 Blurhash**
  - 為所有圖片生成模糊佔位符
  - 改善感知載入速度
  - 參考：https://blurha.sh/

- [ ] **Service Worker 優化**
  - 實施智能緩存策略
  - 離線優先的關鍵資源
  - 網路優先的動態內容

### 3.2 開發體驗提升
- [ ] **TypeScript 遷移**
  - 為 Astro 元件添加類型定義
  - 改善開發時的錯誤檢測
  - 提升代碼可維護性

- [ ] **錯誤邊界實施**
  - 添加全局錯誤處理
  - 實施優雅降級方案
  - 錯誤追蹤與報告

### 3.3 測試與監控
- [ ] **端到端測試**
  - 使用 Playwright 或 Cypress
  - 測試關鍵用戶流程
  - 自動化視覺回歸測試

- [ ] **性能監控**
  - 整合 Web Vitals 監控
  - 設定性能預算
  - 實時告警機制

## 實施指南

### 開始前的準備
1. 建立新的 Git 分支：`git checkout -b optimization/batch-1`
2. 安裝必要工具（如圖片壓縮工具）
3. 準備測試環境

### 測試檢查清單
每完成一個批次後，執行以下測試：
- [ ] Lighthouse 分數（目標：Performance > 90, SEO > 95）
- [ ] WAVE 無障礙性測試（0 錯誤）
- [ ] 跨瀏覽器測試（Chrome, Firefox, Safari, Edge）
- [ ] 行動裝置測試（iOS Safari, Android Chrome）

### 進度追蹤
- 批次一：預計完成日期 ___________
- 批次二：預計完成日期 ___________
- 批次三：預計完成日期 ___________

## 注意事項

1. **版本控制**：每個批次完成後建立 Git tag
2. **回滾計劃**：保留原始檔案備份
3. **漸進式改進**：優先處理影響最大的項目
4. **測試優先**：每項修改都要經過充分測試

## 相關資源

- [WCAG 2.1 指南](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev 性能優化](https://web.dev/performance/)
- [Astro 最佳實踐](https://docs.astro.build/en/guides/best-practices/)
- [圖片優化工具 Squoosh](https://squoosh.app/)

---

最後更新：2025-06-29
負責人：___________