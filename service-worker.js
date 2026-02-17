// ===== MEIR PANIM SERVICE WORKER =====
// גרסה - שנה את המספר הזה בכל עדכון!
const VERSION = '2.0.2';
const CACHE_NAME = `meir-panim-v${VERSION}`;

// קבצים לשמירה במטמון
const STATIC_FILES = [
  '/',
  '/home.html',
  '/login.html',
  '/registration-firebase.html',
  '/volunteer-firebase.html',
  '/admin-firebase.html',
  '/users-config.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// ===== התקנה - מחק Cache ישן וטען חדש =====
self.addEventListener('install', event => {
  console.log(`[SW] Installing version ${VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_FILES);
    }).then(() => {
      // כפה החלפה מיידית - לא מחכה לסגירת טאבים
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
      // קח שליטה על כל הלקוחות מיד
      return self.clients.claim();
    })
  );
});

// ===== בקשות - Network First (תמיד מהרשת תחילה!) =====
self.addEventListener('fetch', event => {
  // דלג על בקשות שאינן GET
  if (event.request.method !== 'GET') return;

  // דלג על בקשות חיצוניות (Firebase, Twilio וכו')
  const url = new URL(event.request.url);
  if (!url.origin.includes('github.io') && !url.origin.includes('localhost')) {
    return;
  }

  event.respondWith(
    // נסה רשת תחילה
    fetch(event.request)
      .then(response => {
        // אם הצליח - שמור במטמון ותחזיר
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // אם אין רשת - חזור למטמון
        return caches.match(event.request);
      })
  );
});

// ===== הודעה לעדכון =====
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'getVersion') {
    event.ports[0].postMessage(VERSION);
  }
});
