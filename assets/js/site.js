"use strict";
window.addEventListener("load", () => document.body.classList.remove("is-preload"));
if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./service-worker.js").catch(() => {}));
}
