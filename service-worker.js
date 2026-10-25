"use strict";
// Cache only the audited local app shell. No network-first caching of private BLE data.
const CACHE = "vanitas-static-v1";
const SHELL = [
  "./", "./index.html", "./vanitas.html", "./device-lab.html",
  "./assets/css/main.css", "./assets/css/noscript.css",
  "./assets/css/fontawesome-all.min.css", "./assets/css/font-awesome.min.css",
  "./assets/webfonts/fa-solid-900.woff2", "./assets/webfonts/fa-brands-400.woff2",
  "./assets/fonts/fontawesome-webfont.woff2",
  "./assets/css/style.css", "./assets/css/device-lab.css",
  "./assets/js/site.js", "./assets/js/device-lab.js",
  "./assets/css/images/bg.webp", "./assets/css/images/overlay.svg",
  "./assets/css/images/overlay-pattern.png", "./images/logo.png",
  "./images/wallpaper.webp", "./manifest.webmanifest",
  "./icons/icon-180.png", "./icons/icon-192.png", "./icons/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("vanitas-static-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
