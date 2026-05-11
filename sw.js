// sw.js - CENTINELA OMEGA v25.2
const CACHE_NAME = 'Nexus-Omega-v25.2';
const ASSETS = [
    '/',
    '/index.html',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // La imagen táctica
    'https://cdn-icons-png.flaticon.com/512/2524/2524388.png' // Icono radar
];

self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))));
});

self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (url.port === '3000') return; // Nunca cachear el búnker

    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});

self.addEventListener('message', e => {
    if (e.data.type === 'SCHEDULE') {
        setTimeout(() => {
            self.registration.showNotification("NEXUS TÁCTICO", {
                body: `OBJETIVO: ${e.data.t}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/2524/2524388.png',
                vibrate: [500, 100, 500],
                requireInteraction: true
            });
        }, e.data.delay);
    }
});
