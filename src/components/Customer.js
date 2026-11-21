// Customer.js — Khách hàng: đi vào, bong bóng gọi món, thanh kiên nhẫn, phản ứng, đi ra.
// Giai đoạn 1: khách thường (Học sinh). Yêu cầu riêng, khách quen, Hiếu (Tomortle) và bạn bè
// sẽ thêm ở Giai đoạn 2–3.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;
  let nextId = 1;

  class Customer {
    // opts: { typeId, order: [recipeId], seat, centerPct, patienceMult, area, scope, onWalkout, onGone }
    constructor(opts) {
      const type = CONFIG.customerTypes[opts.typeId];
      this.id = nextId++;
      this.typeId = opts.typeId;
      this.type = type;
      this.order = opts.order;
      this.seat = opts.seat;
      this.area = opts.area;
      this.scope = opts.scope;
      this.onWalkout = opts.onWalkout;
      this.onGone = opts.onGone;

      const variant = type.variants ? UI.pick(type.variants) : null;
      this.avatar = variant ? variant.avatar : type.avatar;
      this.self = variant ? variant.self : type.self;
      this.call = UI.fmt(type.call);

      this.max = type.patience * opts.patienceMult;
      this.patience = this.max;
      this.state = "entering";
      this.wrongOnce = false;
      this.lowShown = false;

      this.build(opts.centerPct);
    }

    vars(extra) {
      return Object.assign({ self: this.self, call: this.call }, extra || {});
    }

    pct() { return this.max === Infinity ? 1 : Math.max(0, this.patience / this.max); }

    build(centerPct) {
      const el = UI.el("div", "customer");
      el.dataset.cid = String(this.id);
      el.dataset.order = this.order.join(",");
      el.style.left = centerPct + "%";

      const bubble = UI.el("div", "bubble");
      const r = UI.recipe(this.order[0]);
      if (this.order[0] === window.PERSONAL.favoriteDish) bubble.classList.add("fav");

      const speech = UI.el("div", "speech", UI.fmt(UI.pick(this.type.lines), this.vars({ dish: r.name })));
      const card = UI.el("div", "order-card");
      const dishRow = UI.el("div", "dish-row");
      dishRow.appendChild(UI.el("span", "dish-emoji", r.emoji));
      dishRow.appendChild(UI.el("span", "dish-name", r.short));
      card.appendChild(dishRow);
      const ings = UI.el("div", "dish-ings");
      [r.base].concat(r.toppings, r.finish.filter((s) => CONFIG.ingredients[s])).forEach((id) => {
        ings.appendChild(UI.el("span", "", UI.ing(id).emoji));
      });
      if (r.finish.includes("lac")) ings.appendChild(UI.el("span", "mini-step", "💫"));
      card.appendChild(ings);
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
      const mood = UI.el("div", "mood", "🙂");
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

    enter() {
      const el = this.el;
      this.area.appendChild(el);
      const areaW = this.area.clientWidth;
      const left = el.offsetLeft;
      const off = areaW - left + el.offsetWidth;
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

    update(dt) {
      if (this.state !== "waiting" || this.max === Infinity) return;
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
        if (this.state === "waiting") this.setMood(level === "low" ? "😤" : "🙂");
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
          this.bubble.dataset.mode = prev === "react" ? "order" : prev;
          this.setMood(this.pct() < CONFIG.gameplay.patienceLow ? "😤" : "🙂");
        }, sec * 1000);
      }
    }

    leave(delaySec) {
      this.state = "leaving";
      this.el.classList.remove("arrived");
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

  BT.Customer = Customer;
})();
