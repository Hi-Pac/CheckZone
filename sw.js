const CACHE_NAME = 'checkzone-cache-v2';
const ASSETS_TO_CACHE = [
  './',
  'index.html',
  'admin.html',
  'admin-dashboard.html',
  'salaries.html',
  'salary-settings.html',
  'deduction-settings.html',
  'penalties.html',
  'rewards.html',
  'style.css',
  'manifest.json',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
