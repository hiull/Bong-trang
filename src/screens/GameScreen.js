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
      this.dayId = params.day;                 // 1..15 hoặc "secret"
      this.dayNum = UI.dayLevel(params.day);   // dạng số để so với ngày mở món
      this.secret = this.dayId === "secret";
      this.dayCfg = UI.dayCfg(params.day);
      this.S = BT.Save.state;
      this.scope = UI.scope();
      this.pauseReasons = new Set();
      this.started = false;
      this.over = false;

      this.total = this.dayCfg.customers + (this.S.bonusCustomers || 0);
      this.spawned = 0;
      this.done = 0;
      this.hearts = G.hearts;
      this.combo = 0;
      this.love = 0;
      this.freezeLeft = 0;
      this.catsToday = 0;
      this.eggInHand = false;
      this.groupDone = false;
      this.groupPending = 0;
      this.reviewerAt = this.dayCfg.ratingWeight ? UI.randInt(1, Math.max(1, this.total - 2)) : -1;
      const today = this.S.today && this.S.today.day === this.dayId ? this.S.today : { day: this.dayId, expense: 0 };
      this.S.today = today;
      this.stats = { revenue: 0, tips: 0, expense: today.expense, served: 0, walkouts: 0, ratings: [], weights: [] };

      // Nâng cấp & trợ giúp khi thua 2 lần liên tiếp
      const up = this.S.upgrades;
      this.patienceMult = this.dayCfg.patienceMult;
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
      this.dishPool = C.recipes.filter((r) => r.openDay <= this.dayNum && (zoneIds.includes(r.zone) || (r.combo && r.combo.every((id) => zoneIds.includes(UI.recipe(id).zone)))));
      this.typePool = Object.keys(C.customerTypes).filter((id) => {
        const t = C.customerTypes[id];
        return t.kind === "normal" && t.openDay <= this.dayNum;
      });

      this.planSpecials();
      this.build(root);
      this.loop();
      this.countdown();
    }

    // Lên lịch khách đặc biệt: Hiếu (Tomortle), khách quen có cốt truyện, khách ruột
    planSpecials() {
      const G = CONFIG.gameplay;
      this.plan = {};
      this.tomoCame = 0;
      this.tomoWanted = 0;
      const free = () => {
        const slots = [];
        for (let i = 0; i < this.total; i++) if (!this.plan[i]) slots.push(i);
        return slots;
      };
      if (this.secret) {
        this.tomoWanted = G.secretTomortleVisits;
        for (let k = 0; k < this.tomoWanted; k++) this.plan[Math.floor((k + 0.5) * this.total / this.tomoWanted)] = { kind: "tomortle" };
        return;
      }
      if (this.dayNum >= G.tomortleFromDay) {
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
        if (done < G.regularChapters && this.dayNum >= def.startDay && this.dayNum >= (S.regularNext[id] || 0) && dishOk) {
          entry = { kind: "regular", id, chapter: done };
        } else if (done >= G.regularChapters && Math.random() < G.regularLoyalRate) {
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
      const el = UI.el("div", "screen game skin-" + this.S.activeSkin + " weather-" + this.dayCfg.weather);
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
      front.appendChild(UI.el("div", "weather-fx"));
      CONFIG.gameplay.seatCenters[this.seatCount].forEach((c) => {
        const stool = UI.el("div", "stool");
        stool.style.left = c + "%";
        front.appendChild(stool);
      });
      const pet = UI.el("button", "pet", "🐈");
      pet.type = "button";
      pet.setAttribute("aria-label", UI.fmt("{pet}"));
      pet.appendChild(UI.el("span", "pet-z", "💤"));
      pet.addEventListener("click", () => {
        UI.toast(UI.fmt(UI.pick(CONFIG.pets.miu.lines)));
        pet.classList.remove("wiggle"); void pet.offsetWidth; pet.classList.add("wiggle");
        BT.Audio.play("pop");
      });
      front.appendChild(pet);
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
      for (let i = 0; i < this.S.upgrades.khay; i++) {
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
        if (g.updateCook(dt) === "burnt") {
          g.render();
          BT.Audio.play("angry");
          BT.Audio.vibrate(G.vibrateBad);
          UI.toast(UI.t("burntNow"));
          this.updateHint();
        }
        if (g.cooking && g.cook >= zones[3].from) warn = true;
        const q = g.cookState() || "";
        if (g.el.dataset.q !== q) g.el.dataset.q = q;
      });
      if (this.tabEls.nuong) this.tabEls.nuong.classList.toggle("warn", warn && this.zone !== "nuong");

      this.customers.slice().forEach((c) => c.update(dt, this.freezeLeft > 0));
      if (this.spawned >= this.total && this.groupPending === 0 && this.customers.filter((c) => !c.isCat).length === 0) this.finish(false);
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
      if (Math.random() >= byDay(G.specialRequestRate)) return [];
      const n = UI.randInt(1, byDay(G.specialRequestMax));
      const req = BT.Tray.requirements({ id: dishId, reqs: [] });
      const r = req.r;
      const unlocked = (id) => UI.ing(id).openDay <= this.dayNum;
      const options = CONFIG.specialRequests.filter((q) => {
        if (q.type === "remove") return req.need[q.ing] !== undefined || req.finishIngs.includes(q.ing);
        if (q.type === "double") return req.need[q.ing] !== undefined;
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
      if (this.dayNum >= G.twoDishFromDay && r.zone !== "nuoc" && Math.random() < G.twoDishRate) {
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
      // Mèo hoang hiếm (không tính vào số khách của ngày)
      const cat = CONFIG.customerTypes.meo_hoang;
      if (this.groupPending === 0 && this.dayNum >= cat.openDay && this.catsToday < G.catMaxPerDay && Math.random() < cat.rareRate) {
        this.catsToday++;
        this.spawn(seat, "meo_hoang", { items: [] });
        this.spawnTimer = UI.rand(d.spawn[0], d.spawn[1]);
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
      if (special && special.kind === "tomortle" && this.tomoCame >= this.tomoWanted) special = null;
      if (special && special.kind === "tomortle") this.spawnTomortle(seat);
      else if (special && special.kind === "regular") this.spawnRegular(seat, special);
      else if (this.secret || (this.groupPending === 0 && this.dayNum >= G.friendFromDay && Math.random() < G.friendWeight / (this.typePool.length + G.friendWeight))) this.spawnFriend(seat);
      else {
        let typeId = UI.pick(this.typePool);
        if (this.groupPending > 0) { typeId = "hoc_sinh"; this.groupPending--; }
        const order = this.makeOrder();
        order.reviewer = this.spawned === this.reviewerAt;
        this.spawn(seat, typeId, order);
      }
      this.spawned++;
      this.spawnTimer = this.groupPending > 0 ? G.groupSpawnGapSec : UI.rand(d.spawn[0], d.spawn[1]);
    }

    // Hiếu (Tomortle): 1 món bánh tráng + 1 ly nước, kiên nhẫn vô hạn
    spawnTomortle(seat) {
      this.tomoCame++;
      const foods = this.dishPool.filter((r) => r.zone !== "nuoc" && !r.combo);
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
      const loyal = (this.S.regularCustomers[plan.id] || 0) >= G.regularChapters;
      const typeDef = {
        name: def.name, avatar: def.avatar, accessory: def.accessory, patience: def.patience,
        tip: loyal ? def.tip.map((x) => x * G.regularLoyalTipMult) : def.tip,
        self: def.self, call: def.call, lines: [UI.t("regularOrder")], enterSec: CONFIG.gameplay.customerEnterSec, kind: "regular"
      };
      const dish = this.dishPool.some((r) => r.id === def.dish) ? def.dish : this.makeOrder().items[0].id;
      return this.spawn(seat, null, { items: [{ id: dish, reqs: this.makeRequests(dish) }] },
        { typeDef, tag: def.name, loyal, regularId: plan.id, chapter: plan.chapter });
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
      this.stats.ratings.push(stars);
      this.stats.weights.push(c && c.reviewer ? this.dayCfg.ratingWeight || 1 : 1);
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
          notRolled: "wrongNotRolled", notCooked: "wrongNotCooked", burnt: "wrongBurnt", notCrispy: "wrongNotCrispy"
        }[bad.reason];
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
      const M = CONFIG.money;
      const up = this.S.upgrades;
      const p = c.pct();
      const speed = p > G.patienceHigh ? G.speedFactor.fast : p >= G.patienceLow ? G.speedFactor.normal : G.speedFactor.slow;
      let base = 0;
      if (c.combo) base = UI.recipe("combo_tinh_yeu").price;
      else c.items.forEach((it) => { base += UI.recipePrice(it.id) * (it.crispy ? 1 + G.crispyBonus : 1); });
      const pay = Math.round(base * speed);
      let tip = UI.randInt(c.type.tip[0], c.type.tip[1]) * (this.dayCfg.tipMult || 1);
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
        BT.Audio.play("star");
        this.scope.timeout(() => this.tomortleStory(), G.tomortleHeartsSec * 700);
      } else if (c.regularId && c.chapter >= 0) {
        this.scope.timeout(() => this.regularStory(c.regularId, c.chapter), 600);
      }
    }

    // ---------------- Cốt truyện ----------------
    storyDialog(title, avatar, text, choices) {
      if (this.over) return;
      this.pauseReasons.add("story");
      const body = UI.el("div", "story");
      body.appendChild(UI.el("div", "story-avatar", avatar));
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
      this.storyDialog(UI.t("tomoTag"), "🧑💐", UI.t("tomoAsk", { title: mem.title }) + "\n" + mem.date, replies.map((label, i) => ({
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
      this.storyDialog(UI.t("regularTitle", { name: def.name, c: chapter + 1, t: G.regularChapters }), def.avatar, UI.fmt(ch.text), ch.choices.map((choice) => ({
        label: UI.fmt(choice.label),
        onPick: () => {
          S.regularCustomers[id] = chapter + 1;
          S.regularNext = S.regularNext || {};
          S.regularNext[id] = this.dayNum + def.gap;
          this.applyEffect(choice.effect);
          if (chapter + 1 >= G.regularChapters) this.scope.timeout(() => UI.toast(UI.t("regularLoyal", { name: def.name }), 2800), 900);
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
            BT.Audio.play(q === "good" ? "star" : "tie");
          }
          this.updateHint();
          return;
        }
      }
      this.select(t);
      BT.Audio.play("tap");
    }

    crack(t) {
      if (!t.crack()) return;
      t.render();
      BT.Audio.play("tie");
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
      if (BT.Save.stock(ingId) <= 0) { UI.toast(UI.t("outOfStock", { ing: UI.ing(ingId).short })); if (cell) UI.shake(cell); return; }
      if (!fromHold && CONFIG.gameplay.holdSec[ingId] !== undefined) { UI.toast(UI.t("holdToPour")); return; }
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
      const r = tray.add(ingId, this.zone);
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
      BT.Audio.play(fromHold ? "tie" : "add");
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
        if (roll) { tray.rolled = true; hint.textContent = UI.t("rollDone"); }
        else {
          tray.tied = true;
          bag.appendChild(UI.el("div", "big-tie", "🎀"));
          hint.textContent = UI.t("shakeDone");
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
      this.hudCust.textContent = UI.t("hudCustomers", { d: this.done, t: this.total });
      const avg = this.avgRating();
      this.hudRate.textContent = "⭐ " + (avg ? UI.rating(avg) : "–");
      this.hudMoney.textContent = "🪙 " + UI.money(this.income()) + (this.secret ? "" : " / " + UI.money(this.dayCfg.target));
      this.hudMoney.classList.toggle("reached", !this.secret && this.income() >= this.dayCfg.target);
      this.hudCombo.textContent = UI.t("comboLabel", { n: this.combo });
      this.hudCombo.style.display = this.combo >= 2 ? "" : "none";
      let h = "";
      const max = Math.max(CONFIG.gameplay.hearts, this.hearts);
      for (let i = 0; i < max; i++) h += i < this.hearts ? "❤️" : "🤍";
      this.hudHearts.textContent = h;
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
      this.hintEl.textContent = UI.fmt(H[key]);
    }

    // ---------------- Sổ công thức ----------------
    openBook() {
      if (this.over) return;
      if (this.dayNum <= CONFIG.gameplay.recipeBookPauseUntilDay) this.pauseReasons.add("book");
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
          l.appendChild(document.createTextNode(text));
          row.appendChild(l);
        };
        if (r.combo) {
          line("🎁", r.combo.map((id) => UI.recipe(id).name).join(" + "));
        } else {
          line(UI.t("bookBase"), name(r.base));
          if (r.toppings.length) line(UI.t("bookToppings"), r.toppings.map(name).join(", "));
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
          { label: UI.t("btnRetry"), cls: "btn-orange", onClick: () => { resume(); this.abandon("retry"); } },
          { label: UI.t("btnToMap"), cls: "btn-white", onClick: () => { resume(); this.abandon("map"); } }
        ]
      });
    }

    abandon(where) {
      this.over = true;
      BT.Save.restoreDay();
      BT.Save.persist();
      if (where === "retry") this.router.go("Prep", { day: this.dayId }, { replace: true });
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
      const prev = this.S.days[this.dayId];
      const firstClear = passed && !(prev && prev.stars > 0);

      const rec = prev || { stars: 0, bestRevenue: 0, avgRating: 0 };
      rec.stars = Math.max(rec.stars, stars);
      rec.bestRevenue = Math.max(rec.bestRevenue, income);
      if (avg > rec.avgRating) rec.avgRating = Math.round(avg * 10) / 10;
      this.S.days[this.dayId] = rec;
      const goldBefore = this.S.goldHearts;
      this.S.goldHearts = Object.keys(this.S.days).filter((k) => k !== "secret" && this.S.days[k].stars === 3).length;
      const newGold = this.S.goldHearts > goldBefore;
      const allGold = this.S.goldHearts >= CONFIG.build.maxPlayableDay && !this.S.bonusSeen;
      // Qua ngày lần đầu → mở 1 thẻ kỷ niệm
      let newMemory = null;
      const mi = this.dayNum - 1;
      if (passed && !this.secret && window.PERSONAL.memories[mi] && !this.S.memoriesUnlocked.includes(mi)) {
        this.S.memoriesUnlocked.push(mi);
        newMemory = mi;
      }
      const ending = passed && this.dayId === CONFIG.build.maxPlayableDay && !this.S.endingSeen;
      // Khách thêm từ cốt truyện: dùng cho ngày kế tiếp
      this.S.bonusCustomers = this.S.bonusNext || 0;
      this.S.bonusNext = 0;
      if (passed && !this.secret) this.S.unlockedDay = Math.max(this.S.unlockedDay, this.dayNum + 1);
      // Đếm số lần thua liên tiếp ở cùng một ngày
      if (passed) this.S.loseStreak = null;
      else if (this.S.loseStreak && this.S.loseStreak.day === this.dayId) this.S.loseStreak.n++;
      else this.S.loseStreak = { day: this.dayId, n: 1 };
      this.S.xp += Math.round(income / 10);
      if (this.S.dayBackup) this.S.dayBackup.finished = true;
      this.S.today = null;
      BT.Save.persist();

      const summary = {
        day: this.dayId, passed, lostHearts, stars, firstClear, secret: this.secret,
        memory: newMemory, newGold, allGold, ending,
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
    }
  }

  BT.Screens.Game = {
    mount(root, params, router) { return new Game(root, params, router); }
  };
})();
