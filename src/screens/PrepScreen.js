// PrepScreen.js — Màn Chuẩn bị đầu ngày: dự báo thời tiết/sự kiện, nhập kho nguyên liệu.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Prep = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const M = CONFIG.money;
      const run = params.run || BT.MS.run(S.ms.index);
      const day = run.key;
      const dc = run.cfg;
      const lv = run.level;

      // Điểm khôi phục đầu ngày (vào lại màn này thì quay về đúng đầu ngày)
      if (S.dayBackup && S.dayBackup.day === day && !S.dayBackup.finished) BT.Save.restoreDay();
      else BT.Save.snapshotDay(day);
      S.today = { day, expense: 0 };
      BT.Save.persist();

      const ids = Object.keys(CONFIG.ingredients).filter((id) => {
        const ing = CONFIG.ingredients[id];
        return ing.openDay <= lv && ing.zones.some((z) => CONFIG.build.playableZones.includes(z));
      });
      const gift = run.mode === "story" && run.ms === 1 && S.ms.shifts === 0;
      if (gift) ids.forEach((id) => { S.inventory[id] = Math.max(BT.Save.stock(id), M.freeStockQty); });
      // Quỹ cứu trợ: không đủ tiền nhập hàng tối thiểu → tặng miễn phí phần còn thiếu
      const low = ids.filter((id) => BT.Save.stock(id) < M.rescueMinStock);
      const lowCost = low.reduce((sum, id) => sum + UI.ing(id).price, 0);
      const rescued = low.length > 0 && S.wallet < lowCost;
      if (rescued) low.forEach((id) => { S.inventory[id] = Math.max(BT.Save.stock(id), M.rescueQty); });
      // Xếp theo khu: Trộn → Nước → Nướng → Cuốn (theo ngày mở)
      const zones = CONFIG.zones.filter((z) => z.openDay <= lv && CONFIG.build.playableZones.includes(z.id)).sort((a, b) => a.openDay - b.openDay);
      const seen = new Set();
      const groups = zones.map((z) => {
        const list = BT.Station.ingredientsFor(z.id, lv).filter((id) => !seen.has(id));
        list.forEach((id) => seen.add(id));
        return { z, list };
      }).filter((g) => g.list.length);

      const el = UI.el("div", "screen prep");
      el.appendChild(UI.topbar(UI.t("prepTitle", { n: UI.runTitle(run) }), () => router.back()));
      const body = UI.el("div", "prep-body");

      const card = UI.el("div", "card forecast");
      card.appendChild(BT.MapHelpers.dayInfo(dc));
      if (gift) card.appendChild(UI.el("div", "gift", UI.t("prepGift", { q: M.freeStockQty })));
      if (rescued && !gift) card.appendChild(UI.el("div", "gift", UI.t("prepRescue")));
      body.appendChild(card);

      const wallet = UI.el("div", "prep-wallet");
      const spent = UI.el("div", "prep-spent");
      const money = UI.el("div", "prep-money");
      money.appendChild(wallet);
      money.appendChild(spent);
      body.appendChild(money);

      body.appendChild(UI.el("h3", "section-title", UI.t("prepStockTitle")));
      const list = UI.el("div", "stock-list");
      const rows = [];
      groups.forEach((g) => {
        list.appendChild(UI.el("div", "zone-header", UI.t("zoneHeader", { icon: g.z.icon, name: g.z.name })));
        g.list.forEach((id) => addRow(id));
      });
      function addRow(id) {
        const ing = UI.ing(id);
        const row = UI.el("div", "stock-row");
        row.appendChild(UI.el("div", "stock-emoji", ing.emoji));
        const info = UI.el("div", "stock-info");
        info.appendChild(UI.el("div", "stock-name", ing.name));
        const n = UI.el("div", "stock-count");
        info.appendChild(n);
        row.appendChild(info);
        const btn = UI.button("", "btn-green small", () => {
          if (S.wallet < ing.price) { UI.toast(UI.t("lacking", { x: UI.money(ing.price - S.wallet) })); return; }
          S.wallet -= ing.price;
          S.inventory[id] = BT.Save.stock(id) + M.buyPackQty;
          S.today.expense += ing.price;
          BT.Audio.play("coin");
          BT.Save.persist();
          refresh();
        });
        row.appendChild(btn);
        list.appendChild(row);
        rows.push({ id, ing, n, btn });
      }
      body.appendChild(list);
      el.appendChild(body);

      const foot = UI.el("div", "prep-foot");
      let started = false;
      foot.appendChild(UI.button(UI.t("btnOpenDay"), "btn-pink big", () => {
        started = true;
        router.go("Game", { run }, { replace: true });
      }));
      el.appendChild(foot);
      root.appendChild(el);

      function refresh() {
        UI.setText(wallet, UI.t("prepWallet", { x: UI.money(S.wallet) }));
        UI.setText(spent, UI.t("prepSpent", { x: UI.money(S.today.expense) }));
        rows.forEach((r) => {
          UI.setText(r.n, UI.t("prepStock", { n: BT.Save.stock(r.id) }));
          const short = S.wallet < r.ing.price;
          UI.setText(r.btn, short ? UI.t("lacking", { x: UI.money(r.ing.price - S.wallet) }) : UI.t("prepBuy", { q: M.buyPackQty, x: UI.money(r.ing.price) }));
          r.btn.classList.toggle("is-short", short);
        });
      }
      refresh();

      // Rời màn Chuẩn bị mà không mở ca: giữ nguyên tiền & kho hiện tại (lần sau vào lại chụp điểm khôi phục mới)
      return { destroy() { if (!started && S.dayBackup && S.dayBackup.day === day) { S.dayBackup.finished = true; S.today = null; BT.Save.persist(); } } };
    }
  };
})();
