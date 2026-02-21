// ===== MEIR PANIM SERVICE WORKER =====
// גרסה - שנה את המספר הזה בכל עדכון!
const VERSION = '2.0.3';
const CACHE_NAME = `meir-panim-v${VERSION}`;

// קבצים לשמירה במטמון
const STATIC_FILES = [
  '/',
  '/index.html',
  '/home.html',
  '/login.html',
  '/volunteer-firebase.html',
  '/admin-firebase.html',
  '/users-config.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/intro-video.mp4'
];

// ===== התקנה - מחק Cache ישן וטען חדש =====
self.addEventListener('install', event => {
  console.log(`[SW] Installing version ${VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // addAll נכשל אם קובץ אחד חסר - נשתמש ב-add בנפרד
      return Promise.allSettled(
        STATIC_FILES.map(file => cache.add(file).catch(e => {
          console.warn(`[SW] Could not cache: ${file}`, e);
        }))
      );
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// ===== הפעלה - מחק כל ה-Cache הישן =====
self.addEventListener('activate', event => {
  console.log(`[SW] Activating version ${VERSION}`);
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ===== בקשות - Network First =====
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (!url.origin.includes('github.io') && !url.origin.includes('localhost')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// ===== הודעות =====
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
  if (event.data === 'getVersion') {
    event.ports[0].postMessage(VERSION);
  }
});
