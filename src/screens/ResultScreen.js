// ResultScreen.js — Tổng kết thu chi cuối ngày, sao, phong bì kỷ niệm, Trái tim vàng,
// lời nhắn bí mật (đủ 15 tim vàng), dẫn sang màn kết thúc sau Ngày 15.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Result = {
    mount(root, s, router) {
      const scope = UI.scope();
      const S = BT.Save.state;
      const el = UI.el("div", "screen result");
      el.appendChild(UI.topbar(UI.t("resultTitle", { n: UI.dayName(s.day) }), () => router.backTo("Map")));
      const body = UI.el("div", "result-body");

      const starRow = UI.el("div", "result-stars");
      const starEls = [0, 1, 2].map(() => {
        const st = UI.el("span", "rstar", "★");
        starRow.appendChild(st);
        return st;
      });
      body.appendChild(starRow);

      const head = UI.el("div", "result-head" + (s.passed ? " win" : " lose"));
      if (s.secret) UI.setText(head, UI.t("secretResult"));
      else if (s.passed) UI.setText(head, UI.t("resultPassed"));
      else UI.setText(head, s.lostHearts ? UI.t("resultFailedHearts") : UI.t("resultFailedTarget", { x: UI.money(s.target) }));
      body.appendChild(head);
      if (s.newGold) body.appendChild(UI.el("div", "gold-get", UI.t("goldHeartGet") + " · " + UI.t("goldHearts", { a: S.goldHearts, b: CONFIG.build.maxPlayableDay })));
      if (!s.passed) {
        body.appendChild(UI.el("div", "result-cheer", UI.t("loseLines")));
        body.appendChild(UI.el("div", "result-keep", UI.t("resultKeep", { x: UI.money(s.kept) })));
      }

      // Phong bì kỷ niệm (qua ngày lần đầu)
      let envelope = null;
      if (s.memory !== null && s.memory !== undefined) {
        envelope = UI.el("button", "envelope");
        envelope.type = "button";
        envelope.appendChild(UI.el("div", "envelope-icon", "✉️"));
        envelope.appendChild(UI.el("div", "envelope-text", UI.t("envelopeTap")));
        envelope.addEventListener("click", () => openLetter());
        body.appendChild(envelope);
      }

      const table = UI.el("div", "ledger");
      const row = (label, value, cls) => {
        const r = UI.el("div", "ledger-row " + (cls || ""));
        r.appendChild(UI.el("span", "", label));
        r.appendChild(UI.el("b", "", value));
        table.appendChild(r);
      };
      if (!s.secret) row(UI.t("statIncome"), UI.money(s.income) + " / " + UI.money(s.target), s.income >= s.target ? "good" : "");
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
      const lastDay = CONFIG.build.maxPlayableDay;
      if (s.ending) {
        foot.appendChild(UI.button(UI.t("btnSurprise"), "btn-pink pulse", () => goEnding()));
      } else {
        const nextPlayable = s.passed && next && next <= lastDay;
        const nextBtn = UI.button(UI.t("btnNextDay"), "btn-pink", () => router.go("Prep", { day: next }, { replace: true }));
        if (!nextPlayable) nextBtn.disabled = true;
        foot.appendChild(nextBtn);
      }
      const row2 = UI.el("div", "foot-row");
      row2.appendChild(UI.button(UI.t("btnRetry"), "btn-orange", () => {
        BT.Save.restoreDay();
        BT.Save.persist();
        router.go("Prep", { day: s.day }, { replace: true });
      }));
      row2.appendChild(UI.button(UI.t("btnToMap"), "btn-white", () => router.backTo("Map")));
      foot.appendChild(row2);
      el.appendChild(foot);
      root.appendChild(el);

      function goEnding() {
        if (envelope && !envelope.classList.contains("opened")) { openLetter(() => goEnding()); return; }
        router.go("Ending", {}, { replace: true });
      }

      function openLetter(after) {
        if (!envelope) return;
        envelope.classList.add("opened");
        BT.Audio.play("letter");
        UI.openMemory(s.memory, {
          typing: true,
          onClose: () => {
            if (s.allGold && !S.bonusSeen) showBonus(after);
            else if (after) after();
          }
        });
      }

      // Đủ 15 Trái tim vàng → lời nhắn bí mật
      function showBonus(after) {
        S.bonusSeen = true;
        BT.Save.persist();
        UI.confetti(80);
        UI.modal({
          title: UI.t("bonusTitle"),
          body: window.PERSONAL.bonusMessage,
          className: "modal-welcome",
          buttons: [{ label: UI.t("btnClose"), cls: "btn-pink", onClick: () => { if (after) after(); } }]
        });
      }

      // Sao bật lên lần lượt kèm tiếng "ting", rồi phong bì rơi xuống
      starEls.forEach((st, i) => {
        scope.timeout(() => {
          if (i < s.stars) { st.classList.add("on"); BT.Audio.play("star"); }
          else st.classList.add("off");
        }, 400 + i * 450);
      });
      const after = 400 + 3 * 450;
      if (s.levelUp) scope.timeout(() => { UI.toast(UI.t("levelUp", { n: s.levelUp.level, title: UI.fmt(s.levelUp.title) }), 3000); BT.Audio.play("win"); }, after + 100);
      if (s.stars === 3) scope.timeout(() => UI.confetti(80), after);
      if (envelope) scope.timeout(() => { envelope.classList.add("drop"); BT.Audio.play("pop"); }, after + 200);
      else if (s.allGold && !S.bonusSeen) scope.timeout(() => showBonus(), after + 400);

      return {
        destroy() { scope.clear(); UI.closeAllModals(); },
        onBack() { if (UI.modals.length) return false; router.backTo("Map"); return true; }
      };
    }
  };
})();
