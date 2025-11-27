const CACHE_VERSION = 'v2-cache-first-assets';
const CACHE_STATIC_ASSETS = CACHE_VERSION + '-static';
const CACHE_DYNAMIC = CACHE_VERSION + '-dynamic';

// URLs que devem ser sempre cache-first (incluindo pwa assets)
const staticUrls = [
  '/',
  '/index.html',
  '/logo.svg',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/pwa-maskable-512x512.png',
  '/pwa-180x180.png'
];

// 1. Instalação: Caching de assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIC_ASSETS)
      .then(cache => {
        console.log('[Service Worker] Caching static assets:', staticUrls);
        // O `cache.addAll` falhará se qualquer URL falhar. Isso garante que todos os assets estáticos sejam baixados.
        return cache.addAll(staticUrls);
      })
  );
  // Força o novo Service Worker a assumir o controle imediatamente
  self.skipWaiting();
});

// 2. Ativação: Limpeza de caches antigos (Cache Versioning)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_STATIC_ASSETS, CACHE_DYNAMIC];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Reclama o controle dos clientes sem esperar pelo refresh da página
  event.waitUntil(self.clients.claim());
});


// 3. Fetch: Estratégia de Cache-First para Assets
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // URLs de build/Assets (que geralmente têm hash no nome)
  const isBuildAsset = requestUrl.pathname.startsWith('/assets/');
  
  if (staticUrls.includes(requestUrl.pathname) || isBuildAsset || event.request.destination === 'style' || event.request.destination === 'script' || event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => {
        // Cache Hit - Retorna imediatamente (Cache-First)
        if (response) {
          return response;
        }
        
        // Cache Miss - Busca na rede e armazena (para assets dinâmicos/novos)
        return fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_DYNAMIC).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch(() => {
            // Falha na rede e sem cache - retorna um fallback (neste caso, null)
            return caches.match('/index.html');
        });
      })
    );
    return;
  }
  
  // Para outras requisições (e.g., APIs), usa Network-Only.
  event.respondWith(fetch(event.request));

});

// 4. Listener de Mensagens (Comunicação do App com o SW)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message. Forcing service worker activation.');
    self.skipWaiting();
  }
});