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

- **CSS**：每頁一個大型內聯 `<style>` 區塊（含 404）。沒有外部 CSS 檔（舊的 `css/core.min.css` 已於 2026-10 隨 404 改版刪除）。
- **JS**：每頁尾端一個內聯 `<script>`（捲動進場、nav 滾動變色、全螢幕選單）。`rooms.html` 另含 slider/lightbox、`faq.html` 另含手風琴。`js/` 目錄目前為空。
  - 曾嘗試把共用 JS 抽到外部 `js/site.js`，但因下述「reveal 陷阱」在某些預覽環境造成內文消失而**已還原**。要再抽外部 JS，必須先加「JS 失效時內文仍可見」的 fallback。
- **各頁 `:root` 設計 token 已分岔**（顏色、間距尺度不一致），且 nav/footer/JSON-LD/footer 連結等在各頁各複製一份。**任何全站性樣式/結構修改通常要同步改 7-8 個 HTML**。
- **CSP**（`_headers`）實際含 `'unsafe-inline'` 與 `'unsafe-eval'`（因全站內聯 + Elfsight 第三方腳本需要），並非嚴格 CSP。

### 🚨 reveal 陷阱（修改前必讀）
全站內文都包在 `.reveal-up`（CSS 預設 `opacity:0`，靠內聯 JS 在捲動時加 `.active` 才淡入）。
**只要 reveal 用的那段 JS 沒有執行，整頁內文就會全部隱形。** 故：
- 不要把控制 reveal 的 JS 改成依賴外部檔載入成功，除非同時提供「無 JS 也可見」的 fallback。
- hero 標題用的是純 CSS `fadeUp` 動畫（不依賴 JS），與 reveal-up 不同。

### 🚨 檔案截斷陷阱（2026-07 首頁事故，大改動後必驗）
2026-07 發現 `index.html` 曾被某次 commit 意外**截斷尾部**：主 `LodgingBusiness` 的 JSON-LD 斷在 `"sameAs": ["https:` 這個字串中間，導致其後的 `]`、`</script>`、第二段 `WebSite` JSON-LD、手機浮動 CTA、`</body></html>` **全部遺失**。後果：

- Google Search Console 報「無法剖析的結構化資料／值類型不正確」（剖析器讀到沒有結尾引號的殘缺字串值）。
- 手機版首頁底部浮動 CTA（訂房＋LINE）消失。
- **首頁視覺大致正常、肉眼不易察覺**，只有讀原始碼或 SEO 工具才會發現 → 特別危險。

守則：

- 大範圍改動、換頁尾、動 JSON-LD、或用工具批次寫檔後，**務必驗證每頁完整**：結尾必為 `</body></html>`、每段 JSON-LD 都能 `json.loads`（驗證指令見「常用命令」）。
- **用工具寫長檔案容易被截斷**（本專案 HTML 動輒上千行）。分段 append、每段後 `wc -l` 核對行數，整檔寫完再跑完整性驗證；不要盡信單次工具輸出。
- 「合法 JSON」≠「schema.org 型別正確」；但**截斷造成的殘缺值**，Google 常回報成「值類型不正確」，排查結構化資料錯誤時，先確認檔案有沒有被截。

## 檔案結構

```
/
├── public/                                       # 網站部署目錄（Cloudflare Pages 指向此處）
│   ├── index.html / intro.html / rooms.html / location.html
│   ├── reviews.html / faq.html / policy.html / moses.html  # 8 個主要內容頁
│   ├── 404.html                                  # 錯誤頁（2026-10 改新版設計，內聯樣式，資源一律絕對路徑）
│   ├── js/                                       # 目前為空
│   ├── images/                                   # 圖片目錄
│   ├── assets/                                   # manifest.json, og-*.jpg, tide-*.json
│   ├── _headers                                  # 安全標頭 + 快取
│   ├── _redirects                                # 房號短網址 + .html→無後綴 301
│   └── robots.txt / sitemap.xml / CNAME / llms.txt
├── tools/                                        # 內部維護腳本（不發布至線上）
├── .claude/launch.json                           # 本地預覽設定（python -m http.server 8000 --directory public）
└── CLAUDE.md                                     # 專案規範（不發布至線上）
```

## 技術重點

- **圖片**：優先 WebP/AVIF，`<img loading="lazy">` 原生懶載入（**非** IntersectionObserver）。多數 `<img>` 已補 `width/height` 防 CLS。
- **首頁照片**（2026-10 更換）：放在 `images/home/`，原檔在 Ricky 電腦的 `Desktop\民宿照片`（2018 年攝，全 sRGB）。目前用：外观 304A0840（hero／og，裁掉右側鄰房）、半島微風用 Ricky 以 Gemini 依顶楼 304A0706 生成的注水版（原照泳池是空的；檔名加 -water，避免舊圖被瀏覽器長期快取）、外观 304A0849（立體美學）、201精选 304A0169（專屬寧靜）、夜景 304A0933（名句區背景，裁掉右側怪手）。
- **社群分享圖（og:image）**：首頁用 `assets/og-home.jpg`（外觀照 1200×630）；首頁 JSON-LD 的 `image` 用 `images/home/penghu-kiwi-villa-exterior-1920.webp` 與 og-home.jpg。舊的 `assets/og-image.jpg/.webp` 已於 2026-10 刪除。2026-07 起可為各頁做**專屬** og 圖，命名慣例 `assets/og-<slug>.jpg`（如 `og-rooms.jpg`），沿用 hero 視覺（米底＋中文小標＋「The ___」Cormorant Garamond 大字＋副標）以 PIL 腳本批次生成。**格式守則**：`og:image`／`twitter:image` 一律用 **JPEG/PNG，不要用 WebP**（LINE 等社群爬蟲對 webp 預覽支援不穩，會導致縮圖不顯示）；webp 只用於網頁內 `<img>` 與 JSON-LD `image`。文字為主的分享圖，PNG 邊緣最利，用 JPEG 則需 `quality≥95 + subsampling=0`。
- **字體**：Google Fonts（全站 Cormorant Garamond + LXGW WenKai TC + Noto Sans TC，房型頁以外另有 Inter；房型頁原本的 Playfair Display 已於 2026-10 換成霞鶩文楷）、`display=swap`、有 preconnect。Font Awesome 自 cdnjs 以非阻塞方式載入（`media="print" onload`，含 `<noscript>` 後備）。
- **SEO**：每頁獨特 title/description、Open Graph、canonical（無後綴）；結構化資料以首頁 `LodgingBusiness`（`@id` = `https://www.kiwi-villa.com/#lodging`）為單一主實體，其餘頁以 `@id` 參照。FAQ 頁有 `FAQPage`。
- **手機**：底部固定浮動 CTA（線上訂房 + LINE）；觸控目標 ≥44px。
- **快取（`_headers`）**：Cloudflare Pages 會把「多條規則都命中的同名標頭」用逗號串起來，所以 `Cache-Control` **不放在 `/*`**，每個網頁路徑各一條、靜態資源 `/images/*`、`/assets/*`、`/js/*` 一年 immutable。**新增頁面時要在 `_headers` 補該路徑的 Cache-Control**。`*.pages.dev` 網址一律 `X-Robots-Tag: noindex`。
- **中文不斜體**：每頁 `<style>` 開頭有 `html { font-synthesis: weight; }`，讓 `font-style: italic` 只作用在有真斜體的英文（Cormorant Garamond），中文維持正體。新頁面要一起加。
- **房型頁**：英文房名以訂房系統（OwlNest）為準（高級＝Superior、豪華＝Deluxe、奢華＝Luxury，並帶 with Balcony／with Bathtub）。輪播只渲染「目前＋前後各一張」（`.slide.active`／`.slide.is-near`，其餘 `display:none` 不下載）；手機可左右滑、燈箱可左右滑與下滑關閉。新增照片時 alt 照實描述照片內容。中文標題用霞鶩文楷（與其他頁一致）。
- **頁尾**：8 頁都有「Explore」網站導覽（8 個頁面連結）。新增頁面時 8 個 footer 與全螢幕選單都要加。
- **轉換追蹤（GA4）**：每頁在 GA 設定 `<script>` 後面有一段點擊追蹤，訂房（owlting）、LINE、電話連結被點時送 `booking_click`／`line_click`／`phone_click`，參數 `link_location`（nav、menu、mobile_bar、room_card、whole_villa、footer 或所在 section）、`room`（房型卡片的房號）、`link_text`。新頁面要一起複製；按鈕位置靠 DOM 結構自動判斷，不用在連結上加屬性。
- **LINE 直訂優惠**：手機浮動按鈕「LINE 直訂優惠」、房型頁每個預訂按鈕下方、首頁名句區、FAQ、llms.txt 都只寫「享專屬優惠」，**不寫優惠內容**（Ricky 依日期與房況調整）。
- **Google 評價數**：頁面與 llms.txt 只寫約略數字（例如「近 200 則」），每年 12 月更新潮汐資料時順便檢查（見 `tools/README.md`）。結構化資料不放評分（自家評論不具星等資格）。
- **刻意保留但未引用的檔案**：`images/location/penghu-map.webp`（插畫地圖，之後可用在 /location）、`images/logo/kiwi-villa-logo.png`（品牌主 Logo，外部可能引用）。

## 常用命令

```bash
# 本地預覽（專案根目錄）
python -m http.server 8000 --directory public
# 或透過 .claude/launch.json 的 "static" 設定啟動預覽
```

```bash
# 提交前完整性驗證：每頁結尾須為 </body></html>，每段 JSON-LD 須可解析
python tools/verify_site_integrity.py
```

無 package.json / 無建置；改 HTML 後直接 commit 即可。

## 維護注意事項

- 修改全站共用區塊（nav/footer/配色/字體）時，記得 7-8 個 HTML 都要同步改（無單一來源）。
- 改 JSON-LD 後務必驗證仍為合法 JSON，**並確認每頁結尾完整 `</body></html>`**（見「🚨 檔案截斷陷阱」與「常用命令」的驗證指令）。
- 刪圖片前先全站 grep「子目錄/檔名」確認零引用。
- 商家資訊（電話、地址、座標、評分）目前散落多頁，更新時注意一致性。geo 座標統一為 `23.5868758, 119.5818157`（Google 商家官方 Pin，place CID 0x2157a9c94466e69b）。
- **提交前別只信 `git status`**：本地曾遇 git 狀態輸出前後不一致，關鍵時用檔案內容（`wc -l`／`tail`／`grep`）交叉驗證實際結果。
- **推送前先看 `git status` / `git log`**：本機 `main` 可能已 ahead of `origin/main` 數個 commit，`git push` 會把那些既有 commit 一起推上線 → 確認都是要發布的再推。
- 部署：把工作分支合回 `main`，Cloudflare Pages 自動建置。動過結構化資料的話，部署後回 Search Console 對應報告點「驗證修正」。

## 已知技術債（待處理，非阻斷）

- 各頁內聯 CSS/JS 重複、`:root` token 分岔（治本需抽共用檔＋統一 token，會有視覺變化，需逐頁審）。
- CSP 的 `unsafe-eval` 待部署後實測 Elfsight 是否真的需要，再決定能否移除。

---

*最後更新：2026-10（404 改版、刪除未引用檔案、快取標頭規則、中文不斜體、房型頁輪播與英文房名、頁尾網站導覽）*
