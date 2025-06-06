// 動態房型圖片庫管理器
class DynamicRoomGallery {
    constructor() {
        this.roomTypes = ['luxuryFamily', 'premiumQuad', 'deluxeQuad', 'premiumTriple', 'premiumTwin', 'premiumDouble'];
        this.galleries = {};
        this.currentSlides = {};
        this.lightbox = null;
        this.currentLightboxGallery = null;
        this.currentLightboxIndex = 0;
        
        this.init();
    }
    
    async init() {
        await this.loadAllRoomImages();
        this.generateGalleryHTML();
        this.initializeGalleries();
        this.initLightbox();
        this.addKeyboardSupport();
    }
    
    // 載入所有房型的圖片
    async loadAllRoomImages() {
        for (const roomType of this.roomTypes) {
            try {
                const images = await loadRoomImages(roomType);
                this.galleries[roomType] = {
                    images: images,
                    config: roomConfig[roomType]
                };
            } catch (error) {
                console.error(`載入 ${roomType} 圖片失敗:`, error);
                this.galleries[roomType] = {
                    images: [],
                    config: roomConfig[roomType]
                };
            }
        }
    }
    
    // 動態生成圖片輪播 HTML
    generateGalleryHTML() {
        const galleryContainers = document.querySelectorAll('.room-image-gallery');
        
        galleryContainers.forEach((container, index) => {
            const roomType = this.roomTypes[index];
            if (!roomType || !this.galleries[roomType]) return;
            
            const gallery = this.galleries[roomType];
            const images = gallery.images;
            
            if (images.length === 0) return;
            
            // 清空現有內容
            container.innerHTML = '';
            
            // 建立圖片輪播結構
            const sliderDiv = document.createElement('div');
            sliderDiv.className = 'image-slider';
            
            // 生成圖片 slides
            images.forEach((imageSrc, imgIndex) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = `slide ${imgIndex === 0 ? 'active' : ''}`;
                
                const img = document.createElement('img');
                img.src = imageSrc;
                img.alt = `${gallery.config.roomName}-圖片-${imgIndex + 1}`;
                img.loading = 'lazy';
                
                // 圖片載入錯誤處理
                img.onerror = () => {
                    console.warn(`圖片載入失敗: ${imageSrc}`);
                    slideDiv.style.display = 'none';
                };
                
                slideDiv.appendChild(img);
                sliderDiv.appendChild(slideDiv);
            });
            
            container.appendChild(sliderDiv);
            
            // 建立導航按鈕 (只有多於一張圖片時才顯示)
            if (images.length > 1) {
                const navDiv = document.createElement('div');
                navDiv.className = 'slider-nav';
                
                const prevBtn = document.createElement('button');
                prevBtn.className = 'prev-btn';
                prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
                
                const nextBtn = document.createElement('button');
                nextBtn.className = 'next-btn';
                nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
                
                navDiv.appendChild(prevBtn);
                navDiv.appendChild(nextBtn);
                container.appendChild(navDiv);
                
                // 建立指示器
                const indicatorsDiv = document.createElement('div');
                indicatorsDiv.className = 'slide-indicators';
                
                images.forEach((_, imgIndex) => {
                    const indicator = document.createElement('span');
                    indicator.className = `indicator ${imgIndex === 0 ? 'active' : ''}`;
                    indicator.setAttribute('data-slide', imgIndex);
                    indicatorsDiv.appendChild(indicator);
                });
                
                container.appendChild(indicatorsDiv);
            }
            
            // 添加房型標籤 (如果是豪華家庭房)
            if (roomType === 'luxuryFamily') {
                const badge = document.createElement('div');
                badge.className = 'room-badge';
                badge.textContent = '推薦';
                container.appendChild(badge);
            }
        });
    }
    
    // 初始化圖片輪播功能
    initializeGalleries() {
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
                    img.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.openLightbox(gallery, slideIndex);
                    });
                }
            });
            
            // 自動輪播
            this.setupAutoPlay(galleryIndex);
        });
    }
    
    // 設置自動播放
    setupAutoPlay(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        
        if (slides.length > 1) {
            let autoPlayTimer = setInterval(() => {
                this.nextSlide(galleryIndex);
            }, 5000);
            
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
    
    // 上一張圖片
    prevSlide(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        this.currentSlides[galleryIndex] = (this.currentSlides[galleryIndex] - 1 + totalSlides) % totalSlides;
        this.updateSlide(galleryIndex);
    }
    
    // 下一張圖片
    nextSlide(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        const totalSlides = slides.length;
        
        this.currentSlides[galleryIndex] = (this.currentSlides[galleryIndex] + 1) % totalSlides;
        this.updateSlide(galleryIndex);
    }
    
    // 跳到指定圖片
    goToSlide(galleryIndex, slideIndex) {
        this.currentSlides[galleryIndex] = slideIndex;
        this.updateSlide(galleryIndex);
    }
    
    // 更新圖片顯示
    updateSlide(galleryIndex) {
        const gallery = document.querySelectorAll('.room-image-gallery')[galleryIndex];
        const slides = gallery.querySelectorAll('.slide');
        const indicators = gallery.querySelectorAll('.indicator');
        const currentIndex = this.currentSlides[galleryIndex];
        
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });
        
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }
    
    // 初始化 Lightbox
    initLightbox() {
        // 建立 Lightbox 元素（如果不存在）
        this.lightbox = document.getElementById('lightbox');
        if (!this.lightbox) {
            this.createLightboxHTML();
        }
        
        const lightboxClose = this.lightbox.querySelector('.lightbox-close');
        const lightboxPrev = this.lightbox.querySelector('.lightbox-prev');
        const lightboxNext = this.lightbox.querySelector('.lightbox-next');
        
        lightboxClose.addEventListener('click', () => {
            this.closeLightbox();
        });
        
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        lightboxPrev.addEventListener('click', () => {
            this.lightboxPrevImage();
        });
        
        lightboxNext.addEventListener('click', () => {
            this.lightboxNextImage();
        });
    }
    
    // 建立 Lightbox HTML
    createLightboxHTML() {
        const lightboxHTML = `
            <div id="lightbox" class="lightbox">
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <img class="lightbox-image" src="" alt="">
                    <div class="lightbox-nav">
                        <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                        <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="lightbox-counter">
                        <span class="current-image">1</span> / <span class="total-images">1</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', lightboxHTML);
        this.lightbox = document.getElementById('lightbox');
    }
    
    // 開啟 Lightbox
    openLightbox(gallery, slideIndex) {
        this.currentLightboxGallery = gallery;
        this.currentLightboxIndex = slideIndex;
        
        const slides = gallery.querySelectorAll('.slide img');
        this.updateLightboxImage();
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // 關閉 Lightbox
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
        this.currentLightboxGallery = null;
        this.currentLightboxIndex = 0;
    }
    
    // Lightbox 上一張
    lightboxPrevImage() {
        if (!this.currentLightboxGallery) return;
        
        const slides = this.currentLightboxGallery.querySelectorAll('.slide img');
        this.currentLightboxIndex = (this.currentLightboxIndex - 1 + slides.length) % slides.length;
        this.updateLightboxImage();
    }
    
    // Lightbox 下一張
    lightboxNextImage() {
        if (!this.currentLightboxGallery) return;
        
        const slides = this.currentLightboxGallery.querySelectorAll('.slide img');
        this.currentLightboxIndex = (this.currentLightboxIndex + 1) % slides.length;
        this.updateLightboxImage();
    }
    
    // 更新 Lightbox 圖片
    updateLightboxImage() {
        if (!this.currentLightboxGallery) return;
        
        const slides = this.currentLightboxGallery.querySelectorAll('.slide img');
        const currentImg = slides[this.currentLightboxIndex];
        
        if (currentImg) {
            const lightboxImage = this.lightbox.querySelector('.lightbox-image');
            const currentImageSpan = this.lightbox.querySelector('.current-image');
            const totalImagesSpan = this.lightbox.querySelector('.total-images');
            
            lightboxImage.src = currentImg.src;
            lightboxImage.alt = currentImg.alt;
            
            currentImageSpan.textContent = this.currentLightboxIndex + 1;
            totalImagesSpan.textContent = slides.length;
        }
    }
    
    // 鍵盤支援
    addKeyboardSupport() {
        document.addEventListener('keydown', (e) => {
            if (this.lightbox && this.lightbox.classList.contains('active')) {
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
    
    // 重新載入特定房型的圖片
    async reloadRoomImages(roomType) {
        try {
            const images = await loadRoomImages(roomType);
            this.galleries[roomType].images = images;
            
            // 重新生成該房型的 HTML
            const roomIndex = this.roomTypes.indexOf(roomType);
            if (roomIndex !== -1) {
                const container = document.querySelectorAll('.room-image-gallery')[roomIndex];
                if (container) {
                    // 重新生成 HTML
                    this.generateSingleGalleryHTML(container, roomType);
                    this.initializeSingleGallery(container, roomIndex);
                }
            }
        } catch (error) {
            console.error(`重新載入 ${roomType} 圖片失敗:`, error);
        }
    }
    
    // 生成單一圖片庫 HTML
    generateSingleGalleryHTML(container, roomType) {
        const gallery = this.galleries[roomType];
        const images = gallery.images;
        
        if (images.length === 0) return;
        
        container.innerHTML = '';
        
        const sliderDiv = document.createElement('div');
        sliderDiv.className = 'image-slider';
        
        images.forEach((imageSrc, imgIndex) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = `slide ${imgIndex === 0 ? 'active' : ''}`;
            
            const img = document.createElement('img');
            img.src = imageSrc;
            img.alt = `${gallery.config.roomName}-圖片-${imgIndex + 1}`;
            img.loading = 'lazy';
            
            img.onerror = () => {
                console.warn(`圖片載入失敗: ${imageSrc}`);
                slideDiv.style.display = 'none';
            };
            
            slideDiv.appendChild(img);
            sliderDiv.appendChild(slideDiv);
        });
        
        container.appendChild(sliderDiv);
        
        if (images.length > 1) {
            const navDiv = document.createElement('div');
            navDiv.className = 'slider-nav';
            
            const prevBtn = document.createElement('button');
            prevBtn.className = 'prev-btn';
            prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            
            const nextBtn = document.createElement('button');
            nextBtn.className = 'next-btn';
            nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            
            navDiv.appendChild(prevBtn);
            navDiv.appendChild(nextBtn);
            container.appendChild(navDiv);
            
            const indicatorsDiv = document.createElement('div');
            indicatorsDiv.className = 'slide-indicators';
            
            images.forEach((_, imgIndex) => {
                const indicator = document.createElement('span');
                indicator.className = `indicator ${imgIndex === 0 ? 'active' : ''}`;
                indicator.setAttribute('data-slide', imgIndex);
                indicatorsDiv.appendChild(indicator);
            });
            
            container.appendChild(indicatorsDiv);
        }
        
        if (roomType === 'luxuryFamily') {
            const badge = document.createElement('div');
            badge.className = 'room-badge';
            badge.textContent = '推薦';
            container.appendChild(badge);
        }
    }
}

// 初始化動態房型圖片庫
document.addEventListener('DOMContentLoaded', () => {
    new DynamicRoomGallery();
}); 