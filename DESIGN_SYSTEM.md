# 期遇度假會館設計系統

## 🎨 設計理念

本設計系統基於莫蘭迪色系（Morandi Color Palette），以柔和、低飽和度的藍灰色調為主，營造出優雅、寧靜的視覺氛圍，符合度假會館的品牌形象。

## 🎯 核心原則

1. **視覺存在感**：所有元素都應有適當的視覺重量，不過於淡化
2. **性能優先**：行動裝置 LCP < 2.5s，使用系統字體優先
3. **可及性**：確保足夠的色彩對比度和鍵盤導航支援
4. **一致性**：在所有頁面保持統一的視覺風格

## 📐 設計 Tokens

### 顏色系統

#### 主色調（莫蘭迪藍灰色系）
```css
--color-primary: #7c9bb5;        /* 深藍灰 - 主要品牌色 */
--color-primary-light: #9bb0c4;  /* 淺藍灰 - 懸停狀態 */
--color-primary-dark: #6b8aa0;   /* 深藍灰色 - 按下狀態 */

--color-secondary: #a8b8c8;      /* 柔和藍灰 - 次要色 */
--color-secondary-light: #b8c7d6;/* 最淺藍灰 - 背景色 */
--color-secondary-dark: #8fa3b3; /* 中等藍灰 - 邊框色 */

--color-accent: #9bb0c4;         /* 強調藍灰 */
--color-accent-light: #b8c7d6;   /* 淺強調色 */
```

#### 中性色
```css
--color-gray-light: #f7f6f4;    /* 暖白 - 背景 */
--color-gray-medium: #e6e2dc;   /* 淺灰米 - 分隔線 */
--color-gray-dark: #8a8580;     /* 暖灰 - 次要文字 */
--color-charcoal: #4a453f;      /* 炭灰 - 主要文字 */
```

#### 語意色彩
```css
--color-text-primary: #4a453f;   /* 主文字 - 高對比 */
--color-text-secondary: #8a8580; /* 副文字 - 中對比 */
--color-text-light: #ffffff;     /* 淺色文字 */
--color-text-muted: #b5b0aa;     /* 淡化文字 */

--color-bg-primary: #ffffff;     /* 主背景 */
--color-bg-secondary: #f7f6f4;   /* 次背景 */
--color-bg-accent: #faf9f7;      /* 強調背景 */
```

### 字體系統

優先使用系統字體以提升性能，同時保持視覺美感：

```css
--font-family-sans: 
  -apple-system,           /* macOS/iOS */
  "PingFang TC",          /* macOS/iOS 繁體中文 */
  "Microsoft YaHei",      /* Windows 簡體中文 */
  "Noto Sans TC",         /* 備用美觀字體 */
  system-ui, 
  sans-serif;

--font-family-serif: 
  "Playfair Display",     /* 標題字體 */
  -apple-system,
  "PingFang TC",
  "Microsoft YaHei",
  serif;
```

### 間距系統

採用 8px 基準的間距系統：

```css
--spacing-xs: 0.5rem;   /* 8px */
--spacing-sm: 1rem;     /* 16px */
--spacing-md: 1.5rem;   /* 24px */
--spacing-lg: 2rem;     /* 32px */
--spacing-xl: 3rem;     /* 48px */
--spacing-xxl: 4rem;    /* 64px */
```

### 陰影系統

柔和的陰影效果，符合莫蘭迪美學：

```css
--shadow-light: 0 2px 8px rgba(74, 69, 63, 0.08);
--shadow-medium: 0 4px 16px rgba(74, 69, 63, 0.12);
--shadow-heavy: 0 8px 24px rgba(74, 69, 63, 0.16);
```

### 動畫時間

```css
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### 響應式斷點

```css
--breakpoint-sm: 640px;   /* 手機 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 小筆電 */
--breakpoint-xl: 1280px;  /* 桌機 */
--breakpoint-2xl: 1536px; /* 大螢幕 */
```

## 🖼️ 圖片優化策略

### 格式優先級
1. AVIF (最佳壓縮率)
2. WebP (廣泛支援)
3. JPEG/PNG (降級方案)

### 尺寸斷點
- 手機: 768px
- 平板: 1024px  
- 桌機: 1920px

### 品質設定
- WebP: 80%
- AVIF: 80%
- 保持視覺品質的前提下最大化壓縮

## 🚀 性能優化指南

### 關鍵 CSS 內聯
- Hero 區域樣式
- 導覽列樣式
- 首屏可見內容樣式

### 資源載入策略
1. 預載入關鍵圖片
2. 延遲載入非關鍵 CSS
3. 使用 Partytown 處理第三方腳本

### 行動裝置優化
- 目標 LCP < 2.5s
- 減少渲染阻塞資源
- 優化字體載入

## 📱 元件使用範例

### 按鈕
```html
<!-- 主要按鈕 -->
<button class="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg shadow-light hover:shadow-medium transition-all duration-normal">
  立即預訂
</button>

<!-- 次要按鈕 -->
<button class="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-lg shadow-light hover:shadow-medium transition-all duration-normal">
  了解更多
</button>

<!-- 輪廓按鈕 -->
<button class="border-2 border-primary text-primary hover:bg-primary hover:text-white px-6 py-3 rounded-lg transition-all duration-normal">
  聯絡我們
</button>
```

### 卡片
```html
<div class="bg-white rounded-xl shadow-light hover:shadow-medium transition-shadow duration-normal p-6">
  <h3 class="font-serif text-xl mb-2">豪華家庭房</h3>
  <p class="text-text-secondary">適合家庭入住的寬敞空間</p>
</div>
```

### 動畫類別
```css
/* 淡入上移 */
.animate-fade-in-up

/* 淡入 */
.animate-fade-in

/* 左滑入 */
.animate-slide-in-left

/* 右滑入 */
.animate-slide-in-right

/* 漸層動畫 */
.animate-gradient
```

## 🌐 瀏覽器支援

- Chrome/Edge: 最新 2 個版本
- Firefox: 最新 2 個版本
- Safari: 最新 2 個版本
- iOS Safari: iOS 14+
- Chrome Android: Android 7+

## ♿ 無障礙指南

1. **色彩對比**：確保文字與背景的對比度符合 WCAG AA 標準
2. **聚焦狀態**：所有互動元素都有明顯的聚焦樣式
3. **鍵盤導航**：確保所有功能都可通過鍵盤操作
4. **語意化 HTML**：使用正確的 HTML 元素
5. **ARIA 標籤**：適當使用 ARIA 屬性增強可及性

## 📝 維護指南

1. 新增顏色時，確保符合莫蘭迪色系的低飽和度特性
2. 保持設計的一致性和視覺存在感
3. 任何修改都要考慮對性能的影響
4. 定期檢查 Core Web Vitals 指標 