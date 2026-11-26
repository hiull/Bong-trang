// audio.js — Âm thanh bằng Web Audio API, toàn bộ tạo bằng code (không cần file, không lo bản quyền).
// • Hiệu ứng: tiếng chạm, thêm nguyên liệu, xèo xèo, lắc, đập trứng, cuốn, rót, chín, cháy, xu, sai,
//   giận, sao, thắng, thua, mở thư, trái tim… Tiếng chạm/thêm dùng pool tối đa 4 kênh để không bị rè.
// • Nhạc nền: 4 bản lặp (tiệm, trong ca, trời mưa, màn kết thúc) phát bằng bộ xếp nốt nhỏ.
// • Chỉ bật sau lần chạm đầu tiên; ẩn tab thì tạm dừng, quay lại thì resume (tạo lại nếu đã đóng).
window.BT = window.BT || { Screens: {} };

(function () {
  const midi = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // ---------- Hiệu ứng: t = [tần số, thời lượng, kiểu sóng, độ to, trượt tới tần số?]; n = tiếng ồn ----------
  const SFX = {
    tap:    { t: [[660, 0.05, "triangle", 0.10]], pool: true },
    add:    { t: [[880, 0.05, "triangle", 0.11], [1175, 0.05, "triangle", 0.08]], pool: true },
    pop:    { t: [[600, 0.05, "sine", 0.12], [900, 0.06, "sine", 0.10]] },
    wrong:  { t: [[220, 0.12, "square", 0.05], [180, 0.14, "square", 0.05]] },
    shake:  { n: { dur: 0.09, type: "bandpass", freq: 2500, q: 1.5, vol: 0.18 }, pool: true },
    tie:    { t: [[700, 0.06, "triangle", 0.12], [1040, 0.09, "triangle", 0.12]] },
    crack:  { n: { dur: 0.05, type: "highpass", freq: 1800, q: 0.7, vol: 0.25 }, t: [[320, 0.06, "square", 0.04]] },
    sizzle: { n: { dur: 0.6, type: "highpass", freq: 4000, q: 0.5, vol: 0.07 } },
    pour:   { n: { dur: 0.5, type: "bandpass", freq: 900, q: 2, vol: 0.18, sweep: 500 } },
    roll:   { n: { dur: 0.35, type: "bandpass", freq: 1400, q: 1, vol: 0.14, sweep: 2600 } },
    ready:  { t: [[1047, 0.08, "triangle", 0.12], [1319, 0.08, "triangle", 0.12], [1568, 0.14, "triangle", 0.10]] },
    burn:   { n: { dur: 0.5, type: "lowpass", freq: 600, q: 1, vol: 0.18 }, t: [[300, 0.3, "sawtooth", 0.04, 120]] },
    coin:   { t: [[988, 0.06, "square", 0.05], [1319, 0.12, "square", 0.05]] },
    angry:  { t: [[300, 0.12, "sawtooth", 0.05], [200, 0.2, "sawtooth", 0.05]] },
    star:   { t: [[1175, 0.08, "triangle", 0.14], [1568, 0.16, "triangle", 0.12]] },
    win:    { t: [[784, 0.1, "triangle", 0.12], [988, 0.1, "triangle", 0.12], [1319, 0.22, "triangle", 0.12]] },
    lose:   { t: [[440, 0.16, "triangle", 0.1], [349, 0.16, "triangle", 0.1], [262, 0.3, "triangle", 0.1]] },
    letter: { t: [[1319, 0.07, "sine", 0.1], [1568, 0.07, "sine", 0.1], [2093, 0.07, "sine", 0.1], [2637, 0.2, "sine", 0.08]] },
    heart:  { t: [[880, 0.08, "sine", 0.1, 1320], [1320, 0.12, "sine", 0.08]] }
  };

  // ---------- Nhạc nền: 4 ô nhịp × 8 nốt móc đơn, hợp âm mỗi ô nhịp ----------
  const C = [60, 64, 67], G = [55, 59, 62], Am = [57, 60, 64], F = [53, 57, 60], Em = [52, 55, 59];
  const _ = null;
  const MUSIC = {
    menu: { bpm: 92, lead: "triangle", vol: 0.05, chords: [C, Am, F, G],
      melody: [72, _, 76, _, 79, _, 76, _, 72, _, 76, _, 74, _, 72, _, 69, _, 72, _, 77, _, 76, 74, 74, _, 71, _, 74, 76, 79, _] },
    game: { bpm: 120, lead: "square", vol: 0.03, chords: [C, G, Am, F],
      melody: [76, 76, _, 79, _, 76, 72, _, 74, _, 79, _, 77, 76, 74, _, 72, _, 76, _, 81, 79, 76, _, 77, _, 76, _, 74, 72, 74, _] },
    rain: { bpm: 76, lead: "sine", vol: 0.06, chords: [Am, F, C, G], rain: true,
      melody: [76, _, _, _, 72, _, _, _, 77, _, _, 76, _, _, 72, _, 76, _, _, _, 79, _, _, _, 74, _, _, 71, _, _, _, _] },
    ending: { bpm: 72, lead: "triangle", vol: 0.06, chords: [F, G, Em, Am],
      melody: [77, _, 76, _, 77, _, 81, _, 79, _, _, 77, 76, _, 74, _, 76, _, 79, _, 83, _, 81, 79, 81, _, _, _, 76, _, _, _] }
  };

  const Audio = {
    ctx: null,
    master: null,
    sfxGain: null,
    musicGain: null,
    pool: [],
    wanted: null,     // bản nhạc cần phát
    playing: null,    // bản nhạc đang phát
    timer: null,
    noiseBuf: null,
    rainNode: null,

    // Chỉ bật âm thanh sau lần chạm đầu tiên của người chơi (yêu cầu của trình duyệt).
    unlock() {
      if (this.ctx) { this.resume(); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.connect(this.ctx.destination);
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.connect(this.master);
        this.musicGain = this.ctx.createGain();
        this.musicGain.connect(this.master);
        const len = this.ctx.sampleRate * 2;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const d = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
        this.applySettings();
        if (this.wanted) this.music(this.wanted, true);
      } catch (e) { this.ctx = null; }
    },

    resume() {
      if (!this.ctx) return;
      if (this.ctx.state === "closed") { this.ctx = null; this.playing = null; this.unlock(); return; }
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    },

    suspend() {
      if (this.ctx && this.ctx.state === "running") this.ctx.suspend().catch(() => {});
    },

    applySettings() {
      if (!this.ctx) return;
      const s = BT.Save.state.settings;
      this.sfxGain.gain.value = s.sfx ? 1 : 0;
      this.musicGain.gain.value = s.music ? 1 : 0;
      if (!s.music) this.stopMusic();
      else if (this.wanted && this.playing !== this.wanted) this.music(this.wanted, true);
    },

    // ---------- Hiệu ứng ----------
    tone(t0, freq, dur, type, vol, slideTo) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
      return osc;
    },

    noise(t0, n, out) {
      const ctx = this.ctx;
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter();
      f.type = n.type;
      f.frequency.setValueAtTime(n.freq, t0);
      if (n.sweep) f.frequency.exponentialRampToValueAtTime(n.sweep, t0 + n.dur);
      f.Q.value = n.q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(n.vol, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + n.dur);
      src.connect(f).connect(g).connect(out || this.sfxGain);
      src.start(t0, Math.random());
      src.stop(t0 + n.dur + 0.02);
      return src;
    },

    play(name) {
      if (!this.ctx || !BT.Save.state.settings.sfx) return;
      const s = SFX[name];
      if (!s) return;
      try {
        const nodes = [];
        let t = this.ctx.currentTime;
        if (s.n) nodes.push(this.noise(t, s.n));
        (s.t || []).forEach(([freq, dur, type, vol, slide]) => {
          nodes.push(this.tone(t, freq, dur, type, vol, slide));
          t += dur * 0.9;
        });
        // Pool 4 kênh cho tiếng chạm liên tục: quá 4 thì tắt tiếng cũ nhất
        if (s.pool) {
          this.pool.push(nodes);
          while (this.pool.length > CONFIG.audio.poolSize) {
            this.pool.shift().forEach((nd) => { try { nd.stop(); } catch (e) { /* đã dừng */ } });
          }
        }
      } catch (e) { /* bỏ qua lỗi âm thanh, game vẫn chạy */ }
    },

    vibrate(ms) {
      if (!BT.Save.state.settings.vibrate) return;
      try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* không hỗ trợ */ }
    },

    // ---------- Nhạc nền ----------
    music(name, force) {
      this.wanted = name;
      if (!this.ctx || !BT.Save.state.settings.music) return;
      if (this.playing === name && !force) return;
      this.stopMusic();
      if (!name || !MUSIC[name]) return;
      const tr = MUSIC[name];
      this.playing = name;
      const stepDur = 60 / tr.bpm / 2;
      let step = 0;
      let next = this.ctx.currentTime + 0.1;
      const out = this.ctx.createGain();
      out.gain.setValueAtTime(0.0001, next);
      out.gain.exponentialRampToValueAtTime(1, next + 1.2);
      out.connect(this.musicGain);
      this.musicOut = out;
      if (tr.rain) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        src.loop = true;
        const f = this.ctx.createBiquadFilter();
        f.type = "bandpass";
        f.frequency.value = 1500;
        f.Q.value = 0.6;
        const g = this.ctx.createGain();
        g.gain.value = 0.035;
        src.connect(f).connect(g).connect(out);
        src.start();
        this.rainNode = src;
      }
      const note = (t, n, dur, type, vol) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = type;
        osc.frequency.value = midi(n);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(g).connect(out);
        osc.start(t);
        osc.stop(t + dur + 0.05);
      };
      const schedule = () => {
        if (!this.ctx || this.playing !== name) return;
        while (next < this.ctx.currentTime + 0.35) {
          const bar = Math.floor(step / 8) % tr.chords.length;
          const chord = tr.chords[bar];
          const inBar = step % 8;
          const m = tr.melody[step % tr.melody.length];
          if (m) note(next, m, stepDur * 1.6, tr.lead, tr.vol);
          if (inBar % 2 === 0) note(next, chord[(inBar / 2) % chord.length], stepDur * 2.2, "sine", tr.vol * 0.7);
          if (inBar === 0 || inBar === 4) note(next, chord[0] - 12, stepDur * 3.5, "sine", tr.vol * 1.2);
          next += stepDur;
          step++;
        }
      };
      schedule();
      this.timer = setInterval(schedule, 100);
    },

    stopMusic() {
      if (this.timer) { clearInterval(this.timer); this.timer = null; }
      if (this.rainNode) { try { this.rainNode.stop(); } catch (e) { /* đã dừng */ } this.rainNode = null; }
      if (this.musicOut && this.ctx) {
        const out = this.musicOut;
        const t = this.ctx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value || 0.0001, t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        setTimeout(() => { try { out.disconnect(); } catch (e) { /* bỏ qua */ } }, 600);
      }
      this.musicOut = null;
      this.playing = null;
    }
  };

  BT.Audio = Audio;
})();
