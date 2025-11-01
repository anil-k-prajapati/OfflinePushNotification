// Service Worker for Offline Push Notifications
const CACHE_NAME = 'notification-app-v1';
const urlsToCache = [
    '/',
    '/css/site.css',
    '/js/site.js',
    '/js/notifications.js',
    '/lib/bootstrap/dist/css/bootstrap.min.css',
    '/lib/bootstrap/dist/js/bootstrap.bundle.min.js',
    '/lib/jquery/dist/jquery.min.js'
];

// Install event - cache resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});

// Background sync for offline notifications
self.addEventListener('sync', function(event) {
    if (event.tag === 'background-sync') {
        event.waitUntil(syncNotifications());
    }
});

function syncNotifications() {
    // Sync offline notifications when connection is restored
    console.log('Service Worker: Syncing notifications');
    return Promise.resolve();
}
