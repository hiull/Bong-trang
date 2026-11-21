// MapScreen.js — Bản đồ 15 Ngày bán hàng + Ngày bí mật. Ngày 1 ở dưới cùng.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  function isPlayable(day) {
    const S = BT.Save.state;
    if (day === "secret") return CONFIG.build.secretPlayable && S.endingSeen;
    return day <= S.unlockedDay && day <= CONFIG.build.maxPlayableDay;
  }

  function dayInfo(dc) {
    const box = UI.el("div", "day-info");
    const w = CONFIG.weathers[dc.weather];
    box.appendChild(UI.el("div", "info-line", UI.t("forecast", { icon: w.icon, weather: w.label, c: dc.customers })));
    if (w.note) box.appendChild(UI.el("div", "info-note", w.note));
    if (dc.cannotLose) box.appendChild(UI.el("div", "info-note", UI.t("secretInfo")));
    box.appendChild(UI.el("div", "info-line", UI.t("target") + ": " + (dc.target ? UI.money(dc.target) : UI.t("noTarget"))));
    const names = (dc.unlock || []).map((id) => UI.recipe(id).name);
    box.appendChild(UI.el("div", "info-line", names.length ? UI.t("newDishes", { list: names.join(", ") }) : UI.t("noNewDishes")));
    return box;
  }

  BT.Screens.Map = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const el = UI.el("div", "screen map");
      el.appendChild(UI.topbar(UI.t("mapTitle"), () => router.back()));
      const scroll = UI.el("div", "map-scroll");
      const path = UI.el("div", "map-path");
      let focus = null;

      const days = CONFIG.days.slice().reverse();
      days.forEach((dc, i) => {
        const d = dc.day;
        const secret = d === "secret";
        const node = UI.el("button", "map-node" + (secret ? " secret" : ""));
        node.type = "button";
        node.style.setProperty("--offset", (i % 2 === 0 ? -1 : 1) * (i % 4 < 2 ? 22 : 12) + "%");
        const playable = isPlayable(d);
        const rec = S.days[d];
        if (!playable) node.classList.add("locked");
        if (rec && rec.stars > 0) node.classList.add("cleared");
        node.appendChild(UI.el("span", "node-weather", CONFIG.weathers[dc.weather].icon));
        node.appendChild(UI.el("span", "node-label", secret ? "★" : String(d)));
        const stars = UI.el("span", "node-stars");
        const n = rec ? rec.stars : 0;
        stars.textContent = secret ? "" : "★".repeat(n) + "☆".repeat(3 - n);
        node.appendChild(stars);
        if (!playable) node.appendChild(UI.el("span", "node-lock", "🔒"));
        node.addEventListener("click", () => {
          if (!playable) {
            if (secret) UI.toast(UI.t("secretLocked"));
            else if (d > S.unlockedDay) UI.toast(UI.t("dayLockedPrev", { p: d - 1 }));
            else UI.toast(UI.t("dayLockedBuild", { n: d }));
            return;
          }
          BT.Audio.play("tap");
          UI.modal({
            title: secret ? UI.t("secretDay") : UI.t("dayN", { n: d }),
            body: dayInfo(dc),
            dismissable: true,
            buttons: [{ label: UI.t("btnPrepare"), cls: "btn-pink", onClick: () => router.go("Prep", { day: d }) }]
          });
        });
        path.appendChild(node);
        if (playable) focus = node;
      });
      scroll.appendChild(path);
      el.appendChild(scroll);
      root.appendChild(el);

      // Tự cuộn tới ngày mới nhất
      requestAnimationFrame(() => {
        if (focus) scroll.scrollTop = focus.offsetTop - scroll.clientHeight / 2 + focus.offsetHeight / 2;
      });

      return { destroy() { UI.closeAllModals(); } };
    }
  };

  BT.MapHelpers = { dayInfo };
})();
