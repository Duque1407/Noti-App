// service-worker.js - Service Worker para NotitApp PWA
const CACHE_NAME = 'notitapp-v1';
const API_CACHE = 'notitapp-api-v1';

// Archivos a cachear inmediatamente (Cache First)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/api.js',
  '/js/db.js',
  '/js/notifications.js',
  '/assets/icons/icon-192x192.png',
  '/assets/icons/icon-512x512.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.2/font/bootstrap-icons.css'
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando archivos estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
              console.log('[SW] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Tomar control inmediato
  );
});

// Interceptar requests (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Estrategia para API: Network First, fallback a Cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // Estrategia para assets estáticos: Cache First, fallback a Network
  event.respondWith(cacheFirstStrategy(request));
});

// Estrategia Cache First (para assets estáticos)
const cacheFirstStrategy = async (request) => {
  try {
    // Intentar obtener del cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Sirviendo desde cache:', request.url);
      return cachedResponse;
    }
    
    // Si no está en cache, obtener de red
    const networkResponse = await fetch(request);
    
    // Guardar en cache para uso futuro
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Error en Cache First:', error);
    
    // Fallback para navegación: retornar index.html
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      return cache.match('/index.html');
    }
    
    throw error;
  }
};

// Estrategia Network First (para API)
const networkFirstStrategy = async (request) => {
  try {
    // Intentar obtener de red primero
    const networkResponse = await fetch(request);
    
    // Si es exitoso, actualizar cache
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Red no disponible, usando cache para:', request.url);
    
    // Si falla, usar cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si tampoco hay en cache, retornar respuesta offline
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Sin conexión a internet. Datos no disponibles en cache.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};

// Sincronización en background (Background Sync API)
self.addEventListener('sync', (event) => {
  console.log('[SW] Evento de sincronización:', event.tag);
  
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

// Función para sincronizar notas pendientes
const syncNotes = async () => {
  try {
    console.log('[SW] Sincronizando notas...');
    
    // Aquí puedes implementar lógica de sincronización
    // Por ejemplo, enviar notas pendientes al servidor
    
    // Notificar a los clientes que la sincronización está completa
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Notas sincronizadas correctamente'
      });
    });
    
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Error al sincronizar:', error);
    return Promise.reject(error);
  }
};

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push recibido:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación de NotitApp',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'open',
        title: 'Abrir NotitApp',
        icon: '/assets/icons/icon-72x72.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('NotitApp', options)
  );
});

// Click en notificación push
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Click en notificación:', event);
  
  event.notification.close();
  
  // Abrir o enfocar ventana de la app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no, abrir nueva ventana
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});

// Mensajes desde la aplicación
self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('[SW] Service Worker cargado correctamente');
