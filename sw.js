const CACHE = 'ricardo-gnv-v1';
const URLS = [
    '/',
    '/index.html',
    '/vender.html',
    '/css/styles.css',
    '/js/main.js',
    '/img.png',
    '/manifest.json'
];

self.addEventListener('install', function(e) {
    e.waitUntil(caches.open(CACHE).then(function(cache) {
        return cache.addAll(URLS);
    }));
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(caches.keys().then(function(keys) {
        return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }));
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    e.respondWith(caches.match(e.request).then(function(r) {
        return r || fetch(e.request).then(function(res) {
            return caches.open(CACHE).then(function(cache) {
                cache.put(e.request, res.clone());
                return res;
            });
        });
    }));
});
