// Name of the cache
const CACHE_NAME = 'Npcache';

// Install event: Cache all files in the specified list during the install phase
self.addEventListener('install', (event) => {
  // Skip the waiting phase and activate the new service worker immediately
  event.waitUntil(self.skipWaiting());
});

// Activate event: Clear old caches if needed
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            // Delete old cache if cache names do not match
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim control of all clients immediately
  return self.clients.claim();
});

// Fetch event: Serve from cache if available, otherwise fetch from the network and cache the response
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If the request is in the cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch the resource from the network
      return fetch(event.request).then((networkResponse) => {
        // If the network response is not valid, just return it
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Clone the response so we can cache it and return it
        const responseToCache = networkResponse.clone();

        // Cache the fetched resource for future requests
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    }).catch(() => {
      // Optionally, handle fetch errors (like offline cases)
      // Return a fallback page or file if needed
    })
  );
});
