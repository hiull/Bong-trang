// save.js — Đọc/ghi localStorage (khoá "bongtrang_save_v1"), điểm khôi phục đầu ngày.
// Giai đoạn 6 sẽ thêm xuất/nhập mã sao lưu TIEM1-.
window.BT = window.BT || { Screens: {} };

(function () {
  const KEY = "bongtrang_save_v1";

  function defaultUpgrades() {
    const out = {};
    Object.keys(CONFIG.upgrades).forEach((id) => { out[id] = CONFIG.upgrades[id].min; });
    return out;
  }

  function defaults() {
    return {
      version: 1,
      wallet: CONFIG.money.startWallet,
      xp: 0,
      days: {},
      unlockedDay: 1,
      dayBackup: null,
      upgrades: defaultUpgrades(),
      decor: [],
      pets: ["miu"],
      skins: ["default"],
      activeSkin: "default",
      memoriesUnlocked: [],
      goldHearts: 0,
      reviews: [],
      regularCustomers: { chu_tu: 0, chi_lan: 0, be_na: 0, tomortle: 0 },
      checkin: { streak: 0, lastDate: "" },
      dailyQuests: { date: "", list: [] },
      settings: { music: true, sfx: true, vibrate: true },
      tutorialDone: { cards: false, day1: false, day2: false, day4: false, day7: false },
      endingSeen: false,
      appVersionSeen: CONFIG.version,
      // Thêm ngoài mẫu Mục 17
      inventory: {},      // kho nguyên liệu mang sang ngày sau
      today: null,        // chi phí của ngày đang chơi
      loseStreak: null,   // { day, n } số lần thua liên tiếp ở cùng một ngày
      regularNext: {},    // khách quen: ngày sớm nhất được ghé chương tiếp theo
      bonusCustomers: 0,  // khách thêm cho lần chơi tới (từ lựa chọn cốt truyện)
      bonusNext: 0,
      bonusSeen: false,   // đã xem lời nhắn bí mật (đủ 15 tim vàng)
      welcomeSeen: false
    };
  }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  // Gộp dữ liệu đã lưu vào mẫu mặc định (bản cũ thiếu trường mới vẫn chạy được)
  function merge(base, saved) {
    Object.keys(saved || {}).forEach((k) => {
      const v = saved[k];
      if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
        base[k] = merge(base[k], v);
      } else {
        base[k] = v;
      }
    });
    return base;
  }

  const Save = {
    KEY,
    state: defaults(),
    available: true,   // false khi trình duyệt chặn lưu (chế độ ẩn danh)

    load() {
      try {
        const test = KEY + "_test";
        localStorage.setItem(test, "1");
        localStorage.removeItem(test);
        this.available = true;
      } catch (e) {
        this.available = false;
        return false;
      }
      try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data || data.version !== 1) return false;
        this.state = merge(defaults(), data);
        // Tắt game giữa ca → coi như ngày đó chưa bắt đầu
        const b = this.state.dayBackup;
        if (b && !b.finished) {
          this.restoreDay();
          this.state.dayBackup = null;
          this.persist();
        }
        return true;
      } catch (e) {
        return false;
      }
    },

    persist() {
      if (!this.available) return false;
      try {
        localStorage.setItem(KEY, JSON.stringify(this.state));
        return true;
      } catch (e) {
        return false;
      }
    },

    reset() {
      this.state = defaults();
      if (this.available) { try { localStorage.removeItem(KEY); } catch (e) { /* bỏ qua */ } }
    },

    // Ghi lại tiền & kho ở đầu ngày để nút "Làm lại ngày" quay về đúng chỗ này.
    snapshotDay(day) {
      const s = this.state;
      s.dayBackup = { day, finished: false, wallet: s.wallet, inventory: clone(s.inventory) };
    },

    restoreDay() {
      const s = this.state;
      const b = s.dayBackup;
      if (!b) return false;
      s.wallet = b.wallet;
      s.inventory = clone(b.inventory);
      b.finished = false;
      s.today = null;
      return true;
    },

    stock(id) { return this.state.inventory[id] || 0; }
  };

  BT.Save = Save;

  // ---------------- Tiến trình: cấp độ, nhiệm vụ, điểm danh, đánh giá ----------------
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function dateStr(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }

  const Progress = {
    today() { return dateStr(new Date()); },
    yesterday() { const d = new Date(); d.setDate(d.getDate() - 1); return dateStr(d); },

    // Cấp độ & danh hiệu theo kinh nghiệm
    level(xp) {
      const T = CONFIG.titles;
      let i = 0;
      T.forEach((t, k) => { if (xp >= t.xp) i = k; });
      const next = T[i + 1];
      return { level: i + 1, title: T[i].name, next: next ? next.xp : null, from: T[i].xp };
    },

    // Nhiệm vụ hằng ngày: mỗi ngày thật một bộ mới
    quests() {
      const S = Save.state;
      const today = this.today();
      if (S.dailyQuests.date !== today || !S.dailyQuests.list.length) {
        const pool = CONFIG.quests.filter((q) => (q.fromDay || 1) <= S.unlockedDay);
        const list = [];
        while (list.length < CONFIG.questsPerDay && pool.length) {
          const q = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
          list.push({ id: q.id, progress: 0, claimed: false });
        }
        S.dailyQuests = { date: today, list };
        Save.persist();
      }
      return S.dailyQuests.list;
    },

    // value cộng dồn, hoặc lấy giá trị lớn nhất với nhiệm vụ "best"
    questAdd(stat, value) {
      if (!value) return;
      this.quests().forEach((q) => {
        if (q.id !== stat) return;
        const def = CONFIG.quests.find((x) => x.id === q.id);
        q.progress = def.best ? Math.max(q.progress, value) : q.progress + value;
      });
    },

    questsClaimable() {
      return this.quests().filter((q) => {
        const def = CONFIG.quests.find((x) => x.id === q.id);
        return !q.claimed && q.progress >= def.n;
      }).length;
    },

    // Điểm danh: hôm nay nhận được chưa, đang ở ô thứ mấy (0–6)
    checkinInfo() {
      const c = Save.state.checkin;
      const today = this.today();
      const claimedToday = c.lastDate === today;
      let streak = c.streak;
      if (!claimedToday && c.lastDate !== this.yesterday()) streak = 0; // lỡ một ngày thì bắt đầu lại
      const n = CONFIG.checkinRewards.length;
      const index = claimedToday ? (streak - 1) % n : streak % n;
      return { claimedToday, streak, index };
    },

    checkinClaim() {
      const info = this.checkinInfo();
      if (info.claimedToday) return null;
      const S = Save.state;
      const reward = CONFIG.checkinRewards[info.index];
      S.wallet += reward;
      S.checkin = { streak: info.streak + 1, lastDate: this.today() };
      Save.persist();
      return { reward, index: info.index };
    },

    // Đánh giá
    addReview(r) {
      const S = Save.state;
      const T = CONFIG.reviewTemplates;
      const group = r.stars >= 4 ? T.good : r.stars === 3 ? T.ok : T.bad;
      S.reviews.unshift({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        day: r.day, name: r.name, avatar: r.avatar, stars: r.stars, weight: r.weight || 1,
        text: group[Math.floor(Math.random() * group.length)], reply: null, bonus: 0
      });
      if (S.reviews.length > CONFIG.reviewKeep) S.reviews.length = CONFIG.reviewKeep;
    },

    shopRating() {
      const R = Save.state.reviews;
      if (!R.length) return 0;
      let s = 0;
      let w = 0;
      R.forEach((r) => { s += Math.min(5, r.stars + r.bonus) * (r.weight || 1); w += r.weight || 1; });
      return s / w;
    },

    // Skin hợp dịp lễ thực tế hôm nay (nếu có)
    seasonalSkin() {
      const md = this.today().slice(5);
      return CONFIG.skins.find((k) => k.season && md >= k.season[0] && md <= k.season[1]) || null;
    }
  };

  BT.Progress = Progress;
})();
