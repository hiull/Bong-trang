// UI.js — Công cụ dựng giao diện dùng chung: nút, popup, thông báo nhỏ, chữ bay, định dạng tiền.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = {};

  UI.app = () => document.getElementById("app");

  // ---------- Hình doodle thay cho emoji ----------
  // assets/img/doodles.js: DOODLES (id → SVG), DOODLE_MAP (emoji → id).
  // Mọi chữ hiển thị đi qua UI.rich: emoji nào có hình doodle sẽ được thay bằng hình.
  const DD = window.DOODLES || {};
  const NORM = (s) => String(s).replace(/\uFE0F/g, "");
  const EMAP = {};
  Object.keys(window.DOODLE_MAP || {}).forEach((k) => { EMAP[NORM(k)] = window.DOODLE_MAP[k]; });
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const KEYS = Object.keys(EMAP).sort((a, b) => b.length - a.length).map(esc);
  const RE = KEYS.length ? new RegExp("(" + KEYS.join("|") + ")", "gu") : null;

  UI.icon = function (id, cls) {
    const s = document.createElement("span");
    s.className = "dd dd-" + id + (cls ? " " + cls : "");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = DD[id] ? '<svg viewBox="0 0 64 64">' + DD[id] + "</svg>" : "";
    return s;
  };

  // Tách chữ thành các phần: chữ thường và emoji (để hiện từng ký tự / thay hình)
  UI.tokens = function (text) {
    const s = NORM(text);
    if (!RE) return Array.from(s);
    const out = [];
    let last = 0;
    s.replace(RE, (m, g, off) => {
      if (off > last) out.push(...Array.from(s.slice(last, off)));
      out.push(m);
      last = off + m.length;
      return m;
    });
    if (last < s.length) out.push(...Array.from(s.slice(last)));
    return out;
  };

  UI.rich = function (el, text) {
    el.textContent = "";
    const s = NORM(text);
    if (!RE) { el.textContent = s; return el; }
    let last = 0;
    s.replace(RE, (m, g, off) => {
      if (off > last) el.appendChild(document.createTextNode(s.slice(last, off)));
      el.appendChild(UI.icon(EMAP[m]));
      last = off + m.length;
      return m;
    });
    if (last < s.length) el.appendChild(document.createTextNode(s.slice(last)));
    return el;
  };
  UI.setText = UI.rich;

  UI.el = function (tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined && text !== null) {
      if (text instanceof Node) e.appendChild(text);
      else UI.rich(e, String(text));
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
    if (typeof body === "string") UI.rich(b, body);
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

  // Tên ngày dùng trong câu: 5 → "5", "secret" → "bí mật"
  UI.dayName = (day) => (typeof day === "number" ? String(day) : CONFIG.texts.dayNames[day] || String(day));
  // Ngày dạng số để so với openDay (Ngày bí mật = sau Ngày 15)
  UI.num1 = (x) => String(Math.round(x * 100) / 100).replace(".", ",");
  UI.runTitle = (run) => {
    if (!run) return "";
    if (run.mode === "secret") return UI.t("runSecret");
    if (run.mode === "daily") return UI.t("runDaily");
    if (run.mode === "endless") return UI.t("runEndless");
    return UI.t("runMs", { n: run.ms });
  };
  UI.dayLevel = (day) => (typeof day === "number" ? day : CONFIG.build.maxPlayableDay + 1);

  // Chữ hiện từng ký tự; chạm để hiện hết ngay
  UI.typewriter = function (el, text, msPerChar, onDone) {
    const chars = UI.tokens(text);
    let i = 0;
    let timer = null;
    let done = false;
    el.textContent = "";
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      UI.rich(el, text);
      if (onDone) onDone();
    };
    const step = () => {
      if (done) return;
      i++;
      UI.rich(el, chars.slice(0, i).join(""));
      if (i >= chars.length) finish();
      else timer = setTimeout(step, msPerChar);
    };
    timer = setTimeout(step, msPerChar);
    return { finish, isDone: () => done };
  };

  // Ảnh kỷ niệm; thiếu ảnh hoặc lỗi → khung trái tim hồng (không bao giờ hiện icon ảnh vỡ)
  UI.memoryPhoto = function (mem, cls) {
    const box = UI.el("div", "mem-photo " + (cls || ""));
    const ph = UI.el("div", "mem-placeholder");
    ph.appendChild(UI.el("div", "mem-heart", "❤"));
    ph.appendChild(UI.el("div", "mem-ph-title", mem.title));
    box.appendChild(ph);
    if (mem.photo) {
      const img = new Image();
      img.alt = "";
      img.draggable = false;
      img.onload = () => { if (img.naturalWidth > 0) { box.appendChild(img); box.classList.add("has-img"); } };
      img.onerror = () => {};
      img.src = mem.photo;
    }
    return box;
  };

  // Xem phóng to 1 thẻ kỷ niệm; list = mảng chỉ số đã mở, vuốt trái/phải để chuyển
  UI.openMemory = function (index, opts) {
    opts = opts || {};
    const mems = window.PERSONAL.memories;
    const list = opts.list || [index];
    let pos = Math.max(0, list.indexOf(index));
    const wrap = UI.el("div", "mem-view");
    let tw = null;
    const show = () => {
      const i = list[pos];
      const m = mems[i];
      wrap.innerHTML = "";
      wrap.appendChild(UI.memoryPhoto(m, "big"));
      wrap.appendChild(UI.el("div", "mem-title", m.title));
      wrap.appendChild(UI.el("div", "mem-date", m.date));
      const text = UI.el("div", "mem-text");
      wrap.appendChild(text);
      if (opts.typing) tw = UI.typewriter(text, m.text, CONFIG.gameplay.typeMsPerChar);
      else UI.rich(text, m.text);
      if (list.length > 1) {
        const nav = UI.el("div", "mem-nav");
        const prev = UI.iconButton("◀", UI.t("zonePrev"), () => { pos = (pos - 1 + list.length) % list.length; show(); });
        const next = UI.iconButton("▶", UI.t("zoneNext"), () => { pos = (pos + 1) % list.length; show(); });
        nav.appendChild(prev);
        nav.appendChild(UI.el("span", "mem-pos", (pos + 1) + "/" + list.length));
        nav.appendChild(next);
        wrap.appendChild(nav);
      }
    };
    show();
    wrap.addEventListener("click", () => { if (tw && !tw.isDone()) tw.finish(); });
    let sx = null;
    wrap.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    wrap.addEventListener("pointerup", (e) => {
      if (sx === null || list.length < 2) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 60) { pos = (pos + (dx < 0 ? 1 : -1) + list.length) % list.length; show(); }
    });
    return UI.modal({
      body: wrap,
      className: "modal-memory",
      dismissable: true,
      onClose: opts.onClose,
      buttons: [{ label: UI.t("btnClose"), cls: "btn-pink", onClick: opts.onClose }]
    });
  };

  // Tia nước / lòng đỏ lan tròn tại một điểm
  UI.splash = function (p, color) {
    let fx = document.getElementById("fx");
    if (!fx) { fx = UI.el("div"); fx.id = "fx"; UI.app().appendChild(fx); }
    const e = UI.el("div", "splash");
    e.style.left = p.x + "px";
    e.style.top = p.y + "px";
    e.style.setProperty("--c", color || "#FFD54F");
    fx.appendChild(e);
    setTimeout(() => e.remove(), 600);
  };

  // Trái tim bay khắp màn hình
  UI.heartBurst = function (count, sec) {
    let fx = document.getElementById("fx");
    if (!fx) { fx = UI.el("div"); fx.id = "fx"; UI.app().appendChild(fx); }
    for (let i = 0; i < count; i++) {
      const h = UI.el("div", "burst-heart", UI.pick(["💖", "💕", "💗", "❤️"]));
      h.style.left = UI.rand(5, 90) + "%";
      h.style.animationDuration = sec + "s";
      h.style.animationDelay = UI.rand(0, sec * 0.4) + "s";
      h.style.setProperty("--drift", UI.rand(-60, 60) + "px");
      fx.appendChild(h);
      setTimeout(() => h.remove(), sec * 1400 + 200);
    }
  };

  // Vẽ trang trí, thú cưng và lớp giao diện mùa lên mặt tiền tiệm (dùng ở màn hình chính & màn bán hàng)
  UI.decorateFront = function (front) {
    const S = BT.Save.state;
    front.querySelectorAll(".skin-fx, .decor, .pets, .curtain").forEach((x) => x.remove());
    const fx = UI.el("div", "skin-fx");
    const add = (cls, text) => fx.appendChild(UI.el("div", cls, text));
    if (S.activeSkin === "valentine") { add("sfx-row", "🎈 💕 🎈 💕 🎈"); add("sfx-corner", "🍫💝"); }
    if (S.activeSkin === "trung_thu") { add("sfx-moon", "🌕"); add("sfx-row", "🏮 ⭐ 🐟 ⭐ 🏮"); }
    if (S.activeSkin === "tet") { add("sfx-row wide", "🌼 🌸 🌼"); add("sfx-couplet", "An Khang · Thịnh Vượng"); }
    if (S.activeSkin === "noel") { add("sfx-snow", ""); add("sfx-tree", "🎄"); }
    front.appendChild(fx);
    S.decor.forEach((id) => {
      const d = CONFIG.decor.find((x) => x.id === id);
      if (!d) return;
      if (id === "rem_hong") {
        front.appendChild(UI.el("div", "curtain left"));
        front.appendChild(UI.el("div", "curtain right"));
        return;
      }
      if (id === "neon") { front.classList.add("has-neon"); return; }
      front.appendChild(UI.el("div", "decor decor-" + id, d.emoji));
      if (id === "den_long") front.appendChild(UI.el("div", "decor decor-den_long two", d.emoji));
    });
    const pets = UI.el("div", "pets");
    S.pets.forEach((id) => {
      const p = CONFIG.pets[id];
      if (!p) return;
      const b = UI.el("button", "pet pet-" + id, p.emoji);
      b.type = "button";
      b.setAttribute("aria-label", UI.fmt(p.name));
      if (id === "miu") b.appendChild(UI.el("span", "pet-z", "💤"));
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        if (p.lines.length) UI.toast(UI.fmt(UI.pick(p.lines)));
        b.classList.remove("wiggle"); void b.offsetWidth; b.classList.add("wiggle");
        BT.Audio.play("pop");
      });
      pets.appendChild(b);
    });
    front.appendChild(pets);
  };

  // ---------- Bộ 7 thẻ "Cách chơi" ----------
  UI.howTo = function (onDone) {
    const cards = CONFIG.texts.howto;
    let i = 0;
    const wrap = UI.el("div", "howto");
    const render = () => {
      wrap.innerHTML = "";
      const c = cards[i];
      wrap.appendChild(UI.el("div", "howto-icon", c.icon));
      wrap.appendChild(UI.el("div", "howto-title", UI.fmt(c.title)));
      wrap.appendChild(UI.el("div", "howto-text", UI.fmt(c.text)));
      const dots = UI.el("div", "howto-dots");
      cards.forEach((x, k) => dots.appendChild(UI.el("span", "howto-dot" + (k === i ? " on" : ""))));
      wrap.appendChild(dots);
      const row = UI.el("div", "howto-nav");
      const prev = UI.button(UI.t("howtoPrev"), "btn-white small", () => { i = Math.max(0, i - 1); render(); });
      if (i === 0) prev.disabled = true;
      row.appendChild(prev);
      row.appendChild(UI.button(i === cards.length - 1 ? UI.t("howtoStart") : UI.t("howtoNext"), "btn-pink small", () => {
        if (i < cards.length - 1) { i++; render(); } else { m.close(); }
      }));
      wrap.appendChild(row);
    };
    let sx = null;
    wrap.addEventListener("pointerdown", (e) => { sx = e.clientX; });
    wrap.addEventListener("pointerup", (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 60) { i = Math.min(cards.length - 1, Math.max(0, i + (dx < 0 ? 1 : -1))); render(); }
    });
    render();
    const m = UI.modal({ title: UI.t("howtoTitle"), body: wrap, className: "modal-howto", dismissable: true, onClose: onDone });
    return m;
  };

  // ---------- Hướng dẫn tương tác: lớp phủ tối khoét sáng vùng cần thao tác + bàn tay 👆 ----------
  // hand: "tap" | "hold" | "swipe-x" | "swipe-up" | "drag" | null
  UI.coach = {
    layer: null,
    show(opts) {
      this.hide();
      const layer = UI.el("div", "coach");
      const hole = UI.el("div", "coach-hole");
      const hand = UI.el("div", "coach-hand", "👆");
      const box = UI.el("div", "coach-box");
      box.appendChild(UI.el("div", "coach-text", opts.text));
      const row = UI.el("div", "coach-buttons");
      if (opts.onNext) row.appendChild(UI.button(UI.t("tutNext"), "btn-pink small", opts.onNext));
      if (opts.onSkip) row.appendChild(UI.button(UI.t("tutSkip"), "btn-white small", opts.onSkip));
      box.appendChild(row);
      layer.appendChild(hole);
      layer.appendChild(hand);
      layer.appendChild(box);
      UI.app().appendChild(layer);
      this.layer = layer;
      this.hole = hole;
      this.hand = hand;
      this.box = box;
      this.opts = opts;
      hand.className = "coach-hand " + (opts.hand ? "h-" + opts.hand : "hidden");
      this.update();
    },
    update() {
      if (!this.layer) return;
      const target = this.opts.target && this.opts.target();
      const a = UI.app().getBoundingClientRect();
      if (!target || !target.isConnected) { this.hole.style.display = "none"; this.hand.style.display = "none"; this.box.style.top = "40%"; return; }
      const r = target.getBoundingClientRect();
      const pad = 6;
      const x = r.left - a.left - pad;
      const y = r.top - a.top - pad;
      const w = r.width + pad * 2;
      const h = r.height + pad * 2;
      Object.assign(this.hole.style, { display: "block", left: x + "px", top: y + "px", width: w + "px", height: h + "px" });
      Object.assign(this.hand.style, { display: "", left: x + w / 2 + "px", top: y + h / 2 + "px" });
      // Hộp chữ: ở trên vùng sáng nếu vùng sáng nằm nửa dưới, ngược lại ở dưới
      const below = y + h / 2 < a.height / 2;
      this.box.style.top = below ? Math.min(a.height - 140, y + h + 14) + "px" : "";
      this.box.style.bottom = below ? "" : Math.min(a.height - 140, a.height - y + 14) + "px";
    },
    hide() {
      if (this.layer) this.layer.remove();
      this.layer = null;
    }
  };

  BT.UI = UI;
})();
