# 導航欄組件使用指南

## 概述
導航欄已經組件化，現在所有頁面都可以使用統一的導航欄組件，無需在每個頁面重複寫導航欄代碼。

## 組件特色
- 🔄 **自動檢測當前頁面**：自動為當前頁面的導航項目添加 `active` 狀態
- 🎨 **統一樣式**：所有頁面使用相同的導航欄樣式（glass-navbar + glass-nav-link）
- 🛠️ **集中管理**：只需要在 `scripts/components.js` 中修改一次，所有頁面都會同步更新
- 📱 **響應式支援**：包含漢堡選單功能

## 使用方法

### 1. 在HTML頁面中添加佔位符
將原本的完整導航欄代碼替換為以下簡單佔位符：

```html
<!-- 舊的方式（不要再使用）-->
<header class="header">
    <nav class="navbar glass-navbar">
        <!-- 大量重複的導航欄代碼... -->
    </nav>
</header>

<!-- 新的方式（推薦）-->
<header class="header" id="navigation-placeholder"></header>
```

### 2. 確保引入必要的腳本
在頁面底部確保包含以下腳本：

```html
<script src="scripts/main.js"></script>
<script src="scripts/components.js"></script>
```

### 3. 自動初始化
組件會自動檢測當前頁面並生成對應的導航欄，無需額外的JavaScript代碼。

## 頁面配置

導航欄組件會自動檢測以下頁面並設置對應的 active 狀態：

| 檔案名稱 | 檢測鍵值 | 顯示文字 |
|---------|---------|---------|
| index.html | index | 首頁 |
| about.html | about | 細說期遇 |
| location.html | location | 地理資訊 |
| rooms.html | rooms | 房型設施 |
| testimonials.html | testimonials | 客戶評價 |
| qa.html | qa | 常見問題 |
| notice.html | notice | 訂房須知 |

## 自訂配置

如果需要修改導航欄的內容，只需要編輯 `scripts/components.js` 檔案中的 `NavigationComponent` 類別：

```javascript
this.navigationData = {
    logo: 'images/logo/kiwi-villa-logo.png',
    logoAlt: '期遇度假會館logo',
    menuItems: [
        { href: 'index.html', text: '首頁', key: 'index' },
        // ... 其他選項
    ],
    bookingUrl: 'https://booking.owlting.com/kiwi-villa'
};
```

## 遷移現有頁面

### 步驟1：備份現有頁面
建議先備份現有的HTML檔案。

### 步驟2：替換導航欄代碼
在每個頁面中找到 `<header class="header">` 區塊，將整個導航欄替換為：

```html
<header class="header" id="navigation-placeholder"></header>
```

### 步驟3：測試
在瀏覽器中打開頁面，確認：
- 導航欄正確顯示
- 當前頁面的導航項目有 active 狀態
- 所有連結都能正常運作
- 手機版漢堡選單功能正常

## 故障排除

### 導航欄沒有顯示
- 檢查是否正確引入 `scripts/components.js`
- 確認 `<header>` 元素存在於頁面中
- 查看瀏覽器控制台是否有錯誤訊息

### Active 狀態不正確
- 檢查檔案名稱是否與 `navigationData.menuItems` 中的 `key` 值對應
- 確認頁面URL路徑正確

### 樣式問題
- 確認已引入 `styles/glassmorphism-ocean.css`
- 檢查CSS載入順序

## 範例

已完成遷移的頁面：
- ✅ `index.html` - 首頁
- ✅ `about.html` - 細說期遇
- ✅ `location.html` - 地理資訊
- ✅ `rooms.html` - 房型設施
- ✅ `testimonials.html` - 客戶評價
- ✅ `qa.html` - 常見問題
- ✅ `notice.html` - 訂房須知
- ✅ `404.html` - 錯誤頁面

**所有頁面都已完成遷移！**

## 優勢

1. **維護簡單**：修改導航欄只需要編輯一個檔案
2. **一致性**：所有頁面的導航欄保持完全一致
3. **程式碼簡潔**：減少重複代碼
4. **易於擴展**：新增頁面或修改導航項目都很容易
5. **自動化**：Active 狀態自動處理，不會出現遺漏

使用這個組件化的導航欄，可以大幅提升開發效率和維護便利性！ 