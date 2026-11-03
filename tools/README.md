# 摩西分海資料年度更新（一年做一次）

## 什麼時候做
澎管處通常於**前一年 12 月左右**公布次年全年潮汐表。
公布後（例如 2026 年 12 月更新 2027 年資料）執行一次即可。

## 怎麼做
1. 雙擊 `更新潮汐資料.bat`（直接按 Enter 就是更新明年）。
2. 腳本自動完成：抓官方 12 個月表 → 解析驗證 → 計算建議抵達／回程／合海／
   日出場／潮差分級／精選場次 → 產出 `assets/tide-{年}.json` → 自動改好：
   - `moses.html`：標題、描述、社群分享文字、Dataset 結構化資料、精選場次清單
     （完美日出場、週末大潮場）、資料檔版本表、資料來源年份
   - `llms.txt` 的摩西分海年份、`sitemap.xml` 的更新日期
3. 改完會自我檢查：頁面上若還殘留舊年份、結構化資料壞掉或檔案被截斷，
   **不會寫入**並列出是哪幾行——把訊息貼給 Claude 即可。
4. 本地預覽確認（`python -m http.server 8000 --directory public`），git commit 併回 main 部署。
5. **順便更新 Google 評價數**（腳本不會改）：`reviews.html`「住客怎麼說」下方那行與
   `llms.txt` 的「Google 評價」都寫約略數字（例如「200 則以上」「250 則以上」），
   對照評價頁 Google 小工具顯示的即時數字，需要時調整一次即可；評分若不再是 5.0 也要一起改。

> 精選場次不用再手動挑：規則寫在 `update-tide-data.py` 的 `mark_highlights()`，
> 靜態清單（給搜尋引擎與 AI 讀）和頁面上的 JS（只顯示今天以後的場次）用的是同一份標記。

## 跨年過渡
- 頁面會同時載入「今年＋已公布的明年」資料，所以 12 月更新後到跨年前，
  今年剩下的日期一樣查得到，精選場次也會接著列出明年的場次。
- **去年的 `assets/tide-*.json` 請先保留**（版本表會留去年＋今年，更舊的會自動移除）。

## 只重建頁面、不重抓資料
```
python update-tide-data.py 2027 --from-json
```
用現有的 `assets/tide-2027.json` 重新產生精選場次與頁面文字（例如調整了精選規則之後）。

## 可靠性
- 腳本內建強驗證（天數、星期逐日核對、時刻格式）；官方若改版式會**明確報錯**
  而不是產出錯資料，把錯誤訊息貼給 Claude 即可。
- 若該年 JSON 已存在會先比對再詢問是否覆蓋——拿 2026 跑一次就是端到端
  自我測試（應顯示「黃金測試 PASS」）。

## 參數調整
建議抵達提前量（大/中/小潮 40/30/20 分）、回程死線（30 分）等常數
都在 `update-tide-data.py` 頂部，依現場經驗修改後重跑即可。

## 其他
- 即時影像：moses.html 內嵌澎管處 YouTube 直播（ID: zgPJbQzlQmw），
  若官方更換直播網址，搜尋此 ID 全部替換即可。

---

# 萬泰名產代訂頁：更新商品照片與介紹

萬泰官網換照片、改介紹，或價目表新增了官網也有的商品時執行（價格不受影響，價格只看頁面裡的價目表 `RAW`）。

1. 新增品項時，先在 `public/wantai.html` 的 `PMAP` 加一行 `"價目表品名": "萬泰商品網址最後一段"`，
   例如 `https://www.9279149.com.tw/products/干貝醬` → `"干貝醬（大辣）": "干貝醬"`（維持標準 JSON，最後一項不加逗號）。
2. 在專案根目錄執行 `python tools/update-wantai-catalog.py`（需要 Pillow：`pip install pillow`）。
3. 腳本逐一抓萬泰商品資料（每次間隔約 1 秒），照片轉成 WebP 放到 `public/images/wantai/`，改寫 wantai.html 的 CATALOG 區塊，
   並刪掉不再用到的舊照片。任何一個商品抓失敗就整批不寫入，把訊息貼給 Claude 即可。
4. 本地預覽確認（`python -m http.server 8000 --directory public`），git commit 併回 main 部署。


---

# 房型頁：新增或更換房型照片

房型頁每張照片有三種寬度（1008／1600／2400），瀏覽器依螢幕自己挑：舊筆電用 1008，手機和一般桌機多半用 1600，MacBook、iPad 這類 2x 螢幕用 2400。

1. 從 `Desktop\民宿照片\<房號>\<房號>精选` 挑原檔。
2. 在專案根目錄執行（需要 Pillow：`pip install pillow`）：
   ```
   python tools/room-photo.py "<原檔路徑>" <房型資料夾> <新檔名>
   ```
   房型資料夾：`luxuryFamily`（201）、`premiumQuad`（203）、`deluxeQuad`（205）、`premiumTwin`（301／302）、
   `premiumTriple`（303）、`premiumDouble`（305／306／307）。
   新檔名沿用 `penghu-kiwi-villa-<房型>-room<編號>`，編號接在該房型現有最後一號後面。
3. 把腳本印出的 `<img>` 貼進 `public/rooms.html` 該房型的 `<div class="room-slider">` 裡，alt 照實描述照片內容。
4. 跑 `python tools/verify_site_integrity.py`（會檢查三種寬度的檔案都在），本地預覽確認後 git commit 併回 main 部署。

- **換照片要換新檔名**：`/images/*` 在瀏覽器快取一年，同一個檔名換內容，回訪的人會一直看到舊圖。腳本遇到已存在的檔名會直接停下。
- 腳本只縮圖，不裁切、不調色；手機拍的 Display P3 照片會先轉成 sRGB。


---

# 位置頁：澎湖地圖（/location「期遇在哪裡？」）

地圖是 `public/location.html` 裡的一段 inline SVG（`<!-- MAP:BEGIN -->` 到 `<!-- MAP:END -->`），由 `tools/make-location-map.py` 產生，**不要手改那一段**。海岸線來自內政部 1:1 萬村里界（npm 套件 taiwan-atlas 2021.9.20 重新發布的 TopoJSON，腳本第一次跑會自動下載）。

1. 在專案根目錄執行（需要 shapely：`pip install shapely`）：
   ```
   python tools/make-location-map.py
   ```
   想先看效果不改網頁：`python tools/make-location-map.py --preview map.html`，用瀏覽器開 map.html。
2. 要改標示點、文字或車程：改腳本上方的 `KIWI`、`POIS`、`TOWN_LABELS`（點用經緯度，文字位置用 SVG 單位的位移；地圖寬 1000 單位，1 單位約 25 公尺）。
3. 要改顏色、字級：改 `location.html` 的 `.pm-*` 樣式（`MAP-CSS:BEGIN`／`MAP-CSS:END` 之間）。SVG 裡的 px 是地圖單位，會跟著地圖縮放，所以手機（600px 以下）另外放大字級。
4. 改完一定要在手機（360～430 寬）和桌機各看一次：海面上的地名、時間不能壓到陸地，鄉市名要在陸地上；西嶼太窄放不下字，所以標在島西側的海面。
5. 跑 `python tools/verify_site_integrity.py`，本地預覽確認後 git commit 併回 main 部署。
