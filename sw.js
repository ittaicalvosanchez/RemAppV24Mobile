// ==========================================
// sw.js - CENTINELA OMEGA v24.1
// ESTADO: ESTABILIZADO Y SINCRONIZADO
// ==========================================

const CACHE_NAME = 'RemApp-Omega-v24.1';
const ASSETS_CRITICOS = [
    '/',
    '/index.html'
];

// 1. INSTALACIÓN TÁCTICA
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[Centinela] Blindaje v24.1 en caché...');
            return cache.addAll(ASSETS_CRITICOS);
        })
    );
});

// 2. ACTIVACIÓN Y PURGA
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[Centinela] Destruyendo caché antigua:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. INTERCEPTOR (ZONA SEGURA)
self.addEventListener('fetch', event => {
    // Evadir peticiones al Búnker y APIs para no envenenar la caché
    if (event.request.url.includes('localhost:3000') || event.request.url.includes('api/news')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// 4. RECEPCIÓN DE MISIONES DESDE EL NÚCLEO
self.addEventListener('message', event => {
    if (event.data.type === 'SCHEDULE_MISSION') {
        const { t: title, delay, id } = event.data; // Sincronizado con variables del v24.1
        console.log(`[Centinela] Misión fijada: ${title} (T-${Math.round(delay/1000)}s)`);
        
        setTimeout(() => {
            desplegarNotificacion(title, id);
        }, delay);
    }
});

// 5. DESPLIEGUE DE ALARMA
function desplegarNotificacion(titulo, id) {
    const options = {
        body: `OBJETIVO DETECTADO: ${titulo}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2524/2524388.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/2524/2524388.png',
        vibrate: [500, 200, 500],
        tag: 'mision-' + id,
        data: { id: id },
        requireInteraction: true,
        actions: [
            { action: 'complete', title: '✅ CONFIRMAR EJECUCIÓN' }
        ]
    };
    self.registration.showNotification("NEXUS TÁCTICO", options);
}

// 6. RETORNO DE TELEMETRÍA (Click de Usuario)
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'complete') {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                client.postMessage({
                    type: 'NOTIFICATION_ACTION',
                    action: 'complete',
                    id: event.notification.data.id
                });
            });
        });
    } else {
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clientsArr => {
                const hadWindowToFocus = clientsArr.some(windowClient => windowClient.url === '/' ? (windowClient.focus(), true) : false);
                if (!hadWindowToFocus) self.clients.openWindow('/');
            })
        );
    }
});
