// 實施懶載入的輔助腳本
const fs = require('fs');
const path = require('path');

// 需要排除的圖片（關鍵圖片不應懶載入）
const excludePatterns = [
    'logo',
    'favicon',
    'hero-',  // Hero 區域圖片
    'og-image'  // Open Graph 圖片
];

// 檢查是否應該排除
function shouldExclude(imgStr) {
    return excludePatterns.some(pattern => imgStr.toLowerCase().includes(pattern));
}

// 轉換 img 標籤為懶載入格式
function convertImgToLazy(html) {
    // 匹配 img 標籤
    const imgRegex = /<img([^>]*)>/g;
    
    return html.replace(imgRegex, (match, attributes) => {
        // 檢查是否應該排除
        if (shouldExclude(match)) {
            return match;
        }
        
        // 檢查是否已經是懶載入格式
        if (attributes.includes('data-src') || attributes.includes('loading=')) {
            return match;
        }
        
        // 提取 src 屬性
        const srcMatch = attributes.match(/src="([^"]*)"/);
        if (!srcMatch) return match;
        
        const src = srcMatch[1];
        
        // 轉換為懶載入格式
        let newAttributes = attributes
            .replace(/src="[^"]*"/, `data-src="${src}"`)
            + ' loading="lazy"';
        
        // 添加佔位符
        const placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3Crect width="1" height="1" fill="%23f0f0f0"/%3E%3C/svg%3E';
        newAttributes = `src="${placeholder}" ` + newAttributes;
        
        return `<img${newAttributes}>`;
    });
}

// 轉換 picture 元素中的 source 標籤
function convertPictureToLazy(html) {
    // 匹配 picture 元素
    const pictureRegex = /<picture[^>]*>([\s\S]*?)<\/picture>/g;
    
    return html.replace(pictureRegex, (match, content) => {
        // 檢查是否應該排除
        if (shouldExclude(match)) {
            return match;
        }
        
        // 轉換 source 標籤
        let newContent = content.replace(/<source([^>]*)>/g, (sourceMatch, sourceAttrs) => {
            if (sourceAttrs.includes('data-srcset')) {
                return sourceMatch;
            }
            
            const srcsetMatch = sourceAttrs.match(/srcset="([^"]*)"/);
            if (!srcsetMatch) return sourceMatch;
            
            const newAttrs = sourceAttrs.replace(/srcset="[^"]*"/, `data-srcset="${srcsetMatch[1]}"`);
            return `<source${newAttrs}>`;
        });
        
        // 轉換 img 標籤
        newContent = convertImgToLazy(newContent);
        
        return `<picture>${newContent}</picture>`;
    });
}

// 處理單個 HTML 檔案
function processHTMLFile(filePath) {
    console.log(`處理: ${filePath}`);
    
    let html = fs.readFileSync(filePath, 'utf8');
    const originalLength = html.length;
    
    // 轉換圖片為懶載入
    html = convertImgToLazy(html);
    html = convertPictureToLazy(html);
    
    // 確保已引入懶載入腳本
    if (!html.includes('lazy-loading.js') && !html.includes('lazy-load.js')) {
        // 在 </body> 前插入懶載入腳本
        const lazyScript = `
    <!-- 懶載入功能 -->
    <script type="module">
        import { initLazyLoading } from './js/modules/lazy-loading.js';
        document.addEventListener('DOMContentLoaded', initLazyLoading);
    </script>`;
        
        html = html.replace('</body>', lazyScript + '\n</body>');
    }
    
    // 寫回檔案
    fs.writeFileSync(filePath, html);
    
    console.log(`  原始大小: ${originalLength} bytes`);
    console.log(`  更新後大小: ${html.length} bytes`);
}

// 處理所有 HTML 檔案
function processAllHTMLFiles() {
    const htmlFiles = fs.readdirSync('.')
        .filter(file => file.endsWith('.html') && !file.includes('test'));
    
    console.log(`找到 ${htmlFiles.length} 個 HTML 檔案`);
    
    htmlFiles.forEach(file => {
        processHTMLFile(file);
    });
    
    console.log('\n懶載入實施完成！');
}

// 執行
processAllHTMLFiles();