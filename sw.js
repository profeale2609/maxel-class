// Service worker: permite instalar la app y abrirla rápido.
// Siempre intenta traer la versión más nueva; si no hay internet, usa la guardada.
const CACHE = "maxel-v7";
const ARCHIVOS = ["./", "./index.html", "./config.js", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== location.origin) return; // Firebase y librerías van directo
  e.respondWith(
    fetch(req, { cache: "no-cache" })
      .then(res => { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
  );
});
