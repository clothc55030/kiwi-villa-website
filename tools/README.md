# 摩西分海資料更新工具（每年一次）

於次年官方表公布後（約 12 月）重跑：

1. 抓取澎管處 12 個月表（`https://www.penghu-nsa.gov.tw/Services/Tidenew/1{年}{月}tide.htm`），
   將各月表格文字存為 `tide-raw/11601.md` ... 後執行 `parse-penghu-nsa.py` 產出 raw JSON。
2. 修改 `generate-tide-json.py` 內的年份與檔案路徑，執行後產出 `tide-2027.json`。
3. 放到 `assets/`，並更新 `moses.html` 中的 fetch 路徑與 ?v= 版本號（穿透 CDN 快取）、date input 的 min/max、
   頁尾「資料更新」日期與 sitemap lastmod。

參數（建議抵達提前量、回程死線、合海偏移、日出日落表）都在 generate-tide-json.py 頂部，
可依現場觀察直接調整後重新產出。
