// Node.js 腳本：批量更新圖片為延遲載入
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'rooms.html');

// 讀取文件
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    
    let content = data;
    let updateCount = 0;
    
    // 找到所有的房間卡片
    const roomCardPattern = /<div class="room-card[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g;
    
    content = content.replace(roomCardPattern, (match) => {
        let roomContent = match;
        let imageCount = 0;
        
        // 更新圖片標籤
        roomContent = roomContent.replace(/<div class="gallery-item"[^>]*>([\s\S]*?)<\/div>/g, (galleryMatch) => {
            imageCount++;
            
            // 第一張圖片使用 eager loading（已經在前面更新）
            if (imageCount === 1) {
                return galleryMatch;
            }
            
            // 其他圖片改為延遲載入
            let updatedGallery = galleryMatch;
            
            // 更新 source 標籤
            updatedGallery = updatedGallery.replace(
                /<source srcset="([^"]+)"/g,
                '<source data-srcset="$1"'
            );
            
            // 更新 img 標籤
            updatedGallery = updatedGallery.replace(
                /<img src="([^"]+)"([^>]*?)>/g,
                (imgMatch, src, attrs) => {
                    // 檢查是否已經有 class 屬性
                    if (attrs.includes('class=')) {
                        // 添加 lazyload 到現有 class
                        return imgMatch.replace(/class="([^"]*)"/, 'class="$1 lazyload"')
                                      .replace(/src="/, 'data-src="');
                    } else {
                        // 添加新的 class 屬性
                        return `<img data-src="${src}"${attrs} class="lazyload">`;
                    }
                }
            );
            
            updateCount++;
            return updatedGallery;
        });
        
        return roomContent;
    });
    
    // 寫回文件
    fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log(`Successfully updated ${updateCount} images to lazy loading.`);
    });
});