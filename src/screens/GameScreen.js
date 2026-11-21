// GameScreen.js — Màn bán hàng chính.
// Giai đoạn 1: Quầy trộn (đế → topping → tắc → lắc bịch), khách gọi món, thanh kiên nhẫn,
// 3 tim tiệm, giao món bằng chạm hoặc kéo thả, Nhập nhanh, Sổ công thức, tạm dừng.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  class Game {
    constructor(root, params, router) {
      const C = CONFIG;
      const G = C.gameplay;
      this.router = router;
      this.dayNum = params.day;
      this.dayCfg = UI.dayCfg(params.day);
      this.S = BT.Save.state;
      this.scope = UI.scope();
      this.pauseReasons = new Set();
      this.started = false;
      this.over = false;

      this.total = this.dayCfg.customers;
      this.spawned = 0;
      this.done = 0;
      this.hearts = G.hearts;
      const today = this.S.today && this.S.today.day === this.dayNum ? this.S.today : { day: this.dayNum, expense: 0 };
      this.S.today = today;
      this.stats = { revenue: 0, tips: 0, expense: today.expense, served: 0, walkouts: 0, ratings: [] };

      this.seatCount = this.S.upgrades.ghe;
      this.seats = new Array(this.seatCount).fill(null);
      this.customers = [];
      this.trays = [];
      this.selected = null;
      this.spawnTimer = G.firstCustomerDelaySec;

      this.openZones = C.zones.filter((z) => z.openDay <= this.dayNum && C.build.playableZones.includes(z.id));
      this.zone = this.openZones[0].id;

      this.dishPool = C.recipes.filter((r) => r.openDay <= this.dayNum && C.build.playableZones.includes(r.zone));
      this.typePool = Object.keys(C.customerTypes).filter((id) => {
        const t = C.customerTypes[id];
        return t.kind === "normal" && t.openDay <= this.dayNum;
      });

      this.build(root);
      this.loop();
      this.countdown();
    }

    // ---------------- Dựng giao diện ----------------
    build(root) {
      const el = UI.el("div", "screen game skin-" + this.S.activeSkin);
      this.el = el;

      // HUD
      const hud = UI.el("div", "hud");
      this.hudCust = UI.el("div", "pill hud-cust");
      this.hudRate = UI.el("div", "pill hud-rate");
      this.hudMoney = UI.el("div", "pill hud-money");
      this.hudHearts = UI.el("div", "hud-hearts");
      const left = UI.el("div", "hud-left");
      const row1 = UI.el("div", "hud-row");
      const row2 = UI.el("div", "hud-row");
      row1.appendChild(this.hudCust);
      row1.appendChild(this.hudRate);
      row2.appendChild(this.hudMoney);
      row2.appendChild(this.hudHearts);
      left.appendChild(row1);
      left.appendChild(row2);
      hud.appendChild(left);
      hud.appendChild(UI.iconButton("📖", UI.t("bookTitle"), () => this.openBook(), "hud-book"));
      hud.appendChild(UI.iconButton("⏸", UI.t("pauseTitle"), () => this.openPause(), "hud-pause"));
      el.appendChild(hud);

      // Mặt tiền tiệm & khách
      const front = UI.el("div", "front");
      front.appendChild(UI.el("div", "sky-sun"));
      front.appendChild(UI.el("div", "flowers"));
      front.appendChild(UI.el("div", "awning"));
      front.appendChild(UI.el("div", "lights"));
      front.appendChild(UI.el("div", "front-sign", window.PERSONAL.shopName));
      front.appendChild(UI.el("div", "sidewalk"));
      const centers = CONFIG.gameplay.seatCenters[this.seatCount];
      centers.forEach((c) => {
        const stool = UI.el("div", "stool");
        stool.style.left = c + "%";
        front.appendChild(stool);
      });
      const pet = UI.el("button", "pet", "🐈");
      pet.type = "button";
      pet.setAttribute("aria-label", UI.fmt("{pet}"));
      pet.appendChild(UI.el("span", "pet-z", "💤"));
      pet.addEventListener("click", () => {
        const lines = CONFIG.pets.miu.lines;
        UI.toast(UI.fmt(UI.pick(lines)));
        pet.classList.remove("wiggle"); void pet.offsetWidth; pet.classList.add("wiggle");
        BT.Audio.play("pop");
      });
      front.appendChild(pet);
      this.custArea = UI.el("div", "customers");
      this.custArea.style.setProperty("--cw", (100 / this.seatCount - 2) + "%");
      front.appendChild(this.custArea);
      el.appendChild(front);
      this.front = front;

      // Quầy chế biến
      const counter = UI.el("div", "counter");
      const trayCount = this.S.upgrades.khay;
      for (let i = 0; i < trayCount; i++) {
        const t = new BT.Tray(i);
        this.trays.push(t);
        counter.appendChild(t.el);
        this.bindTray(t);
      }
      el.appendChild(counter);
      this.counter = counter;

      // Khu nguyên liệu
      const ingArea = UI.el("div", "ing-area");
      const tabs = UI.el("div", "tabs");
      this.tabEls = {};
      CONFIG.zones.forEach((z) => {
        const tab = UI.el("button", "tab");
        tab.type = "button";
        tab.dataset.zone = z.id;
        tab.appendChild(UI.el("span", "tab-icon", z.icon));
        tab.appendChild(UI.el("span", "tab-name", z.name));
        tab.appendChild(UI.el("span", "tab-dot"));
        const open = this.openZones.some((o) => o.id === z.id);
        if (!open) { tab.classList.add("locked"); tab.appendChild(UI.el("span", "tab-lock", "🔒")); }
        tab.addEventListener("click", () => this.onTab(z));
        tabs.appendChild(tab);
        this.tabEls[z.id] = tab;
      });
      ingArea.appendChild(tabs);
      this.hintEl = UI.el("div", "hint");
      if (this.dayCfg.hints) ingArea.appendChild(this.hintEl);
      this.grid = new BT.StationGrid(this.dayNum, {
        onTap: (id, cell) => this.onStationTap(id, cell),
        onQuickBuy: (id) => this.onQuickBuy(id)
      });
      ingArea.appendChild(this.grid.el);
      this.bindZoneSwipe(this.grid.el);
      el.appendChild(ingArea);

      // Thanh dưới
      const bottom = UI.el("div", "bottombar");
      this.trashEl = UI.iconButton("🗑", UI.t("trashLabel"), () => this.trashSelected(), "trash");
      bottom.appendChild(this.trashEl);
      const nav = UI.el("div", "zone-nav");
      nav.appendChild(UI.iconButton("◀", UI.t("zonePrev"), () => this.stepZone(-1), "nav-btn"));
      this.zoneLabel = UI.el("div", "zone-label");
      nav.appendChild(this.zoneLabel);
      nav.appendChild(UI.iconButton("▶", UI.t("zoneNext"), () => this.stepZone(1), "nav-btn"));
      bottom.appendChild(nav);
      const love = UI.el("div", "love-slot");
      if (this.dayNum >= CONFIG.gameplay.loveOpenDay) love.appendChild(UI.iconButton("💖", UI.t("loveLabel"), null, "love-btn"));
      bottom.appendChild(love);
      el.appendChild(bottom);

      root.appendChild(el);
      this.setZone(this.zone);
      this.updateHud();
      this.updateHint();
    }

    // ---------------- Vòng lặp ----------------
    loop() {
      let last = performance.now();
      const step = (t) => {
        const dt = Math.min(0.1, (t - last) / 1000);
        last = t;
        if (this.started && !this.over && this.pauseReasons.size === 0) this.update(dt);
        this.scope.raf(step);
      };
      this.scope.raf(step);
    }

    update(dt) {
      const d = this.dayCfg;
      if (this.spawned < this.total) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          const free = this.seats.findIndex((s) => s === null);
          if (free >= 0) {
            this.spawn(free);
            this.spawnTimer = UI.rand(d.spawn[0], d.spawn[1]);
          } else {
            this.spawnTimer = 0; // đầy ghế thì chờ
          }
        }
      }
      this.customers.slice().forEach((c) => c.update(dt));
      if (this.spawned >= this.total && this.customers.length === 0) this.finish(false);
    }

    countdown() {
      const layer = UI.el("div", "countdown");
      this.el.appendChild(layer);
      const steps = CONFIG.texts.countdown;
      const ms = CONFIG.gameplay.countdownStepSec * 1000;
      steps.forEach((txt, i) => {
        this.scope.timeout(() => {
          layer.innerHTML = "";
          const n = UI.el("div", "count-num" + (i === steps.length - 1 ? " go" : ""), txt);
          layer.appendChild(n);
          BT.Audio.play(i === steps.length - 1 ? "tie" : "tap");
        }, i * ms);
      });
      this.scope.timeout(() => {
        layer.remove();
        this.started = true;
      }, steps.length * ms);
    }

    // ---------------- Khách ----------------
    pickDish() {
      const unlockToday = this.dayCfg.unlock || [];
      return UI.weighted(this.dishPool, (r) => (unlockToday.includes(r.id) ? CONFIG.gameplay.newDishWeight : 1)).id;
    }

    spawn(seat) {
      const typeId = UI.pick(this.typePool);
      const c = new BT.Customer({
        typeId,
        order: [this.pickDish()],
        seat,
        centerPct: CONFIG.gameplay.seatCenters[this.seatCount][seat],
        patienceMult: this.dayCfg.patienceMult,
        area: this.custArea,
        scope: this.scope,
        onWalkout: (cc) => this.onWalkout(cc),
        onGone: (cc) => this.onGone(cc)
      });
      this.seats[seat] = c;
      this.customers.push(c);
      this.spawned++;
      c.el.addEventListener("click", () => this.onCustomerTap(c));
      c.enter();
      this.updateTabDots();
      this.updateHud();
    }

    onWalkout(c) {
      const G = CONFIG.gameplay;
      c.state = "leaving";
      c.react(UI.t("angry"), "😠");
      this.stats.walkouts++;
      this.stats.ratings.push(G.ratingWalkout);
      this.done++;
      this.hearts = Math.max(0, this.hearts - 1);
      BT.Audio.play("angry");
      BT.Audio.vibrate(G.vibrateBad);
      UI.shake(this.hudHearts);
      c.leave(G.angryLeaveDelaySec);
      this.updateHud();
      this.updateTabDots();
      if (this.hearts <= 0) this.finish(true);
    }

    onGone(c) {
      this.customers = this.customers.filter((x) => x !== c);
      if (this.seats[c.seat] === c) this.seats[c.seat] = null;
      this.updateTabDots();
    }

    onCustomerTap(c) {
      if (this.over || !this.started) return;
      const tray = this.selected !== null ? this.trays[this.selected] : null;
      if (!tray) { UI.toast(UI.t("pickTrayFirst")); return; }
      this.deliver(c, tray);
    }

    deliver(c, tray) {
      const G = CONFIG.gameplay;
      if (c.state === "entering") { UI.toast(UI.t("notArrived")); return; }
      if (c.state !== "waiting") return;
      if (tray.isEmpty()) { UI.toast(UI.t("trayIsEmpty")); return; }

      const res = BT.Tray.evaluate(tray, c.order[0]);
      if (!res.ok) {
        const vars = c.vars({ ing: res.ing ? UI.ing(res.ing).short : "" });
        const key = { notOrdered: "wrongNotOrdered", missing: "wrongMissing", extra: "wrongExtra", notMixed: "wrongNotMixed" }[res.reason];
        c.react(UI.t(key, vars), "😕", G.reactionShowSec);
        c.penalize(G.wrongPatiencePenalty);
        c.wrongOnce = true;
        UI.shake(tray.el);
        UI.shake(c.bubble);
        BT.Audio.play("wrong");
        return;
      }

      // Giao đúng
      const p = c.pct();
      const speed = p > G.patienceHigh ? G.speedFactor.fast : p >= G.patienceLow ? G.speedFactor.normal : G.speedFactor.slow;
      const pay = Math.round(UI.recipePrice(c.order[0]) * speed);
      const tip = Math.round(UI.randInt(c.type.tip[0], c.type.tip[1]) * (this.dayCfg.tipMult || 1));
      let stars = G.ratingSteps.find((s) => p >= s.min).stars;
      if (c.wrongOnce) stars = Math.min(stars, G.ratingAfterWrongMax);

      this.stats.revenue += pay;
      this.stats.tips += tip;
      this.stats.served++;
      this.stats.ratings.push(stars);
      this.S.wallet += pay + tip;
      this.done++;

      c.state = "served";
      c.el.classList.add("happy");
      c.react(p > G.patienceHigh ? UI.t("fast") : UI.t("praise"), "😍");
      const from = UI.center(c.el);
      UI.floatText(from.x, from.y - 30, "+" + UI.money(pay + tip), "money");
      UI.floatText(from.x, from.y - 60, "⭐".repeat(stars), "stars");
      UI.fly(from, UI.center(this.hudMoney), "🪙", 0.6);
      BT.Audio.play("coin");
      BT.Audio.vibrate(G.vibrateGood);

      tray.clear();
      tray.render();
      this.select(null);
      c.leave(G.happyLeaveDelaySec);
      this.updateHud();
      this.updateTabDots();
    }

    // ---------------- Khay ----------------
    bindTray(t) {
      const G = CONFIG.gameplay;
      let start = null;
      let ghost = null;
      const el = t.el;

      el.addEventListener("pointerdown", (e) => {
        if (e.target.closest("[data-action='shake']")) return;
        start = { x: e.clientX, y: e.clientY, id: e.pointerId };
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ }
      });
      el.addEventListener("pointermove", (e) => {
        if (!start || start.id !== e.pointerId) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (!ghost && Math.hypot(dx, dy) > G.dragStartPx && !t.isEmpty() && this.started && !this.over) {
          this.select(t.index);
          ghost = UI.el("div", "drag-ghost");
          ghost.appendChild(el.querySelector(".bag").cloneNode(true));
          UI.app().appendChild(ghost);
          el.classList.add("dragging");
        }
        if (ghost) {
          const a = UI.app().getBoundingClientRect();
          ghost.style.transform = `translate(${e.clientX - a.left}px, ${e.clientY - a.top}px) translate(-50%, -50%)`;
        }
      });
      const end = (e) => {
        if (!start || start.id !== e.pointerId) return;
        const wasDrag = !!ghost;
        start = null;
        if (wasDrag) {
          ghost.remove();
          ghost = null;
          el.classList.remove("dragging");
          if (e.type === "pointercancel") return;
          const target = document.elementFromPoint(e.clientX, e.clientY);
          const cEl = target && target.closest(".customer");
          if (cEl) {
            const c = this.customers.find((x) => String(x.id) === cEl.dataset.cid);
            if (c) this.deliver(c, t);
          } else if (target && target.closest(".trash")) {
            this.trashSelected();
          }
        } else if (e.type === "pointerup") {
          this.select(t.index);
          BT.Audio.play("tap");
        }
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-action='shake']")) { this.select(t.index); this.openShake(t); }
      });
    }

    select(index) {
      this.selected = index;
      this.trays.forEach((t) => t.el.classList.toggle("selected", t.index === index));
      this.updateHint();
    }

    trashSelected() {
      const t = this.selected !== null ? this.trays[this.selected] : null;
      if (!t || t.isEmpty()) { UI.toast(UI.t("trashNothing")); return; }
      t.clear();
      t.render();
      UI.shake(this.trashEl);
      UI.toast(UI.t("trashed"));
      BT.Audio.play("wrong");
      this.updateHint();
    }

    // ---------------- Nguyên liệu ----------------
    onStationTap(ingId, cell) {
      if (this.over || !this.started) return;
      if (BT.Save.stock(ingId) <= 0) { UI.toast(UI.t("outOfStock", { ing: UI.ing(ingId).short })); UI.shake(cell); return; }
      const role = BT.Tray.roleOf(ingId, this.zone);
      let tray = this.selected !== null ? this.trays[this.selected] : null;
      if (!tray || (role === "base" && !tray.isEmpty())) {
        const empty = this.trays.find((t) => t.isEmpty());
        if (!empty) {
          if (!tray) { this.trays.forEach((t) => UI.shake(t.el)); UI.toast(UI.t("noTray")); return; }
        } else {
          tray = empty;
          this.select(empty.index);
        }
      }
      const r = tray.add(ingId, this.zone);
      if (!r.ok) {
        UI.shake(tray.el);
        UI.toast(r.msg);
        BT.Audio.play("wrong");
        return;
      }
      this.S.inventory[ingId] = BT.Save.stock(ingId) - 1;
      this.grid.refresh();
      UI.fly(UI.center(cell), UI.center(tray.el), UI.ing(ingId).emoji, CONFIG.gameplay.flySec);
      this.scope.timeout(() => {
        tray.render();
        tray.el.classList.remove("bounce"); void tray.el.offsetWidth; tray.el.classList.add("bounce");
        this.updateHint();
      }, CONFIG.gameplay.flySec * 1000);
      BT.Audio.play("add");
    }

    onQuickBuy(ingId) {
      const M = CONFIG.money;
      const price = UI.ing(ingId).price * M.quickBuyPriceMult;
      if (this.S.wallet < price) { UI.toast(UI.t("lacking", { x: UI.money(price - this.S.wallet) })); return; }
      this.S.wallet -= price;
      this.S.inventory[ingId] = BT.Save.stock(ingId) + M.quickBuyQty;
      this.stats.expense += price;
      this.S.today.expense = this.stats.expense;
      this.grid.refresh();
      BT.Audio.play("coin");
      UI.toast(UI.t("bought", { q: M.quickBuyQty, name: UI.ing(ingId).name }));
    }

    // ---------------- Lắc bịch ----------------
    openShake(tray) {
      if (!tray.canShake() || this.over) return;
      const G = CONFIG.gameplay;
      const need = this.S.upgrades.lac_nhanh > 0 ? G.shakeNeededUpgraded : G.shakeNeeded;
      const layer = UI.el("div", "shake-layer");
      layer.appendChild(UI.el("div", "shake-title", UI.t("shakeTitle")));
      const zone = UI.el("div", "shake-zone");
      const bag = UI.el("div", "big-bag");
      bag.appendChild(tray.el.querySelector(".bag-items").cloneNode(true));
      zone.appendChild(bag);
      layer.appendChild(zone);
      const meter = UI.el("div", "meter");
      const fill = UI.el("div", "meter-fill");
      meter.appendChild(fill);
      layer.appendChild(UI.el("div", "meter-label", UI.t("shakeMeter")));
      layer.appendChild(meter);
      layer.appendChild(UI.el("div", "shake-hint", UI.t("shakeHint", { n: need })));
      const later = UI.button(UI.t("btnLater"), "btn-white small", () => close());
      layer.appendChild(later);
      layer.style.setProperty("--shake-top", this.counter.offsetTop + "px");
      this.el.appendChild(layer);
      this.shakeLayer = layer;

      let count = tray.shakeCount;
      let down = null;
      let dir = 0;
      let lastX = 0;
      let swiped = false;
      const show = () => {
        fill.style.width = Math.min(100, (count / need) * 100) + "%";
        bag.style.transform = `rotate(${count % 2 ? G.shakeTiltDeg : -G.shakeTiltDeg}deg)`;
      };
      const bump = () => {
        if (tray.tied) return;
        count++;
        tray.shakeCount = count;
        BT.Audio.play("shake");
        show();
        if (count >= need) {
          tray.tied = true;
          bag.appendChild(UI.el("div", "big-tie", "🎀"));
          layer.classList.add("done");
          layer.querySelector(".shake-hint").textContent = UI.t("shakeDone");
          BT.Audio.play("tie");
          this.scope.timeout(() => close(), 450);
        }
      };
      const close = () => {
        if (!layer.parentNode) return;
        layer.remove();
        this.shakeLayer = null;
        tray.render();
        this.updateHint();
      };
      zone.addEventListener("pointerdown", (e) => {
        down = e.pointerId; lastX = e.clientX; dir = 0; swiped = false;
        try { zone.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ }
      });
      zone.addEventListener("pointermove", (e) => {
        if (down !== e.pointerId) return;
        const dx = e.clientX - lastX;
        if (Math.abs(dx) >= G.shakeSwipePx) {
          const nd = Math.sign(dx);
          if (nd !== dir) { dir = nd; swiped = true; bump(); }
          lastX = e.clientX;
        }
      });
      const up = (e) => {
        if (down !== e.pointerId) return;
        down = null;
        if (!swiped && e.type === "pointerup") bump();
      };
      zone.addEventListener("pointerup", up);
      zone.addEventListener("pointercancel", up);
      show();
    }

    // ---------------- Khu làm món ----------------
    onTab(z) {
      const open = this.openZones.some((o) => o.id === z.id);
      if (!open) {
        if (z.openDay > this.dayNum) UI.toast(UI.t("zoneLocked", { zone: z.name, n: z.openDay }));
        else UI.toast(UI.t("zoneLaterBuild", { zone: z.name }));
        return;
      }
      this.setZone(z.id);
    }

    setZone(id) {
      this.zone = id;
      Object.keys(this.tabEls).forEach((k) => this.tabEls[k].classList.toggle("active", k === id));
      const z = CONFIG.zones.find((x) => x.id === id);
      this.zoneLabel.textContent = z.icon + " " + z.name;
      this.grid.show(id);
    }

    stepZone(delta) {
      const ids = this.openZones.map((z) => z.id);
      if (ids.length < 2) return;
      const i = ids.indexOf(this.zone);
      this.setZone(ids[(i + delta + ids.length) % ids.length]);
    }

    bindZoneSwipe(target) {
      let s = null;
      target.addEventListener("pointerdown", (e) => { s = { x: e.clientX, y: e.clientY }; });
      target.addEventListener("pointerup", (e) => {
        if (!s) return;
        const dx = e.clientX - s.x;
        const dy = e.clientY - s.y;
        s = null;
        if (Math.abs(dx) > CONFIG.gameplay.swipeZonePx && Math.abs(dy) < Math.abs(dx) / 2) this.stepZone(dx < 0 ? 1 : -1);
      });
    }

    updateTabDots() {
      const waiting = new Set();
      this.customers.forEach((c) => {
        if (c.state === "waiting" || c.state === "entering") c.order.forEach((id) => waiting.add(UI.recipe(id).zone));
      });
      Object.keys(this.tabEls).forEach((k) => this.tabEls[k].classList.toggle("has-dot", waiting.has(k)));
    }

    // ---------------- HUD & gợi ý ----------------
    income() { return this.stats.revenue + this.stats.tips; }

    updateHud() {
      this.hudCust.textContent = UI.t("hudCustomers", { d: this.done, t: this.total });
      const r = this.stats.ratings;
      this.hudRate.textContent = "⭐ " + (r.length ? UI.rating(r.reduce((a, b) => a + b, 0) / r.length) : "–");
      this.hudMoney.textContent = "🪙 " + UI.money(this.income()) + " / " + UI.money(this.dayCfg.target);
      this.hudMoney.classList.toggle("reached", this.income() >= this.dayCfg.target);
      let h = "";
      for (let i = 0; i < CONFIG.gameplay.hearts; i++) h += i < this.hearts ? "❤️" : "🤍";
      this.hudHearts.textContent = h;
    }

    updateHint() {
      if (!this.dayCfg.hints) return;
      const H = CONFIG.texts.hints;
      const t = this.selected !== null ? this.trays[this.selected] : this.trays.find((x) => !x.isEmpty());
      let msg = H.start;
      if (t && !t.isEmpty()) {
        if (t.tied) msg = H.deliver;
        else if (t.finish.length) msg = H.shake;
        else if (Object.keys(t.items).length >= 2) msg = H.finish;
        else msg = H.toppings;
      }
      this.hintEl.textContent = UI.fmt(msg);
    }

    // ---------------- Sổ công thức ----------------
    openBook() {
      if (this.over) return;
      const pause = this.dayNum <= CONFIG.gameplay.recipeBookPauseUntilDay;
      if (pause) this.pauseReasons.add("book");
      const list = UI.el("div", "book");
      this.dishPool.forEach((r) => {
        const row = UI.el("div", "book-row" + (r.id === window.PERSONAL.favoriteDish ? " fav" : ""));
        const head = UI.el("div", "book-head");
        head.appendChild(UI.el("span", "book-emoji", r.emoji));
        head.appendChild(UI.el("span", "book-name", r.name));
        head.appendChild(UI.el("span", "book-price", UI.money(UI.recipePrice(r.id))));
        row.appendChild(head);
        const line = (label, ids) => {
          const l = UI.el("div", "book-line");
          l.appendChild(UI.el("b", "", label + ": "));
          l.appendChild(document.createTextNode(ids.map((id) => UI.ing(id).emoji + " " + UI.ing(id).name).join(", ")));
          row.appendChild(l);
        };
        line(UI.t("bookBase"), [r.base]);
        line(UI.t("bookToppings"), r.toppings);
        const fin = r.finish.map((s) => (CONFIG.ingredients[s] ? UI.ing(s).emoji + " " + UI.ing(s).name : s === "lac" ? "💫 " + UI.t("bookShake") : s));
        const l = UI.el("div", "book-line");
        l.appendChild(UI.el("b", "", UI.t("bookFinish") + ": "));
        l.appendChild(document.createTextNode(fin.join(" → ")));
        row.appendChild(l);
        list.appendChild(row);
      });
      this.bookModal = UI.modal({
        title: UI.t("bookTitle"),
        body: list,
        dismissable: true,
        className: "modal-book",
        buttons: [{ label: UI.t("btnClose"), cls: "btn-pink", onClick: () => this.pauseReasons.delete("book") }],
        onClose: () => this.pauseReasons.delete("book")
      });
    }

    // ---------------- Tạm dừng ----------------
    openPause() {
      if (this.over || this.pauseReasons.has("menu")) return;
      this.pauseReasons.add("menu");
      BT.Audio.suspend();
      const resume = () => { this.pauseReasons.delete("menu"); BT.Audio.resume(); };
      this.pauseModal = UI.modal({
        title: UI.t("pauseTitle"),
        body: UI.t("leaveConfirm"),
        dismissable: true,
        onClose: resume,
        buttons: [
          { label: UI.t("btnContinue"), cls: "btn-pink", onClick: resume },
          { label: UI.t("btnRetry"), cls: "btn-orange", onClick: () => { resume(); this.abandon("retry"); } },
          { label: UI.t("btnToMap"), cls: "btn-white", onClick: () => { resume(); this.abandon("map"); } }
        ]
      });
    }

    abandon(where) {
      this.over = true;
      BT.Save.restoreDay();
      if (where === "retry") this.router.go("Prep", { day: this.dayNum }, { replace: true });
      else this.router.backTo("Map");
    }

    // ---------------- Kết ca ----------------
    finish(lostHearts) {
      if (this.over) return;
      this.over = true;
      const G = CONFIG.gameplay;
      const M = CONFIG.money;
      const d = this.dayCfg;
      const income = this.income();
      const passed = !lostHearts && income >= d.target;
      let stars = 0;
      if (passed) {
        stars = 1;
        if (income >= d.target * G.dayStarRatios[1]) stars = 2;
        if (income >= d.target * G.dayStarRatios[2] && this.stats.walkouts === 0) stars = 3;
      }
      let kept = income;
      if (!passed) {
        kept = Math.round(income * M.loseKeepRatio);
        this.S.wallet -= income - kept;
      }
      const r = this.stats.ratings;
      const avg = r.length ? r.reduce((a, b) => a + b, 0) / r.length : 0;
      const firstClear = passed && !(this.S.days[this.dayNum] && this.S.days[this.dayNum].stars > 0);

      const rec = this.S.days[this.dayNum] || { stars: 0, bestRevenue: 0, avgRating: 0 };
      rec.stars = Math.max(rec.stars, stars);
      rec.bestRevenue = Math.max(rec.bestRevenue, income);
      if (avg > rec.avgRating) rec.avgRating = Math.round(avg * 10) / 10;
      this.S.days[this.dayNum] = rec;
      if (passed && typeof this.dayNum === "number") this.S.unlockedDay = Math.max(this.S.unlockedDay, this.dayNum + 1);
      if (this.S.dayBackup) this.S.dayBackup.finished = true;
      this.S.today = null;
      BT.Save.persist();

      const summary = {
        day: this.dayNum, passed, lostHearts, stars, firstClear,
        income, kept, target: d.target,
        revenue: this.stats.revenue, tips: this.stats.tips, expense: this.stats.expense,
        net: kept - this.stats.expense,
        served: this.stats.served, total: this.total, walkouts: this.stats.walkouts, avgRating: avg
      };

      const banner = UI.el("div", "end-banner" + (lostHearts ? " lose" : ""), lostHearts ? UI.t("endLose") : UI.t("endWin"));
      this.el.appendChild(banner);
      BT.Audio.play(passed ? "win" : "lose");
      this.scope.timeout(() => this.router.go("Result", summary, { replace: true }), G.endBannerSec * 1000);
    }

    // ---------------- Vòng đời màn hình ----------------
    onBack() {
      if (this.over) return true;
      if (UI.modals.length) { UI.closeTopModal(); return true; }
      if (this.shakeLayer) { this.shakeLayer.querySelector(".btn").click(); return true; }
      this.openPause();
      return true;
    }

    onHide() {
      if (this.started && !this.over) this.openPause();
    }

    destroy() {
      this.scope.clear();
      UI.closeAllModals();
    }
  }

  BT.Screens.Game = {
    mount(root, params, router) { return new Game(root, params, router); }
  };
})();
