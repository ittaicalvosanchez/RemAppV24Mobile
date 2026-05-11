const CACHE_NAME = 'RemApp-v25';
const ASSETS = ['/', '/index.html'];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
    if (e.request.url.includes('localhost:3000')) return;
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});

self.addEventListener('message', e => {
    if (e.data.type === 'SCHEDULE_MISSION') {
        setTimeout(() => {
            self.registration.showNotification("NEXUS TÁCTICO", {
                body: `OBJETIVO: ${e.data.t}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/2524/2524388.png',
                vibrate: [500, 100, 500],
                data: { id: e.data.id },
                actions: [{ action: 'complete', title: '✅ COMPLETADO' }]
            });
        }, e.data.delay);
    }
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    if (e.action === 'complete') {
        self.clients.matchAll().then(cs => cs.forEach(c => c.postMessage({ action: 'complete', id: e.notification.data.id })));
    }
});
