const CACHE = 'meqbad-v2';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // للـ API calls لا نستخدم الـ cache
  if (e.request.url.includes('supabase') || e.request.url.includes('googleapis') || e.request.url.includes('openrouter')) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
