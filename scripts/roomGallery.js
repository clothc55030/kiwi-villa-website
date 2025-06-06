// 房型圖片輪播和Lightbox功能
class RoomGallery {
    constructor() {
        this.currentSlides = {};
        this.lightbox = document.getElementById('lightbox');
        this.lightboxImage = this.lightbox.querySelector('.lightbox-image');
        this.lightboxClose = this.lightbox.querySelector('.lightbox-close');
        this.lightboxPrev = this.lightbox.querySelector('.lightbox-prev');
        this.lightboxNext = this.lightbox.querySelector('.lightbox-next');
        this.currentImageSpan = this.lightbox.querySelector('.current-image');
        this.totalImagesSpan = this.lightbox.querySelector('.total-images');
        
        this.currentLightboxGallery = null;
        this.currentLightboxIndex = 0;
        
        this.init();
    }
    
    init() {
        this.initSliders();
        this.initLightbox();
        this.addKeyboardSupport();
    }
    
    initSliders() {
        const galleries = document.querySelectorAll('.room-image-gallery');
        
        galleries.forEach((gallery, galleryIndex) => {
            const slides = gallery.querySelectorAll('.slide');
            const prevBtn = gallery.querySelector('.prev-btn');
            const nextBtn = gallery.querySelector('.next-btn');
            const indicators = gallery.querySelectorAll('.indicator');
            
            this.currentSlides[galleryIndex] = 0;
            
            // 設置輪播導航
            if (prevBtn && nextBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.prevSlide(galleryIndex);
                });
                
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.nextSlide(galleryIndex);
                });
            }
            
            // 設置指示器點擊
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.goToSlide(galleryIndex, index);
                });
            });
            
            // 設置圖片點擊放大
            slides.forEach((slide, slideIndex) => {
                const img = slide.querySelector('img');
                if (img) {
                    // 為圖片元素綁定點擊事件
                    img.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.openLightbox(gallery, slideIndex);
                    });
                    
                    // 為整個slide區域也綁定點擊事件作為備用
                    slide.addEventListener('click', (e) => {
                        // 只有當點擊的不是按鈕或指示器時才觸發
                        if (!e.target.closest('.prev-btn, .next-btn, .indicator')) {
                            e.preventDefault();
                            e.stopPropagation();
                            this.openLightbox(gallery, slideIndex);
                        }
                    });
                }
            });
            
            // 自動輪播 (可選)
            this.setupAutoPlay(galleryIndex);
        });
    }
    
    initLightbox() {
        // 關閉Lightbox
        this.lightboxClose.addEventListener('click', () => {
            this.closeLightbox();
        });
        
        // 點擊背景關閉
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Lightbox導航
        this.lightboxPrev.addEventListener('click', () => {
            this.lightboxPrevImage();
        });
        
        this.lightboxNext.addEventListener('click', () => {
            this.lightboxNextImage();
        });
    }
    
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            if (this.lightbox.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closeLightbox();
                        break;
                    case 'ArrowLeft':
                        this.lightboxPrevImage();
                        break;
                    case 'ArrowRight':
                        this.lightboxNextImage();
                        break;
                }
            }
        });
    }
    
    prevSlide(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        this.currentSlides[galleryIndex] = (this.currentSlides[galleryIndex] - 1 + totalSlides) % totalSlides;
        this.updateSlide(galleryIndex);
    }
    
    nextSlide(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        this.currentSlides[galleryIndex] = (this.currentSlides[galleryIndex] + 1) % totalSlides;
        this.updateSlide(galleryIndex);
    }
    
    goToSlide(galleryIndex, slideIndex) {
        this.currentSlides[galleryIndex] = slideIndex;
        this.updateSlide(galleryIndex);
    }
    
    updateSlide(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        const indicators = gallery.querySelectorAll('.indicator');
        const currentIndex = this.currentSlides[galleryIndex];
        
        // 更新slide顯示
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });
        
        // 更新指示器
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }
    
    setupAutoPlay(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        
        if (slides.length > 1) {
            let autoPlayTimer = setInterval(() => {
                this.nextSlide(galleryIndex);
            }, 5000); // 每5秒切換
            
            // 滑鼠懸停時暫停自動播放
            gallery.addEventListener('mouseenter', () => {
                clearInterval(autoPlayTimer);
            });
            
            gallery.addEventListener('mouseleave', () => {
                autoPlayTimer = setInterval(() => {
                    this.nextSlide(galleryIndex);
                }, 5000);
            });
        }
    }
    
    openLightbox(gallery, slideIndex) {
        this.currentLightboxGallery = gallery;
        this.currentLightboxIndex = slideIndex;
        
        const slides = gallery.querySelectorAll('.slide');
        const currentSlide = slides[slideIndex];
        const img = currentSlide.querySelector('img');
        
        if (img) {
            this.lightboxImage.src = img.src;
            this.lightboxImage.alt = img.alt;
            
            // 更新計數器
            this.currentImageSpan.textContent = slideIndex + 1;
            this.totalImagesSpan.textContent = slides.length;
            
            // 顯示Lightbox
            this.lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // 防止背景滾動
        }
    }
    
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = ''; // 恢復背景滾動
        this.currentLightboxGallery = null;
    }
    
    lightboxPrevImage() {
        if (!this.currentLightboxGallery) return;
        
        const slides = this.currentLightboxGallery.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        this.currentLightboxIndex = (this.currentLightboxIndex - 1 + totalSlides) % totalSlides;
        this.updateLightboxImage();
    }
    
    lightboxNextImage() {
        if (!this.currentLightboxGallery) return;
        
        const slides = this.currentLightboxGallery.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        this.currentLightboxIndex = (this.currentLightboxIndex + 1) % totalSlides;
        this.updateLightboxImage();
    }
    
    updateLightboxImage() {
        if (!this.currentLightboxGallery) return;
        
        const slides = this.currentLightboxGallery.querySelectorAll('.slide');
        const currentSlide = slides[this.currentLightboxIndex];
        const img = currentSlide.querySelector('img');
        
        if (img) {
            this.lightboxImage.src = img.src;
            this.lightboxImage.alt = img.alt;
            
            // 更新計數器
            this.currentImageSpan.textContent = this.currentLightboxIndex + 1;
            this.totalImagesSpan.textContent = slides.length;
        }
    }
}

// 防止重複初始化
let roomGalleryInitialized = false;

// 注意：實際初始化在下方的觸控處理器中進行

// 處理觸控設備的滑動手勢
class TouchHandler {
    constructor() {
        this.touchStartX = 0;
        this.touchEndX = 0;
        this.minSwipeDistance = 50;
        
        this.init();
    }
    
    init() {
        const galleries = document.querySelectorAll('.room-image-gallery');
        
        galleries.forEach((gallery, index) => {
            gallery.addEventListener('touchstart', (e) => {
                this.touchStartX = e.changedTouches[0].screenX;
            });
            
            gallery.addEventListener('touchend', (e) => {
                this.touchEndX = e.changedTouches[0].screenX;
                this.handleSwipe(index);
            });
        });
        
        // Lightbox 滑動支援
        const lightbox = document.getElementById('lightbox');
        lightbox.addEventListener('touchstart', (e) => {
            this.touchStartX = e.changedTouches[0].screenX;
        });
        
        lightbox.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].screenX;
            this.handleLightboxSwipe();
        });
    }
    
    handleSwipe(galleryIndex) {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > this.minSwipeDistance) {
            if (swipeDistance > 0) {
                // 向右滑動 - 上一張
                window.roomGallery.prevSlide(galleryIndex);
            } else {
                // 向左滑動 - 下一張
                window.roomGallery.nextSlide(galleryIndex);
            }
        }
    }
    
    handleLightboxSwipe() {
        const swipeDistance = this.touchEndX - this.touchStartX;
        
        if (Math.abs(swipeDistance) > this.minSwipeDistance) {
            if (swipeDistance > 0) {
                // 向右滑動 - 上一張
                window.roomGallery.lightboxPrevImage();
            } else {
                // 向左滑動 - 下一張
                window.roomGallery.lightboxNextImage();
            }
        }
    }
}

// 統一初始化處理
document.addEventListener('DOMContentLoaded', () => {
    const galleries = document.querySelectorAll('.room-image-gallery');
    
    if (galleries.length > 0 && !roomGalleryInitialized) {
        window.roomGallery = new RoomGallery();
        roomGalleryInitialized = true;
    }
    
    new TouchHandler();
}); 