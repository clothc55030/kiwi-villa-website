// 優化的房間圖片庫功能
(function() {
    'use strict';
    
    class RoomGalleryOptimized {
        constructor() {
            this.galleries = [];
            this.rafId = null;
            this.init();
        }
        
        init() {
            // 使用 requestIdleCallback 延遲初始化
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => this.setupGalleries());
            } else {
                setTimeout(() => this.setupGalleries(), 100);
            }
        }
        
        setupGalleries() {
            const galleryElements = document.querySelectorAll('.room-gallery');
            
            galleryElements.forEach(gallery => {
                const galleryInstance = {
                    element: gallery,
                    items: gallery.querySelectorAll('.gallery-item'),
                    currentIndex: 0,
                    isScrolling: false,
                    touchStartX: 0,
                    touchStartY: 0,
                    scrollStartLeft: 0
                };
                
                if (galleryInstance.items.length > 1) {
                    this.setupGallery(galleryInstance);
                    this.galleries.push(galleryInstance);
                }
            });
        }
        
        setupGallery(gallery) {
            // 創建指示器
            this.createIndicators(gallery);
            
            // 設置事件監聽器（使用事件委託和被動監聽）
            this.setupTouchEvents(gallery);
            
            // 設置 Intersection Observer 來延遲載入圖片
            this.setupLazyLoading(gallery);
            
            // 監聽滾動（使用 RAF 優化）
            this.setupScrollListener(gallery);
        }
        
        createIndicators(gallery) {
            if (gallery.element.querySelector('.gallery-indicators')) return;
            
            const fragment = document.createDocumentFragment();
            const container = document.createElement('div');
            container.className = 'gallery-indicators';
            
            gallery.items.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.className = `gallery-indicator ${index === 0 ? 'active' : ''}`;
                indicator.dataset.index = index;
                
                // 點擊指示器切換圖片
                indicator.addEventListener('click', () => {
                    this.scrollToImage(gallery, index);
                });
                
                container.appendChild(indicator);
            });
            
            fragment.appendChild(container);
            gallery.element.appendChild(fragment);
            gallery.indicators = container.querySelectorAll('.gallery-indicator');
        }
        
        setupTouchEvents(gallery) {
            const element = gallery.element;
            let touchStartTime;
            
            // 觸摸開始
            element.addEventListener('touchstart', (e) => {
                gallery.touchStartX = e.touches[0].pageX;
                gallery.touchStartY = e.touches[0].pageY;
                gallery.scrollStartLeft = element.scrollLeft;
                gallery.isScrolling = true;
                touchStartTime = Date.now();
                
                // 暫時禁用平滑滾動
                element.style.scrollBehavior = 'auto';
            }, { passive: true });
            
            // 觸摸移動 - 使用 RAF 優化
            element.addEventListener('touchmove', (e) => {
                if (!gallery.isScrolling) return;
                
                const touchX = e.touches[0].pageX;
                const touchY = e.touches[0].pageY;
                const deltaX = gallery.touchStartX - touchX;
                const deltaY = gallery.touchStartY - touchY;
                
                // 如果垂直滾動大於水平滾動，停止處理
                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    gallery.isScrolling = false;
                    return;
                }
                
                // 使用 RAF 優化滾動
                if (this.rafId) cancelAnimationFrame(this.rafId);
                this.rafId = requestAnimationFrame(() => {
                    element.scrollLeft = gallery.scrollStartLeft + deltaX;
                });
            }, { passive: true });
            
            // 觸摸結束
            element.addEventListener('touchend', (e) => {
                if (!gallery.isScrolling) return;
                
                gallery.isScrolling = false;
                element.style.scrollBehavior = 'smooth';
                
                const touchEndTime = Date.now();
                const touchDuration = touchEndTime - touchStartTime;
                const touchEndX = e.changedTouches[0].pageX;
                const velocity = (gallery.touchStartX - touchEndX) / touchDuration;
                
                // 根據速度決定是否切換到下一張
                if (Math.abs(velocity) > 0.5) {
                    const direction = velocity > 0 ? 1 : -1;
                    const newIndex = Math.max(0, Math.min(gallery.items.length - 1, gallery.currentIndex + direction));
                    this.scrollToImage(gallery, newIndex);
                } else {
                    // 滾動到最近的圖片
                    this.snapToNearestImage(gallery);
                }
            }, { passive: true });
        }
        
        setupScrollListener(gallery) {
            let scrollTimeout;
            
            gallery.element.addEventListener('scroll', () => {
                // 使用 RAF 和防抖優化
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    requestAnimationFrame(() => {
                        this.updateActiveIndicator(gallery);
                    });
                }, 100);
            }, { passive: true });
        }
        
        setupLazyLoading(gallery) {
            // 使用 Intersection Observer 延遲載入圖片
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target.querySelector('img');
                        if (img && img.dataset.src && !img.src) {
                            // 載入圖片
                            const picture = img.closest('picture');
                            if (picture) {
                                const sources = picture.querySelectorAll('source[data-srcset]');
                                sources.forEach(source => {
                                    source.srcset = source.dataset.srcset;
                                });
                            }
                            img.src = img.dataset.src;
                            img.classList.add('lazyloaded');
                        }
                    }
                });
            }, {
                root: gallery.element,
                rootMargin: '50px 0px',
                threshold: 0.01
            });
            
            gallery.items.forEach(item => {
                imageObserver.observe(item);
            });
        }
        
        scrollToImage(gallery, index) {
            const item = gallery.items[index];
            if (!item) return;
            
            gallery.currentIndex = index;
            const scrollLeft = item.offsetLeft - (gallery.element.offsetWidth - item.offsetWidth) / 2;
            
            gallery.element.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
            
            this.updateActiveIndicator(gallery);
        }
        
        snapToNearestImage(gallery) {
            const scrollLeft = gallery.element.scrollLeft;
            const containerWidth = gallery.element.offsetWidth;
            
            let nearestIndex = 0;
            let minDistance = Infinity;
            
            gallery.items.forEach((item, index) => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const containerCenter = scrollLeft + containerWidth / 2;
                const distance = Math.abs(itemCenter - containerCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIndex = index;
                }
            });
            
            this.scrollToImage(gallery, nearestIndex);
        }
        
        updateActiveIndicator(gallery) {
            if (!gallery.indicators) return;
            
            const scrollLeft = gallery.element.scrollLeft;
            const containerWidth = gallery.element.offsetWidth;
            const containerCenter = scrollLeft + containerWidth / 2;
            
            let activeIndex = 0;
            let minDistance = Infinity;
            
            gallery.items.forEach((item, index) => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const distance = Math.abs(itemCenter - containerCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    activeIndex = index;
                }
            });
            
            gallery.currentIndex = activeIndex;
            
            gallery.indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === activeIndex);
            });
        }
    }
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new RoomGalleryOptimized();
        });
    } else {
        new RoomGalleryOptimized();
    }
    
    // 導出到全局
    window.RoomGalleryOptimized = RoomGalleryOptimized;
})();