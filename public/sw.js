const CACHE_NAME = 'apex-strength-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Stale-while-revalidate for navigation and static assets)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Avoid caching external POST/API calls
  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is an HTML page, return root cached page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});

// Native Android Push Notifications Listener
self.addEventListener('push', (event) => {
  let data = {
    title: 'ApexStrength',
    body: 'Time to train!',
    url: '/',
    tag: 'apex-alert'
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.svg',
    badge: '/icons/icon-192.svg',
    vibrate: [300, 100, 300, 100, 300],
    data: { url: data.url || '/' },
    tag: data.tag || 'apex-notification',
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Android Notification Click & Navigation Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Direct Message Trigger from Web App (e.g. Rest Timer Completion)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const payload = event.data.payload || {};
    const options = {
      body: payload.body || 'Ready for your next set!',
      icon: '/icons/icon-192.svg',
      badge: '/icons/icon-192.svg',
      vibrate: [400, 150, 400],
      data: { url: payload.url || '/workout' },
      tag: payload.tag || 'rest-timer',
      renotify: true,
      actions: [
        { action: 'open', title: 'Open Workout' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    };

    self.registration.showNotification(payload.title || 'ApexStrength', options);
  }
});
