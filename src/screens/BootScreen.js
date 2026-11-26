// BootScreen.js — Tải trước font & tài nguyên, thanh loading.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Boot = {
    mount(root, params, router) {
      const G = CONFIG.gameplay;
      const scope = UI.scope();
      const el = UI.el("div", "screen boot");
      const icon = UI.el("div", "boot-icon", "🥗");
      const bar = UI.el("div", "load-track");
      const fill = UI.el("div", "load-fill");
      bar.appendChild(fill);
      const label = UI.el("div", "load-label");
      el.appendChild(icon);
      el.appendChild(UI.el("div", "boot-title", window.PERSONAL.shopName));
      el.appendChild(bar);
      el.appendChild(label);
      root.appendChild(el);

      let shown = 0;
      let target = 30;
      const set = (p) => {
        fill.style.width = p + "%";
        UI.setText(label, UI.t("loading", { p: Math.round(p) }));
      };
      set(0);

      const tick = () => {
        shown += (target - shown) * 0.3 + 0.6;
        if (shown > target) shown = target;
        set(shown);
        if (shown >= 100) {
          scope.timeout(() => router.go("Menu", {}, { replace: true }), 80);
          return;
        }
        scope.timeout(tick, 20);
      };
      tick();

      // Chờ font tối đa vài giây; quá giờ thì dùng font dự phòng của hệ thống.
      const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      const timeout = new Promise((res) => setTimeout(res, G.fontWaitMaxSec * 1000));
      const minTime = new Promise((res) => setTimeout(res, G.bootMinSec * 1000));
      Promise.race([fontsReady, timeout]).then(() => {
        target = 80;
        return minTime;
      }).then(() => { target = 100; });

      return { destroy() { scope.clear(); } };
    }
  };
})();
