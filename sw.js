/* Ringzeit service worker: the app works offline; updates are fetched in the background and used on the next start */
const CACHE = "ringzeit-202610271407";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // the app page itself: network first (so an update shows on the next start), the cached copy offline or after 3 s
  if (e.request.mode === "navigate") {
    e.respondWith(
      caches.open(CACHE).then((c) => {
        const net = fetch(e.request).then((r) => {
          if (r && r.ok) c.put("index.html", r.clone());
          return r;
        });
        const slow = new Promise((res) => setTimeout(res, 3000));
        return Promise.race([net, slow.then(() => c.match("index.html"))])
          .then((r) => r || net)
          .catch(() => c.match("index.html", { ignoreSearch: true }));
      }),
    );
    return;
  }
  e.respondWith(
    caches.open(CACHE).then((c) =>
      c.match(e.request, { ignoreSearch: true }).then((hit) => {
        const net = fetch(e.request)
          .then((r) => {
            if (r && r.ok) c.put(e.request, r.clone());
            return r;
          })
          .catch(() => hit);
        return hit || net;
      }),
    ),
  );
});
