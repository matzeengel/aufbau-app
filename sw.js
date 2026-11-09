// Offline-Cache für die App-Dateien. Bei jeder Änderung an der App VERSION erhöhen.
const VERSION = 'aufbau-v9';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'vendor/zxing.min.js', 'vendor/barcode-detector.js', 'vendor/zxing_reader.wasm', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Produktdatenbank immer live abfragen
  if (url.hostname.endsWith('openfoodfacts.org')) return;
  // App-Seite: erst Netz, sonst Cache (damit Updates sofort ankommen)
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copy)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  // Alles andere: Cache zuerst
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && (url.origin === location.origin || url.hostname.includes('fonts.g'))) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
    return r;
  })));
});

// Push-Mitteilungen (Erinnerungen über GitHub Actions)
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { title: 'Aufbau', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Aufbau', { body: d.body || '', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', tag: d.tag || undefined, data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
