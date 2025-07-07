// 懶載入模組 - 使用 Intersection Observer API

// 懶載入配置
const lazyLoadConfig = {
    rootMargin: '50px 0px', // 提前 50px 載入
    threshold: 0.01 // 1% 可見時觸發
};

// 載入圖片
function loadImage(img) {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;
    
    if (src) {
        img.src = src;
    }
    if (srcset) {
        img.srcset = srcset;
    }
    
    // 載入完成後移除 data 屬性並添加載入完成類別
    img.addEventListener('load', () => {
        img.classList.add('lazy-loaded');
        delete img.dataset.src;
        delete img.dataset.srcset;
    }, { once: true });
}

// 載入 picture 元素中的 source
function loadPicture(picture) {
    const sources = picture.querySelectorAll('source[data-srcset]');
    const img = picture.querySelector('img[data-src]');
    
    sources.forEach(source => {
        source.srcset = source.dataset.srcset;
        delete source.dataset.srcset;
    });
    
    if (img) {
        loadImage(img);
    }
}

// 初始化懶載入
export function initLazyLoading() {
    // 支援檢測
    if (!('IntersectionObserver' in window)) {
        // 如果不支援 Intersection Observer，立即載入所有圖片
        console.warn('IntersectionObserver not supported, loading all images');
        const lazyImages = document.querySelectorAll('img[data-src], picture');
        lazyImages.forEach(element => {
            if (element.tagName === 'PICTURE') {
                loadPicture(element);
            } else {
                loadImage(element);
            }
        });
        return;
    }
    
    // 創建觀察器
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                
                if (element.tagName === 'PICTURE') {
                    loadPicture(element);
                } else if (element.tagName === 'IMG') {
                    loadImage(element);
                }
                
                // 停止觀察已載入的元素
                observer.unobserve(element);
            }
        });
    }, lazyLoadConfig);
    
    // 觀察所有需要懶載入的元素
    const lazyImages = document.querySelectorAll('img[data-src]');
    const lazyPictures = document.querySelectorAll('picture:has(img[data-src])');
    
    lazyImages.forEach(img => imageObserver.observe(img));
    lazyPictures.forEach(picture => imageObserver.observe(picture));
    
    // 返回觀察器以便需要時可以停止
    return imageObserver;
}

// 預載入關鍵圖片
export function preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('[data-preload="true"]');
    
    criticalImages.forEach(img => {
        if (img.dataset.src) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = img.dataset.src;
            
            // 如果有 srcset，預載入第一個
            if (img.dataset.srcset) {
                const firstSrc = img.dataset.srcset.split(',')[0].trim().split(' ')[0];
                link.href = firstSrc;
            }
            
            document.head.appendChild(link);
        }
    });
}