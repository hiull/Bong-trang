// ResultScreen.js — Tổng kết thu chi cuối ngày, sao đạt được.
// Phong bì kỷ niệm khi qua ngày lần đầu sẽ thêm ở Giai đoạn 3.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Result = {
    mount(root, s, router) {
      const scope = UI.scope();
      const el = UI.el("div", "screen result");
      el.appendChild(UI.topbar(UI.t("resultTitle", { n: s.day }), () => router.backTo("Map")));
      const body = UI.el("div", "result-body");

      const starRow = UI.el("div", "result-stars");
      const starEls = [0, 1, 2].map(() => {
        const st = UI.el("span", "rstar", "★");
        starRow.appendChild(st);
        return st;
      });
      body.appendChild(starRow);

      const head = UI.el("div", "result-head" + (s.passed ? " win" : " lose"));
      if (s.passed) head.textContent = UI.t("resultPassed");
      else head.textContent = s.lostHearts ? UI.t("resultFailedHearts") : UI.t("resultFailedTarget", { x: UI.money(s.target) });
      body.appendChild(head);
      if (!s.passed) {
        body.appendChild(UI.el("div", "result-cheer", UI.t("loseLines")));
        body.appendChild(UI.el("div", "result-keep", UI.t("resultKeep", { x: UI.money(s.kept) })));
      }

      const table = UI.el("div", "ledger");
      const row = (label, value, cls) => {
        const r = UI.el("div", "ledger-row " + (cls || ""));
        r.appendChild(UI.el("span", "", label));
        r.appendChild(UI.el("b", "", value));
        table.appendChild(r);
      };
      row(UI.t("statIncome"), UI.money(s.income) + " / " + UI.money(s.target), s.income >= s.target ? "good" : "");
      row(UI.t("statRevenue"), UI.money(s.revenue));
      row(UI.t("statTips"), UI.money(s.tips));
      row(UI.t("statExpense"), (s.expense > 0 ? "−" : "") + UI.money(s.expense));
      row(UI.t("statNet"), (s.net >= 0 ? "" : "−") + UI.money(Math.abs(s.net)), s.net >= 0 ? "good" : "bad");
      row(UI.t("statServed"), s.served + " / " + s.total);
      row(UI.t("statRating"), s.avgRating ? "⭐ " + UI.rating(s.avgRating) : "–");
      body.appendChild(table);
      el.appendChild(body);

      const foot = UI.el("div", "result-foot");
      const next = typeof s.day === "number" ? s.day + 1 : null;
      const nextPlayable = s.passed && next && next <= CONFIG.build.maxPlayableDay;
      const nextBtn = UI.button(UI.t("btnNextDay"), "btn-pink", () => router.go("Prep", { day: next }, { replace: true }));
      if (!nextPlayable) nextBtn.disabled = true;
      foot.appendChild(nextBtn);
      if (s.passed && next && !nextPlayable && next <= 15) foot.appendChild(UI.el("div", "foot-note", UI.t("nextDaySoon", { n: next })));
      const row2 = UI.el("div", "foot-row");
      row2.appendChild(UI.button(UI.t("btnRetry"), "btn-orange", () => {
        BT.Save.restoreDay();
        router.go("Prep", { day: s.day }, { replace: true });
      }));
      row2.appendChild(UI.button(UI.t("btnToMap"), "btn-white", () => router.backTo("Map")));
      foot.appendChild(row2);
      el.appendChild(foot);
      root.appendChild(el);

      // Sao bật lên lần lượt kèm tiếng "ting"
      starEls.forEach((st, i) => {
        scope.timeout(() => {
          if (i < s.stars) { st.classList.add("on"); BT.Audio.play("star"); }
          else st.classList.add("off");
        }, 400 + i * 450);
      });
      if (s.stars === 3) scope.timeout(() => UI.confetti(80), 400 + 3 * 450);

      return { destroy() { scope.clear(); }, onBack() { router.backTo("Map"); return true; } };
    }
  };
})();
