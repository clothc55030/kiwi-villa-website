// FAQ Accordion Functionality

document.addEventListener('DOMContentLoaded', function() {
    // 獲取所有FAQ項目
    const faqItems = document.querySelectorAll('.faq-item');
    
    // 為每個FAQ項目添加點擊事件
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // 獲取當前項目是否已經展開
            const isActive = item.classList.contains('active');
            
            // 關閉所有其他項目
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    otherAnswer.style.maxHeight = '0px';
                }
            });
            
            // 切換當前項目狀態
            if (isActive) {
                // 如果當前項目已展開，則關閉它
                item.classList.remove('active');
                const answer = item.querySelector('.faq-answer');
                answer.style.maxHeight = '0px';
            } else {
                // 如果當前項目未展開，則展開它
                item.classList.add('active');
                const answer = item.querySelector('.faq-answer');
                // 動態計算內容高度
                const content = answer.querySelector('.answer-content');
                const contentHeight = content.scrollHeight;
                answer.style.maxHeight = (contentHeight + 32) + 'px'; // 加上padding
            }
        });
    });
    
    // 頁面載入時預設展開第一個FAQ
    if (faqItems.length > 0) {
        const firstItem = faqItems[0];
        firstItem.classList.add('active');
        const firstAnswer = firstItem.querySelector('.faq-answer');
        const firstContent = firstAnswer.querySelector('.answer-content');
        const firstContentHeight = firstContent.scrollHeight;
        firstAnswer.style.maxHeight = (firstContentHeight + 32) + 'px';
    }
    
    // 滾動到FAQ項目
    function scrollToFAQ(index) {
        if (faqItems[index]) {
            faqItems[index].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    // 如果URL中有FAQ錨點，滾動到對應項目
    const urlHash = window.location.hash;
    if (urlHash && urlHash.startsWith('#faq-')) {
        const faqIndex = parseInt(urlHash.replace('#faq-', '')) - 1;
        setTimeout(() => scrollToFAQ(faqIndex), 500);
    }
    
    // 搜索功能（可選）
    function createFAQSearch() {
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = '搜索常見問題...';
        searchInput.className = 'faq-search';
        searchInput.style.cssText = `
            width: 100%;
            padding: 12px 16px;
            font-size: 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 24px;
            transition: border-color 0.3s ease;
        `;
        
        // 搜索功能
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question h3').textContent.toLowerCase();
                const answer = item.querySelector('.answer-content').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = searchTerm === '' ? 'block' : 'none';
                }
            });
        });
        
        // 將搜索框插入到FAQ容器前
        const faqContainer = document.querySelector('.faq-container');
        if (faqContainer && faqContainer.parentNode) {
            faqContainer.parentNode.insertBefore(searchInput, faqContainer);
        }
    }
    
    // 可選：添加搜索功能
    // createFAQSearch();
    
    // 鍵盤導航
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const activeItem = document.querySelector('.faq-item.active');
            if (activeItem) {
                const currentIndex = Array.from(faqItems).indexOf(activeItem);
                let nextIndex;
                
                if (e.key === 'ArrowUp') {
                    nextIndex = currentIndex > 0 ? currentIndex - 1 : faqItems.length - 1;
                } else {
                    nextIndex = currentIndex < faqItems.length - 1 ? currentIndex + 1 : 0;
                }
                
                const nextItem = faqItems[nextIndex];
                if (nextItem) {
                    nextItem.querySelector('.faq-question').click();
                    nextItem.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
                
                e.preventDefault();
            }
        }
    });
    
    // 響應式調整
    function adjustFAQForMobile() {
        const isMobile = window.innerWidth <= 768;
        
        faqItems.forEach(item => {
            const answer = item.querySelector('.faq-answer');
            if (item.classList.contains('active') && answer) {
                const content = answer.querySelector('.answer-content');
                const contentHeight = content.scrollHeight;
                const padding = isMobile ? 24 : 32;
                answer.style.maxHeight = (contentHeight + padding) + 'px';
            }
        });
    }
    
    // 監聽窗口大小變化
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(adjustFAQForMobile, 250);
    });
    
    // 初始調整
    adjustFAQForMobile();
}); 