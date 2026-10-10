/* AN SW v5 — cache only versioned/static assets, never pages or API responses. */
var CACHE = "an-shell-v5";
var PRECACHE = ["/manifest.webmanifest", "/assets/akbar-favicon.jpg"];

function isStaticAsset(pathname) {
  return pathname.indexOf("/assets/") === 0 || pathname.indexOf("/_next/static/") === 0;
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return (
              key !== CACHE &&
              (key.indexOf("an-shell-v") === 0 || key.indexOf("an-static-v") === 0)
            );
          })
          .map(function (key) {
            return caches.delete(key);
          }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  var url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  // Do not cache Next.js pages, routes, JSON content, or authenticated APIs.
  // In particular, never map every page response to a shared `/index.html` key.
  if (!isStaticAsset(url.pathname) && url.pathname !== "/manifest.webmanifest") return;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return fetch(request)
        .then(function (response) {
          if (response.ok && response.type === "basic") {
            // Cache.put rejects partial (206) media responses in browsers. A
            // cache failure must never turn a successful network fetch into an
            // offline error.
            return cache.put(request, response.clone()).then(
              function () {
                return response;
              },
              function () {
                return response;
              },
            );
          }
          return response;
        })
        .catch(function () {
          return cache.match(request).then(function (cached) {
            return cached || Response.error();
          });
        });
    }),
  );
});
