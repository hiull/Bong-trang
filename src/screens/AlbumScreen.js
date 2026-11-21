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
