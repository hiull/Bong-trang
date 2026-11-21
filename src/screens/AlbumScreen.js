// AlbumScreen.js — Album 15 kỷ niệm & phiếu hẹn hò (Giai đoạn 3).
// Giai đoạn 1: màn tạm, chỉ có nút Quay lại và lời nhắn "sắp có".
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Album = {
    mount(root, params, router) {
      const el = UI.el("div", "screen stub");
      el.appendChild(UI.topbar(UI.t("btnMemories"), () => router.back()));
      const box = UI.el("div", "stub-box");
      box.appendChild(UI.el("div", "stub-icon", "💌"));
      box.appendChild(UI.el("p", "stub-text", UI.t("comingSoon")));
      el.appendChild(box);
      root.appendChild(el);
      return { destroy() {} };
    }
  };
})();
