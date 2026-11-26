// fun.js — Những thứ làm game thú vị hơn: ngày đặc biệt, thư hằng tuần, trang trí theo mùa,
// giờ cao điểm, khách đặc biệt, thú cưng có việc làm, kỷ lục, huy hiệu, nhiệm vụ tuần,
// món sáng tạo, hẹn hò sau ca.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const daysBetween = (a, b) => Math.floor((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);

  const Fun = {
    today,

    // Lần chơi đầu (dùng cho thư hằng tuần)
    ensureFirstPlay() {
      const S = BT.Save.state;
      if (!S.firstPlay) { S.firstPlay = today(); BT.Save.persist(); }
    },

    // ---------------- Ngày đặc biệt ----------------
    specialToday() {
      const P = window.PERSONAL;
      const t = today();
      const md = t.slice(5);
      const ann = (P.anniversary || "").slice(5);
      const d = (P.specialDays || []).find((x) => (x.date === "anniversary" ? ann : x.date) === md);
      if (d) return Object.assign({ key: t }, d);
      if (ann && t.slice(8) === ann.slice(3) && t.slice(5) !== ann) return { key: t, kind: "month", title: UI.t("monthiversaryTitle"), message: P.monthiversaryMessage, gift: 0 };
      return null;
    },
    // Quà hôm nay chưa nhận?
    giftDue() {
      const d = this.specialToday();
      const S = BT.Save.state;
      return d && !S.specialSeen[d.key] ? d : null;
    },
    claimGift(d) {
      const S = BT.Save.state;
      if (S.specialSeen[d.key]) return false;   // đã nhận rồi (Menu dựng lại trước khi bấm)
      S.specialSeen[d.key] = true;
      if (d.gift) S.wallet += d.gift;
      BT.Save.persist();
    },

    // ---------------- Thư hằng tuần ----------------
    lettersAvailable() {
      const S = BT.Save.state;
      const all = (window.PERSONAL.weeklyLetters || []).length;
      if (!S.firstPlay) return Math.min(all, 1);
      return Math.min(all, Math.floor(Math.max(0, daysBetween(S.firstPlay, today())) / 7) + 1);
    },
    unreadLetters() { return Math.max(0, this.lettersAvailable() - (BT.Save.state.lettersRead || 0)); },
    openMail() {
      const S = BT.Save.state;
      const n = this.lettersAvailable();
      const L = window.PERSONAL.weeklyLetters || [];
      const list = UI.el("div", "fb-list");
      for (let i = n - 1; i >= 0; i--) {
        const row = UI.el("div", "fb-item solved mail-item");
        row.appendChild(UI.el("div", "fb-answer", UI.t("mailWeek", { n: i + 1 })));
        row.appendChild(UI.el("div", "fb-line", UI.fmt(L[i])));
        list.appendChild(row);
      }
      if (n < L.length) list.appendChild(UI.el("div", "fb-locked", UI.t("mailNext")));
      S.lettersRead = n;
      BT.Save.persist();
      BT.Audio.play("letter");
      UI.modal({ title: UI.t("mailTitle"), body: list, className: "modal-flirt-book modal-mail", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
    },

    // ---------------- Trang trí theo mùa tự bật ----------------
    skin() {
      const S = BT.Save.state;
      if (S.settings.autoSeasonSkin !== false) {
        const k = BT.Progress.seasonalSkin();
        if (k) return k.id;
      }
      return S.activeSkin;
    },
    inSeasonSkin() {
      const S = BT.Save.state;
      return S.settings.autoSeasonSkin !== false ? BT.Progress.seasonalSkin() : null;
    }
  };

  // ---------------- Huy hiệu ----------------
  Fun.badgeValue = function (stat) {
    const S = BT.Save.state;
    switch (stat) {
      case "served": return S.life.served;
      case "perfect": return S.life.perfect;
      case "crispy": return S.life.crispy;
      case "flirt": return BT.Flirt.count().solved;
      case "dailyStreak": return S.daily.streak;
      case "endlessBest": return S.endless.best;
      case "season1": return S.endingSeen ? 1 : 0;
      case "season2": return S.s2 && S.s2.endingSeen ? 1 : 0;
      case "vips": return S.life.vips;
      case "customs": return S.life.customsSold;
      case "rushes": return S.life.rushes;
      case "dates": return S.life.datesWon;
      case "gold": return S.goldHearts;
      default: return 0;
    }
  };
  // Mở các huy hiệu vừa đạt, cộng thưởng; trả về danh sách id mới
  Fun.checkBadges = function () {
    const S = BT.Save.state;
    const got = [];
    CONFIG.badges.forEach((b) => {
      if (S.badges[b.id] || this.badgeValue(b.stat) < b.n) return;
      S.badges[b.id] = true;
      S.wallet += b.reward;
      got.push(b.id);
    });
    if (got.length) BT.Save.persist();
    return got;
  };
  Fun.openBadges = function () {
    const S = BT.Save.state;
    const grid = UI.el("div", "badge-grid");
    CONFIG.badges.forEach((b) => {
      const on = !!S.badges[b.id];
      const it = UI.el("div", "badge" + (on ? " on" : ""));
      it.appendChild(UI.el("div", "badge-icon", on ? "★" : "☆"));
      it.appendChild(UI.el("div", "badge-name", b.name));
      it.appendChild(UI.el("div", "badge-desc", b.desc));
      grid.appendChild(it);
    });
    UI.modal({ title: UI.t("badgesTitle"), body: grid, className: "modal-badges", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
  };

  // ---------------- Nhiệm vụ tuần ----------------
  Fun.weekKey = function () {
    const d = new Date();
    const back = (d.getDay() + 6) % 7;   // thứ Hai đầu tuần
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate() - back);
    return m.getFullYear() + "-" + pad(m.getMonth() + 1) + "-" + pad(m.getDate());
  };
  Fun.weeklyDef = function (id) {
    const w = CONFIG.weeklyQuests.find((x) => x.id === id);
    const q = CONFIG.quests.find((x) => x.id === id);
    return Object.assign({}, q, w);
  };
  Fun.weekly = function () {
    const S = BT.Save.state;
    const key = this.weekKey();
    if (S.weekly.week !== key || !S.weekly.list.length) {
      const lv = BT.MS ? BT.MS.current().level : 1;
      const pool = CONFIG.weeklyQuests.filter((q) => (q.fromDay || 1) <= lv);
      const list = [];
      while (list.length < CONFIG.weeklyCount && pool.length) {
        const q = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        list.push({ id: q.id, progress: 0 });
      }
      S.weekly = { week: key, list, claimed: false };
      BT.Save.persist();
    }
    return S.weekly;
  };
  Fun.weeklyAdd = function (stat, value) {
    const w = this.weekly();
    w.list.forEach((q) => {
      if (q.id !== stat) return;
      const def = this.weeklyDef(q.id);
      q.progress = def.best ? Math.max(q.progress, value) : q.progress + value;
    });
  };
  Fun.weeklyDone = function () { const w = this.weekly(); return w.list.length > 0 && w.list.every((q) => q.progress >= this.weeklyDef(q.id).n); };
  Fun.nextWeeklyDecor = function () { const S = BT.Save.state; return CONFIG.decor.find((d) => d.weekly && !S.decor.includes(d.id)) || null; };
  Fun.claimWeekly = function () {
    const S = BT.Save.state;
    const w = this.weekly();
    if (w.claimed || !this.weeklyDone()) return null;
    w.claimed = true;
    const d = this.nextWeeklyDecor();
    if (d) S.decor.push(d.id); else S.wallet += CONFIG.weeklyRewardCoins;
    BT.Save.persist();
    return d ? { decor: d.id, name: d.name } : { coins: CONFIG.weeklyRewardCoins };
  };
  Fun.openWeekly = function (onDone) {
    const w = this.weekly();
    const body = UI.el("div", "weekly");
    w.list.forEach((q) => {
      const def = this.weeklyDef(q.id);
      const row = UI.el("div", "quest-row wq-row");
      const n = def.n;
      row.appendChild(UI.el("div", "quest-text", UI.fmt(def.text, { n, x: UI.money(n) })));
      row.appendChild(UI.el("div", "quest-prog", Math.min(q.progress, n) + "/" + n));
      body.appendChild(row);
    });
    const d = this.nextWeeklyDecor();
    body.appendChild(UI.el("div", "info-note", w.claimed ? UI.t("weekClaimed") : d ? UI.t("weekReward", { name: d.name }) : UI.t("weekRewardCoins", { x: UI.money(CONFIG.weeklyRewardCoins) })));
    const buttons = [];
    if (!w.claimed && this.weeklyDone()) buttons.push({ label: UI.t("weekClaim"), cls: "btn-pink", onClick: () => { const r = this.claimWeekly(); if (r) { UI.confetti(60); UI.toast(r.name ? UI.t("weekGot", { name: r.name }) : UI.t("weekGot", { name: UI.money(r.coins) }), 2600); } if (onDone) onDone(); } });
    buttons.push({ label: UI.t("btnClose"), cls: buttons.length ? "btn-white" : "btn-pink" });
    UI.modal({ title: UI.t("weekTitle"), body, className: "modal-weekly", dismissable: true, buttons });
  };

  // ---------------- Món sáng tạo ----------------
  const CD = () => CONFIG.customDish;
  Fun.level = function () { return BT.MS ? BT.MS.current().level : 1; };
  // Quầy được tạo món: trộn/cuốn/chè, đã mở theo cấp
  Fun.customZones = function () {
    const lv = this.level();
    return CONFIG.zones.filter((z) => CD().zones.includes(z.id) && z.openDay <= lv && CONFIG.build.playableZones.includes(z.id)).map((z) => z.id);
  };
  // Nguyên liệu được chọn cho quầy (trừ đế & bước kết thúc của quầy đó)
  Fun.customIngs = function (zone) {
    const lv = this.level();
    const roles = CONFIG.zoneRoles[zone] || { base: [], finish: [] };
    const skip = roles.base.concat(roles.finish, CD().finish[zone] || []);
    return Object.keys(CONFIG.ingredients).filter((id) => { const g = CONFIG.ingredients[id]; return g.zones.includes(zone) && g.openDay <= lv && !skip.includes(id); });
  };
  Fun.customPrice = function (zone, toppings) {
    const base = CONFIG.zoneRoles[zone].base[0];
    const all = [base].concat(toppings, (CD().finish[zone] || []).filter((x) => CONFIG.ingredients[x]));
    const cost = all.reduce((s, id) => s + CONFIG.ingredients[id].price / 5, 0);
    return Math.round(cost * CD().priceMult + CD().priceAdd);
  };
  Fun.customRecipe = function (id) {
    const c = (BT.Save.state.customs || []).find((x) => x.id === id);
    if (!c) return undefined;
    return { id: c.id, name: c.name, short: c.name, emoji: CD().emoji[c.zone], zone: c.zone, base: CONFIG.zoneRoles[c.zone].base[0],
      toppings: c.toppings.slice(), finish: CD().finish[c.zone].slice(), price: this.customPrice(c.zone, c.toppings), openDay: 1, custom: true };
  };
  Fun.customRecipes = function () { return (BT.Save.state.customs || []).map((c) => this.customRecipe(c.id)); };
  Fun.createCustom = function ({ zone, name, toppings }) {
    const S = BT.Save.state;
    const nm = String(name || "").trim();
    const tp = (toppings || []).slice();
    if (S.customs.length >= CD().max) return { ok: false, why: "full" };
    if (!this.customZones().includes(zone)) return { ok: false, why: "zone" };
    if (!nm || nm.length > CD().nameMax) return { ok: false, why: "name" };
    if (tp.length < CD().minIng || tp.length > CD().maxIng || new Set(tp).size !== tp.length) return { ok: false, why: "count" };
    const okIngs = this.customIngs(zone);
    if (!tp.every((id) => okIngs.includes(id))) return { ok: false, why: "ing" };
    let n = 0;
    while (S.customs.some((c) => c.id === "custom_" + n)) n++;
    const id = "custom_" + n;
    S.customs.push({ id, zone, name: nm, toppings: tp });
    BT.Save.persist();
    return { ok: true, id };
  };
  Fun.deleteCustom = function (id) {
    const S = BT.Save.state;
    S.customs = S.customs.filter((c) => c.id !== id);
    BT.Save.persist();
  };
  Fun.openKitchen = function () {
    const S = BT.Save.state;
    const body = UI.el("div", "kitchen");
    body.appendChild(UI.el("div", "info-note", UI.t("kitchenIntro", { n: CD().max })));
    S.customs.forEach((c) => {
      const r = this.customRecipe(c.id);
      const row = UI.el("div", "custom-row");
      const txt = UI.el("div", "custom-txt");
      txt.appendChild(UI.el("div", "custom-name", r.emoji + " " + r.name + " · " + UI.money(r.price)));
      txt.appendChild(UI.el("div", "custom-ings", r.toppings.map((id) => UI.ing(id).short).join(", ")));
      row.appendChild(txt);
      row.appendChild(UI.button(UI.t("kitchenDelete"), "btn-white small", () => { this.deleteCustom(c.id); UI.closeAllModals(); this.openKitchen(); }));
      body.appendChild(row);
    });
    const full = S.customs.length >= CD().max;
    const nb = UI.button(full ? UI.t("kitchenFull") : UI.t("kitchenNew"), "btn-pink small new-custom", () => { if (full) return; UI.closeAllModals(); this.openNewCustom(); });
    if (full) nb.disabled = true;
    body.appendChild(nb);
    UI.modal({ title: UI.t("kitchenTitle"), body, className: "modal-kitchen", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-white" }] });
  };
  Fun.openNewCustom = function () {
    const zones = this.customZones();
    let zone = zones[0];
    let picked = [];
    const body = UI.el("div", "kitchen-new");
    const input = document.createElement("input");
    input.type = "text"; input.maxLength = CD().nameMax; input.placeholder = UI.t("kitchenNamePh"); input.className = "kitchen-name";
    body.appendChild(input);
    const zrow = UI.el("div", "kitchen-zones");
    const chipsBox = UI.el("div", "ing-chips");
    const price = UI.el("div", "kitchen-price");
    const draw = () => {
      zrow.innerHTML = "";
      zones.forEach((z) => {
        const zc = CONFIG.zones.find((x) => x.id === z);
        zrow.appendChild(UI.button(zc.icon + " " + zc.name, "btn-white small zone-chip" + (z === zone ? " on" : ""), () => { zone = z; picked = []; draw(); }));
      });
      chipsBox.innerHTML = "";
      this.customIngs(zone).forEach((id) => {
        const k = picked.indexOf(id);
        const g = UI.ing(id);
        const chip = UI.button((k >= 0 ? (k + 1) + ". " : "") + g.emoji + " " + g.short, "btn-white small ing-chip" + (k >= 0 ? " on" : ""), () => {
          if (k >= 0) picked.splice(k, 1); else if (picked.length < CD().maxIng) picked.push(id);
          draw();
        });
        chipsBox.appendChild(chip);
      });
      price.textContent = UI.t(zone === "che" ? "kitchenHintChe" : "kitchenHint", { a: CD().minIng, b: CD().maxIng }) + (picked.length ? " · " + UI.money(this.customPrice(zone, picked)) : "");
    };
    body.appendChild(zrow);
    body.appendChild(chipsBox);
    body.appendChild(price);
    draw();
    UI.modal({ title: UI.t("kitchenNew"), body, className: "modal-kitchen-new", dismissable: true, buttons: [
      { label: UI.t("kitchenSave"), cls: "btn-pink", keepOpen: true, onClick: (api) => {
        const r = this.createCustom({ zone, name: input.value, toppings: picked });
        if (!r.ok) { UI.toast(UI.t("kitchenErr_" + r.why, { a: CD().minIng, b: CD().maxIng, n: CD().nameMax })); return; }
        api.close(true);
        UI.toast(UI.t("kitchenMade", { name: input.value.trim() }), 2400);
        this.openKitchen();
      } },
      { label: UI.t("btnClose"), cls: "btn-white" }
    ] });
  };

  // ---------------- Hẹn hò sau ca (lật thẻ) ----------------
  Fun.dateGame = function (onEnd) {
    const DG = CONFIG.dateGame;
    const S = BT.Save.state;
    const keys = [];
    for (let i = 0; i < DG.pairs; i++) keys.push(i, i);
    for (let i = keys.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [keys[i], keys[j]] = [keys[j], keys[i]]; }
    const body = UI.el("div", "date-game");
    const timer = UI.el("div", "date-timer", "");
    body.appendChild(timer);
    const grid = UI.el("div", "date-grid");
    body.appendChild(grid);
    const gm = { over: false, won: false, left: DG.seconds, open: [], matched: 0 };
    let api = null;
    let iv = null;
    const draw = () => { timer.textContent = UI.t("dateTimer", { n: Math.ceil(gm.left) }); };
    const end = (won) => {
      if (gm.over) return;
      gm.over = true; gm.won = won;
      clearInterval(iv);
      if (api) api.close(true);
      const box = UI.el("div", "date-end");
      if (won) {
        S.wallet += DG.reward;
        S.life.datesWon++;
        const notes = window.PERSONAL.dateNotes || [];
        let note = null;
        if (S.datesNotes.length < notes.length) { S.datesNotes.push(S.datesNotes.length); note = notes[S.datesNotes.length - 1]; }
        BT.Save.persist();
        box.appendChild(UI.el("div", "date-note", note ? UI.fmt(note) : UI.t("dateAllNotes")));
        box.appendChild(UI.el("div", "date-reward", UI.t("dateReward", { x: UI.money(DG.reward) })));
        UI.confetti(50);
        BT.Audio.play("letter");
      } else {
        box.appendChild(UI.el("div", "date-note", UI.pick(window.PERSONAL.dateLose || [UI.t("dateLose")])));
      }
      UI.modal({ title: UI.t(won ? "dateWinTitle" : "dateLoseTitle"), body: box, className: won ? "modal-date-win" : "modal-date-lose", dismissable: true,
        buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      if (onEnd) onEnd(won);
    };
    gm.tick = (dt) => { if (gm.over) return; gm.left -= dt; draw(); if (gm.left <= 0) end(false); };
    keys.forEach((k) => {
      const c = UI.el("button", "mcard");
      c.type = "button";
      c.dataset.k = String(k);
      const face = UI.el("span", "mface", DG.icons[k]);
      c.appendChild(UI.el("span", "mback", "?"));
      c.appendChild(face);
      c.addEventListener("click", () => {
        if (gm.over || c.classList.contains("up") || gm.open.length >= 2) return;
        c.classList.add("up");
        BT.Audio.play("pop");
        gm.open.push(c);
        if (gm.open.length < 2) return;
        const [a, b] = gm.open;
        if (a.dataset.k === b.dataset.k) {
          a.classList.add("done"); b.classList.add("done");
          gm.open = [];
          gm.matched++;
          if (gm.matched >= DG.pairs) setTimeout(() => end(true), 250);
        } else {
          setTimeout(() => { a.classList.remove("up"); b.classList.remove("up"); gm.open = []; }, DG.flipBackMs);
        }
      });
      grid.appendChild(c);
    });
    draw();
    api = UI.modal({ title: UI.t("dateTitle"), body, className: "modal-date", dismissable: false, buttons: [] });
    iv = setInterval(() => { if (!document.body.contains(grid)) { clearInterval(iv); return; } gm.tick(1); }, 1000);
    return gm;
  };
  Fun.openDateBook = function () {
    const S = BT.Save.state;
    const notes = window.PERSONAL.dateNotes || [];
    const list = UI.el("div", "fb-list");
    notes.forEach((n, i) => {
      const got = S.datesNotes.includes(i);
      const row = UI.el("div", "fb-item " + (got ? "solved" : "locked"));
      if (got) { row.appendChild(UI.el("div", "fb-answer", UI.t("dateNoteN", { n: i + 1 }))); row.appendChild(UI.el("div", "fb-line", UI.fmt(n))); }
      else row.appendChild(UI.el("div", "fb-locked", "🔒 " + UI.t("dateLocked")));
      list.appendChild(row);
    });
    UI.modal({ title: UI.t("dateBookTitle"), body: list, className: "modal-flirt-book modal-dates", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
  };

  BT.Fun = Fun;
})();
