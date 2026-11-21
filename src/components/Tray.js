// Tray.js — Khay / đồ đựng đang chế biến (Giai đoạn 1: bịch nilon của Quầy trộn).
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  function roleOf(ingId, zone) {
    const roles = CONFIG.zoneRoles[zone];
    if (!roles) return "topping";
    if (roles.base.includes(ingId)) return "base";
    if (roles.finish.includes(ingId)) return "finish";
    return "topping";
  }

  class Tray {
    constructor(index) {
      this.index = index;
      this.clear();
      this.el = UI.el("div", "tray");
      this.el.dataset.tray = String(index);
      this.render();
    }

    clear() {
      this.zone = null;
      this.base = null;
      this.items = {};     // topping → số lần
      this.finish = [];    // nguyên liệu kết thúc theo thứ tự (vd: tắc)
      this.shakeCount = 0;
      this.tied = false;
    }

    isEmpty() { return !this.base; }

    count() {
      return Object.values(this.items).reduce((a, b) => a + b, 0) + this.finish.length + (this.base ? 1 : 0);
    }

    canShake() { return !!this.base && this.zone === "tron" && !this.tied; }

    // Thêm nguyên liệu. Trả về { ok } hoặc { ok:false, msg }.
    add(ingId, currentZone) {
      const ing = UI.ing(ingId);
      const zone = this.zone || currentZone;
      const role = roleOf(ingId, zone);
      const G = CONFIG.gameplay;

      if (!this.base) {
        if (role !== "base") {
          const baseId = CONFIG.zoneRoles[zone].base[0];
          return { ok: false, msg: UI.t("needBase", { base: UI.ing(baseId).name }) };
        }
        this.zone = zone;
        this.base = ingId;
        return { ok: true };
      }
      if (!ing.zones.includes(this.zone)) return { ok: false, msg: UI.t("notThisZone") };
      if (role === "base") return { ok: false, msg: UI.t("hasBase") };
      if (this.tied) return { ok: false, msg: UI.t("alreadyTied") };
      if (this.count() >= G.trayMaxItems) return { ok: false, msg: UI.t("trayFull") };

      if (role === "finish") {
        if (this.finish.includes(ingId)) return { ok: false, msg: UI.t("finishTwice", { ing: ing.short }) };
        this.finish.push(ingId);
        return { ok: true };
      }
      // topping
      if (this.finish.length > 0) return { ok: false, msg: UI.t("afterFinish") };
      const n = this.items[ingId] || 0;
      if (n >= G.maxSameIngredient) return { ok: false, msg: UI.t("tooMany", { ing: ing.short }) };
      this.items[ingId] = n + 1;
      return { ok: true };
    }

    render() {
      const el = this.el;
      el.innerHTML = "";
      el.classList.toggle("empty", this.isEmpty());
      el.classList.toggle("tied", this.tied);

      const bag = UI.el("div", "bag");
      if (this.isEmpty()) {
        bag.appendChild(UI.el("div", "bag-empty", UI.t("trayEmpty")));
      } else {
        if (this.tied) bag.appendChild(UI.el("div", "bag-tie", "🎀"));
        const items = UI.el("div", "bag-items");
        const add = (id, n) => {
          const s = UI.el("span", "bag-item", UI.ing(id).emoji);
          if (n > 1) s.appendChild(UI.el("sup", "", "×" + n));
          items.appendChild(s);
        };
        add(this.base, 1);
        Object.keys(this.items).forEach((id) => add(id, this.items[id]));
        this.finish.forEach((id) => add(id, 1));
        bag.appendChild(items);
      }
      el.appendChild(bag);
      el.appendChild(UI.el("div", "tray-label", UI.t("trayN", { n: this.index + 1 })));

      if (this.canShake()) {
        const btn = UI.el("button", "btn-shake", UI.t("shakeBtn"));
        btn.type = "button";
        btn.dataset.action = "shake";
        el.appendChild(btn);
      }
    }
  }

  // So bịch với món khách gọi. Trả về { ok } hoặc { ok:false, reason, ing }.
  Tray.evaluate = function (tray, recipeId) {
    const r = UI.recipe(recipeId);
    if (!tray.base || tray.base !== r.base) return { ok: false, reason: "notOrdered" };

    const need = {};
    r.toppings.forEach((id) => { need[id] = (need[id] || 0) + 1; });
    for (const id of Object.keys(need)) {
      if ((tray.items[id] || 0) < need[id]) return { ok: false, reason: "missing", ing: id };
    }
    for (const id of Object.keys(tray.items)) {
      if (tray.items[id] > (need[id] || 0)) return { ok: false, reason: "extra", ing: id };
    }
    const finishIngs = r.finish.filter((s) => CONFIG.ingredients[s]);
    for (const id of finishIngs) {
      if (!tray.finish.includes(id)) return { ok: false, reason: "missing", ing: id };
    }
    for (const id of tray.finish) {
      if (!finishIngs.includes(id)) return { ok: false, reason: "extra", ing: id };
    }
    if (r.finish.includes("lac") && !tray.tied) return { ok: false, reason: "notMixed" };
    return { ok: true };
  };

  Tray.roleOf = roleOf;
  BT.Tray = Tray;
})();
