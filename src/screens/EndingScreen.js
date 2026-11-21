// EndingScreen.js — Màn kết thúc đặc biệt sau Ngày 15:
// tối dần → tiệm lên đèn → anh Hiếu bước vào cầm bó hoa → lời nhắn cuối hiện từng chữ →
// trình chiếu 15 thẻ kỷ niệm → "Đã bên nhau N ngày" → "Về tiệm" (mở Ngày bí mật).
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Ending = {
    mount(root, params, router) {
      const G = CONFIG.gameplay;
      const P = window.PERSONAL;
      const S = BT.Save.state;
      const scope = UI.scope();
      const el = UI.el("div", "screen ending");

      const stage = UI.el("div", "ending-stage");
      stage.appendChild(UI.el("div", "awning"));
      stage.appendChild(UI.el("div", "lights"));
      stage.appendChild(UI.el("div", "flowers"));
      stage.appendChild(UI.el("div", "menu-sign", P.shopName));
      const her = UI.el("div", "ending-her", "👩‍🍳");
      const him = UI.el("div", "ending-him");
      him.appendChild(UI.icon("tomortle"));
      him.appendChild(UI.el("span", "ending-flower", "💐"));
      stage.appendChild(her);
      stage.appendChild(him);
      el.appendChild(stage);

      const msgBox = UI.el("div", "ending-message");
      el.appendChild(msgBox);
      const slide = UI.el("div", "ending-slide");
      el.appendChild(slide);
      const final = UI.el("div", "ending-final");
      el.appendChild(final);
      const skip = UI.el("div", "ending-skip", UI.t("tapToSkip"));
      el.appendChild(skip);
      root.appendChild(el);

      let phase = "intro";
      let tw = null;
      let slideIndex = -1;
      let slideToken = 0;

      // 1) Tối dần → lên đèn → anh bước vào
      scope.timeout(() => el.classList.add("dark"), 200);
      scope.timeout(() => { el.classList.add("lit"); BT.Audio.play("tie"); }, 1600);
      scope.timeout(() => { him.style.transition = `transform ${G.endingWalkSec}s ease-out`; him.classList.add("in"); }, 2400);
      scope.timeout(() => startMessage(), 2400 + G.endingWalkSec * 1000 + 300);

      function startMessage() {
        if (phase !== "intro") return;
        phase = "message";
        UI.heartBurst(G.tomortleHearts, 2);
        msgBox.classList.add("show");
        const text = UI.el("div", "ending-text");
        msgBox.appendChild(text);
        tw = UI.typewriter(text, P.finalMessage, G.typeMsPerChar * 2, () => { skip.classList.add("show"); });
      }

      // 2) Trình chiếu 15 thẻ, mỗi thẻ 3 giây, mờ dần
      function startSlides() {
        phase = "slides";
        msgBox.classList.remove("show");
        stage.classList.add("fade");
        skip.classList.add("show");
        nextSlide();
      }
      function nextSlide() {
        slideIndex++;
        if (slideIndex >= P.memories.length) { showFinal(); return; }
        const m = P.memories[slideIndex];
        const card = UI.el("div", "slide-card");
        card.appendChild(UI.memoryPhoto(m, "big"));
        card.appendChild(UI.el("div", "mem-title", m.title));
        card.appendChild(UI.el("div", "mem-date", m.date));
        const old = slide.firstChild;
        if (old) { old.classList.add("out"); scope.timeout(() => old.remove(), 700); }
        slide.appendChild(card);
        const tok = ++slideToken;
        scope.timeout(() => { if (phase === "slides" && tok === slideToken) nextSlide(); }, G.endingSlideSec * 1000);
      }

      // 3) Dòng chữ cuối + nút Về tiệm
      function showFinal() {
        phase = "final";
        slide.innerHTML = "";
        skip.classList.remove("show");
        final.innerHTML = "";
        final.appendChild(UI.el("div", "ending-together", UI.t("endingTogether", { n: UI.loveDays() })));
        final.appendChild(UI.button(UI.t("btnToShop"), "btn-pink big", () => {
          router.backTo("Menu");
        }));
        final.classList.add("show");
        UI.confetti(80);
        BT.Audio.play("win");
        S.endingSeen = true;
        BT.Save.persist();
      }

      el.addEventListener("click", (e) => {
        if (e.target.closest(".btn")) return;
        if (phase === "intro") { startMessage(); el.classList.add("dark", "lit"); him.classList.add("in"); return; }
        if (phase === "message") {
          if (tw && !tw.isDone()) tw.finish();
          else startSlides();
          return;
        }
        if (phase === "slides") nextSlide();
      });

      return {
        destroy() { scope.clear(); },
        onBack() {
          if (phase !== "final") showFinal();
          return true;
        }
      };
    }
  };
})();
