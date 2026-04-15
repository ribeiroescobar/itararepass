const STATIC_CACHE = "itarare-static-v2";
const RUNTIME_CACHE = "itarare-runtime-v2";
const IMAGE_CACHE = "itarare-images-v2";
const API_CACHE = "itarare-api-v2";

const APP_SHELL_ROUTES = [
  "/",
  "/login",
  "/explore",
  "/map",
  "/coupons",
  "/profile",
  "/about",
  "/events",
  "/sos",
];

const PRECACHE_URLS = [
  ...APP_SHELL_ROUTES,
  "/offline.html",
  "/manifest.json",
  "/logo.jpeg",
];

const API_CACHE_ALLOWLIST = ["/api/spots", "/api/coupons/catalog", "/api/geo/cities"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE, IMAGE_CACHE, API_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;

    if (fallbackUrl) {
      const fallback = await caches.match(fallbackUrl);
      if (fallback) return fallback;
    }

    throw new Error("offline");
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  if (cached) return cached;

  const network = await networkPromise;
  if (network) return network;

  throw new Error("offline");
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    const navigationFallback = APP_SHELL_ROUTES.includes(url.pathname) ? url.pathname : "/offline.html";
    event.respondWith(networkFirst(request, RUNTIME_CACHE, navigationFallback));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/image")) {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
    return;
  }

  if (url.origin === self.location.origin && API_CACHE_ALLOWLIST.includes(url.pathname)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (url.origin === self.location.origin && PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  if (request.destination === "image") {
    event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
  }
});
