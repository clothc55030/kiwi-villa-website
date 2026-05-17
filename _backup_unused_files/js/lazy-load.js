// 延遲載入圖片功能
(function() {
    'use strict';
    
    // 延遲載入圖片類
    class LazyImageLoader {
        constructor() {
            this.imageObserver = null;
            this.init();
        }
        
        init() {
            // 檢查 IntersectionObserver 支援
            if ('IntersectionObserver' in window) {
                this.imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.loadImage(entry.target);
                            observer.unobserve(entry.target);
                        }
                    });
                }, {
                    // 提前 200px 開始載入
                    rootMargin: '200px 0px',
                    threshold: 0.01
                });
                
                this.observeImages();
            } else {
                // 降級處理：直接載入所有圖片
                this.loadAllImages();
            }
        }
        
        observeImages() {
            // 找到所有需要延遲載入的圖片
            const lazyImages = document.querySelectorAll('img.lazyload, img[data-src]');
            lazyImages.forEach(img => {
                this.imageObserver.observe(img);
            });
        }
        
        loadImage(img) {
            const picture = img.closest('picture');
            
            if (picture) {
                // 處理 picture 元素中的 source
                const sources = picture.querySelectorAll('source[data-srcset]');
                sources.forEach(source => {
                    source.srcset = source.dataset.srcset;
                    source.removeAttribute('data-srcset');
                });
            }
            
            // 處理 img 元素
            if (img.dataset.src) {
                // 預載入圖片
                const tempImg = new Image();
                tempImg.onload = () => {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.classList.remove('lazyload');
                    img.classList.add('lazyloaded');
                    
                    // 觸發自定義事件
                    img.dispatchEvent(new CustomEvent('lazyloaded', {
                        bubbles: true,
                        detail: { img }
                    }));
                };
                tempImg.src = img.dataset.src;
            }
        }
        
        loadAllImages() {
            const lazyImages = document.querySelectorAll('img.lazyload, img[data-src]');
            lazyImages.forEach(img => this.loadImage(img));
        }
    }
    
    // 初始化延遲載入
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new LazyImageLoader();
        });
    } else {
        new LazyImageLoader();
    }
    
    // 導出到全局，以便其他腳本使用
    window.LazyImageLoader = LazyImageLoader;
})();