// ==========================================================================
// Main JavaScript - 模組化版本
// ==========================================================================

// 匯入所有模組
import { DOMCache } from './modules/dom-cache.js';
import { debounce, updateCopyrightYear } from './modules/utils.js';
import { showLoading, hideLoading } from './modules/loading.js';
import { initNavigation, initSmoothScrolling, initHeroScrollIndicator } from './modules/navigation.js';
import { initAOSOptimized, refreshAOS } from './modules/animations.js';
import { initFAQ } from './modules/faq.js';
import { initRoomSlider, initRoomNavigation } from './modules/room-features.js';

// 主要初始化函數
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
    const handleResize = debounce(function() {
        DOMCache.updateViewportWidth();
        
        // 如果有 AOS，重新整理
        refreshAOS();
        
        // 桌面版與手機版切換處理
        if (DOMCache.viewportWidth >= 768) {
            // 桌面版時移除手機版滑動指示器
            const indicators = document.querySelectorAll('.gallery-indicators');
            indicators.forEach(indicator => {
                indicator.remove();
            });
        }
    }, 250);
    
    window.addEventListener('resize', handleResize, { passive: true });
});

// Error handling - 優化錯誤處理
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    
    // 只在開發環境顯示錯誤提示
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-notification';
        errorMsg.textContent = `錯誤: ${e.error.message}`;
        document.body.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 5000);
    }
});

// 將常用函數暴露到全局（如果需要）
window.showLoading = showLoading;
window.hideLoading = hideLoading;