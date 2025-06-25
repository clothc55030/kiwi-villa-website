// Service Worker for Kiwi Villa Website
// 澎湖期遇度假會館 - Service Worker

// 📝 更新版本號：每次需要強制更新緩存時，修改這個版本號
const CACHE_VERSION = 'kiwi-villa-v2.1.0'; // 🔄 更新此版本號可強制刷新緩存
const CACHE_NAME = `kiwi-villa-cache-${CACHE_VERSION}`;

// 需要緩存的關鍵資源
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/rooms.html',
    '/intro.html',
    '/location.html',
    '/reviews.html',
    '/faq.html',
    '/policy.html',
    '/css/base.css',
    '/css/layout.css',
    '/css/index.css',
    '/css/rooms.css',
    '/css/intro.css',
    '/css/location.css',
    '/css/reviews.css',
    '/css/faq.css',
    '/css/policy.css',
    '/js/main.js',
    '/images/logo/kiwi-villa-logo.webp',
    '/images/logo/kiwi-villa-logo.avif',
    '/images/hero/main-hall-environment-mobile-extreme.avif',
    '/images/hero/main-hall-environment-mobile-ultra.webp',
    '/images/hero/main-hall-environment-new.avif',
    '/images/hero/main-hall-environment-ultra.webp'
];

// Service Worker 安裝事件
self.addEventListener('install', (event) => {
    console.log(`🔄 Service Worker ${CACHE_VERSION} 正在安裝...`);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 緩存核心資源...');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log(`✅ Service Worker ${CACHE_VERSION} 安裝完成`);
                // 立即激活新版本，不等待舊版本結束
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Service Worker 安裝失敗:', error);
            })
    );
});

// Service Worker 激活事件
self.addEventListener('activate', (event) => {
    console.log(`🚀 Service Worker ${CACHE_VERSION} 正在激活...`);
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                // 刪除舊版本的緩存
                const deletePromises = cacheNames
                    .filter(cacheName => {
                        return cacheName.startsWith('kiwi-villa-cache-') && 
                               cacheName !== CACHE_NAME;
                    })
                    .map(cacheName => {
                        console.log('🗑️ 刪除舊緩存:', cacheName);
                        return caches.delete(cacheName);
                    });
                
                return Promise.all(deletePromises);
            })
            .then(() => {
                console.log(`✅ Service Worker ${CACHE_VERSION} 激活完成`);
                // 立即控制所有頁面
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('❌ Service Worker 激活失敗:', error);
            })
    );
});

// 網絡請求攔截
self.addEventListener('fetch', (event) => {
    // 只處理 GET 請求
    if (event.request.method !== 'GET') {
        return;
    }
    
    // 跳過外部資源
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    
    // 檢查是否為導航請求或 .html 頁面請求
    const isNavigationRequest = event.request.mode === 'navigate' || 
                               event.request.destination === 'document' ||
                               event.request.url.endsWith('.html');
    
    // 導航請求使用網絡優先策略：先嘗試網絡，失敗時才用緩存
    if (isNavigationRequest) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // 網絡請求成功，緩存響應
                    if (response && response.status === 200) {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                console.log('💾 緩存頁面:', event.request.url);
                                cache.put(event.request, responseToCache);
                            });
                    }
                    return response;
                })
                .catch((error) => {
                    console.error('🌐 導航請求失敗，嘗試緩存:', event.request.url, error);
                    // 網絡失敗時，嘗試從緩存返回
                    return caches.match(event.request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('📱 離線模式，從快取返回:', event.request.url);
                                return cachedResponse;
                            }
                            // 如果沒有緩存，返回離線頁面
                            return caches.match('/404.html');
                        });
                })
        );
        return;
    }
    
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('📱 從快取返回:', event.request.url);
                    return cachedResponse;
                }
                
                // 如果沒有緩存，從網絡獲取
                return fetch(event.request)
                    .then((response) => {
                        // 檢查是否為有效響應
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // 緩存靜態資源
                        const shouldCache = 
                            event.request.url.includes('/css/') ||
                            event.request.url.includes('/js/') ||
                            event.request.url.includes('/images/') ||
                            event.request.url.includes('.html');
                        
                        if (shouldCache) {
                            const responseToCache = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    console.log('💾 新增到快取:', event.request.url);
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        
                        return response;
                    })
                    .catch((error) => {
                        console.error('🌐 網絡請求失敗:', event.request.url, error);
                        throw error;
                    });
            })
    );
});

// 監聽來自主線程的消息
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('🔄 收到跳過等待消息');
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_VERSION
        });
    }
});

// 錯誤處理
self.addEventListener('error', (event) => {
    console.error('❌ Service Worker 錯誤:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('❌ Service Worker 未處理的 Promise 拒絕:', event.reason);
});

console.log(`🎯 Service Worker ${CACHE_VERSION} 已載入`); 