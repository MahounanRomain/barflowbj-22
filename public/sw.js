const CACHE_NAME = 'barflow-v2';
const STATIC_CACHE = 'barflow-static-v2';
const DYNAMIC_CACHE = 'barflow-dynamic-v2';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Cache strategy for different resource types
const CACHE_STRATEGIES = {
  STATIC_ASSETS: 31536000, // 1 year for JS/CSS with hash
  IMAGES: 2592000, // 1 month for images
  FONTS: 31536000, // 1 year for fonts
  HTML: 0 // No cache for HTML
};

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Skip waiting');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
              console.log('Service Worker: Removing old cache', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network with optimized caching
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip requests to different origins
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    (async () => {
      try {
        const url = new URL(event.request.url);
        
        // For navigation requests, try network first, then cache
        if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html')) {
          try {
            const networkResponse = await fetch(event.request);
            if (networkResponse.ok) {
              const cache = await caches.open(DYNAMIC_CACHE);
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            }
          } catch (error) {
            console.log('Network failed, trying cache...');
          }
          
          // Fallback to cached version
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Ultimate fallback to index.html for SPA routing
          return caches.match('/index.html');
        }

        // For static assets (JS/CSS with hashes), cache first with long TTL
        if (url.pathname.includes('/assets/') || 
            url.pathname.match(/\.(js|css|woff|woff2)$/)) {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            // Add cache headers for long-term caching
            const headers = new Headers(cachedResponse.headers);
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');
            return new Response(cachedResponse.body, {
              status: cachedResponse.status,
              statusText: cachedResponse.statusText,
              headers: headers
            });
          }

          // Fetch and cache with long TTL
          const networkResponse = await fetch(event.request);
          if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
            
            // Add cache headers
            const headers = new Headers(networkResponse.headers);
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');
            return new Response(networkResponse.body, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: headers
            });
          }
          return networkResponse;
        }

        // For other requests, try cache first, then network
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Not in cache, fetch from network
        const networkResponse = await fetch(event.request);
        
        if (networkResponse.ok) {
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.error('Fetch failed:', error);
        // Return offline page or cached index.html as fallback
        return caches.match('/index.html');
      }
    })()
  );
});

// Background sync for offline data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline data synchronization
      syncOfflineData()
    );
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification BarFlow',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ouvrir BarFlow',
        icon: '/icon-192.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('BarFlow', options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync offline data function
async function syncOfflineData() {
  try {
    // Get offline data from IndexedDB or localStorage
    // Sync with server when online
    console.log('Service Worker: Syncing offline data...');
    return Promise.resolve();
  } catch (error) {
    console.error('Service Worker: Sync failed', error);
    return Promise.reject(error);
  }
}
