# Content Security Policy (CSP) 配置指南

## 目前的 CSP 設定

`_headers` 檔案中已配置了完整的 CSP 政策，允許以下資源：

### 允許的腳本來源 (script-src)
- `'self'` - 同源腳本
- `'unsafe-inline'` - 內聯腳本（某些功能需要）
- `'unsafe-eval'` - eval() 函數（某些第三方庫需要）
- `https://cdn.jsdelivr.net` - CDN 資源
- `https://unpkg.com` - NPM CDN
- `https://www.googletagmanager.com` - Google Tag Manager
- `https://www.google-analytics.com` - Google Analytics
- `https://static.cloudflareinsights.com` - Cloudflare 分析
- `https://static.elfsight.com` - Elfsight 平台
- `https://*.elfsightcdn.com` - Elfsight CDN

### 允許的樣式來源 (style-src)
- `'self'` - 同源樣式
- `'unsafe-inline'` - 內聯樣式
- `https://fonts.googleapis.com` - Google Fonts
- `https://cdn.jsdelivr.net` - CDN 資源
- `https://unpkg.com` - NPM CDN
- `https://cdnjs.cloudflare.com` - Cloudflare CDN
- `https://static.elfsight.com` - Elfsight 樣式
- `https://*.elfsightcdn.com` - Elfsight CDN

### 允許的字體來源 (font-src)
- `'self'` - 同源字體
- `https://fonts.gstatic.com` - Google Fonts
- `https://cdnjs.cloudflare.com` - Font Awesome
- `https://*.elfsightcdn.com` - Elfsight 字體

### 允許的圖片來源 (img-src)
- `'self'` - 同源圖片
- `data:` - Data URI
- `https:` - 所有 HTTPS 圖片
- `blob:` - Blob URLs

### 允許的連線來源 (connect-src)
- `'self'` - 同源連線
- `https://www.google-analytics.com` - GA 追蹤
- `https://www.googletagmanager.com` - GTM
- `https://cloudflareinsights.com` - CF 分析
- `https://*.elfsight.com` - Elfsight API
- `https://*.elfsightcdn.com` - Elfsight CDN

### 允許的框架來源 (frame-src)
- `'self'` - 同源框架
- `https://www.google.com` - Google 服務
- `https://maps.google.com` - Google Maps
- `https://www.google.com/maps/` - Google Maps embed
- `https://*.elfsight.com` - Elfsight widgets
- `https://*.elfsightcdn.com` - Elfsight CDN

## 如何添加新的外部資源

如果需要添加新的外部服務，請按照以下步驟：

1. 確定資源類型（腳本、樣式、字體等）
2. 在相應的 CSP 指令中添加域名
3. 測試確保沒有阻擋錯誤

### 範例：添加新的 CDN

```
script-src ... https://new-cdn.example.com;
```

## 安全建議

1. **最小權限原則**：只允許必要的資源
2. **避免使用 'unsafe-inline'**：如果可能，使用 nonce 或 hash
3. **定期審查**：檢查並移除不再使用的資源
4. **監控違規**：考慮添加 report-uri 來追蹤 CSP 違規

## 測試 CSP

1. 開啟瀏覽器開發者工具
2. 檢查 Console 是否有 CSP 違規錯誤
3. 確認所有功能正常運作

## 常見問題

### Q: 為什麼需要 'unsafe-inline'？
A: 某些第三方服務（如 Google Analytics）需要內聯腳本。未來可考慮使用 nonce。

### Q: 如何更嚴格的 CSP？
A: 可以逐步移除 'unsafe-inline' 和 'unsafe-eval'，但需要確保所有功能相容。

### Q: CSP 影響效能嗎？
A: CSP 主要是安全功能，對效能影響極小。