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
│   ├── wantai.html                               # 萬泰名產代訂（住客工具頁 /wantai，noindex，不在導覽與 sitemap）
│   ├── js/                                       # 目前為空
│   ├── images/                                   # 圖片目錄（images/wantai/ 為萬泰商品照片，由 tools/update-wantai-catalog.py 產生）
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
- **房型照三種寬度**（2026-11，原本只有 1008 寬，在 2x 螢幕與手機被放大約 2 倍而發糊）：`<檔名>.webp`（1008，`src` 預設）、`-1600.webp`、`-2400.webp`，全部由精选原檔（`Desktop\民宿照片\<房號>\<房號>精选`）直接縮（Lanczos、WebP q80；壓完每像素超過 0.8 bit 的紋理重照片用 q74），不裁切、不調色。`<img>` 用 `srcset` + `sizes` 讓瀏覽器依螢幕挑。`sizes` 寫的是照片框經 `object-fit: cover` 後**實際被畫出來的寬度**：橫式一律同一組（桌機框高 80vh → 120vh；手機刻意寫 100vw，讓手機拿 1600 而不是 2400）；直式分「單數房型（照片在 6fr 欄）」與「雙數房型（4fr 欄）」兩組 → **調整房型順序、照片框寬高時，`sizes` 要跟著改**（`tools/room-photo.py` 內有同一份）。燈箱用同一份 srcset，JS（`lbSizes`）依燈箱框的 CSS `max-width／max-height` 算 sizes 並預載相鄰照片的同一尺寸。**燈箱版面分三組 media（條件互不重疊），關閉鈕與「1 / 10」計數一律不壓到照片**：桌機／平板（寬 ≥769 且高 ≥600）照片上下各留 80px；手機直拿上下各留 56px、關閉鈕與計數貼近上下邊緣；手機橫拿或矮視窗照片高度用滿、左右各留 88px，關閉鈕與計數移到右上／右下角。燈箱高度用 `100dvh`（手機瀏覽器工具列展開時不會有一截藏在後面）。改這幾組數字只要改 CSS，JS 會自動讀。新增／換照片用 `python tools/room-photo.py`（見 `tools/README.md`），換照片一定換新檔名（/images 一年快取）。JSON-LD 的 `image` 仍指 1008 版。
- **頁尾**：8 頁都有「Explore」網站導覽（8 個頁面連結）。新增頁面時 8 個 footer 與全螢幕選單都要加。
- **全螢幕選單**（2026-11 修正，8 頁各一份、內容相同，**改要 8 頁同步**）：選單從導覽列下方開始排——開選單時 JS（`setMenu`／`setMenuTop`）把導覽列實際高度寫進 `--menu-top`；字級、間距、訂房鈕都照 `--menu-fit`（＝可用高度扣掉導覽列、下方留白與固定部分 142px）等比例縮放，所以桌機大螢幕看起來跟以前一樣、矮螢幕自動縮小（最小 1.15rem，觸控區 ≥44px）；真的放不下才捲動（`.menu-links { margin: auto 0 }` 置中，放不下時從頂端開始）。手機橫拿或高 ≤500px 改兩欄。開著時 `html.menu-open` 鎖住背後頁面（`scrollbar-gutter: stable` 讓導覽列不跳動）；Esc 可關閉；高度用 `100dvh`。以前的問題：首頁項目擠在導覽列那排點不到、手機橫拿「首頁／立即訂房」跑出畫面、開選單時背後頁面會被捲走。
- **轉換追蹤（GA4）**：每頁在 GA 設定 `<script>` 後面有一段點擊追蹤，訂房（owlting）、LINE、電話連結被點時送 `booking_click`／`line_click`／`phone_click`，參數 `link_location`（nav、menu、mobile_bar、room_card、whole_villa、footer 或所在 section）、`room`（房型卡片的房號）、`link_text`。新頁面要一起複製；按鈕位置靠 DOM 結構自動判斷，不用在連結上加屬性。
- **LINE 直訂優惠**：手機浮動按鈕「LINE 直訂優惠」、房型頁每個預訂按鈕下方、首頁名句區、FAQ、llms.txt 都只寫「享專屬優惠」，**不寫優惠內容**（Ricky 依日期與房況調整）。
- **Google 評價數**：頁面與 llms.txt 只寫約略數字（例如「200 則以上」），每年 12 月更新潮汐資料時順便檢查（見 `tools/README.md`）。結構化資料不放評分（自家評論不具星等資格）。
- **首頁 hero 標題**：桌機 `.hero-title { margin-left: calc(-1 * var(--spacing-xl) - 0.4em) }`，先抵掉 `.hero-content` 的左內距，再固定往照片壓 0.4 個字寬（1024～2560 寬都壓進 27～51px）。改 hero 左內距或標題字級時一起看；以前寫 `-20%`，1366 寬會離照片 16px、1536 寬剛好貼邊，看起來像排歪。
- **小標斷行**：中文詞組用 `.nowrap` 包起來（首頁、介紹頁、摩西頁都有這個 class）。中英或兩段並列的小標，分隔符號包在 `.hero-sep`，窄於 520px 時隱藏、後半段改成獨立一行（首頁「澎湖精品住宿｜Penghu Boutique Hotel」、摩西頁「奎壁山・赤嶼｜退潮限定的海中步道」），避免「|」掉在行尾。首頁 hero 在桌機版右欄也可能放不下一行（約 993～1110 寬，例如 iPad 橫拿 1024），所以另用 container query：`.hero-content` 設 `container-type: inline-size`，右欄內容寬窄於 440px（小標一行約需 412px）時一樣拿掉「|」；改小標字級、字距或 hero 內距時，這個門檻要重新量。介紹頁副標在 359px 以下的小手機把字距縮成 0.2em，否則會拆成「電／梯」。
- **位置頁地圖**（2026-11 重畫）：「期遇在哪裡？」是 inline SVG 澎湖地圖（深藍海面＋沙色陸地＋淡淡的海圖等深線，配色字體與官網一致），標期遇、馬公市區・碼頭 9 分、澎湖機場 12 分、奎壁山摩西分海 18 分，下面接「Google 地圖導航」按鈕（`maps/dir/?api=1&destination=…&destination_place_id=ChIJp82ruCFbbDQRm-ZmRMmpVyE`）。SVG 由 `tools/make-location-map.py` 依內政部村里界產生、寫在 `location.html` 的 `MAP:BEGIN／END` 之間（**勿手改**），樣式在 `MAP-CSS:BEGIN／END`；步驟見 `tools/README.md`。文字是真的文字（用網站字體、搜尋引擎讀得到），海面上的字用底色描邊（`paint-order: stroke`），手機另外放大字級。原本的插畫地圖 `penghu-map.webp` Ricky 覺得不好看，已刪除。**不要再嵌入 Google 地圖**：嵌入的地圖會在期遇旁邊標出其他民宿（含名稱有「海景」的），桌機濾鏡也會讓期遇的圖釘變灰。
  - **2026-11-03 核對過真實地圖**：碼頭（南海遊客中心）、機場（航廈）、奎壁山摩西分海三個點都用 Google 地圖上的座標；海岸線疊 Google 地圖大致吻合，**只有北寮東岸（湖西風車一帶）Google 多畫了 300～500 公尺陸地**——國土測繪中心的通用電子地圖與航照都跟村里界一致（斜直的沙灘，外面是淺海礁岩），Google 應是把潮間帶也畫成陸地，**不要照 Google 改**；OpenStreetMap 這一段也跟村里界一樣，換資料來源沒用。
  - 鄉市名「馬公」標在市區碼頭東南邊（2026-11-04 Ricky：標在南邊的澎南半島會讓人誤會馬公在那裡），不要移回南邊。
  - 地圖下方本來有一行資料來源顯名（政府資料開放授權條款要求標示「內政部國土測繪中心」），2026-11-04 Ricky 要求拿掉，**不要自行加回**。
- **刻意保留但未引用的檔案**：`images/logo/kiwi-villa-logo.png`（品牌主 Logo，外部可能引用）。

## 萬泰名產代訂頁（/wantai）

住客掃房內 QR 桌卡（或收到 LINE 連結）打開，勾選萬泰食品的名產數量、填姓名電話與取貨方式，頁面產生訂單圖片＋文字，用 LINE 傳到官方帳號，Ricky 再轉給萬泰。

- **取貨方式**：機場取貨／碼頭取貨（必填班次日期與時間，班次號碼選填）或宅配到府（必填地址；運費待定，依訂購量由 Ricky 告知）。沒有「送到民宿」，也不顯示萬泰的免運門檻。
- **住客優惠**：`CONFIG.discountRate`（90＝9 折）。冷凍類不打折（標記 `box12` 的品項也不打折，目前沒有）；品項列照原價，確認頁、訂單圖片與文字最後列「原價合計／住客優惠／折後合計」。
- **不列酒類**：菸酒管理法第 30 條第 1 項不准用郵購、電子購物或其他無法辨識購買者年齡的方式賣酒（第 55 條罰 1–5 萬、按次處罰），這頁沒有年齡確認又能宅配，所以 2026-11 拿掉仙人掌氣泡酒、海鹽冰花氣泡酒（RAW、PMAP、CATALOG、照片一起刪）。價目表以後出現酒類也不要加進來；住客想買可以當面處理。
- **商品照片與介紹**：點有縮圖的品項會開底部視窗（萬泰官網的照片、標語、簡介、規格），同系列口味在視窗裡直接選數量；手機返回鍵只會關視窗。`PMAP` 是「價目表品名 → 萬泰官網商品 handle」（必須維持標準 JSON），`CATALOG` 由 `tools/update-wantai-catalog.py` 產生、勿手改；照片在 `images/wantai/<商品id>-<照片id>.webp` 與 `-t.webp`（縮圖），檔名含照片 id，換照片就換檔名。官網沒有的品項不列進 PMAP（目前 23 項），列表顯示單位字樣的色塊。澎湖茶→風茹茶、鱈魚絲→鱈魚夾心絲是推定對應。
- **純前端**：住客填的資料只存在他自己瀏覽器的 localStorage（`wantai-order-v1`），不上傳；訂單圖片用 canvas 在手機上畫。
- **工具頁，不是內容頁**：`noindex`、不放 sitemap、不加進 8 頁的 footer／全螢幕選單，也沒有手機浮動 CTA（底部是訂單合計列）。視覺沿用官網 token 與字體（米底、霞鶩文楷、Inter／Noto Sans TC）。
- **改價**：價目表在頁尾腳本的 `RAW`（每行「品名|單位|單價|標記」，chill＝須冷藏、box12＝一箱12瓶且不打折）。改完同步更新 `CONFIG.priceListVersion` 與頁尾的價目表日期。新增的品項若萬泰官網也有，記得在 `PMAP` 加對應再跑更新工具。
- **LINE**：`CONFIG.lineOaId = '@kiwivilla'`（與官網連的 page.line.me/ucz4004x 為同一帳號），按鈕用 `line.me/R/oaMessage/` 開聊天室並帶入訂單文字。
- **GA4**：不套用其他頁的 `line_click` 等點擊追蹤（名產訂單不是訂房詢問），改送 `souvenir_view_item`（item_name＝看了哪個商品的介紹）、`souvenir_order`（value＝折後合計、discount、item_count、delivery＝air／port／ship）與 `souvenir_send`（method＝line／copy）。
- QR 桌卡指向 `https://www.kiwi-villa.com/wantai`，改網址就要重印。

## 常用命令

```bash
# 本地預覽（專案根目錄）
python -m http.server 8000 --directory public
# 或透過 .claude/launch.json 的 "static" 設定啟動預覽
```

```bash
# 提交前完整性驗證：每頁結尾須為 </body></html>，每段 JSON-LD 須可解析，<img> 的 src／srcset 圖檔都要存在
python tools/verify_site_integrity.py
```

無 package.json / 無建置；改 HTML 後直接 commit 即可。

## 維護注意事項

- 修改全站共用區塊（nav/footer/配色/字體）時，記得 7-8 個 HTML 都要同步改（無單一來源）。
- 改 JSON-LD 後務必驗證仍為合法 JSON，**並確認每頁結尾完整 `</body></html>`**（見「🚨 檔案截斷陷阱」與「常用命令」的驗證指令）。
- 刪圖片前先全站 grep「子目錄/檔名」確認零引用。
- 商家資訊（電話、地址、座標、評分）目前散落多頁，更新時注意一致性。geo 座標統一為 `23.5868758, 119.5818157`（Google 商家官方 Pin，place CID 0x2157a9c94466e69b）。奎壁山摩西分海是 `23.5979, 119.6726`（摩西頁 TouristAttraction／Dataset 的 JSON-LD 與 `tools/update-tide-data.py` 算日出日落的 `LAT, LON`；2026-11-03 以前經度誤植成 119.622，差約 5 公里）。
- **提交前別只信 `git status`**：本地曾遇 git 狀態輸出前後不一致，關鍵時用檔案內容（`wc -l`／`tail`／`grep`）交叉驗證實際結果。
- **推送前先看 `git status` / `git log`**：本機 `main` 可能已 ahead of `origin/main` 數個 commit，`git push` 會把那些既有 commit 一起推上線 → 確認都是要發布的再推。
- 部署：把工作分支合回 `main`，Cloudflare Pages 自動建置。動過結構化資料的話，部署後回 Search Console 對應報告點「驗證修正」。

## 已知技術債（待處理，非阻斷）

- 各頁內聯 CSS/JS 重複、`:root` token 分岔（治本需抽共用檔＋統一 token，會有視覺變化，需逐頁審）。
- CSP 的 `unsafe-eval` 待部署後實測 Elfsight 是否真的需要，再決定能否移除。

---

*最後更新：2026-11-04（位置頁地圖拿掉下方資料來源小字、「馬公」改標在市區旁）；2026-11-03 深夜（摩西頁奎壁山座標更正、2026 潮汐資料日出時間重算；位置頁地圖三個點改用 Google 地圖座標、海岸線核對、加資料來源顯名、鄉市名微調不壓海）；2026-11-03 晚上（位置頁地圖改成自家繪製的 inline SVG，`tools/make-location-map.py`）；2026-11-03 傍晚（首頁小標在桌機窄寬度也不讓「|」掉在行尾；介紹頁副標小手機不拆「電梯」；FAQ 早餐改「請留意方案說明」）；2026-11-03 下午（萬泰頁拿掉氣泡酒；FAQ 早餐依方案；位置頁改插畫地圖＋導航鈕；首頁標題固定壓進照片；手機小標斷行；萬泰頁載入不跳；評價數「200 則以上」）；2026-11（全螢幕選單修正：導覽列下方排版、手機橫拿兩欄、鎖背後頁面、Esc；首頁特色區塊手機橫拿不再超出寬度；房型燈箱關閉鈕／計數不壓照片；房型照 1008／1600／2400 三種寬度＋srcset、燈箱讀大圖、`tools/room-photo.py`、完整性驗證加查圖檔存在；萬泰名產代訂頁 /wantai：商品照片與介紹、機場／碼頭取貨、住客 9 折）；2026-10（404 改版、刪除未引用檔案、快取標頭規則、中文不斜體、房型頁輪播與英文房名、頁尾網站導覽）*
