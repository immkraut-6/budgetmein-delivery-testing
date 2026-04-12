const CACHE_NAME = 'budgetmein-v1';
  const STATIC_ASSETS = [
    './',
    './admin.html',
    './delivery.html',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
  ];

  self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch(() => {});
      })
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      })
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (event) => {
    // Only cache GET requests for same-origin or font resources
    if (event.request.method !== 'GET') return;
    
    const url = new URL(event.request.url);
    
    // For Firebase/Firestore requests — always network first (never cache)
    if (url.hostname.includes('firebase') || url.hostname.includes('firestore') || url.hostname.includes('googleapis.com/identitytoolkit')) {
      return;
    }
    
    // For app pages — network first, fall back to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  });