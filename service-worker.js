// service-worker.js — Chơi offline (PWA).
// Giai đoạn 1: CHƯA đăng ký (main.js chưa gọi), để khi sửa code không bị trình duyệt giữ bản cũ.
// Giai đoạn 6 sẽ thêm danh sách file cần lưu, đổi tên bộ nhớ đệm theo phiên bản để cập nhật.
const CACHE_VERSION = "bongtrang-v1.0.0";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
