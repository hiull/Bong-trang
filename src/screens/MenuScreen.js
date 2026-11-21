// MenuScreen.js — Màn hình chính: biển hiệu, số ngày bên nhau, cấp độ & danh hiệu tiệm,
// điểm danh 7 ngày, nhiệm vụ hằng ngày, trang trí & thú cưng, giao diện mùa.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Menu = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const P = window.PERSONAL;
      const Pr = BT.Progress;
      const el = UI.el("div", "screen menu skin-" + S.activeSkin);

      // Góc trên
      const top = UI.el("div", "menu-top");
      const stats = UI.el("div", "menu-stats");
      stats.appendChild(UI.el("div", "pill", "🪙 " + UI.money(S.wallet)));
      const rating = Pr.shopRating();
      stats.appendChild(UI.el("div", "pill", "⭐ " + (rating ? UI.rating(rating) : "–")));
      stats.appendChild(UI.el("div", "pill", UI.t("goldHearts", { a: S.goldHearts, b: CONFIG.build.maxPlayableDay })));
      top.appendChild(stats);
      top.appendChild(UI.iconButton("⚙️", UI.t("btnSettings"), () => openSettings(), "settings-btn"));
      el.appendChild(top);

      // Mặt tiền
      const facade = UI.el("div", "menu-facade");
      facade.appendChild(UI.el("div", "awning"));
      facade.appendChild(UI.el("div", "lights"));
      facade.appendChild(UI.el("div", "flowers"));
      facade.appendChild(UI.el("div", "menu-sign", P.shopName));
      facade.appendChild(UI.el("div", "love-days", UI.t("loveDays", { n: UI.loveDays() })));
      // Cấp độ & danh hiệu
      const lv = Pr.level(S.xp);
      const badge = UI.el("div", "shop-title");
      badge.appendChild(UI.el("span", "level-chip", UI.t("levelLabel", { n: lv.level })));
      badge.appendChild(UI.el("span", "", " " + UI.fmt(lv.title)));
      if (lv.next) {
        const bar = UI.el("div", "xp-bar");
        const fill = UI.el("div", "xp-fill");
        fill.style.width = Math.min(100, ((S.xp - lv.from) / (lv.next - lv.from)) * 100) + "%";
        bar.appendChild(fill);
        badge.appendChild(bar);
      }
      facade.appendChild(badge);
      const owner = UI.el("div", "owner");
      owner.appendChild(UI.el("div", "owner-avatar", "👩‍🍳"));
      owner.appendChild(UI.el("div", "owner-name", UI.t("ownerLabel")));
      facade.appendChild(owner);
      UI.decorateFront(facade);
      el.appendChild(facade);

      // Nút chính
      const main = UI.el("div", "menu-buttons");
      main.appendChild(UI.button(UI.t("btnOpenShop"), "btn-pink big", () => router.go("Map")));
      main.appendChild(UI.button(UI.t("btnUpgrade"), "btn-orange big", () => router.go("Shop")));
      main.appendChild(UI.button(UI.t("btnMemories"), "btn-purple big", () => router.go("Album")));
      el.appendChild(main);

      const small = UI.el("div", "menu-small");
      small.appendChild(UI.button(UI.t("btnReviews"), "btn-white small", () => router.go("Review")));
      const checkBtn = UI.button(UI.t("btnCheckin"), "btn-white small", () => openCheckin());
      const questBtn = UI.button(UI.t("btnQuests"), "btn-white small", () => openQuests());
      small.appendChild(checkBtn);
      small.appendChild(questBtn);
      el.appendChild(small);

      el.appendChild(UI.el("div", "footer", UI.t("footer")));
      root.appendChild(el);

      function refreshDots() {
        checkBtn.classList.toggle("has-dot", !Pr.checkinInfo().claimedToday);
        questBtn.classList.toggle("has-dot", Pr.questsClaimable() > 0);
      }
      refreshDots();

      // ---------- Cài đặt ----------
      function openSettings() {
        const body = UI.el("div", "settings");
        const toggle = (key, label) => {
          const row = UI.el("div", "set-row");
          row.appendChild(UI.el("span", "set-label", label));
          const btn = UI.el("button", "switch" + (S.settings[key] ? " on" : ""));
          btn.type = "button";
          btn.setAttribute("role", "switch");
          btn.setAttribute("aria-label", label);
          btn.appendChild(UI.el("span", "switch-text", S.settings[key] ? UI.t("on") : UI.t("off")));
          btn.addEventListener("click", () => {
            S.settings[key] = !S.settings[key];
            btn.classList.toggle("on", S.settings[key]);
            btn.firstChild.textContent = S.settings[key] ? UI.t("on") : UI.t("off");
            BT.Audio.applySettings();
            BT.Save.persist();
            BT.Audio.play("tap");
            if (key === "vibrate" && S.settings.vibrate) BT.Audio.vibrate(CONFIG.gameplay.vibrateGood);
          });
          row.appendChild(btn);
          body.appendChild(row);
        };
        toggle("music", UI.t("setMusic"));
        toggle("sfx", UI.t("setSfx"));
        if (navigator.vibrate) toggle("vibrate", UI.t("setVibrate"));
        body.appendChild(UI.button(UI.t("setHowTo"), "btn-purple small", () => { m.close(true); UI.howTo(); }));
        body.appendChild(UI.button(UI.t("setBackup"), "btn-white small", () => UI.toast(UI.t("comingSoonShort"))));
        body.appendChild(UI.button(UI.t("setWipe"), "btn-white small danger", () => UI.toast(UI.t("comingSoonShort"))));
        body.appendChild(UI.el("div", "set-footer", UI.t("footer")));
        const m = UI.modal({ title: UI.t("settingsTitle"), body, dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      }

      // ---------- Điểm danh 7 ngày ----------
      function openCheckin() {
        const info = Pr.checkinInfo();
        const last = CONFIG.checkinRewards.length - 1;
        const grid = UI.el("div", "checkin-grid");
        CONFIG.checkinRewards.forEach((r, i) => {
          const done = info.claimedToday ? i <= info.index : i < info.index;
          const cell = UI.el("div", "checkin-cell" + (done ? " done" : "") + (i === info.index && !info.claimedToday ? " today" : "") + (i === last ? " big" : ""));
          cell.appendChild(UI.el("div", "ck-day", UI.t("checkinDay", { n: i + 1 })));
          cell.appendChild(UI.el("div", "ck-icon", done ? "✅" : i === last ? "💝" : "🎁"));
          cell.appendChild(UI.el("div", "ck-reward", UI.money(r)));
          grid.appendChild(cell);
        });
        const body = UI.el("div", "checkin");
        body.appendChild(grid);
        if (info.claimedToday) body.appendChild(UI.el("div", "ck-note", UI.t("checkinDone")));
        const buttons = [];
        if (!info.claimedToday) {
          buttons.push({
            label: UI.t("checkinClaim"),
            cls: "btn-pink",
            onClick: () => {
              const got = Pr.checkinClaim();
              if (!got) return;
              BT.Audio.play("win");
              UI.confetti(40);
              UI.modal({
                title: UI.t("checkinGot", { x: UI.money(got.reward) }),
                body: P.dailyCheckinMessages[got.index] || "",
                className: "modal-welcome",
                buttons: [{ label: UI.t("btnClose"), cls: "btn-pink", onClick: () => router.go("Menu", {}, { replace: true }) }]
              });
            }
          });
        }
        buttons.push({ label: UI.t("btnClose"), cls: "btn-white" });
        UI.modal({ title: UI.t("checkinTitle"), body, dismissable: true, buttons });
      }

      // ---------- Nhiệm vụ hằng ngày ----------
      function openQuests() {
        const list = UI.el("div", "quest-list");
        Pr.quests().forEach((q) => {
          const def = CONFIG.quests.find((x) => x.id === q.id);
          const done = q.progress >= def.n;
          const row = UI.el("div", "quest-row" + (q.claimed ? " claimed" : done ? " done" : ""));
          const info = UI.el("div", "quest-info");
          info.appendChild(UI.el("div", "quest-text", UI.fmt(def.text, { n: def.n, x: UI.money(def.n) })));
          const bar = UI.el("div", "xp-bar");
          const fill = UI.el("div", "xp-fill");
          fill.style.width = Math.min(100, (q.progress / def.n) * 100) + "%";
          bar.appendChild(fill);
          info.appendChild(bar);
          const prog = def.money
            ? UI.money(Math.min(q.progress, def.n)) + " / " + UI.money(def.n)
            : UI.t("questProgress", { a: Math.min(q.progress, def.n), b: def.n });
          info.appendChild(UI.el("div", "quest-prog", prog + " · " + UI.t("questReward", { x: UI.money(def.reward) })));
          row.appendChild(info);
          const btn = UI.button(q.claimed ? UI.t("questClaimed") : UI.t("questClaim"), "btn-green small", () => {
            if (q.claimed || !done) return;
            q.claimed = true;
            S.wallet += def.reward;
            BT.Save.persist();
            BT.Audio.play("coin");
            UI.toast(UI.t("questDone", { x: UI.money(def.reward) }));
            btn.textContent = UI.t("questClaimed");
            btn.disabled = true;
            row.classList.add("claimed");
            refreshDots();
            stats.firstChild.textContent = "🪙 " + UI.money(S.wallet);
          });
          if (q.claimed || !done) btn.disabled = true;
          row.appendChild(btn);
          list.appendChild(row);
        });
        UI.modal({ title: UI.t("questTitle"), body: list, dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-white" }] });
      }

      // Ngày đặc biệt: 11/01 hằng năm hoặc tròn bội số 100 ngày yêu → pháo hoa + banner
      const ann = String(P.anniversary).split("-").map(Number);
      const now = new Date();
      const n = UI.loveDays();
      if ((now.getMonth() + 1 === ann[1] && now.getDate() === ann[2]) || (n > 0 && n % 100 === 0)) {
        facade.appendChild(UI.el("div", "special-banner", UI.t("specialDayBanner")));
        setTimeout(() => UI.confetti(80), 500);
      }

      // Lần đầu mở game: popup chào mừng → vào thẳng Chuẩn bị Ngày 1
      if (!BT.Save.available) UI.toast(UI.t("privateMode"), 3200);
      if (!S.welcomeSeen) {
        S.welcomeSeen = true;
        BT.Save.persist();
        UI.modal({
          title: UI.t("welcomeTitle"),
          body: P.welcomeMessage,
          className: "modal-welcome",
          buttons: [{
            label: UI.t("btnWelcome"),
            cls: "btn-pink",
            onClick: () => {
              // Bộ 7 thẻ "Cách chơi" → tự vào Chuẩn bị Ngày 1
              UI.howTo(() => {
                S.tutorialDone.cards = true;
                BT.Save.persist();
                router.go("Prep", { day: 1 });
              });
            }
          }]
        });
      }

      return { destroy() { UI.closeAllModals(); } };
    }
  };
})();
