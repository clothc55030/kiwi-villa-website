// 房間相關功能模組
import { DOMCache } from './dom-cache.js';

// Room slider functionality - 優化版
export function initRoomSlider() {
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

// Room navigation functionality
export function initRoomNavigation() {
    // 只在房型頁面執行
    if (!window.location.pathname.includes('rooms') && !document.querySelector('.rooms-section')) {
        return;
    }
    
    // 檢查當前URL錨點
    function checkRoomNavigation() {
        const hash = window.location.hash;
        
        let targetRoomId = null;
        let roomNumber = null;
        
        // 檢查是否有房間錨點
        if (hash && hash.includes('room-')) {
            targetRoomId = hash.substring(1); // 移除 # 符號
            roomNumber = targetRoomId.replace('room-', '');
        }
        
        if (targetRoomId && roomNumber) {
            // 清除所有房間的處理標記，允許重新跳轉
            const allRoomCards = document.querySelectorAll('.room-card[id]');
            allRoomCards.forEach(room => {
                delete room.dataset.navigationProcessed;
            });
            
            // 先嘗試直接找到目標房間
            let targetRoom = document.getElementById(targetRoomId);
            
            // 如果找不到直接的房間ID，檢查房號對應關係
            if (!targetRoom) {
                // 房號對應關係處理
                const roomMappings = {
                    '201': 'room-201',
                    '203': 'room-203', 
                    '205': 'room-205',
                    '301': 'room-301',
                    '302': 'room-302',
                    '303': 'room-303',
                    '305': 'room-305',
                    '306': 'room-306',
                    '307': 'room-307'
                };
                
                if (roomMappings[roomNumber]) {
                    targetRoom = document.getElementById(roomMappings[roomNumber]);
                }
            }
            
            if (targetRoom && !targetRoom.dataset.navigationProcessed) {
                // 標記為已處理
                targetRoom.dataset.navigationProcessed = 'true';
                
                // 延遲滾動以確保頁面完全載入
                setTimeout(() => {
                    const offset = DOMCache.navbarHeight + 20;
                    const targetPosition = targetRoom.offsetTop - offset;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // 視覺反饋：短暫高亮
                    targetRoom.style.transition = 'box-shadow 0.3s ease';
                    targetRoom.style.boxShadow = '0 0 30px rgba(124, 155, 181, 0.8)';
                    
                    setTimeout(() => {
                        targetRoom.style.boxShadow = '';
                    }, 2000);
                }, 500);
            }
        }
    }
    
    // 初始檢查
    checkRoomNavigation();
    
    // 監聽hash變化
    window.addEventListener('hashchange', checkRoomNavigation);
}