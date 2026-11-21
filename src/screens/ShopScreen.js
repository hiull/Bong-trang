// ShopScreen.js — Cửa hàng nâng cấp, trang trí, thú cưng & skin theo mùa (Giai đoạn 4).
// Giai đoạn 1: màn tạm, chỉ có nút Quay lại và lời nhắn "sắp có".
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Shop = {
    mount(root, params, router) {
      const el = UI.el("div", "screen stub");
      el.appendChild(UI.topbar(UI.t("btnUpgrade"), () => router.back()));
      const box = UI.el("div", "stub-box");
      box.appendChild(UI.el("div", "stub-icon", "🛠️"));
      box.appendChild(UI.el("p", "stub-text", UI.t("comingSoon")));
      el.appendChild(box);
      root.appendChild(el);
      return { destroy() {} };
    }
  };
})();
