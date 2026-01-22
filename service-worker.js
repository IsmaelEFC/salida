self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("salidas-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/app.js",
        "/manifest.json",
        "/images/logo.png",
        "/images/icon-192.png",
        "/images/icon-512.png",
        "/images/favicon.ico",
        "/listado_funcionarios.json",
        "/listado_vehiculos.json",
        "/listado_equipamiento.json"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});