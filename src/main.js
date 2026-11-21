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

  // ---------------- Khởi động ----------------
  function start() {
    applyColors();
    document.title = window.PERSONAL.shopName;
    document.getElementById("rotate-text").textContent = UI.t("rotate");
    Router.root = UI.app();
    applyUnit();
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
      // service-worker.js sẽ được đăng ký ở Giai đoạn 6 (PWA chơi offline).
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
