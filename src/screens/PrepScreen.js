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
      BT.recipeLevel = lv;

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
      // Quà khai trương: Mùa 1 tặng mọi nguyên liệu; mùa sau chỉ tặng nguyên liệu mới của mùa đó
      const firstDay = BT.MS.season(run.season).majorDays[0];
      if (gift) ids.filter((id) => (run.season || 1) === 1 || UI.ing(id).openDay >= firstDay).forEach((id) => { S.inventory[id] = Math.max(BT.Save.stock(id), M.freeStockQty); });
      // Quỹ cứu trợ: không đủ tiền nhập hàng tối thiểu → tặng miễn phí phần còn thiếu
      const rescue = () => {
        const low = ids.filter((id) => BT.Save.stock(id) < M.rescueMinStock);
        const lowCost = low.reduce((sum, id) => sum + UI.ing(id).price, 0);
        const hit = low.length > 0 && S.wallet < lowCost;
        if (hit) low.forEach((id) => { S.inventory[id] = Math.max(BT.Save.stock(id), M.rescueQty); });
        return hit;
      };
      const rescued = rescue();
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

      // Anh Hiếu phụ tiệm: chọn việc cho ca này
      if (BT.Helper.unlocked() && run.mode !== "secret") {
        const hp = UI.el("div", "helper-pick");
        hp.appendChild(UI.el("div", "helper-pick-title", UI.t("helperPick")));
        if (run.cfg.helperOff) hp.appendChild(UI.el("div", "info-note", UI.t("helperBusyNote")));
        else {
          const row = UI.el("div", "helper-pick-row");
          const cur = BT.Helper.roleFor(lv);
          BT.Helper.roles(lv).forEach((role) => {
            const b = UI.button(UI.t("helperRole_" + role), "btn-white small" + (cur === role ? " active" : ""), () => {
              S.helper.role = role;
              BT.Save.persist();
              row.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x.dataset.role === role));
              BT.Audio.play("tap");
            });
            b.dataset.role = role;
            row.appendChild(b);
          });
          hp.appendChild(row);
        }
        body.appendChild(hp);
      }

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

      // Bác Sáu ghé thu tiền mặt bằng
      const afterRent = () => {
        if (rescue()) UI.toast(UI.t("prepRescue"), 2600);
        refresh();
      };
      const due = BT.Rent.due(run);
      if (due) {
        if (S.wallet < due.total) {
          // Ví không đủ: chưa khất thì tự khất; đã khất rồi thì gửi hết số đang có
          const r = BT.Rent.pay(S.rent.deferredOnce ? "pay" : "defer", due);
          UI.toast(r.paid ? UI.t("landlordAutoPaid", { x: UI.money(r.paid), y: UI.money(r.owed) }) : UI.t("landlordAuto"), 3000);
          afterRent();
        } else {
          const lb = UI.el("div", "story");
          lb.appendChild(UI.el("div", "story-text", UI.fmt(UI.pick(window.PERSONAL.landlordLines || [""]))));
          lb.appendChild(UI.el("div", "info-line", UI.t("landlordAmount", { x: UI.money(due.total) }) + (due.owed ? " " + UI.t("landlordOwed", { x: UI.money(due.owed) }) : "")));
          const buttons = [{ label: UI.t("landlordPay", { x: UI.money(Math.min(S.wallet, due.total)) }), cls: "btn-pink", onClick: () => { BT.Rent.pay("pay", due); BT.Audio.play("coin"); afterRent(); } }];
          if (!S.rent.deferredOnce) buttons.push({ label: UI.t("landlordDefer"), cls: "btn-white", onClick: () => { BT.Rent.pay("defer", due); afterRent(); } });
          UI.modal({ title: UI.t("landlordTitle"), body: lb, className: "modal-landlord", buttons });
        }
      }

      // Rời màn Chuẩn bị mà không mở ca: giữ nguyên tiền & kho hiện tại (lần sau vào lại chụp điểm khôi phục mới)
      return { destroy() { if (!started && S.dayBackup && S.dayBackup.day === day) { S.dayBackup.finished = true; S.today = null; BT.Save.persist(); } } };
    }
  };
})();
