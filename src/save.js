// save.js — Trạng thái người chơi, điểm khôi phục đầu ngày.
// Giai đoạn 1: tiến trình chỉ giữ trong bộ nhớ (tải lại trang = chơi lại từ đầu).
// Giai đoạn 2 sẽ bật lưu vào localStorage với khoá "bongtrang_save_v1",
// Giai đoạn 6 thêm xuất/nhập mã sao lưu TIEM1-.
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
      // Thêm ngoài mẫu Mục 17: kho nguyên liệu mang sang ngày sau, chi phí của ngày đang chơi
      inventory: {},
      today: null,
      welcomeSeen: false
    };
  }

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

  const Save = {
    KEY,
    state: defaults(),

    reset() { this.state = defaults(); },

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

    stock(id) { return this.state.inventory[id] || 0; },

    // Giai đoạn 2 sẽ ghi xuống localStorage tại đây.
    persist() { return false; }
  };

  BT.Save = Save;
})();
