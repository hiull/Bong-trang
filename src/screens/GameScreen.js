// GameScreen.js — Màn bán hàng chính.
// 4 khu: Trộn (lắc bịch), Nướng (tán trứng, canh lửa, gấp bánh), Cuốn (vuốt cuốn), Nước (nhấn giữ rót).
// Khách gọi 1–2 món + yêu cầu riêng, thanh kiên nhẫn, 3 tim, combo, Năng lượng yêu thương,
// Nhập nhanh, Sổ công thức, tạm dừng, sự kiện theo ngày.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  class Game {
    constructor(root, params, router) {
      const C = CONFIG;
      const G = C.gameplay;
      this.router = router;
      this.S = BT.Save.state;
      const run = params.run || BT.MS.run(this.S.ms.index);
      this.run = run;
      this.dayId = run.key;                    // "ms13" | "secret" | "daily" | "endless"
      this.dayNum = run.level;                 // cấp mốc: so với ngày mở món
      this.secret = run.mode === "secret";
      this.endless = run.mode === "endless";
      this.helperOn = BT.Helper.working(run);   // anh Hiếu phụ tiệm ca này
      // Giờ cao điểm, khách đặc biệt, thú cưng, kỷ lục
      this.rushPlan = !this.secret && !this.endless && ["story", "replay", "daily"].includes(run.mode) && run.level >= CONFIG.rush.fromLevel;
      this.rush = null;
      this.rushDone = false;
      this.vipCame = false;
      this.petUsed = {};
      this.emptyFor = 0;
      const recBest = (run.mode === "story" || run.mode === "replay") ? (BT.MS.stateOf(run.season).best[run.ms] || null) : null;
      this.recordIncome = recBest && recBest.income > 0 ? recBest.income : 0;
      this.recordBroken = false;
      const RV = CONFIG.rival;
      this.rivalPlan = run.mode === "story" && !run.scripted && (run.season || 1) >= 2 && run.cfg.day >= RV.fromDay && Math.random() < RV.rate;
      this.rival = null;
      this.rivalDone = false;
      this.dayCfg = run.cfg;
      this.scope = UI.scope();
      this.pauseReasons = new Set();
      this.started = false;
      this.over = false;

      this.total = this.endless ? Infinity : this.dayCfg.customers + (this.S.bonusCustomers || 0);
      this.spawned = 0;
      this.done = 0;
      this.hearts = BT.assist("moreHearts") ? CONFIG.assist.hearts : G.hearts;
      this.combo = 0;
      this.love = 0;
      this.freezeLeft = 0;
      this.catsToday = 0;
      this.eggInHand = false;
      this.groupDone = false;
      this.groupPending = 0;
      this.reviewerAt = this.dayCfg.ratingWeight && !this.endless ? UI.randInt(1, Math.max(1, this.total - 2)) : -1;
      const today = this.S.today && this.S.today.day === this.dayId ? this.S.today : { day: this.dayId, expense: 0 };
      this.S.today = today;
      this.stats = { revenue: 0, tips: 0, expense: today.expense, served: 0, walkouts: 0, ratings: [], weights: [] };

      // Nâng cấp & trợ giúp khi thua 2 lần liên tiếp
      const up = this.S.upgrades;
      this.patienceMult = this.dayCfg.patienceMult;
      this.patienceMult *= 1 + BT.patienceBoost();   // Cài đặt → Kiên nhẫn của khách (thư giãn ≥ +50%)
      if (up.quat > 0) this.patienceMult *= 1 + C.upgrades.quat.patienceBonus[up.quat - 1];
      const streak = this.S.loseStreak;
      this.helped = !!(streak && streak.day === this.dayId && streak.n >= 2);
      if (this.helped) this.patienceMult *= 1 + G.retryHelpPatienceBonus;

      this.seatCount = up.ghe;
      this.seats = new Array(this.seatCount).fill(null);
      this.customers = [];
      this.trays = [];
      this.grills = [];
      this.selected = null;
      this.spawnTimer = G.firstCustomerDelaySec;

      this.openZones = C.zones.filter((z) => z.openDay <= this.dayNum && C.build.playableZones.includes(z.id));
      this.zone = this.openZones[0].id;
      const zoneIds = this.openZones.map((z) => z.id);
      this.dishPool = this.dishPoolAll = C.recipes.filter((r) => r.openDay <= this.dayNum && (zoneIds.includes(r.zone) || (r.combo && r.combo.every((id) => zoneIds.includes(UI.recipe(id).zone)))))
        .concat(BT.Fun.customRecipes().filter((r) => zoneIds.includes(r.zone)));   // món sáng tạo của Bống
      this.typePool = Object.keys(C.customerTypes).filter((id) => {
        const t = C.customerTypes[id];
        return t.kind === "normal" && t.openDay <= this.dayNum;
      });

      this.planSpecials();
      this.q = { served: 0, comboMax: 0, crispy: 0, five: 0, fav: 0, req: 0, tomo: 0 };
      // Sự cố nhỏ: vũng nước đổ (tối đa 1 sự cố/ngày, có nước đổ thì không có mèo hoang)
      const I = CONFIG.incidents;
      this.spillAt = -1;
      this.spillLeft = 0;
      if (!this.secret && !this.endless && this.dayNum >= I.fromDay && Math.random() < I.spillRate) {
        this.spillAt = Math.max(1, Math.round(this.total * UI.rand(I.spillAtProgress[0], I.spillAtProgress[1])));
        this.catsToday = G.catMaxPerDay;
      }
      this.build(root);
      if (this.helperOn) BT.Helper.attach(this);
      this.loop();
      this.countdown();
      BT.Audio.music(this.dayCfg.weather === CONFIG.audio.rainWeather ? "rain" : "game");
    }

    // Lên lịch khách đặc biệt: Hiếu (Tomortle), khách quen có cốt truyện, khách ruột
    planSpecials() {
      const G = CONFIG.gameplay;
      // Lượt anh Hiếu ghé chỉ để thả thính: các mốc tiến độ ca (0–1)
      const [w0, w1] = G.tomoFlirtWindow;
      const nFlirt = this.secret ? G.tomoFlirtSecret : (this.dayNum >= G.tomoFlirtFromDay ? G.tomoFlirtPerDay : 0);
      this.flirtAt = [];
      for (let k = 0; k < nFlirt; k++) this.flirtAt.push(this.secret ? w0 + (k + 0.5) * (w1 - w0) / nFlirt : UI.rand(w0, w1));
      this.flirtAt.sort((a, b) => a - b);
      this.flirtDone = 0;
      this.flirtActive = false;
      this.flirtIndex = -1;
      this.plan = {};
      this.tomoCame = 0;
      this.tomoWanted = 0;
      const free = () => {
        const slots = [];
        for (let i = 0; i < this.total; i++) if (!this.plan[i]) slots.push(i);
        return slots;
      };
      if (this.endless) {
        this.flirtAt = [];
        this.tomoWanted = Infinity;
        return;
      }
      if (this.secret) {
        this.tomoWanted = G.secretTomortleVisits;
        for (let k = 0; k < this.tomoWanted; k++) this.plan[Math.floor((k + 0.5) * this.total / this.tomoWanted)] = { kind: "tomortle" };
        return;
      }
      if (this.dayCfg.tomoVisits) {
        this.tomoWanted = this.dayCfg.tomoVisits;
        for (let k = 0; k < this.tomoWanted; k++) this.plan[Math.floor((k + 0.5) * this.total / this.tomoWanted)] = { kind: "tomortle" };
      } else if (this.dayNum >= G.tomortleFromDay && !this.helperOn) {
        this.tomoWanted = 1;
        this.plan[UI.randInt(1, Math.max(1, this.total - G.tomortleForceWhenLeft - 1))] = { kind: "tomortle" };
      }
      const R = CONFIG.regulars;
      const S = this.S;
      S.regularNext = S.regularNext || {};
      Object.keys(R).forEach((id) => {
        const def = R[id];
        const done = S.regularCustomers[id] || 0;
        const dishOk = this.dishPool.some((r) => r.id === def.dish);
        let entry = null;
        const avail = BT.MS.chaptersAt(id, this.dayNum);
        if (done < avail && this.dayNum >= def.startDay && S.ms.shifts >= (S.regularNext[id] || 0) && dishOk) {
          entry = { kind: "regular", id, chapter: done };
        } else if (done >= avail && avail > 0 && Math.random() < G.regularLoyalRate) {
          entry = { kind: "regular", id, chapter: -1 };
        }
        if (entry) {
          const slots = free().filter((i) => i > 0);
          if (slots.length) this.plan[UI.pick(slots)] = entry;
        }
      });
    }

    containers() { return this.trays.concat(this.grills); }

    // ---------------- Dựng giao diện ----------------
    build(root) {
      const el = UI.el("div", "screen game skin-" + BT.Fun.skin() + " weather-" + this.dayCfg.weather);
      this.el = el;

      // HUD
      const hud = UI.el("div", "hud");
      this.hudCust = UI.el("div", "pill hud-cust");
      this.hudRate = UI.el("div", "pill hud-rate");
      this.hudMoney = UI.el("div", "pill hud-money");
      this.hudHearts = UI.el("div", "hud-hearts");
      this.hudCombo = UI.el("div", "pill hud-combo");
      const left = UI.el("div", "hud-left");
      const row1 = UI.el("div", "hud-row");
      const row2 = UI.el("div", "hud-row");
      row1.appendChild(this.hudCust);
      row1.appendChild(this.hudRate);
      row1.appendChild(this.hudCombo);
      row2.appendChild(this.hudMoney);
      if (this.recordIncome) { this.hudRecord = UI.el("div", "pill hud-record"); row2.appendChild(this.hudRecord); }
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
      const w = CONFIG.weathers[this.dayCfg.weather];
      front.appendChild(UI.el("div", "weather-chip", UI.t("weatherChip", { icon: w.icon, label: w.label })));
      const wfx = UI.el("div", "weather-fx");
      if (this.dayCfg.weather === "windy") { wfx.appendChild(UI.el("span", "leaf l1", "🍃")); wfx.appendChild(UI.el("span", "leaf l2", "🍃")); }
      if (this.dayCfg.weather === "festival") wfx.appendChild(UI.el("div", "fest-row", "🏮 🏮 🏮 🏮 🏮"));
      front.appendChild(wfx);
      CONFIG.gameplay.seatCenters[this.seatCount].forEach((c) => {
        const stool = UI.el("div", "stool");
        stool.style.left = c + "%";
        front.appendChild(stool);
      });
      UI.decorateFront(front);
      this.spillEl = UI.el("button", "spill", "💦");
      this.spillEl.type = "button";
      this.spillEl.addEventListener("click", () => this.wipeSpill());
      front.appendChild(this.spillEl);
      this.custArea = UI.el("div", "customers");
      this.custArea.style.setProperty("--cw", (100 / this.seatCount - 2) + "%");
      front.appendChild(this.custArea);
      this.loveFx = UI.el("div", "love-fx");
      front.appendChild(this.loveFx);
      el.appendChild(front);
      this.front = front;

      // Quầy chế biến: khay chung + vỉ nướng
      const counter = UI.el("div", "counter");
      this.trayGroup = UI.el("div", "tray-group");
      this.grillGroup = UI.el("div", "tray-group grills");
      const trayCount = BT.assist("threeTrays") ? Math.max(this.S.upgrades.khay, CONFIG.assist.trays) : this.S.upgrades.khay;
      for (let i = 0; i < trayCount; i++) {
        const t = new BT.Tray(i, "tray");
        this.trays.push(t);
        this.trayGroup.appendChild(t.el);
        this.bindTray(t);
      }
      if (this.openZones.some((z) => z.id === "nuong")) {
        for (let i = 0; i < this.S.upgrades.bep; i++) {
          const g = new BT.Tray(i, "grill");
          this.grills.push(g);
          this.grillGroup.appendChild(g.el);
          this.bindTray(g);
        }
      }
      this.trayGroup.classList.add("n" + this.trays.length);
      this.grillGroup.classList.add("n" + this.grills.length);
      counter.appendChild(this.trayGroup);
      counter.appendChild(this.grillGroup);
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
        onQuickBuy: (id) => this.onQuickBuy(id),
        canHold: (id) => this.canHold(id),
        onHoldDone: (id, cell) => this.onStationTap(id, cell, true),
        isPaused: () => this.isPaused()
      });
      this.hintRow = UI.el("div", "hint-row");
      this.hintKey = "";
      ingArea.appendChild(this.hintRow);
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
      const loveSlot = UI.el("div", "love-slot");
      if (this.dayNum >= CONFIG.gameplay.loveOpenDay) {
        this.loveBtn = UI.iconButton("💖", UI.t("loveLabel"), () => this.useLove(), "love-btn");
        this.loveFill = UI.el("div", "love-fill");
        this.loveBtn.appendChild(this.loveFill);
        loveSlot.appendChild(this.loveBtn);
      }
      bottom.appendChild(loveSlot);
      el.appendChild(bottom);

      root.appendChild(el);
      this.setZone(this.zone);
      this.updateHud();
      this.updateLove();
    }

    // ---------------- Vòng lặp ----------------
    isPaused() { return !this.started || this.over || this.pauseReasons.size > 0; }

    loop() {
      let last = performance.now();
      const step = (t) => {
        const dt = Math.min(0.1, (t - last) / 1000);
        last = t;
        if (!this.isPaused()) this.update(dt);
        if (this.tut) UI.coach.update();
        this.scope.raf(step);
      };
      this.scope.raf(step);
    }

    update(dt) {
      const G = CONFIG.gameplay;
      if (this.freezeLeft > 0) {
        this.freezeLeft -= dt;
        if (this.freezeLeft <= 0) { this.freezeLeft = 0; this.front.classList.remove("loving"); }
      }

      // Sinh khách
      if (this.spawned < this.total) {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          const free = this.seats.findIndex((s) => s === null);
          if (free >= 0) this.spawnNext(free);
          else this.spawnTimer = 0; // đầy ghế thì chờ
        }
      }

      // Bếp nướng
      let warn = false;
      const zones = BT.Tray.cookZones();
      this.grills.forEach((g) => {
        if (g.updateCook(this.spillLeft > 0 ? dt * (1 - CONFIG.incidents.spillSlow) : dt) === "burnt") {
          g.render();
          BT.Audio.play("burn");
          BT.Audio.vibrate(G.vibrateBad);
          UI.toast(UI.t("burntNow"));
          this.updateHint();
        }
        if (g.cooking && g.cook >= zones[3].from) warn = true;
        const q = g.cookState() || "";
        if (g.el.dataset.q !== q) g.el.dataset.q = q;
      });
      if (this.tabEls.nuong) this.tabEls.nuong.classList.toggle("warn", warn && this.zone !== "nuong");

      // Xe chè đối thủ: xuất hiện trong khoảng giữa ca
      if (this.rivalPlan && !this.rivalDone && this.total !== Infinity) {
        const pr = this.done / this.total;
        if (!this.rival && pr >= CONFIG.rival.window[0] && pr < CONFIG.rival.window[1]) this.rivalOn();
        else if (this.rival && pr >= CONFIG.rival.window[1]) this.rivalOff(false);
      }
      // Chế độ dễ: hàng gợi ý nguyên liệu (cập nhật vài lần mỗi giây)
      this.hintT = (this.hintT || 0) - dt;
      if (this.hintT <= 0) { this.hintT = 0.25; this.renderHints(); }
      if (this.rushPlan && !this.rush && !this.rushDone && this.total !== Infinity) {
        const pr = this.done / this.total;
        if (pr >= CONFIG.rush.window[0] && pr < CONFIG.rush.window[1]) this.rushOn();
      }
      this.tickRush(dt);
      this.petsTick(dt);
      this.checkRecord();
      let cdt = this.helper && this.helper.role === "waiter" ? dt * (1 - CONFIG.helper.patienceSlow) : dt;
      if (this.rival) cdt *= 1 + CONFIG.rival.patienceFaster;
      this.customers.slice().forEach((c) => c.update(cdt, this.freezeLeft > 0 || !!this.tut));
      if (this.helper && !this.tut) BT.Helper.tick(this, dt);
      this.tickTutorial();
      const allServed = this.spawned >= this.total && this.groupPending === 0 && this.customers.filter((c) => !c.isCat).length === 0;
      // Tới mốc thả thính (hoặc hết khách mà còn lượt chưa ghé) → anh Hiếu vào khi tiệm đang rảnh tay
      const due = this.endless
        ? this.dayNum >= G.tomoFlirtFromDay && this.stats.served >= (this.flirtDone + 1) * CONFIG.endless.flirtEvery
        : this.flirtDone < this.flirtAt.length && (allServed || this.done / this.total >= this.flirtAt[this.flirtDone]);
      if (due && !this.flirtActive && !this.storyPending && !UI.modals.length && !this.shakeLayer && !this.tut) this.startFlirt();
      if (allServed && this.flirtDone >= this.flirtAt.length && !this.flirtActive) this.finish(false);
    }

    countdown() {
      const layer = UI.el("div", "countdown");
      this.el.appendChild(layer);
      const steps = CONFIG.texts.countdown;
      const ms = CONFIG.gameplay.countdownStepSec * 1000;
      steps.forEach((txt, i) => {
        this.scope.timeout(() => {
          layer.innerHTML = "";
          layer.appendChild(UI.el("div", "count-num" + (i === steps.length - 1 ? " go" : ""), txt));
          BT.Audio.play(i === steps.length - 1 ? "tie" : "tap");
        }, i * ms);
      });
      this.scope.timeout(() => {
        layer.remove();
        this.started = true;
        if (this.helped) UI.toast(UI.t("retryHelp"), 2600);
      }, steps.length * ms);
    }

    // ---------------- Khách ----------------
    dishWeight(r) {
      const d = this.dayCfg;
      let w = (d.unlock || []).includes(r.id) ? CONFIG.gameplay.newDishWeight : 1;
      if (d.drinkWeight && r.zone === "nuoc") w *= d.drinkWeight;
      if (d.grillWeight && r.zone === "nuong") w *= d.grillWeight;
      if (d.focus === r.id) w *= d.focusWeight || 1;
      if (d.cheWeight && r.zone === "che") w *= d.cheWeight;
      if (r.custom) w *= CONFIG.customDish.weight;
      return w;
    }

    makeRequests(dishId) {
      const G = CONFIG.gameplay;
      if (this.dayNum < G.specialRequestFromDay) return [];
      const byDay = (map) => {
        let v = 0;
        Object.keys(map).map(Number).sort((a, b) => a - b).forEach((k) => { if (this.dayNum >= k) v = map[k]; });
        return v;
      };
      if (Math.random() >= byDay(G.specialRequestRate) * (BT.assist("fewerRequests") ? CONFIG.assist.requestFactor : 1)) return [];
      const n = UI.randInt(1, byDay(G.specialRequestMax));
      const req = BT.Tray.requirements({ id: dishId, reqs: [] });
      const r = req.r;
      const unlocked = (id) => UI.ing(id).openDay <= this.dayNum;
      const options = CONFIG.specialRequests.filter((q) => {
        if (q.zone && q.zone !== r.zone) return false;
        const inLayers = !!(req.layers && req.layers.includes(q.ing));
        if (q.type === "remove") return req.need[q.ing] !== undefined || req.finishIngs.includes(q.ing) || (inLayers && req.layers.length > 1);
        if (q.type === "double") return req.need[q.ing] !== undefined || inLayers;
        if (q.type === "crispy") return r.zone === "nuong";
        if (q.type === "spicy") return (r.zone === "tron" && unlocked("sa_te")) || (r.zone === "nuong" && unlocked("tuong_ot"));
        return false;
      });
      const out = [];
      const used = new Set();
      for (let i = 0; i < n && options.length; i++) {
        const q = options.splice(Math.floor(Math.random() * options.length), 1)[0];
        if (q.ing && used.has(q.ing)) continue;
        if (q.ing) used.add(q.ing);
        out.push({ id: q.id, type: q.type, ing: q.ing, n: q.type === "spicy" ? UI.randInt(1, G.spicyMax) : undefined });
      }
      return out;
    }

    makeOrder() {
      const G = CONFIG.gameplay;
      const r = UI.weighted(this.dishPool, (x) => this.dishWeight(x));
      if (r.combo) return { items: r.combo.map((id) => ({ id, reqs: [] })), combo: true };
      const items = [{ id: r.id, reqs: this.makeRequests(r.id) }];
      if (this.dayNum >= G.twoDishFromDay && r.zone !== "nuoc" && Math.random() < G.twoDishRate * (BT.assist("fewerRequests") ? CONFIG.assist.requestFactor : 1)) {
        const drinks = this.dishPool.filter((x) => x.zone === "nuoc");
        if (drinks.length) {
          const dr = UI.weighted(drinks, (x) => this.dishWeight(x));
          items.push({ id: dr.id, reqs: this.makeRequests(dr.id) });
        }
      }
      return { items, combo: false };
    }

    spawnNext(seat) {
      const G = CONFIG.gameplay;
      const d = this.dayCfg;
      if (this.endless) {
        // Chỉ gọi món còn làm được (còn hàng hoặc đủ tiền nhập); hết món làm được → kết thúc ca
        this.dishPool = this.dishPoolAll.filter((r) => this.canMake(r));
        if (!this.dishPool.length) {
          this.dishPool = this.dishPoolAll;
          // Anh Hiếu chờ vô hạn → không tính là còn khách: chỉ còn anh (hoặc mèo) thì kết thúc ca
          if (!this.customers.some((c) => !c.isCat && c.typeId !== "tomortle")) this.finish(false); else this.spawnTimer = 1;
          return;
        }
        if (this.spawned > 0 && this.spawned % CONFIG.endless.eventEvery === 0 && this.lastEventAt !== this.spawned) { this.lastEventAt = this.spawned; this.switchEvent(); }
      }
      // Mèo hoang hiếm (không tính vào số khách của ngày)
      const cat = CONFIG.customerTypes.meo_hoang;
      if (!this.secret && this.groupPending === 0 && this.dayNum >= cat.openDay && this.catsToday < G.catMaxPerDay && Math.random() < cat.rareRate) {
        this.catsToday++;
        this.spawn(seat, "meo_hoang", { items: [] });
        this.spawnTimer = this.nextGap();
        return;
      }
      // Học sinh tan trường: giữa ca có nhóm học sinh đến cùng lúc
      if (d.groupOf && !this.groupDone && this.spawned >= Math.floor(this.total / 2)) {
        this.groupDone = true;
        this.groupPending = Math.min(d.groupOf, this.total - this.spawned);
        UI.toast(UI.t("groupArrive"));
      }
      const left = this.total - this.spawned;
      let special = this.groupPending > 0 ? null : this.plan[this.spawned];
      // Anh Hiếu chưa ghé mà chỉ còn vài khách cuối → ép anh tới ở lượt này
      if (!special && this.groupPending === 0 && this.tomoCame < this.tomoWanted && left <= G.tomortleForceWhenLeft) special = { kind: "tomortle" };
      if (this.endless && !special && !this.helperOn && this.dayNum >= G.tomortleFromDay && this.spawned > 0 && this.spawned % CONFIG.endless.tomoEvery === 0 && this.dishPool.some((r) => r.zone !== "nuoc" && !r.combo)) special = { kind: "tomortle" };
      if (special && special.kind === "tomortle" && this.tomoCame >= this.tomoWanted) special = null;
      // Khách đặc biệt hiếm
      const V = CONFIG.vipGuests;
      if (!special && !this.vipCame && !this.secret && !this.endless && this.groupPending === 0 && this.dayNum >= V.fromLevel && Math.random() < V.rate) {
        const month = new Date().getMonth() + 1;
        const pool = V.list.filter((v) => !v.months || v.months.includes(month));
        if (pool.length) {
          const v = UI.pick(pool);
          this.vipCame = true;
          const o = this.makeOrder();
          if (v.twoDish && o.items.length < 2) o.items.push(this.makeOrder().items[0]);
          const c = this.spawn(seat, "hoc_sinh", o, { typeDef: Object.assign({ kind: "vip" }, v), tag: v.name, speech: UI.pick(v.lines) });
          c.vip = v;
          this.spawned++;
          this.spawnTimer = this.nextGap();
          return;
        }
      }
      if (special && special.kind === "tomortle") this.spawnTomortle(seat);
      else if (special && special.kind === "regular") this.spawnRegular(seat, special);
      else if (this.secret || (this.groupPending === 0 && this.dayNum >= G.friendFromDay && Math.random() < G.friendWeight * (this.dayCfg.friendMult || 1) / (this.typePool.length + G.friendWeight * (this.dayCfg.friendMult || 1)))) this.spawnFriend(seat);
      else {
        let typeId = UI.pick(this.typePool);
        if (this.groupPending > 0) { typeId = "hoc_sinh"; this.groupPending--; }
        const order = this.makeOrder();
        order.reviewer = this.spawned === this.reviewerAt;
        // Đang mùa lễ: thỉnh thoảng khách khen trang trí tiệm
        const extra = BT.Fun.inSeasonSkin() && Math.random() < 0.15 ? { speech: UI.pick(CONFIG.texts.seasonCompliments) } : undefined;
        this.spawn(seat, typeId, order, extra);
      }
      this.spawned++;
      if (this.spawned === this.spillAt) this.showSpill();
      this.spawnTimer = this.groupPending > 0 ? G.groupSpawnGapSec : this.nextGap();
    }

    // ---------------- Trợ giúp ----------------
    // Khay có khớp món này không (chưa thừa nguyên liệu nào)
    fitsDish(t, it) {
      const req = BT.Tray.requirements(it);
      if (!t || t.isEmpty()) return true;
      if (t.base !== req.r.base) return false;
      if (req.r.zone === "che") return t.layers.every((id, i) => req.layers[i] === id);
      return Object.keys(t.items).every((id) => t.items[id] <= (req.need[id] || 0));
    }

    // Các nguyên liệu còn phải chạm cho món it trên khay t (theo đúng thứ tự)
    hintSteps(t, it) {
      const req = BT.Tray.requirements(it);
      const r = req.r;
      const out = [];
      const empty = !t || t.isEmpty();
      if (empty) out.push(r.base);
      if (req.pour && (empty || !t.poured)) out.push(req.pour);
      if (r.zone === "che") out.push(...req.layers.slice(empty ? 0 : t.layers.length));
      else {
        const ids = Object.keys(req.need).sort((a, b) => (a === "trung_cut" ? -1 : b === "trung_cut" ? 1 : 0));
        ids.forEach((id) => { const n = req.need[id] - (empty ? 0 : t.items[id] || 0); for (let k = 0; k < n; k++) out.push(id); });
      }
      req.finishIngs.forEach((id) => { if (empty || !t.finish.includes(id)) out.push(id); });
      Object.keys(req.sauces).forEach((id) => { const n = req.sauces[id] - (empty ? 0 : t.sauces[id] || 0); for (let k = 0; k < n; k++) out.push(id); });
      return out;
    }

    renderHints() {
      if (!this.hintRow) return;
      if (!BT.assist("easyHints") || this.tut || this.over) { if (this.hintKey) { this.hintRow.innerHTML = ""; this.hintKey = ""; } return; }
      const waiting = this.customers.filter((c) => c.state === "waiting" && !c.isCat).sort((a, b) => a.pct() - b.pct());
      const sel = this.selected && !this.selected.isEmpty() ? this.selected : null;
      let target = null;
      for (const c of waiting) {
        for (const it of c.pending()) {
          const r = UI.recipe(it.id);
          if (r.combo) continue;
          if (sel ? this.fitsDish(sel, it) : r.zone === this.zone) { target = it; break; }
        }
        if (target) break;
      }
      if (!target && !sel) for (const c of waiting) { const it = c.pending().find((x) => !UI.recipe(x.id).combo); if (it) { target = it; break; } }
      const steps = target ? this.hintSteps(sel, target).slice(0, 6) : [];
      const key = steps.join(",") + "|" + (target ? target.id : "");
      if (key === this.hintKey) return;
      this.hintKey = key;
      this.hintRow.innerHTML = "";
      steps.forEach((id) => {
        const ing = UI.ing(id);
        const hold = CONFIG.gameplay.holdSec[id] !== undefined && !BT.assist("tapPour");
        const b = UI.button(ing.emoji + " " + ing.short, "btn-white small", () => {
          if (hold) { UI.toast(UI.t("hintHold", { name: ing.name })); return; }
          const zone = UI.recipe(target.id).zone;
          if (zone !== this.zone && !(ing.zones || []).includes(this.zone)) this.setZone(zone);
          this.onStationTap(id, this.grid.cells && this.grid.cells[id]);
        });
        if (hold) b.dataset.hold = id; else b.dataset.ing = id;
        this.hintRow.appendChild(b);
      });
    }

    // Khay đã làm xong (lắc/cuốn/gấp/có lớp phủ) mà chỉ thiếu 1–2 phần của một món đang chờ
    lateAddOk(t, ingId) {
      if (!this.S.settings.lateAdd || !t || t.isEmpty()) return false;
      const done = t.tied || t.rolled || t.folded || (t.zone === "che" && t.finish.length > 0);
      if (!done) return false;
      for (const c of this.customers) {
        if (c.state !== "waiting" || c.isCat) continue;
        for (const it of c.pending()) {
          const req = BT.Tray.requirements(it);
          if (req.r.base !== t.base || !this.fitsDish(t, it)) continue;
          if (t.zone === "che") {
            const miss = req.layers.length - t.layers.length;
            if (miss >= 1 && miss <= 2 && req.layers[t.layers.length] === ingId) return true;
          } else {
            const miss = Object.keys(req.need).reduce((s, id) => s + Math.max(0, req.need[id] - (t.items[id] || 0)), 0);
            if (miss >= 1 && miss <= 2 && (req.need[ingId] || 0) > (t.items[ingId] || 0)) return true;
          }
        }
      }
      return false;
    }

    // ---------------- Giờ cao điểm ----------------
    rushOn() {
      if (this.rush || this.over) return;
      this.rush = { left: CONFIG.rush.sec };
      this.rush.el = UI.el("div", "rush");
      this.el.appendChild(this.rush.el);
      UI.setText(this.rush.el, UI.t("rushBanner", { s: Math.ceil(this.rush.left) }));
      UI.toast(UI.t("rushStart"), 2400);
      BT.Audio.play("win");
      this.spawnTimer = Math.min(this.spawnTimer, 0.5);
    }

    tickRush(dt) {
      if (!this.rush) return;
      this.rush.left -= dt;
      if (this.rush.left <= 0) {
        this.rush.el.remove();
        this.rush = null;
        this.rushDone = true;
        this.S.life.rushes++;
        UI.toast(UI.t("rushEnd"), 2000);
        return;
      }
      UI.setText(this.rush.el, UI.t("rushBanner", { s: Math.ceil(this.rush.left) }));
    }

    // ---------------- Thú cưng có việc làm ----------------
    petsTick(dt) {
      const J = CONFIG.petJobs;
      const pets = this.S.pets || [];
      if (this.secret || this.tut) return;
      // Miu: khách đầu tiên sắp bỏ đi được dụi chân, hồi kiên nhẫn
      if (pets.includes("miu") && !this.petUsed.miu) {
        const c = this.customers.find((x) => x.state === "waiting" && !x.isCat && x.max !== Infinity && x.patience / x.max < J.miuAt);
        if (c) {
          this.petUsed.miu = true;
          c.patience = Math.min(c.max, c.patience + c.max * J.miuRefill);
          UI.toast(UI.fmt(UI.t("petMiu")), 2400);
        }
      }
      // Cún Bông: tiệm vắng lâu thì kéo khách vào
      if (pets.includes("cun_bong") && !this.petUsed.cun && this.total !== Infinity && this.spawned < this.total) {
        const empty = this.customers.every((x) => x.isCat || x.state === "leaving" || x.state === "gone");
        this.emptyFor = empty ? this.emptyFor + dt : 0;
        if (this.emptyFor >= J.cunEmptySec && this.spawnTimer > 1) {
          this.petUsed.cun = true;
          this.spawnTimer = 0;
          UI.toast(UI.t("petCun"), 2200);
        }
      }
    }

    // Hạt Dẻ nhặt được tiền rơi dưới quầy sau ca
    hamsterCoins() {
      const J = CONFIG.petJobs;
      if (this.secret || !(this.S.pets || []).includes("hamster") || Math.random() >= J.hamsterRate) return 0;
      const x = UI.randInt(J.hamsterCoins[0], J.hamsterCoins[1]);
      this.S.wallet += x;
      return x;
    }

    // ---------------- Kỷ lục ----------------
    checkRecord() {
      if (!this.recordIncome || this.recordBroken) return;
      if (this.income() > this.recordIncome) {
        this.recordBroken = true;
        UI.toast(UI.t("recordBroken"), 2200);
        BT.Audio.play("star");
      }
    }

    // ---------------- Xe chè đối thủ ----------------
    rivalOn() {
      if (this.rival || this.over) return;
      this.rival = { streak: 0 };
      const el = UI.el("div", "rival");
      this.rival.el = el;
      this.el.appendChild(el);
      this.rivalBanner();
      UI.toast(UI.fmt(UI.pick(window.PERSONAL.rivalLines || [""])), 2600);
      this.scope.timeout(() => { if (this.rival) UI.toast(UI.t("rivalArrive", { n: CONFIG.rival.beatStreak }), 2600); }, 2700);
    }

    rivalBanner() {
      if (this.rival) UI.setText(this.rival.el, UI.t("rivalBanner", { n: Math.max(0, CONFIG.rival.beatStreak - this.rival.streak) }));
    }

    rivalOff(won) {
      if (!this.rival) return;
      this.rival.el.remove();
      this.rival = null;
      this.rivalDone = true;
      if (won) {
        const x = CONFIG.rival.beatReward;
        this.S.wallet += x;
        UI.toast(UI.t("rivalWin", { x: UI.money(x) }), 2600);
        BT.Audio.play("win");
      }
    }

    nextGap() {
      const sp = this.endless ? BT.Endless.spawnRange(this.stats.served, this.run.cfg.spawn) : this.dayCfg.spawn;
      const f = (BT.assist("slowCustomers") ? CONFIG.assist.slowFactor : 1) * (this.rush ? CONFIG.rush.spawnFactor : 1);
      return UI.rand(sp[0], sp[1]) * f;
    }

    // Ca vô tận: món làm được khi mọi nguyên liệu còn hàng hoặc đủ tiền nhập
    canMake(r) {
      if (r.combo) {
        const all = [];
        r.combo.forEach((id) => { const x = UI.recipe(id); all.push(x.base, ...(x.toppings || []), ...(x.finish || []).map((f) => String(f).replace(/^rot:/, ""))); });
        const miss = [...new Set(all.filter((id) => id && CONFIG.ingredients[id] && BT.Save.stock(id) <= 0))];
        return miss.reduce((sum, id) => sum + UI.ing(id).price, 0) <= this.S.wallet;
      }
      const ids = [r.base].concat(r.toppings || [], (r.finish || []).map((f) => String(f).replace(/^rot:/, "")))
        .filter((id) => id && CONFIG.ingredients[id]);
      const missing = [...new Set(ids)].filter((id) => BT.Save.stock(id) <= 0);
      return missing.reduce((sum, id) => sum + UI.ing(id).price, 0) <= this.S.wallet;
    }

    // Ca vô tận: đổi biến cố
    switchEvent() {
      const d = this.dayCfg;
      const ev = BT.MS.pickEvent(this.dayNum, d.weather);
      ["tipMult", "drinkWeight", "ratingWeight", "grillWeight", "groupOf"].forEach((k) => { delete d[k]; });
      d.tipMult = 1;
      const E = CONFIG.shiftEvents[ev] || {};
      Object.keys(E).forEach((k) => { if (k !== "w" && k !== "fromLevel") d[k] = E[k]; });
      if (this.el) { this.el.classList.remove("weather-" + d.weather); this.el.classList.add("weather-" + ev); }
      d.weather = ev;
      const w = CONFIG.weathers[ev];
      UI.toast(UI.t("endlessEvent", { icon: w.icon, label: w.label }));
    }

    // Ca vô tận: hết hàng thì tự nhập một gói giá thường
    autoRestock(ingId) {
      const ing = UI.ing(ingId);
      if (this.S.wallet < ing.price) return false;
      this.S.wallet -= ing.price;
      this.S.inventory[ingId] = BT.Save.stock(ingId) + CONFIG.money.buyPackQty;
      this.stats.expense += ing.price;
      this.S.today.expense = this.stats.expense;
      if (this.grid) this.grid.refresh();
      return true;
    }

    // Hiếu (Tomortle): 1 món bánh tráng + 1 ly nước, kiên nhẫn vô hạn
    spawnTomortle(seat) {
      this.tomoCame++;
      let foods = this.dishPool.filter((r) => r.zone !== "nuoc" && !r.combo);
      if (!foods.length) foods = this.dishPool.filter((r) => !r.combo);
      const drinks = this.dishPool.filter((r) => r.zone === "nuoc");
      const items = [{ id: UI.pick(foods).id, reqs: [] }];
      if (drinks.length) items.push({ id: UI.pick(drinks).id, reqs: [] });
      const P = window.PERSONAL;
      const vars = { dish: UI.recipe(items[0].id).name.toLowerCase(), drink: items[1] ? UI.recipe(items[1].id).name.toLowerCase() : "" };
      const lines = items[1] ? P.anhLines : P.anhLines.filter((l) => l.indexOf("{drink}") < 0);
      const speech = UI.fmt(this.tomoCame === 1 && items[1] ? P.anhOrderTemplate : UI.pick(lines.length ? lines : P.anhLines), vars);
      return this.spawn(seat, "tomortle", { items }, { speech, tag: UI.t("tomoTag") });
    }

    spawnFriend(seat) {
      const onScreen = this.customers.map((c) => c.tag);
      const names = window.PERSONAL.friends.filter((n) => !onScreen.includes(n));
      const name = UI.pick(names.length ? names : window.PERSONAL.friends);
      return this.spawn(seat, "ban_be", this.makeOrder(), { tag: name });
    }

    spawnRegular(seat, plan) {
      const G = CONFIG.gameplay;
      const def = CONFIG.regulars[plan.id];
      const loyal = (this.S.regularCustomers[plan.id] || 0) >= BT.MS.chaptersAt(plan.id, this.dayNum);
      const typeDef = {
        name: def.name, avatar: def.avatar, doodle: def.doodle, accessory: def.accessory, patience: def.patience,
        tip: loyal ? def.tip.map((x) => x * G.regularLoyalTipMult) : def.tip,
        self: def.self, call: def.call, lines: [UI.t("regularOrder")], enterSec: CONFIG.gameplay.customerEnterSec, kind: "regular"
      };
      let dish = this.dishPool.some((r) => r.id === def.dish) ? def.dish : this.makeOrder().items[0].id;
      // Khách quen thích thử món sáng tạo của tiệm
      const customs = this.dishPool.filter((r) => r.custom);
      if (customs.length && Math.random() < CONFIG.customDish.regularChance) dish = UI.pick(customs).id;
      return this.spawn(seat, null, { items: [{ id: dish, reqs: this.makeRequests(dish) }] },
        { typeDef, tag: def.name.split(" ").slice(0, 2).join(" "), loyal, regularId: plan.id, chapter: plan.chapter });
    }

    spawn(seat, typeId, order, extra) {
      extra = extra || {};
      const c = new BT.Customer({
        typeId,
        typeDef: extra.typeDef,
        tag: extra.tag,
        speech: extra.speech,
        loyal: extra.loyal,
        regularId: extra.regularId,
        items: order.items,
        combo: order.combo,
        reviewer: order.reviewer,
        seat,
        centerPct: CONFIG.gameplay.seatCenters[this.seatCount][seat],
        patienceMult: this.patienceMult,
        area: this.custArea,
        scope: this.scope,
        onWalkout: (cc) => this.onWalkout(cc),
        onGone: (cc) => this.onGone(cc)
      });
      c.chapter = extra.chapter;
      this.seats[seat] = c;
      this.customers.push(c);
      c.el.addEventListener("click", () => this.onCustomerTap(c));
      c.enter();
      this.updateTabDots();
      this.updateHud();
      return c;
    }

    onWalkout(c) {
      const G = CONFIG.gameplay;
      c.state = "leaving";
      if (c.isCat) {
        c.react(UI.t("catLeave"));
        c.leave(G.angryLeaveDelaySec);
        return;
      }
      c.react(UI.t("angry"), "😠");
      this.stats.walkouts++;
      if (this.rival) { this.rival.streak = 0; this.rivalBanner(); }
      this.addRating(G.ratingWalkout, c);
      this.done++;
      this.combo = 0;
      if (!this.dayCfg.cannotLose) this.hearts = Math.max(0, this.hearts - 1);
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

    addRating(stars, c) {
      const weight = c && c.reviewer ? this.dayCfg.ratingWeight || 1 : 1;
      this.stats.ratings.push(stars);
      this.stats.weights.push(weight);
      if (c) BT.Progress.addReview({ day: this.run.mode === "story" || this.run.mode === "replay" ? this.run.ms : UI.runTitle(this.run), name: c.tag || c.type.name, avatar: c.avatar, doodle: c.doodle, stars, weight });
      if (stars === 5) this.q.five++;
    }

    avgRating() {
      const r = this.stats.ratings;
      if (!r.length) return 0;
      let s = 0;
      let w = 0;
      r.forEach((x, i) => { s += x * this.stats.weights[i]; w += this.stats.weights[i]; });
      return s / w;
    }

    onCustomerTap(c) {
      if (this.isPaused()) return;
      if (c.isCat) { this.feedCat(c); return; }
      if (!this.selected) { UI.toast(UI.t("pickTrayFirst")); return; }
      this.deliver(c, this.selected);
    }

    feedCat(c) {
      if (c.state !== "waiting") return;
      if (!this.eggInHand) { UI.toast(UI.t("catLine")); return; }
      this.eggInHand = false;
      c.state = "served";
      c.el.classList.add("happy");
      c.react("😻💕");
      this.hearts++;
      UI.toast(UI.t("catFed"));
      BT.Audio.play("star");
      c.leave(CONFIG.gameplay.happyLeaveDelaySec);
      this.updateHud();
    }

    deliver(c, tray) {
      const G = CONFIG.gameplay;
      if (c.state === "entering") { UI.toast(UI.t("notArrived")); return; }
      if (c.state !== "waiting" || c.isCat) return;
      if (tray.isEmpty()) { UI.toast(UI.t("trayIsEmpty")); return; }

      const pending = c.pending();
      let match = null;
      let res = null;
      for (const it of pending) {
        const r = BT.Tray.evaluate(tray, it);
        if (r.ok) { match = it; res = r; break; }
      }
      if (!match) {
        // Lấy lý do từ món cùng khu với khay (nếu có)
        const same = pending.find((it) => UI.recipe(it.id).zone === tray.zone) || pending[0];
        const bad = BT.Tray.evaluate(tray, same);
        const vars = c.vars({ ing: bad.ing ? UI.ing(bad.ing).short : "" });
        const key = {
          notOrdered: "wrongNotOrdered", missing: "wrongMissing", extra: "wrongExtra", notMixed: "wrongNotMixed",
          notRolled: "wrongNotRolled", notCooked: "wrongNotCooked", burnt: "wrongBurnt", notCrispy: "wrongNotCrispy",
          order: "wrongOrder"
        }[bad.reason];
        if (bad.reason === "order") UI.toast(UI.t("badOrder", { ing: UI.ing(bad.ing).name }));
        c.react(UI.t(key, vars), "😕", G.reactionShowSec);
        c.penalize(G.wrongPatiencePenalty);
        c.wrongOnce = true;
        this.combo = 0;
        UI.shake(tray.el);
        UI.shake(c.bubble);
        BT.Audio.play("wrong");
        this.updateHud();
        return;
      }

      // Đúng một món
      match.crispy = res.crispy;
      c.markDone(match);
      this.combo = Math.min(G.comboMax, this.combo + 1);
      this.q.comboMax = Math.max(this.q.comboMax, this.combo);
      if (res.crispy) this.q.crispy++;
      if (match.id === window.PERSONAL.favoriteDish) this.q.fav++;
      if (this.dayNum >= G.loveOpenDay) this.love = Math.min(1, this.love + G.loveChargePerDish);
      tray.clear();
      tray.render();
      this.select(null);
      BT.Audio.vibrate(G.vibrateGood);

      if (c.pending().length > 0) {
        c.react(UI.t("partialOk"), "😋", G.reactionShowSec);
        BT.Audio.play("add");
        const p = UI.center(c.el);
        UI.floatText(p.x, p.y - 30, "✓", "stars");
      } else {
        this.complete(c);
      }
      this.updateLove();
      this.updateHud();
      this.updateTabDots();
      this.updateHint();
    }

    // Khách nhận đủ món: tính tiền, đánh giá
    complete(c) {
      const G = CONFIG.gameplay;
      if (c.vip && !c.vipPaid) {
        c.vipPaid = true;
        const v = c.vip;
        this.S.wallet += v.reward;
        this.S.life.vips++;
        UI.toast(UI.t("vipServed", { name: v.name, x: UI.money(v.reward) }), 2600);
        if (v.boostNext) { this.S.bonusNext = (this.S.bonusNext || 0) + v.boostNext; this.scope.timeout(() => UI.toast(UI.t("vipBoost", { name: v.name }), 2600), 2700); }
      }
      if (this.rival) {
        this.rival.streak++;
        if (this.rival.streak >= CONFIG.rival.beatStreak) this.rivalOff(true);
        else this.rivalBanner();
      }
      const M = CONFIG.money;
      const up = this.S.upgrades;
      const p = c.pct();
      const speed = p > G.patienceHigh ? G.speedFactor.fast : p >= G.patienceLow ? G.speedFactor.normal : G.speedFactor.slow;
      let base = 0;
      if (c.combo) base = UI.recipe("combo_tinh_yeu").price;
      else c.items.forEach((it) => { base += UI.recipePrice(it.id) * (it.crispy ? 1 + G.crispyBonus : 1); });
      c.items.forEach((it) => { if (UI.recipe(it.id) && UI.recipe(it.id).custom) this.S.life.customsSold++; });
      const pay = Math.round(base * speed);
      let tip = UI.randInt(c.type.tip[0], c.type.tip[1]) * (this.dayCfg.tipMult || 1) * (this.rush ? CONFIG.rush.tipMult : 1);
      if (up.nhac > 0) tip *= 1 + CONFIG.upgrades.nhac.tipBonus;
      const reqTip = c.hasRequests() ? M.specialRequestTip : 0;
      tip = Math.round(tip + reqTip);
      const comboBonus = Math.round(pay * G.comboStepBonus * Math.max(0, this.combo - 1));
      const fiveMin = G.ratingSteps[0].min - (up.quat > 0 ? CONFIG.upgrades.quat.fiveStarDrop : 0);
      let stars = p >= fiveMin ? 5 : G.ratingSteps.find((s) => p >= s.min).stars;
      if (c.wrongOnce) stars = Math.min(stars, G.ratingAfterWrongMax);

      this.stats.revenue += pay + comboBonus;
      this.stats.tips += tip;
      this.stats.served++;
      this.q.served++;
      if (reqTip) this.q.req += c.items.filter((it) => it.reqs.length).length;
      if (c.isTomortle) this.q.tomo++;
      this.addRating(stars, c);
      this.S.wallet += pay + comboBonus + tip;
      this.done++;

      c.state = "served";
      c.el.classList.add("happy");
      let line = p > G.patienceHigh ? UI.t("fast") : UI.t("praise");
      if (reqTip) line = UI.t("requestPraise", c.vars());
      if (c.isTomortle) line = UI.t("tomoThanks");
      c.react(line, c.isTomortle ? "🥰" : "😍");
      const from = UI.center(c.el);
      UI.floatText(from.x, from.y - 30, "+" + UI.money(pay + comboBonus + tip), "money");
      UI.floatText(from.x, from.y - 60, "⭐".repeat(stars), "stars");
      UI.fly(from, UI.center(this.hudMoney), "🪙", 0.6);
      BT.Audio.play("coin");
      c.leave(G.happyLeaveDelaySec);
      if (c.isTomortle) {
        UI.heartBurst(G.tomortleHearts, G.tomortleHeartsSec);
        BT.Audio.play("heart");
        this.storyPending = (this.storyPending || 0) + 1;
        this.scope.timeout(() => { this.storyPending--; this.tomortleStory(); }, G.tomortleHeartsSec * 700);
      } else if (c.regularId && c.chapter >= 0) {
        this.storyPending = (this.storyPending || 0) + 1;
        this.scope.timeout(() => { this.storyPending--; this.regularStory(c.regularId, c.chapter); }, 600);
      }
    }

    // ---------------- Hướng dẫn tương tác (Ngày 1, 2, 4, 7) ----------------
    tickTutorial() {
      if (this.tut) { this.stepTutorial(); return; }
      const T = this.run.scripted && this.run.mode === "story" ? CONFIG.tutorials[this.run.cfg.day] : null;
      if (!T || this.tutDone || this.S.tutorialDone[T.key]) return;
      const c = this.customers.find((x) => x.state === "waiting" && !x.isCat && x.pending().some((it) => UI.recipe(it.id).zone === T.zone));
      if (c) this.startTutorial(T, c);
    }

    startTutorial(T, c) {
      const item = c.pending().find((it) => UI.recipe(it.id).zone === T.zone);
      const r = UI.recipe(item.id);
      const req = BT.Tray.requirements(item);
      const tt = CONFIG.texts.tut;
      const cell = (id) => () => this.grid.cells && this.grid.cells[id];
      const tray = () => this.tutTray();
      const toppingsOk = () => {
        const t = tray();
        return !!t && Object.keys(req.need).every((id) => (t.items[id] || 0) >= req.need[id]);
      };
      const onZone = { id: "tab", text: UI.fmt(tt["tab" + T.zone.charAt(0).toUpperCase() + T.zone.slice(1)] || ""), target: () => this.tabEls[T.zone], hand: "tap", done: () => this.zone === T.zone };
      const base = { id: "base", text: UI.fmt(tt.base, { name: UI.ing(r.base).emoji + " " + UI.ing(r.base).name }), target: cell(r.base), hand: "tap", done: () => !!tray() };
      const deliver = { id: "deliver", text: UI.fmt(tt.deliver), target: () => (tray() || {}).el, hand: "drag", done: () => item.done || c.state !== "waiting" };
      const steps = [];
      if (T.zone === "tron") {
        steps.push({ id: "bubble", text: UI.fmt(tt.bubble), target: () => c.bubble, info: true });
        steps.push(base, { id: "toppings", text: UI.fmt(tt.toppings), target: () => this.grid.el, hand: "tap", done: toppingsOk });
        if (req.finishIngs.includes("tac")) steps.push({ id: "tac", text: UI.fmt(tt.tac), target: cell("tac"), hand: "tap", done: () => tray() && tray().finish.includes("tac") });
        steps.push({ id: "shakeBtn", text: UI.fmt(tt.shakeBtn), target: () => tray() && tray().el.querySelector("[data-action]"), hand: "tap", done: () => !!this.shakeLayer || (tray() && tray().tied) });
        steps.push({ id: "shakeZone", text: UI.fmt(tt.shakeZone), target: () => this.shakeLayer && this.shakeLayer.querySelector(".shake-zone"), hand: "swipe-x", done: () => tray() && tray().tied && !this.shakeLayer });
      } else if (T.zone === "nuoc") {
        steps.push(onZone, base);
        steps.push({ id: "pour", text: UI.fmt(tt.pour), target: cell(req.pour), hand: "hold", done: () => tray() && !!tray().poured });
        steps.push({ id: "ice", text: UI.fmt(tt.ice), target: cell(req.finishIngs.includes("da") ? "da" : Object.keys(req.need)[0] || "da"), hand: "tap",
          done: () => tray() && toppingsOk() && req.finishIngs.every((id) => tray().finish.includes(id)) });
      } else if (T.zone === "nuong") {
        const sauce = Object.keys(req.sauces)[0] || "mayo";
        steps.push(onZone, base);
        steps.push({ id: "egg", text: UI.fmt(tt.egg), target: cell("trung_cut"), hand: "tap", done: () => tray() && !!tray().items.trung_cut });
        steps.push({ id: "crack", text: UI.fmt(tt.crack), target: () => (tray() || {}).el, hand: "hold", done: () => tray() && tray().cracked });
        steps.push({ id: "grillTop", text: UI.fmt(tt.grillTop), target: () => this.grid.el, hand: "tap", done: () => toppingsOk() || (tray() && tray().folded) });
        steps.push({ id: "fold", text: UI.fmt(tt.fold), target: () => (tray() || {}).el, hand: "tap", done: () => tray() && (tray().folded || tray().burnt) });
        steps.push({ id: "sauce", text: UI.fmt(tt.sauce), target: cell(sauce), hand: "tap", done: () => tray() && Object.keys(req.sauces).every((id) => (tray().sauces[id] || 0) >= req.sauces[id]) });
      } else if (T.zone === "che") {
        steps.push(onZone, base);
        req.layers.forEach((id, i) => steps.push({ id: "layer" + i, text: UI.fmt(tt.layer, { n: i + 1, name: UI.ing(id).emoji + " " + UI.ing(id).name }), target: cell(id), hand: "tap",
          done: () => tray() && tray().layers.length > i }));
        req.finishIngs.forEach((id) => steps.push({ id: "top" + id, text: UI.fmt(tt.cheTop, { name: UI.ing(id).emoji + " " + UI.ing(id).name }), target: cell(id), hand: "tap",
          done: () => tray() && tray().finish.includes(id) }));
      } else if (T.zone === "cuon") {
        steps.push(onZone, base, { id: "toppings", text: UI.fmt(tt.toppings), target: () => this.grid.el, hand: "tap", done: toppingsOk });
        steps.push({ id: "rollBtn", text: UI.fmt(tt.rollBtn), target: () => tray() && tray().el.querySelector("[data-action]"), hand: "tap", done: () => !!this.shakeLayer || (tray() && tray().rolled) });
        steps.push({ id: "rollZone", text: UI.fmt(tt.rollZone), target: () => this.shakeLayer && this.shakeLayer.querySelector(".shake-zone"), hand: "swipe-up", done: () => tray() && tray().rolled && !this.shakeLayer });
        steps.push({ id: "dip", text: UI.fmt(tt.dip), target: cell("nuoc_cham"), hand: "tap", done: () => tray() && tray().finish.includes("nuoc_cham") });
      }
      steps.push(deliver);
      this.tut = { T, c, item, zone: T.zone, base: r.base, steps, i: -1 };
      this.showTutStep(0);
    }

    // Khay/vỉ đang dùng cho hướng dẫn
    tutTray() {
      const t = this.tut;
      if (!t) return null;
      if (t.tray && !t.tray.isEmpty() && t.tray.base === t.base) return t.tray;
      const pool = t.zone === "nuong" ? this.grills : this.trays;
      const sel = this.selected && pool.includes(this.selected) && this.selected.base === t.base ? this.selected : null;
      t.tray = sel || pool.find((x) => x.base === t.base) || null;
      return t.tray;
    }

    showTutStep(i) {
      const t = this.tut;
      t.i = i;
      const st = t.steps[i];
      UI.coach.show({
        text: st.text,
        target: st.target,
        hand: st.hand,
        onNext: st.info ? () => this.showTutStep(i + 1) : null,
        onSkip: () => this.endTutorial(true)
      });
    }

    stepTutorial() {
      const t = this.tut;
      if (!t || t.ending) return;
      if (t.c.state !== "waiting" && !t.item.done) { this.endTutorial(true); return; }
      const st = t.steps[t.i];
      if (st && !st.info && st.done()) {
        // nhảy qua các bước đã xong sẵn
        let j = t.i + 1;
        while (j < t.steps.length && !t.steps[j].info && t.steps[j].done()) j++;
        if (j >= t.steps.length) this.endTutorial(false);
        else this.showTutStep(j);
      }
    }

    endTutorial(skipped) {
      const t = this.tut;
      if (!t) return;
      this.S.tutorialDone[t.T.key] = true;
      this.tutDone = true;
      BT.Save.persist();
      if (skipped) { UI.coach.hide(); this.tut = null; return; }
      t.ending = true;
      UI.coach.show({ text: UI.t("tutDone"), target: null, hand: null });
      BT.Audio.play("star");
      this.scope.timeout(() => { UI.coach.hide(); this.tut = null; }, 1800);
    }

    // ---------------- Anh Hiếu ghé thả thính ----------------
    startFlirt() {
      const i = BT.Flirt.take();
      this.flirtDone++;
      if (i < 0) return;
      const G = CONFIG.gameplay;
      const M = CONFIG.money;
      const item = BT.Flirt.list()[i];
      this.flirtIndex = i;
      this.flirtActive = true;
      this.pauseReasons.add("flirt");

      // Anh bước vào đứng trước quầy
      const v = UI.el("div", "flirt-visitor");
      v.appendChild(UI.el("div", "flirt-bubble", UI.t("flirtGreet")));
      v.appendChild(UI.icon("tomortle", "flirt-avatar"));
      v.appendChild(UI.icon("bouquet", "flirt-flower"));
      this.front.appendChild(v);
      void v.offsetWidth;
      v.classList.add("in");
      BT.Audio.play("heart");

      const body = UI.el("div", "flirt");
      const who = UI.el("div", "flirt-who");
      who.appendChild(UI.icon("tomortle", "flirt-who-avatar"));
      who.appendChild(UI.el("div", "flirt-who-greet", UI.t("flirtGreet")));
      body.appendChild(who);
      const lines = UI.el("div", "flirt-lines");
      item.lines.forEach((l) => lines.appendChild(UI.el("div", "flirt-line", l)));
      body.appendChild(lines);
      const input = UI.el("textarea", "flirt-input");
      input.rows = 2;
      input.placeholder = UI.t("flirtPlaceholder");
      // tắt tự viết hoa / tự sửa chữ của bàn phím điện thoại
      ["autocapitalize", "autocomplete", "autocorrect"].forEach((k) => input.setAttribute(k, "off"));
      input.spellcheck = false;
      body.appendChild(input);
      const result = UI.el("div", "flirt-result");
      body.appendChild(result);

      let done = false;
      const finish = (delay) => {
        done = true;
        m.el.querySelectorAll(".modal-buttons .btn").forEach((b) => { b.disabled = true; });
        input.disabled = true;
        this.scope.timeout(() => {
          m.close(true);
          this.pauseReasons.delete("flirt");
          v.classList.add("out");
          this.scope.timeout(() => { v.remove(); this.flirtActive = false; }, 600);
        }, delay);
      };
      const submit = () => {
        if (done) return;
        if (!input.value.trim()) { UI.toast(UI.t("flirtEmpty")); input.focus(); return; }
        if (!BT.Flirt.check(i, input.value)) {
          UI.shake(input);
          UI.toast(UI.t("flirtWrong"));
          BT.Audio.play("wrong");
          return;
        }
        BT.Flirt.mark(i, "self");
        UI.setText(result, UI.t("flirtRight"));
        result.className = "flirt-result right";
        this.applyEffect({ tip: M.flirtRewardTip, heart: M.flirtRewardHearts });
        UI.heartBurst(G.tomortleHearts, G.tomortleHeartsSec);
        BT.Audio.play("win");
        BT.Progress.questAdd("flirt", 1);
        finish(1600);
      };
      const giveUp = () => {
        if (done) return;
        BT.Flirt.mark(i, "told");
        UI.setText(result, UI.t("flirtReveal", { a: item.answers[0] }));
        result.className = "flirt-result reveal";
        this.applyEffect({ tip: M.flirtGiveUpTip });
        BT.Audio.play("letter");
        finish(2600);
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing && e.keyCode !== 229) { e.preventDefault(); submit(); }
      });
      const m = UI.modal({
        title: UI.t("flirtTitle"),
        body,
        className: "modal-flirt",
        buttons: [
          { label: UI.t("flirtSubmit"), cls: "btn-pink flirt-submit", keepOpen: true, onClick: submit },
          { label: UI.t("flirtGiveUp"), cls: "btn-white flirt-giveup", keepOpen: true, onClick: giveUp }
        ]
      });
      this.scope.timeout(() => { try { input.focus({ preventScroll: true }); } catch (e) { /* bỏ qua */ } }, 350);
    }

    // ---------------- Sự cố: nước đổ ----------------
    showSpill() {
      this.spillLeft = CONFIG.incidents.spillTaps;
      this.spillEl.classList.add("show");
      UI.toast(UI.t("spillAppear"), 2400);
      BT.Audio.play("wrong");
    }

    wipeSpill() {
      if (this.spillLeft <= 0 || this.isPaused()) return;
      this.spillLeft--;
      this.spillEl.style.transform = "scale(" + (0.4 + 0.6 * this.spillLeft / CONFIG.incidents.spillTaps) + ")";
      BT.Audio.play("shake");
      if (this.spillLeft <= 0) {
        this.spillEl.classList.remove("show");
        this.spillEl.style.transform = "";
        UI.toast(UI.t("spillClean"));
        BT.Audio.play("star");
      }
    }

    // ---------------- Cốt truyện ----------------
    storyDialog(title, avatar, text, choices) {
      if (this.over) return;
      // đang có popup khác (vd. anh Hiếu thả thính) → đợi rảnh rồi mới hiện, không chồng popup
      if (this.flirtActive || UI.modals.length) {
        this.storyPending = (this.storyPending || 0) + 1;
        this.scope.timeout(() => { this.storyPending--; this.storyDialog(title, avatar, text, choices); }, 300);
        return;
      }
      this.pauseReasons.add("story");
      const body = UI.el("div", "story");
      const av = UI.el("div", "story-avatar");
      [].concat(avatar).forEach((a) => av.appendChild(window.DOODLES && window.DOODLES[a] ? UI.icon(a) : UI.el("span", "", a)));
      body.appendChild(av);
      body.appendChild(UI.el("div", "story-text", text));
      UI.modal({
        title,
        body,
        className: "modal-story",
        buttons: choices.map((ch) => ({
          label: ch.label,
          cls: "btn-white story-choice",
          onClick: () => { this.pauseReasons.delete("story"); ch.onPick(); }
        }))
      });
    }

    applyEffect(eff) {
      const S = this.S;
      const msgs = [];
      if (eff.tip) { this.stats.tips += eff.tip; S.wallet += eff.tip; msgs.push(UI.t("effTip", { x: UI.money(eff.tip) })); }
      if (eff.wallet) { S.wallet += eff.wallet; msgs.push(UI.t("effWallet", { x: UI.money(eff.wallet) })); }
      if (eff.customer) { S.bonusNext = (S.bonusNext || 0) + eff.customer; msgs.push(UI.t("effCustomer")); }
      if (eff.heart) { this.hearts += eff.heart; msgs.push(UI.t("effHeart")); }
      if (eff.decor) {
        if (!S.decor.includes(eff.decor)) S.decor.push(eff.decor);
        const d = CONFIG.decor.find((x) => x.id === eff.decor);
        msgs.push(UI.t("effDecor", { name: d ? d.name : eff.decor }));
      }
      if (msgs.length) UI.toast(msgs.join(" · "), 2400);
      BT.Audio.play("coin");
      this.updateHud();
    }

    tomortleStory() {
      const P = window.PERSONAL;
      const S = this.S;
      const n = S.regularCustomers.tomortle || 0;
      const mem = P.memories[n % P.memories.length];
      const replies = CONFIG.texts.tomoReplies;
      const answers = CONFIG.texts.tomoAnswers;
      const effects = [{ tip: 5 }, { heart: 1 }];
      this.storyDialog(UI.t("tomoTag"), ["tomortle", "bouquet"], UI.t("tomoAsk", { title: mem.title }) + "\n" + mem.date, replies.map((label, i) => ({
        label: UI.fmt(label),
        onPick: () => {
          S.regularCustomers.tomortle = n + 1;
          UI.toast(UI.fmt(answers[i]), 2600);
          this.applyEffect(effects[i]);
        }
      })));
    }

    regularStory(id, chapter) {
      const G = CONFIG.gameplay;
      const def = CONFIG.regulars[id];
      const ch = def.chapters[chapter];
      if (!ch) return;
      const S = this.S;
      this.storyDialog(UI.t("regularTitle", { name: def.name, c: chapter + 1, t: BT.MS.chaptersAt(id, this.dayNum) }), def.doodle || def.avatar, UI.fmt(ch.text), ch.choices.map((choice) => ({
        label: UI.fmt(choice.label),
        onPick: () => {
          S.regularCustomers[id] = chapter + 1;
          S.regularNext = S.regularNext || {};
          S.regularNext[id] = S.ms.shifts + def.gap;
          this.applyEffect(choice.effect);
          if (chapter + 1 >= BT.MS.chaptersAt(id, this.dayNum)) this.scope.timeout(() => UI.toast(UI.t("regularLoyal", { name: def.name }), 2800), 900);
        }
      })));
    }

    // ---------------- Khay & vỉ ----------------
    bindTray(t) {
      const G = CONFIG.gameplay;
      let start = null;
      let ghost = null;
      let holdCtl = null;
      const el = t.el;

      el.addEventListener("pointerdown", (e) => {
        if (e.target.closest("[data-action]")) return;
        start = { x: e.clientX, y: e.clientY, id: e.pointerId, held: false };
        try { el.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ }
        // Vỉ nướng: nhấn giữ để tán trứng
        if (t.needsCrack() && !this.isPaused()) {
          this.select(t);
          const s = start;
          holdCtl = UI.hold(e, {
            el,
            sec: G.crackHoldSec,
            isPaused: () => this.isPaused(),
            onDone: () => { holdCtl = null; s.held = true; this.crack(t); },
            onCancel: () => { holdCtl = null; }
          });
        }
      });
      el.addEventListener("pointermove", (e) => {
        if (!start || start.id !== e.pointerId) return;
        const dx = e.clientX - start.x;
        const dy = e.clientY - start.y;
        if (!ghost && Math.hypot(dx, dy) > G.dragStartPx && !t.isEmpty() && !this.isPaused()) {
          if (holdCtl) { holdCtl.cancel(); holdCtl = null; }
          this.select(t);
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
        const held = start.held;
        start = null;
        if (holdCtl) { holdCtl.cancel(); holdCtl = null; }
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
        } else if (e.type === "pointerup" && !held) {
          this.tapContainer(t);
        }
      };
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
      el.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;
        this.select(t);
        this.openGesture(t, btn.dataset.action);
      });
    }

    tapContainer(t) {
      if (t.kind === "grill" && t.cooking && !this.isPaused()) {
        const q = t.fold();
        if (q === "raw") {
          this.select(t);
          UI.toast(UI.t("notCookedYet"));
          const bar = t.el.querySelector(".cookbar");
          if (bar) { bar.classList.remove("blink"); void bar.offsetWidth; bar.classList.add("blink"); }
          return;
        }
        if (q) {
          t.render();
          this.select(t);
          if (q === "burnt") { UI.toast(UI.t("burntTrash")); BT.Audio.play("angry"); }
          else {
            const p = UI.center(t.el);
            UI.floatText(p.x, p.y - 20, q === "good" ? UI.t("foldGood") : UI.t("foldOk"), q === "good" ? "money" : "stars");
            BT.Audio.play(q === "good" ? "ready" : "sizzle");
          }
          this.updateHint();
          return;
        }
      }
      this.select(t);
      BT.Audio.play("tap");
      // Giao một chạm: khay đã đúng món của một khách đang chờ → giao luôn (khách đợi lâu nhất)
      if (BT.assist("oneTapDeliver") && !t.isEmpty() && !this.isPaused()) {
        const c = this.customers.filter((x) => x.state === "waiting" && !x.isCat).sort((a, b) => a.pct() - b.pct())
          .find((x) => x.pending().some((it) => BT.Tray.evaluate(t, it).ok));
        if (c) this.deliver(c, t);
      }
    }

    crack(t) {
      if (!t.crack()) return;
      t.render();
      UI.splash(UI.center(t.el), "#FFD54F");
      BT.Audio.play("crack");
      BT.Audio.play("sizzle");
      this.updateHint();
    }

    select(t) {
      this.selected = t || null;
      this.containers().forEach((x) => x.el.classList.toggle("selected", x === this.selected));
      this.updateHint();
    }

    trashSelected() {
      const t = this.selected;
      if (!t || t.isEmpty()) { UI.toast(UI.t("trashNothing")); return; }
      t.clear();
      t.render();
      UI.shake(this.trashEl);
      UI.toast(UI.t("trashed"));
      BT.Audio.play("wrong");
      this.updateHint();
    }

    // ---------------- Nguyên liệu ----------------
    // Khay/vỉ mà nguyên liệu sẽ rơi vào
    targetFor(ingId) {
      const pool = this.zone === "nuong" ? this.grills : this.trays;
      const role = BT.Tray.roleOf(ingId, this.zone);
      let t = this.selected && pool.includes(this.selected) ? this.selected : null;
      // Khay đang chọn thuộc khu khác → chuyển sang khay đang làm dở của khu hiện tại
      if (t && !t.isEmpty() && t.kind === "tray" && t.zone !== this.zone) {
        t = pool.find((x) => !x.isEmpty() && x.zone === this.zone) || null;
        if (t && role !== "base") return { tray: t, auto: true };
      }
      if (!t || (role === "base" && !t.isEmpty())) {
        const empty = pool.find((x) => x.isEmpty());
        if (empty) return { tray: empty, auto: true };
        if (!t) return { tray: null };
      }
      return { tray: t };
    }

    canHold(ingId) {
      if (this.isPaused()) return UI.t("pauseTitle");
      const { tray } = this.targetFor(ingId);
      if (!tray) return UI.t("noTray");
      if (tray.isEmpty()) return UI.t("needCup");
      if (tray.zone !== "nuoc") return UI.t("notThisZone");
      if (tray.poured) return UI.t("alreadyPoured");
      this.select(tray);
      return null;
    }

    onStationTap(ingId, cell, fromHold) {
      if (this.isPaused()) return;
      if (this.endless && BT.Save.stock(ingId) <= 0) this.autoRestock(ingId);
      if (BT.Save.stock(ingId) <= 0) { UI.toast(UI.t("outOfStock", { ing: UI.ing(ingId).short })); if (cell) UI.shake(cell); return; }
      if (!fromHold && CONFIG.gameplay.holdSec[ingId] !== undefined) {
        if (BT.assist("tapPour")) fromHold = true;   // rót một chạm
        else { UI.toast(UI.t("holdToPour")); return; }
      }
      const { tray, auto } = this.targetFor(ingId);
      // Mèo hoang đang chờ: cầm trứng cút lên tay
      const catWaiting = this.customers.some((c) => c.isCat && c.state === "waiting");
      if (ingId === "trung_cut" && catWaiting && !this.eggInHand && (!tray || tray.isEmpty())) {
        this.eggInHand = true;
        this.S.inventory[ingId] = BT.Save.stock(ingId) - 1;
        this.grid.refresh();
        UI.toast(UI.t("eggInHand"));
        BT.Audio.play("add");
        return;
      }
      if (!tray) { this.containers().forEach((t) => UI.shake(t.el)); UI.toast(UI.t("noTray")); return; }
      if (auto) this.select(tray);
      // Thêm nguyên liệu sau khi đã làm xong (chỉ khi còn thiếu 1–2 phần)
      const late = this.lateAddOk(tray, ingId);
      if (late) { if (tray.zone === "che") tray.layers.push(ingId); else tray.items[ingId] = (tray.items[ingId] || 0) + 1; }
      const r = late ? { ok: true } : tray.add(ingId, this.zone);
      if (!r.ok) {
        UI.shake(tray.el);
        UI.toast(r.msg);
        BT.Audio.play("wrong");
        return;
      }
      this.select(tray);
      this.S.inventory[ingId] = BT.Save.stock(ingId) - 1;
      this.grid.refresh();
      const done = () => {
        tray.render();
        tray.el.classList.remove("bounce"); void tray.el.offsetWidth; tray.el.classList.add("bounce");
        this.updateHint();
      };
      if (cell && cell.isConnected) {
        UI.fly(UI.center(cell), UI.center(tray.el), UI.ing(ingId).emoji, CONFIG.gameplay.flySec);
        this.scope.timeout(done, CONFIG.gameplay.flySec * 1000);
      } else done();
      if (fromHold) UI.splash(UI.center(tray.el), ingId === "nuoc_mia" ? "#C5E1A5" : "#A1887F");
      BT.Audio.play(fromHold ? "pour" : "add");
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

    // ---------------- Lắc bịch / Cuốn bánh ----------------
    openGesture(tray, mode) {
      if (this.over) return;
      if (mode === "shake" && !tray.canShake()) return;
      if (mode === "roll" && !tray.canRoll()) return;
      // Lắc, cuốn một chạm
      if (BT.assist("oneTapAction")) {
        if (mode === "roll") { tray.rolled = true; BT.Audio.play("roll"); } else { tray.tied = true; BT.Audio.play("tie"); }
        tray.render();
        this.updateHint();
        return;
      }
      if (this.shakeLayer) this.shakeLayer.close();
      const G = CONFIG.gameplay;
      const roll = mode === "roll";
      const need = this.S.upgrades.lac_nhanh > 0 ? G.shakeNeededUpgraded : G.shakeNeeded;
      const layer = UI.el("div", "shake-layer" + (roll ? " roll" : ""));
      layer.appendChild(UI.el("div", "shake-title", UI.t(roll ? "rollTitle" : "shakeTitle")));
      const zone = UI.el("div", "shake-zone");
      const bag = UI.el("div", roll ? "big-paper" : "big-bag");
      const items = tray.el.querySelector(".bag-items");
      if (items) bag.appendChild(items.cloneNode(true));
      zone.appendChild(bag);
      layer.appendChild(zone);
      const meter = UI.el("div", "meter");
      const fill = UI.el("div", "meter-fill");
      meter.appendChild(fill);
      if (!roll) layer.appendChild(UI.el("div", "meter-label", UI.t("shakeMeter")));
      layer.appendChild(meter);
      const hint = UI.el("div", "shake-hint", roll ? UI.t("rollHint") : UI.t("shakeHint", { n: need }));
      layer.appendChild(hint);
      layer.appendChild(UI.button(UI.t("btnLater"), "btn-white small", () => close()));
      layer.style.setProperty("--shake-top", this.counter.offsetTop + "px");
      this.el.appendChild(layer);

      let count = tray.shakeCount;
      let progress = 0;
      let down = null;
      let dir = 0;
      let lastX = 0;
      let startY = 0;
      let swiped = false;
      let finished = false;
      const show = () => {
        if (roll) {
          fill.style.width = Math.min(100, progress * 100) + "%";
          bag.style.setProperty("--roll", String(Math.min(1, progress)));
        } else {
          fill.style.width = Math.min(100, (count / need) * 100) + "%";
          bag.style.transform = `rotate(${count % 2 ? G.shakeTiltDeg : -G.shakeTiltDeg}deg)`;
        }
      };
      const close = () => {
        if (!layer.parentNode) return;
        layer.remove();
        if (this.shakeLayer === layer) this.shakeLayer = null;
        tray.render();
        this.updateHint();
      };
      const complete = () => {
        finished = true;
        if (roll) { tray.rolled = true; UI.setText(hint, UI.t("rollDone")); BT.Audio.play("roll"); }
        else {
          tray.tied = true;
          bag.appendChild(UI.el("div", "big-tie", "🎀"));
          UI.setText(hint, UI.t("shakeDone"));
        }
        layer.classList.add("done");
        BT.Audio.play("tie");
        this.scope.timeout(close, 450);
      };
      const bump = () => {
        if (finished || this.isPaused()) return;
        count++;
        tray.shakeCount = count;
        BT.Audio.play("shake");
        show();
        // topping xáo trộn trong bịch
        bag.querySelectorAll(".bag-item").forEach((it) => {
          it.style.transform = `translate(${UI.rand(-6, 6)}px, ${UI.rand(-5, 5)}px) rotate(${UI.rand(-25, 25)}deg)`;
        });
        if (count >= need) complete();
      };
      layer.close = close;
      this.shakeLayer = layer;

      zone.addEventListener("pointerdown", (e) => {
        down = e.pointerId; lastX = e.clientX; startY = e.clientY; dir = 0; swiped = false;
        try { zone.setPointerCapture(e.pointerId); } catch (err) { /* bỏ qua */ }
      });
      zone.addEventListener("pointermove", (e) => {
        if (down !== e.pointerId || finished || this.isPaused()) return;
        if (roll) {
          const h = bag.offsetHeight || 1;
          progress = Math.max(progress, (startY - e.clientY) / (h * G.rollDistance));
          show();
          if (progress >= 1) complete();
          return;
        }
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
        if (!roll && !swiped && e.type === "pointerup") bump();
      };
      zone.addEventListener("pointerup", up);
      zone.addEventListener("pointercancel", up);
      show();
    }

    // ---------------- Năng lượng yêu thương ----------------
    updateLove() {
      if (!this.loveBtn) return;
      this.loveFill.style.height = (this.love * 100) + "%";
      this.loveBtn.classList.toggle("ready", this.love >= 1);
    }

    useLove() {
      if (this.isPaused()) return;
      if (this.love < 1) { UI.toast(Math.round(this.love * 100) + "% 💖"); return; }
      this.love = 0;
      this.freezeLeft = CONFIG.gameplay.loveFreezeSec;
      this.front.classList.add("loving");
      UI.toast(UI.t("loveActive"));
      BT.Audio.play("win");
      for (let i = 0; i < 14; i++) {
        const h = UI.el("div", "love-heart", UI.pick(["💖", "💕", "💗"]));
        h.style.left = UI.rand(5, 95) + "%";
        h.style.animationDelay = UI.rand(0, 1.5) + "s";
        this.loveFx.appendChild(h);
        this.scope.timeout(() => h.remove(), 4000);
      }
      this.updateLove();
    }

    // ---------------- Khu làm món ----------------
    onTab(z) {
      const open = this.openZones.some((o) => o.id === z.id);
      if (!open) {
        if (z.openDay > this.dayNum) UI.toast(UI.t("zoneLocked", { zone: z.name, n: BT.MS.majorIndex(z.openDay) }));
        else UI.toast(UI.t("zoneLaterBuild", { zone: z.name }));
        return;
      }
      this.setZone(z.id);
    }

    setZone(id) {
      this.zone = id;
      Object.keys(this.tabEls).forEach((k) => this.tabEls[k].classList.toggle("active", k === id));
      const z = CONFIG.zones.find((x) => x.id === id);
      UI.setText(this.zoneLabel, z.icon + " " + z.name);
      const grill = id === "nuong";
      this.trayGroup.style.display = grill ? "none" : "";
      this.grillGroup.style.display = grill ? "" : "none";
      const sel = this.selected;
      if (sel && ((sel.kind === "grill") !== grill || (!grill && !sel.isEmpty() && sel.zone !== id))) this.select(null);
      this.grid.show(id);
      this.updateHint();
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
        if (c.state === "waiting" || c.state === "entering") c.zones().forEach((z) => waiting.add(z));
      });
      Object.keys(this.tabEls).forEach((k) => this.tabEls[k].classList.toggle("has-dot", waiting.has(k)));
    }

    // ---------------- HUD & gợi ý ----------------
    income() { return this.stats.revenue + this.stats.tips; }

    updateHud() {
      UI.setText(this.hudCust, this.endless ? UI.t("hudEndless", { d: this.stats.served }) : UI.t("hudCustomers", { d: this.done, t: this.total }));
      const avg = this.avgRating();
      UI.setText(this.hudRate, "⭐ " + (avg ? UI.rating(avg) : "–"));
      if (this.hudRecord) UI.setText(this.hudRecord, UI.t("hudRecord", { x: UI.money(this.recordIncome) }));
      UI.setText(this.hudMoney, "🪙 " + UI.money(this.income()) + (this.secret || this.endless ? "" : " / " + UI.money(this.dayCfg.target)));
      this.hudMoney.classList.toggle("reached", !this.secret && !this.endless && this.income() >= this.dayCfg.target);
      UI.setText(this.hudCombo, UI.t("comboLabel", { n: this.combo }));
      this.hudCombo.style.display = this.combo >= 2 ? "" : "none";
      let h = "";
      const max = Math.max(CONFIG.gameplay.hearts, this.hearts);
      for (let i = 0; i < max; i++) h += i < this.hearts ? "❤️" : "🤍";
      UI.setText(this.hudHearts, h);
    }

    updateHint() {
      if (!this.dayCfg.hints || !this.hintEl) return;
      const H = CONFIG.texts.hints;
      const z = this.zone;
      const pool = z === "nuong" ? this.grills : this.trays;
      const t = this.selected && pool.includes(this.selected) ? this.selected : pool.find((x) => !x.isEmpty() && (z === "nuong" || x.zone === z));
      const has = t && !t.isEmpty() && (z === "nuong" || t.zone === z);
      let key;
      if (z === "tron") {
        key = !has ? "start" : t.tied ? "deliver" : t.finish.length ? "shake" : Object.keys(t.items).length >= 2 ? "finish" : "toppings";
      } else if (z === "nuoc") {
        key = !has ? "nuoc_start" : !t.poured ? "nuoc_pour" : t.finish.includes("da") ? "nuoc_deliver" : "nuoc_ice";
      } else if (z === "nuong") {
        key = !has ? "nuong_start" : !t.cracked ? "nuong_egg" : !t.folded ? "nuong_cook" : Object.keys(t.sauces).length ? "nuong_deliver" : "nuong_sauce";
      } else {
        key = !has ? "cuon_start" : !t.rolled ? (Object.keys(t.items).length >= 2 ? "cuon_roll" : "cuon_toppings") : t.finish.length ? "cuon_deliver" : "cuon_sauce";
      }
      UI.setText(this.hintEl, UI.fmt(H[key]));
    }

    // ---------------- Sổ công thức ----------------
    openBook() {
      if (this.over) return;
      if (this.dayNum <= CONFIG.gameplay.recipeBookPauseUntilDay || BT.assist("bookPause")) this.pauseReasons.add("book");
      const steps = CONFIG.texts.stepNames;
      const name = (s) => (CONFIG.ingredients[s] ? UI.ing(s).emoji + " " + UI.ing(s).name : steps[s] || s);
      const list = UI.el("div", "book");
      this.dishPool.forEach((r) => {
        const row = UI.el("div", "book-row" + (r.id === window.PERSONAL.favoriteDish || r.combo ? " fav" : ""));
        const head = UI.el("div", "book-head");
        head.appendChild(UI.el("span", "book-emoji", r.emoji));
        head.appendChild(UI.el("span", "book-name", r.name));
        head.appendChild(UI.el("span", "book-price", UI.money(r.combo ? r.price : UI.recipePrice(r.id))));
        row.appendChild(head);
        const line = (label, text) => {
          const l = UI.el("div", "book-line");
          l.appendChild(UI.el("b", "", label + ": "));
          l.appendChild(UI.el("span", "", text));
          row.appendChild(l);
        };
        if (r.combo) {
          line("🎁", r.combo.map((id) => UI.recipe(id).name).join(" + "));
        } else {
          line(UI.t("bookBase"), name(r.base));
          if (r.zone === "che") line(UI.t("bookLayers"), r.toppings.map((s, i) => (i + 1) + ". " + name(s)).join("  "));
          else if (r.toppings.length) line(UI.t("bookToppings"), r.toppings.map(name).join(", "));
          line(UI.t("bookFinish"), r.finish.map(name).join(" → "));
        }
        list.appendChild(row);
      });
      UI.modal({
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
      UI.modal({
        title: UI.t("pauseTitle"),
        body: UI.t("leaveConfirm"),
        dismissable: true,
        onClose: resume,
        buttons: [
          { label: UI.t("btnContinue"), cls: "btn-pink", onClick: resume },
          ...(this.endless ? [] : [{ label: UI.t("btnRetry"), cls: "btn-orange", onClick: () => { resume(); this.abandon("retry"); } }]),
          { label: UI.t(this.endless ? "btnEndShift" : (this.run.mode === "daily" ? "btnToMenu" : "btnToMap")), cls: "btn-white", onClick: () => { resume(); this.abandon("map"); } }
        ]
      });
    }

    abandon(where) {
      if (this.endless && !this.over) { this.finish(false); return; }
      this.over = true;
      BT.Save.restoreDay();
      BT.Save.persist();
      if (where === "retry") this.router.go("Prep", { run: BT.MS.again(this.run) }, { replace: true });
      else this.router.backTo(this.run.mode === "daily" ? "Menu" : "Map");
    }

    // Qua mốc: kỷ niệm (mốc lớn) hoặc tiền + chuyện vặt (mốc nhỏ); qua mốc cuối → đoạn kết
    applyCleared(progress) {
      const S = this.S;
      const MS = BT.MS;
      let newMemory = null, minor = null, ending = false, card2 = null, newMemory2 = null, helperChapter = null;
      const sid = S.season || 1;
      if (progress && progress.cleared) {
        const m = MS.get(progress.cleared);
        if (m.major && sid === 1) {
          const mi = m.day - 1;
          if (window.PERSONAL.memories[mi] && !S.memoriesUnlocked.includes(mi)) { S.memoriesUnlocked.push(mi); newMemory = mi; }
        } else if (m.major) {
          // Mùa 2: thẻ công thức (+ kỷ niệm Mùa 2 nếu người tặng đã thêm)
          const ci = m.day - MS.season(2).majorDays[0];
          if (!S.s2.cards.includes(ci)) { S.s2.cards.push(ci); card2 = ci; }
          if ((window.PERSONAL.memories2 || [])[ci] && !S.s2.memories.includes(ci)) { S.s2.memories.push(ci); newMemory2 = ci; }
        } else {
          const MC = CONFIG.milestones;
          const coins = MC.minorCoinsBase + MC.minorCoinsPerLevel * m.level;
          S.wallet += coins;
          const tales = window.PERSONAL.minorTales || [];
          let tale = null;
          if (tales.length) { const ti = S.talesSeen.length % tales.length; tale = tales[ti]; S.talesSeen.push(ti); }
          minor = { coins, tale };
        }
        ending = progress.cleared === MS.count() && !(sid === 1 ? S.endingSeen : S.s2.endingSeen);
        if (sid >= CONFIG.helper.fromSeason && progress.cleared === CONFIG.helper.fromMilestone - 1 && !S.helper.unlocked) {
          S.helper.unlocked = true;
          S.helper.chapters = Math.max(S.helper.chapters, 1);
          helperChapter = 0;
        }
      }
      return { newMemory, minor, ending, card2, newMemory2, helperChapter };
    }

    // Kết thúc Ca vô tận: không có mục tiêu, giữ toàn bộ tiền, cộng tiến độ theo số khách
    finishEndless(income) {
      const S = this.S;
      const MS = BT.MS;
      const served = this.stats.served;
      const claim = BT.Endless.claim(served, income);
      S.life.served += served;
      const petCoins = this.hamsterCoins();
      const units = BT.Endless.units(served);
      S.ms.shifts++;
      const progress = MS.addProgress(units);
      const { newMemory, minor, ending, card2, newMemory2, helperChapter: hc0 } = this.applyCleared(progress);
      const hr = this.helperOn ? BT.Helper.onShiftEnd(this) : null;
      const helperChapter = hc0 !== null ? hc0 : hr ? hr.chapter : null;
      const avg = this.avgRating();
      const lvBefore = BT.Progress.level(S.xp).level;
      S.xp += Math.round(income / 10);
      const lv = BT.Progress.level(S.xp);
      const levelUp = lv.level > lvBefore ? lv : null;
      Object.keys(this.q).forEach((k) => BT.Progress.questAdd(k, this.q[k]));
      BT.Progress.questAdd("income", Math.round(income));
      if (S.dayBackup) S.dayBackup.finished = true;
      S.today = null;
      const badges = BT.Fun.checkBadges();
      BT.Save.persist();
      const summary = {
        badges,
        day: this.dayId, run: this.run, title: UI.runTitle(this.run), endSeason: S.season || 1, endless: true, passed: true, lostHearts: false, stars: 0,
        served, best: S.endless.best, newBest: claim.newBest, coins: claim.coins, rewardMarks: claim.milestones,
        memory: newMemory, ending, minor, card2, memory2: newMemory2, helperChapter, petCoins, units, progress, need: MS.need(progress.before.index), levelUp,
        income, kept: income, target: 0, revenue: this.stats.revenue, tips: this.stats.tips, expense: this.stats.expense,
        net: income - this.stats.expense, total: served, walkouts: this.stats.walkouts, avgRating: avg
      };
      this.el.appendChild(UI.el("div", "end-banner", UI.t(this.hearts <= 0 ? "endlessOver" : "endlessStop")));
      BT.Audio.play("win");
      this.scope.timeout(() => this.router.go("Result", summary, { replace: true }), CONFIG.gameplay.endBannerSec * 1000);
    }

    // ---------------- Kết ca ----------------
    finish(lostHearts) {
      if (this.over) return;
      this.over = true;
      const G = CONFIG.gameplay;
      const M = CONFIG.money;
      const d = this.dayCfg;
      const income = this.income();
      if (this.endless) { this.finishEndless(income); return; }
      const passed = this.secret || (!lostHearts && income >= d.target);
      let stars = 0;
      if (this.secret) stars = 3;
      else if (passed) {
        stars = 1;
        if (income >= d.target * G.dayStarRatios[1]) stars = 2;
        if (income >= d.target * G.dayStarRatios[2] && this.stats.walkouts === 0) stars = 3;
      }
      let kept = income;
      if (!passed) {
        kept = Math.round(income * M.loseKeepRatio);
        this.S.wallet -= income - kept;
      }
      const avg = this.avgRating();
      const S = this.S;
      const MS = BT.MS;
      const run = this.run;
      // Tiến độ mốc (ca bí mật không tính)
      let units = 0, progress = null, newMemory = null, minor = null, ending = false, daily = null, card2 = null, newMemory2 = null, helperChapter = null;
      const goldBefore = [S.goldHearts, S.s2.goldHearts];
      S.ms.shifts++;
      if (run.mode === "daily") {
        daily = BT.Daily.complete(run.date, { income, target: d.target });
        units = daily.units;
        progress = daily.progress || null;
      } else if (!this.secret) {
        const rs = MS.stateOf(run.season);   // mùa của ca (chơi lại mùa cũ thì ghi vào mùa cũ)
        const best = rs.best[run.ms] || { stars: 0, income: 0 };
        best.stars = Math.max(best.stars, stars);
        best.income = Math.max(best.income, income);
        rs.best[run.ms] = best;
        rs.firstDone[run.ms] = true;
        S.ms.lastEvent = run.event;
        units = MS.units({ passed, stars, income, target: d.target });
        progress = MS.addProgress(units, { replay: run.mode === "replay" });
      }
      ({ newMemory, minor, ending, card2, newMemory2, helperChapter } = this.applyCleared(progress));
      if (this.helperOn) { const hr = BT.Helper.onShiftEnd(this); if (helperChapter === null) helperChapter = hr.chapter; }
      // Tim vàng tính riêng từng mùa
      // Bộ đếm trọn đời & thú cưng sau ca
      S.life.served += this.stats.served;
      S.life.crispy += this.q.crispy || 0;
      if (passed && !this.secret && this.stats.walkouts === 0) S.life.perfect++;
      const petCoins = this.hamsterCoins();
      const newRecord = !!(this.recordIncome && income > this.recordIncome);
      S.goldHearts = MS.goldHearts(1);
      S.s2.goldHearts = MS.goldHearts(2);
      const goldSeason = run.season || 1;
      const newGold = goldSeason === 1 ? S.goldHearts > goldBefore[0] : S.s2.goldHearts > goldBefore[1];
      const allGold = goldSeason === 1 ? S.goldHearts >= CONFIG.build.maxPlayableDay && !S.bonusSeen : S.s2.goldHearts >= CONFIG.build.maxPlayableDay && !S.s2.bonusSeen;
      // Khách thêm từ cốt truyện: dùng cho ngày kế tiếp
      this.S.bonusCustomers = this.S.bonusNext || 0;
      this.S.bonusNext = 0;
      // Đếm số lần thua liên tiếp ở cùng một ngày
      if (passed) this.S.loseStreak = null;
      else if (this.S.loseStreak && this.S.loseStreak.day === this.dayId) this.S.loseStreak.n++;
      else this.S.loseStreak = { day: this.dayId, n: 1 };
      const lvBefore = BT.Progress.level(this.S.xp).level;
      this.S.xp += Math.round(income / 10);
      const lv = BT.Progress.level(this.S.xp);
      const levelUp = lv.level > lvBefore ? lv : null;
      Object.keys(this.q).forEach((k) => BT.Progress.questAdd(k, this.q[k]));
      BT.Progress.questAdd("income", Math.round(income));
      BT.Progress.questAdd("days", 1);
      if (this.S.dayBackup) this.S.dayBackup.finished = true;
      this.S.today = null;
      const badges = BT.Fun.checkBadges();
      BT.Save.persist();

      // Hẹn hò sau ca: qua mốc lớn, hoặc ngẫu nhiên sau ca thắng
      const majorCleared = !!(progress && progress.cleared && (MS.get(progress.cleared) || {}).major);
      const dateOffer = passed && !this.secret && (majorCleared || Math.random() < CONFIG.dateGame.rate);
      const summary = {
        badges, dateOffer,
        day: this.dayId, run, title: UI.runTitle(run), endSeason: S.season || 1, passed, lostHearts, stars, secret: this.secret,
        units, progress, need: progress ? MS.need(progress.before.index) : 0, minor, daily, card2, memory2: newMemory2, goldSeason, helperChapter, petCoins, newRecord,
        memory: newMemory, newGold, allGold, ending, levelUp,
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
      if (this.shakeLayer) { this.shakeLayer.close(); return true; }
      this.openPause();
      return true;
    }

    onHide() {
      if (this.started && !this.over) this.openPause();
    }

    destroy() {
      this.scope.clear();
      UI.closeAllModals();
      UI.coach.hide();
    }
  }

  BT.Screens.Game = {
    mount(root, params, router) { return new Game(root, params, router); }
  };
})();
