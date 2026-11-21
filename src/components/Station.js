// Station.js — Lưới trạm nguyên liệu của một khu, số tồn kho, nút Nhập nhanh.
// Giai đoạn 1: thao tác chạm. Nhấn giữ / canh lửa / vuốt cuốn sẽ thêm ở Giai đoạn 2.
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

  class StationGrid {
    // handlers: { onTap(ingId, el), onQuickBuy(ingId) }
    constructor(day, handlers) {
      this.day = day;
      this.handlers = handlers;
      this.el = UI.el("div", "stations");
      this.lastTap = {};
      this.zone = null;
      this.el.addEventListener("click", (e) => this.onClick(e));
    }

    show(zone) {
      this.zone = zone;
      this.el.innerHTML = "";
      this.cells = {};
      ingredientsFor(zone, this.day).forEach((id) => {
        const ing = UI.ing(id);
        const cell = UI.el("div", "station");
        cell.dataset.ing = id;
        cell.setAttribute("role", "button");
        cell.setAttribute("aria-label", ing.name);
        cell.appendChild(UI.el("div", "station-emoji", ing.emoji));
        cell.appendChild(UI.el("div", "station-name", ing.name));
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

    onClick(e) {
      const quick = e.target.closest("[data-quick]");
      if (quick) { e.stopPropagation(); this.handlers.onQuickBuy(quick.dataset.quick); return; }
      const cell = e.target.closest(".station");
      if (!cell) return;
      const id = cell.dataset.ing;
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
