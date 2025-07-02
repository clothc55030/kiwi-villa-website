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

// Error handling
window.addEventListener('error', function(e) {
    // 只在開發環境中顯示錯誤
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.error('JavaScript error:', e.error);
    }
});

// Dynamic copyright year function
function updateCopyrightYear() {
    const currentYear = new Date().getFullYear();
    const copyrightElements = document.querySelectorAll('.copyright-year');
    
    copyrightElements.forEach(element => {
        element.textContent = currentYear;
    });
}

// Room Navigation functionality
function initRoomNavigation() {
    // 獲取所有房間編號的查詢參數
    const urlParams = new URLSearchParams(window.location.search);
    const roomNumber = urlParams.get('room');
    
    // 如果有房間編號參數，滾動到對應房間
    if (roomNumber) {
        const targetRoom = document.getElementById(`room-${roomNumber}`);
        if (targetRoom) {
            // 延遲執行以確保頁面完全載入
            setTimeout(() => {
                requestAnimationFrame(() => {
                    const rect = targetRoom.getBoundingClientRect();
                    const offsetTop = rect.top + window.pageYOffset - DOMCache.navbarHeight - 20;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                    
                    // 添加高亮效果
                    targetRoom.classList.add('room-highlight');
                    setTimeout(() => {
                        targetRoom.classList.remove('room-highlight');
                    }, 3000);
                });
            }, 500);
        }
    }
    
    // 處理 URL hash 跳轉（例如 #room-201）
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            setTimeout(() => {
                requestAnimationFrame(() => {
                    const rect = targetElement.getBoundingClientRect();
                    const offsetTop = rect.top + window.pageYOffset - DOMCache.navbarHeight - 20;
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                });
            }, 500);
        }
    }
}