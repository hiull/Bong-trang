// Tray.js — Đồ đựng đang chế biến: bịch nilon (Trộn), ly nhựa (Nước), thớt tre (Cuốn), vỉ nướng (Nướng).
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

  // Các vùng trên thanh lửa (có tính nâng cấp Than hồng & Quạt than tay)
  function cookZones() {
    const G = CONFIG.gameplay;
    const up = BT.Save.state.upgrades;
    const z = Object.assign({}, G.cookZones);
    const widen = G.goodWidenPerLevel * (up.bep_nhanh || 0);
    z.good += widen;
    z.raw -= widen;
    if (up.chong_chay > 0) {
      const extra = Math.min(z.ok2, z.burn - 0.02);
      z.ok2 += extra;
      z.burn -= extra;
    }
    const list = [];
    let acc = 0;
    [["raw", z.raw], ["ok", z.ok1], ["good", z.good], ["ok", z.ok2], ["burn", z.burn]].forEach(([q, len]) => {
      list.push({ q, from: acc, to: acc + len });
      acc += len;
    });
    return list;
  }

  function cookSec() {
    const U = CONFIG.upgrades.bep_nhanh;
    const lv = BT.Save.state.upgrades.bep_nhanh || 0;
    const bonus = lv > 0 ? U.speedBonus[lv - 1] : 0;
    return CONFIG.gameplay.cookSec / (1 + bonus);
  }

  function qualityAt(p) {
    const zones = cookZones();
    const z = zones.find((x) => p >= x.from && p < x.to);
    return z ? z.q : "burn";
  }

  class Tray {
    // kind: "tray" (khay chung cho Trộn/Cuốn/Nước) hoặc "grill" (vỉ nướng)
    constructor(index, kind) {
      this.index = index;
      this.kind = kind || "tray";
      this.clear();
      this.el = UI.el("div", "tray " + this.kind);
      this.el.dataset.kind = this.kind;
      this.el.dataset.index = String(index);
      this.render();
    }

    clear() {
      this.zone = null;
      this.base = null;
      this.items = {};     // topping → số lần
      this.finish = [];    // tắc / đá / nước chấm theo thứ tự
      this.shakeCount = 0;
      this.tied = false;
      this.rolled = false;
      this.poured = null;  // "tra" | "nuoc_mia"
      this.cracked = false;
      this.cooking = false;
      this.cook = 0;       // 0 → 1 trên thanh lửa
      this.folded = false;
      this.quality = null; // "ok" | "good"
      this.burnt = false;
      this.sauces = {};
      this.layers = [];    // quầy chè: các lớp theo đúng thứ tự chạm
    }

    isEmpty() { return !this.base; }
    label() { return UI.t(this.kind === "grill" ? "grillN" : "trayN", { n: this.index + 1 }); }

    count() {
      const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
      return sum(this.items) + sum(this.sauces) + this.finish.length + this.layers.length + (this.base ? 1 : 0);
    }

    canShake() { return !!this.base && this.zone === "tron" && !this.tied; }
    canRoll() { return !!this.base && this.zone === "cuon" && !this.rolled && Object.keys(this.items).length > 0; }
    needsCrack() { return this.zone === "nuong" && !!this.items.trung_cut && !this.cracked && !this.burnt; }

    // Thêm nguyên liệu. Trả về { ok } hoặc { ok:false, msg }.
    add(ingId, currentZone) {
      const G = CONFIG.gameplay;
      const ing = UI.ing(ingId);
      const fail = (key, vars) => ({ ok: false, msg: UI.t(key, vars) });

      if (!this.base) {
        const z = this.kind === "grill" ? "nuong" : currentZone;
        if (!CONFIG.zoneRoles[z].base.includes(ingId)) {
          if (z === "nuoc") return fail("needCup");
          return fail("needBase", { base: UI.ing(CONFIG.zoneRoles[z].base[0]).name });
        }
        this.zone = z;
        this.base = ingId;
        return { ok: true };
      }
      if (!ing.zones.includes(this.zone)) return fail("notThisZone");
      if (roleOf(ingId, this.zone) === "base") return fail("hasBase");
      if (this.count() >= G.trayMaxItems) return fail("trayFull");

      const topping = () => {
        const n = this.items[ingId] || 0;
        if (n >= G.maxSameIngredient) return fail("tooMany", { ing: ing.short });
        this.items[ingId] = n + 1;
        return { ok: true };
      };

      switch (this.zone) {
        case "tron":
          if (this.tied) return fail("alreadyTied");
          if (ingId === "tac") {
            if (this.finish.includes("tac")) return fail("finishTwice", { ing: ing.short });
            this.finish.push("tac");
            return { ok: true };
          }
          if (this.finish.length) return fail("afterFinish");
          return topping();

        case "cuon":
          if (ingId === "nuoc_cham") {
            if (!this.rolled) return fail("needRoll");
            if (this.finish.includes(ingId)) return fail("finishTwice", { ing: ing.short });
            this.finish.push(ingId);
            return { ok: true };
          }
          if (this.rolled) return fail("alreadyRolled");
          return topping();

        case "nuoc":
          if (ingId === "tra" || ingId === "nuoc_mia") {
            if (this.poured) return fail("alreadyPoured");
            this.poured = ingId;
            return { ok: true };
          }
          if (!this.poured) return fail("needPour");
          if (ingId === "da") {
            if (this.finish.includes("da")) return fail("finishTwice", { ing: ing.short });
            this.finish.push("da");
            return { ok: true };
          }
          return topping();

        case "che":
          // Lớp phủ (đá, dừa nạo) chỉ thêm sau khi đã có lớp; lớp thì phải xếp trước lớp phủ
          if (roleOf(ingId, "che") === "finish") {
            if (!this.layers.length) return fail("needLayer", { ing: ing.short });
            if (this.finish.includes(ingId)) return fail("finishTwice", { ing: ing.short });
            this.finish.push(ingId);
            return { ok: true };
          }
          if (this.finish.length) return fail("layerAfterTop");
          this.layers.push(ingId);
          return { ok: true };

        case "nuong":
          if (this.burnt) return fail("burntTrash");
          if (ingId === "mayo" || ingId === "tuong_ot") {
            if (!this.folded) return fail("needFold");
            const n = this.sauces[ingId] || 0;
            if (n >= G.maxSameIngredient + 1) return fail("tooMany", { ing: ing.short });
            this.sauces[ingId] = n + 1;
            return { ok: true };
          }
          if (this.folded) return fail("alreadyFolded");
          if (!this.cracked) {
            if (ingId !== "trung_cut") return fail("needEgg");
            if (this.items.trung_cut) return fail("needCrack");
            this.items.trung_cut = 1;
            return { ok: true };
          }
          return topping();
      }
      return topping();
    }

    crack() {
      if (!this.needsCrack()) return false;
      this.cracked = true;
      this.cooking = true;
      this.cook = 0;
      return true;
    }

    // Trả về "burnt" nếu vừa cháy
    updateCook(dt) {
      if (!this.cooking || this.folded || this.burnt) return null;
      this.cook += dt / cookSec();
      if (this.cook >= 1) {
        this.cook = 1;
        this.burnt = true;
        this.cooking = false;
        return "burnt";
      }
      this.updateNeedle();
      return null;
    }

    // Chạm vỉ để gấp bánh. Trả về "raw" | "ok" | "good" | "burnt" | null
    fold() {
      if (!this.cooking || this.folded || this.burnt) return null;
      const q = qualityAt(this.cook);
      if (q === "raw") return "raw";
      this.cooking = false;
      if (q === "burn") { this.burnt = true; return "burnt"; }
      this.folded = true;
      this.quality = q;
      return q;
    }

    cookState() { return this.cooking ? qualityAt(this.cook) : null; }

    updateNeedle() {
      if (this.needleEl) this.needleEl.style.left = (this.cook * 100).toFixed(1) + "%";
    }

    render() {
      const el = this.el;
      el.innerHTML = "";
      this.needleEl = null;
      el.classList.toggle("empty", this.isEmpty());
      el.classList.toggle("tied", this.tied);
      el.classList.toggle("burnt", this.burnt);
      el.dataset.zone = this.zone || "";

      const bag = UI.el("div", "bag");
      if (this.isEmpty()) {
        bag.appendChild(UI.el("div", "bag-empty", UI.t(this.kind === "grill" ? "grillEmpty" : "trayEmpty")));
      } else {
        if (this.tied) bag.appendChild(UI.el("div", "bag-tie", "🎀"));
        const items = UI.el("div", "bag-items");
        const add = (emoji, n, cls) => {
          const s = UI.el("span", "bag-item " + (cls || ""), emoji);
          if (n > 1) s.appendChild(UI.el("sup", "", "×" + n));
          items.appendChild(s);
        };
        if (this.burnt) {
          add("⬛", 1, "burnt-cake");
          add("💨", 1);
        } else if (this.zone === "cuon" && this.rolled) {
          add("🌯", 1, "big");
        } else if (this.zone === "nuong" && this.folded) {
          add("🌮", 1, "big");
        } else {
          add(UI.ing(this.base).emoji, 1);
        }
        if (this.zone === "nuoc" && this.poured) add(UI.ing(this.poured).emoji, 1);
        if (this.zone === "che" && this.layers.length) {
          const cup = UI.el("div", "che-cup");
          this.layers.forEach((id) => { const l = UI.el("span", "layer"); l.style.setProperty("--c", UI.ing(id).color || "#EEE"); l.title = UI.ing(id).name; cup.appendChild(l); });
          items.appendChild(cup);
        }
        if (!this.burnt && !(this.zone === "cuon" && this.rolled) && !(this.zone === "nuong" && this.folded)) {
          Object.keys(this.items).forEach((id) => {
            const cls = id === "trung_cut" && this.zone === "nuong" && this.cracked ? "cracked" : "";
            add(id === "trung_cut" && cls ? "🍳" : UI.ing(id).emoji, this.items[id], cls);
          });
        }
        this.finish.forEach((id) => add(UI.ing(id).emoji, 1));
        Object.keys(this.sauces).forEach((id) => add(UI.ing(id).emoji, this.sauces[id]));
        if (this.zone === "nuong" && this.folded && this.quality === "good") add("✨", 1);
        bag.appendChild(items);
      }
      el.appendChild(bag);

      if (this.zone === "nuong" && (this.cooking || (this.cracked && !this.folded && !this.burnt))) {
        const bar = UI.el("div", "cookbar");
        cookZones().forEach((z) => {
          const seg = UI.el("div", "cook-seg q-" + z.q);
          seg.style.left = (z.from * 100) + "%";
          seg.style.width = ((z.to - z.from) * 100) + "%";
          bar.appendChild(seg);
        });
        const needle = UI.el("div", "cook-needle");
        bar.appendChild(needle);
        this.needleEl = needle;
        el.appendChild(bar);
        this.updateNeedle();
      }

      if (this.zone === "nuong" && (this.cooking || this.burnt)) {
        el.appendChild(UI.el("span", "fx-smoke" + (this.burnt ? " burnt" : ""), "💨"));
        el.appendChild(UI.el("span", "fx-sparkle", "✨"));
      }
      el.appendChild(UI.el("div", "tray-label", this.label()));

      if (this.canShake()) el.appendChild(this.actionBtn(UI.t("shakeBtn"), "shake"));
      if (this.canRoll()) el.appendChild(this.actionBtn(UI.t("rollBtn"), "roll"));
      if (this.needsCrack()) el.appendChild(UI.el("div", "crack-hint", UI.t("holdToCrack")));
    }

    actionBtn(label, action) {
      const btn = UI.el("button", "btn-shake", label);
      btn.type = "button";
      btn.dataset.action = action;
      return btn;
    }
  }

  // ---------- So sánh với món khách gọi ----------
  // dish = { id, reqs: [{ type, ing, n }] }
  // Trả về { ok, crispy } hoặc { ok:false, reason, ing }
  Tray.requirements = function (dish) {
    const r = UI.recipe(dish.id);
    const need = {};
    r.toppings.forEach((id) => { need[id] = (need[id] || 0) + 1; });
    let finishIngs = r.finish.filter((s) => CONFIG.ingredients[s] && !(r.zone === "nuong" && (s === "mayo" || s === "tuong_ot")));
    const sauces = {};
    if (r.zone === "nuong") r.finish.forEach((s) => { if (s === "mayo" || s === "tuong_ot") sauces[s] = (sauces[s] || 0) + 1; });
    const pour = (r.finish.find((s) => s.indexOf("rot:") === 0) || "").slice(4) || null;
    let crispy = false;
    // Quầy chè: thứ tự lớp theo công thức (áp yêu cầu bỏ / gấp đôi)
    let layers = null;
    if (r.zone === "che") {
      layers = r.toppings.slice();
      (dish.reqs || []).forEach((q) => {
        if (q.type === "remove") layers = layers.filter((x) => x !== q.ing);
        else if (q.type === "double") { const i = layers.indexOf(q.ing); if (i >= 0) layers.splice(i + 1, 0, q.ing); }
      });
      Object.keys(need).forEach((k) => delete need[k]);
    }
    (dish.reqs || []).forEach((q) => {
      if (q.type === "remove") {
        delete need[q.ing];
        finishIngs = finishIngs.filter((x) => x !== q.ing);
      } else if (q.type === "double") {
        need[q.ing] = 2;
      } else if (q.type === "crispy") {
        crispy = true;
      } else if (q.type === "spicy") {
        if (r.zone === "nuong") sauces.tuong_ot = (sauces.tuong_ot || 0) + q.n;
        else need.sa_te = q.n;
      }
    });
    return { r, need, finishIngs, sauces, pour, crispy, layers };
  };

  Tray.evaluate = function (tray, dish) {
    const { r, need, finishIngs, sauces, pour, crispy, layers } = Tray.requirements(dish);
    const fail = (reason, ing) => ({ ok: false, reason, ing });
    if (!tray.base || tray.base !== r.base) return fail("notOrdered");
    if (tray.zone === "che") {
      const got = tray.layers;
      const n = Math.max(got.length, layers.length);
      for (let i = 0; i < n; i++) {
        if (got[i] === layers[i]) continue;
        if (got[i] === undefined) return fail("missing", layers[i]);
        if (layers[i] === undefined) return fail("extra", got[i]);
        // cùng tập nguyên liệu nhưng sai chỗ → sai thứ tự; khác tập → thiếu/thừa
        if (layers.includes(got[i]) && got.filter((x) => x === got[i]).length <= layers.filter((x) => x === got[i]).length) return fail("order", got[i]);
        return layers.includes(got[i]) ? fail("extra", got[i]) : fail("extra", got[i]);
      }
    }
    if (tray.zone === "nuong" && tray.burnt) return fail("burnt");
    if (tray.zone === "nuoc") {
      if (!tray.poured) return fail("missing", pour);
      if (tray.poured !== pour) return fail("notOrdered");
    }
    for (const id of Object.keys(need)) {
      if ((tray.items[id] || 0) < need[id]) return fail("missing", id);
    }
    for (const id of Object.keys(tray.items)) {
      if (tray.items[id] > (need[id] || 0)) return fail("extra", id);
    }
    if (tray.zone === "cuon" && !tray.rolled) return fail("notRolled");
    if (tray.zone === "nuong" && !tray.folded) return fail("notCooked");
    for (const id of finishIngs) if (!tray.finish.includes(id)) return fail("missing", id);
    for (const id of tray.finish) if (!finishIngs.includes(id)) return fail("extra", id);
    if (tray.zone === "nuong") {
      for (const id of Object.keys(sauces)) if ((tray.sauces[id] || 0) < sauces[id]) return fail("missing", id);
      for (const id of Object.keys(tray.sauces)) if (tray.sauces[id] > (sauces[id] || 0)) return fail("extra", id);
      if (crispy && tray.quality !== "good") return fail("notCrispy");
    }
    if (r.finish.includes("lac") && !tray.tied) return fail("notMixed");
    return { ok: true, crispy: tray.zone === "nuong" && tray.quality === "good" };
  };

  Tray.roleOf = roleOf;
  Tray.cookZones = cookZones;
  BT.Tray = Tray;
})();
