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
})();
