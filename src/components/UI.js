// UI.js — Công cụ dựng giao diện dùng chung: nút, popup, thông báo nhỏ, chữ bay, định dạng tiền.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = {};

  UI.app = () => document.getElementById("app");

  UI.el = function (tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) {
      if (text instanceof Node) e.appendChild(text);
      else e.textContent = String(text);
    }
    return e;
  };

  UI.cap = (s) => (s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : "");

  // Biến dùng chung lấy từ personal.js
  function baseVars() {
    const P = window.PERSONAL;
    return { her: P.herName, me: P.myName, nick: P.myNickname, shop: P.shopName, pet: P.petName };
  }

  // Thay {ten} trong câu. {Ten} viết hoa chữ đầu sẽ tự viết hoa giá trị của {ten}.
  UI.fmt = function (tpl, vars) {
    const v = Object.assign(baseVars(), vars || {});
    return String(tpl).replace(/\{(\w+)\}/g, (m, k) => {
      if (v[k] !== undefined) return String(v[k]);
      const lower = k.charAt(0).toLowerCase() + k.slice(1);
      if (k !== lower && v[lower] !== undefined) return UI.cap(UI.fmt(v[lower], vars));
      return m;
    });
  };

  UI.t = function (key, vars) {
    const raw = CONFIG.texts[key];
    if (raw === undefined) return key;
    if (Array.isArray(raw)) return UI.fmt(UI.pick(raw), vars);
    return UI.fmt(raw, vars);
  };

  UI.money = function (k) {
    const n = Math.round(k * 10) / 10;
    return String(n).replace(".", ",") + CONFIG.money.unit;
  };

  UI.rating = (r) => r.toFixed(1).replace(".", ",");

  UI.rand = (a, b) => a + Math.random() * (b - a);
  UI.randInt = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  UI.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  UI.weighted = function (items, weightOf) {
    const total = items.reduce((s, it) => s + weightOf(it), 0);
    let r = Math.random() * total;
    for (const it of items) { r -= weightOf(it); if (r <= 0) return it; }
    return items[items.length - 1];
  };

  UI.ing = (id) => CONFIG.ingredients[id];
  UI.recipe = (id) => CONFIG.recipes.find((r) => r.id === id);
  UI.dayCfg = (day) => CONFIG.days.find((d) => d.day === day);
  UI.recipePrice = function (id) {
    const r = UI.recipe(id);
    const fav = id === window.PERSONAL.favoriteDish ? CONFIG.money.favoriteMultiplier : 1;
    return r.price * fav;
  };

  // Gom listener & hẹn giờ của một màn hình để dọn sạch khi rời màn (tránh rò rỉ bộ nhớ).
  UI.scope = function () {
    const offs = [];
    const timers = new Set();
    const rafs = new Set();
    return {
      on(target, ev, fn, opt) {
        target.addEventListener(ev, fn, opt);
        offs.push(() => target.removeEventListener(ev, fn, opt));
      },
      timeout(fn, ms) {
        const id = setTimeout(() => { timers.delete(id); fn(); }, ms);
        timers.add(id);
        return id;
      },
      raf(fn) {
        const id = requestAnimationFrame((t) => { rafs.delete(id); fn(t); });
        rafs.add(id);
        return id;
      },
      clear() {
        offs.splice(0).forEach((f) => f());
        timers.forEach((id) => clearTimeout(id));
        timers.clear();
        rafs.forEach((id) => cancelAnimationFrame(id));
        rafs.clear();
      }
    };
  };

  UI.button = function (label, cls, onClick) {
    const b = UI.el("button", "btn " + (cls || ""), label);
    b.type = "button";
    if (onClick) {
      b.addEventListener("click", (e) => {
        if (b.disabled) return;
        BT.Audio.play("tap");
        onClick(e);
      });
    }
    return b;
  };

  UI.iconButton = function (icon, label, onClick, cls) {
    const b = UI.el("button", "icon-btn " + (cls || ""), icon);
    b.type = "button";
    b.setAttribute("aria-label", label);
    if (onClick) b.addEventListener("click", (e) => { BT.Audio.play("tap"); onClick(e); });
    return b;
  };

  // Thanh trên có nút "←" Quay lại
  UI.topbar = function (title, onBack, right) {
    const bar = UI.el("div", "topbar");
    if (onBack) bar.appendChild(UI.iconButton("←", UI.t("back"), onBack, "back-btn"));
    else bar.appendChild(UI.el("div", "topbar-spacer"));
    bar.appendChild(UI.el("h1", "topbar-title", title));
    bar.appendChild(right || UI.el("div", "topbar-spacer"));
    return bar;
  };

  // ---------- Thông báo nhỏ ----------
  let lastToast = { msg: "", at: 0 };
  UI.toast = function (msg, ms) {
    const now = Date.now();
    if (msg === lastToast.msg && now - lastToast.at < 600) return;
    lastToast = { msg, at: now };
    let box = document.getElementById("toasts");
    if (!box) { box = UI.el("div"); box.id = "toasts"; UI.app().appendChild(box); }
    while (box.children.length >= 2) box.firstChild.remove();
    const t = UI.el("div", "toast", msg);
    box.appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 250); }, ms || 1700);
  };

  // ---------- Popup ----------
  UI.modals = [];
  UI.modal = function (opts) {
    const { title, body, buttons = [], className = "", onClose, dismissable = false } = opts;
    const layer = UI.el("div", "modal-layer " + className);
    const box = UI.el("div", "modal");
    if (title) box.appendChild(UI.el("h2", "modal-title", title));
    const b = UI.el("div", "modal-body");
    if (typeof body === "string") b.textContent = body;
    else if (body) b.appendChild(body);
    box.appendChild(b);
    const row = UI.el("div", "modal-buttons");
    let closed = false;
    const api = {
      el: layer,
      dismissable,
      close(silent) {
        if (closed) return;
        closed = true;
        UI.modals = UI.modals.filter((m) => m !== api);
        layer.classList.add("closing");
        setTimeout(() => layer.remove(), 160);
        if (onClose && !silent) onClose();
      }
    };
    buttons.forEach((btn) => {
      const e = UI.button(btn.label, btn.cls || "btn-pink", () => {
        if (!btn.keepOpen) api.close(true);
        if (btn.onClick) btn.onClick(api);
      });
      if (btn.disabled) e.disabled = true;
      row.appendChild(e);
    });
    if (buttons.length) box.appendChild(row);
    layer.appendChild(box);
    if (dismissable) {
      layer.addEventListener("click", (e) => { if (e.target === layer) api.close(); });
    }
    (opts.parent || UI.app()).appendChild(layer);
    UI.modals.push(api);
    return api;
  };

  UI.closeTopModal = function () {
    const top = UI.modals[UI.modals.length - 1];
    if (top && top.dismissable) { top.close(); return true; }
    return !!top; // có popup không đóng được thì vẫn chặn nút quay lại
  };

  UI.closeAllModals = function () {
    UI.modals.slice().forEach((m) => m.close(true));
  };

  // ---------- Hiệu ứng ----------
  UI.center = function (el) {
    const a = UI.app().getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left - a.left + r.width / 2, y: r.top - a.top + r.height / 2 };
  };

  function fxLayer() {
    let fx = document.getElementById("fx");
    if (!fx) { fx = UI.el("div"); fx.id = "fx"; UI.app().appendChild(fx); }
    return fx;
  }

  UI.floatText = function (x, y, text, cls) {
    const e = UI.el("div", "float-text " + (cls || ""), text);
    e.style.left = x + "px";
    e.style.top = y + "px";
    fxLayer().appendChild(e);
    setTimeout(() => e.remove(), 1200);
  };

  // Bay cong từ điểm a tới điểm b
  UI.fly = function (a, b, content, sec, cls) {
    const e = UI.el("div", "fly " + (cls || ""), content);
    e.style.left = "0px";
    e.style.top = "0px";
    fxLayer().appendChild(e);
    const midX = (a.x + b.x) / 2;
    const midY = Math.min(a.y, b.y) - 50;
    const frames = [
      { transform: `translate(${a.x}px, ${a.y}px) translate(-50%, -50%) scale(1)` },
      { transform: `translate(${midX}px, ${midY}px) translate(-50%, -50%) scale(1.15)` },
      { transform: `translate(${b.x}px, ${b.y}px) translate(-50%, -50%) scale(0.8)` }
    ];
    if (e.animate) {
      const anim = e.animate(frames, { duration: sec * 1000, easing: "ease-in-out" });
      anim.onfinish = () => e.remove();
    } else {
      setTimeout(() => e.remove(), sec * 1000);
    }
  };

  UI.shake = function (el) {
    if (!el) return;
    el.classList.remove("shake-x");
    void el.offsetWidth;
    el.classList.add("shake-x");
    setTimeout(() => el.classList.remove("shake-x"), 400);
  };

  UI.confetti = function (count) {
    const fx = fxLayer();
    const colors = [CONFIG.colors.pink, CONFIG.colors.yellow, CONFIG.colors.green, CONFIG.colors.purple, CONFIG.colors.orange];
    for (let i = 0; i < count; i++) {
      const c = UI.el("div", "confetti");
      c.style.left = UI.rand(0, 100) + "%";
      c.style.background = UI.pick(colors);
      c.style.animationDelay = UI.rand(0, 0.5) + "s";
      c.style.animationDuration = UI.rand(1.4, 2) + "s";
      c.style.setProperty("--drift", UI.rand(-60, 60) + "px");
      c.style.setProperty("--spin", UI.rand(180, 720) + "deg");
      fx.appendChild(c);
      setTimeout(() => c.remove(), 2600);
    }
  };

  // Số ngày bên nhau = hôm nay − ngày kỷ niệm
  UI.loveDays = function () {
    const parts = String(window.PERSONAL.anniversary).split("-").map(Number);
    const start = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(0, Math.round((today - start) / 86400000));
  };

  BT.UI = UI;
})();
