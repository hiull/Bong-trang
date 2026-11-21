// Customer.js — Khách hàng: đi vào, bong bóng gọi món (1–2 món, yêu cầu riêng màu cam),
// thanh kiên nhẫn, phản ứng, đi ra. Mèo hoang chỉ xin 1 trứng cút.
// Khách Hiếu (Tomortle), nhóm bạn & khách quen có cốt truyện sẽ thêm ở Giai đoạn 3.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;
  let nextId = 1;

  function reqText(q) {
    const def = CONFIG.specialRequests.find((x) => x.id === q.id);
    return UI.fmt(def.text, { n: q.n });
  }

  class Customer {
    // opts: { typeId, items: [{id, reqs}], combo, reviewer, seat, centerPct, patienceMult, area, scope, onWalkout, onGone }
    constructor(opts) {
      const type = CONFIG.customerTypes[opts.typeId];
      this.id = nextId++;
      this.typeId = opts.typeId;
      this.type = type;
      this.isCat = type.kind === "cat";
      this.items = (opts.items || []).map((x) => ({ id: x.id, reqs: x.reqs || [], done: false }));
      this.combo = !!opts.combo;
      this.reviewer = !!opts.reviewer;
      this.seat = opts.seat;
      this.area = opts.area;
      this.scope = opts.scope;
      this.onWalkout = opts.onWalkout;
      this.onGone = opts.onGone;

      const variant = type.variants ? UI.pick(type.variants) : null;
      this.avatar = variant ? variant.avatar : type.avatar;
      this.self = variant ? variant.self : type.self || "";
      this.call = UI.fmt(type.call || "");

      this.max = type.patience * opts.patienceMult;
      this.patience = this.max;
      this.state = "entering";
      this.wrongOnce = false;

      this.build(opts.centerPct);
    }

    vars(extra) { return Object.assign({ self: this.self, call: this.call }, extra || {}); }
    pct() { return this.max === Infinity ? 1 : Math.max(0, this.patience / this.max); }
    pending() { return this.items.filter((x) => !x.done); }
    hasRequests() { return this.items.some((x) => x.reqs.length > 0); }
    zones() { return this.pending().map((x) => UI.recipe(x.id).zone); }

    dishLabel() {
      if (this.combo) return UI.t("comboName");
      return this.items.map((x) => UI.recipe(x.id).name.toLowerCase()).join(" với ");
    }

    build(centerPct) {
      const el = UI.el("div", "customer" + (this.isCat ? " cat" : ""));
      el.dataset.cid = String(this.id);
      el.dataset.order = this.items.map((x) => x.id).join(",");
      el.style.left = centerPct + "%";

      const bubble = UI.el("div", "bubble");
      if (this.items.some((x) => x.id === window.PERSONAL.favoriteDish) || this.combo) bubble.classList.add("fav");

      let speechText;
      if (this.isCat) speechText = UI.t("catLine");
      else {
        speechText = UI.fmt(UI.pick(this.type.lines), this.vars({ dish: this.dishLabel() }));
      }
      const speech = UI.el("div", "speech", speechText);
      const card = UI.el("div", "order-card");
      if (this.isCat) {
        const row = UI.el("div", "dish-row");
        row.appendChild(UI.el("span", "dish-emoji", "🥚"));
        card.appendChild(row);
      } else {
        if (this.combo) card.appendChild(UI.el("div", "combo-tag", UI.t("comboName")));
        this.rows = this.items.map((it) => {
          const r = UI.recipe(it.id);
          const box = UI.el("div", "dish-box");
          const dishRow = UI.el("div", "dish-row");
          dishRow.appendChild(UI.el("span", "dish-emoji", r.emoji));
          dishRow.appendChild(UI.el("span", "dish-name", r.short));
          box.appendChild(dishRow);
          if (this.items.length === 1) {
            const ings = UI.el("div", "dish-ings");
            const req = BT.Tray.requirements(it);
            const list = [r.base];
            if (req.pour) list.push(req.pour);
            const tops = [];
            Object.keys(req.need).forEach((id) => { for (let i = 0; i < req.need[id]; i++) tops.push(id); });
            // Quầy nước: ly → rót → đá → topping; các khu khác: topping → bước kết thúc
            if (r.zone === "nuoc") list.push(...req.finishIngs, ...tops);
            else list.push(...tops, ...req.finishIngs);
            Object.keys(req.sauces).forEach((id) => { for (let i = 0; i < req.sauces[id]; i++) list.push(id); });
            list.forEach((id) => ings.appendChild(UI.el("span", "", UI.ing(id).emoji)));
            if (r.finish.includes("lac")) ings.appendChild(UI.el("span", "mini-step", "💫"));
            box.appendChild(ings);
          }
          if (it.reqs.length) box.appendChild(UI.el("div", "req-note", it.reqs.map(reqText).join(" · ")));
          card.appendChild(box);
          return box;
        });
      }
      const react = UI.el("div", "react");
      const bar = UI.el("div", "pbar");
      const fill = UI.el("div", "pfill");
      bar.appendChild(fill);

      bubble.appendChild(speech);
      bubble.appendChild(card);
      bubble.appendChild(react);
      bubble.appendChild(bar);
      bubble.dataset.mode = "speech";

      const body = UI.el("div", "cbody");
      body.appendChild(UI.el("div", "avatar", this.avatar));
      if (this.type.accessory) body.appendChild(UI.el("div", "accessory", this.type.accessory));
      if (this.reviewer) {
        const badge = UI.el("div", "badge-review", "📝");
        badge.title = UI.t("reviewerBadge");
        body.appendChild(badge);
      }
      const mood = UI.el("div", "mood", this.isCat ? "" : "🙂");
      body.appendChild(mood);
      body.appendChild(UI.el("div", "cshadow"));

      el.appendChild(bubble);
      el.appendChild(body);

      this.el = el;
      this.bubble = bubble;
      this.fill = fill;
      this.moodEl = mood;
      this.reactEl = react;
      this.updateBar();
    }

    markDone(item) {
      item.done = true;
      const i = this.items.indexOf(item);
      if (this.rows && this.rows[i]) this.rows[i].classList.add("done");
      this.el.dataset.order = this.pending().map((x) => x.id).join(",");
    }

    enter() {
      const el = this.el;
      this.area.appendChild(el);
      const off = this.area.clientWidth - el.offsetLeft + el.offsetWidth;
      const sec = this.type.enterSec || CONFIG.gameplay.customerEnterSec;
      el.style.transition = "none";
      el.style.transform = `translateX(${off}px)`;
      el.classList.add("walking");
      void el.offsetWidth;
      el.style.transition = `transform ${sec}s ease-out`;
      el.style.transform = "translateX(0px)";
      this.scope.timeout(() => this.arrive(), sec * 1000);
    }

    arrive() {
      if (this.state !== "entering") return;
      this.state = "waiting";
      this.el.classList.remove("walking");
      this.el.classList.add("arrived");
      BT.Audio.play("pop");
      this.scope.timeout(() => {
        if (this.state === "waiting" && this.bubble.dataset.mode === "speech") this.bubble.dataset.mode = "order";
      }, CONFIG.gameplay.speechShowSec * 1000);
    }

    update(dt, frozen) {
      if (this.state !== "waiting" || this.max === Infinity) return;
      this.el.classList.toggle("frozen", !!frozen);
      if (frozen) return;
      this.patience -= dt;
      this.updateBar();
      if (this.patience <= 0) {
        this.patience = 0;
        this.onWalkout(this);
      }
    }

    updateBar() {
      const p = this.pct();
      const G = CONFIG.gameplay;
      this.fill.style.width = (p * 100).toFixed(1) + "%";
      const level = p > G.patienceHigh ? "high" : p >= G.patienceLow ? "mid" : "low";
      if (this.fill.dataset.level !== level) {
        this.fill.dataset.level = level;
        this.bubble.classList.toggle("low", level === "low");
        if (this.state === "waiting" && !this.isCat) this.setMood(level === "low" ? "😤" : "🙂");
      }
    }

    setMood(m) { this.moodEl.textContent = m; }

    penalize(ratio) {
      this.patience = Math.max(0.01, this.patience - this.max * ratio);
      this.updateBar();
    }

    // Câu phản hồi tạm thời trong bong bóng
    react(text, mood, sec) {
      this.reactEl.textContent = text;
      const prev = this.bubble.dataset.mode;
      this.bubble.dataset.mode = "react";
      if (mood) this.setMood(mood);
      const stamp = (this.reactStamp = (this.reactStamp || 0) + 1);
      if (sec) {
        this.scope.timeout(() => {
          if (this.reactStamp !== stamp || this.state !== "waiting") return;
          this.bubble.dataset.mode = prev === "react" ? "order" : prev === "speech" ? "order" : prev;
          if (!this.isCat) this.setMood(this.pct() < CONFIG.gameplay.patienceLow ? "😤" : "🙂");
        }, sec * 1000);
      }
    }

    leave(delaySec) {
      this.state = "leaving";
      this.el.classList.remove("arrived", "frozen");
      this.scope.timeout(() => {
        const el = this.el;
        const off = el.offsetLeft + el.offsetWidth + 20;
        const sec = CONFIG.gameplay.customerExitSec;
        el.classList.add("walking", "exiting");
        el.style.transition = `transform ${sec}s ease-in`;
        el.style.transform = `translateX(${-off}px)`;
        this.scope.timeout(() => {
          el.remove();
          this.onGone(this);
        }, sec * 1000);
      }, (delaySec || 0) * 1000);
    }
  }

  Customer.reqText = reqText;
  BT.Customer = Customer;
})();
