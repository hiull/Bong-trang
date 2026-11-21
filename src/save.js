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
    if (!data || data.version !== 1 || typeof data.wallet !== "number") throw new Error("bad");
    this.state = merge(defaults(), data);
    this.persist();
    return true;
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
      // Chỉ cần gõ những chữ bị đổi (đúng thứ tự). Chữ chỉ khác dấu với câu đố thì phải gõ đúng dấu.
      const clueS = this.soft(clue).split(" ");
      const clueH = this.normalize(clue).split(" ");
      const inS = inSoft.split(" ");
      const inH = got.split(" ");
      const changedWords = (a) => {
        const aS = this.soft(a).split(" ");
        if (aS.length !== clueS.length) return null;
        const out = [];
        aS.forEach((w, k) => { if (w !== clueS[k]) out.push({ s: w, h: this.normalize(w), clueH: clueH[k] }); });
        return out.length ? out : null;
      };
      const typedChanged = (want) => {
        let k = 0;
        for (let j = 0; j < inS.length && k < want.length; j++) {
          const w = want[k];
          if (inS[j] === w.s || (inH[j] === w.h && w.h !== w.clueH)) k++;
        }
        return k === want.length;
      };
      if (item.answers.some((a) => { const want = changedWords(a); return want && typedChanged(want); })) return true;
      return item.answers.some((a) => {
        const wantH = this.normalize(a);
        const wantS = this.soft(a);
        if (echo) return has(inSoft, wantS) && !has(this.soft(clue), inSoft);
        return got === wantH || (wantH.length >= 4 && has(got, wantH)) || has(inSoft, wantS);
      });
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
