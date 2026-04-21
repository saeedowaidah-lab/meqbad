const CACHE = 'meqbad-v2';

// لا نخزّن index.html في الكاش أبداً
self.addEventListener('install', e => {
  self.skipWaiting(); // فعّل الـ SW الجديد فوراً دون انتظار
});

self.addEventListener('activate', e => {
  // احذف أي كاش قديم
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim(); // تحكّم في جميع التبويبات المفتوحة فوراً
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // تجاهل طلبات API الخارجية
  if (
    url.hostname.includes('supabase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('openrouter') ||
    url.hostname.includes('ipify') ||
    url.hostname.includes('cdnjs') ||
    url.hostname.includes('fonts.googleapis') ||
    url.hostname.includes('cdn.jsdelivr')
  ) return;

  // HTML — دائماً من الشبكة مع تجاوز الكاش (no-cache)
  if (
    e.request.destination === 'document' ||
    url.pathname.endsWith('.html') ||
    url.pathname.endsWith('/')
  ) {
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // باقي الملفات — شبكة أولاً ثم كاش
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// استجب لأمر التحديث من الصفحة
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
