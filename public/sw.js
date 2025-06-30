// Service Worker - 智能緩存策略
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `kiwi-villa-${CACHE_VERSION}`;

// 緩存策略配置
const CACHE_STRATEGIES = {
  // 網路優先：適用於 API 和動態內容
  networkFirst: [
    '/api/',
    '/booking/'
  ],
  
  // 緩存優先：適用於靜態資源
  cacheFirst: [
    '/images/',
    '/fonts/',
    '/favicon'
  ],
  
  // 僅網路：不緩存的資源
  networkOnly: [
    '/admin/',
    '/analytics/'
  ],
  
  // 預載入的關鍵資源
  preCache: [
    '/',
    '/index.html',
    '/styles/globals.css',
    '/manifest.json'
  ]
};

// 安裝事件 - 預載入關鍵資源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: 預載入關鍵資源');
        return cache.addAll(CACHE_STRATEGIES.preCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 啟動事件 - 清理舊緩存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName.startsWith('kiwi-villa-')) {
              console.log('Service Worker: 清理舊緩存', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 請求攔截 - 智能緩存策略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 忽略非 GET 請求
  if (request.method !== 'GET') return;
  
  // 忽略外部請求
  if (!url.origin.includes(self.location.origin)) return;
  
  // 根據路徑選擇策略
  const strategy = getStrategy(url.pathname);
  
  switch (strategy) {
    case 'networkFirst':
      event.respondWith(networkFirst(request));
      break;
    case 'cacheFirst':
      event.respondWith(cacheFirst(request));
      break;
    case 'networkOnly':
      // 直接返回，讓瀏覽器處理
      break;
    default:
      // 預設策略：網路優先，失敗時使用緩存
      event.respondWith(networkFirst(request));
  }
});

// 獲取緩存策略
function getStrategy(pathname) {
  for (const [strategy, patterns] of Object.entries(CACHE_STRATEGIES)) {
    if (strategy === 'preCache') continue;
    
    for (const pattern of patterns) {
      if (pathname.includes(pattern)) {
        return strategy;
      }
    }
  }
  
  // 圖片資源特殊處理
  if (/\.(jpg|jpeg|png|webp|avif|svg|gif)$/i.test(pathname)) {
    return 'cacheFirst';
  }
  
  // CSS 和 JS 檔案
  if (/\.(css|js)$/i.test(pathname)) {
    return 'cacheFirst';
  }
  
  return 'networkFirst';
}

// 網路優先策略
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // 成功則更新緩存
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // 網路失敗，嘗試從緩存獲取
    const cached = await caches.match(request);
    if (cached) {
      console.log('Service Worker: 從緩存返回', request.url);
      return cached;
    }
    
    // 如果是導航請求，返回離線頁面
    if (request.mode === 'navigate') {
      return caches.match('/');
    }
    
    throw error;
  }
}

// 緩存優先策略
async function cacheFirst(request) {
  const cached = await caches.match(request);
  
  if (cached) {
    // 背景更新緩存
    updateCache(request);
    return cached;
  }
  
  // 緩存未命中，從網路獲取
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('Service Worker: 網路請求失敗', request.url);
    throw error;
  }
}

// 背景更新緩存
async function updateCache(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response);
    }
  } catch (error) {
    // 靜默失敗，不影響用戶體驗
  }
}

// 監聽推送通知
self.addEventListener('push', (event) => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/images/logo/favicon-192x192.png',
      badge: '/images/logo/favicon-96x96.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification('期遇度假會館', options)
    );
  }
});

// 處理通知點擊
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// 背景同步
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics());
  }
});

async function syncAnalytics() {
  // 同步離線分析數據
  console.log('Service Worker: 同步分析數據');
}