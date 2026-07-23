// Service worker minim — doar ce ține de instalabilitate (Android/iOS cer un SW activ cu handler de
// `fetch` pt. promptul „Adaugă pe ecranul principal") + un shell offline de bază. NU cache-uiește
// requesturile către backend (alt origin, Render) — datele proiectului trebuie mereu proaspete/
// autentificate corect, nu servite dintr-un cache local care ar putea arăta date vechi sau ar
// complica invalidarea la logout.
const CACHE_NAME = "renovator-pro-v1";
const PRECACHE_URLS = ["/", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Doar same-origin (pagini/assets proprii, servite de Vercel) — cererile către backend (alt origin,
  // Render) trec direct la rețea, niciodată din cache.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/")))
  );
});
