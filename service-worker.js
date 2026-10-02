const CACHE_NAME = "turno-mina-cache-v3";
const APP_SHELL = [
  "./manifest.json",
  "./icons/icon.svg",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js",
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

async function networkFirst(request){
  try {
    const response = await fetch(request);
    if(response && response.status === 200){
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch(err){
    const cached = await caches.match(request);
    if(cached) return cached;
    const fallback = await caches.match("./index.html");
    if(fallback) return fallback;
    throw err;
  }
}

async function cacheFirst(request){
  const cached = await caches.match(request);
  if(cached) return cached;
  const response = await fetch(request);
  if(response && response.status === 200 && response.type !== "opaque"){
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  if(event.request.method !== "GET") return;

  const isNavigation = event.request.mode === "navigate" ||
    event.request.destination === "document" ||
    event.request.url.endsWith("index.html") ||
    event.request.url.endsWith("/");

  if(isNavigation){
    event.respondWith(networkFirst(event.request));
  } else {
    event.respondWith(cacheFirst(event.request));
  }
});
