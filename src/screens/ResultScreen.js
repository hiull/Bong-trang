// ResultScreen.js — Tổng kết thu chi cuối ngày, sao, phong bì kỷ niệm, Trái tim vàng,
// lời nhắn bí mật (đủ 15 tim vàng), dẫn sang màn kết thúc sau Ngày 15.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  const homeOf = (s) => (s.endless || (s.run && s.run.mode === "daily") ? "Menu" : "Map");

  BT.Screens.Result = {
    mount(root, s, router) {
      const scope = UI.scope();
      const S = BT.Save.state;
      const el = UI.el("div", "screen result");
      el.appendChild(UI.topbar(UI.t("resultTitle", { n: s.title || UI.dayName(s.day) }), () => router.backTo(homeOf(s))));
      const body = UI.el("div", "result-body");

      const starRow = UI.el("div", "result-stars" + (s.endless ? " hidden" : ""));
      const starEls = [0, 1, 2].map(() => {
        const st = UI.el("span", "rstar", "★");
        starRow.appendChild(st);
        return st;
      });
      body.appendChild(starRow);

      const head = UI.el("div", "result-head" + (s.passed ? " win" : " lose"));
      if (s.endless) UI.setText(head, UI.t("endlessResult", { n: s.served }));
      else if (s.secret) UI.setText(head, UI.t("secretResult"));
      else if (s.passed) UI.setText(head, UI.t("resultPassed"));
      else UI.setText(head, s.lostHearts ? UI.t("resultFailedHearts") : UI.t("resultFailedTarget", { x: UI.money(s.target) }));
      body.appendChild(head);
      if (s.endless) {
        const eb = UI.el("div", "daily-box endless-box");
        eb.appendChild(UI.el("div", "daily-tier tier-2", s.newBest ? UI.t("endlessNewBest") : UI.t("endlessBest", { n: s.best })));
        if (s.newBest) eb.appendChild(UI.el("div", "daily-coins", UI.t("endlessBest", { n: s.best })));
        (s.rewardMarks || []).forEach((m) => eb.appendChild(UI.el("div", "daily-coins", UI.t("endlessReward", { m, x: UI.money(CONFIG.endless.rewards[m]) }))));
        body.appendChild(eb);
      }
      // Thử thách hôm nay: hạng, thưởng, lời nhắn
      if (s.daily) {
        const dbox = UI.el("div", "daily-box");
        dbox.appendChild(UI.el("div", "daily-tier tier-" + s.daily.tier, CONFIG.texts.dailyTiers[s.daily.tier]));
        if (s.daily.first) {
          dbox.appendChild(UI.el("div", "daily-coins", UI.t("dailyCoins", { x: UI.money(s.daily.coins) }) + " · " + UI.t("dailyStreak", { n: s.daily.streak })));
          if (s.daily.note) {
            const note = UI.el("div", "daily-note");
            note.appendChild(UI.el("div", "daily-note-title", UI.t("dailyNoteTitle") + (s.daily.note.reread ? " · " + UI.t("dailyReread") : "")));
            note.appendChild(UI.el("div", "daily-note-text", UI.fmt(s.daily.note.text)));
            dbox.appendChild(note);
          }
        } else {
          dbox.appendChild(UI.el("div", "daily-again", UI.t("dailyAgain")));
        }
        body.appendChild(dbox);
      }

      const goldNow = s.goldSeason === 2 ? S.s2.goldHearts : S.goldHearts;
      if (s.newGold) body.appendChild(UI.el("div", "gold-get", UI.t("goldHeartGet") + " · " + UI.t("goldHearts", { a: goldNow, b: CONFIG.build.maxPlayableDay })));
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
      if (!s.secret && !s.endless) row(UI.t("statIncome"), UI.money(s.income) + " / " + UI.money(s.target), s.income >= s.target ? "good" : "");
      row(UI.t("statRevenue"), UI.money(s.revenue));
      row(UI.t("statTips"), UI.money(s.tips));
      row(UI.t("statExpense"), (s.expense > 0 ? "−" : "") + UI.money(s.expense));
      row(UI.t("statNet"), (s.net >= 0 ? "" : "−") + UI.money(Math.abs(s.net)), s.net >= 0 ? "good" : "bad");
      row(UI.t("statServed"), s.endless ? String(s.served) : s.served + " / " + s.total);
      row(UI.t("statRating"), s.avgRating ? "⭐ " + UI.rating(s.avgRating) : "–");
      body.appendChild(table);

      if (s.dateOffer) {
        const db = UI.button(UI.t("dateBtn"), "btn-purple small date-btn", () => { if (db.disabled) return; db.disabled = true; BT.Fun.dateGame(); });
        body.appendChild(db);
      }
      if (s.newRecord) body.appendChild(UI.el("div", "new-record", UI.t("newRecord")));
      (s.badges || []).forEach((id) => {
        const b = CONFIG.badges.find((x) => x.id === id);
        body.appendChild(UI.el("div", "badge-get", "★ " + UI.t("badgeGet", { name: b.name, x: UI.money(b.reward) })));
      });
      if (s.petCoins) body.appendChild(UI.el("div", "pet-coins", UI.t("petCoins", { x: UI.money(s.petCoins) })));

      // Anh Hiếu: chương "Sau giờ đóng cửa"
      if (s.helperChapter !== null && s.helperChapter !== undefined) {
        const ch = (window.PERSONAL.helperChapters || [])[s.helperChapter];
        if (ch) {
          const hb = UI.el("div", "helper-chapter");
          hb.appendChild(UI.el("div", "card2-head", UI.t("helperChapterTitle", { n: s.helperChapter + 1 })));
          hb.appendChild(UI.el("div", "card2-text", UI.fmt(ch.text)));
          const row = UI.el("div", "helper-choices");
          ch.choices.forEach((c) => row.appendChild(UI.button(UI.fmt(c.label), "btn-white small", () => {
            if (row.dataset.done) return;
            row.dataset.done = "1";
            const eff = c.effect || {};
            if (eff.wallet) S.wallet += eff.wallet;
            S.helper.chapters = Math.max(S.helper.chapters, s.helperChapter + 1);
            BT.Save.persist();
            UI.toast(UI.fmt(c.reply) + (eff.wallet ? " · +" + UI.money(eff.wallet) : ""), 2800);
            row.querySelectorAll("button").forEach((x) => { x.disabled = true; });
          })));
          hb.appendChild(row);
          body.appendChild(hb);
        }
      }

      // Tiến độ mốc
      let msFill = null, msTarget = 0;
      if (s.progress) {
        const p = s.progress;
        const box = UI.el("div", "ms-box");
        const head2 = UI.el("div", "ms-head");
        head2.appendChild(UI.el("span", "ms-name", UI.t("runMs", { n: p.before.index })));
        head2.appendChild(UI.el("b", "ms-gain", UI.t("msGain", { u: UI.num1(s.units) })));
        box.appendChild(head2);
        const bar = UI.el("div", "ms-bar");
        msFill = UI.el("div", "ms-fill");
        msFill.style.width = Math.min(100, p.before.progress / s.need * 100) + "%";
        bar.appendChild(msFill);
        box.appendChild(bar);
        msTarget = p.cleared ? 100 : Math.min(100, p.after.progress / s.need * 100);
        box.appendChild(UI.el("div", "ms-count", p.cleared ? UI.t("msCleared", { t: UI.t("runMs", { n: p.cleared }) })
          : UI.t("msProgress", { a: UI.num1(p.after.progress), b: UI.num1(s.need) })));
        if (p.cleared) box.classList.add("cleared");
        if (s.card2 !== null && s.card2 !== undefined) {
          const c2 = (window.PERSONAL.recipeCards2 || [])[s.card2];
          if (c2) {
            const cb = UI.el("div", "card2-box");
            cb.appendChild(UI.el("div", "card2-head", UI.t("card2Get")));
            cb.appendChild(UI.el("div", "card2-title", "🍧 " + c2.title));
            cb.appendChild(UI.el("div", "card2-text", UI.fmt(c2.text)));
            box.appendChild(cb);
          }
        }
        if (s.memory2 !== null && s.memory2 !== undefined) {
          const m2 = UI.button(UI.t("memory2Get"), "btn-purple small", () => UI.openMemory(s.memory2, { mems: window.PERSONAL.memories2 }));
          box.appendChild(m2);
        }
        if (s.minor) {
          box.appendChild(UI.el("div", "ms-reward", UI.t("msMinorCoins", { x: UI.money(s.minor.coins) })));
          if (s.minor.tale) {
            const tale = UI.el("div", "ms-tale");
            tale.appendChild(UI.el("div", "ms-tale-who", UI.t("msTaleTitle") + " · " + UI.fmt(s.minor.tale.who)));
            tale.appendChild(UI.el("div", "ms-tale-text", UI.fmt(s.minor.tale.text)));
            box.appendChild(tale);
          }
        }
        body.appendChild(box);
      }
      el.appendChild(body);

      const foot = UI.el("div", "result-foot");
      if (s.ending) {
        foot.appendChild(UI.button(UI.t("btnSurprise"), "btn-pink pulse", () => goEnding()));
      } else if (s.endless) {
        foot.appendChild(UI.button(UI.t("btnPlayAgain"), "btn-pink", () => BT.startEndless(router, { replace: true })));
      } else if (!s.secret) {
        foot.appendChild(UI.button(UI.t("btnNextDay"), "btn-pink", () => router.go("Prep", { run: BT.MS.run(S.ms.index) }, { replace: true })));
      }
      const row2 = UI.el("div", "foot-row");
      if (s.endless || (s.run && s.run.mode === "daily")) row2.appendChild(UI.button(UI.t("btnToMenu"), "btn-white", () => router.backTo("Menu")));
      else row2.appendChild(UI.button(UI.t("btnToMap"), "btn-white", () => router.backTo("Map")));
      foot.appendChild(row2);
      el.appendChild(foot);
      root.appendChild(el);

      function goEnding() {
        if (envelope && !envelope.classList.contains("opened")) { openLetter(() => goEnding()); return; }
        router.go("Ending", { season: s.endSeason || (s.run && s.run.season) || 1 }, { replace: true });
      }

      function openLetter(after) {
        if (!envelope) return;
        envelope.classList.add("opened");
        BT.Audio.play("letter");
        UI.openMemory(s.memory, {
          typing: true,
          onClose: () => {
            if (s.allGold) showBonus(after);
            else if (after) after();
          }
        });
      }

      // Đủ 15 Trái tim vàng → lời nhắn bí mật
      function showBonus(after) {
        const s2 = s.goldSeason === 2;
        if (s2) S.s2.bonusSeen = true; else S.bonusSeen = true;
        BT.Save.persist();
        UI.confetti(80);
        UI.modal({
          title: UI.t("bonusTitle"),
          body: s2 ? window.PERSONAL.bonusMessage2 : window.PERSONAL.bonusMessage,
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
      if (msFill) scope.timeout(() => {
        msFill.style.width = msTarget + "%";
        if (s.progress.cleared) { BT.Audio.play("win"); UI.confetti(60); }
      }, after + 150);
      if (envelope) scope.timeout(() => { envelope.classList.add("drop"); BT.Audio.play("pop"); }, after + 200);
      else if (s.allGold) scope.timeout(() => showBonus(), after + 400);

      return {
        destroy() { scope.clear(); UI.closeAllModals(); },
        onBack() { if (UI.modals.length) return false; router.backTo(homeOf(s)); return true; }
      };
    }
  };
})();
