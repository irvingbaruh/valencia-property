// Lock & Loft site app: shows push notifications for members. It caches nothing, so the site is always current.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { title: 'Lock & Loft', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(
    self.registration.showNotification(d.title || 'Lock & Loft', {
      body: d.body || '',
      icon: '/brand/app-192.png',
      badge: '/brand/app-192.png',
      tag: d.tag || undefined,
      renotify: !!d.tag,
      data: { url: d.url || '/' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.indexOf('/lockandloft/admin/') === -1 && 'focus' in c) {
          return c.focus().then(() => ('navigate' in c ? c.navigate(url) : undefined));
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
