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

// Room URL hash navigation and highlighting
document.addEventListener('DOMContentLoaded', function() {
    // 房間號碼對應表
    const roomMap = {
        'room-201': '豪華家庭房',
        'room-203': '高級四人房', 
        'room-205': '奢華四人房',
        'room-303': '高級三人房',
        'room-302': '高級雙床房',
        'room-305': '高級雙人房'
    };

    // 處理頁面加載時的hash定位
    function handleRoomNavigation() {
        const hash = window.location.hash.substring(1); // 移除 # 號
        
        if (hash && roomMap[hash]) {
            setTimeout(() => {
                const roomElement = document.getElementById(hash);
                if (roomElement) {
                    // 移除其他房間的高亮效果
                    document.querySelectorAll('.room-card').forEach(card => {
                        card.classList.remove('room-highlighted');
                    });
                    
                    // 添加高亮效果
                    roomElement.classList.add('room-highlighted');
                    
                    // 平滑滾動到房間卡片
                    roomElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                    
                    // 顯示成功提示
                    const roomName = roomMap[hash];
                    showNotification(`已為您定位到：${roomName}`, 'success');
                }
            }, 300); // 稍微延遲以確保頁面完全加載
        }
    }

    // 監聽hash變化
    window.addEventListener('hashchange', handleRoomNavigation);
    
    // 頁面加載時檢查hash
    handleRoomNavigation();
    
    // 添加房間高亮效果的樣式
    const roomHighlightStyle = document.createElement('style');
    roomHighlightStyle.textContent = `
        .room-highlighted {
            transform: scale(1.02);
            box-shadow: 0 8px 32px rgba(74, 144, 226, 0.3);
            border: 2px solid rgba(74, 144, 226, 0.5);
            background: linear-gradient(135deg, rgba(74, 144, 226, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%);
            transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            z-index: 2;
        }
        
        .room-highlighted::before {
            content: '🎯 已為您定位';
            position: absolute;
            top: -10px;
            right: 20px;
            background: linear-gradient(135deg, #4A90E2, #63B3ED);
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.4);
            animation: highlight-pulse 2s ease-out;
            z-index: 3;
        }
        
        @keyframes highlight-pulse {
            0% {
                opacity: 0;
                transform: translateY(-10px) scale(0.8);
            }
            50% {
                opacity: 1;
                transform: translateY(0) scale(1.1);
            }
            100% {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }
        
        .room-highlighted .room-content h2 {
            color: #4A90E2;
            text-shadow: 0 2px 4px rgba(74, 144, 226, 0.2);
        }
        
        .room-highlighted .room-badge {
            background: linear-gradient(135deg, #4A90E2, #63B3ED);
            animation: badge-glow 2s ease-out;
        }
        
        @keyframes badge-glow {
            0%, 100% {
                box-shadow: 0 0 5px rgba(74, 144, 226, 0.5);
            }
            50% {
                box-shadow: 0 0 20px rgba(74, 144, 226, 0.8);
            }
        }
        
        /* 自動移除高亮效果 */
        .room-highlighted {
            animation: remove-highlight 8s ease-out forwards;
        }
        
        @keyframes remove-highlight {
            0%, 70% {
                transform: scale(1.02);
                box-shadow: 0 8px 32px rgba(74, 144, 226, 0.3);
                border: 2px solid rgba(74, 144, 226, 0.5);
            }
            100% {
                transform: scale(1);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                border: 2px solid transparent;
            }
        }
    `;
    document.head.appendChild(roomHighlightStyle);
}); 