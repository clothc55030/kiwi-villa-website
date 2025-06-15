// ==========================================================================
// Main JavaScript - 主要 JavaScript 功能
// ==========================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS Animation - 延遲載入後初始化
    initAOSWhenReady();

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
});

// Initialize AOS when it's loaded
function initAOSWhenReady() {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    } else {
        // Wait for AOS to load
        const checkAOS = setInterval(function() {
            if (typeof AOS !== 'undefined') {
                clearInterval(checkAOS);
                AOS.init({
                    duration: 800,
                    easing: 'ease-in-out',
                    once: true,
                    offset: 100
                });
            }
        }, 50);
        
        // Fallback timeout after 5 seconds
        setTimeout(function() {
            clearInterval(checkAOS);
        }, 5000);
    }
}

// Navigation functionality
function initNavigation() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isActive = navMenu.classList.contains('active');
            
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // 修正滾動問題：更明確地設定 body overflow
            if (!isActive) {
                // 開啟選單時禁止滾動
                document.body.style.overflow = 'hidden';
                document.body.style.position = 'fixed';
                document.body.style.width = '100%';
            } else {
                // 關閉選單時恢復滾動
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });

        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                // 確保恢復滾動功能
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                // 確保恢復滾動功能
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });

        // 處理視窗大小變化時的選單狀態
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                // 桌面版時確保移除行動版選單的樣式限制
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.width = '';
            }
        });
    }

    // Navbar scroll effect
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Active nav link highlighting
    function updateActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPage || 
                (currentPage === '' && linkHref === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    updateActiveNavLink();
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Hero scroll indicator
function initHeroScrollIndicator() {
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const nextSection = document.querySelector('#quick-intro') || 
                              document.querySelector('section:nth-of-type(2)');
            
            if (nextSection) {
                const offsetTop = nextSection.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
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

// Room slider functionality
function initRoomSlider() {
    const sliders = document.querySelectorAll('.room-slider');
    
    sliders.forEach(slider => {
        const container = slider.querySelector('.slider-container');
        const items = slider.querySelectorAll('.slider-item');
        const prevBtn = slider.querySelector('.slider-btn.prev');
        const nextBtn = slider.querySelector('.slider-btn.next');
        
        let currentIndex = 0;
        
        function updateSlider() {
            const translateX = -currentIndex * 100;
            container.style.transform = `translateX(${translateX}%)`;
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % items.length;
                updateSlider();
            });
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + items.length) % items.length;
                updateSlider();
            });
        }
        
        // Auto-play slider
        let autoPlay = setInterval(function() {
            currentIndex = (currentIndex + 1) % items.length;
            updateSlider();
        }, 5000);
        
        // Pause auto-play on hover
        slider.addEventListener('mouseenter', function() {
            clearInterval(autoPlay);
        });
        
        slider.addEventListener('mouseleave', function() {
            autoPlay = setInterval(function() {
                currentIndex = (currentIndex + 1) % items.length;
                updateSlider();
            }, 5000);
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
}

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(error) {
                console.log('ServiceWorker registration failed');
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