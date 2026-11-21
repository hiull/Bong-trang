// PrepScreen.js — Màn Chuẩn bị đầu ngày: dự báo thời tiết/sự kiện, nhập kho nguyên liệu.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Prep = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const M = CONFIG.money;
      const day = params.day;
      const dc = UI.dayCfg(day);

      // Điểm khôi phục đầu ngày (vào lại màn này thì quay về đúng đầu ngày)
      if (S.dayBackup && S.dayBackup.day === day && !S.dayBackup.finished) BT.Save.restoreDay();
      else BT.Save.snapshotDay(day);
      S.today = { day, expense: 0 };

      const ids = Object.keys(CONFIG.ingredients).filter((id) => {
        const ing = CONFIG.ingredients[id];
        return ing.openDay <= day && ing.zones.some((z) => CONFIG.build.playableZones.includes(z));
      });
      const gift = M.freeStockDays.includes(day);
      if (gift) ids.forEach((id) => { S.inventory[id] = Math.max(BT.Save.stock(id), M.freeStockQty); });

      const el = UI.el("div", "screen prep");
      el.appendChild(UI.topbar(UI.t("prepTitle", { n: day }), () => router.back()));
      const body = UI.el("div", "prep-body");

      const card = UI.el("div", "card forecast");
      card.appendChild(BT.MapHelpers.dayInfo(dc));
      if (gift) card.appendChild(UI.el("div", "gift", UI.t("prepGift", { q: M.freeStockQty })));
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
      ids.forEach((id) => {
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
          refresh();
        });
        row.appendChild(btn);
        list.appendChild(row);
        rows.push({ id, ing, n, btn });
      });
      body.appendChild(list);
      el.appendChild(body);

      const foot = UI.el("div", "prep-foot");
      foot.appendChild(UI.button(UI.t("btnOpenDay", { n: day }), "btn-pink big", () => {
        router.go("Game", { day }, { replace: true });
      }));
      el.appendChild(foot);
      root.appendChild(el);

      function refresh() {
        wallet.textContent = UI.t("prepWallet", { x: UI.money(S.wallet) });
        spent.textContent = UI.t("prepSpent", { x: UI.money(S.today.expense) });
        rows.forEach((r) => {
          r.n.textContent = UI.t("prepStock", { n: BT.Save.stock(r.id) });
          const short = S.wallet < r.ing.price;
          r.btn.textContent = short ? UI.t("lacking", { x: UI.money(r.ing.price - S.wallet) }) : UI.t("prepBuy", { q: M.buyPackQty, x: UI.money(r.ing.price) });
          r.btn.classList.toggle("is-short", short);
        });
      }
      refresh();

      return { destroy() {} };
    }
  };
})();
