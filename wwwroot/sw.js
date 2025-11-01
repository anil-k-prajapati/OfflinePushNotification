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

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    console.log('Service Worker: Notification clicked', {
        data: event.notification.data,
        tag: event.notification.tag
    });
    
    event.notification.close();
    
    // Open action URL if available, otherwise focus the app
    if (event.notification.data && event.notification.data.actionUrl) {
        console.log('Service Worker: Opening action URL:', event.notification.data.actionUrl);
        event.waitUntil(
            clients.openWindow(event.notification.data.actionUrl)
        );
    } else {
        console.log('Service Worker: No action URL, focusing app');
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(function(clientList) {
                if (clientList.length > 0) {
                    return clientList[0].focus();
                }
                return clients.openWindow('/');
            })
        );
    }
});

function syncNotifications() {
    // Sync offline notifications when connection is restored
    console.log('Service Worker: Syncing notifications');
    return Promise.resolve();
}
