// audio.js — Âm thanh bằng Web Audio API.
// Giai đoạn 1: chỉ có tiếng "tít" ngắn tạo bằng code (không cần file).
// Giai đoạn 5 sẽ nạp file trong assets/sfx và assets/music, pool 4 kênh, nhạc nền.
window.BT = window.BT || { Screens: {} };

(function () {
  // Âm tạo bằng code: [tần số Hz, thời lượng giây, kiểu sóng, độ to] — có thể nhiều nốt nối nhau
  const SYNTH = {
    tap:   [[660, 0.05, "triangle", 0.10]],
    add:   [[880, 0.06, "triangle", 0.12]],
    wrong: [[220, 0.12, "square", 0.06], [180, 0.14, "square", 0.06]],
    shake: [[520, 0.04, "triangle", 0.08]],
    tie:   [[700, 0.06, "triangle", 0.12], [1040, 0.09, "triangle", 0.12]],
    coin:  [[988, 0.06, "square", 0.06], [1319, 0.12, "square", 0.06]],
    angry: [[300, 0.12, "sawtooth", 0.05], [200, 0.2, "sawtooth", 0.05]],
    star:  [[1175, 0.08, "triangle", 0.14], [1568, 0.16, "triangle", 0.12]],
    win:   [[784, 0.1, "triangle", 0.12], [988, 0.1, "triangle", 0.12], [1319, 0.22, "triangle", 0.12]],
    lose:  [[440, 0.16, "triangle", 0.1], [349, 0.16, "triangle", 0.1], [262, 0.3, "triangle", 0.1]],
    pop:   [[600, 0.05, "sine", 0.12], [900, 0.06, "sine", 0.1]]
  };

  const Audio = {
    ctx: null,

    // Chỉ bật âm thanh sau lần chạm đầu tiên của người chơi (yêu cầu của trình duyệt).
    unlock() {
      if (this.ctx) { this.resume(); return; }
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      } catch (e) { this.ctx = null; }
    },

    resume() {
      if (!this.ctx) return;
      if (this.ctx.state === "closed") { this.ctx = null; this.unlock(); return; }
      if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {});
    },

    suspend() {
      if (this.ctx && this.ctx.state === "running") this.ctx.suspend().catch(() => {});
    },

    play(name) {
      if (!this.ctx || !BT.Save.state.settings.sfx) return;
      const notes = SYNTH[name];
      if (!notes) return;
      try {
        let t = this.ctx.currentTime;
        notes.forEach(([freq, dur, type, vol]) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = type;
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          osc.connect(gain).connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + dur + 0.02);
          t += dur * 0.9;
        });
      } catch (e) { /* bỏ qua lỗi âm thanh, game vẫn chạy */ }
    },

    vibrate(ms) {
      if (!BT.Save.state.settings.vibrate) return;
      try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* không hỗ trợ */ }
    }
  };

  BT.Audio = Audio;
})();
