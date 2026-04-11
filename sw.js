// =====================
// 優愛ホーム 経費管理アプリ Service Worker
// バージョンを変えるたびにキャッシュが更新されます
// =====================
const CACHE_VERSION = 'keihi-v1.0.0';
const CACHE_FILES = [
  './keihi.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// インストール時：キャッシュを作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// フェッチ：ネットワーク優先、失敗時はキャッシュ
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  // Firebase・Anthropic APIはキャッシュしない
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('anthropic') ||
      url.hostname.includes('gstatic')) {
    return;
  }
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.status === 200) {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() => caches.match(event.request))
  );
});

// メインスレッドからのskipWaitingメッセージを受信
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});