# CLAUDE.md - 澎湖期遇度假會館網站專案

請您**永遠使用繁體中文回覆我**

## 專案概述

澎湖期遇度假會館 (Kiwi Villa) 官方網站 — 一個**純靜態網站**，專注於性能、使用者體驗與 SEO。

- **網站域名**: www.kiwi-villa.com
- **專案類型**: 純靜態網站（HTML/CSS/JS，無建置系統）
- **主要語言**: 繁體中文 (zh-TW)
- **部署平台**: Cloudflare Pages（自 Git 自動部署）

### ⚠️ 架構限制（嚴格遵守）
- ❌ 不得加入任何後端功能（Node.js, PHP, Python 伺服器等）、伺服器端資料庫、需伺服器處理的表單或 API
- ❌ **不使用任何建置系統**（無 npm/webpack/打包）；直接編輯 HTML 即上線
- ✅ 僅前端技術；可用第三方前端服務（Google Fonts、Font Awesome、Elfsight 評論牆等）

## 真實架構（重要：與舊版文件不同，請以此為準）

> 本專案**沒有模組化的 CSS/JS 檔**。所有樣式與腳本幾乎都**內聯**在每個 HTML 內。

- **CSS**：每頁一個大型內聯 `<style>` 區塊。`css/` 只有 `core.min.css`（21KB，舊藍灰設計），**僅 `404.html` 引用**，其餘頁面不用。
- **JS**：每頁尾端一個內聯 `<script>`（捲動進場、nav 滾動變色、全螢幕選單）。`rooms.html` 另含 slider/lightbox、`faq.html` 另含手風琴。`js/` 目錄目前為空。
  - 曾嘗試把共用 JS 抽到外部 `js/site.js`，但因下述「reveal 陷阱」在某些預覽環境造成內文消失而**已還原**。要再抽外部 JS，必須先加「JS 失效時內文仍可見」的 fallback。
- **各頁 `:root` 設計 token 已分岔**（顏色、間距尺度不一致），且 nav/footer/JSON-LD/footer 連結等在各頁各複製一份。**任何全站性樣式/結構修改通常要同步改 7-8 個 HTML**。
- **CSP**（`_headers`）實際含 `'unsafe-inline'` 與 `'unsafe-eval'`（因全站內聯 + Elfsight 第三方腳本需要），並非嚴格 CSP。

### 🚨 reveal 陷阱（修改前必讀）
全站內文都包在 `.reveal-up`（CSS 預設 `opacity:0`，靠內聯 JS 在捲動時加 `.active` 才淡入）。
**只要 reveal 用的那段 JS 沒有執行，整頁內文就會全部隱形。** 故：
- 不要把控制 reveal 的 JS 改成依賴外部檔載入成功，除非同時提供「無 JS 也可見」的 fallback。
- hero 標題用的是純 CSS `fadeUp` 動畫（不依賴 JS），與 reveal-up 不同。

## 檔案結構

```
/
├── index.html / intro.html / rooms.html / location.html
├── reviews.html / faq.html / policy.html        # 7 個主要內容頁（CSS/JS 內聯）
├── 404.html                                      # 錯誤頁（舊藍灰設計，引用 css/core.min.css）
├── css/core.min.css                              # 僅 404 使用
├── js/                                           # 目前為空
├── images/
│   ├── hero/         # 主視覺（已清理未用變體）
│   ├── rooms/<房型子目錄>/penghu-kiwi-villa-*.webp   # 房型相簿（實際使用）
│   ├── intro/ facilities/ location/ logo/ ...
├── assets/manifest.json, og-image.jpg/.webp
├── _headers          # 安全標頭 + 快取（CSP 含 unsafe-inline/eval）
├── _redirects        # 房號短網址 + .html→無後綴 301
├── robots.txt / sitemap.xml / CNAME
└── .claude/launch.json   # 本地預覽設定（python http.server :8000）
```

## 技術重點

- **圖片**：優先 WebP/AVIF，`<img loading="lazy">` 原生懶載入（**非** IntersectionObserver）。社群分享圖 `assets/og-image.jpg`（1200×630，給 LINE/FB）；JSON-LD 用較高解析度的 webp。多數 `<img>` 已補 `width/height` 防 CLS。
- **字體**：Google Fonts（多數頁 Cormorant Garamond + LXGW WenKai TC + Inter + Noto Sans TC；rooms 用 Playfair Display）、`display=swap`、有 preconnect。Font Awesome 自 cdnjs 以非阻塞方式載入（`media="print" onload`，含 `<noscript>` 後備）。
- **SEO**：每頁獨特 title/description、Open Graph、canonical（無後綴）；結構化資料以首頁 `LodgingBusiness`（`@id` = `https://www.kiwi-villa.com/#lodging`）為單一主實體，其餘頁以 `@id` 參照。FAQ 頁有 `FAQPage`。
- **手機**：底部固定浮動 CTA（線上訂房 + LINE）；觸控目標 ≥44px。

## 常用命令

```bash
# 本地預覽（專案根目錄）
python -m http.server 8000
# 或透過 .claude/launch.json 的 "static" 設定啟動預覽
```

無 package.json / 無建置；改 HTML 後直接 commit 即可。

## 維護注意事項

- 修改全站共用區塊（nav/footer/配色/字體）時，記得 7-8 個 HTML 都要同步改（無單一來源）。
- 改 JSON-LD 後務必驗證仍為合法 JSON。
- 刪圖片前先全站 grep「子目錄/檔名」確認零引用。
- 商家資訊（電話、地址、座標、評分）目前散落多頁，更新時注意一致性。geo 座標統一為 `23.5868758, 119.5818157`（Google 商家官方 Pin，place CID 0x2157a9c94466e69b）。
- 部署：把工作分支合回 `main`，Cloudflare Pages 自動建置。

## 已知技術債（待處理，非阻斷）

- 各頁內聯 CSS/JS 重複、`:root` token 分岔（治本需抽共用檔＋統一 token，會有視覺變化，需逐頁審）。
- `404.html` 仍是舊藍灰設計、引用 `css/core.min.css`（與其餘頁設計不一致）。
- CSP 的 `unsafe-eval` 待部署後實測 Elfsight 是否真的需要，再決定能否移除。

---

*最後更新：2026-06（依實際程式碼校正）*
