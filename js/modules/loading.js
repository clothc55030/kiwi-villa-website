// 載入狀態管理模組

export function showLoading() {
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-overlay';
    
    // Create spinner container using DOM API (更安全，避免 XSS)
    const spinnerContainer = document.createElement('div');
    spinnerContainer.className = 'loading-spinner';
    
    // Create spinner icon
    const spinnerIcon = document.createElement('i');
    spinnerIcon.className = 'fas fa-spinner fa-spin';
    
    // Create loading text
    const loadingText = document.createElement('p');
    loadingText.textContent = '載入中...';
    
    // Append elements
    spinnerContainer.appendChild(spinnerIcon);
    spinnerContainer.appendChild(loadingText);
    loadingElement.appendChild(spinnerContainer);
    
    document.body.appendChild(loadingElement);
}

export function hideLoading() {
    const loadingElement = document.querySelector('.loading-overlay');
    if (loadingElement) {
        loadingElement.remove();
    }
}