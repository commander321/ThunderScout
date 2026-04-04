const CACHE_NAME = "scouting-app-v1-test4";
const urlsToCache = [
  "/",
  "./index.html",
  "./styles.css",
  "./dist/app.js",
  "./dist/bluetooth.js",
  "./dist/components.js",
  "./dist/editor.js",
  "./dist/events.js",
  "./dist/matchdata.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

/*
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const response = await fetch(event.request);
      cache.put(event.request, response.clone());
      return response;
    })
  );
});
*/

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      try {
        const response = await fetch(event.request);
        cache.put(event.request, response.clone());
        return response;
      } catch {
        return caches.match(event.request);
      }
    })
  );
});

/*
self.addEventListener("fetch", event => {
  console.log("doing something else")
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});*/