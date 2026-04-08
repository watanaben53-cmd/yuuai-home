// 優愛ホーム 顧客管理 Service Worker
const CACHE_NAME = 'yuuai-home-v2';

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  // 古いキャッシュを全削除
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// キャッシュしない - 常にネットワークから取得
self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});