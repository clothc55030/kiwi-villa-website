# 組件系統使用說明

## 概述
為了避免重複代碼和確保全站一致性，我們建立了組件系統來管理共用的HTML區塊。

## 已實現的組件

### 1. ContactInfoComponent (聯絡資訊組件)
- **功能**: 統一管理所有頁面的聯絡資訊
- **包含內容**: 
  - 聯絡方式 (Line, WeChat, 電話, Email)
  - 地址資訊 (中英文)
  - 社交媒體連結 (Instagram, Facebook, LINE)

### 2. FooterComponent (頁腳組件)
- **功能**: 統一管理所有頁面的頁腳
- **包含內容**: 版權聲明

## 如何使用

### 自動載入 (推薦)
組件會在頁面載入時自動檢測並替換現有的聯絡資訊區塊：

```html
<!-- 在HTML中引入組件文件 -->
<script src="scripts/components.js"></script>
```

### 手動載入
如果需要手動控制組件載入：

```javascript
// 創建聯絡資訊組件
const contactInfo = new ContactInfoComponent();

// 渲染到指定容器
contactInfo.render('my-container-id');

// 或自動渲染到頁面
contactInfo.autoRender();
```

## 如何修改聯絡資訊

只需要修改 `scripts/components.js` 中的 `contactData` 物件：

```javascript
this.contactData = {
    contact: {
        line: '@kiwivilla',
        wechat: 'rickywang4159',
        phone: '0933636373',
        email: 'info@kiwi-villa.com'
    },
    address: {
        chinese: '台灣澎湖縣馬公市西衛里 346-347號',
        english: 'NO.346-347, Xiwei Village, Magong City, Penghu County, Taiwan'
    },
    social: {
        instagram: 'https://www.instagram.com/kiwi_villa/',
        facebook: 'https://www.facebook.com/kiwivilla.home/',
        line: 'https://page.line.me/ucz4004x'
    }
};
```

## 優勢

1. **一致性**: 所有頁面自動使用相同的聯絡資訊
2. **易維護**: 只需修改一個文件即可更新全站
3. **減少錯誤**: 避免手動更新每個頁面時遺漏或錯誤
4. **擴展性**: 可以輕鬆添加更多組件

## 已更新的頁面

- ✅ index.html (首頁)
- ✅ about.html (細說期遇)
- ✅ location.html (地理資訊)
- ✅ rooms.html (房型設施)
- ✅ qa.html (常見問題)
- ✅ notice.html (訂房須知)

## 注意事項

1. 確保所有頁面都有引入 `scripts/components.js`
2. 如果新增頁面，記得引入組件文件
3. 修改聯絡資訊時，只需修改 `components.js` 中的資料即可
4. 組件會自動替換現有的 `.contact-info` 區塊 