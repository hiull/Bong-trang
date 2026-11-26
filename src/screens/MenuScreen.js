// MenuScreen.js — Màn hình chính: biển hiệu, số ngày bên nhau, cấp độ & danh hiệu tiệm,
// điểm danh 7 ngày, nhiệm vụ hằng ngày, trang trí & thú cưng, giao diện mùa.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Menu = {
    mount(root, params, router) {
      const scope = UI.scope();   // hẹn giờ của Menu, tự huỷ khi rời Menu
      const S = BT.Save.state;
      const P = window.PERSONAL;
      const Pr = BT.Progress;
      BT.Fun.ensureFirstPlay();
      const special = BT.Fun.specialToday();
      const el = UI.el("div", "screen menu skin-" + BT.Fun.skin() + (special ? " special-day" : ""));

      // Góc trên
      const top = UI.el("div", "menu-top");
      const stats = UI.el("div", "menu-stats");
      stats.appendChild(UI.el("div", "pill", "🪙 " + UI.money(S.wallet)));
      const rating = Pr.shopRating();
      stats.appendChild(UI.el("div", "pill", "⭐ " + (rating ? UI.rating(rating) : "–")));
      stats.appendChild(UI.el("div", "pill", UI.t("goldHearts", { a: (S.season || 1) === 2 ? S.s2.goldHearts : S.goldHearts, b: CONFIG.build.maxPlayableDay })));
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
      if (special) facade.appendChild(UI.el("div", "special-deco", "🎈 💝 🎁 💝 🎈"));
      el.appendChild(facade);

      // Nút chính
      const main = UI.el("div", "menu-buttons");
      main.appendChild(UI.button(UI.t("btnOpenShop"), "btn-pink big", () => router.go("Map")));
      main.appendChild(UI.button(UI.t("btnUpgrade"), "btn-orange big", () => router.go("Shop")));
      main.appendChild(UI.button(UI.t("btnMemories"), "btn-purple big", () => router.go("Album")));
      el.appendChild(main);

      // Ngày đặc biệt (theo ngày thật)
      if (special) el.appendChild(UI.el("div", "special-banner", special.title));

      // Mùa mới
      if (BT.MS.nextSeasonReady()) {
        const sc = UI.el("button", "season-card");
        sc.type = "button";
        sc.appendChild(UI.el("div", "season-card-title", UI.t("seasonCardTitle")));
        sc.appendChild(UI.el("div", "season-card-sub", UI.t("seasonCardSub")));
        sc.addEventListener("click", () => {
          BT.Audio.play("letter");
          UI.modal({ title: UI.t("seasonModalTitle"), body: UI.fmt(P.season2Intro), className: "modal-welcome modal-season",
            buttons: [{ label: UI.t("btnStartSeason"), cls: "btn-pink", onClick: () => { BT.MS.startSeason(2); router.go("Map", {}, { replace: false }); } }] });
        });
        el.appendChild(sc);
      } else if ((S.season || 1) === 2 && S.s2.endingSeen) {
        el.appendChild(UI.el("div", "season-soon", UI.t("season3Soon")));
      }

      // Thử thách hôm nay
      const modes = UI.el("div", "menu-modes");
      const dailyBtn = UI.button(UI.t("dailyBtn"), "btn-green small daily-btn", () => {
        if (!BT.Daily.unlocked()) { UI.toast(UI.t("dailyLocked", { n: CONFIG.daily.fromMilestone })); return; }
        openDaily();
      });
      if (!BT.Daily.unlocked()) {
        dailyBtn.classList.add("locked");
        dailyBtn.appendChild(UI.el("span", "mode-sub", UI.t("dailyLocked", { n: CONFIG.daily.fromMilestone })));
      }
      modes.appendChild(dailyBtn);
      // Ca vô tận
      const endlessBtn = UI.button(UI.t("endlessBtn"), "btn-purple small endless-btn", () => {
        if (!BT.Endless.unlocked()) { UI.toast(UI.t("dailyLocked", { n: CONFIG.endless.fromMilestone })); return; }
        BT.startEndless(router);
      });
      endlessBtn.appendChild(UI.el("span", "mode-sub", BT.Endless.unlocked() ? UI.t("endlessBest", { n: S.endless.best }) : UI.t("dailyLocked", { n: CONFIG.endless.fromMilestone })));
      if (!BT.Endless.unlocked()) endlessBtn.classList.add("locked");
      modes.appendChild(endlessBtn);
      const kitchenBtn = UI.button(UI.t("kitchenBtn"), "btn-white small kitchen-btn", () => BT.Fun.openKitchen());
      kitchenBtn.appendChild(UI.el("span", "mode-sub", S.customs.length + "/" + CONFIG.customDish.max));
      modes.appendChild(kitchenBtn);
      el.appendChild(modes);

      // Sổ tay: gom Điểm danh, Nhiệm vụ, Tuần này, Thư, Đánh giá vào một nút (chấm đỏ tổng)
      const NB = [
        { id: "checkin", cls: "checkin-tile", label: "btnCheckin", dot: () => !Pr.checkinInfo().claimedToday, go: () => openCheckin() },
        { id: "quests", cls: "quests-tile", label: "btnQuests", dot: () => Pr.questsClaimable() > 0, go: () => openQuests() },
        { id: "week", cls: "week-btn", label: "weekBtn", dot: () => !BT.Fun.weekly().claimed && BT.Fun.weeklyDone(), go: () => BT.Fun.openWeekly(refreshDots) },
        { id: "mail", cls: "mail-btn", label: "mailBtn", dot: () => BT.Fun.unreadLetters() > 0, go: () => { BT.Fun.openMail(); refreshDots(); } },
        { id: "review", cls: "review-tile", label: "btnReviews", dot: () => false, go: () => router.go("Review") }
      ];
      const small = UI.el("div", "menu-small");
      const nbBtn = UI.button(UI.t("notebookBtn"), "btn-white notebook-btn", () => openNotebook());
      small.appendChild(nbBtn);
      el.appendChild(small);
      function openNotebook() {
        const grid = UI.el("div", "nb-grid");
        let api = null;
        NB.forEach((t) => {
          const tile = UI.button(UI.t(t.label), "btn-white nb-tile " + t.cls + (t.dot() ? " has-dot" : ""), () => { api.close(true); t.go(); });
          grid.appendChild(tile);
        });
        api = UI.modal({ title: UI.t("notebookTitle"), body: grid, className: "modal-notebook", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      }

      // Lời nhắc chống mất tiến trình nằm chỗ dòng chữ cuối (không che nút nào)
      const footBox = UI.el("div", "menu-foot");
      const drawFoot = () => {
        footBox.innerHTML = "";
        const tip = BT.Safety.tipEl(drawFoot);
        footBox.appendChild(tip || UI.el("div", "footer", UI.t("footer")));
      };
      drawFoot();
      el.appendChild(footBox);
      root.appendChild(el);

      function refreshDots() {
        dailyBtn.classList.toggle("has-dot", BT.Daily.unlocked() && !BT.Daily.playedToday());
        nbBtn.classList.toggle("has-dot", NB.some((t) => t.dot()));
      }
      refreshDots();

      // Quà của anh Hiếu ngày đặc biệt (mỗi ngày một lần)
      const gift = S.welcomeSeen ? BT.Fun.giftDue() : null;
      // Có gì mới: save cũ xem một lần mỗi khi có bản mới (nhường quà ngày đặc biệt)
      if (S.welcomeSeen && !gift && S.whatsNewSeen !== CONFIG.whatsNew.version) scope.timeout(() => { if (!UI.modals.length) openWhatsNew(); }, 400);

      function openWhatsNew() {
        const W = CONFIG.whatsNew;
        S.whatsNewSeen = W.version;
        BT.Save.persist();
        let i = 0;
        const body = UI.el("div", "wn");
        const holder = UI.el("div", "wn-holder");
        const dots = UI.el("div", "wn-dots");
        const nav = UI.el("div", "wn-nav");
        body.appendChild(holder);
        body.appendChild(dots);
        body.appendChild(nav);
        const actions = {
          backup: () => openBackup(),
          kitchen: () => BT.Fun.openKitchen(),
          badges: () => BT.Fun.openBadges(),
          weekly: () => BT.Fun.openWeekly(refreshDots),
          mail: () => { BT.Fun.openMail(); refreshDots(); },
          settings: () => openSettings()
        };
        let api = null;
        const draw = () => {
          const it = W.items[i];
          holder.innerHTML = "";
          const card = UI.el("div", "wn-card");
          card.appendChild(UI.el("div", "wn-icon", it.icon));
          card.appendChild(UI.el("div", "wn-title", it.title));
          card.appendChild(UI.el("div", "wn-text", it.text));
          if (it.go && actions[it.go]) card.appendChild(UI.button(UI.t("wnGo"), "btn-pink small wn-go", () => { api.close(true); actions[it.go](); }));
          holder.appendChild(card);
          dots.innerHTML = "";
          W.items.forEach((x, k) => dots.appendChild(UI.el("span", "wn-dot" + (k === i ? " on" : ""))));
          nav.innerHTML = "";
          const prev = UI.button(UI.t("wnPrev"), "btn-white small wn-prev", () => { if (i > 0) { i--; draw(); } });
          if (i === 0) prev.disabled = true;
          nav.appendChild(prev);
          nav.appendChild(i < W.items.length - 1
            ? UI.button(UI.t("wnNext"), "btn-white small wn-next", () => { i++; draw(); BT.Audio.play("tap"); })
            : UI.button(UI.t("wnDone"), "btn-pink small wn-done", () => api.close()));
        };
        api = UI.modal({ title: UI.t("wnTitle"), body, className: "modal-whatsnew", dismissable: true, buttons: [] });
        draw();
      }
      if (gift) {
        scope.timeout(() => {
          UI.confetti(80);
          BT.Audio.play("letter");
          const body = UI.el("div", "story");
          body.appendChild(UI.el("div", "story-text", UI.fmt(gift.message)));
          if (gift.gift) body.appendChild(UI.el("div", "info-note", UI.t("specialGift", { x: UI.money(gift.gift) })));
          UI.modal({ title: gift.title, body, className: "modal-welcome modal-special",
            buttons: [{ label: UI.t("specialGiftBtn"), cls: "btn-pink", onClick: () => { BT.Fun.claimGift(gift); router.go("Menu", {}, { replace: true }); } }] });
        }, 300);
      }

      // ---------- Thử thách hôm nay ----------
      function openDaily() {
        const D = BT.Daily;
        const key = D.dateKey();
        const run = D.run(key);
        const body = UI.el("div", "daily-body");
        const w = CONFIG.weathers[run.event];
        body.appendChild(UI.el("div", "info-line", UI.t("dailyEvent", { icon: w.icon, label: w.label })));
        body.appendChild(UI.el("div", "info-line", UI.t("dailyFocus", { dish: UI.recipe(run.cfg.focus).name })));
        const rule = CONFIG.daily.rules.find((r) => r.id === run.cfg.rule);
        body.appendChild(UI.el("div", "info-note", UI.t("dailyRule", { rule: rule.label })));
        const st = S.daily;
        const alive = st.lastDate === key || st.lastDate === Pr.yesterday();
        body.appendChild(UI.el("div", "daily-streak", alive && st.streak ? UI.t("dailyStreak", { n: st.streak }) : UI.t("dailyNoStreak")));
        if (st.best[key]) body.appendChild(UI.el("div", "info-line", UI.t("dailyBest", { x: UI.money(st.best[key]) })));
        body.appendChild(calendar(new Date(), st.played));
        const played = D.playedToday(key);
        UI.modal({ title: UI.t("dailyTitle"), body, className: "modal-daily", dismissable: true,
          buttons: [{ label: played ? UI.t("dailyReplay") : UI.t("dailyPlay"), cls: "btn-pink", onClick: () => router.go("Prep", { run }) }] });
      }

      function calendar(now, played) {
        const y = now.getFullYear(), m = now.getMonth();
        const box = UI.el("div", "cal");
        box.appendChild(UI.el("div", "cal-title", UI.t("calMonth", { m: m + 1, y })));
        const grid = UI.el("div", "cal-grid");
        CONFIG.texts.calWeek.forEach((d) => grid.appendChild(UI.el("span", "cal-head", d)));
        const first = (new Date(y, m, 1).getDay() + 6) % 7;
        for (let i = 0; i < first; i++) grid.appendChild(UI.el("span", "cal-cell empty"));
        const days = new Date(y, m + 1, 0).getDate();
        for (let d = 1; d <= days; d++) {
          const key = BT.Daily.dateKey(new Date(y, m, d));
          const c = UI.el("span", "cal-cell" + (played[key] ? " on" : "") + (d === now.getDate() ? " today" : ""), String(d));
          grid.appendChild(c);
        }
        box.appendChild(grid);
        return box;
      }

      // ---------- Cài đặt ----------
      function openSettings() {
        const body = UI.el("div", "settings");
        const refreshers = [];   // cập nhật lại các nút khi chọn chế độ nhanh
        // ---- Chế độ nhanh (đầu trang, luôn thấy) ----
        const presetBox = UI.el("div", "presets");
        const presetRow = UI.el("div", "preset-row");
        const presetNote = UI.el("div", "preset-note");
        presetBox.appendChild(UI.el("div", "set-section", UI.t("presetTitle")));
        presetBox.appendChild(presetRow);
        presetBox.appendChild(presetNote);
        body.appendChild(presetBox);
        const presetBtns = {};
        Object.keys(CONFIG.presets).forEach((id) => {
          const b = UI.button(UI.t("preset_" + id), "btn-white small preset-btn", () => {
            BT.applyPreset(id);
            BT.Audio.play("tap");
            refreshAll();
          });
          b.dataset.p = id;
          presetBtns[id] = b;
          presetRow.appendChild(b);
        });
        const refreshPreset = () => {
          const cur = BT.currentPreset();
          Object.keys(presetBtns).forEach((id) => presetBtns[id].classList.toggle("on", id === cur));
          UI.setText(presetNote, cur ? UI.t("presetHint_" + cur) : UI.t("presetCustom"));
        };
        const refreshAll = () => { refreshers.forEach((f) => f()); refreshPreset(); };
        // ---- Tab ----
        const tabs = UI.el("div", "set-tabs");
        body.appendChild(tabs);
        const panes = {};
        ["general", "assist", "events"].forEach((id, k) => {
          const t = UI.button(UI.t("setTab_" + id), "set-tab" + (k === 0 ? " on" : ""), () => {
            tabs.querySelectorAll(".set-tab").forEach((x) => x.classList.toggle("on", x === t));
            Object.keys(panes).forEach((pid) => { panes[pid].hidden = pid !== id; });
            BT.Audio.play("tap");
          });
          t.dataset.tab = id;
          tabs.appendChild(t);
          const pane = UI.el("div", "set-pane");
          pane.dataset.tab = id;
          pane.hidden = k !== 0;
          panes[id] = pane;
          body.appendChild(pane);
        });
        let pane = panes.general;
        const toggle = (key, label) => {
          const row = UI.el("div", "set-row");
          row.appendChild(UI.el("span", "set-label", label));
          const btn = UI.el("button", "switch" + (S.settings[key] ? " on" : ""));
          btn.type = "button";
          btn.setAttribute("role", "switch");
          btn.setAttribute("aria-label", label);
          btn.appendChild(UI.el("span", "switch-text", S.settings[key] ? UI.t("on") : UI.t("off")));
          // Đang bật Chế độ thư giãn: các trợ giúp nằm trong đó hiện Bật & khoá lại
          const locked = () => key !== "relaxMode" && !!S.settings.relaxMode && CONFIG.relaxMode.includes(key);
          const draw = () => {
            const on = locked() || !!S.settings[key];
            btn.classList.toggle("on", on);
            btn.disabled = locked();
            btn.title = locked() ? UI.t("setRelaxNote") : "";
            UI.setText(btn.firstChild, on ? UI.t("on") : UI.t("off"));
          };
          draw();
          refreshers.push(draw);
          btn.addEventListener("click", () => {
            if (locked()) return;
            S.settings[key] = !S.settings[key];
            if (key === "relaxMode") refreshers.forEach((f) => f()); else draw();
            BT.Audio.applySettings();
            BT.Save.persist();
            BT.Audio.play("tap");
            if (key === "vibrate" && S.settings.vibrate) BT.Audio.vibrate(CONFIG.gameplay.vibrateGood);
            if (key === "fullscreen") BT.Fullscreen.apply();
            refreshPreset();
          });
          row.appendChild(btn);
          pane.appendChild(row);
        };
        // Nút xoay vòng nhiều mức
        const cycler = (label, cls, values, names, get, set, lockedFn) => {
          const row = UI.el("div", "set-row");
          row.appendChild(UI.el("span", "set-label", label));
          const name = () => names[Math.max(0, values.indexOf(get()))];
          const btn = UI.button(name(), "btn-white small " + cls, () => {
            if (lockedFn && lockedFn()) return;
            const i = values.indexOf(get());
            set(values[(i + 1) % values.length]);
            draw();
            BT.Save.persist();
            BT.Audio.play("tap");
            refreshPreset();
          });
          const draw = () => { UI.setText(btn, name()); btn.dataset.v = String(get()); if (lockedFn) btn.disabled = lockedFn(); };
          refreshers.push(draw);
          draw();
          row.appendChild(btn);
          pane.appendChild(row);
          return btn;
        };
        // ---- Tab Chung ----
        toggle("music", UI.t("setMusic"));
        toggle("sfx", UI.t("setSfx"));
        if (navigator.vibrate) toggle("vibrate", UI.t("setVibrate"));
        if (BT.Fullscreen.supported()) toggle("fullscreen", UI.t("setFullscreen"));
        toggle("autoSeasonSkin", UI.t("setAutoSeasonSkin"));
        cycler(UI.t("setTextScale"), "ts-btn", [1, 2, 3], CONFIG.texts.textScales, () => S.settings.textScale || 1, (v) => { S.settings.textScale = v; BT.applyTextScale(); });
        pane.appendChild(UI.button(UI.t("setHowTo"), "btn-purple small", () => { m.close(true); UI.howTo(); }));
        pane.appendChild(UI.button(UI.t("setBackup"), "btn-white small set-backup", () => { m.close(true); openBackup(); }));
        pane.appendChild(UI.button(UI.t("setWhatsNew"), "btn-white small whatsnew-btn", () => { m.close(true); openWhatsNew(); }));
        pane.appendChild(UI.button(UI.t("setWipe"), "btn-white small danger", () => { m.close(true); openWipe(); }));
        // ---- Tab Trợ giúp ----
        pane = panes.assist;
        toggle("relaxMode", UI.t("setRelax"));
        toggle("oneTapDeliver", UI.t("setOneTapDeliver"));
        toggle("oneTapAction", UI.t("setOneTapAction"));
        toggle("tapPour", UI.t("setTapPour"));
        toggle("easyGrill", UI.t("setEasyGrill"));
        toggle("slowCustomers", UI.t("setSlowCustomers"));
        toggle("fewerRequests", UI.t("setFewerRequests"));
        toggle("bookPause", UI.t("setBookPause"));
        toggle("moreHearts", UI.t("setMoreHearts"));
        toggle("softFail", UI.t("setSoftFail"));
        toggle("threeTrays", UI.t("setThreeTrays"));
        toggle("easyHints", UI.t("setEasyHints"));
        toggle("lateAdd", UI.t("setLateAdd"));
        toggle("showRecipe", UI.t("setShowRecipe"));
        toggle("realRecipes", UI.t("setRealRecipes"));
        cycler(UI.t("setPatience"), "patience-btn", [0, 0.25, 0.5], CONFIG.texts.patienceLevels, () => (S.settings.relaxMode ? BT.patienceBoost() : S.settings.patienceBoost || 0), (v) => { S.settings.patienceBoost = v; }, () => !!S.settings.relaxMode);
        // ---- Tab Sự kiện: Vừa → Nhiều → Tắt → Ít ----
        pane = panes.events;
        pane.appendChild(UI.el("div", "set-note", UI.t("setEventsNote")));
        if (!S.settings.events) S.settings.events = {};
        const evNames = [1, 2, 0, 0.5].map((v) => CONFIG.texts.evLevels[String(v)]);
        BT.EVENT_KEYS.forEach((key) => {
          const btn = cycler(UI.t("ev_" + key), "ev-btn", [1, 2, 0, 0.5], evNames, () => BT.ev(key), (v) => { S.settings.events[key] = v; });
          btn.dataset.ev = key;
        });
        body.appendChild(UI.el("div", "set-footer", UI.t("footer")));
        refreshPreset();
        const m = UI.modal({ title: UI.t("settingsTitle"), body, className: "modal-settings", dismissable: true, buttons: [{ label: UI.t("btnClose"), cls: "btn-pink" }] });
      }

      // ---------- Sao lưu & Khôi phục mã TIEM1- ----------
      function openBackup() {
        BT.Safety.prepare();
        const body = UI.el("div", "backup");
        const out = UI.el("textarea", "backup-code");
        out.readOnly = true;
        out.rows = 3;
        out.value = "…";
        BT.Save.exportCode().then((code) => { out.value = code; });
        body.appendChild(out);
        body.appendChild(UI.button(UI.t("backupCopy"), "btn-pink small", () => {
          const code = out.value;
          const done = () => UI.toast(UI.t("backupCopied"), 2600);
          const manual = () => { out.focus(); out.select(); UI.toast(UI.t("backupCopyManual"), 2600); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, manual);
          else manual();
        }));
        body.appendChild(UI.el("div", "backup-warn", "⚠️ " + UI.t("backupWarn")));
        body.appendChild(UI.el("div", "backup-label", UI.t("backupFileHint")));
        const fileRow = UI.el("div", "backup-row");
        fileRow.appendChild(UI.button(UI.t("backupFile"), "btn-pink small backup-file", () => BT.Safety.saveFile()));
        fileRow.appendChild(UI.button(UI.t("backupOpen"), "btn-white small backup-open", () => {
          confirmBox(UI.t("backupConfirm"), UI.t("backupOpen"), () => {
            BT.Safety.openFile().then((done) => {
              if (!done) return;
              UI.closeAllModals();
              UI.toast(UI.t("backupDone"), 2600);
              BT.Audio.applySettings();
              router.stack.length = 0;
              router.go("Menu");
            }).catch((e) => UI.toast(e && e.message === "unsupported" ? UI.t("backupUnsupported") : UI.t("backupBad"), 3000));
          });
        }));
        body.appendChild(fileRow);
        body.appendChild(UI.el("div", "backup-label", UI.t("backupPaste")));
        const inp = UI.el("textarea", "backup-code");
        inp.rows = 3;
        inp.placeholder = UI.t("backupPlaceholder");
        body.appendChild(inp);
        body.appendChild(UI.button(UI.t("backupRestore"), "btn-orange small", () => {
          const code = inp.value.trim();
          if (!code) { UI.toast(UI.t("backupBad")); return; }
          confirmBox(UI.t("backupConfirm"), UI.t("backupRestore"), () => {
            BT.Save.importCode(code).then(() => {
              UI.closeAllModals();
              UI.toast(UI.t("backupDone"), 2600);
              BT.Audio.applySettings();
              router.stack.length = 0;
              router.go("Menu");
            }).catch((e) => UI.toast(e && e.message === "unsupported" ? UI.t("backupUnsupported") : UI.t("backupBad"), 3000));
          });
        }));
        UI.modal({ title: UI.t("backupTitle"), body, dismissable: true, className: "modal-backup", buttons: [{ label: UI.t("btnClose"), cls: "btn-white" }] });
      }

      function confirmBox(text, yes, onYes, cls) {
        UI.modal({ title: "", body: text, dismissable: true, buttons: [
          { label: yes, cls: cls || "btn-orange", onClick: onYes },
          { label: UI.t("cancel"), cls: "btn-white" }
        ] });
      }

      // ---------- Xoá dữ liệu (xác nhận 2 lần) ----------
      function openWipe() {
        confirmBox(UI.t("wipeConfirm1"), UI.t("wipeYes"), () => {
          confirmBox(UI.t("wipeConfirm2"), UI.t("wipeYes2"), () => {
            BT.Save.reset();
            BT.Audio.applySettings();
            UI.closeAllModals();
            router.stack.length = 0;
            router.go("Menu");
          }, "btn-red");
        }, "btn-red");
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
            UI.setText(btn, UI.t("questClaimed"));
            btn.disabled = true;
            row.classList.add("claimed");
            refreshDots();
            UI.setText(stats.firstChild, "🪙 " + UI.money(S.wallet));
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
                router.go("Prep", { run: BT.MS.run(BT.Save.state.ms.index) });
              });
            }
          }]
        });
      }

      return { destroy() { scope.clear(); UI.closeAllModals(); } };
    }
  };
})();
