// BudgetMein Service Worker v1.0
// Caches shell assets for offline support

const CACHE = 'budgetmein-v1';
const SHELL = [
  '/',
  '/admin.html',
  '/delivery.html',
  'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Cache what we can, ignore failures for external resources
      return Promise.allSettled(SHELL.map(url => c.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin or font/CDN assets
  if (e.request.method !== 'GET') return;
  
  const url = new URL(e.request.url);
  
  // Don't intercept Firebase API calls
  if (url.hostname.includes('firestore.googleapis.com') ||
      url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis.com')) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Cache successful responses for HTML and CSS
        if (res.ok && (e.request.url.endsWith('.html') || e.request.url.endsWith('.css') || e.request.url.endsWith('.js'))) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        // Offline fallback for navigation
        if (e.request.mode === 'navigate') {
          return caches.match('/delivery.html') || caches.match('/admin.html');
        }
      });
    })
  );
});
