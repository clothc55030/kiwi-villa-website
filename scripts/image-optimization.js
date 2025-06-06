// 圖片優化JavaScript

// WebP支援檢測
function supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

// 添加WebP支援類別到body
if (supportsWebP()) {
    document.body.classList.add('webp');
} else {
    document.body.classList.add('no-webp');
}

// Lazy Loading實現
function lazyLoadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // 如果支援WebP，轉換圖片格式
                    if (supportsWebP() && !img.src.includes('.webp')) {
                        const webpSrc = img.src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
                        // 檢查WebP版本是否存在
                        checkImageExists(webpSrc).then(exists => {
                            if (exists) {
                                img.src = webpSrc;
                            }
                            img.classList.add('loaded');
                        });
                    } else {
                        img.classList.add('loaded');
                    }
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // 回退方案：直接載入所有圖片
        images.forEach(img => {
            img.classList.add('loaded');
        });
    }
}

// 檢查圖片是否存在
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// 圖片載入錯誤處理
function handleImageError() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        img.addEventListener('error', function() {
            // 圖片載入失敗時的處理
            this.style.display = 'none';
            
            // 可以添加預設圖片
            const placeholder = document.createElement('div');
            placeholder.className = 'img-placeholder';
            placeholder.style.height = this.offsetHeight + 'px';
            placeholder.innerHTML = '<i class="fas fa-image" style="color: #ccc; font-size: 2rem;"></i>';
            this.parentNode.insertBefore(placeholder, this);
        });
    });
}

// 圖片預載入優化
function preloadCriticalImages() {
    const criticalImages = [
        'images/hero/main-hall-environment.jpg',
        'images/logo/kiwi-villa-logo.png'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// 圖片壓縮品質優化（根據設備像素比）
function optimizeImageQuality() {
    const pixelRatio = window.devicePixelRatio || 1;
    const images = document.querySelectorAll('img[data-src-2x]');
    
    images.forEach(img => {
        if (pixelRatio > 1.5 && img.dataset.src2x) {
            img.src = img.dataset.src2x;
        }
    });
}

// 初始化所有圖片優化功能
function initImageOptimization() {
    // 預載入關鍵圖片
    preloadCriticalImages();
    
    // 延遲載入圖片
    lazyLoadImages();
    
    // 圖片錯誤處理
    handleImageError();
    
    // 優化圖片品質
    optimizeImageQuality();
}

// DOM載入完成後執行
document.addEventListener('DOMContentLoaded', initImageOptimization);

// 視窗載入完成後的額外優化
window.addEventListener('load', () => {
    // 移除載入中的佔位符
    const placeholders = document.querySelectorAll('.img-placeholder');
    placeholders.forEach(placeholder => {
        if (placeholder.nextElementSibling && placeholder.nextElementSibling.tagName === 'IMG') {
            placeholder.remove();
        }
    });
});

// 導出函數供其他檔案使用
window.ImageOptimization = {
    supportsWebP,
    lazyLoadImages,
    checkImageExists,
    preloadCriticalImages
}; 