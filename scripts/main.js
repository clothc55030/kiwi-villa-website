// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // For anchor links, we let smooth scrolling handle it
                if (link.getAttribute('href').charAt(0) === '#') {
                    e.preventDefault();
                }
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (navMenu.classList.contains('active') && !hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (header) { // Check if header exists
        if (window.scrollY > 50) { // Change effect at 50px scroll
            header.style.background = 'rgba(255, 255, 255, 0.6)';
            header.style.backdropFilter = 'blur(10px)';
            header.style.webkitBackdropFilter = 'blur(10px)';
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'transparent';
            header.style.backdropFilter = 'none';
            header.style.webkitBackdropFilter = 'none';
            header.style.boxShadow = 'none';
        }
    }
});

// Intersection Observer for fade-in animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .contact-item, .review-card, .room-card, .contact-info, .footer, .equipment-card, .advantage-card, .transport-card');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'  // 增加一些邊距，讓動畫觸發更早
        });

        animatedElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    } else {
        // Fallback for older browsers
        animatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }
});

// Add CSS for the animation states
const style = document.createElement('style');
style.textContent = `
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }
    .animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* 特別為底部區域設定動畫 */
    .contact-info.animate-on-scroll {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s ease-out, transform 0.8s ease-out;
    }
    .contact-info.animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    .footer.animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.7s ease-out, transform 0.7s ease-out;
    }
    .footer.animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* 為聯絡項目添加交錯動畫延遲 */
    .contact-item.animate-on-scroll:nth-child(1) {
        transition-delay: 0.1s;
    }
    .contact-item.animate-on-scroll:nth-child(2) {
        transition-delay: 0.2s;
    }
    .contact-item.animate-on-scroll:nth-child(3) {
        transition-delay: 0.3s;
    }
`;
document.head.appendChild(style);

// Form validation (for future booking form)
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });

    return isValid;
}

// Utility function for formatting phone numbers
function formatPhoneNumber(input) {
    const phoneNumber = input.value.replace(/\D/g, '');
    const formattedNumber = phoneNumber.replace(/(\d{4})(\d{3})(\d{3})/, '$1-$2-$3');
    input.value = formattedNumber;
}

// Loading animation
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// Auto-update copyright year
function updateCopyrightYear() {
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}
document.addEventListener('DOMContentLoaded', updateCopyrightYear);

// Scroll to top button
document.addEventListener('DOMContentLoaded', () => {
    const button = document.createElement('button');
    button.innerHTML = '<i class="fas fa-chevron-up"></i>';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', '回到頂部');
    document.body.appendChild(button);
    
    // Add styles for the button
    const buttonStyle = document.createElement('style');
    buttonStyle.textContent = `
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background: var(--primary-color, #4A90E2);
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateY(20px);
        }
        .scroll-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        .scroll-to-top:hover {
            background: var(--secondary-color, #2C5282);
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(buttonStyle);
    
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
});

// Contact form handling (placeholder for future implementation)
function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    
    if (validateForm(form)) {
        // Show success message
        showNotification('訊息已送出，我們會盡快回覆您！', 'success');
        form.reset();
    } else {
        showNotification('請填寫所有必填欄位', 'error');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#48BB78';
            break;
        case 'error':
            notification.style.background = '#F56565';
            break;
        default:
            notification.style.background = '#4A90E2';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Image lazy loading for better performance
document.addEventListener('DOMContentLoaded', function() {
    if ('IntersectionObserver' in window) {
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

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Room URL navigation and highlighting
document.addEventListener('DOMContentLoaded', function() {
    // 房間號碼對應表
    const roomMap = {
        '201': '豪華家庭房',
        '203': '高級四人房', 
        '205': '奢華四人房',
        '303': '高級三人房',
        '302': '高級雙床房',
        '305': '高級雙人房'
    };

    // 獲取URL參數
    function getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    // 處理頁面加載時的房間定位
    function handleRoomNavigation() {
        // 檢查URL參數中的room值
        const roomNumber = getUrlParameter('room');
        
        // 也檢查hash（向後兼容）
        const hash = window.location.hash.substring(1);
        const hashRoomNumber = hash.replace('room-', '');
        
        const targetRoom = roomNumber || hashRoomNumber;
        
        if (targetRoom && roomMap[targetRoom]) {
            setTimeout(() => {
                const roomElement = document.getElementById(`room-${targetRoom}`);
                if (roomElement) {
                    // 移除其他房間的高亮效果
                    document.querySelectorAll('.room-card').forEach(card => {
                        card.classList.remove('room-highlighted');
                    });
                    
                    // 添加高亮效果
                    roomElement.classList.add('room-highlighted');
                    
                    // 平滑滾動到房間卡片，智能避免被導航欄遮擋
                    const isMobile = window.innerWidth <= 768;
                    if (isMobile) {
                        // 手機版：動態計算導航欄高度並留出額外空間
                        const header = document.querySelector('.header');
                        const headerHeight = header ? header.offsetHeight : 80;
                        const extraPadding = 30; // 額外間距
                        
                        const elementRect = roomElement.getBoundingClientRect();
                        const scrollTop = window.pageYOffset + elementRect.top - headerHeight - extraPadding;
                        
                        window.scrollTo({
                            top: Math.max(0, scrollTop), // 確保不會滾動到負值
                            behavior: 'smooth'
                        });
                    } else {
                        // 桌面版：置中顯示
                        roomElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center'
                        });
                    }
                    
                    // 顯示成功提示
                    const roomName = roomMap[targetRoom];
                    showNotification(`已為您定位到：${roomName}`, 'success');
                    
                    // 更新URL為乾淨的hash格式（可選）
                    if (roomNumber) {
                        window.history.replaceState({}, '', `${window.location.pathname}#room-${targetRoom}`);
                    }
                }
            }, 300); // 稍微延遲以確保頁面完全加載
        }
    }

    // 監聽hash變化
    window.addEventListener('hashchange', handleRoomNavigation);
    
    // 頁面加載時檢查URL參數和hash
    handleRoomNavigation();
    
    // 添加房間高亮效果的樣式
    const roomHighlightStyle = document.createElement('style');
    roomHighlightStyle.textContent = `
        .room-highlighted {
            transform: scale(1.015);
            box-shadow: 0 12px 40px rgba(158, 158, 158, 0.25), 0 4px 12px rgba(158, 158, 158, 0.15);
            border: 1px solid rgba(183, 183, 183, 0.4);
            background: linear-gradient(135deg, rgba(248, 247, 244, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%);
            transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            z-index: 2;
        }
        
        .room-highlighted::after {
            content: '✓ 已為您定位';
            position: absolute;
            top: 15px;
            right: 15px;
            background: linear-gradient(135deg, #C4A69D 0%, #B39389 100%);
            color: #FFFFFF;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 0.85rem;
            font-weight: 500;
            letter-spacing: 0.5px;
            box-shadow: 0 4px 16px rgba(196, 166, 157, 0.4), 0 2px 8px rgba(179, 147, 137, 0.3);
            animation: morandi-appear 2.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 3;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        }
        
        @keyframes morandi-appear {
            0% {
                opacity: 0;
                transform: translateY(-15px) scale(0.85);
                filter: blur(4px);
            }
            40% {
                opacity: 0.8;
                transform: translateY(-5px) scale(0.95);
                filter: blur(2px);
            }
            70% {
                opacity: 1;
                transform: translateY(0) scale(1.05);
                filter: blur(0);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
                filter: blur(0);
            }
        }
        
        .room-highlighted .room-content h2 {
            color: #8B7B73;
            text-shadow: 0 2px 6px rgba(139, 123, 115, 0.2);
            transition: color 0.6s ease;
        }
        
        .room-highlighted .room-badge {
            background: linear-gradient(135deg, #D4C2B8, #B39389);
            color: #FFFFFF;
            animation: badge-gentle-glow 3s ease-out;
            box-shadow: 0 3px 12px rgba(196, 166, 157, 0.5);
        }
        
        @keyframes badge-gentle-glow {
            0%, 100% {
                box-shadow: 0 3px 12px rgba(196, 166, 157, 0.3);
            }
            50% {
                box-shadow: 0 6px 20px rgba(196, 166, 157, 0.6);
            }
        }
        
        /* 手機版樣式優化 */
        @media (max-width: 768px) {
            .room-highlighted::after {
                top: 10px;
                right: 10px;
                padding: 6px 12px;
                font-size: 0.75rem;
            }
        }
        
        /* 自動移除高亮效果 */
        .room-highlighted {
            animation: remove-highlight 10s ease-out forwards;
        }
        
        @keyframes remove-highlight {
            0%, 75% {
                transform: scale(1.015);
                box-shadow: 0 12px 40px rgba(158, 158, 158, 0.25), 0 4px 12px rgba(158, 158, 158, 0.15);
                border: 1px solid rgba(183, 183, 183, 0.4);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                border: 1px solid transparent;
            }
        }
    `;
    document.head.appendChild(roomHighlightStyle);
}); 