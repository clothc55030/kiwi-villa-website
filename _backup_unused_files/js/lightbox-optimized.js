// 優化的 Lightbox 功能
(function() {
    'use strict';
    
    class LightboxOptimized {
        constructor() {
            this.lightbox = null;
            this.currentImages = [];
            this.currentIndex = 0;
            this.isOpen = false;
            this.preloadDistance = 2; // 預載入前後2張圖片
            this.init();
        }
        
        init() {
            this.createLightbox();
            this.bindEvents();
            this.setupImageTriggers();
        }
        
        createLightbox() {
            // 創建 lightbox HTML 結構
            const lightboxHTML = `
                <div class="lightbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
                    <div class="lightbox-overlay"></div>
                    <div class="lightbox-container">
                        <button class="lightbox-close" aria-label="關閉圖片預覽">
                            <i class="fas fa-times"></i>
                        </button>
                        <button class="lightbox-prev" aria-label="上一張圖片">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="lightbox-next" aria-label="下一張圖片">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="lightbox-image-container">
                            <img class="lightbox-image" src="" alt="">
                            <div class="lightbox-loading">
                                <i class="fas fa-spinner fa-spin"></i>
                            </div>
                        </div>
                        <div class="lightbox-caption"></div>
                        <div class="lightbox-counter"></div>
                    </div>
                </div>
            `;
            
            // 使用 template 元素來安全地創建 DOM
            const template = document.createElement('template');
            template.innerHTML = lightboxHTML;
            this.lightbox = template.content.firstElementChild;
            document.body.appendChild(this.lightbox);
            
            // 緩存常用元素
            this.elements = {
                overlay: this.lightbox.querySelector('.lightbox-overlay'),
                container: this.lightbox.querySelector('.lightbox-container'),
                image: this.lightbox.querySelector('.lightbox-image'),
                loading: this.lightbox.querySelector('.lightbox-loading'),
                caption: this.lightbox.querySelector('.lightbox-caption'),
                counter: this.lightbox.querySelector('.lightbox-counter'),
                closeBtn: this.lightbox.querySelector('.lightbox-close'),
                prevBtn: this.lightbox.querySelector('.lightbox-prev'),
                nextBtn: this.lightbox.querySelector('.lightbox-next')
            };
        }
        
        bindEvents() {
            // 關閉按鈕
            this.elements.closeBtn.addEventListener('click', () => this.close());
            this.elements.overlay.addEventListener('click', () => this.close());
            
            // 導航按鈕
            this.elements.prevBtn.addEventListener('click', () => this.navigate(-1));
            this.elements.nextBtn.addEventListener('click', () => this.navigate(1));
            
            // 鍵盤事件
            document.addEventListener('keydown', (e) => {
                if (!this.isOpen) return;
                
                switch(e.key) {
                    case 'Escape':
                        this.close();
                        break;
                    case 'ArrowLeft':
                        this.navigate(-1);
                        break;
                    case 'ArrowRight':
                        this.navigate(1);
                        break;
                }
            });
            
            // 觸控滑動
            this.setupTouchEvents();
        }
        
        setupTouchEvents() {
            let startX = 0;
            let startY = 0;
            let endX = 0;
            let endY = 0;
            const minSwipeDistance = 50;
            
            this.elements.container.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, { passive: true });
            
            this.elements.container.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;
                
                const diffX = startX - endX;
                const diffY = startY - endY;
                
                // 確保是水平滑動
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
                    if (diffX > 0) {
                        this.navigate(1); // 向左滑動，下一張
                    } else {
                        this.navigate(-1); // 向右滑動，上一張
                    }
                }
            }, { passive: true });
        }
        
        setupImageTriggers() {
            // 使用事件委託來處理所有圖片點擊
            document.addEventListener('click', (e) => {
                const galleryImg = e.target.closest('.room-gallery img');
                if (!galleryImg) return;
                
                e.preventDefault();
                this.openFromImage(galleryImg);
            });
            
            // 支援鍵盤操作
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const galleryImg = e.target.closest('.room-gallery img');
                    if (galleryImg) {
                        e.preventDefault();
                        this.openFromImage(galleryImg);
                    }
                }
            });
        }
        
        openFromImage(triggerImage) {
            // 找到同一房間的所有圖片
            const roomCard = triggerImage.closest('.room-card');
            const images = Array.from(roomCard.querySelectorAll('.room-gallery img'));
            
            this.currentImages = images.map(img => ({
                src: img.dataset.src || img.src,
                alt: img.alt,
                element: img
            }));
            
            this.currentIndex = images.indexOf(triggerImage);
            this.open();
        }
        
        open() {
            this.isOpen = true;
            this.lightbox.setAttribute('aria-hidden', 'false');
            this.lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // 載入當前圖片
            this.loadImage(this.currentIndex);
            
            // 預載入相鄰圖片
            this.preloadAdjacentImages();
            
            // 聚焦到關閉按鈕
            setTimeout(() => {
                this.elements.closeBtn.focus();
            }, 100);
        }
        
        close() {
            this.isOpen = false;
            this.lightbox.setAttribute('aria-hidden', 'true');
            this.lightbox.classList.remove('active');
            document.body.style.overflow = '';
            
            // 將焦點返回到觸發元素
            if (this.currentImages[this.currentIndex]?.element) {
                this.currentImages[this.currentIndex].element.focus();
            }
        }
        
        navigate(direction) {
            const newIndex = this.currentIndex + direction;
            
            if (newIndex >= 0 && newIndex < this.currentImages.length) {
                this.currentIndex = newIndex;
                this.loadImage(this.currentIndex);
                this.preloadAdjacentImages();
            }
        }
        
        loadImage(index) {
            const imageData = this.currentImages[index];
            if (!imageData) return;
            
            // 顯示載入中
            this.elements.loading.style.display = 'block';
            this.elements.image.style.opacity = '0';
            
            // 創建新圖片來預載入
            const tempImg = new Image();
            tempImg.onload = () => {
                this.elements.image.src = tempImg.src;
                this.elements.image.alt = imageData.alt;
                this.elements.caption.textContent = imageData.alt;
                this.elements.counter.textContent = `${index + 1} / ${this.currentImages.length}`;
                
                // 隱藏載入中，顯示圖片
                this.elements.loading.style.display = 'none';
                this.elements.image.style.opacity = '1';
                
                // 更新導航按鈕狀態
                this.updateNavigationButtons();
            };
            
            tempImg.onerror = () => {
                this.elements.loading.style.display = 'none';
                this.elements.caption.textContent = '圖片載入失敗';
            };
            
            tempImg.src = imageData.src;
        }
        
        preloadAdjacentImages() {
            // 預載入前後的圖片
            for (let i = 1; i <= this.preloadDistance; i++) {
                // 預載入下一張
                const nextIndex = this.currentIndex + i;
                if (nextIndex < this.currentImages.length) {
                    this.preloadImage(this.currentImages[nextIndex].src);
                }
                
                // 預載入上一張
                const prevIndex = this.currentIndex - i;
                if (prevIndex >= 0) {
                    this.preloadImage(this.currentImages[prevIndex].src);
                }
            }
        }
        
        preloadImage(src) {
            // 使用 Image 物件預載入，但不需要等待完成
            const img = new Image();
            img.src = src;
        }
        
        updateNavigationButtons() {
            // 更新按鈕的可用狀態
            this.elements.prevBtn.disabled = this.currentIndex === 0;
            this.elements.nextBtn.disabled = this.currentIndex === this.currentImages.length - 1;
            
            // 更新 aria-label
            this.elements.prevBtn.setAttribute('aria-label', 
                this.currentIndex > 0 ? '上一張圖片' : '已經是第一張圖片');
            this.elements.nextBtn.setAttribute('aria-label', 
                this.currentIndex < this.currentImages.length - 1 ? '下一張圖片' : '已經是最後一張圖片');
        }
    }
    
    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            new LightboxOptimized();
        });
    } else {
        new LightboxOptimized();
    }
    
    // 導出到全局
    window.LightboxOptimized = LightboxOptimized;
})();