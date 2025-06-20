// Service Worker for Stock Insight Platform
// 實現緩存策略和離線功能

const CACHE_NAME = 'stock-insight-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// 需要緩存的靜態資源
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/pages/auth/login.html',
  '/src/pages/auth/register.html',
  '/src/pages/dashboard/index.html',
  '/src/pages/dashboard/profile.html',
  '/src/pages/dashboard/friends.html',
  '/src/pages/dashboard/chat.html',
  '/src/pages/posts/detail.html',
  '/src/css/style.css',
  '/src/js/config/routes.js',
  '/src/js/utils/pathManager.js',
  '/src/js/template.js',
  '/src/js/api.js',
  '/src/js/auth.js',
  '/src/js/dashboard.js',
  '/src/js/chat.js',
  '/src/js/friends.js',
  '/src/js/profile.js',
  '/src/js/post.js',
  '/src/components/navbar.html',
  '/manifest.json',
];

// API 端點白名單（需要網路連接）
const API_ENDPOINTS = ['http://localhost:5001/api', '/api'];

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      }),
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cache);
              return caches.delete(cache);
            }
          }),
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      }),
  );
});

// 攔截網路請求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 跳過 chrome-extension 和非 HTTP(S) 請求
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // API 請求策略：網路優先，失敗時顯示離線消息
  if (isApiRequest(event.request.url)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 克隆響應以便緩存
          const responseClone = response.clone();

          if (response.status === 200) {
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, responseClone));
          }

          return response;
        })
        .catch(() => {
          // 網路失敗時嘗試從緩存獲取
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // 返回離線提示
            if (event.request.method === 'GET') {
              return new Response(
                JSON.stringify({
                  error: '目前無法連接網路，請檢查網路連接',
                  offline: true,
                }),
                {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' },
                },
              );
            }
          });
        }),
    );
    return;
  }

  // 靜態資源策略：緩存優先
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // 如果緩存中沒有，則從網路獲取
      return fetch(event.request)
        .then((response) => {
          // 只緩存成功的 GET 請求
          if (response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone();

            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(event.request, responseClone));
          }

          return response;
        })
        .catch(() => {
          // 如果是 HTML 請求且網路失敗，返回離線頁面
          if (event.request.destination === 'document') {
            return (
              caches.match('/offline.html') ||
              new Response(getOfflineHTML(), { headers: { 'Content-Type': 'text/html' } })
            );
          }
        });
    }),
  );
});

// 推送通知處理
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  let data = {};
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body || '您有新的消息',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    image: data.image,
    data: data.url || '/src/pages/dashboard/index.html',
    actions: [
      {
        action: 'open',
        title: '查看',
        icon: '/icons/action-open.png',
      },
      {
        action: 'close',
        title: '關閉',
        icon: '/icons/action-close.png',
      },
    ],
    vibrate: [200, 100, 200],
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Stock Insight Platform', options),
  );
});

// 通知點擊處理
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const url = event.notification.data || '/src/pages/dashboard/index.html';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clients) => {
      // 檢查是否已有開啟的窗口
      for (let client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }

      // 開啟新窗口
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    }),
  );
});

// 工具函數
function isApiRequest(url) {
  return API_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function getOfflineHTML() {
  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>離線模式 - Stock Insight Platform</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          text-align: center;
        }
        .container {
          max-width: 400px;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          backdrop-filter: blur(10px);
        }
        .icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
        h1 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
        }
        p {
          margin-bottom: 2rem;
          opacity: 0.9;
        }
        button {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.3);
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }
        button:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">📱</div>
        <h1>目前處於離線模式</h1>
        <p>無法連接到網路，但您仍可以瀏覽已緩存的內容。</p>
        <button onclick="location.reload()">重新連接</button>
      </div>
    </body>
    </html>
  `;
}
