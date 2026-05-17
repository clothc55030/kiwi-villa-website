// 動畫功能模組
import { DOMCache } from './dom-cache.js';

// 優化的AOS初始化 - 手機版性能考量
export function initAOSOptimized() {
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

// 重新初始化AOS（視窗大小變化時使用）
export function refreshAOS() {
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}