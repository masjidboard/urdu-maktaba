const CACHE_NAME = 'maktaba-cache-v2';

// 1. Install Event: نیا سروس ورکر فوراً لاگو کرنے کے لیے
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// 2. Activate Event: پرانی کیشے (Cache) کو صاف کرنے کے لیے
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. Fetch Event (Network First Strategy)
self.addEventListener('fetch', (event) => {
    // براؤزر کے ایکسٹینشنز وغیرہ کو نظر انداز کریں
    if (!(event.request.url.indexOf('http') === 0)) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // اگر انٹرنیٹ چل رہا ہے تو تازہ ڈیٹا لائیں اور اسے کیشے میں بھی محفوظ کر لیں
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // اگر انٹرنیٹ بند ہے (آف لائن)، تو محفوظ شدہ کیشے سے ڈیٹا دکھائیں
                return caches.match(event.request);
            })
    );
});
