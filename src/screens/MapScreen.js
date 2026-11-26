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
  function msInfo(m, sid) {
    const box = UI.el("div", "day-info");
    box.appendChild(UI.el("div", "info-line", UI.t(m.major ? "msMajorLabel" : "msMinorLabel", { k: m.level })));
    box.appendChild(UI.el("div", "info-line", UI.t("msCustomers", { c: m.cfg.customers }) + " · " + UI.t("target") + ": " + UI.money(m.cfg.target)));
    const names = (m.cfg.unlock || []).map((id) => UI.recipe(id).name);
    if (names.length) box.appendChild(UI.el("div", "info-note", UI.t("newDishes", { list: names.join(", ") })));
    const sg = BT.MS.sideGoal(m.index, sid);
    if (sg) {
      const got = !!(BT.MS.stateOf(sid).side || {})[m.index];
      box.appendChild(UI.el("div", "side-goal" + (got ? " done" : ""), UI.t("sideGoalTitle") + ": " + sg.text + (got ? " ✓" : "")));
    }
    return box;
  }

  BT.Screens.Map = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const MS = BT.MS;
      const playing = S.season || 1;
      const view = params.season || playing;          // mùa đang xem trên bản đồ
      const isCur = view === playing;
      const vs = MS.stateOf(view);
      const cur = vs.index;
      const el = UI.el("div", "screen map");
      el.appendChild(UI.topbar(UI.t("mapTitle"), () => router.back()));

      // Thanh chọn mùa (khi đã mở hơn một mùa)
      const maxOpen = Math.max(playing, ...CONFIG.seasons.filter((x) => x.id > 1 && S["s" + x.id] && S["s" + x.id].started).map((x) => x.id));
      if (maxOpen > 1) {
        const tabs = UI.el("div", "season-tabs");
        CONFIG.seasons.filter((x) => x.id <= maxOpen).forEach((x) => {
          const b = UI.button(UI.t("seasonTab", { s: x.id }), "btn-white small" + (x.id === view ? " active" : ""), () => router.go("Map", { season: x.id }, { replace: true }));
          tabs.appendChild(b);
        });
        el.appendChild(tabs);
      }

      // Thẻ mốc hiện tại (mùa đang chơi) hoặc thẻ "đã đi hết" (mùa cũ)
      const m = MS.get(cur, view);
      const need = MS.need(cur);
      const seasonDone = vs.cleared >= MS.count(view);
      const card = UI.el("div", "ms-card");
      const top = UI.el("div", "ms-card-top");
      if (isCur) {
        top.appendChild(UI.el("b", "ms-card-name", UI.runTitle({ mode: "story", ms: cur, season: view }) + (m.major ? " ★" : "")));
        top.appendChild(UI.el("span", "ms-card-count", seasonDone ? UI.t("msSeasonDone") : UI.t("msProgress", { a: UI.num1(vs.progress), b: UI.num1(need) })));
        card.appendChild(top);
        const bar = UI.el("div", "ms-bar");
        const fill = UI.el("div", "ms-fill");
        fill.style.width = Math.min(100, vs.progress / need * 100) + "%";
        bar.appendChild(fill);
        card.appendChild(bar);
        const names = (m.cfg.unlock || []).filter(() => m.major && !vs.firstDone[cur]).map((id) => UI.recipe(id).name);
        if (names.length) card.appendChild(UI.el("div", "ms-card-new", UI.t("newDishes", { list: names.join(", ") })));
        card.appendChild(UI.button(UI.t("btnOpenShift"), "btn-pink", () => router.go("Prep", { run: MS.run(cur) })));
      } else {
        top.appendChild(UI.el("b", "ms-card-name", UI.t("seasonDoneCard", { s: view })));
        card.appendChild(top);
      }
      el.appendChild(card);

      const scroll = UI.el("div", "map-scroll");
      const path = UI.el("div", "map-path");
      let focus = null;

      // Ca bí mật trên cùng (Mùa 1)
      const secretOpen = CONFIG.build.secretPlayable && S.endingSeen;
      if (view === 1) {
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
      }

      MS.list(view).slice().reverse().forEach((ms, i) => {
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
          node.style.setProperty("--pct", Math.round(Math.min(1, vs.progress / need) * 100) + "%");
        }
        if (ms.major) {
          node.appendChild(UI.el("span", "node-weather", CONFIG.weathers[ms.cfg.weather].icon));
          node.appendChild(UI.el("span", "node-label", String(ms.day)));
          const best = vs.best[ms.index];
          const n = best ? best.stars : 0;
          node.appendChild(UI.el("span", "node-stars", "★".repeat(n) + "☆".repeat(3 - n)));
        } else {
          node.appendChild(UI.el("span", "node-dot", done ? "✓" : ""));
        }
        if (locked && ms.major) node.appendChild(UI.el("span", "node-lock", "🔒"));
        if ((vs.side || {})[ms.index]) node.appendChild(UI.el("span", "node-side", "✓"));
        node.addEventListener("click", () => {
          if (locked) { UI.toast(UI.t("msLocked", { n: ms.index })); return; }
          BT.Audio.play("tap");
          if (isCur && ms.index === cur && !seasonDone) { router.go("Prep", { run: MS.run(cur) }); return; }
          UI.modal({
            title: UI.runTitle({ mode: "story", ms: ms.index, season: view }),
            body: msInfo(ms, view),
            dismissable: true,
            buttons: [{ label: UI.t("btnReplay"), cls: "btn-pink", onClick: () => router.go("Prep", { run: MS.run(ms.index, { replay: true, season: view }) }) }]
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
