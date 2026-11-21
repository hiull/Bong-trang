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
      el.appendChild(info);

      const scroll = UI.el("div", "album-scroll");
      // Sổ thính của anh Hiếu
      const fc = BT.Flirt.count();
      const fbook = UI.el("button", "flirt-book-card");
      fbook.type = "button";
      fbook.appendChild(UI.el("span", "fb-icon", "😈"));
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
