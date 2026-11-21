// ReviewScreen.js — Sổ đánh giá của khách & trả lời đánh giá (Giai đoạn 4).
// Giai đoạn 1: màn tạm, chỉ có nút Quay lại và lời nhắn "sắp có".
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Review = {
    mount(root, params, router) {
      const el = UI.el("div", "screen stub");
      el.appendChild(UI.topbar(UI.t("btnReviews"), () => router.back()));
      const box = UI.el("div", "stub-box");
      box.appendChild(UI.el("div", "stub-icon", "⭐"));
      box.appendChild(UI.el("p", "stub-text", UI.t("comingSoon")));
      el.appendChild(box);
      root.appendChild(el);
      return { destroy() {} };
    }
  };
})();
