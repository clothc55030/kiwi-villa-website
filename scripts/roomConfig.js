// 房型配置檔案
const roomConfig = {
    luxuryFamily: {
        folderPath: 'images/rooms/luxuryFamily/',
        roomName: '豪華家庭房',
        englishName: 'Deluxe Family Room with Bathtub',
        roomNumber: '萌201',
        defaultImages: [
            'penghu-kiwi-villa-luxury-family-room1.jpg',
            'penghu-kiwi-villa-luxury-family-room2.jpg',
            'penghu-kiwi-villa-luxury-family-room3.jpg',
            'penghu-kiwi-villa-luxury-family-room4.jpg',
            'penghu-kiwi-villa-luxury-family-room5.jpg',
            'penghu-kiwi-villa-luxury-family-room6.jpg',
            'penghu-kiwi-villa-luxury-family-room7.jpg',
            'penghu-kiwi-villa-luxury-family-room8.jpg',
            'penghu-kiwi-villa-luxury-family-room9.jpg',
            'penghu-kiwi-villa-luxury-family-room10.jpg'
        ]
    },
    premiumQuad: {
        folderPath: 'images/rooms/premiumQuad/',
        roomName: '高級四人房',
        englishName: 'Superior Quad Room with Balcony',
        roomNumber: '戀203',
        defaultImages: [
            'penghu-kiwi-villa-premium-quad-room1.jpg',
            'penghu-kiwi-villa-premium-quad-room2.jpg',
            'penghu-kiwi-villa-premium-quad-room3.jpg',
            'penghu-kiwi-villa-premium-quad-room4.jpg',
            'penghu-kiwi-villa-premium-quad-room5.jpg',
            'penghu-kiwi-villa-premium-quad-room6.jpg',
            'penghu-kiwi-villa-premium-quad-room7.jpg',
            'penghu-kiwi-villa-premium-quad-room8.jpg'
        ]
    },
    deluxeQuad: {
        folderPath: 'images/rooms/deluxeQuad/',
        roomName: '奢華四人房',
        englishName: 'Luxury Quad Room with Balcony',
        roomNumber: '趣205',
        defaultImages: [
            'penghu-kiwi-villa-deluxe-quad-room1.jpg',
            'penghu-kiwi-villa-deluxe-quad-room2.jpg',
            'penghu-kiwi-villa-deluxe-quad-room3.jpg',
            'penghu-kiwi-villa-deluxe-quad-room4.jpg',
            'penghu-kiwi-villa-deluxe-quad-room5.jpg',
            'penghu-kiwi-villa-deluxe-quad-room6.jpg',
            'penghu-kiwi-villa-deluxe-quad-room7.jpg',
            'penghu-kiwi-villa-deluxe-quad-room8.jpg',
            'penghu-kiwi-villa-deluxe-quad-room9.jpg',
            'penghu-kiwi-villa-deluxe-quad-room10.jpg'
        ]
    },
    premiumTriple: {
        folderPath: 'images/rooms/premiumTriple/',
        roomName: '高級三人房',
        englishName: 'Superior Triple Room with Balcony',
        roomNumber: '夢303',
        defaultImages: [
            'penghu-kiwi-villa-premium-triple-room1.jpg',
            'penghu-kiwi-villa-premium-triple-room2.jpg',
            'penghu-kiwi-villa-premium-triple-room3.jpg',
            'penghu-kiwi-villa-premium-triple-room4.jpg',
            'penghu-kiwi-villa-premium-triple-room5.jpg',
            'penghu-kiwi-villa-premium-triple-room6.jpg',
            'penghu-kiwi-villa-premium-triple-room7.jpg',
            'penghu-kiwi-villa-premium-triple-room8.jpg'
        ]
    },
    premiumTwin: {
        folderPath: 'images/rooms/premiumTwin/',
        roomName: '高級雙床房',
        englishName: 'Superior Twin Room with Balcony',
        roomNumber: '期301 遇302',
        defaultImages: [
            'penghu-kiwi-villa-premium-twin-room1.jpg',
            'penghu-kiwi-villa-premium-twin-room2.jpg',
            'penghu-kiwi-villa-premium-twin-room3.jpg',
            'penghu-kiwi-villa-premium-twin-room4.jpg',
            'penghu-kiwi-villa-premium-twin-room5.jpg',
            'penghu-kiwi-villa-premium-twin-room6.jpg',
            'penghu-kiwi-villa-premium-twin-room7.jpg',
            'penghu-kiwi-villa-premium-twin-room8.jpg',
            'penghu-kiwi-villa-premium-twin-room9.jpg'
        ]
    },
    premiumDouble: {
        folderPath: 'images/rooms/premiumDouble/',
        roomName: '高級雙人房',
        englishName: 'Superior Double Room with Balcony',
        roomNumber: '泊305 韻306 縵307',
        defaultImages: [
            'penghu-kiwi-villa-premium-double-room1.jpg',
            'penghu-kiwi-villa-premium-double-room2.jpg',
            'penghu-kiwi-villa-premium-double-room3.jpg',
            'penghu-kiwi-villa-premium-double-room4.jpg',
            'penghu-kiwi-villa-premium-double-room5.jpg',
            'penghu-kiwi-villa-premium-double-room6.jpg',
            'penghu-kiwi-villa-premium-double-room7.jpg',
            'penghu-kiwi-villa-premium-double-room8.jpg',
            'penghu-kiwi-villa-premium-double-room9.jpg',
            'penghu-kiwi-villa-premium-double-room10.jpg',
            'penghu-kiwi-villa-premium-double-room11.jpg',
            'penghu-kiwi-villa-premium-double-room12.jpg',
            'penghu-kiwi-villa-premium-double-room13.jpg',
            'penghu-kiwi-villa-premium-double-room14.jpg',
            'penghu-kiwi-villa-premium-double-room15.jpg',
            'penghu-kiwi-villa-premium-double-room16.jpg',
            'penghu-kiwi-villa-premium-double-room17.jpg',
            'penghu-kiwi-villa-premium-double-room18.jpg',
            'penghu-kiwi-villa-premium-double-room19.jpg',
            'penghu-kiwi-villa-premium-double-room20.jpg',
            'penghu-kiwi-villa-premium-double-room21.jpg',
            'penghu-kiwi-villa-premium-double-room22.jpg',
            'penghu-kiwi-villa-premium-double-room23.jpg',
            'penghu-kiwi-villa-premium-double-room24.jpg',
            'penghu-kiwi-villa-premium-double-room25.jpg',
            'penghu-kiwi-villa-premium-double-room26.jpg'
        ]
    }
};

// 圖片檔案格式支援
const supportedImageFormats = ['.jpg', '.jpeg', '.png', '.webp'];

// 檢查檔案是否為支援的圖片格式
function isSupportedImageFormat(filename) {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return supportedImageFormats.includes(ext);
}

// 載入文件夾內的所有圖片
async function loadRoomImages(roomType) {
    const config = roomConfig[roomType];
    if (!config) {
        console.error(`未找到房型配置: ${roomType}`);
        return [];
    }

    try {
        // 嘗試讀取文件夾內容 (這需要伺服器端支援或預先定義的圖片清單)
        const images = await fetchFolderImages(config.folderPath);
        return images.length > 0 ? images : config.defaultImages.map(img => config.folderPath + img);
    } catch (error) {
        console.warn(`無法動態載入 ${roomType} 的圖片，使用預設圖片`, error);
        return config.defaultImages.map(img => config.folderPath + img);
    }
}

// 獲取文件夾內的圖片 (需要預先定義的圖片清單)
async function fetchFolderImages(folderPath) {
    // 由於瀏覽器安全限制，無法直接讀取文件夾內容
    // 這裡返回預先定義的圖片清單，您可以根據實際文件夾內容更新
    const imageLists = {
        'images/rooms/luxuryFamily/': [
            'penghu-kiwi-villa-luxury-family-room1.jpg',
            'penghu-kiwi-villa-luxury-family-room2.jpg',
            'penghu-kiwi-villa-luxury-family-room3.jpg',
            'penghu-kiwi-villa-luxury-family-room4.jpg',
            'penghu-kiwi-villa-luxury-family-room5.jpg',
            'penghu-kiwi-villa-luxury-family-room6.jpg',
            'penghu-kiwi-villa-luxury-family-room7.jpg',
            'penghu-kiwi-villa-luxury-family-room8.jpg',
            'penghu-kiwi-villa-luxury-family-room9.jpg',
            'penghu-kiwi-villa-luxury-family-room10.jpg'
        ],
        'images/rooms/premiumQuad/': [
            'penghu-kiwi-villa-premium-quad-room1.jpg',
            'penghu-kiwi-villa-premium-quad-room2.jpg',
            'penghu-kiwi-villa-premium-quad-room3.jpg',
            'penghu-kiwi-villa-premium-quad-room4.jpg',
            'penghu-kiwi-villa-premium-quad-room5.jpg',
            'penghu-kiwi-villa-premium-quad-room6.jpg',
            'penghu-kiwi-villa-premium-quad-room7.jpg',
            'penghu-kiwi-villa-premium-quad-room8.jpg'
        ],
        'images/rooms/deluxeQuad/': [
            'penghu-kiwi-villa-deluxe-quad-room1.jpg',
            'penghu-kiwi-villa-deluxe-quad-room2.jpg',
            'penghu-kiwi-villa-deluxe-quad-room3.jpg',
            'penghu-kiwi-villa-deluxe-quad-room4.jpg',
            'penghu-kiwi-villa-deluxe-quad-room5.jpg',
            'penghu-kiwi-villa-deluxe-quad-room6.jpg',
            'penghu-kiwi-villa-deluxe-quad-room7.jpg',
            'penghu-kiwi-villa-deluxe-quad-room8.jpg',
            'penghu-kiwi-villa-deluxe-quad-room9.jpg',
            'penghu-kiwi-villa-deluxe-quad-room10.jpg'
        ],
        'images/rooms/premiumTriple/': [
            'penghu-kiwi-villa-premium-triple-room1.jpg',
            'penghu-kiwi-villa-premium-triple-room2.jpg',
            'penghu-kiwi-villa-premium-triple-room3.jpg',
            'penghu-kiwi-villa-premium-triple-room4.jpg',
            'penghu-kiwi-villa-premium-triple-room5.jpg',
            'penghu-kiwi-villa-premium-triple-room6.jpg',
            'penghu-kiwi-villa-premium-triple-room7.jpg',
            'penghu-kiwi-villa-premium-triple-room8.jpg'
        ],
        'images/rooms/premiumTwin/': [
            'penghu-kiwi-villa-premium-twin-room1.jpg',
            'penghu-kiwi-villa-premium-twin-room2.jpg',
            'penghu-kiwi-villa-premium-twin-room3.jpg',
            'penghu-kiwi-villa-premium-twin-room4.jpg',
            'penghu-kiwi-villa-premium-twin-room5.jpg',
            'penghu-kiwi-villa-premium-twin-room6.jpg',
            'penghu-kiwi-villa-premium-twin-room7.jpg',
            'penghu-kiwi-villa-premium-twin-room8.jpg',
            'penghu-kiwi-villa-premium-twin-room9.jpg'
        ],
        'images/rooms/premiumDouble/': [
            'penghu-kiwi-villa-premium-double-room1.jpg',
            'penghu-kiwi-villa-premium-double-room2.jpg',
            'penghu-kiwi-villa-premium-double-room3.jpg',
            'penghu-kiwi-villa-premium-double-room4.jpg',
            'penghu-kiwi-villa-premium-double-room5.jpg',
            'penghu-kiwi-villa-premium-double-room6.jpg',
            'penghu-kiwi-villa-premium-double-room7.jpg',
            'penghu-kiwi-villa-premium-double-room8.jpg',
            'penghu-kiwi-villa-premium-double-room9.jpg',
            'penghu-kiwi-villa-premium-double-room10.jpg',
            'penghu-kiwi-villa-premium-double-room11.jpg',
            'penghu-kiwi-villa-premium-double-room12.jpg',
            'penghu-kiwi-villa-premium-double-room13.jpg',
            'penghu-kiwi-villa-premium-double-room14.jpg',
            'penghu-kiwi-villa-premium-double-room15.jpg',
            'penghu-kiwi-villa-premium-double-room16.jpg',
            'penghu-kiwi-villa-premium-double-room17.jpg',
            'penghu-kiwi-villa-premium-double-room18.jpg',
            'penghu-kiwi-villa-premium-double-room19.jpg',
            'penghu-kiwi-villa-premium-double-room20.jpg',
            'penghu-kiwi-villa-premium-double-room21.jpg',
            'penghu-kiwi-villa-premium-double-room22.jpg',
            'penghu-kiwi-villa-premium-double-room23.jpg',
            'penghu-kiwi-villa-premium-double-room24.jpg',
            'penghu-kiwi-villa-premium-double-room25.jpg',
            'penghu-kiwi-villa-premium-double-room26.jpg'
        ]
    };

    const imageList = imageLists[folderPath] || [];
    return imageList
        .filter(img => isSupportedImageFormat(img))
        .map(img => folderPath + img);
}

// 動態生成圖片清單的工具函數
function generateImageList(folderPath, imageNames) {
    return imageNames
        .filter(name => isSupportedImageFormat(name))
        .map(name => folderPath + name);
} 