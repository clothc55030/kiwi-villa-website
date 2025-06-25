const CACHE_NAME = 'kiwi-villa-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/intro.html',
  '/location.html',
  '/rooms.html',
  '/reviews.html',
  '/faq.html',
  '/policy.html',
  '/css/base.css',
  '/css/index.css',
  '/css/intro.css',
  '/css/location.css',
  '/css/rooms.css',
  '/css/layout.css',
  '/css/faq.css',
  '/css/reviews.css',
  '/css/policy.css',
  '/js/main.js',
  '/images/logo/kiwi-villa-logo.webp',
  '/images/hero/main-hall-environment-mobile-new.webp',
  '/images/hero/main-hall-environment-new.webp',
  '/assets/manifest.json'
];

// Service Worker 安裝事件
self.addEventListener('install', event => {
  console.log('Service Worker 安裝中...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('開始快取重要資源');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('資源快取完成');
        // 強制啟用新的 Service Worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('快取資源時發生錯誤:', error);
      })
  );
});

// Service Worker 啟用事件
self.addEventListener('activate', event => {
  console.log('Service Worker 啟用中...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 清除舊版本的快取
          if (cacheName !== CACHE_NAME) {
            console.log('清除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker 已啟用');
      // 立即控制所有客戶端
      return self.clients.claim();
    })
  );
});

// 處理網路請求
self.addEventListener('fetch', event => {
  // 只處理同源的 GET 請求
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 排除外部 API 和特定路徑
  const excludePatterns = [
    'booking.owlting.com',
    'fonts.googleapis.com',
    'fonts.gstatic.com', 
    'cdnjs.cloudflare.com',
    'unpkg.com',
    'googleapis.com',
    'gstatic.com'
  ];

  const shouldExclude = excludePatterns.some(pattern => 
    event.request.url.includes(pattern)
  );

  if (shouldExclude) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果找到快取，直接返回
        if (response) {
          console.log('從快取返回:', event.request.url);
          return response;
        }

        // 否則從網路獲取
        return fetch(event.request)
          .then(response => {
            // 檢查響應是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆響應，因為它只能使用一次
            const responseToCache = response.clone();

            // 將新資源加入快取（僅快取重要資源）
            if (shouldCache(event.request.url)) {
              caches.open(CACHE_NAME)
                .then(cache => {
                  console.log('快取新資源:', event.request.url);
                  cache.put(event.request, responseToCache);
                })
                .catch(error => {
                  console.log('快取失敗:', error);
                });
            }

            return response;
          })
          .catch(error => {
            console.log('網路請求失敗:', event.request.url, error);
            
            // 如果是 HTML 頁面請求失敗，返回離線頁面
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            // 其他資源請求失敗，拋出錯誤
            throw error;
          });
      })
  );
});

// 判斷是否應該快取該資源
function shouldCache(url) {
  const cacheableExtensions = ['.html', '.css', '.js', '.webp', '.jpg', '.png', '.avif', '.svg', '.ico'];
  const excludeKeywords = ['booking.owlting.com', 'googleapis.com', 'gstatic.com', 'cdnjs.cloudflare.com'];
  
  // 排除外部資源
  if (excludeKeywords.some(keyword => url.includes(keyword))) {
    return false;
  }
  
  // 只快取特定類型的檔案
  return cacheableExtensions.some(ext => url.includes(ext)) || url.endsWith('/');
}

// 處理推播通知點擊（未來功能）
self.addEventListener('notificationclick', event => {
  console.log('通知被點擊:', event.notification.tag);
  event.notification.close();

  // 開啟網站
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 處理背景同步（未來功能）
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('執行背景同步');
    event.waitUntil(
      // 在這裡可以實現背景數據同步
      Promise.resolve()
    );
  }
});

console.log('澎湖期遇度假會館 Service Worker 已載入'); 