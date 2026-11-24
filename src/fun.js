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

  BT.Fun = Fun;
})();
