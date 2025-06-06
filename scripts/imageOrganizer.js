// 圖片整理工具
const imageOrganizer = {
    // 現有圖片文件映射
    imageMapping: {
        // 豪華家庭房
        'luxury-family-room.jpg': 'luxuryFamily',
        // 可以根據實際文件名稱繼續添加映射
        '304A0169.jpg': 'luxuryFamily', // 示例，需要根據實際圖片內容確定
        '304A0140.jpg': 'premiumQuad',
        '304A0195.jpg': 'deluxeQuad',
        '304A0142.jpg': 'premiumTriple',
        '304A0209.jpg': 'premiumTwin',
        '304A0135.jpg': 'premiumDouble',
        '304A0202.jpg': 'luxuryFamily',
        '304A0177.jpg': 'premiumQuad',
        '304A0200.jpg': 'deluxeQuad'
    },
    
    // 生成移動命令
    generateMoveCommands() {
        const commands = [];
        
        Object.entries(this.imageMapping).forEach(([fileName, roomType]) => {
            const sourcePath = `images/rooms/${fileName}`;
            const targetPath = `images/rooms/${roomType}/${fileName}`;
            
            // Windows PowerShell 命令
            commands.push(`Move-Item "${sourcePath}" "${targetPath}"`);
        });
        
        return commands;
    },
    
    // 生成複製命令（保留原檔案）
    generateCopyCommands() {
        const commands = [];
        
        Object.entries(this.imageMapping).forEach(([fileName, roomType]) => {
            const sourcePath = `images/rooms/${fileName}`;
            const targetPath = `images/rooms/${roomType}/${fileName}`;
            
            // Windows PowerShell 命令
            commands.push(`Copy-Item "${sourcePath}" "${targetPath}"`);
        });
        
        return commands;
    },
    
    // 輸出命令到控制台
    printCommands() {
        console.log('=== 移動圖片命令 ===');
        this.generateMoveCommands().forEach(cmd => console.log(cmd));
        
        console.log('\n=== 複製圖片命令 ===');
        this.generateCopyCommands().forEach(cmd => console.log(cmd));
    },
    
    // 檢查圖片是否存在的函數
    async checkImageExists(imagePath) {
        try {
            const response = await fetch(imagePath, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            return false;
        }
    },
    
    // 驗證所有圖片路徑
    async validateImages() {
        const results = {};
        
        for (const [fileName, roomType] of Object.entries(this.imageMapping)) {
            const originalPath = `images/rooms/${fileName}`;
            const newPath = `images/rooms/${roomType}/${fileName}`;
            
            results[fileName] = {
                roomType: roomType,
                originalExists: await this.checkImageExists(originalPath),
                newExists: await this.checkImageExists(newPath)
            };
        }
        
        console.log('圖片驗證結果:', results);
        return results;
    }
};

// 如果在瀏覽器環境中運行，將工具添加到全域
if (typeof window !== 'undefined') {
    window.imageOrganizer = imageOrganizer;
}

// 如果在 Node.js 環境中運行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = imageOrganizer;
}

// 使用示例：
// 在瀏覽器控制台中執行：
// imageOrganizer.printCommands();
// imageOrganizer.validateImages(); 