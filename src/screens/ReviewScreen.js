// ReviewScreen.js — Sổ đánh giá của khách: điểm trung bình tiệm, danh sách nhận xét,
// trả lời đánh giá (trả lời đánh giá ≤ 3 sao → khách sửa thành +1 sao).
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;

  BT.Screens.Review = {
    mount(root, params, router) {
      const S = BT.Save.state;
      const el = UI.el("div", "screen review");
      el.appendChild(UI.topbar(UI.t("reviewTitle"), () => router.back()));

      const head = UI.el("div", "review-head");
      el.appendChild(head);
      const list = UI.el("div", "review-list");
      el.appendChild(list);
      root.appendChild(el);

      const stars = (n) => "★".repeat(n) + "☆".repeat(5 - n);

      function render() {
        head.innerHTML = "";
        const avg = BT.Progress.shopRating();
        head.appendChild(UI.el("div", "review-avg", avg ? UI.rating(avg) : "–"));
        const side = UI.el("div", "");
        side.appendChild(UI.el("div", "review-stars", stars(Math.round(avg))));
        side.appendChild(UI.el("div", "review-label", UI.t("reviewAvg") + " · " + UI.t("reviewCount", { n: S.reviews.length })));
        head.appendChild(side);

        list.innerHTML = "";
        if (!S.reviews.length) { list.appendChild(UI.el("div", "review-empty", UI.t("reviewEmpty"))); return; }
        S.reviews.forEach((r) => {
          const shown = Math.min(5, r.stars + r.bonus);
          const card = UI.el("div", "review-card" + (shown <= 2 ? " low" : ""));
          const top = UI.el("div", "review-top");
          top.appendChild(UI.el("span", "review-avatar", r.avatar || "🙂"));
          const who = UI.el("div", "review-who");
          who.appendChild(UI.el("div", "review-name", r.name));
          who.appendChild(UI.el("div", "review-day", UI.t("reviewDay", { n: r.day }) + (r.weight > 1 ? " · 📝 x" + r.weight : "")));
          top.appendChild(who);
          top.appendChild(UI.el("span", "review-card-stars", stars(shown)));
          card.appendChild(top);
          card.appendChild(UI.el("div", "review-text", r.text));
          if (r.reply) {
            card.appendChild(UI.el("div", "review-reply", UI.t("reviewReplied", { text: UI.fmt(r.reply) })));
          } else {
            const btn = UI.button(UI.t("reviewReply"), "btn-white small", () => openReply(r));
            card.appendChild(btn);
          }
          list.appendChild(card);
        });
      }

      function openReply(r) {
        UI.modal({
          title: UI.t("reviewReplyTitle"),
          body: "“" + r.text + "”",
          dismissable: true,
          buttons: CONFIG.reviewReplies.map((txt) => ({
            label: UI.fmt(txt),
            cls: "btn-white story-choice",
            onClick: () => {
              r.reply = txt;
              if (r.stars <= CONFIG.reviewReplyBonusMax && !r.bonus) {
                r.bonus = 1;
                UI.toast(UI.t("reviewFixed", { n: Math.min(5, r.stars + 1) }));
                BT.Audio.play("star");
              } else BT.Audio.play("pop");
              BT.Save.persist();
              render();
            }
          }))
        });
      }

      render();
      return { destroy() { UI.closeAllModals(); } };
    }
  };
})();
