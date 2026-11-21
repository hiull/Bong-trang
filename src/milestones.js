// milestones.js — Mốc thay cho ngày: sinh danh sách mốc từ CONFIG.days, tính tiến độ ca,
// tạo "Run" (mô tả một ca chơi) cho Chuẩn bị → Bán hàng → Tổng kết.
window.BT = window.BT || { Screens: {} };

(function () {
  const round2 = (x) => Math.round(x * 100) / 100;
  const round5 = (x) => Math.round(x / 5) * 5;
  const lerp = (a, b, t) => a + (b - a) * t;
  const NUM_KEYS = ["customers", "target", "spawn", "patienceMult"];

  let cache = null;

  function season() { return CONFIG.seasons[0]; }
  function dayCfg(k) { return CONFIG.days.find((d) => d.day === k); }

  function build() {
    const se = season();
    const m = se.minorPerMajor;
    const A = CONFIG.milestones.afterLast;
    const out = [];
    se.majorDays.forEach((k, ki) => {
      const cur = dayCfg(k);
      out.push({ index: out.length + 1, major: true, day: k, level: k, cfg: JSON.parse(JSON.stringify(cur)) });
      const next = ki + 1 < se.majorDays.length ? dayCfg(se.majorDays[ki + 1]) : null;
      for (let j = 1; j <= m; j++) {
        const t = j / (m + 1);
        let cfg;
        if (next) {
          cfg = {
            customers: Math.round(lerp(cur.customers, next.customers, t)),
            target: round5(lerp(cur.target, next.target, t)),
            spawn: [round2(lerp(cur.spawn[0], next.spawn[0], t)), round2(lerp(cur.spawn[1], next.spawn[1], t))],
            patienceMult: round2(lerp(cur.patienceMult, next.patienceMult, t))
          };
        } else {
          cfg = {
            customers: cur.customers + A.customers * j,
            target: round5(cur.target * Math.pow(A.targetMult, j)),
            spawn: cur.spawn.slice(),
            patienceMult: cur.patienceMult
          };
        }
        Object.assign(cfg, { day: k, unlock: [], weather: "sunny", tipMult: 1 });
        out.push({ index: out.length + 1, major: false, day: k, level: k, cfg });
      }
    });
    return out;
  }

  const MS = {
    _reset() { cache = null; },
    list() { if (!cache) cache = build(); return cache; },
    count() { return this.list().length; },
    get(i) { return this.list()[i - 1]; },
    majorIndex(k) { return 1 + (k - 1) * (1 + season().minorPerMajor); },
    need(i) { const C = CONFIG.milestones; return round2(C.shiftsBase + C.shiftsGrowth * (i - 1)); },
    current() { return this.get(BT.Save.state.ms.index); },

    units({ passed, stars, income, target }) {
      const C = CONFIG.milestones;
      if (passed) return stars >= 3 ? C.unitsThreeStar : C.unitsPass;
      const ratio = target > 0 ? income / target : 0;
      return round2(Math.max(C.unitsFailMin, C.unitsFailRatio * ratio));
    },

    // Cộng tiến độ vào mốc hiện tại; mỗi lần qua tối đa một mốc.
    addProgress(u, opts) {
      const C = CONFIG.milestones;
      const st = BT.Save.state.ms;
      const n = this.count();
      if (opts && opts.replay) u *= C.replayProgressRate;
      const before = { index: st.index, progress: st.progress };
      let cleared = null;
      const lastDone = st.index === n && st.cleared >= n;
      if (!lastDone) {
        st.progress = round2(st.progress + u);
        const need = this.need(st.index);
        if (st.progress >= need) {
          cleared = st.index;
          st.cleared = Math.max(st.cleared, st.index);
          if (st.index < n) {
            st.progress = round2(Math.min(C.carryMax, st.progress - need));
            st.index++;
          } else {
            st.progress = need;
          }
        }
      }
      BT.Save.persist();
      return { before, after: { index: st.index, progress: st.progress }, cleared };
    },

    pickEvent(level, prev, rnd) {
      rnd = rnd || Math.random;
      const E = CONFIG.shiftEvents;
      let ids = Object.keys(E).filter((id) => E[id].fromLevel <= level);
      if (ids.length > 1 && prev) ids = ids.filter((id) => id !== prev);
      const total = ids.reduce((s, id) => s + E[id].w, 0);
      let r = rnd() * total;
      for (const id of ids) { r -= E[id].w; if (r < 0) return id; }
      return ids[ids.length - 1];
    },

    shiftCfg(i, scripted, event) {
      const ms = this.get(i);
      if (scripted) return JSON.parse(JSON.stringify(ms.cfg));
      const cfg = { day: ms.day, unlock: [], weather: event, tipMult: 1 };
      NUM_KEYS.forEach((k) => { cfg[k] = Array.isArray(ms.cfg[k]) ? ms.cfg[k].slice() : ms.cfg[k]; });
      const ev = CONFIG.shiftEvents[event] || {};
      Object.keys(ev).forEach((k) => { if (k !== "w" && k !== "fromLevel") cfg[k] = ev[k]; });
      return cfg;
    },

    run(i, opts) {
      const replay = !!(opts && opts.replay);
      const S = BT.Save.state;
      const ms = this.get(i);
      const scripted = ms.major && !replay && !S.ms.firstDone[i];
      const event = scripted ? ms.cfg.weather : this.pickEvent(ms.level, S.ms.lastEvent);
      return { mode: replay ? "replay" : "story", key: "ms" + i, ms: i, level: ms.level, cfg: this.shiftCfg(i, scripted, event), event, scripted };
    },

    // Chuyển bản lưu theo ngày (version 1) sang mốc. Trả true nếu có chuyển.
    migrate(st) {
      if (!st || (st.version || 1) >= 2) return false;
      const n = this.count();
      const d = st.unlockedDay || 1;
      const ms = st.ms;
      if (d <= 15) { ms.index = this.majorIndex(d); ms.cleared = ms.index - 1; }
      else { ms.index = n; ms.cleared = n - 1; }
      ms.progress = 0;
      const days = st.days || {};
      Object.keys(days).forEach((k) => {
        const kn = Number(k);
        if (!kn) return;
        const i = this.majorIndex(kn);
        ms.best[i] = { stars: days[k].stars || 0, income: days[k].bestRevenue || 0 };
      });
      for (let k = 1; k < Math.min(d, 16); k++) ms.firstDone[this.majorIndex(k)] = true;
      ms.shifts = Object.keys(days).filter((k) => Number(k)).length;
      st.goldHearts = this.list().filter((m) => m.major && ms.best[m.index] && ms.best[m.index].stars >= 3).length;
      st.regularNext = {};
      const b = st.dayBackup;
      if (b && !b.finished) { st.wallet = b.wallet; st.inventory = JSON.parse(JSON.stringify(b.inventory || {})); st.today = null; }
      st.dayBackup = null;
      st.loseStreak = null;
      st.version = 2;
      return true;
    },

    secretRun() {
      const cfg = JSON.parse(JSON.stringify(CONFIG.days.find((d) => d.day === "secret")));
      return { mode: "secret", key: "secret", ms: BT.Save.state.ms.index, level: CONFIG.build.maxPlayableDay + 1, cfg, event: cfg.weather, scripted: true };
    },

    // Ca mới cùng kiểu với run (dùng cho "Chơi lại" trong menu tạm dừng)
    again(run) {
      if (run.mode === "story" || run.mode === "replay") return this.run(run.ms, { replay: run.mode === "replay" });
      if (run.mode === "secret") return this.secretRun();
      if (run.mode === "daily" && BT.Daily) return BT.Daily.run(run.date);
      if (run.mode === "endless" && BT.Endless) return BT.Endless.run();
      return run;
    },

    goldHearts() {
      const best = BT.Save.state.ms.best;
      return this.list().filter((m) => m.major && best[m.index] && best[m.index].stars >= 3).length;
    }
  };

  BT.MS = MS;

  // ---------------- Thử thách mỗi ngày ----------------
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pad = (n) => (n < 10 ? "0" : "") + n;
  function prevKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    const dt = new Date(y, m - 1, d - 1);
    return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
  }

  const Daily = {
    dateKey(d) { d = d || new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); },
    unlocked() { return BT.Save.state.ms.index >= CONFIG.daily.fromMilestone; },
    playedToday(key) { return !!BT.Save.state.daily.played[key || this.dateKey()]; },

    challenge(key, level) {
      const rng = mulberry32(Number(key.replace(/-/g, "")) * 7919 + 17);
      rng(); rng();
      const event = MS.pickEvent(level, null, rng);
      const dishes = CONFIG.recipes.filter((r) => r.openDay <= level && !r.combo);
      const focus = dishes[Math.floor(rng() * dishes.length)].id;
      const rules = CONFIG.daily.rules;
      const rule = rules[Math.floor(rng() * rules.length)];
      return { event, focus, rule };
    },

    run(key) {
      key = key || this.dateKey();
      const S = BT.Save.state;
      const i = S.ms.index;
      const ms = MS.get(i);
      const ch = this.challenge(key, ms.level);
      const cfg = MS.shiftCfg(i, false, ch.event);
      const r = ch.rule;
      if (r.patienceMult) cfg.patienceMult = Math.round(cfg.patienceMult * r.patienceMult * 100) / 100;
      if (r.tipMult) cfg.tipMult = (cfg.tipMult || 1) * r.tipMult;
      if (r.extraCustomers) cfg.customers += r.extraCustomers;
      if (r.friendMult) cfg.friendMult = r.friendMult;
      if (r.tomoVisits) cfg.tomoVisits = r.tomoVisits;
      cfg.focus = ch.focus;
      cfg.focusWeight = CONFIG.daily.focusWeight;
      cfg.rule = r.id;
      return { mode: "daily", key: "daily", date: key, ms: i, level: ms.level, cfg, event: ch.event, scripted: false };
    },

    tier(income, target) {
      const R = CONFIG.daily.tierRatios;
      const x = target > 0 ? income / target : 0;
      return x >= R[1] ? 2 : x >= R[0] ? 1 : 0;
    },

    complete(key, { income, target }) {
      const S = BT.Save.state;
      const D = S.daily;
      const tier = this.tier(income, target);
      D.best[key] = Math.max(D.best[key] || 0, income);
      const first = !D.played[key] && (D.lastDate === null || key > D.lastDate);
      if (!first) { BT.Save.persist(); return { first: false, note: null, units: 0, coins: 0, tier, streak: D.streak }; }
      D.played[key] = true;
      D.streak = D.lastDate === prevKey(key) ? D.streak + 1 : 1;
      D.lastDate = key;
      const notes = (window.PERSONAL && window.PERSONAL.dailyNotes) || [];
      let note = null;
      if (notes.length) {
        const idx = D.noteNext % notes.length;
        note = { index: idx, text: notes[idx] };
        D.notesSeen.push(idx);
        D.noteNext++;
      }
      const coins = CONFIG.daily.tierCoins[tier];
      S.wallet += coins;
      const progress = MS.addProgress(1);
      return { first: true, note, units: 1, coins, tier, streak: D.streak, progress };
    }
  };
  BT.Daily = Daily;
})();
