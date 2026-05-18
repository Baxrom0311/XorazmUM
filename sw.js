const CACHE_NAME = 'kitobxon-v4';
const PRECACHE = ['/', '/index.html', '/css/style.css', '/css/icons.css', '/js/script.js', '/images/icons/icon-192x192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // HTML — Network First
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone())); return r; }).catch(() => caches.match(e.request)));
    return;
  }

  // Rasmlar, CSS, JS — Cache First + lazy cache
  if (/\.(png|jpg|jpeg|gif|svg|css|js|woff2?)$/i.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(r => { caches.open(CACHE_NAME).then(c => c.put(e.request, r.clone())); return r; });
    }));
    return;
  }

  // Boshqalar — Network only
  e.respondWith(fetch(e.request));
});
