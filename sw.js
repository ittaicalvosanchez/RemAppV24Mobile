const CACHE_NAME = 'Nexus-Pro-v26.0';
const ASSETS = [
    '/',
    '/index.html',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(k => Promise.all(k.map(x => x !== CACHE_NAME && caches.delete(x)))));
});

self.addEventListener('fetch', e => {
    if (e.request.url.includes(':3000')) return; // Jamás cachear el búnker
    e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});

self.addEventListener('message', e => {
    if (e.data.type === 'SCHEDULE') {
        setTimeout(() => {
            self.registration.showNotification("NEXUS TÁCTICO", {
                body: `EJECUTE MISIÓN: ${e.data.t}`,
                vibrate: [300, 100, 300, 100, 300],
                requireInteraction: true
            });
        }, e.data.delay);
    }
});
