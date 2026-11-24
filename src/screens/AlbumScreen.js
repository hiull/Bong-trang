// AlbumScreen.js — Album 15 kỷ niệm & phiếu hẹn hò (lưới 3 cột × 5 hàng),
// thẻ lời nhắn bí mật khi đủ 15 Trái tim vàng.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Album = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const P = window.PERSONAL;
      const total = P.memories.length;
      const unlocked = S.memoriesUnlocked.slice().sort((a, b) => a - b);
      const maxDay = CONFIG.build.maxPlayableDay;

      const el = UI.el("div", "screen album");
      el.appendChild(UI.topbar(UI.t("albumTitle"), () => router.back()));
      const info = UI.el("div", "album-info");
      info.appendChild(UI.el("div", "pill", UI.t("albumCount", { a: unlocked.length, b: total })));
      info.appendChild(UI.el("div", "pill gold", UI.t("goldHearts", { a: S.goldHearts, b: maxDay })));
      if (S.s2 && S.s2.started) info.appendChild(UI.el("div", "pill gold", UI.t("goldHearts2", { a: S.s2.goldHearts, b: maxDay })));
      el.appendChild(info);

      const scroll = UI.el("div", "album-scroll");
      // Sổ thính của anh Hiếu
      const fc = BT.Flirt.count();
      const fbook = UI.el("button", "flirt-book-card");
      fbook.type = "button";
      fbook.appendChild(UI.el("span", "fb-icon", "💌"));
      fbook.appendChild(UI.el("span", "fb-label", UI.t("flirtBookCount", { a: fc.solved, b: fc.total })));
      fbook.addEventListener("click", () => {
        BT.Audio.play("pop");
        const list = UI.el("div", "fb-list");
        BT.Flirt.list().forEach((it, i) => {
          const how = S.flirt.solved[i];
          const row = UI.el("div", "fb-item " + (how ? "solved" : "locked"));
          if (!how) {
            row.appendChild(UI.el("div", "fb-locked", "🔒 " + UI.t("flirtLocked")));
          } else {
            it.lines.forEach((l) => row.appendChild(UI.el("div", "fb-line", l)));
            const ans = UI.el("div", "fb-answer", "→ " + it.answers[0]);
            if (how === "told") ans.appendChild(UI.el("span", "fb-told", UI.t("flirtByHim")));
            row.appendChild(ans);
          }
          list.appendChild(row);
        });
        UI.modal({ title: UI.t("flirtBookTitle"), body: list, className: "modal-flirt-book", dismissable: true,
          buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      });
      scroll.appendChild(fbook);
      const bdone = CONFIG.badges.filter((b) => S.badges[b.id]).length;
      const bbook = UI.el("button", "flirt-book-card badges-card");
      bbook.type = "button";
      bbook.appendChild(UI.el("span", "fb-icon", "⭐"));
      bbook.appendChild(UI.el("span", "fb-label", UI.t("badgesCount", { a: bdone, b: CONFIG.badges.length })));
      bbook.addEventListener("click", () => { BT.Audio.play("pop"); BT.Fun.openBadges(); });
      scroll.appendChild(bbook);
      const dbook = UI.el("button", "flirt-book-card dates-card");
      dbook.type = "button";
      dbook.appendChild(UI.el("span", "fb-icon", "💕"));
      dbook.appendChild(UI.el("span", "fb-label", UI.t("dateBookCount", { a: S.datesNotes.length, b: (window.PERSONAL.dateNotes || []).length })));
      dbook.addEventListener("click", () => { BT.Audio.play("pop"); BT.Fun.openDateBook(); });
      scroll.appendChild(dbook);
      // Sổ lời nhắn (Thử thách hôm nay)
      const notes = (P.dailyNotes || []);
      const seen = [...new Set(S.daily.notesSeen)].sort((a, b) => a - b);
      const nbook = UI.el("button", "flirt-book-card notes-book-card");
      nbook.type = "button";
      nbook.appendChild(UI.el("span", "fb-icon", "💌"));
      nbook.appendChild(UI.el("span", "fb-label", UI.t("notesBookCount", { a: seen.length })));
      nbook.addEventListener("click", () => {
        BT.Audio.play("pop");
        const list = UI.el("div", "fb-list");
        if (!seen.length) list.appendChild(UI.el("div", "fb-locked", UI.t("notesBookEmpty")));
        seen.forEach((i) => { if (notes[i]) list.appendChild(UI.el("div", "fb-item solved nb-item", UI.fmt(notes[i]))); });
        UI.modal({ title: UI.t("notesBookTitle"), body: list, className: "modal-flirt-book modal-notes-book", dismissable: true,
          buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      });
      scroll.appendChild(nbook);
      // Chuyện vặt (qua mốc nhỏ)
      const tales = (P.minorTales || []);
      const tSeen = [...new Set(S.talesSeen)].sort((a, b) => a - b);
      const tbook = UI.el("button", "flirt-book-card tales-book-card");
      tbook.type = "button";
      tbook.appendChild(UI.el("span", "fb-icon", "★"));
      tbook.appendChild(UI.el("span", "fb-label", UI.t("talesBookCount", { a: tSeen.length })));
      tbook.addEventListener("click", () => {
        BT.Audio.play("pop");
        const list = UI.el("div", "fb-list");
        if (!tSeen.length) list.appendChild(UI.el("div", "fb-locked", UI.t("talesBookEmpty")));
        tSeen.forEach((i) => {
          const t = tales[i];
          if (!t) return;
          const row = UI.el("div", "fb-item solved tb-item");
          row.appendChild(UI.el("div", "fb-answer", UI.fmt(t.who)));
          row.appendChild(UI.el("div", "fb-line", UI.fmt(t.text)));
          list.appendChild(row);
        });
        UI.modal({ title: UI.t("talesBookTitle"), body: list, className: "modal-flirt-book modal-tales-book", dismissable: true,
          buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      });
      scroll.appendChild(tbook);
      // Anh Hiếu phụ tiệm
      if (S.helper && S.helper.unlocked) {
        const hc = UI.el("button", "flirt-book-card helper-card");
        hc.type = "button";
        hc.appendChild(UI.icon("tomortle"));
        hc.appendChild(UI.el("span", "fb-label", UI.t("helperTitle") + " · " + UI.t("helperLevel", { n: BT.Helper.level(), s: S.helper.shifts })));
        hc.addEventListener("click", () => {
          BT.Audio.play("pop");
          const list = UI.el("div", "fb-list");
          (P.helperChapters || []).forEach((c, i) => {
            const row = UI.el("div", "fb-item " + (i < S.helper.chapters ? "solved" : "locked"));
            if (i < S.helper.chapters) { row.appendChild(UI.el("div", "fb-answer", UI.t("helperChapterTitle", { n: i + 1 }))); row.appendChild(UI.el("div", "fb-line", UI.fmt(c.text))); }
            else row.appendChild(UI.el("div", "fb-locked", "🔒 " + UI.t("helperLocked")));
            list.appendChild(row);
          });
          UI.modal({ title: UI.t("helperTitle"), body: list, className: "modal-flirt-book modal-helper", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
        });
        scroll.appendChild(hc);
      }
      // Mùa 2: Sổ công thức + kỷ niệm Mùa 2 (tự mở cho mốc lớn đã qua nếu người tặng thêm sau)
      if (S.s2 && S.s2.started) {
        const MS = BT.MS;
        const st2 = MS.stateOf(2);
        const m2 = P.memories2 || [];
        MS.season(2).majorDays.forEach((d, ci) => {
          if (m2[ci] && st2.cleared >= MS.majorIndex(d, 2) && !S.s2.memories.includes(ci)) S.s2.memories.push(ci);
        });
        BT.Save.persist();
        const cards = P.recipeCards2 || [];
        const cbook = UI.el("button", "flirt-book-card cards2-book-card");
        cbook.type = "button";
        cbook.appendChild(UI.el("span", "fb-icon", "🍧"));
        cbook.appendChild(UI.el("span", "fb-label", UI.t("cards2Count", { a: S.s2.cards.length, b: cards.length })));
        cbook.addEventListener("click", () => {
          BT.Audio.play("pop");
          const list = UI.el("div", "fb-list");
          cards.forEach((c, i) => {
            const row = UI.el("div", "fb-item " + (S.s2.cards.includes(i) ? "solved" : "locked"));
            if (S.s2.cards.includes(i)) { row.appendChild(UI.el("div", "fb-answer", c.title)); row.appendChild(UI.el("div", "fb-line", UI.fmt(c.text))); }
            else row.appendChild(UI.el("div", "fb-locked", "🔒 " + UI.t("cards2Locked")));
            list.appendChild(row);
          });
          UI.modal({ title: UI.t("cards2Title"), body: list, className: "modal-flirt-book modal-cards2", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
        });
        scroll.appendChild(cbook);
        const open2 = S.s2.memories.filter((i) => m2[i]).sort((a, b) => a - b);
        if (open2.length) {
          scroll.appendChild(UI.el("div", "section-title", UI.t("memories2Title")));
          const g2 = UI.el("div", "album-grid memories2-grid");
          open2.forEach((i) => {
            const c = UI.el("button", "album-card open");
            c.type = "button";
            c.appendChild(UI.memoryPhoto(m2[i], "thumb"));
            c.appendChild(UI.el("div", "album-card-title", m2[i].title));
            c.addEventListener("click", () => UI.openMemory(i, { list: open2, mems: m2 }));
            g2.appendChild(c);
          });
          scroll.appendChild(g2);
        }
      }
      // Lời nhắn bí mật
      const bonus = UI.el("button", "bonus-card" + (S.goldHearts >= maxDay ? " open" : ""));
      bonus.type = "button";
      bonus.appendChild(UI.el("div", "bonus-title", UI.t("bonusCard")));
      bonus.appendChild(UI.el("div", "bonus-sub", S.goldHearts >= maxDay ? "💌" : UI.t("bonusLocked")));
      bonus.addEventListener("click", () => {
        if (S.goldHearts < maxDay) { UI.toast(UI.t("bonusLocked")); return; }
        UI.modal({ title: UI.t("bonusTitle"), body: P.bonusMessage, className: "modal-welcome", dismissable: true,
          buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      });
      scroll.appendChild(bonus);
      if (S.s2 && S.s2.started) {
        const open2 = S.s2.goldHearts >= maxDay;
        const b2 = UI.el("button", "bonus-card bonus-card-2" + (open2 ? " open" : ""));
        b2.type = "button";
        b2.appendChild(UI.el("div", "bonus-title", UI.t("bonusCard2")));
        b2.appendChild(UI.el("div", "bonus-sub", open2 ? "💌" : UI.t("bonusLocked2")));
        b2.addEventListener("click", () => {
          if (!open2) { UI.toast(UI.t("bonusLocked2")); return; }
          UI.modal({ title: UI.t("bonusCard2"), body: P.bonusMessage2, className: "modal-welcome", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
        });
        scroll.appendChild(b2);
      }

      const grid = UI.el("div", "album-grid");
      P.memories.forEach((m, i) => {
        const open = unlocked.includes(i);
        const card = UI.el("button", "album-card" + (open ? " open" : " locked"));
        card.type = "button";
        if (open) {
          card.appendChild(UI.memoryPhoto(m, "thumb"));
          card.appendChild(UI.el("div", "album-card-title", m.title));
        } else {
          card.appendChild(UI.el("div", "album-env", "✉️"));
          card.appendChild(UI.el("div", "album-lock", "🔒"));
          card.appendChild(UI.el("div", "album-card-title", UI.t("memoryLocked", { n: i + 1 })));
        }
        card.addEventListener("click", () => {
          if (!open) { UI.toast(UI.t("memoryLocked", { n: i + 1 })); return; }
          BT.Audio.play("pop");
          UI.openMemory(i, { list: unlocked });
        });
        grid.appendChild(card);
      });
      scroll.appendChild(grid);
      el.appendChild(scroll);
      root.appendChild(el);
      return { destroy() { UI.closeAllModals(); } };
    }
  };
})();
