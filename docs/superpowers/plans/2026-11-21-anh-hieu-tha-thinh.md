# Anh Hiếu thả thính — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Anh Hiếu ghé tiệm thêm các lượt chỉ để buông câu nói lái; Bống gõ "ý thật" vào ô chữ, đúng thì được thưởng, chịu thua vẫn được 10k; đủ tất cả câu người dùng gửi.

**Architecture:** Dữ liệu câu + đáp án trong `personal.js` (`flirtLines`); số lần ghé, thưởng, chữ hiển thị trong `config.js`. Logic chấm & tiến độ là hàm thuần trong `src/save.js` (`BT.Flirt`). Màn bán hàng (`GameScreen.js`) lên lịch lượt ghé, tạm dừng, hiện popup có ô nhập; Album thêm "Sổ thính".

**Tech Stack:** HTML/CSS/JS thuần (không build tool), kiểm thử bằng script Node + Playwright đặt trong thư mục nháp (không commit, giữ đúng cấu trúc Mục 4).

**Spec:** `docs/superpowers/specs/2026-11-21-anh-hieu-tha-thinh-design.md`

## Global Constraints

- Mọi chữ trên giao diện bằng tiếng Việt có dấu; emoji trong chữ tự hiện thành hình doodle (qua `UI.el` / `UI.setText`).
- Con số cân bằng chỉ nằm ở `config.js`; câu & đáp án chỉ nằm ở `personal.js`.
- Lượt thả thính: từ Ngày 3, `tomoFlirtPerDay = 3` lần/ngày; Ngày bí mật `tomoFlirtSecret = 10` lần.
- Đúng: +20k tip, +1 tim tiệm. Chịu thua ("Chịu, anh nói đi"): +10k, không tim. Sai: không phạt, gõ lại.
- Lượt thả thính không chiếm ghế, không tính vào số khách / mục tiêu; khách khác không mất kiên nhẫn khi đang giải.
- Lượt anh Hiếu ghé mua hàng giữ nguyên hoàn toàn.
- Học sinh & Bé Na không bao giờ nói câu lái (chỉ anh Hiếu nói).
- Câu đi lần lượt qua cả danh sách, không lặp cho đến khi đã gặp hết; tiến độ lưu trong save.

## Review Focus

- Bống gõ đáp án không dấu / viết hoa / thừa dấu câu → vẫn tính đúng (test ở Task 2).
- Ô nhập trống mà bấm "Trả lời" → không tính sai, không crash, nhắc nhẹ (test ở Task 3).
- Lượt thả thính trùng lúc đang có popup khác (sổ công thức, cốt truyện, tạm dừng) hoặc đang lắc/cuốn → lượt ghé chờ tới khi rảnh, không chồng popup (test ở Task 3).
- Hết sạch danh sách câu → quay lại từ đầu, không lỗi chỉ số (test ở Task 2).
- Bàn phím điện thoại bật lên che ô nhập → popup đặt ô nhập ở nửa trên màn hình, cuộn được (kiểm tra bằng ảnh chụp 360×640 ở Task 3).

---

### Task 1: Dữ liệu câu thính & đáp án nháp, cấu hình

**Files:**
- Modify: `personal.js` (thêm `flirtLines` cuối object)
- Modify: `config.js` (gameplay, money, texts, quests)
- Test: `<scratchpad>/test/flirt-data.js`

**Interfaces:**
- Produces: `PERSONAL.flirtLines: Array<{ lines: string[], answers: string[], note?: string }>`;
  `CONFIG.gameplay.tomoFlirtFromDay=3, tomoFlirtPerDay=3, tomoFlirtSecret=10, tomoFlirtWindow=[0.15, 0.9]` (tỉ lệ tiến độ ca để rải lượt ghé);
  `CONFIG.money.flirtRewardTip=20, flirtRewardHearts=1, flirtGiveUpTip=10`;
  texts: `flirtTitle, flirtPlaceholder, flirtSubmit, flirtGiveUp, flirtEmpty, flirtWrong, flirtRight, flirtReveal, flirtBookTitle, flirtBookCount, flirtLocked, flirtByHim, flirtGreet`;
  quest `{ id: "flirt", text: "Giải {n} câu thính của anh {me}", n: 3, reward: 50, fromDay: 3 }`.

Nội dung bắt buộc (giữ nguyên từng chữ người dùng gửi, gộp theo dòng trống; trùng lặp "vòng ngọc nhìn cưng" chỉ giữ 1). Các mục nhiều dòng là MỘT câu:
`Gọi em là sự thật / Vì anh chỉ muốn vạch trần` · `nước cốt dừa trong canh của u / chúng đặc và trắng đục` · `hôm nay nấu món tai và giò / vần anh đảo rất bậy` · `nhưng mà hôm nay hơi lười chơi chữ / trừ chơi l-` · `gọi em là mặt trời / vì anh muốn thấy em đương sáng` · `Co lại nếu cai lọ / To ra là do ta` · `bố mới vừa mở tiệm photocopy / bố bận vì nhiều em in` · `Tuyển thư kí: / Nữ yêu cầu IT căng và IELTS nuột / Nam yêu cầu IQ khủng` · `phải cùng nangf ăn tối / anh mới thấy được quá trình xơi`. Mọi dòng còn lại là một câu riêng.

- [ ] **Step 1: Viết test dữ liệu** — `flirt-data.js` nạp `personal.js` + `config.js` trong Node (`global.window = {}`), so với danh sách gốc người dùng (dán nguyên văn vào test làm mảng `RAW`): mọi dòng của `RAW` (bỏ dòng trống, bỏ trùng) xuất hiện trong đúng một `flirtLines[i].lines`; mỗi mục có `answers.length >= 1` và đáp án không rỗng; đếm số mục có `note`; config có đủ khoá trên.
- [ ] **Step 2: Chạy test, thấy FAIL** — `node <scratchpad>/test/flirt-data.js` → báo thiếu `flirtLines`.
- [ ] **Step 3: Thêm dữ liệu** — viết `flirtLines` với đáp án nháp (nói lái: hoán đổi vần/thanh giữa các tiếng để ra nghĩa thật; câu chơi chữ không phải lái thì đáp án là từ/ý được gài). Câu nào không chắc: `note: "CẦN KIỂM TRA"`. Thêm khoá config & texts.
- [ ] **Step 4: Chạy test, thấy PASS** và in ra số câu + số câu "CẦN KIỂM TRA".
- [ ] **Step 5: Commit** `personal.js config.js` — "Thêm dữ liệu câu thính của anh Hiếu (đáp án nháp)".

### Task 2: Chấm đáp án & tiến độ (`BT.Flirt`)

**Files:**
- Modify: `src/save.js` (defaults + object `BT.Flirt`)
- Test: `<scratchpad>/test/flirt-logic.js`

**Interfaces:**
- Consumes: `PERSONAL.flirtLines`, `BT.Save.state`.
- Produces:
  - state mới: `flirt: { next: number, solved: { [index]: "self" | "told" } }` (thêm vào `defaults()`).
  - `BT.Flirt.normalize(s: string) -> string` — chữ thường, bỏ dấu tiếng Việt (NFD + xoá dấu, đ→d), bỏ ký tự không phải chữ/số, gộp khoảng trắng.
  - `BT.Flirt.check(index: number, input: string) -> boolean` — true nếu `normalize(input)` bằng `normalize` của một đáp án, hoặc chứa trọn một đáp án đã normalize có độ dài ≥ 4.
  - `BT.Flirt.take() -> number` — trả chỉ số câu tiếp theo chưa gặp trong vòng hiện tại, tăng `next` (vòng lại 0 khi hết).
  - `BT.Flirt.mark(index: number, how: "self" | "told") -> void` — ghi `solved[index]` (giữ "self" nếu đã có), `BT.Save.persist()`.
  - `BT.Flirt.count() -> { solved: number, total: number }`.

- [ ] **Step 1: Viết test** — trong Node nạp personal/config/save (stub `localStorage`), đặt `PERSONAL.flirtLines` giả 3 mục; assert:
  `normalize("  NỨNG Đã!! ") === "nung da"`; `check(0, "nung da co anh")` true khi answers[0]="Nứng đã có anh"; `check(0, "NUNG DA CO ANH")` true; `check(0, "")` false; `check(0, "abc")` false;
  `take()` trả 0,1,2,0 qua 4 lần gọi; `mark(1,"told"); mark(1,"self")` → `solved[1]==="self"`; `mark(2,"self"); mark(2,"told")` → `"self"`; `count()` → `{solved:2,total:3}`.
- [ ] **Step 2: Chạy, thấy FAIL** (`BT.Flirt` undefined).
- [ ] **Step 3: Cài đặt** các hàm trên trong `src/save.js`, gắn `BT.Flirt`.
- [ ] **Step 4: Chạy, thấy PASS.**
- [ ] **Step 5: Commit** — "Chấm đáp án & lưu tiến độ câu thính".

### Task 3: Lượt anh Hiếu ghé thả thính trong ca

**Files:**
- Modify: `src/screens/GameScreen.js` (lên lịch, cảnh anh đứng quầy, popup, thưởng)
- Modify: `style.css` (anh đứng quầy, popup có ô nhập)
- Modify: `src/save.js` (`BT.Progress.questAdd("flirt", n)` dùng sẵn)
- Test: `<scratchpad>/test/flirt-game.js` (Playwright, file://)

**Interfaces:**
- Consumes: `BT.Flirt.take/check/mark`, config/texts Task 1, `UI.modal`, `UI.icon("tomortle")`, `UI.heartBurst`, `this.pauseReasons`, `this.applyEffect({tip, heart})` (đã có).
- Produces (trên đối tượng Game): `this.flirtAt: number[]` (các mốc tiến độ ca 0–1 đã lên lịch), `this.flirtDone: number`, `startFlirt()`, `this.flirtActive: boolean`; DOM `.flirt-visitor` (anh đứng quầy), popup class `modal-flirt` chứa `textarea.flirt-input`, nút `.flirt-submit`, `.flirt-giveup`.

Hành vi: lên lịch trong `planSpecials()` — ngày thường từ `tomoFlirtFromDay`: `tomoFlirtPerDay` mốc ngẫu nhiên trong `tomoFlirtWindow` theo tỉ lệ `this.done / this.total`; Ngày bí mật dùng `tomoFlirtSecret`, rải đều. Trong `update()`, khi tới mốc và **không** có popup / `shakeLayer` / `tut` / lượt thả thính khác → `startFlirt()`: anh đi vào đứng trước quầy (bubble hiện đủ các dòng của câu, chữ nối bằng xuống dòng), `pauseReasons.add("flirt")`, mở popup (tiêu đề `flirtTitle`, các dòng câu, ô nhập `flirtPlaceholder`, nút `flirtSubmit` + `flirtGiveUp`). Nếu chưa tới lượt kịp trước khi hết khách thì chạy các lượt còn lại trước khi `finish()`.
- Trả lời đúng → `mark(i,"self")`, `applyEffect({ tip: flirtRewardTip, heart: flirtRewardHearts })`, `heartBurst`, câu `flirtRight`, `questAdd("flirt",1)`.
- Ô trống → toast `flirtEmpty`, popup giữ nguyên. Sai → rung ô nhập + `flirtWrong`, giữ popup.
- Chịu thua → `mark(i,"told")`, hiện `flirtReveal` + đáp án đầu tiên, `applyEffect({ tip: flirtGiveUpTip })`.
- Đóng popup → bỏ `"flirt"` khỏi `pauseReasons`, anh vẫy tay đi ra.

- [ ] **Step 1: Viết test Playwright** — mở game, đặt state Ngày 3, `tomoFlirtWindow=[0,0.01]`, `tomoFlirtPerDay=2`; vào ca; assert: popup `.modal-flirt` hiện trong 8 giây; trong lúc mở, `patience` mọi khách không đổi sau 1,5 giây; bấm "Trả lời" với ô trống → popup còn; gõ đáp án không dấu của câu đang hiện → popup đóng, `S.flirt.solved[i]==="self"`, wallet tăng ≥ 20; lượt 2: bấm "Chịu" → `solved[j]==="told"`, wallet +10; mở sổ công thức trước mốc → lượt thả thính chờ đến khi đóng sổ. Chụp ảnh popup ở 390×844 và 360×640.
- [ ] **Step 2: Chạy, thấy FAIL** (không có popup).
- [ ] **Step 3: Cài đặt** như mô tả; CSS: popup đặt sát trên (`align-items:flex-start`) để bàn phím không che.
- [ ] **Step 4: Chạy, thấy PASS**; xem 2 ảnh chụp.
- [ ] **Step 5: Chạy lại hồi quy** `play.js` (Ngày 1) và `run15b.js` với START=13 (bot tự bấm "Chịu" khi gặp `.modal-flirt`) — không treo, không lỗi.
- [ ] **Step 6: Commit** — "Anh Hiếu ghé tiệm thả thính, có ô giải đố".

### Task 4: Sổ thính trong Album, README

**Files:**
- Modify: `src/screens/AlbumScreen.js`, `style.css`, `README.md`, `service-worker.js` (tăng `CACHE_VERSION` lên `bongtrang-v1.2.0`)
- Test: `<scratchpad>/test/flirt-book.js`

**Interfaces:**
- Consumes: `BT.Flirt.count()`, `S.flirt.solved`, `PERSONAL.flirtLines`, texts Task 1.
- Produces: nút/thẻ `.flirt-book-card` đầu Album hiển thị `flirtBookCount` ("Sổ thính · đã giải N/tổng"); bấm mở popup liệt kê câu đã giải (các dòng + đáp án; mục "told" có nhãn `flirtByHim`), câu chưa gặp hiện `flirtLocked`.

- [ ] **Step 1: Viết test** — đặt `S.flirt.solved = {0:"self", 3:"told"}`; vào Album; assert thẻ hiện "2/" + tổng; mở popup → có đúng 2 mục đã giải, mục 3 có nhãn "anh nói"; không có emoji thô trong chữ hiển thị.
- [ ] **Step 2: Chạy, thấy FAIL.**
- [ ] **Step 3: Cài đặt** thẻ + popup; README thêm mục "Sổ thính & sửa câu thính trong personal.js"; tăng phiên bản service worker.
- [ ] **Step 4: Chạy, thấy PASS.**
- [ ] **Step 5: Commit & push** — "Sổ thính của anh Hiếu trong Album".
