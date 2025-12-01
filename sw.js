
const STATIC_CACHE = "daily-dash-static-v1";
const RUNTIME_CACHE = "daily-dash-runtime-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/public/styles.css",
  "/public/manifest.json",
  "/public/icons/icon-192.png",
  "/public/icons/icon-512.png",
  "/firebase.js",
  "/auth.js",
  "/idb.js",
  "/sync.js",
  "/app.js"
];


self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![STATIC_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);


  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }
  event.respondWith(
    fetch(req)
      .then((res) => {
        const resClone = res.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(req, resClone));
        return res;
      })
      .catch(() => caches.match(req))
  );
});
