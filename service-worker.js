// service-worker.js — Chơi offline (PWA) sau lần tải đầu tiên.
// MỖI LẦN SỬA GAME rồi đưa lên mạng: tăng số phiên bản dưới đây (vd: v1.0.1)
// để điện thoại tải bản mới thay vì dùng bản cũ đã lưu.
const CACHE_VERSION = "bongtrang-v1.2.2";
const RUNTIME = "bongtrang-runtime";

// Toàn bộ file của game, lưu sẵn ngay lần mở đầu tiên
const PRECACHE = [
  "./",
  "index.html",
  "style.css",
  "personal.js",
  "config.js",
  "manifest.json",
  "src/main.js",
  "src/save.js",
  "src/audio.js",
  "src/components/UI.js",
  "src/components/Tray.js",
  "src/components/Station.js",
  "src/components/Customer.js",
  "src/screens/BootScreen.js",
  "src/screens/MenuScreen.js",
  "src/screens/MapScreen.js",
  "src/screens/PrepScreen.js",
  "src/screens/GameScreen.js",
  "src/screens/ResultScreen.js",
  "src/screens/ShopScreen.js",
  "src/screens/AlbumScreen.js",
  "src/screens/ReviewScreen.js",
  "src/screens/EndingScreen.js",
  "assets/img/doodles.js",
  "assets/img/icon-180.png",
  "assets/img/icon-192.png",
  "assets/img/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE.map((u) => new Request(u, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

// Xoá bộ nhớ đệm của phiên bản cũ
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION && k !== RUNTIME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Font Google: lấy từ bộ nhớ đệm trước, chưa có thì tải rồi lưu lại
  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(RUNTIME).then((cache) => cache.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
        return res;
      })))
    );
    return;
  }
  if (url.origin !== self.location.origin) return;

  // File của game: dùng bản đã lưu, đồng thời tải bản mới để lần sau dùng (ảnh kỷ niệm cũng được lưu khi đã xem)
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(hit ? CACHE_VERSION : RUNTIME).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit || (req.mode === "navigate" ? caches.match("index.html") : Response.error()));
      return hit || net;
    })
  );
});
