// ==========================================================================
// Main JavaScript - 主要 JavaScript 功能 (優化版)
// ==========================================================================

// 緩存關鍵DOM元素和尺寸，避免重複查詢
const DOMCache = {
    navbar: null,
    navToggle: null,
    navMenu: null,
    navLinks: null,
    navbarHeight: 80,
    viewportWidth: window.innerWidth,
    init() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // 初始化DOM緩存
    DOMCache.init();
    
    // Initialize AOS Animation - 手機版性能優化
    initAOSOptimized();

    // Navigation functionality
    initNavigation();
    
    // Smooth scrolling for anchor links
    initSmoothScrolling();
    
    // Hero scroll indicator
    initHeroScrollIndicator();
    
    // Dynamic copyright year
    updateCopyrightYear();
    
    // FAQ functionality
    if (document.querySelector('.faq-question')) {
        initFAQ();
    }
    
    // Room slider functionality
    if (document.querySelector('.room-slider')) {
        initRoomSlider();
    }
    
    // Image lightbox functionality
    if (document.querySelector('.room-gallery')) {
        initImageLightbox();
    }
    
    // Room gallery swipe functionality for mobile
    if (document.querySelector('.room-gallery')) {
        initRoomGallerySwipe();
    }
    
    // Room direct navigation functionality - 延遲執行確保所有元素都已載入
    setTimeout(() => {
        initRoomNavigation();
    }, 100);
    
    // 視窗大小變化監聽 - 防抖處理
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            DOMCache.viewportWidth = window.innerWidth;
            handleResize();
        }, 250);
    }, { passive: true });
});

// 優化的AOS初始化 - 手機版性能考量
function initAOSOptimized() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: DOMCache.viewportWidth < 768 ? 400 : 800, // 手機版使用更短動畫
            easing: 'ease-in-out',
            once: true,
            offset: DOMCache.viewportWidth < 768 ? 50 : 100, // 手機版提早觸發
            disable: function() {
                // 在非常小螢幕或低性能設備上禁用
                return window.innerWidth < 480 || 
                       (navigator.connection && navigator.connection.effectiveType === 'slow');
            }
        });
    } else {
        // Wait for AOS to load - 優化輪詢
        let checkCount = 0;
        const checkAOS = setInterval(function() {
            checkCount++;
            if (typeof AOS !== 'undefined' || checkCount > 100) { // 最多檢查5秒
                clearInterval(checkAOS);
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        duration: DOMCache.viewportWidth < 768 ? 400 : 800,
                        easing: 'ease-in-out',
                        once: true,
                        offset: DOMCache.viewportWidth < 768 ? 50 : 100,
                        disable: function() {
                            return window.innerWidth < 480 || 
                                   (navigator.connection && navigator.connection.effectiveType === 'slow');
                        }
                    });
                }
            }
        }, 50);
    }
}

// 視窗大小變化處理函數
function handleResize() {
    if (DOMCache.viewportWidth > 768) {
        // 桌面版時確保移除行動版選單的樣式限制
        if (DOMCache.navToggle && DOMCache.navMenu) {
            DOMCache.navToggle.classList.remove('active');
            DOMCache.navMenu.classList.remove('active');
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }
        
        // 桌面版時移除手機版滑動指示器
        const indicators = document.querySelectorAll('.gallery-indicators');
        indicators.forEach(indicator => {
            indicator.remove();
        });
    } else {
        // 手機版時重新初始化滑動功能
        if (document.querySelector('.room-gallery')) {
            initRoomGallerySwipe();
        }
    }
}

// Navigation functionality - 優化版
function initNavigation() {
    const { navbar, navToggle, navMenu, navLinks } = DOMCache;

    // Mobile menu toggle - 優化事件處理
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const isActive = navMenu.classList.contains('active');
            
            // 使用requestAnimationFrame批處理DOM操作
            requestAnimationFrame(() => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                
                // 批處理body樣式更改
                if (!isActive) {
                    Object.assign(document.body.style, {
                        overflow: 'hidden',
                        position: 'fixed',
                        width: '100%'
                    });
                } else {
                    Object.assign(document.body.style, {
                        overflow: '',
                        position: '',
                        width: ''
                    });
                }
            });
        });

        // Close mobile menu when clicking on nav links - 優化
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                requestAnimationFrame(() => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    Object.assign(document.body.style, {
                        overflow: '',
                        position: '',
                        width: ''
                    });
                });
            });
        });

        // Close mobile menu when clicking outside - 優化
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                requestAnimationFrame(() => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                    Object.assign(document.body.style, {
                        overflow: '',
                        position: '',
                        width: ''
                    });
                });
            }
        });
    }

    // Navbar scroll effect - 優化重排，使用IntersectionObserver
    if (navbar) {
        let isScrolling = false;
        let ticking = false;
        
        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    if (window.pageYOffset > 50) {
                        navbar.classList.add('scrolled');
                    } else {
                        navbar.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };
        
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }

    // Active nav link highlighting - 優化
    function updateActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        requestAnimationFrame(() => {
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref === currentPage || 
                    (currentPage === '' && linkHref === 'index.html')) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        });
    }
    
    updateActiveNavLink();
}

// Smooth scrolling for anchor links - 優化重排
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // 批處理計算，避免強制重排
                requestAnimationFrame(() => {
                    const rect = targetElement.getBoundingClientRect();
                    const offsetTop = rect.top + window.pageYOffset - DOMCache.navbarHeight;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                });
            }
        });
    });
}

// Hero scroll indicator - 優化重排
function initHeroScrollIndicator() {
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('#quick-intro') || 
                              document.querySelector('section:nth-of-type(2)');
            
            if (nextSection) {
                // 批處理計算，避免強制重排
                requestAnimationFrame(() => {
                    const rect = nextSection.getBoundingClientRect();
                    const offsetTop = rect.top + window.pageYOffset - DOMCache.navbarHeight;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                });
            }
        });
    }
}

// FAQ Accordion functionality
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.closest('.faq-item');
            const answer = faqItem.querySelector('.faq-answer');
            const isActive = this.classList.contains('active');
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== this) {
                    otherQuestion.classList.remove('active');
                    const otherAnswer = otherQuestion.closest('.faq-item').querySelector('.faq-answer');
                    otherAnswer.classList.remove('active');
                }
            });
            
            // Toggle current FAQ item
            if (!isActive) {
                this.classList.add('active');
                answer.classList.add('active');
            } else {
                this.classList.remove('active');
                answer.classList.remove('active');
            }
        });
    });
    
    // FAQ category filtering
    const categoryBtns = document.querySelectorAll('.category-btn');
    
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active button
            categoryBtns.forEach(otherBtn => otherBtn.classList.remove('active'));
            this.classList.add('active');
            
            // Filter FAQ items
            const faqItems = document.querySelectorAll('.faq-item');
            
            faqItems.forEach(item => {
                const itemCategory = item.dataset.category;
                
                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'block';
                    item.style.animation = 'fadeInUp 0.5s ease forwards';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Room slider functionality - 優化版
function initRoomSlider() {
    const sliders = document.querySelectorAll('.room-slider');
    
    sliders.forEach(slider => {
        const container = slider.querySelector('.slider-container');
        const items = slider.querySelectorAll('.slider-item');
        const prevBtn = slider.querySelector('.slider-btn.prev');
        const nextBtn = slider.querySelector('.slider-btn.next');
        
        let currentIndex = 0;
        let isAnimating = false; // 防止快速點擊
        
        function updateSlider() {
            if (isAnimating) return;
            isAnimating = true;
            
            // 使用requestAnimationFrame批處理transform操作
            requestAnimationFrame(() => {
                const translateX = -currentIndex * 100;
                container.style.transform = `translateX(${translateX}%)`;
                
                // 重置動畫標記
                setTimeout(() => {
                    isAnimating = false;
                }, 300);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                if (!isAnimating) {
                    currentIndex = (currentIndex + 1) % items.length;
                    updateSlider();
                }
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                if (!isAnimating) {
                    currentIndex = (currentIndex - 1 + items.length) % items.length;
                    updateSlider();
                }
            });
        }
        
        // Auto-play slider - 優化記憶體管理
        let autoPlayInterval;
        
        function startAutoPlay() {
            if (autoPlayInterval) clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(() => {
                if (!isAnimating && DOMCache.viewportWidth >= 768) { // 只在桌面版自動播放
                    currentIndex = (currentIndex + 1) % items.length;
                    updateSlider();
                }
            }, 5000);
        }
        
        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }
        
        // 只在桌面版啟用自動播放
        if (DOMCache.viewportWidth >= 768) {
            startAutoPlay();
            
            // Pause auto-play on hover - 只在桌面版
            slider.addEventListener('mouseenter', stopAutoPlay);
            slider.addEventListener('mouseleave', startAutoPlay);
        }
        
        // 頁面不可見時停止自動播放
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoPlay();
            } else if (DOMCache.viewportWidth >= 768) {
                startAutoPlay();
            }
        });
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading state management
function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-overlay';
    loadingElement.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner fa-spin"></i>
            <p>載入中...</p>
        </div>
    `;
    document.body.appendChild(loadingElement);
}

function hideLoading() {
    const loadingElement = document.querySelector('.loading-overlay');
    if (loadingElement) {
        loadingElement.remove();
    }
}

// Form validation (for future contact forms)
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

// Performance optimization
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if supported
if ('IntersectionObserver' in window) {
    document.addEventListener('DOMContentLoaded', lazyLoadImages);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // Optional: Send error to analytics or logging service
    // analytics.track('JavaScript Error', { message: e.message, filename: e.filename, lineno: e.lineno });
});

// Image Lightbox functionality
function initImageLightbox() {
    const galleryImages = document.querySelectorAll('.room-gallery img');
    
    // Create lightbox modal
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox-modal';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-labelledby', 'lightbox-caption');
    lightbox.innerHTML = `
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
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-caption" id="lightbox-caption"></div>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    let currentImageIndex = 0;
    let currentGalleryImages = [];
    let previouslyFocusedElement = null;
    let focusableElements = [];
    let firstFocusableElement = null;
    let lastFocusableElement = null;
    
    // Add click listeners to all gallery images
    galleryImages.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-label', `查看圖片：${img.alt || '房型圖片'}`);
        
        img.addEventListener('click', function() {
            previouslyFocusedElement = this;
            openLightboxForImage(this);
        });
        
        // 支援鍵盤操作
        img.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                previouslyFocusedElement = this;
                openLightboxForImage(this);
            }
        });
    });
    
    function openLightboxForImage(triggerImage) {
        // Find all images in the same room gallery
        const roomCard = triggerImage.closest('.room-card');
        currentGalleryImages = Array.from(roomCard.querySelectorAll('.room-gallery img'));
        currentImageIndex = currentGalleryImages.indexOf(triggerImage);
        
        openLightbox();
    }
    
    function openLightbox() {
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // 設定焦點陷阱
        setupFocusTrap();
        
        // 將焦點設定到關閉按鈕
        setTimeout(() => {
            firstFocusableElement.focus();
        }, 100);
    }
    
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        
        // 將焦點還原到觸發元素
        if (previouslyFocusedElement) {
            previouslyFocusedElement.focus();
        }
    }
    
    function setupFocusTrap() {
        // 找到所有可聚焦的元素
        focusableElements = lightbox.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            firstFocusableElement = focusableElements[0];
            lastFocusableElement = focusableElements[focusableElements.length - 1];
        }
    }
    
    function handleFocusTrap(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Tab') {
            if (e.shiftKey) { // Shift + Tab
                if (document.activeElement === firstFocusableElement) {
                    e.preventDefault();
                    lastFocusableElement.focus();
                }
            } else { // Tab
                if (document.activeElement === lastFocusableElement) {
                    e.preventDefault();
                    firstFocusableElement.focus();
                }
            }
        }
    }
    
    function updateLightboxImage() {
        const currentImg = currentGalleryImages[currentImageIndex];
        const lightboxImg = lightbox.querySelector('.lightbox-image');
        const caption = lightbox.querySelector('.lightbox-caption');
        
        lightboxImg.src = currentImg.src;
        lightboxImg.alt = currentImg.alt;
        caption.textContent = currentImg.alt;
        
        // Update navigation buttons visibility
        const prevBtn = lightbox.querySelector('.lightbox-prev');
        const nextBtn = lightbox.querySelector('.lightbox-next');
        
        prevBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
        nextBtn.style.display = currentGalleryImages.length > 1 ? 'block' : 'none';
    }
    
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateLightboxImage();
    }
    
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryImages.length;
        updateLightboxImage();
    }
    
    // Event listeners
    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-overlay').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', showPrevImage);
    lightbox.querySelector('.lightbox-next').addEventListener('click', showNextImage);
    
    // 焦點陷阱事件監聽器
    document.addEventListener('keydown', handleFocusTrap);
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                closeLightbox();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                if (currentGalleryImages.length > 1) {
                    showPrevImage();
                }
                break;
            case 'ArrowRight':
                e.preventDefault();
                if (currentGalleryImages.length > 1) {
                    showNextImage();
                }
                break;
        }
    });
    
    // Prevent image drag
    lightbox.querySelector('.lightbox-image').addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
    
    // Touch swipe functionality for lightbox
    initLightboxSwipe(lightbox);
    
    // Touch swipe functionality for lightbox
    function initLightboxSwipe(lightbox) {
        const lightboxContainer = lightbox.querySelector('.lightbox-container');
        let startX = 0;
        let startY = 0;
        let distX = 0;
        let distY = 0;
        let startTime = 0;
        let elapsedTime = 0;
        const threshold = 50; // 最小滑動距離
        const restraint = 100; // 垂直方向最大偏移
        const allowedTime = 500; // 最大滑動時間
        
        lightboxContainer.addEventListener('touchstart', function(e) {
            if (!lightbox.classList.contains('active') || currentGalleryImages.length <= 1) return;
            
            const touchObj = e.changedTouches[0];
            startX = touchObj.pageX;
            startY = touchObj.pageY;
            startTime = new Date().getTime();
        }, { passive: true });
        
        lightboxContainer.addEventListener('touchmove', function(e) {
            if (!lightbox.classList.contains('active') || currentGalleryImages.length <= 1) return;
            
            // 防止頁面滾動
            e.preventDefault();
        });
        
        lightboxContainer.addEventListener('touchend', function(e) {
            if (!lightbox.classList.contains('active') || currentGalleryImages.length <= 1) return;
            
            const touchObj = e.changedTouches[0];
            distX = touchObj.pageX - startX;
            distY = touchObj.pageY - startY;
            elapsedTime = new Date().getTime() - startTime;
            
            // 檢查是否為有效滑動
            if (elapsedTime <= allowedTime && Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                if (distX > 0) {
                    // 向右滑動 - 上一張圖片
                    showPrevImage();
                } else {
                    // 向左滑動 - 下一張圖片
                    showNextImage();
                }
            }
        }, { passive: false });
        
        // 滑鼠事件支援（桌面版測試用）
        let isMouseDown = false;
        let mouseStartX = 0;
        let mouseStartY = 0;
        
        lightboxContainer.addEventListener('mousedown', function(e) {
            if (!lightbox.classList.contains('active') || currentGalleryImages.length <= 1) return;
            
            isMouseDown = true;
            mouseStartX = e.pageX;
            mouseStartY = e.pageY;
            startTime = new Date().getTime();
            e.preventDefault();
        });
        
        lightboxContainer.addEventListener('mousemove', function(e) {
            if (!isMouseDown || !lightbox.classList.contains('active') || currentGalleryImages.length <= 1) return;
            
            e.preventDefault();
        });
        
        lightboxContainer.addEventListener('mouseup', function(e) {
            if (!isMouseDown || !lightbox.classList.contains('active') || currentGalleryImages.length <= 1) return;
            
            isMouseDown = false;
            distX = e.pageX - mouseStartX;
            distY = e.pageY - mouseStartY;
            elapsedTime = new Date().getTime() - startTime;
            
            // 檢查是否為有效滑動
            if (elapsedTime <= allowedTime && Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
                if (distX > 0) {
                    // 向右滑動 - 上一張圖片
                    showPrevImage();
                } else {
                    // 向左滑動 - 下一張圖片
                    showNextImage();
                }
            }
        });
        
        lightboxContainer.addEventListener('mouseleave', function() {
            isMouseDown = false;
        });
    }
}

// Service Worker registration with version management
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('✅ Service Worker 註冊成功');
                
                // 檢查是否有新版本
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 發現 Service Worker 新版本...');
                    const newWorker = registration.installing;
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🎯 新版本 Service Worker 已安裝，準備更新...');
                            
                            // 可以在這裡顯示更新提示給用戶
                            // showUpdateNotification();
                            
                            // 自動跳過等待，立即激活新版本
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                        }
                    });
                });
                
                // 監聽 Service Worker 控制權變化
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    console.log('🔄 Service Worker 控制權已更新，即將重新載入頁面...');
                    // 延遲重新載入，避免打斷用戶操作
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                });
                
                // 獲取當前版本信息
                if (navigator.serviceWorker.controller) {
                    const messageChannel = new MessageChannel();
                    messageChannel.port1.onmessage = (event) => {
                        if (event.data.version) {
                            console.log('📋 當前 Service Worker 版本:', event.data.version);
                        }
                    };
                    navigator.serviceWorker.controller.postMessage(
                        { type: 'GET_VERSION' }, 
                        [messageChannel.port2]
                    );
                }
            })
            .catch(function(error) {
                console.error('❌ Service Worker 註冊失敗:', error);
            });
    });
}

// Dynamic copyright year function
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.copyright-year');
    
    copyrightElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// Room Gallery Swipe functionality for mobile
function initRoomGallerySwipe() {
    // 只在手機版啟用滑動功能
    if (DOMCache.viewportWidth > 768) return;
    
    const roomGalleries = document.querySelectorAll('.room-gallery');
    
    roomGalleries.forEach(gallery => {
        const galleryItems = gallery.querySelectorAll('.gallery-item');
        
        // 如果只有一張圖片，不需要滑動功能
        if (galleryItems.length <= 1) return;
        
        // 創建指示器
        createGalleryIndicators(gallery, galleryItems.length);
        
        // 初始化滑動功能
        initGallerySwipe(gallery, galleryItems);
        
        // 監聽滾動事件以更新指示器
        gallery.addEventListener('scroll', debounce(() => {
            updateActiveIndicator(gallery);
        }, 100), { passive: true });
    });
}

function createGalleryIndicators(gallery, count) {
    // 檢查是否已存在指示器
    if (gallery.querySelector('.gallery-indicators')) return;
    
    const indicatorsContainer = document.createElement('div');
    indicatorsContainer.className = 'gallery-indicators';
    
    for (let i = 0; i < count; i++) {
        const indicator = document.createElement('div');
        indicator.className = `gallery-indicator ${i === 0 ? 'active' : ''}`;
        indicatorsContainer.appendChild(indicator);
    }
    
    gallery.appendChild(indicatorsContainer);
}

function initGallerySwipe(gallery, galleryItems) {
    let startX = 0;
    let scrollLeft = 0;
    let isScrolling = false;
    
    // 觸摸開始
    gallery.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        scrollLeft = gallery.scrollLeft;
        isScrolling = true;
        gallery.style.scrollBehavior = 'auto';
    }, { passive: true });
    
    // 觸摸移動
    gallery.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        
        const x = e.touches[0].pageX;
        const walk = (x - startX) * 1.5; // 滑動敏感度
        gallery.scrollLeft = scrollLeft - walk;
    }, { passive: true });
    
    // 觸摸結束
    gallery.addEventListener('touchend', () => {
        isScrolling = false;
        gallery.style.scrollBehavior = 'smooth';
        
        // 滑動到最接近的圖片
        snapToNearestImage(gallery, galleryItems);
    }, { passive: true });
    
    // 滑鼠事件（桌面版測試用）
    gallery.addEventListener('mousedown', (e) => {
        startX = e.pageX;
        scrollLeft = gallery.scrollLeft;
        isScrolling = true;
        gallery.style.scrollBehavior = 'auto';
        e.preventDefault();
    });
    
    gallery.addEventListener('mousemove', (e) => {
        if (!isScrolling) return;
        
        const x = e.pageX;
        const walk = (x - startX) * 1.5;
        gallery.scrollLeft = scrollLeft - walk;
        e.preventDefault();
    });
    
    gallery.addEventListener('mouseup', () => {
        isScrolling = false;
        gallery.style.scrollBehavior = 'smooth';
        snapToNearestImage(gallery, galleryItems);
    });
    
    gallery.addEventListener('mouseleave', () => {
        isScrolling = false;
        gallery.style.scrollBehavior = 'smooth';
    });
}

function snapToNearestImage(gallery, galleryItems) {
    const galleryWidth = gallery.offsetWidth;
    const scrollLeft = gallery.scrollLeft;
    const imageIndex = Math.round(scrollLeft / galleryWidth);
    
    // 確保索引在有效範圍內
    const targetIndex = Math.max(0, Math.min(imageIndex, galleryItems.length - 1));
    const targetScrollLeft = targetIndex * galleryWidth;
    
    // 滑動到目標位置
    gallery.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
    });
    
    // 更新指示器
    setTimeout(() => {
        updateActiveIndicator(gallery);
    }, 100);
}

function updateActiveIndicator(gallery) {
    const indicators = gallery.querySelectorAll('.gallery-indicator');
    if (indicators.length === 0) return;
    
    const galleryWidth = gallery.offsetWidth;
    const scrollLeft = gallery.scrollLeft;
    const activeIndex = Math.round(scrollLeft / galleryWidth);
    
    // 更新指示器樣式
    indicators.forEach((indicator, index) => {
        if (index === activeIndex) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    });
}

// Room Navigation - 房間直接跳轉功能
function initRoomNavigation() {
    // 只在房型頁面執行
    if (!window.location.pathname.includes('rooms') && !document.querySelector('.rooms-section')) {
        return;
    }
    
    console.log('房間跳轉調試:', { 
        path: window.location.pathname, 
        hash: window.location.hash,
        search: window.location.search,
        currentURL: window.location.href 
    });
    
    // 檢查當前URL錨點或查詢參數
    function checkRoomNavigation() {
        const hash = window.location.hash;
        const urlParams = new URLSearchParams(window.location.search);
        const gotoParam = urlParams.get('goto');
        
        let targetRoomId = null;
        let roomNumber = null;
        
        console.log('房間導航調試 - URL資訊:', {
            hash: hash,
            gotoParam: gotoParam,
            search: window.location.search,
            pathname: window.location.pathname
        });
        
        // 優先檢查查詢參數（從 Cloudflare Pages 重定向）
        if (gotoParam) {
            roomNumber = gotoParam;
            targetRoomId = 'room-' + roomNumber;
            console.log('檢測到房間查詢參數:', gotoParam, '目標ID:', targetRoomId);
            
            // 更新URL為錨點形式，移除查詢參數
            const newUrl = window.location.pathname + '#' + targetRoomId;
            history.replaceState(null, '', newUrl);
        }
        // 檢查是否有房間錨點
        else if (hash && hash.includes('room-')) {
            targetRoomId = hash.substring(1); // 移除 # 符號
            roomNumber = targetRoomId.replace('room-', '');
            console.log('檢測到房間錨點:', targetRoomId);
        }
        
        if (targetRoomId && roomNumber) {
            console.log('開始處理房間導航 - 房號:', roomNumber, '目標ID:', targetRoomId);
            
            // 檢查所有可用的房間元素
            const allRoomCards = document.querySelectorAll('.room-card[id]');
            console.log('頁面中找到的房間卡片:', Array.from(allRoomCards).map(el => el.id));
            
            // 先嘗試直接找到目標房間
            let targetRoom = document.getElementById(targetRoomId);
            
            // 如果找不到直接的房間ID，檢查房號對應關係
            if (!targetRoom) {
                console.log('未找到直接房間ID，檢查房號對應關係:', roomNumber);
                
                // 房號對應關係處理
                switch(roomNumber) {
                    case '201':
                        targetRoom = document.getElementById('room-201');
                        break;
                    case '203':
                        targetRoom = document.getElementById('room-203');
                        break;
                    case '205':
                        targetRoom = document.getElementById('room-205');
                        break;
                    case '301':
                        targetRoom = document.getElementById('room-301');
                        break;
                    case '302':
                        // 302 跳轉到 301 房間卡片
                        targetRoom = document.getElementById('room-301');
                        console.log('房號302重定向到room-301');
                        break;
                    case '303':
                        targetRoom = document.getElementById('room-303');
                        break;
                    case '305':
                        targetRoom = document.getElementById('room-305');
                        break;
                    case '306':
                    case '307':
                        // 306、307 跳轉到 305 房間卡片
                        targetRoom = document.getElementById('room-305');
                        console.log('房號' + roomNumber + '重定向到room-305');
                        break;
                    default:
                        console.log('未知房號:', roomNumber);
                        break;
                }
            }
            
            if (targetRoom) {
                console.log('找到目標房間元素:', targetRoom.id, targetRoom);
                
                // 等待所有動畫完成後執行滾動
                const executeScroll = () => {
                    // 確保元素在視窗內可見
                    if (targetRoom.offsetHeight === 0) {
                        console.log('目標元素尚未完全載入，再次延遲');
                        setTimeout(executeScroll, 200);
                        return;
                    }
                    
                    // 檢查是否需要等待動畫
                    const isMobile = window.innerWidth < 768;
                    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                    
                    // 只有桌面版且非減少動畫模式才需要檢查動畫
                    if (!isMobile && !prefersReducedMotion) {
                        const isAnimationComplete = () => {
                            const style = window.getComputedStyle(targetRoom);
                            const opacity = parseFloat(style.opacity);
                            const transform = style.transform;
                            
                            // 檢查元素是否已完全顯示（opacity=1）且無位移變換
                            return opacity === 1 && (transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)');
                        };
                        
                        if (!isAnimationComplete()) {
                            console.log('動畫尚未完成，延遲執行滾動');
                            setTimeout(executeScroll, 200);
                            return;
                        }
                    } else {
                        console.log('減少動畫模式啟用，跳過動畫檢測');
                    }
                    
                    scrollToRoom(targetRoom);
                    console.log('動畫完成，成功執行滾動到房間:', targetRoom.id);
                };
                
                // 智能延遲：考慮設備類型和動畫設定
                const isMobile = window.innerWidth < 768;
                const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                
                let initialDelay;
                if (prefersReducedMotion || isMobile) {
                    initialDelay = 300; // 手機版或減少動畫模式：快速執行
                } else {
                    initialDelay = 800; // 桌面版：等待動畫完成
                }
                
                console.log('設定延遲執行時間:', initialDelay, 'ms (手機版:', isMobile, ', 減少動畫:', prefersReducedMotion, ')');
                
                setTimeout(executeScroll, initialDelay);
                
                // 終極備用執行，確保功能一定會運行
                setTimeout(() => {
                    if (!targetRoom.classList.contains('highlighted')) {
                        console.log('終極備用滾動執行');
                        scrollToRoom(targetRoom);
                    }
                }, isMobile ? 1500 : 2500);
                
            } else {
                console.log('找不到對應的房間元素，房號:', roomNumber);
                console.log('可能的解決方案：檢查房間ID是否正確');
            }
        } else {
            console.log('沒有檢測到需要跳轉的房間');
        }
    }
    
    // 平滑滾動到房間卡片
    function scrollToRoom(roomElement) {
        console.log('執行滾動到房間:', roomElement.id);
        
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 80;
        const isMobile = window.innerWidth < 768;
        
        // 強制重新計算佈局，確保動畫完成後的準確位置
        roomElement.offsetHeight; // 觸發重排
        
        // 計算滾動位置 - 手機版使用更保守的間距
        const elementRect = roomElement.getBoundingClientRect();
        const elementTop = elementRect.top + window.pageYOffset;
        const extraMargin = isMobile ? 50 : 30; // 手機版留更多間距
        const offsetTop = Math.max(0, elementTop - navbarHeight - extraMargin);
        
        console.log('滾動計算 (手機版: ' + isMobile + '):', {
            elementRect: elementRect,
            elementTop: elementTop,
            navbarHeight: navbarHeight,
            extraMargin: extraMargin,
            offsetTop: offsetTop,
            currentScroll: window.pageYOffset
        });
        
        // 檢查是否已在視窗內 - 手機版使用更寬鬆的條件
        const currentScroll = window.pageYOffset;
        const viewportBuffer = isMobile ? 100 : 50;
        const targetInView = elementRect.top >= -viewportBuffer && 
                           elementRect.bottom <= window.innerHeight + viewportBuffer;
        
        if (targetInView && Math.abs(currentScroll - offsetTop) < viewportBuffer) {
            console.log('房間已在視窗內，直接高亮');
            highlightRoom(roomElement);
            return;
        }
        
        // 執行平滑滾動
        try {
            console.log('執行滾動 - 從', currentScroll, '到', offsetTop);
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
            
            // 手機版等待更長時間讓滾動完成
            const scrollDelay = isMobile ? 1200 : 800;
            
            setTimeout(() => {
                highlightRoom(roomElement);
                console.log('滾動完成，高亮房間');
            }, scrollDelay);
            
            // 備用檢查：手機版更頻繁檢查滾動狀態
            const checkInterval = isMobile ? 300 : 500;
            setTimeout(() => {
                const newScroll = window.pageYOffset;
                const scrollDifference = Math.abs(newScroll - offsetTop);
                
                if (scrollDifference > (isMobile ? 80 : 50)) {
                    console.log('滾動位置不準確，重新計算並滾動');
                    
                    // 重新計算位置
                    const newRect = roomElement.getBoundingClientRect();
                    const newTop = newRect.top + window.pageYOffset;
                    const correctedTop = Math.max(0, newTop - navbarHeight - extraMargin);
                    
                    window.scrollTo({
                        top: correctedTop,
                        behavior: 'smooth'
                    });
                    
                    setTimeout(() => {
                        highlightRoom(roomElement);
                    }, scrollDelay / 2);
                }
            }, scrollDelay + 200);
            
        } catch (error) {
            console.error('滾動執行錯誤:', error);
            // 降級處理：使用立即滾動
            window.scrollTo(0, offsetTop);
            setTimeout(() => {
                highlightRoom(roomElement);
            }, 100);
        }
    }
    
    // 高亮房間卡片
    function highlightRoom(roomElement) {
        // 移除其他房間的高亮
        const allRooms = document.querySelectorAll('.room-card');
        allRooms.forEach(room => {
            room.classList.remove('highlighted');
        });
        
        // 添加高亮效果
        roomElement.classList.add('highlighted');
        
        // 3秒後移除高亮
        setTimeout(() => {
            roomElement.classList.remove('highlighted');
        }, 3000);
    }
    
    // 處理瀏覽器歷史記錄變化
    window.addEventListener('popstate', checkRoomNavigation);
    
    // 處理錨點變化
    window.addEventListener('hashchange', checkRoomNavigation);
    
    // 頁面載入時檢查
    checkRoomNavigation();
} 