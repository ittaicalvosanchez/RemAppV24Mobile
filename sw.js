const CACHE_NAME = 'Nexus-Eye-V26.1-PRO';
const ASSETS = [
    '/',
    '/index.html',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;800&family=Orbitron:wght@400;900&display=swap',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop'
];

// Instalación y toma de control inmediata
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(c => {
            console.log("[🛡️ SW]: Forjando escudo de datos...");
            return c.addAll(ASSETS);
        })
    );
});

// Purga de cachés obsoletas para evitar fragmentación
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(k => k !== CACHE_NAME && caches.delete(k))
        ))
    );
});

// Estrategia de recuperación inteligente
self.addEventListener('fetch', e => {
    // Ignorar las peticiones al búnker (datos en tiempo real) para evitar desincronía
    if (e.request.url.includes(':3000')) return;

    e.respondWith(
        caches.match(e.request).then(res => {
            return res || fetch(e.request).then(response => {
                // Si es un recurso nuevo, lo añadimos al escudo si es necesario
                return response;
            });
        })
    );
});

// Centro de Mensajería y Alarmas Tácticas
self.addEventListener('message', e => {
    if (e.data.type === 'SCHEDULE') {
        const { t, delay } = e.data;
        
        console.log(`[🛡️ SW]: Misión en cuenta regresiva: ${t} (T-${delay}ms)`);
        
        // El uso de setTimeout en SW es limitado, pero efectivo para misiones de corto plazo
        setTimeout(() => {
            const options = {
                body: `COMANDANTE, OBJETIVO DETECTADO: ${t.toUpperCase()}`,
                icon: 'https://cdn-icons-png.flaticon.com/512/2592/2592317.png', // Icono de radar
                vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 500, 110, 500], // Vibración en código
                data: { primaryKey: 1 },
                actions: [
                    { action: 'confirm', title: 'ORDEN RECIBIDA', icon: 'check.png' },
                    { action: 'close', title: 'IGNORAR', icon: 'close.png' }
                ],
                requireInteraction: true, // La notificación no desaparece hasta que se atienda
                tag: 'mision-critica'
            };

            self.registration.showNotification("⚠️ ALERTA NEXUS PRO", options);
        }, delay);
    }
});
