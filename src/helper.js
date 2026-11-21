// helper.js — Anh Hiếu phụ tiệm (Mùa 2): mỗi ca phụ một việc (chạy bàn / pha nước / phụ quầy chè) hoặc nghỉ.
// Giúp mức vừa phải: không làm món chính thay Bống.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;
  const H = {
    cfg() { return CONFIG.helper; },
    unlocked() { const S = BT.Save.state; return !!(S.helper && S.helper.unlocked); },
    level() {
      const at = CONFIG.helper.levelAt;
      const n = BT.Save.state.helper.shifts;
      let lv = 1;
      at.forEach((v, i) => { if (n >= v) lv = i + 1; });
      return lv;
    },
    // Anh có đi làm ca này không
    working(run) {
      if (!this.unlocked() || !run) return false;
      if (run.mode === "secret") return false;
      if ((run.season || 1) < CONFIG.helper.fromSeason) return false;
      if (run.cfg && run.cfg.helperOff) return false;
      return BT.Save.state.helper.role !== "off";
    },
    role() { return BT.Save.state.helper.role; },

    // Gắn vào màn bán hàng
    attach(g) {
      const C = this.cfg();
      g.helper = { role: this.role(), t: 0, drink: null, idleUntil: 0, bubbleAt: UI.rand(C.bubbleEverySec[0], C.bubbleEverySec[1]) };
      const el = UI.el("div", "helper");
      el.appendChild(UI.icon("tomortle"));
      el.appendChild(UI.el("div", "helper-role", UI.t("helperRole_" + g.helper.role)));
      g.helper.el = el;
      if (g.front) g.front.appendChild(el);
      // Sự kiện nhỏ (tối đa 1 lần/ca)
      if (Math.random() < C.eventRate) {
        if (Math.random() < 0.5) {
          g.helper.late = true;
          g.scope.timeout(() => UI.toast(UI.fmt(window.PERSONAL.helperLate), 2600), 1500);
        } else {
          const have = Object.keys(BT.Save.state.inventory).filter((id) => BT.Save.stock(id) > 0 && UI.ing(id).openDay <= g.dayNum);
          if (have.length) {
            const id = UI.pick(have);
            BT.Save.state.inventory[id] = BT.Save.stock(id) - 1;
            g.scope.timeout(() => UI.toast(UI.fmt(window.PERSONAL.helperSpill, { ing: UI.ing(id).short }), 2600), 2500);
          }
        }
      }
    },

    say(g) {
      const lines = window.PERSONAL.helperLines || [];
      if (!lines.length || !g.helper.el) return;
      const old = g.helper.el.querySelector(".helper-bubble");
      if (old) old.remove();
      const b = UI.el("div", "helper-bubble", UI.fmt(UI.pick(lines)));
      g.helper.el.appendChild(b);
      g.scope.timeout(() => b.remove(), 3200);
    },

    // Khách đang chờ có món này chưa xong, chờ lâu nhất trước
    waitersFor(g) {
      return g.customers.filter((c) => c.state === "waiting" && !c.isCat).sort((a, b) => a.pct() - b.pct());
    },

    tick(g, dt) {
      const h = g.helper;
      if (!h) return;
      const C = this.cfg();
      const lv = this.level() - 1;
      h.t += dt;
      // Đi trễ: chưa làm gì trong 20% đầu ca
      if (h.late && g.done < Math.ceil(g.total * C.lateShare)) return;
      h.bubbleAt -= dt;
      if (h.bubbleAt <= 0) { this.say(g); h.bubbleAt = UI.rand(C.bubbleEverySec[0], C.bubbleEverySec[1]); }
      if (h.role === "waiter") this.tickWaiter(g, dt, C.waiterSec[lv]);
      else if (h.role === "drinks") this.tickDrinks(g, dt, C.drinkSec[lv]);
      else if (h.role === "che") this.tickChe(g, dt, C.cheSec[lv]);
    },

    // Chạy bàn: khay đã làm đúng món của một khách đang chờ → mang tới (khách chờ lâu nhất)
    tickWaiter(g, dt, sec) {
      const waiting = this.waitersFor(g);
      g.trays.concat(g.grills).forEach((t) => {
        if (t.isEmpty()) { t.readyFor = 0; return; }
        const c = waiting.find((x) => x.pending().some((it) => BT.Tray.evaluate(t, it).ok));
        if (!c) { t.readyFor = 0; return; }
        t.readyFor = (t.readyFor || 0) + dt;
        if (t.readyFor >= sec) {
          t.readyFor = 0;
          this.deliverKeep(g, c, t);
          const i = waiting.indexOf(c);
          if (i >= 0 && c.pending().length === 0) waiting.splice(i, 1);
        }
      });
    },

    // Giao giùm mà không bỏ chọn khay Bống đang làm
    deliverKeep(g, c, t) {
      const sel = g.selected;
      g.deliver(c, t);
      if (sel && sel !== t && !sel.isEmpty()) g.select(sel);
    },

    // Pha nước: chỉ các món nước đơn giản, một ly một lúc, trừ kho như khi Bống làm
    tickDrinks(g, dt, sec) {
      const h = g.helper;
      const C = this.cfg();
      if (!h.drink) {
        for (const c of this.waitersFor(g)) {
          const it = c.pending().find((x) => C.drinks.includes(x.id) && !x.helperBusy);
          if (it) { it.helperBusy = true; h.drink = { c, it, t: 0 }; break; }
        }
        return;
      }
      const d = h.drink;
      if (d.c.state !== "waiting" || d.it.done) { d.it.helperBusy = false; h.drink = null; return; }
      d.t += dt;
      if (d.t < sec) return;
      const req = BT.Tray.requirements(d.it);
      const ids = [req.r.base].concat(Object.keys(req.need).reduce((a, k) => a.concat(new Array(req.need[k]).fill(k)), []), req.finishIngs, req.pour ? [req.pour] : []);
      if (ids.some((id) => BT.Save.stock(id) <= 0)) {
        if (!h.warned) { UI.toast(UI.t("helperNoStock")); h.warned = true; }
        d.t = 0;
        return;
      }
      ids.forEach((id) => { BT.Save.state.inventory[id] = BT.Save.stock(id) - 1; });
      const cup = new BT.Tray(99);
      cup.zone = "nuoc"; cup.base = req.r.base; cup.poured = req.pour;
      Object.keys(req.need).forEach((k) => { cup.items[k] = req.need[k]; });
      cup.finish = req.finishIngs.slice();
      d.it.helperBusy = false;
      h.drink = null;
      this.deliverKeep(g, d.c, cup);
      if (g.grid) g.grid.refresh();
    },

    // Phụ quầy chè: cốc đủ lớp đúng thứ tự của một món đang chờ → thêm lớp phủ còn thiếu
    tickChe(g, dt, sec) {
      const waiting = this.waitersFor(g);
      g.trays.forEach((t) => {
        if (t.zone !== "che" || t.isEmpty()) { t.topFor = 0; return; }
        let want = null;
        for (const c of waiting) {
          for (const it of c.pending()) {
            if (UI.recipe(it.id).zone !== "che") continue;
            const req = BT.Tray.requirements(it);
            if (JSON.stringify(req.layers) === JSON.stringify(t.layers) && req.finishIngs.some((id) => !t.finish.includes(id))) { want = req; break; }
          }
          if (want) break;
        }
        if (!want) { t.topFor = 0; return; }
        t.topFor = (t.topFor || 0) + dt;
        if (t.topFor < sec) return;
        t.topFor = 0;
        want.finishIngs.forEach((id) => {
          if (t.finish.includes(id) || BT.Save.stock(id) <= 0) return;
          t.finish.push(id);
          BT.Save.state.inventory[id] = BT.Save.stock(id) - 1;
        });
        t.render();
        if (g.grid) g.grid.refresh();
        BT.Audio.play("add");
      });
    },

    // Cuối ca: đếm ca làm chung, lên cấp thì mở chương kế
    onShiftEnd(g) {
      const S = BT.Save.state;
      const before = this.level();
      S.helper.shifts++;
      const after = this.level();
      let chapter = null;
      if (after > before && S.helper.chapters < after) chapter = after - 1;
      return { levelUp: after > before, level: after, chapter };
    }
  };
  BT.Helper = H;
})();
