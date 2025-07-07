// 導航功能模組
import { DOMCache } from './dom-cache.js';

// Navigation functionality - 優化版
export function initNavigation() {
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
export function initSmoothScrolling() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                
                // Get navbar height for offset
                const offset = DOMCache.navbarHeight + 20;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL hash without jumping
                history.pushState(null, null, targetId);
            }
        });
    });
}

// Hero scroll indicator
export function initHeroScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            const heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                window.scrollTo({
                    top: heroBottom - DOMCache.navbarHeight,
                    behavior: 'smooth'
                });
            }
        });
    }
}