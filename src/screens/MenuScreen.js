// MenuScreen.js — Màn hình chính: biển hiệu, số ngày bên nhau, các nút chính.
// Giai đoạn 1: Mở tiệm hoạt động. Điểm danh, nhiệm vụ, cài đặt, skin sẽ có ở Giai đoạn 4–6.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Menu = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const P = window.PERSONAL;
      const el = UI.el("div", "screen menu");

      // Góc trên
      const top = UI.el("div", "menu-top");
      const stats = UI.el("div", "menu-stats");
      stats.appendChild(UI.el("div", "pill", "🪙 " + UI.money(S.wallet)));
      const ratings = Object.values(S.days).map((d) => d.avgRating).filter((x) => x > 0);
      stats.appendChild(UI.el("div", "pill", "⭐ " + (ratings.length ? UI.rating(ratings.reduce((a, b) => a + b, 0) / ratings.length) : "–")));
      stats.appendChild(UI.el("div", "pill", UI.t("goldHearts", { a: S.goldHearts, b: CONFIG.build.maxPlayableDay })));
      top.appendChild(stats);
      top.appendChild(UI.iconButton("⚙️", UI.t("btnSettings"), () => UI.toast(UI.t("comingSoonShort")), "settings-btn"));
      el.appendChild(top);

      // Mặt tiền
      const facade = UI.el("div", "menu-facade");
      facade.appendChild(UI.el("div", "awning"));
      facade.appendChild(UI.el("div", "lights"));
      facade.appendChild(UI.el("div", "flowers"));
      facade.appendChild(UI.el("div", "menu-sign", P.shopName));
      facade.appendChild(UI.el("div", "love-days", UI.t("loveDays", { n: UI.loveDays() })));
      facade.appendChild(UI.el("div", "shop-title", "🏷️ " + UI.fmt(CONFIG.titles[0].name)));
      const owner = UI.el("div", "owner");
      owner.appendChild(UI.el("div", "owner-avatar", "👩‍🍳"));
      owner.appendChild(UI.el("div", "owner-name", UI.t("ownerLabel")));
      facade.appendChild(owner);
      const pet = UI.el("div", "menu-pet", "🐈");
      pet.appendChild(UI.el("span", "pet-z", "💤"));
      facade.appendChild(pet);
      el.appendChild(facade);

      // Nút chính
      const main = UI.el("div", "menu-buttons");
      main.appendChild(UI.button(UI.t("btnOpenShop"), "btn-pink big", () => router.go("Map")));
      main.appendChild(UI.button(UI.t("btnUpgrade"), "btn-orange big", () => router.go("Shop")));
      main.appendChild(UI.button(UI.t("btnMemories"), "btn-purple big", () => router.go("Album")));
      el.appendChild(main);

      const small = UI.el("div", "menu-small");
      small.appendChild(UI.button(UI.t("btnReviews"), "btn-white small", () => router.go("Review")));
      small.appendChild(UI.button(UI.t("btnCheckin"), "btn-white small", () => UI.toast(UI.t("comingSoonShort"))));
      small.appendChild(UI.button(UI.t("btnQuests"), "btn-white small", () => UI.toast(UI.t("comingSoonShort"))));
      el.appendChild(small);

      el.appendChild(UI.el("div", "footer", UI.t("footer")));
      root.appendChild(el);

      // Ngày đặc biệt: 11/01 hằng năm hoặc tròn bội số 100 ngày yêu → pháo hoa + banner
      const ann = String(P.anniversary).split("-").map(Number);
      const now = new Date();
      const n = UI.loveDays();
      if ((now.getMonth() + 1 === ann[1] && now.getDate() === ann[2]) || (n > 0 && n % 100 === 0)) {
        facade.appendChild(UI.el("div", "special-banner", UI.t("specialDayBanner")));
        setTimeout(() => UI.confetti(80), 500);
      }

      // Lần đầu mở game: popup chào mừng → vào thẳng Chuẩn bị Ngày 1
      if (!BT.Save.available) UI.toast(UI.t("privateMode"), 3200);
      if (!S.welcomeSeen) {
        S.welcomeSeen = true;
        BT.Save.persist();
        UI.modal({
          title: UI.t("welcomeTitle"),
          body: P.welcomeMessage,
          className: "modal-welcome",
          buttons: [{ label: UI.t("btnWelcome"), cls: "btn-pink", onClick: () => router.go("Prep", { day: 1 }) }]
        });
      }

      return { destroy() { UI.closeAllModals(); } };
    }
  };
})();
