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
      version: 3,
      season: 1,          // mùa đang chơi
      msBySeason: {},     // tiến độ các mùa không đang chơi
      s2: { cards: [], memories: [], endingSeen: false, bonusSeen: false, goldHearts: 0, started: false }, // mùa 2
      wallet: CONFIG.money.startWallet,
      xp: 0,
      days: {},
      dayBackup: null,
      upgrades: defaultUpgrades(),
      decor: [],
      pets: ["miu"],
      skins: ["default"],
      activeSkin: "default",
      memoriesUnlocked: [],
      goldHearts: 0,
      reviews: [],
      regularCustomers: { chu_tu: 0, chi_lan: 0, be_na: 0, tomortle: 0, co_hanh: 0 },
      checkin: { streak: 0, lastDate: "" },
      dailyQuests: { date: "", list: [] },
      settings: { music: true, sfx: true, vibrate: true, fullscreen: true, easyHints: false, lateAdd: true, showRecipe: true, realRecipes: false, patienceBoost: 0,
        relaxMode: false, oneTapDeliver: false, oneTapAction: false, tapPour: false, easyGrill: false, slowCustomers: false,
        fewerRequests: false, bookPause: false, moreHearts: false, softFail: false, threeTrays: false, autoSeasonSkin: true },
      tutorialDone: { cards: false, day1: false, day2: false, day4: false, day7: false, day16: false },
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
      ms: { index: 1, progress: 0, cleared: 0, shifts: 0, best: {}, firstDone: {}, lastEvent: null }, // mốc hiện tại & tiến độ
      daily: { lastDate: null, streak: 0, played: {}, noteNext: 0, notesSeen: [], best: {} }, // thử thách mỗi ngày
      endless: { best: 0, bestIncome: 0, rewards: {} }, // ca vô tận
      helper: { unlocked: false, role: "waiter", shifts: 0, chapters: 0 }, // anh Hiếu phụ tiệm
      rent: { owed: 0, deferredOnce: false, lastDay: 0 }, // tiền mặt bằng bác Sáu
      firstPlay: "",      // ngày chơi đầu (thư hằng tuần)
      specialSeen: {},    // quà ngày đặc biệt đã nhận (theo ngày)
      lettersRead: 0,     // số thư hằng tuần đã đọc
      life: { served: 0, rushes: 0, vips: 0, perfect: 0, crispy: 0, customsSold: 0, datesWon: 0 }, // bộ đếm trọn đời (huy hiệu)
      badges: {},
      customs: [],        // món sáng tạo (tối đa 3)
      datesNotes: [],     // ghi chú hẹn hò đã mở         // huy hiệu đã mở
      weekly: { week: "", list: [], claimed: false }, // nhiệm vụ tuần
      talesSeen: [],      // chuyện vặt đã xem (theo thứ tự)
      flirt: { next: 0, solved: {} }, // câu thính: câu kế tiếp, câu đã giải ("self" tự giải / "told" anh nói)
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
        if (!data || !(data.version >= 1 && data.version <= 3)) return false;
        this.state = merge(defaults(), data);
        // Bản lưu theo ngày → mốc
        if (BT.MS && BT.MS.migrate(this.state)) this.persist();
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

  // ---------------- Mã sao lưu TIEM1- ----------------
  // TIEM1-Z… = JSON nén deflate rồi base64url (trình duyệt có CompressionStream)
  // TIEM1-J… = JSON base64url không nén (trình duyệt cũ)
  const PREFIX = "TIEM1-";
  function b64encode(bytes) {
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function b64decode(str) {
    const s = str.replace(/-/g, "+").replace(/_/g, "/");
    const bin = atob(s + "===".slice((s.length + 3) % 4));
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  async function pipe(bytes, stream) {
    const res = new Response(new Blob([bytes]).stream().pipeThrough(stream));
    return new Uint8Array(await res.arrayBuffer());
  }

  Save.exportCode = async function () {
    const data = Object.assign({}, this.state, { dayBackup: null, today: null });
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    if (window.CompressionStream) {
      try { return PREFIX + "Z" + b64encode(await pipe(bytes, new CompressionStream("deflate-raw"))); } catch (e) { /* dùng bản không nén */ }
    }
    return PREFIX + "J" + b64encode(bytes);
  };

  // Trả về true nếu khôi phục được, ném lỗi nếu mã sai
  Save.importCode = async function (code) {
    const c = String(code || "").replace(/\s+/g, "");
    if (c.indexOf(PREFIX) !== 0 || c.length < PREFIX.length + 10) throw new Error("bad");
    const kind = c.charAt(PREFIX.length);
    let bytes = b64decode(c.slice(PREFIX.length + 1));
    if (kind === "Z") {
      if (!window.DecompressionStream) throw new Error("unsupported");
      bytes = await pipe(bytes, new DecompressionStream("deflate-raw"));
    } else if (kind !== "J") throw new Error("bad");
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || !(data.version >= 1 && data.version <= 3) || typeof data.wallet !== "number") throw new Error("bad");
    this.state = merge(defaults(), data);
    if (BT.MS) BT.MS.migrate(this.state);
    this.persist();
    return true;
  };

  BT.Save = Save;

  // Trợ giúp đang bật? (bật riêng, hoặc nằm trong gói "Chế độ thư giãn")
  BT.assist = function (key) {
    const st = (Save.state && Save.state.settings) || {};
    if (st[key]) return true;
    return !!st.relaxMode && CONFIG.relaxMode.includes(key);
  };
  // Mức tăng kiên nhẫn đang dùng (thư giãn = ít nhất +50%)
  BT.patienceBoost = function () {
    const st = (Save.state && Save.state.settings) || {};
    return Math.max(st.patienceBoost || 0, st.relaxMode ? 0.5 : 0);
  };

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
        const pool = CONFIG.quests.filter((q) => (q.fromDay || 1) <= (BT.MS ? BT.MS.current().level : 1));
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
      if (BT.Fun && BT.Fun.weeklyAdd) BT.Fun.weeklyAdd(stat, value);
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
        day: r.day, name: r.name, avatar: r.avatar, doodle: r.doodle || null, stars: r.stars, weight: r.weight || 1,
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

  // ---------------- Câu thính của anh Hiếu ----------------
  const Flirt = {
    list() { return (window.PERSONAL && window.PERSONAL.flirtLines) || []; },

    // chữ thường, bỏ dấu tiếng Việt, bỏ ký tự lạ, gộp khoảng trắng
    normalize(s) {
      return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d")
        .replace(/[^a-z0-9]+/g, " ").trim();
    },

    // chữ thường, giữ dấu tiếng Việt, bỏ ký tự lạ (để phân biệt "dẫm"/"dâm", "mê"/"me")
    soft(s) {
      return String(s || "").toLowerCase().normalize("NFC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    },

    // Đúng nếu khớp một đáp án. Gõ lại chính câu đố thì không tính.
    // Đáp án ≥4 ký tự: chấp nhận câu có chứa đáp án (không dấu); đáp án ngắn: chỉ khi khớp có dấu.
    check(index, input) {
      const item = this.list()[index];
      const got = this.normalize(input);
      if (!item || !got) return false;
      const has = (hay, needle) => !!needle && (" " + hay + " ").indexOf(" " + needle + " ") >= 0;
      const clue = item.lines.join(" ");
      const echo = has(this.normalize(clue), got);       // bỏ dấu đi thì input nằm trong câu đố
      const inSoft = this.soft(input);
      const exact = item.answers.some((a) => {
        const wantH = this.normalize(a);
        const wantS = this.soft(a);
        if (echo) return has(inSoft, wantS) && !has(this.soft(clue), inSoft);
        return got === wantH || (wantH.length >= 4 && has(got, wantH)) || has(inSoft, wantS);
      });
      if (exact) return true;
      // Nới tay: chấp nhận viết tắt (k, ko, a, e, cx, iu…) và gõ sai chút ít,
      // miễn là câu gõ gần đáp án hơn hẳn so với câu đố. Đáp án chỉ khác câu đố ở dấu thì không nới.
      const clueX = this.expand(this.normalize(clue));
      const gotX = this.expand(got);
      return item.answers.some((a) => {
        const wantX = this.expand(this.normalize(a));
        if (wantX.length < 8 || wantX === clueX) return false;
        if (gotX === wantX || has(gotX, wantX)) return true;
        const d = this.dist(gotX, wantX);
        return d <= Math.max(1, Math.floor(wantX.length * 0.12)) && d < this.dist(gotX, clueX);
      });
    },

    // Viết tắt thường gặp khi nhắn tin → chữ đầy đủ (đã bỏ dấu)
    ABBR: { k: "khong", ko: "khong", kh: "khong", hk: "khong", hok: "khong", hong: "khong", hem: "khong", khum: "khong", kg: "khong",
      a: "anh", e: "em", dc: "duoc", ng: "nguoi", vs: "voi", j: "gi", r: "roi", z: "vay", cx: "cung", cg: "cung", ms: "moi",
      bt: "biet", trc: "truoc", iu: "yeu", nhiu: "nhieu", mk: "minh", ny: "nguoi yeu", wa: "qua", lm: "lam", ns: "noi" },
    expand(s) { return String(s).split(" ").map((w) => this.ABBR[w] || w).join(" "); },

    // Khoảng cách sửa chữ (Levenshtein)
    dist(a, b) {
      const m = a.length, n = b.length;
      let prev = Array.from({ length: n + 1 }, (_, j) => j);
      for (let i = 1; i <= m; i++) {
        const cur = [i];
        for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = cur;
      }
      return prev[n];
    },

    // Câu kế tiếp chưa giải (theo thứ tự); giải hết rồi thì quay vòng cả danh sách
    take() {
      const f = Save.state.flirt;
      const n = this.list().length;
      if (!n) return -1;
      const start = ((f.next % n) + n) % n;
      let i = start;
      for (let k = 0; k < n; k++) {
        const j = (start + k) % n;
        if (!f.solved[j]) { i = j; break; }
      }
      f.next = (i + 1) % n;
      return i;
    },

    mark(index, how) {
      const solved = Save.state.flirt.solved;
      if (solved[index] !== "self") solved[index] = how;
      Save.persist();
    },

    count() {
      return { solved: Object.keys(Save.state.flirt.solved).length, total: this.list().length };
    }
  };

  BT.Flirt = Flirt;
})();
