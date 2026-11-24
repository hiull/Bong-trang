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

  BT.Fun = Fun;
})();
