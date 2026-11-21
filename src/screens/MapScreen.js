// MapScreen.js — Đường mốc: 30 mốc (15 lớn + mốc nhỏ xen kẽ) từ dưới lên, Ca bí mật trên cùng.
// Thẻ "Mốc hiện tại" dính trên đầu: thanh tiến độ + nút Mở ca bán.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

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

  // Thông tin mốc (không phải của một ca cụ thể): món mới chỉ có ở mốc lớn
  function msInfo(m) {
    const box = UI.el("div", "day-info");
    box.appendChild(UI.el("div", "info-line", UI.t(m.major ? "msMajorLabel" : "msMinorLabel", { k: m.level })));
    box.appendChild(UI.el("div", "info-line", UI.t("msCustomers", { c: m.cfg.customers }) + " · " + UI.t("target") + ": " + UI.money(m.cfg.target)));
    const names = (m.cfg.unlock || []).map((id) => UI.recipe(id).name);
    if (names.length) box.appendChild(UI.el("div", "info-note", UI.t("newDishes", { list: names.join(", ") })));
    return box;
  }

  BT.Screens.Map = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const MS = BT.MS;
      const cur = S.ms.index;
      const el = UI.el("div", "screen map");
      el.appendChild(UI.topbar(UI.t("mapTitle"), () => router.back()));

      // Thẻ mốc hiện tại
      const m = MS.get(cur);
      const need = MS.need(cur);
      const seasonDone = S.ms.cleared >= MS.count();
      const card = UI.el("div", "ms-card");
      const top = UI.el("div", "ms-card-top");
      top.appendChild(UI.el("b", "ms-card-name", UI.t("runMs", { n: cur }) + (m.major ? " ★" : "")));
      top.appendChild(UI.el("span", "ms-card-count", seasonDone ? UI.t("msSeasonDone") : UI.t("msProgress", { a: UI.num1(S.ms.progress), b: UI.num1(need) })));
      card.appendChild(top);
      const bar = UI.el("div", "ms-bar");
      const fill = UI.el("div", "ms-fill");
      fill.style.width = Math.min(100, S.ms.progress / need * 100) + "%";
      bar.appendChild(fill);
      card.appendChild(bar);
      const names = (m.cfg.unlock || []).filter(() => m.major && !S.ms.firstDone[cur]).map((id) => UI.recipe(id).name);
      if (names.length) card.appendChild(UI.el("div", "ms-card-new", UI.t("newDishes", { list: names.join(", ") })));
      card.appendChild(UI.button(UI.t("btnOpenShift"), "btn-pink", () => router.go("Prep", { run: MS.run(cur) })));
      el.appendChild(card);

      const scroll = UI.el("div", "map-scroll");
      const path = UI.el("div", "map-path");
      let focus = null;

      // Ca bí mật trên cùng
      const secretOpen = CONFIG.build.secretPlayable && S.endingSeen;
      const sNode = UI.el("button", "map-node secret" + (secretOpen ? "" : " locked"));
      sNode.type = "button";
      sNode.appendChild(UI.el("span", "node-label", "★"));
      if (!secretOpen) sNode.appendChild(UI.el("span", "node-lock", "🔒"));
      sNode.addEventListener("click", () => {
        if (!secretOpen) { UI.toast(UI.t("secretLocked")); return; }
        BT.Audio.play("tap");
        const run = MS.secretRun();
        UI.modal({ title: UI.t("secretDay"), body: dayInfo(run.cfg), dismissable: true,
          buttons: [{ label: UI.t("btnPrepare"), cls: "btn-pink", onClick: () => router.go("Prep", { run }) }] });
      });
      path.appendChild(sNode);

      MS.list().slice().reverse().forEach((ms, i) => {
        const node = UI.el("button", "map-node " + (ms.major ? "major" : "minor"));
        node.type = "button";
        node.dataset.ms = String(ms.index);
        node.style.setProperty("--offset", (i % 2 === 0 ? -1 : 1) * (i % 4 < 2 ? 22 : 12) + "%");
        const done = ms.index < cur || (ms.index === cur && seasonDone);
        const locked = ms.index > cur;
        if (locked) node.classList.add("locked");
        if (done) node.classList.add("cleared");
        if (ms.index === cur) {
          node.classList.add("current");
          node.style.setProperty("--pct", Math.round(Math.min(1, S.ms.progress / need) * 100) + "%");
        }
        if (ms.major) {
          node.appendChild(UI.el("span", "node-weather", CONFIG.weathers[ms.cfg.weather].icon));
          node.appendChild(UI.el("span", "node-label", String(ms.day)));
          const best = S.ms.best[ms.index];
          const n = best ? best.stars : 0;
          node.appendChild(UI.el("span", "node-stars", "★".repeat(n) + "☆".repeat(3 - n)));
        } else {
          node.appendChild(UI.el("span", "node-dot", done ? "✓" : ""));
        }
        if (locked && ms.major) node.appendChild(UI.el("span", "node-lock", "🔒"));
        node.addEventListener("click", () => {
          if (locked) { UI.toast(UI.t("msLocked", { n: ms.index })); return; }
          BT.Audio.play("tap");
          if (ms.index === cur && !seasonDone) { router.go("Prep", { run: MS.run(cur) }); return; }
          UI.modal({
            title: UI.t("runMs", { n: ms.index }),
            body: msInfo(ms),
            dismissable: true,
            buttons: [{ label: UI.t("btnReplay"), cls: "btn-pink", onClick: () => router.go("Prep", { run: MS.run(ms.index, { replay: true }) }) }]
          });
        });
        path.appendChild(node);
        if (ms.index === cur) focus = node;
      });
      scroll.appendChild(path);
      el.appendChild(scroll);
      root.appendChild(el);

      // Tự cuộn tới mốc hiện tại
      requestAnimationFrame(() => {
        if (focus) scroll.scrollTop = focus.offsetTop - scroll.clientHeight / 2 + focus.offsetHeight / 2;
      });

      return { destroy() { UI.closeAllModals(); } };
    }
  };

  BT.MapHelpers = { dayInfo };
})();
