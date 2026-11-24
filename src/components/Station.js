// Station.js — Lưới trạm nguyên liệu của một khu, số tồn kho, nút Nhập nhanh,
// thao tác chạm và nhấn giữ (rót trà / nước mía) có vòng tròn tiến độ.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  // Các nguyên liệu của khu, đã mở ở ngày này. Đế xếp đầu, bước kết thúc xếp cuối.
  function ingredientsFor(zone, day) {
    const roles = CONFIG.zoneRoles[zone];
    const ids = Object.keys(CONFIG.ingredients).filter((id) => {
      const ing = CONFIG.ingredients[id];
      return ing.zones.includes(zone) && ing.openDay <= day;
    });
    const rank = (id) => (roles.base.includes(id) ? 0 : roles.finish.includes(id) ? 2 : 1);
    return ids.sort((a, b) => rank(a) - rank(b));
  }

  // Vòng tròn tiến độ quanh ngón tay
  UI.progressRing = function (x, y) {
    const wrap = UI.el("div", "hold-ring");
    wrap.style.left = x + "px";
    wrap.style.top = y + "px";
    wrap.innerHTML = '<svg viewBox="0 0 64 64"><circle class="ring-bg" cx="32" cy="32" r="26"/><circle class="ring-fg" cx="32" cy="32" r="26"/></svg>';
    let fx = document.getElementById("fx");
    if (!fx) { fx = UI.el("div"); fx.id = "fx"; UI.app().appendChild(fx); }
    fx.appendChild(wrap);
    const fg = wrap.querySelector(".ring-fg");
    const len = 2 * Math.PI * 26;
    fg.style.strokeDasharray = String(len);
    fg.style.strokeDashoffset = String(len);
    return {
      set(p) { fg.style.strokeDashoffset = String(len * (1 - Math.min(1, p))); },
      done() { wrap.classList.add("done"); setTimeout(() => wrap.remove(), 250); },
      cancel() { wrap.remove(); }
    };
  };

  // Theo dõi một lần nhấn giữ. opts: { el, sec, isPaused(), onDone(), onCancel() }
  UI.hold = function (e, opts) {
    const a = UI.app().getBoundingClientRect();
    const ring = UI.progressRing(e.clientX - a.left, e.clientY - a.top);
    const start = performance.now();
    let held = 0;
    let last = start;
    let finished = false;
    const pid = e.pointerId;
    try { opts.el.setPointerCapture(pid); } catch (err) { /* bỏ qua */ }
    const stop = (ok) => {
      if (finished) return;
      finished = true;
      opts.el.removeEventListener("pointerup", up);
      opts.el.removeEventListener("pointercancel", up);
      if (ok) { ring.done(); opts.onDone(); } else { ring.cancel(); if (opts.onCancel) opts.onCancel(held / opts.sec); }
    };
    const up = (ev) => { if (ev.pointerId === pid) stop(false); };
    opts.el.addEventListener("pointerup", up);
    opts.el.addEventListener("pointercancel", up);
    const tick = (t) => {
      if (finished) return;
      const dt = (t - last) / 1000;
      last = t;
      if (!opts.isPaused()) held += dt;
      ring.set(held / opts.sec);
      if (held >= opts.sec) { stop(true); return; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return { cancel: () => stop(false) };
  };

  class StationGrid {
    // handlers: { onTap(ingId, el), onQuickBuy(ingId), canHold(ingId) → msg|null, onHoldDone(ingId, el), isPaused() }
    constructor(day, handlers) {
      this.day = day;
      this.handlers = handlers;
      this.el = UI.el("div", "stations");
      this.lastTap = {};
      this.zone = null;
      this.el.addEventListener("click", (e) => this.onClick(e));
      this.el.addEventListener("pointerdown", (e) => this.onDown(e));
    }

    isHold(id) { return CONFIG.gameplay.holdSec[id] !== undefined; }

    show(zone) {
      this.zone = zone;
      this.el.innerHTML = "";
      this.cells = {};
      ingredientsFor(zone, this.day).forEach((id) => {
        const ing = UI.ing(id);
        const cell = UI.el("div", "station" + (this.isHold(id) ? " hold" : ""));
        cell.dataset.ing = id;
        cell.setAttribute("role", "button");
        cell.setAttribute("aria-label", ing.name);
        cell.appendChild(UI.el("div", "station-emoji", ing.emoji));
        cell.appendChild(UI.el("div", "station-name", ing.name));
        if (this.isHold(id)) cell.appendChild(UI.el("div", "station-hold", "✋ " + CONFIG.gameplay.holdSec[id].toString().replace(".", ",") + "s"));
        cell.appendChild(UI.el("div", "station-stock", "0"));
        const quick = UI.el("button", "station-quick");
        quick.type = "button";
        quick.dataset.quick = id;
        cell.appendChild(quick);
        cell.appendChild(UI.el("div", "station-out", UI.t("stockEmpty")));
        this.el.appendChild(cell);
        this.cells[id] = cell;
      });
      this.refresh();
    }

    refresh() {
      const M = CONFIG.money;
      Object.keys(this.cells || {}).forEach((id) => {
        const cell = this.cells[id];
        const n = BT.Save.stock(id);
        cell.querySelector(".station-stock").textContent = String(n);
        cell.classList.toggle("is-empty", n <= 0);
        const q = cell.querySelector(".station-quick");
        const price = UI.ing(id).price * M.quickBuyPriceMult;
        q.innerHTML = "";
        q.appendChild(UI.el("span", "", UI.t("btnQuickBuy")));
        q.appendChild(UI.el("span", "q-price", UI.t("quickBuyPrice", { q: M.quickBuyQty, x: UI.money(price) })));
      });
    }

    onDown(e) {
      if (e.target.closest("[data-quick]")) return;
      const cell = e.target.closest(".station");
      if (!cell || !this.isHold(cell.dataset.ing)) return;
      if (BT.assist("tapPour")) return; // rót một chạm: để chạm thường xử lý
      const id = cell.dataset.ing;
      if (BT.Save.stock(id) <= 0) return; // để click báo hết hàng
      const msg = this.handlers.canHold(id);
      if (msg) { UI.toast(msg); UI.shake(cell); return; }
      cell.classList.add("holding");
      BT.Audio.play("tap");
      UI.hold(e, {
        el: cell,
        sec: CONFIG.gameplay.holdSec[id],
        isPaused: this.handlers.isPaused,
        onDone: () => { cell.classList.remove("holding"); this.handlers.onHoldDone(id, cell); },
        onCancel: () => { cell.classList.remove("holding"); UI.toast(UI.t("pourCancel")); }
      });
    }

    onClick(e) {
      const quick = e.target.closest("[data-quick]");
      if (quick) { e.stopPropagation(); this.handlers.onQuickBuy(quick.dataset.quick); return; }
      const cell = e.target.closest(".station");
      if (!cell) return;
      const id = cell.dataset.ing;
      if (this.isHold(id) && BT.Save.stock(id) > 0) return; // trạm nhấn giữ không nhận chạm thường
      const now = performance.now();
      if (now - (this.lastTap[id] || 0) < CONFIG.gameplay.stationDebounceMs) return; // chống bấm đúp nhầm
      this.lastTap[id] = now;
      cell.classList.remove("pressed");
      void cell.offsetWidth;
      cell.classList.add("pressed");
      this.handlers.onTap(id, cell);
    }
  }

  BT.StationGrid = StationGrid;
  BT.Station = { ingredientsFor };
})();
