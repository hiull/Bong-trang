# Mùa 2 · Quầy Chè & Anh Hiếu phụ tiệm — Kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm Mùa 2 (30 mốc, cấp 16–30), gồm quầy chè xếp lớp, anh Hiếu phụ tiệm, sự kiện bác Sáu và xe chè đối thủ. Khung mốc chạy được nhiều mùa.

**Architecture:**
- `BT.MS` nhận thêm tham số mùa. Lưu trữ lên version 3, gồm `season` và `msBySeason`.
- Quầy chè là khu thứ 5, đi qua đúng các nhánh xử lý khay sẵn có (`Tray.add` / `evaluate` / `render`), với mảng `layers` giữ thứ tự.
- Anh Hiếu phụ tiệm là một module riêng `src/helper.js` (`BT.Helper`), được GameScreen gọi mỗi khung hình.
- Nội dung (truyện, thẻ công thức, thư) nằm trong `personal.js`. Số liệu nằm trong `config.js`.

**Tech Stack:** JS thuần (script cổ điển), Node cho test logic, Playwright (Chromium cài sẵn) cho test giao diện, Python cho bộ vẽ doodle.

**Spec:** `docs/superpowers/specs/2026-11-22-mua-2-quay-che-design.md`

## Global Constraints

- Chữ hiển thị tiếng Việt có dấu, đặt trong `CONFIG.texts`. Số cân bằng đặt trong `config.js`. Truyện, thư, thẻ công thức đặt trong `personal.js`.
- Không làm đổi số liệu hay hành vi Mùa 1. Bộ kiểm thử Mùa 1 hiện có (`$T/suite.sh`) phải xanh sau mỗi task.
- Không emoji thô trên màn hình: emoji mới phải có doodle (`tools/doodle/gen.py` → `assets/img/doodles.js`).
- Test để ở `T=/tmp/claude-0/-home-user-Bong-trang/f0b9bacd-7275-5409-af9c-c125f1d454fd/scratchpad/test`, không commit. Thêm test mới vào `$T/suite.sh`.
- Commit kết thúc bằng hai dòng ghi công của phiên. Đẩy lên `claude/dazzling-wozniak-24772b` (GitHub Pages tự dựng từ nhánh này).
- Task cuối nâng `CACHE_VERSION` lên `bongtrang-v1.4.0` và sửa `$T/p6.js` cho khớp.

## Review Focus

1. **Chơi lại mốc Mùa 1 khi đang ở Mùa 2** → sao và kỷ lục ghi vào Mùa 1, tiến độ ×0.5 vào mốc hiện tại Mùa 2. Không mở thẻ hay kỷ niệm sai mùa. *Test ở Task 3.*
2. **Ca bí mật sau khi đã mở Mùa 2** → vẫn chỉ có món và khu Mùa 1, không có quầy chè. *Test ở Task 1.*
3. **Anh Hiếu chạy bàn** khi khay đúng món của **nhiều** khách cùng lúc → chỉ giao cho một khách (khách chờ lâu nhất), khay không giao hai lần. *Test ở Task 4.*
4. **Bác Sáu thu tiền khi ví 0** → tự khất, không âm ví; khất rồi mà lần sau vẫn không đủ tiền → trả hết số đang có, nợ phần còn lại, không âm ví, không chặn ca. *Test ở Task 5.*
5. **Màn 360px có 5 quầy** → thanh quầy không tràn, chữ không chồng. *Test ở Task 2.*

---

### Task 1: Khung nhiều mùa (`BT.MS` theo mùa, lưu trữ v3)

**Files:**
- Modify: `config.js` (`seasons[1]`, `days` 16–30), `src/milestones.js`, `src/save.js` (defaults, `version: 3`).
- Test: `$T/s2-core.js` (Node, dùng `_env.js`).

**Interfaces — Produces:**

```
S.season: 1|2   S.msBySeason: { [sid]: msState }   (msState = dạng S.ms hiện tại)
S.s2 = { cards: [], memories: [], endingSeen: false, bonusSeen: false, goldHearts: 0, started: false }
BT.MS.season(sid?): seasonCfg            // mặc định S.season
BT.MS.list(sid?) / count(sid?) / get(i, sid?) / majorIndex(day, sid?)
BT.MS.stateOf(sid): msState              // S.ms nếu sid === S.season, ngược lại S.msBySeason[sid]
BT.MS.run(i, { replay, season }): Run    // Run thêm trường season; key = "s{season}ms{i}"
BT.MS.goldHearts(sid?): int
BT.MS.startSeason(sid): void             // cất S.ms vào msBySeason[cũ], nạp/khởi tạo mùa sid, S.season = sid
BT.MS.nextSeasonReady(): bool            // mùa hiện tại đã qua hết mốc && đã xem đoạn kết của mùa đó && CONFIG có mùa sau
BT.MS.secretRun().level === CONFIG.build.maxPlayableDay   // 15, không thấy món Mùa 2
```

**Dữ liệu:**
- `days` 16–30 theo spec §4.3:
  - `customers`: 18, 18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24, 24.
  - `target`: 760, 810, 860, 910, 960, 1010, 1060, 1110, 1170, 1230, 1290, 1350, 1410, 1460, 1500.
  - `spawn` từ [3, 4] giảm 0,03 mỗi mốc lớn tới [2.6, 3.4].
  - `patienceMult` 1.0 → 0.95.
  - `weather` xoay vòng các loại có sẵn; ngày 29 = `festival`, ngày 30 = `sunset`.
  - `unlock` theo bảng món của spec §4.2 (Task 2 tạo các id).
  - Ngày 16–18 có `cheWeight: 0.5`.
- `seasons[1] = { id: 2, name: "Mùa 2 · Quầy chè đầu hẻm", majorDays: [16..30], minorPerMajor: 1 }`.

**Chuyển đổi:** `migrate` xử lý cả v1 → v3 và v2 → v3. Với v2: `season = 1`, `msBySeason = {}`, `s2` mặc định.

- [ ] **Step 1: Viết `$T/s2-core.js`.** Các phép kiểm:
  - `count(2)===30`.
  - `get(1,2).day===16`, `get(1,2).level===16`.
  - `majorIndex(30,2)===29`.
  - `count(1)===30`, `get(29,1).day===15` (Mùa 1 không đổi).
  - `get(2,1).cfg.target===75` (Mùa 1 giữ nguyên số liệu).
  - Bản v2 `{version:2, ms:{index:13,…}}` → `migrate` → `version===3`, `season===1`, `ms.index===13`.
  - Đặt `S.ms.cleared=30`, `S.endingSeen=true` → `nextSeasonReady()===true`.
  - `startSeason(2)` → `S.season===2`, `S.ms.index===1`, `S.msBySeason[1].cleared===30`.
  - `stateOf(1).cleared===30`.
  - `run(5,{replay:true,season:1}).season===1`, `.key==='s1ms5'`, `.level===3`.
  - `run(1).level===16`, `.key==='s2ms1'`.
  - **Review Focus 2:** `secretRun().level===15`.
  - `goldHearts(1)` đếm đúng từ `msBySeason[1].best`.
- [ ] **Step 2:** `node $T/s2-core.js` → FAIL.
- [ ] **Step 3:** Code theo Interfaces. Mọi chỗ đang dùng `S.ms.best[run.ms]` ở `GameScreen.finish` phải dùng `MS.stateOf(run.season)`. Riêng `addProgress` vẫn ghi vào mùa hiện tại.
- [ ] **Step 4:** `node $T/s2-core.js && $T/suite.sh` → PASS / ALL PASS.
- [ ] **Step 5:** Commit `feat: khung nhiều mùa`.

### Task 2: Quầy Chè & Sữa chua (xếp lớp)

**Files:**
- Modify: `config.js` (`zones` thêm `che`, `zoneRoles.che = { base: ["coc_che"], finish: ["da", "dua_nao"] }`, `ingredients`, `recipes`, `build.playableZones`, `tutorials[16]`, texts), `src/components/Tray.js`, `src/screens/GameScreen.js` (`dishWeight` áp `cheWeight` cho zone che; sổ công thức), `style.css` (dải lớp, thanh 5 quầy gọn).
- Test: `$T/che.js` (Playwright).

**Interfaces — Produces:**
- `tray.layers: string[]` (chỉ ở zone `che`), `tray.finish` dùng cho lớp phủ.
- `Tray.requirements(dish)` trả thêm `layers: string[]` cho chè: theo công thức sau khi áp `remove` / `double`; `double` chèn thêm một phần tử cùng id ngay sau phần tử đó.
- `Tray.evaluate` cho chè: `layers` khác thứ tự → `{ ok:false, reason:"order", ing:<id đầu tiên sai> }`; lớp phủ thiếu hay thừa → `missing` / `extra`.
- Text `badOrder: "Sai thứ tự lớp: {ing}"` dùng ở chỗ GameScreen đổi `reason` thành câu báo.
- Công thức chè dùng `toppings` = thứ tự lớp (mảng có thứ tự) và `finish` = lớp phủ. Combo Mùa Hè dùng `combo: ["che_thai", "tra_tac"]` như `combo_tinh_yeu`.

**Dữ liệu:** id nguyên liệu và món theo bảng spec §4.2:
- id món: `che_dau_xanh, sua_chua_da, che_dau_do, che_suong_sao, sua_chua_mit, che_thap_cam, sua_chua_nep_cam, che_thai, sua_chua_tran_chau, che_dua_non, che_ba_mau, sua_chua_dua, combo_mua_he, che_dac_biet, ly_che_hen_ho`;
- `zone: "che"`, `base: "coc_che"`, `openDay` = mốc lớn trong bảng;
- `da` và `tran_chau` thêm `"che"` vào `zones` mà **không** đổi `openDay`.

- [ ] **Step 1: Viết `$T/che.js`.** Mở game ở Mùa 2 mốc 1 (đặt `S.season=2` qua `startSeason(2)`, kho 20). Các phép kiểm:
  - Có tab `che`.
  - Chọn cốc → đậu xanh → nước cốt dừa → đá → giao cho khách gọi Chè đậu xanh → khách nhận (`stats.served` tăng).
  - Đảo thứ tự (nước cốt trước) → toast chứa "Sai thứ tự", khách không nhận.
  - Thêm đá trước khi có lớp → bị từ chối.
  - Yêu cầu `remove` nước cốt → chỉ đậu xanh + đá là đúng.
  - Hướng dẫn mốc 16 chạy được (`tutorialDone.day16` sau khi hướng dẫn xong).
  - **Review Focus 5:** ở 360×640, mỗi nút `.tab` nằm trọn trong khung, không chồng nhau.
  - Không lỗi JS.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** Code. Mỗi lần thêm lớp phát âm `pop` (âm sẵn có). Dải lớp vẽ trong `Tray.render`: mỗi lớp là `span.layer` có `--c` là màu riêng của nguyên liệu (thêm trường `color` cho nguyên liệu chè trong config).
- [ ] **Step 4:** `node $T/che.js && $T/suite.sh` → PASS.
- [ ] **Step 5:** Commit `feat: quầy chè xếp lớp`.

### Task 3: Chuyển mùa, bản đồ theo mùa, phần thưởng Mùa 2

**Files:**
- Modify: `MenuScreen.js` (thẻ "Mùa 2 mở rồi!" + thư mở mùa), `MapScreen.js` (thanh chọn mùa), `GameScreen.js` (`applyCleared` theo mùa), `ResultScreen.js`, `EndingScreen.js` (tham số `season`), `AlbumScreen.js` (Sổ công thức Mùa 2, kỷ niệm Mùa 2 nếu có), `personal.js` (`season2Intro`, `ending2`, `bonusMessage2`, `recipeCards2` 15 thẻ `{title, text}`, `memories2: []`), `config.js` texts.
- Test: `$T/s2-flow.js` (Playwright).

**Interfaces:**
- `UI.runTitle(run)`: mùa 2 thì ra `"Mùa 2 · Mốc N"`; mùa 1 giữ `"Mốc N"`.
- `applyCleared(progress)` ở mùa 2:
  - Mốc lớn ngày d → push `d−16` vào `S.s2.cards` (nếu chưa có). Nếu `PERSONAL.memories2[d−16]` có thì push vào `S.s2.memories` và trả `newMemory2`.
  - Qua mốc 30 mùa 2 mà `!S.s2.endingSeen` → `ending2: true`.
- `S.s2.goldHearts = MS.goldHearts(2)`. Đủ 15 thì `bonusMessage2` (như Mùa 1).
- `Router.go("Ending", { season: 2 })` dùng `ending2`, trình chiếu các thẻ công thức (và `memories2` nếu có), cuối cùng đặt `S.s2.endingSeen = true`.
- Album: kỷ niệm Mùa 2 tự mở cho mốc lớn đã qua khi `memories2` được thêm sau (kiểm lúc mở Album).
- Sau đoạn kết Mùa 2 (không còn mùa sau), Menu hiện dòng `season3Soon`: "Mùa 3 đang được chuẩn bị 💕".

- [ ] **Step 1: Viết `$T/s2-flow.js`.**
  - `S.ms.cleared=30`, `endingSeen=true` → Menu có `.season-card`. Bấm vào → thư mở mùa → `S.season===2`.
  - Bản đồ có `.season-tabs` với 2 nút, đang hiện Mùa 2 (30 nút).
  - Chơi ca mốc 1 Mùa 2 qua mốc (dùng `_page.shift` như ms-flow) → `S.s2.cards` chứa 0, Result có thẻ công thức.
  - **Review Focus 1:** chơi lại `MS.run(3,{replay:true,season:1})` thắng 3 sao → `stateOf(1).best[3].stars===3`, `S.ms.progress` (mùa 2) tăng đúng `1.25×0.5`, `S.s2.cards` không đổi.
  - Đặt mùa 2 `index=30, cleared=29, progress=3.1` → qua mốc → nút "Bất ngờ" → màn kết dùng `ending2` → `S.s2.endingSeen===true`.
  - Album có `.cards2-book-card`.
  - Đặt `PERSONAL.memories2=[{…}]` khi mốc lớn 16 đã qua → mở Album thấy kỷ niệm Mùa 2.
  - Không lỗi JS.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** Code và viết nháp nội dung (thư mở mùa, thư kết, lời nhắn 15 tim, 15 thẻ công thức; giọng dễ thương, không sến).
- [ ] **Step 4:** `node $T/s2-flow.js && $T/suite.sh` → PASS.
- [ ] **Step 5:** Commit `feat: chuyển mùa và phần thưởng mùa 2`.

### Task 4: Anh Hiếu phụ tiệm

**Files:**
- Create: `src/helper.js` (`BT.Helper`). Thêm vào `index.html` sau `src/milestones.js`, và vào danh sách cache của service worker.
- Modify: `config.js` (`helper`, texts), `save.js` (defaults `helper`), `PrepScreen.js` (hàng chọn việc), `GameScreen.js` (gọi `Helper.tick`, hình + bong bóng, tắt lượt anh ghé mua khi đi làm), `AlbumScreen.js` (mục "Anh phụ tiệm"), `personal.js` (`helperLines` 20 câu, `helperChapters` 3 chương `{text, choices:[{label, effect}]}`, `helperLate`, `helperSpill`).
- Test: `$T/helper.js` (Playwright).

**Interfaces — Produces:**

```
CONFIG.helper = { fromSeason: 2, fromMilestone: 3, levelAt: [0, 8, 20],
  waiterSec: [1.5, 1.1, 0.8], drinkSec: [6, 5, 4], cheSec: [1.2, 0.9, 0.6], patienceSlow: 0.1,
  drinks: ["tra_da", "tra_tac", "nuoc_mia_ly"], eventRate: 0.1, lateShare: 0.2, bubbleEverySec: [14, 22] }
S.helper = { unlocked: false, role: "waiter", shifts: 0, chapters: 0 }
BT.Helper.unlocked(): bool
BT.Helper.level(): 1|2|3                     // theo levelAt và S.helper.shifts
BT.Helper.working(run): bool                 // unlocked && role !== "off" && run.mode !== "secret"
BT.Helper.attach(game): void                 // gọi trong constructor khi working; dựng hình, lập sự kiện
BT.Helper.tick(game, dt): void               // gọi trong update khi không pause
BT.Helper.onShiftEnd(game): { levelUp: bool, chapter: int|null }
```

**Hành vi:**
- **Mở:** qua mốc 2 mùa 2 → `S.helper.unlocked = true` và hiện chương 1 ở Result.
- **Chạy bàn:**
  - Mỗi khay (không rỗng) có `readySince`. Khi một khay `Tray.evaluate` đúng món đang chờ của **khách chờ lâu nhất** và đã sẵn sàng đủ `waiterSec` mà chưa được chọn giao, thì gọi `game.deliver(c, tray)` một lần.
  - Khách đang chờ giảm kiên nhẫn chậm hơn 10%: nhân `dt` của `c.update` với 0.9.
- **Pha nước:** một đơn nước đang chờ trong `drinks` thì sau `drinkSec` tạo một khay nước đúng món (trừ kho như khi Bống làm) rồi giao. Thiếu hàng thì bỏ qua, có toast một lần.
- **Phụ chè:** khay chè có `layers` khớp đủ thứ tự của một món đang chờ mà thiếu lớp phủ → sau `cheSec` thì thêm lớp phủ (trừ kho).
- **Ca anh đi làm:**
  - `planSpecials` không xếp lượt anh ghé mua; `flirtAt` giữ nguyên.
  - Ca daily có luật `hieu_busy` → anh không đi làm.
- **Sự kiện:** 10% mỗi ca, một trong hai:
  - "đi trễ": không làm gì trong 20% đầu ca, kèm toast;
  - "đổ ly": trừ 1 phần một nguyên liệu ngẫu nhiên đang có, kèm toast.
- **Cuối ca:** `S.helper.shifts++`. Lên cấp thì mở chương kế (chương 2 ở cấp 2, chương 3 ở cấp 3), hiện ở Result.

- [ ] **Step 1: Viết `$T/helper.js`.**
  - Mùa 2 mốc 3, `S.helper.unlocked=true`.
  - Prep có `.helper-pick` với 4 nút.
  - **role waiter:** làm sẵn một khay đúng món cho khách → sau ≤2 giây khách đã nhận mà không bấm giao.
  - **Review Focus 3:** hai khách cùng gọi một món và một khay đúng → chỉ một khách nhận, khay rỗng sau đó, `stats.served` tăng đúng 1.
  - **role drinks:** khách gọi Trà đá → nhận sau ≤7 giây; khách gọi Trà sữa → không tự làm.
  - **role che:** khay đậu xanh → nước cốt dừa → sau ≤1,5 giây có đá.
  - **role off:** ca có lượt anh ghé mua (`tomoWanted ≥ 1`); ca đi làm thì `tomoWanted === 0`.
  - `S.helper.shifts` tăng 1 mỗi ca. Đặt `shifts=7` rồi xong ca → Result có chương 2.
  - Album có mục anh phụ tiệm.
  - Không lỗi JS.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** Code và viết nháp nội dung (20 câu thoại, 3 chương "Sau giờ đóng cửa").
- [ ] **Step 4:** `node $T/helper.js && $T/suite.sh` → PASS.
- [ ] **Step 5:** Commit `feat: anh Hiếu phụ tiệm`.

### Task 5: Bác Sáu chủ nhà & Xe chè đối thủ

**Files:**
- Modify: `config.js` (`landlord`, `rival`, texts), `save.js` (`rent: { owed: 0, deferredOnce: false, lastDay: 0 }`), `PrepScreen.js` (bác ghé khi mở màn Chuẩn bị của ca kịch bản mốc lớn chẵn), `GameScreen.js` (xe chè), `personal.js` (`landlordLines` 6, `rivalLines` 4).
- Test: `$T/events2.js` (Playwright).

**Interfaces:**
- `CONFIG.landlord = { fromDay: 18, everyEvenDay: true, rent: { 18: 50, 22: 80, 26: 100, 30: 120 } }`. Giá áp theo mốc gần nhất ≤ ngày hiện tại.
- `BT.Rent.due(run): number|null` (trong `src/milestones.js`).
- `BT.Rent.pay(choice:"pay"|"defer"): { paid, owed }`.
- `CONFIG.rival = { fromDay: 22, rate: 0.25, window: [0.35, 0.65], patienceFaster: 0.15, beatStreak: 5, beatReward: 30 }`.

**Bác Sáu:**
- Ca kịch bản của mốc lớn chẵn (ngày ≥ 18) mà `lastDay < day` thì ở màn Chuẩn bị hiện modal bác Sáu: số tiền = `rent + owed`.
- Nút "Gửi bác": trả `min(ví, số tiền)`, phần còn lại thành `owed`.
- Nút "Khất bác tuần sau": chỉ hiện khi `!deferredOnce`; nhấn thì `owed += rent`, `deferredOnce = true`.
- Ví 0 → tự khất (hoặc nếu đã khất thì trả 0 và nợ tiếp).
- Không bao giờ âm ví. Đặt `lastDay = day`.

**Xe chè:**
- Ca thường (không kịch bản, không secret, không endless) ngày ≥ 22, xác suất `rate` → xe xuất hiện khi tiến độ `done/total` nằm trong `window`.
- Khi có xe: kiên nhẫn khách giảm nhanh hơn 15% (nhân `dt` với 1.15), có dải `.rival` trên đầu màn.
- Phục vụ liền `beatStreak` khách khi có xe (một khách bỏ đi thì chuỗi về 0) → xe đi, +30k, câu thoại. Hết `window` thì xe đi lặng lẽ.

- [ ] **Step 1: Viết `$T/events2.js`.**
  - Mùa 2 mốc lớn 18 lần đầu → Prep hiện bác Sáu; "Gửi bác" trừ 50k.
  - **Review Focus 4:** ví 0 → tự khất, `owed===50`, ví vẫn 0. Lần sau (mốc lớn 20, ví 60) → modal 130k, không có nút khất, "Gửi bác" → ví 0, `owed===70`.
  - Ép xe chè (`game.rivalOn()`), phục vụ 5 khách liền → xe đi, ví +30k.
  - Không lỗi JS.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** Code và viết nháp câu thoại.
- [ ] **Step 4:** `node $T/events2.js && $T/suite.sh` → PASS.
- [ ] **Step 5:** Commit `feat: bác Sáu và xe chè đối thủ`.

### Task 6: Nội dung Mùa 2 & hình vẽ

**Files:**
- Modify: `config.js` (`regulars`: chapters 5–6 cho chị Lan, chú Tư, bé Na có `fromLevel: 16`; khách quen mới `co_hanh` với `startDay: 17`, món `che_ba_mau` (mở ở 26; trước đó dùng món chè có sẵn gần nhất — **Ruling khi làm**), 3 chương; `daily.rules` thêm `che_day` và `hieu_busy`), `GameScreen.js` (số chương sẵn có = số chương có `fromLevel ≤ level`, thay cho hằng `regularChapters`), `personal.js` (`minorTales` thêm 15), `tools/doodle/gen.py` → `assets/img/doodles.js` (11 nguyên liệu, 14 món chè, cốc chè, cô Hạnh, bác Sáu, xe chè).
- Test: `$T/s2-content.js` (Node: số chương, luật mới; Playwright: không còn emoji thô ở Prep / Game / Album Mùa 2).

**Luật mới:**
- `che_day`: món chủ đạo chọn trong các món zone `che` đã mở.
- `hieu_busy`: `helperOff: true`, `tipMult: 1.5`.

- [ ] **Step 1: Viết `$T/s2-content.js`.** Các phép kiểm:
  - Mùa 1 (cấp 15): chị Lan có 4 chương sẵn có.
  - Cấp 16: chị Lan có 6 chương.
  - `co_hanh` có 3 chương.
  - `minorTales.length===35`.
  - Daily ở mùa 2 có thể ra `che_day`: duyệt 60 ngày, có ít nhất 1 lần.
  - Các màn Prep / Game (tab che) / Album ở mùa 2 không có emoji thô.
- [ ] **Step 2:** chạy → FAIL.
- [ ] **Step 3:** Viết nội dung, vẽ doodle, chạy `python3 tools/doodle/gen.py assets/img/doodles.js`.
- [ ] **Step 4:** `node $T/s2-content.js && $T/suite.sh` → PASS. Xem ảnh chụp các hình mới.
- [ ] **Step 5:** Commit `feat: nội dung và hình vẽ mùa 2`.

### Task 7: Máy tự chơi hết Mùa 2, bố cục, tài liệu

**Files:**
- Modify: `README.md` (mục "13. Mùa 2": cách sửa thư, thẻ công thức, thêm kỷ niệm Mùa 2, chỉnh số liệu), `service-worker.js` (`bongtrang-v1.4.0`), `$T/p6.js`.
- Test: `$T/s2-bot.js` (như `ms-bot.js` nhưng bắt đầu ở mùa 2), `$T/ipad.js` và `$T/fullbleed.js` chạy lại với mùa 2.

- [ ] **Step 1: Viết `$T/s2-bot.js`.** Đi hết 30 mốc mùa 2 bằng "Ca tiếp".
  - Anh Hiếu đổi việc mỗi ca theo vòng waiter → drinks → che → off.
  - Gặp bác Sáu thì bấm "Gửi bác".
  - Kiểm: tới đoạn kết Mùa 2; ≤ 12 ca mỗi mốc; `S.s2.cards.length===15`; không lỗi JS.
- [ ] **Step 2:** Chạy `s2-bot.js`, `ipad.js`, `fullbleed.js` (đặt mùa 2 trước khi chụp).
- [ ] **Step 3:** README, cache.
- [ ] **Step 4:** `$T/suite.sh` (đã thêm mọi test mới) → ALL PASS.
- [ ] **Step 5:** Commit `feat: hoàn tất mùa 2`, đẩy lên nhánh.
