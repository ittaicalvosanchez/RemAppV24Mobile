// ==========================================
// sw.js - CENTINELA OMEGA v24.0
// TAREAS: CACHÉ, OFFLINE SURVIVAL, ALERTAS
// ==========================================

const CACHE_NAME = 'RemApp-Omega-v24';
const ASSETS_CRITICOS = [
    '/',
    '/index.html'
];

// 1. INSTALACIÓN (Blindaje inicial)
self.addEventListener('install', event => {
    self.skipWaiting(); // Fuerza al centinela a tomar el control inmediatamente
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('[Centinela] Guardando munición en caché...');
            return cache.addAll(ASSETS_CRITICOS);
        })
    );
});

// 2. ACTIVACIÓN (Limpieza de versiones antiguas)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        console.log('[Centinela] Purgando caché obsoleta:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. INTERCEPTOR DE RED (Supervivencia Offline)
self.addEventListener('fetch', event => {
    // Ignoramos las peticiones al búnker local (puerto 3000) para que no las cachee por error
    if (event.request.url.includes('localhost:3000') || event.request.url.includes('api/news')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request).catch(() => {
                // Si falla la red y piden la web, devolvemos el index.html de la caché
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
            });
        })
    );
});

// 4. ESCUCHA DE ÓRDENES DESDE EL NÚCLEO (Misiones)
self.addEventListener('message', event => {
    if (event.data.type === 'SCHEDULE_MISSION') {
        const { title, delay, id } = event.data;
        console.log(`[Centinela] Misión programada: ${title} en ${delay}ms`);
        
        setTimeout(() => {
            desplegarNotificacion(title, id);
        }, delay);
    }
});

// 5. DESPLIEGUE DE ALARMA TÁCTICA
function desplegarNotificacion(titulo, id) {
    const options = {
        body: `OBJETIVO DETECTADO: ${titulo}`,
        icon: 'https://cdn-icons-png.flaticon.com/512/2524/2524388.png', // Icono de radar/mira
        badge: 'https://cdn-icons-png.flaticon.com/512/2524/2524388.png',
        vibrate: [500, 200, 500, 200, 500], // Patrón de vibración SOS
        tag: 'mision-' + id,
        data: { id: id },
        requireInteraction: true, // Se queda en pantalla hasta que el usuario responda
        actions: [
            { action: 'complete', title: '✅ OBJETIVO ABATIDO' }
        ]
    };
    self.registration.showNotification("NEXUS TÁCTICO", options);
}

// 6. MANEJO DE ACCIONES DEL USUARIO (Click en la notificación)
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'complete') {
        // Enviar orden de vuelta al index.html para borrar la misión de la base de datos
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
        // Si solo toca la notificación sin darle al botón, abrimos la App
        event.waitUntil(
            self.clients.matchAll({ type: 'window' }).then(clientsArr => {
                const hadWindowToFocus = clientsArr.some(windowClient => windowClient.url === '/' ? (windowClient.focus(), true) : false);
                if (!hadWindowToFocus) self.clients.openWindow('/');
            })
        );
    }
});
