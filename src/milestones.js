// milestones.js — Mốc thay cho ngày: sinh danh sách mốc từ CONFIG.days, tính tiến độ ca,
// tạo "Run" (mô tả một ca chơi) cho Chuẩn bị → Bán hàng → Tổng kết.
window.BT = window.BT || { Screens: {} };

(function () {
  const round2 = (x) => Math.round(x * 100) / 100;
  const round5 = (x) => Math.round(x / 5) * 5;
  const lerp = (a, b, t) => a + (b - a) * t;
  const NUM_KEYS = ["customers", "target", "spawn", "patienceMult"];

  let cache = {};

  const curSeason = () => (BT.Save && BT.Save.state && BT.Save.state.season) || 1;
  function season(sid) { sid = sid || curSeason(); return CONFIG.seasons.find((x) => x.id === sid) || CONFIG.seasons[0]; }
  function dayCfg(k) { return CONFIG.days.find((d) => d.day === k); }

  function build(sid) {
    const se = season(sid);
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
    _reset() { cache = {}; },
    season(sid) { return season(sid); },
    list(sid) { sid = sid || curSeason(); if (!cache[sid]) cache[sid] = build(sid); return cache[sid]; },
    count(sid) { return this.list(sid).length; },
    get(i, sid) { return this.list(sid)[i - 1]; },
    // Chỉ số mốc của mốc lớn ứng với ngày `day` trong mùa sid
    majorIndex(day, sid) { const se = season(sid); return 1 + se.majorDays.indexOf(day) * (1 + se.minorPerMajor); },
    // Trạng thái tiến độ của một mùa (mùa đang chơi là S.ms)
    stateOf(sid) {
      const S = BT.Save.state;
      sid = sid || S.season || 1;
      if (sid === (S.season || 1)) return S.ms;
      S.msBySeason = S.msBySeason || {};
      return S.msBySeason[sid] || (S.msBySeason[sid] = { index: 1, progress: 0, cleared: 0, shifts: 0, best: {}, firstDone: {}, lastEvent: null });
    },
    // Mùa hiện tại đã đi hết, đã xem đoạn kết, và có mùa sau
    nextSeasonReady() {
      const S = BT.Save.state;
      const sid = S.season || 1;
      const ended = sid === 1 ? S.endingSeen : !!(S.s2 && S.s2.endingSeen);
      return S.ms.cleared >= this.count(sid) && ended && CONFIG.seasons.some((x) => x.id === sid + 1);
    },
    startSeason(sid) {
      const S = BT.Save.state;
      const old = S.season || 1;
      if (sid === old) return;
      S.msBySeason = S.msBySeason || {};
      S.msBySeason[old] = S.ms;
      S.ms = S.msBySeason[sid] || { index: 1, progress: 0, cleared: 0, shifts: 0, best: {}, firstDone: {}, lastEvent: null };
      delete S.msBySeason[sid];
      S.season = sid;
      // Hẹn truyện khách quen đang tính theo số ca của mùa cũ → tính lại từ đầu mùa mới
      S.regularNext = {};
      if (sid === 2 && S.s2) S.s2.started = true;
      BT.Save.persist();
    },
    need(i) { const C = CONFIG.milestones; return round2(C.shiftsBase + C.shiftsGrowth * (i - 1)); },
    current() { return this.get(BT.Save.state.ms.index); },

    units({ passed, stars, income, target }) {
      const C = CONFIG.milestones;
      if (passed) return stars >= 3 ? C.unitsThreeStar : C.unitsPass;
      const ratio = target > 0 ? income / target : 0;
      const min = BT.assist && BT.assist("softFail") ? CONFIG.assist.softFailMin : C.unitsFailMin;
      return round2(Math.max(min, C.unitsFailRatio * ratio));
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
      // Cài đặt → Sự kiện: tắt thì luôn trời nắng bình thường; Ít/Nhiều nhân trọng số các sự kiện khác
      const m = BT.ev("shiftEvent");
      if (m <= 0) return "sunny";
      const w = (id) => (id === "sunny" ? E[id].w : E[id].w * m);
      let ids = Object.keys(E).filter((id) => E[id].fromLevel <= level);
      if (ids.length > 1 && prev) ids = ids.filter((id) => id !== prev);
      const total = ids.reduce((s, id) => s + w(id), 0);
      let r = rnd() * total;
      for (const id of ids) { r -= w(id); if (r < 0) return id; }
      return ids[ids.length - 1];
    },

    shiftCfg(i, scripted, event, sid) {
      const ms = this.get(i, sid);
      if (scripted) return JSON.parse(JSON.stringify(ms.cfg));
      const cfg = { day: ms.day, unlock: [], weather: event, tipMult: 1 };
      NUM_KEYS.forEach((k) => { cfg[k] = Array.isArray(ms.cfg[k]) ? ms.cfg[k].slice() : ms.cfg[k]; });
      const ev = CONFIG.shiftEvents[event] || {};
      Object.keys(ev).forEach((k) => { if (k !== "w" && k !== "fromLevel") cfg[k] = ev[k]; });
      return cfg;
    },

    // Mục tiêu phụ của mốc (từ Mốc 2), cố định theo số mốc & mùa
    sideGoal(i, sid) {
      sid = sid || BT.Save.state.season || 1;
      if (i < 2) return null;
      const m = this.get(i, sid);
      if (!m) return null;
      const pool = CONFIG.sideGoals.filter((g) => (g.fromLevel || 1) <= m.level);
      return pool.length ? pool[(i * 7 + sid * 3) % pool.length] : null;
    },
    sideCheck(goal, g) {
      const q = g.q;
      switch (goal.id) {
        case "noWalk": return g.stats.walkouts === 0;
        case "combo5": return q.comboMax >= 5;
        case "five5": return q.five >= 5;
        case "noHero": return (g.heroUsed || 0) === 0;
        case "fav3": return q.fav >= 3;
        case "req3": return q.req >= 3;
        case "crispy3": return q.crispy >= 3;
        default: return false;
      }
    },

    run(i, opts) {
      const replay = !!(opts && opts.replay);
      const S = BT.Save.state;
      const sid = (opts && opts.season) || S.season || 1;
      const ms = this.get(i, sid);
      const scripted = ms.major && !replay && !this.stateOf(sid).firstDone[i];
      const event = scripted ? ms.cfg.weather : this.pickEvent(ms.level, S.ms.lastEvent);
      return { mode: replay ? "replay" : "story", key: "s" + sid + "ms" + i, season: sid, ms: i, level: ms.level, cfg: this.shiftCfg(i, scripted, event, sid), event, scripted };
    },

    // Chuyển bản lưu theo ngày (version 1) sang mốc. Trả true nếu có chuyển.
    migrate(st) {
      if (!st || (st.version || 1) >= 3) return false;
      if ((st.version || 1) < 2) this.migrateV1(st);
      // v2 → v3: thêm mùa
      st.season = st.season || 1;
      st.msBySeason = st.msBySeason || {};
      st.version = 3;
      return true;
    },

    migrateV1(st) {
      const n = this.count(1);
      const d = st.unlockedDay || 1;
      const ms = st.ms;
      if (d <= 15) { ms.index = this.majorIndex(d, 1); ms.cleared = ms.index - 1; }
      else { ms.index = n; ms.cleared = n - 1; }
      ms.progress = 0;
      const days = st.days || {};
      Object.keys(days).forEach((k) => {
        const kn = Number(k);
        if (!kn) return;
        const i = this.majorIndex(kn, 1);
        ms.best[i] = { stars: days[k].stars || 0, income: days[k].bestRevenue || 0 };
      });
      for (let k = 1; k < Math.min(d, 16); k++) ms.firstDone[this.majorIndex(k, 1)] = true;
      ms.shifts = Object.keys(days).filter((k) => Number(k)).length;
      st.goldHearts = this.list(1).filter((m) => m.major && ms.best[m.index] && ms.best[m.index].stars >= 3).length;
      st.regularNext = {};
      (st.reviews || []).forEach((r) => { const k = Number(r.day); r.day = k ? this.majorIndex(k, 1) : CONFIG.texts.runSecret; });
      const b = st.dayBackup;
      if (b && !b.finished) { st.wallet = b.wallet; st.inventory = JSON.parse(JSON.stringify(b.inventory || {})); st.today = null; }
      st.dayBackup = null;
      st.loseStreak = null;
      st.version = 2;
    },

    secretRun() {
      const cfg = JSON.parse(JSON.stringify(CONFIG.days.find((d) => d.day === "secret")));
      return { mode: "secret", key: "secret", season: 1, ms: BT.Save.state.ms.index, level: CONFIG.build.maxPlayableDay, cfg, event: cfg.weather, scripted: true };
    },

    // Ca mới cùng kiểu với run (dùng cho "Chơi lại" trong menu tạm dừng)
    again(run) {
      if (run.mode === "story" || run.mode === "replay") return this.run(run.ms, { replay: run.mode === "replay", season: run.season });
      if (run.mode === "secret") return this.secretRun();
      if (run.mode === "daily" && BT.Daily) return BT.Daily.run(run.date);
      if (run.mode === "endless" && BT.Endless) return BT.Endless.run();
      return run;
    },

    // Số chương truyện khách quen có sẵn ở cấp mốc này
    chaptersAt(id, level) {
      const def = CONFIG.regulars[id];
      if (!def || level < def.startDay) return 0;
      return def.chapters.filter((c) => (c.fromLevel || 0) <= level).length;
    },

    goldHearts(sid) {
      const S = BT.Save.state;
      sid = sid || S.season || 1;
      const st = sid === (S.season || 1) ? S.ms : (S.msBySeason || {})[sid];
      if (!st) return 0;
      const best = st.best;
      return this.list(sid).filter((m) => m.major && best[m.index] && best[m.index].stars >= 3).length;
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
    unlocked() { const S = BT.Save.state; return (S.season || 1) > 1 || S.ms.index >= CONFIG.daily.fromMilestone; },
    playedToday(key) { return !!BT.Save.state.daily.played[key || this.dateKey()]; },

    challenge(key, level) {
      const rng = mulberry32(Number(key.replace(/-/g, "")) * 7919 + 17);
      rng(); rng();
      const event = MS.pickEvent(level, null, rng);
      const dishes = CONFIG.recipes.filter((r) => r.openDay <= level && !r.combo && !r.months);
      const focus = dishes[Math.floor(rng() * dishes.length)].id;
      const rules = CONFIG.daily.rules.filter((x) => (x.fromLevel || 0) <= level);
      const rule = rules[Math.floor(rng() * rules.length)];
      let fc = focus;
      if (rule.cheDay) {
        const ches = dishes.filter((r) => r.zone === "che");
        if (ches.length) fc = ches[Math.floor(rng() * ches.length)].id;
      }
      return { event, focus: fc, rule };
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
      if (r.helperOff) cfg.helperOff = true;
      cfg.focus = ch.focus;
      cfg.focusWeight = CONFIG.daily.focusWeight;
      cfg.rule = r.id;
      return { mode: "daily", key: "daily", season: S.season || 1, date: key, ms: i, level: ms.level, cfg, event: ch.event, scripted: false };
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
        note = { index: idx, text: notes[idx], reread: D.noteNext >= notes.length };
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

  // ---------------- Ca vô tận ----------------
  const Endless = {
    unlocked() { const S = BT.Save.state; return (S.season || 1) > 1 || S.ms.index >= CONFIG.endless.fromMilestone; },
    spawnRange(served, base) {
      const E = CONFIG.endless;
      const f = Math.pow(E.rampFactor, Math.floor(served / E.rampEvery));
      return [0, 1].map((k) => Math.max(E.minSpawn[k], Math.round(base[k] * f * 100) / 100));
    },
    units(served) { const E = CONFIG.endless; return Math.round(Math.min(E.unitsMax, served / E.unitsPer) * 100) / 100; },
    claim(served, income) {
      const S = BT.Save.state;
      const st = S.endless;
      const newBest = served > st.best;
      if (newBest) st.best = served;
      st.bestIncome = Math.max(st.bestIncome, income);
      let coins = 0;
      const milestones = [];
      Object.keys(CONFIG.endless.rewards).map(Number).sort((a, b) => a - b).forEach((m) => {
        if (served >= m && !st.rewards[m]) { st.rewards[m] = true; coins += CONFIG.endless.rewards[m]; milestones.push(m); }
      });
      S.wallet += coins;
      BT.Save.persist();
      return { newBest, coins, milestones };
    },
    run() {
      const S = BT.Save.state;
      const i = S.ms.index;
      const ms = MS.get(i);
      const event = MS.pickEvent(ms.level, null);
      return { mode: "endless", key: "endless", season: S.season || 1, ms: i, level: ms.level, cfg: MS.shiftCfg(i, false, event), event, scripted: false };
    }
  };
  BT.Endless = Endless;

  // ---------------- Bác Sáu chủ nhà ----------------
  const Rent = {
    // Ca đầu (kịch bản) của mốc lớn chẵn Mùa 2 từ ngày fromDay, chưa thu ở ngày đó
    due(run) {
      const L = CONFIG.landlord;
      const S = BT.Save.state;
      if (!run || run.mode !== "story" || !run.scripted || (run.season || 1) < 2) return null;
      const day = run.cfg.day;
      if (day < L.fromDay || day % 2 !== 0 || S.rent.lastDay >= day) return null;
      let rent = 0;
      Object.keys(L.rent).map(Number).sort((a, b) => a - b).forEach((k) => { if (day >= k) rent = L.rent[k]; });
      const m = BT.ev("rent");
      if (m <= 0) return null;   // Cài đặt → Sự kiện: tắt tiền thuê nhà
      rent = Math.round(rent * m);
      return { day, rent, owed: S.rent.owed, total: rent + S.rent.owed };
    },
    pay(choice, due) {
      const S = BT.Save.state;
      const R = S.rent;
      let paid = 0;
      if (choice === "defer" && !R.deferredOnce) {
        R.owed += due.rent;
        R.deferredOnce = true;
      } else {
        paid = Math.max(0, Math.min(S.wallet, due.total));
        S.wallet -= paid;
        R.owed = due.total - paid;
      }
      R.lastDay = due.day;
      // Tiền nhà đã trả thì không được hoàn khi bỏ ca (điểm khôi phục đầu ca trừ theo)
      if (paid && S.dayBackup && !S.dayBackup.finished) S.dayBackup.wallet -= paid;
      BT.Save.persist();
      return { paid, owed: R.owed };
    }
  };
  BT.Rent = Rent;

  // Vào Ca vô tận (không qua Chuẩn bị): ghi điểm khôi phục như ca thường rồi vào màn bán hàng
  BT.startEndless = function (router, opts) {
    const S = BT.Save.state;
    const run = Endless.run();
    BT.Save.snapshotDay(run.key);
    S.today = { day: run.key, expense: 0 };
    BT.Save.persist();
    router.go("Game", { run }, opts);
  };
})();
