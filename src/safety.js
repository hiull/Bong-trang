// safety.js — Chống mất tiến trình:
// - Safari có thể xoá dữ liệu web sau ~7 ngày không mở nếu game chưa được "Thêm vào màn hình chính"
//   → nhắc cài, xin trình duyệt giữ dữ liệu lâu dài, nhắc lưu ra file mỗi tuần.
// - Lưu ra file (.txt chứa mã sao lưu) / mở file để khôi phục.
window.BT = window.BT || { Screens: {} };

(function () {
  const UI = BT.UI;
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const daysSince = (iso) => (iso ? Math.floor((new Date(today() + "T12:00:00") - new Date(iso + "T12:00:00")) / 86400000) : Infinity);

  const Safety = {
    today,
    // Đang chạy như app (đã thêm vào màn hình chính)?
    standalone() {
      try { if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true; } catch (e) { /* bỏ qua */ }
      return window.navigator.standalone === true;
    },
    isApple() { return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1); },

    // Xin trình duyệt đừng tự xoá dữ liệu (Safari/Chrome có thể đồng ý, nhất là khi đã cài)
    requestPersist() {
      try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); } catch (e) { /* bỏ qua */ }
    },

    snoozed(kind) {
      const t = (BT.Save.state.tips || {})[kind];
      return !!t && daysSince(t) < CONFIG.safety.tipSnoozeDays;
    },
    snooze(kind) {
      const S = BT.Save.state;
      S.tips = S.tips || {};
      S.tips[kind] = today();
      BT.Save.persist();
    },

    // Lời nhắc nên hiện ở Menu (hoặc null)
    tip() {
      const S = BT.Save.state;
      if (!BT.Save.available) return null;
      if (!this.standalone() && !this.snoozed("install")) return "install";
      const since = daysSince(S.lastFileBackup || S.firstPlay || today());
      if (S.ms.shifts >= CONFIG.safety.backupAfterShifts && since >= CONFIG.safety.backupEveryDays && !this.snoozed("backup")) return "backup";
      return null;
    },
    tipEl(onChange) {
      const kind = this.tip();
      if (!kind) return null;
      const el = UI.el("div", "safety-tip " + kind);
      el.appendChild(UI.el("span", "tip-text", UI.t(kind === "install" ? "tipInstall" : "tipBackup")));
      el.appendChild(UI.button(UI.t(kind === "install" ? "tipInstallBtn" : "tipBackupBtn"), "btn-pink small tip-go", () => {
        if (kind === "install") this.openInstallHelp();
        else this.saveFile().then(() => { if (onChange) onChange(); });
      }));
      const x = UI.el("button", "tip-x", "×");
      x.type = "button";
      x.setAttribute("aria-label", UI.t("btnClose"));
      x.addEventListener("click", () => { this.snooze(kind); if (onChange) onChange(); });
      el.appendChild(x);
      return el;
    },
    openInstallHelp() {
      const steps = this.isApple() ? UI.t("installApple") : UI.t("installOther");
      UI.modal({ title: UI.t("installTitle"), body: steps, className: "modal-install", dismissable: true,
        buttons: [{ label: UI.t("installOk"), cls: "btn-pink", onClick: () => this.snooze("install") }] });
    },

    // Lưu ra file: trên iPad/iPhone mở bảng Chia sẻ (cất vào Tệp / iCloud), máy khác tải file xuống
    async saveFile() {
      const S = BT.Save.state;
      const text = await BT.Save.fileText();
      const name = "bong-trang-" + today() + ".txt";
      let shared = false;
      try {
        const file = new File([text], name, { type: "text/plain" });
        if ("ontouchstart" in window && navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], title: name });
          shared = true;
        }
      } catch (e) {
        if (e && e.name === "AbortError") return false;   // bấm Huỷ ở bảng Chia sẻ
      }
      if (!shared) {
        const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
        const a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
      S.lastFileBackup = today();
      BT.Save.persist();
      UI.toast(UI.t("backupFileSaved"), 2600);
      return true;
    },
    // Mở file sao lưu → trả về Promise<boolean>
    openFile() {
      return new Promise((resolve, reject) => {
        const inp = document.createElement("input");
        inp.type = "file";
        inp.accept = ".txt,text/plain";
        inp.style.display = "none";
        inp.addEventListener("change", () => {
          const f = inp.files && inp.files[0];
          inp.remove();
          if (!f) { resolve(false); return; }
          f.text().then((t) => BT.Save.importCode(t)).then(() => resolve(true), reject);
        });
        document.body.appendChild(inp);
        inp.click();
      });
    }
  };

  BT.Safety = Safety;
})();
