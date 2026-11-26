// main.js — Khởi tạo ứng dụng, quản lý chuyển màn hình (ScreenRouter), nút Quay lại, tự tạm dừng.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  // ---------------- ScreenRouter ----------------
  const Router = {
    stack: [],        // [{ name, params }]
    current: null,    // đối tượng màn đang chạy
    root: null,

    mount(entry) {
      if (this.current && this.current.destroy) this.current.destroy();
      UI.closeAllModals();
      this.root.innerHTML = "";
      const screen = BT.Screens[entry.name];
      const map = CONFIG.audio.screenMusic;
      if (Object.prototype.hasOwnProperty.call(map, entry.name)) BT.Audio.music(map[entry.name]);
      this.current = screen.mount(this.root, entry.params || {}, this) || {};
      this.root.scrollTop = 0;
    },

    go(name, params, opts) {
      const entry = { name, params: params || {} };
      if (opts && opts.replace && this.stack.length) this.stack[this.stack.length - 1] = entry;
      else this.stack.push(entry);
      this.mount(entry);
    },

    back() {
      if (this.stack.length <= 1) return false;
      this.stack.pop();
      this.mount(this.stack[this.stack.length - 1]);
      return true;
    },

    // Quay về một màn trong lịch sử; không có thì thay màn hiện tại bằng màn đó.
    backTo(name) {
      const i = this.stack.map((e) => e.name).lastIndexOf(name);
      if (i >= 0) {
        this.stack.length = i + 1;
        this.mount(this.stack[i]);
      } else {
        this.go(name, {}, { replace: true });
      }
    },

    // Nút Back của Android / phím Esc
    handleBack() {
      if (this.current && this.current.onBack && this.current.onBack()) return;
      if (UI.modals.length) { UI.closeTopModal(); return; }
      this.back();
    },

    hide() {
      if (this.current && this.current.onHide) this.current.onHide();
    }
  };
  BT.Router = Router;

  // ---------------- Khung hình ----------------
  function applyColors() {
    const map = {
      cream: "--cream", pink: "--pink", pinkLight: "--pink-light", pinkDark: "--pink-dark", orange: "--orange",
      yellow: "--yellow", green: "--green", red: "--red", purple: "--purple", brown: "--brown",
      wood1: "--wood1", wood2: "--wood2", white: "--white", shadow: "--shadow", loadTrack: "--load-track", loadFill: "--load-fill"
    };
    const rs = document.documentElement.style;
    Object.keys(map).forEach((k) => { if (CONFIG.colors[k]) rs.setProperty(map[k], CONFIG.colors[k]); });
  }

  // --u = 1 đơn vị trên khung tham chiếu 720px
  function applyUnit() {
    const app = UI.app();
    const w = app.clientWidth || 360;
    app.style.setProperty("--u", (w / 720).toFixed(4) + "px");
  }

  function isLandscapePhone() {
    return window.matchMedia("(orientation: landscape) and (hover: none) and (max-height: 560px)").matches;
  }

  // ---------------- Toàn màn hình ----------------
  // Trình duyệt chỉ cho bật toàn màn hình sau một lần chạm, nên game bật ở lần chạm đầu
  // (và bật lại nếu lỡ thoát ra). Tắt được trong Cài đặt. iPhone: dùng "Thêm vào MH chính".
  const Fullscreen = {
    supported() { const d = document.documentElement; return !!(d.requestFullscreen || d.webkitRequestFullscreen); },
    active() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement) ||
        window.matchMedia("(display-mode: fullscreen)").matches;
    },
    enter() {
      if (!this.supported() || this.active()) return;
      const d = document.documentElement;
      try {
        const r = d.requestFullscreen ? d.requestFullscreen({ navigationUI: "hide" }) : d.webkitRequestFullscreen();
        if (r && r.catch) r.catch(() => {});
      } catch (e) { /* trình duyệt từ chối thì thôi */ }
    },
    exit() {
      if (!(document.fullscreenElement || document.webkitFullscreenElement)) return;
      try {
        const r = document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen();
        if (r && r.catch) r.catch(() => {});
      } catch (e) { /* bỏ qua */ }
    },
    apply() { if (BT.Save.state.settings.fullscreen) this.enter(); else this.exit(); }
  };
  BT.Fullscreen = Fullscreen;

  // ---------------- Khởi động ----------------
  function start() {
    applyColors();
    BT.Save.load();
    BT.Safety.requestPersist();
    BT.applyTextScale();
    if (BT.Save.recovered) setTimeout(() => UI.toast(UI.t("backupRecovered"), 3500), 1200);
    document.title = window.PERSONAL.shopName;
    UI.setText(document.getElementById("rotate-text"), UI.t("rotate"));
    UI.setText(document.querySelector("#rotate-overlay .rotate-icon"), "📱");
    Router.root = UI.app();
    applyUnit();
    const autoFull = () => { if (BT.Save.state.settings.fullscreen) Fullscreen.enter(); };
    document.addEventListener("click", autoFull, true);
    document.addEventListener("touchend", autoFull, true);
    window.addEventListener("resize", () => {
      applyUnit();
      if (isLandscapePhone()) Router.hide();
    });

    // Chỉ nạp manifest khi chạy qua web (http/https) — mở file trực tiếp thì bỏ qua để không báo lỗi.
    if (/^https?:$/.test(location.protocol)) {
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "manifest.json";
      document.head.appendChild(link);
      // PWA: chơi offline sau lần tải đầu, "Thêm vào màn hình chính"
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("service-worker.js").then((reg) => {
            reg.addEventListener("updatefound", () => {
              const w = reg.installing;
              if (!w) return;
              w.addEventListener("statechange", () => {
                if (w.state === "installed" && navigator.serviceWorker.controller) UI.toast(UI.t("updateReady"), 4000);
              });
            });
          }).catch(() => { /* không có PWA thì game vẫn chạy bình thường */ });
        });
      }
    }

    // Trình duyệt nhúng trong Messenger / Zalo / Facebook / Instagram → nhắc mở bằng Safari hoặc Chrome
    if (/FBAN|FBAV|FB_IAB|FBIOS|Messenger|Zalo|Instagram/i.test(navigator.userAgent || "")) {
      const bar = UI.el("div", "embed-banner");
      bar.appendChild(UI.el("span", "", UI.t("embeddedBrowser")));
      bar.appendChild(UI.iconButton("✕", UI.t("btnClose"), () => bar.remove()));
      setTimeout(() => document.body.appendChild(bar), 1500);
    }

    // Bật âm thanh sau lần chạm đầu tiên
    const unlock = () => BT.Audio.unlock();
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock);

    // Ẩn tab / khoá màn hình → tạm dừng
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { Router.hide(); BT.Audio.suspend(); }
      else BT.Audio.resume();
    });
    window.addEventListener("pagehide", () => Router.hide());

    // Phím Esc
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); Router.handleBack(); }
    });

    // Nút Back vật lý: luôn giữ một mục lịch sử dự phòng
    try {
      history.replaceState({ bt: 0 }, "");
      history.pushState({ bt: 1 }, "");
      window.addEventListener("popstate", () => {
        Router.handleBack();
        history.pushState({ bt: 1 }, "");
      });
    } catch (e) { /* mở bằng file:// trên vài trình duyệt có thể chặn, bỏ qua */ }

    // Chặn menu chuột phải / giữ lâu trên điện thoại
    document.addEventListener("contextmenu", (e) => e.preventDefault());

    Router.go("Boot");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
