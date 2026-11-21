# Mốc, Thử thách mỗi ngày & Ca vô tận — Kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay 15 ngày bằng 30 mốc chơi theo ca, và thêm Thử thách mỗi ngày (kèm lời nhắn) cùng Ca vô tận. Cả ba chế độ cùng cộng tiến độ mốc.

**Architecture:**
- Module mới `src/milestones.js` (`BT.MS`, `BT.Daily`, `BT.Endless`) sinh danh sách mốc từ `CONFIG.days`, tính tiến độ, và tạo **Run**: một đối tượng mô tả một ca.
- Prep → Game → Result truyền `{ run }` thay cho `{ day }`. GameScreen lấy `dayNum` / `dayCfg` / `dayId` từ `run`, nên phần lõi gần như không đổi.
- Bản lưu cũ chuyển đổi một lần trong `Save.load` / `importCode`.

**Tech Stack:** JS thuần (script cổ điển, biến toàn cục `BT`), Node cho test logic, Playwright (Chromium cài sẵn) cho test giao diện.

**Spec:** `docs/superpowers/specs/2026-11-21-moc-thu-thach-ca-vo-tan-design.md`

## Global Constraints

- Mọi chữ hiển thị là tiếng Việt có dấu, đặt trong `CONFIG.texts`. Mọi con số cân bằng đặt trong `config.js`. Lời nhắn và chuyện vặt đặt trong `personal.js`.
- Không framework, không máy chủ, không quảng cáo, không thu thập dữ liệu. Chạy được qua `file://`.
- Không cơ chế phạt khi nghỉ chơi, không thông báo trách móc khi mất chuỗi, không thưởng theo chuỗi.
- Biểu tượng mới dùng emoji. `UI.rich` / `UI.icon` tự thay emoji có doodle; emoji chưa có doodle thì thêm hình vào `tools/doodle/gen.py`, rồi chạy `python3 tools/doodle/gen.py assets/img/doodles.js`.
- Test để ở scratchpad `T=/tmp/claude-0/-home-user-Bong-trang/f0b9bacd-7275-5409-af9c-c125f1d454fd/scratchpad/test`, không commit (giữ cấu trúc thư mục Mục 4).
- Mỗi commit kết thúc bằng hai dòng ghi công của phiên. Đẩy lên `claude/dazzling-wozniak-24772b`.
- Nâng `CACHE_VERSION` trong `service-worker.js` ở task cuối (`bongtrang-v1.3.0`), và sửa tên cache trong `$T/p6.js` cho khớp.

## Review Focus

1. **Thoát giữa ca** (Quay lại về bản đồ, hoặc tắt app rồi mở lại) → không cộng tiến độ, kho được khôi phục; `dayBackup` theo `run.key`. *Test ở Task 3.*
2. **Bản lưu cũ đang dở ngày** (`dayBackup` chưa xong) khi lên bản mới → khôi phục kho rồi xoá, không mất nguyên liệu. *Test ở Task 2.*
3. **Thử thách chơi vắt qua nửa đêm** → tính cho ngày lúc bắt đầu ca (`run.date`), không tính hai lần. Giờ máy lùi thì không mở lời nhắn mới. *Test ở Task 5.*
4. **Ca vô tận khi ví 0đ và kho cạn** → không treo. Khách chỉ gọi món còn làm được; không món nào làm được thì kết thúc ca. *Test ở Task 6.*
5. **Chơi lại mốc cũ và thắng** → không tăng `ms.index`, không mở lại kỷ niệm. Có thể nhận Tim vàng. Tiến độ cộng vào mốc hiện tại ×0.5. *Test ở Task 3.*

---

### Task 1: Dữ liệu mốc & lõi tiến độ (`BT.MS`)

**Files:**
- Modify: `config.js`: thêm `seasons`, `milestones`, `shiftEvents` (cạnh `days`).
- Create: `src/milestones.js`. Thêm `<script src="src/milestones.js">` ngay sau `src/save.js` trong `index.html`, và đưa vào danh sách cache của `service-worker.js`.
- Test: `$T/ms-core.js` (Node, mẫu như `$T/flirt-logic.js`: giả `window`, `localStorage`, rồi `require` personal, config, save, milestones).

**Interfaces — Produces:**

```
CONFIG.seasons = [{ id: 1, name: "Mùa 1 · Tiệm nhỏ đầu hẻm", majorDays: [1..15], minorPerMajor: 1 }]
CONFIG.milestones = { shiftsBase: 2, shiftsGrowth: 0.04, replayProgressRate: 0.5, carryMax: 0.5,
  unitsPass: 1, unitsThreeStar: 1.25, unitsFailMin: 0.25, unitsFailRatio: 0.6,
  afterLast: { customers: 1, targetMult: 1.08 }, minorCoinsBase: 40, minorCoinsPerLevel: 10 }
CONFIG.shiftEvents = { sunny:{w:3,fromLevel:1}, windy:{w:2,fromLevel:3}, payday:{w:1,fromLevel:5,tipMult:2},
  hot:{w:2,fromLevel:8,drinkWeight:2}, reviewer:{w:1,fromLevel:9,ratingWeight:3}, rain:{w:1,fromLevel:10,grillWeight:2},
  school:{w:1,fromLevel:12,groupOf:3}, festival:{w:1,fromLevel:13,tipMult:1.5} }

Milestone = { index:int(1..N), major:bool, day:int(major day k), level:int(k), cfg:object(dayCfg shape) }
Run = { mode:"story"|"replay"|"daily"|"endless"|"secret", key:string, ms:int, level:int, cfg:object,
        event:string, scripted:bool, date?:string }

BT.MS.list(): Milestone[]          // đã lưu đệm; thứ tự: lớn1, nhỏ1.1..1.m, lớn2, …
BT.MS.count(): int                 // 15 × (1 + minorPerMajor)
BT.MS.get(i:int): Milestone
BT.MS.majorIndex(k:int): int       // 1 + (k−1)(1+m)
BT.MS.need(i:int): number          // shiftsBase + shiftsGrowth × (i−1), làm tròn 2 số lẻ
BT.MS.units({passed, stars, income, target}): number
BT.MS.addProgress(u:number, {replay:bool}): { before:{index,progress}, after:{index,progress}, cleared:int|null }
BT.MS.pickEvent(level:int, prev:string|null, rnd=Math.random): string
BT.MS.shiftCfg(i:int, scripted:bool, event:string): object
BT.MS.run(i:int, {replay:bool}={}): Run   // scripted = major && !S.ms.firstDone[i] && !replay
BT.MS.current(): Milestone
BT.MS.goldHearts(): int            // số mốc lớn có ms.best[i].stars === 3
```

**Quy tắc sinh mốc nhỏ** (mốc nhỏ thứ j trong `1..m`, nằm sau mốc lớn k, với `t = j/(m+1)`):
- `customers = round(lerp(c_k, c_{k+1}, t))`
- `target = round5(lerp(...))`
- `spawn[0..1]` và `patienceMult`: lerp, làm tròn 2 số lẻ
- `unlock = []`, `level = k`
- Sau mốc 15 (không có ngày 16): `customers = c_15 + afterLast.customers × j`, `target = round5(t_15 × afterLast.targetMult^j)`, `spawn` và `patienceMult` giữ như ngày 15.

**`shiftCfg`:**
- `scripted` → bản sao `cfg` gốc của mốc.
- Không `scripted` → bản sao các trường số (`customers, target, spawn, patienceMult, unlock: []`), rồi đặt `weather = event`, `tipMult = 1`, và gộp các khóa riêng của `CONFIG.shiftEvents[event]` (trừ `w`, `fromLevel`). Không có `hints` / `note`.

**`pickEvent`:**
- Rút theo trọng số `w` trong các biến cố có `fromLevel ≤ level`.
- Loại `prev`, trừ khi chỉ còn đúng một biến cố.

**`addProgress`:**
- `replay` → nhân `u` với `replayProgressRate`.
- Cộng `u` vào `S.ms.progress`. Nếu `≥ need(index)` và `index` chưa phải mốc cuối đã xong: `cleared = index`, `cleared` trong state = `index`, `index++` (nếu chưa phải mốc cuối), `progress = min(carryMax, phần dư)`.
- Ở mốc cuối: `cleared = count`, `index` giữ nguyên, `progress = need(count)`.
- Mỗi lần gọi qua tối đa một mốc.

- [ ] **Step 1: Viết test `$T/ms-core.js`.** Các phép kiểm (dùng `eq` như flirt-logic):
  - `count()===30`
  - `get(1).major && get(1).day===1`
  - `get(2).major===false && get(2).level===1`
  - `get(2).cfg.customers===9` (lerp 8→9 tại 0.5 làm tròn: `Math.round(8.5)`=9)
  - `get(2).cfg.target===75`
  - `get(29).day===15`
  - `get(30).cfg.customers===19`
  - `get(30).cfg.target===780` (round5(720×1.08=777.6)=780)
  - `majorIndex(15)===29`
  - `need(1)===2`, `need(30)===3.16`
  - `units({passed:true,stars:2,income:100,target:60})===1`
  - `units({passed:true,stars:3,...})===1.25`
  - `units({passed:false,stars:0,income:0,target:60})===0.25`
  - `units({passed:false,stars:0,income:50,target:100})===0.3` (0.6×0.5)
  - Sau `Save.reset()`: `addProgress(1)` → index 1, progress 1. `addProgress(1.5)` → `cleared===1`, index 2, progress 0.5 (dư 0.5 ≤ carryMax).
  - `addProgress(1,{replay:true})` cộng 0.5.
  - Đặt `CONFIG.seasons[0].minorPerMajor=2` và xoá đệm (`BT.MS._reset()`) → `count()===45`; đặt lại 1.
  - `pickEvent(1,null)==='sunny'`; `pickEvent(13,'festival')!=='festival'` (lặp 50 lần).
  - `shiftCfg(1,true,'sunny').hints===true`
  - `shiftCfg(1,false,'payday').tipMult===2 && !('hints' in shiftCfg(1,false,'payday'))`

- [ ] **Step 2: Chạy `node $T/ms-core.js`.** Expected: FAIL (`BT.MS` không có).
- [ ] **Step 3: Viết `src/milestones.js` và cấu hình** theo Interfaces. `BT.MS._reset()` xoá đệm danh sách. Thêm vào `Save.defaults()`: `ms: { index: 1, progress: 0, cleared: 0, shifts: 0, best: {}, firstDone: {}, lastEvent: null }`.
- [ ] **Step 4: Chạy `node $T/ms-core.js`.** Expected: PASS.
- [ ] **Step 5: Commit** `feat: dữ liệu mốc và lõi tiến độ`.

### Task 2: Chuyển đổi bản lưu cũ

**Files:**
- Modify: `src/save.js` (`load`, `importCode`): gọi `BT.MS.migrate(state)` sau `merge`.
- Modify: `src/milestones.js`: thêm `migrate`.
- Test: `$T/ms-migrate.js` (Node).

**Interfaces — Produces:** `BT.MS.migrate(state):bool`. Trả `true` nếu có chuyển đổi. Nhận biết bản cũ: `state.version < 2`. Sau khi chuyển, đặt `state.version = 2`; `defaults().version` = 2.

**Quy tắc** (spec §4.8, với `d = unlockedDay`):
- `d ≤ 15` → `ms.index = majorIndex(d)`, `cleared = ms.index − 1`.
- `d ≥ 16` → `ms.index = count()`, `cleared = count() − 1`.
- `days[k].stars` → `ms.best[majorIndex(k)] = { stars, income: bestRevenue }`.
- `firstDone[majorIndex(k)] = true` với mọi `k < d`.
- `goldHearts = BT.MS.goldHearts()`.
- `regularNext = {}`.
- `dayBackup` chưa `finished` → khôi phục `inventory` và `wallet` từ bản sao lưu, rồi `dayBackup = null`.
- `ms.shifts = số ngày có record`.

- [ ] **Step 1: Viết test `$T/ms-migrate.js`.**
  - `{version:1, unlockedDay:7, days:{1:{stars:3,bestRevenue:80},2:{stars:2,bestRevenue:95}}}` → `ms.index===13`, `ms.cleared===12`, `ms.best[1].stars===3`, `ms.best[3].stars===2`, `goldHearts===1`, `version===2`.
  - `unlockedDay:16` → `ms.index===30`, `cleared===29`.
  - Có `dayBackup:{day:4, finished:false, inventory:{bt_soi:9}, wallet:120}` và `inventory:{bt_soi:2}`, `wallet:50` → sau chuyển: `inventory.bt_soi===9`, `wallet===120`, `dayBackup===null`.
  - Bản đã `version:2` → `migrate` trả `false`, không đổi gì.
  - `Save.load()` từ localStorage chứa bản cũ → `state.ms.index===13`.
- [ ] **Step 2: Chạy.** Expected: FAIL.
- [ ] **Step 3: Viết `migrate`.** Xem `snapshotDay` / `restoreDay` để dùng đúng tên trường của `dayBackup`. Gọi trong `load` và `importCode`.
- [ ] **Step 4: Chạy `ms-migrate.js` và `ms-core.js`.** Expected: PASS cả hai.
- [ ] **Step 5: Commit** `feat: chuyển bản lưu ngày sang mốc`.

### Task 3: Chơi ca theo mốc (Prep → Game → Result)

**Files:**
- Modify: `src/screens/PrepScreen.js`, `src/screens/GameScreen.js` (constructor, `planSpecials`, `finish`), `src/screens/ResultScreen.js`, `src/components/UI.js` (`UI.runTitle(run):string`), `config.js` (texts).
- Modify test cũ cho hợp đường mới: `$T/flirt-game.js` (`setup` dùng `BT.Router.go('Prep', { run: BT.MS.run(5) })`, mốc 5 = mốc lớn 3), `$T/bot.js`, `$T/run15b.js`, `$T/play.js`, `$T/p5.js`.
- Test: `$T/ms-flow.js` (Playwright, `file://`).

**Interfaces:**
- Consumes: `BT.MS.run`, `addProgress`, `units`, `get`, `count`, `goldHearts`.
- Produces:
  - Route params `{ run: Run }` cho `Prep`, `Game`.
  - Summary truyền sang `Result` gồm thêm `{ run, units, progress: { before, after, cleared }, need, minorReward: {coins, tale}|null }`.
  - `UI.runTitle(run)` trả về:
    - `"Mốc 13"` (story / replay),
    - `"Thử thách hôm nay"` (daily),
    - `"Ca vô tận"` (endless),
    - `"Ca bí mật"` (secret).
  - `BT.MS.secretRun(): Run` → `mode:"secret"`, `cfg = UI.dayCfg("secret")`, `level = maxPlayableDay+1`.

**Thay đổi chính:**
- **GameScreen constructor:** `this.run = params.run`, `this.dayId = run.key`, `this.dayNum = run.level`, `this.dayCfg = run.cfg`, `this.secret = run.mode==="secret"`.
- **Prep:**
  - `snapshotDay(run.key)` / `restoreDay` theo `run.key`.
  - Quà khai trương: thay điều kiện `freeStockDays.includes(day)` bằng `run.ms===1 && S.ms.shifts===0 && run.mode==="story"`.
  - Tiêu đề dùng `UI.runTitle`. Thẻ thông tin hiện biến cố (`CONFIG.weathers[run.event]`).
  - Nút "Mở ca" → `Game {run}`.
- **Khách quen:** so `S.ms.shifts >= (S.regularNext[id]||0)` thay cho `dayNum`; khi gán thì `S.regularNext[id] = S.ms.shifts + def.gap`.
- **`finish`** (story / replay):
  - Cập nhật `S.ms.best[run.ms]` (max sao, max thu).
  - `S.ms.shifts++`; `S.ms.firstDone[run.ms] = true`; `S.ms.lastEvent = run.event`.
  - `u = MS.units(...)`; `p = MS.addProgress(u, {replay: run.mode==="replay"})`.
  - `goldHearts = MS.goldHearts()`.
  - **Kỷ niệm:** mở khi `p.cleared` là mốc lớn k (chưa mở) → memory `k−1`.
  - **Mốc nhỏ vừa qua:** `S.wallet += minorCoinsBase + minorCoinsPerLevel × level`. `tale` = `PERSONAL.minorTales[S.talesSeen.length % len]`, rồi push index vào `S.talesSeen`.
  - **Đoạn kết:** `ending = p.cleared === count() && !S.endingSeen`.
  - Bỏ `unlockedDay`, bỏ `S.days`.
  - `secret` → 0 tiến độ.
- **Result:**
  - Thanh `.ms-bar` chạy từ `before.progress/need` tới `after.progress`.
  - Dòng `"+{u} ca"`.
  - Nếu `cleared`: bảng `"Qua {title}!"` kèm quà (tiền, chuyện vặt), và phong bì kỷ niệm như cũ.
  - Nút:
    - `"Ca tiếp"` → `Prep { run: MS.run(S.ms.index) }`.
    - `"Về bản đồ"`.
    - Khi `ending`: `"Bất ngờ"`.
  - Bỏ `"Làm lại ngày"`.
- **`personal.js`:** thêm `minorTales` (20 câu, khoá `{ who, text }`, `who` ∈ `chi_lan, chu_tu, be_na, shipper, ba_cu, hoc_sinh`). Giọng vui, dễ thương, hợp các NPC hiện có.

- [ ] **Step 1: Viết `$T/ms-flow.js`.**
  1. Bản mới → `Prep {run: MS.run(1)}` có quà khai trương. Chơi bằng bot (`$T/bot.js`) tới Result → `.ms-bar` hiện, `S.ms.progress>0`, `S.ms.shifts===1`.
  2. Đặt `S.ms.progress=1.9` rồi chơi một ca qua → Result có `"Qua Mốc 1"`, `S.ms.index===2`, `memoriesUnlocked` chứa 0.
  3. Mốc 2 (nhỏ) qua → `S.talesSeen.length===1`, ví tăng ≥50.
  4. **Review Focus 1:** vào Game, gọi `router.backTo('Map')` giữa ca → `S.ms.progress` không đổi, kho bằng lúc vào Prep.
  5. **Review Focus 5:** `S.ms.index=5`, chơi lại `MS.run(1,{replay:true})` thắng 3 sao → `S.ms.index===5`, `goldHearts` tăng, `memoriesUnlocked` không thêm phần tử mới, progress tăng đúng `u×0.5`.
  6. Đặt `S.ms.index=30, progress=3.1`, chơi một ca qua → nút `"Bất ngờ"` hiện.
  7. Không lỗi JS.
- [ ] **Step 2: Chạy.** Expected: FAIL.
- [ ] **Step 3: Sửa các màn** theo "Thay đổi chính". Sửa các test cũ cho đường `{run}`.
- [ ] **Step 4: Chạy** `ms-flow.js`, `ms-core.js`, `ms-migrate.js`, `flirt-game.js`, `flirt-book.js`, `play.js`. Expected: tất cả PASS / không lỗi.
- [ ] **Step 5: Commit** `feat: chơi ca theo mốc, thanh tiến độ, chuyện vặt`.

### Task 4: Bản đồ thành Đường mốc

**Files:**
- Modify: `src/screens/MapScreen.js`, `style.css`, `config.js` (texts).
- Test: `$T/ms-map.js` (Playwright, 360×640 và 390×844).

**Interfaces:** Consumes `BT.MS.*`, `UI.runTitle`. `BT.MapHelpers.dayInfo(cfg)` giữ nguyên chữ ký (Prep vẫn dùng).

**Hành vi** (spec §4.4):
- 30 nút `.map-node` từ dưới lên. Mốc lớn có class `major` (số 1–15); mốc nhỏ có class `minor`.
- Mốc hiện tại có class `current` và vòng tiến độ `--pct`.
- Thẻ dính trên cùng `.ms-card`: tên mốc, thanh `"x / y ca"`, món mới (nếu mốc lớn), nút `"Mở ca bán"` → `Prep {run: MS.run(index)}`.
- Mốc đã qua → modal thông tin, nút `"Chơi lại"` → `Prep {run: MS.run(i,{replay:true})}`.
- Mốc chưa tới → toast khoá.
- Nút Ca bí mật giữ nguyên, mở khi `endingSeen`, dẫn tới `MS.secretRun()`.

- [ ] **Step 1: Viết `$T/ms-map.js`.**
  - Có đúng 30 `.map-node` không kể nút bí mật, 15 `.major`.
  - `.current` đúng `S.ms.index`.
  - Bấm `.ms-card .btn` → tới `.prep`.
  - Bấm mốc đã qua → modal có nút `"Chơi lại"`.
  - Không tràn ngang (`scrollWidth ≤ innerWidth`).
  - Không có emoji thô trong `.map` (cách kiểm như `flirt-book.js`).
  - Chụp `ms-map-360.png`.
- [ ] **Step 2: Chạy.** Expected: FAIL.
- [ ] **Step 3: Viết lại MapScreen** và CSS.
- [ ] **Step 4: Chạy `ms-map.js`, rồi xem ảnh chụp.** Expected: PASS, bố cục gọn ở 360px.
- [ ] **Step 5: Commit** `feat: bản đồ đường mốc`.

### Task 5: Thử thách mỗi ngày & lời nhắn

**Files:**
- Modify: `src/milestones.js` (`BT.Daily`), `config.js` (`daily`, texts), `personal.js` (`dailyNotes`: 60 câu), `src/save.js` (defaults `daily`), `MenuScreen.js` (nút, chấm đỏ, modal lịch / chuỗi), `PrepScreen.js` / `GameScreen.js` (áp luật), `ResultScreen.js` (huy hiệu hạng, mở lời nhắn), `AlbumScreen.js` (thẻ "Sổ lời nhắn").
- Test: `$T/daily-core.js` (Node), `$T/daily-ui.js` (Playwright).

**Interfaces — Produces:**

```
CONFIG.daily = { fromMilestone: 5, tierRatios: [0.8, 1.2], tierCoins: [30, 60, 100], focusWeight: 3,
  rules: [ { id:"rush", label:"Khách vội", patienceMult:0.8 },
           { id:"regulars", label:"Toàn khách quen", friendMult:5 },
           { id:"hieu5", label:"Anh Hiếu ghé 5 lần", tomoVisits:5 },
           { id:"picky", label:"Tip gấp đôi nhưng khách khó tính", tipMult:2, patienceMult:0.85 },
           { id:"crowd", label:"Đông khách", extraCustomers:3 } ] }
S.daily = { lastDate:null, streak:0, played:{}, noteNext:0, notesSeen:[], best:{} }

BT.Daily.dateKey(d=new Date()): "YYYY-MM-DD"   // cùng định dạng Progress.today()
BT.Daily.unlocked(): bool                      // S.ms.index >= fromMilestone
BT.Daily.challenge(dateKey, level): { event, focus:recipeId, rule:ruleObj }   // tất định theo ngày
BT.Daily.run(dateKey=today): Run               // mode "daily", key "daily", date dateKey, ms = S.ms.index
BT.Daily.playedToday(dateKey=today): bool
BT.Daily.complete(dateKey, {income, target}): { first:bool, note:{index,text}|null, units:number,
                                               coins:number, tier:0|1|2, streak:int }
```

- **Hạt giống** = số `YYYYMMDD`, sinh số giả ngẫu nhiên mulberry32. `event` qua `MS.pickEvent(level, null, rng)`. `focus` rút từ các món có `openDay ≤ level`. `rule` rút trong `rules`.
- **`run.cfg`** = `MS.shiftCfg(S.ms.index, false, event)`, rồi:
  - `patienceMult *=`, `tipMult *=`, `customers +=` theo `rule`;
  - `cfg.focus = focus`, `cfg.focusWeight = focusWeight`;
  - `cfg.friendMult` và `cfg.tomoVisits` lấy từ `rule`.
- **GameScreen đọc thêm:**
  - `cfg.focus` / `focusWeight`: nhân trọng số món khi khách gọi.
  - `cfg.friendMult`: nhân `G.friendWeight`.
  - `cfg.tomoVisits`: số lượt anh Hiếu ghé mua, như nhánh `secret`.
- **`complete`:**
  - Ca đầu tiên trong ngày = `!played[dateKey] && (lastDate===null || dateKey > lastDate)`.
  - Lần đầu:
    - `played[dateKey]=true`;
    - streak = `lastDate === ngày trước dateKey ? streak+1 : 1`; `lastDate = dateKey`;
    - lời nhắn = `dailyNotes[noteNext % len]`; push vào `notesSeen`; `noteNext++`;
    - `units = 1`, cộng vào mốc qua `MS.addProgress(1)`;
    - `coins = tierCoins[tier]`, cộng vào ví.
  - Không phải lần đầu: chỉ cập nhật `best[dateKey]`; `units = 0`, `coins = 0`, `note = null`.
  - `tier`: tỉ lệ thu/mục tiêu `≥ 1.2` → 2, `≥ 0.8` → 1, còn lại → 0.
- **`finish`** ở mode daily: gọi `Daily.complete(run.date, ...)` thay cho `MS.units` / `addProgress`. Vẫn tăng `S.ms.shifts`. Không cập nhật `ms.best`.
- **Menu:** nút `"Thử thách hôm nay"`:
  - Khoá kèm ghi chú `"Mở ở Mốc 5"` khi chưa mở.
  - Có chấm đỏ khi chưa chơi hôm nay.
  - Bấm vào mở modal gồm: đề hôm nay (biến cố, món chủ đạo, luật), chuỗi 🔥, lịch tháng hiện tại (ngày đã chơi tô hồng), nút `"Chơi"` → `Prep {run: Daily.run()}`.
- **Album:** thẻ `"Sổ lời nhắn"` (giống thẻ Sổ thính) liệt kê các lời nhắn đã mở.
- **`dailyNotes`:** 60 câu, ấm áp, ý nghĩa, không sến, không dùng tên riêng ngoài `{her}` / `{me}`. Ví dụ giọng: "Hôm nay có mệt thì nghỉ chút cũng được, tiệm vẫn ở đây chờ."

- [ ] **Step 1: Viết `$T/daily-core.js`.**
  - `challenge('2026-11-21',5)` gọi hai lần ra giống nhau; khác ngày `'2026-11-22'` thì ít nhất một trường khác (kiểm 10 cặp ngày, ≥8 cặp khác).
  - `complete('2026-11-21',{income:100,target:100})`: `first===true`, `note.index===0`, `units===1`, `tier===1`, `coins===60`, `streak===1`.
  - Gọi lại cùng ngày → `first===false`, `note===null`.
  - `'2026-11-22'` → `streak===2`, `note.index===1`.
  - `'2026-11-24'` → `streak===1`.
  - **Review Focus 3:** `'2026-11-20'` sau khi đã có `'2026-11-24'` → `first===false`.
  - `noteNext` quay vòng khi vượt `dailyNotes.length`.
  - `unlocked()===false` khi `ms.index=4`, `true` khi 5.
- [ ] **Step 2: Viết `$T/daily-ui.js`.**
  - `ms.index=5` → Menu có nút Thử thách kèm chấm đỏ.
  - Mở modal: có lịch và chuỗi.
  - Chơi bằng bot → Result hiện lời nhắn và hạng.
  - Quay về Menu → hết chấm đỏ.
  - Album có `"Sổ lời nhắn"` với 1 câu.
  - **Review Focus 3:** đặt `run.date` của ca là `'2026-11-21'`, rồi giả đồng hồ sang ngày 22 trước khi kết thúc (`page.clock` hoặc ghi đè `Date`) → `played['2026-11-21']===true`, `played['2026-11-22']` không có.
- [ ] **Step 3: Chạy cả hai.** Expected: FAIL.
- [ ] **Step 4: Viết phần code và nội dung** theo Interfaces.
- [ ] **Step 5: Chạy** `daily-core.js`, `daily-ui.js`, `ms-flow.js`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: thử thách mỗi ngày và sổ lời nhắn`.

### Task 6: Ca vô tận

**Files:**
- Modify: `src/milestones.js` (`BT.Endless`), `config.js` (`endless`, texts), `src/save.js` (defaults `endless`), `GameScreen.js`, `ResultScreen.js`, `MenuScreen.js`.
- Test: `$T/endless-core.js` (Node), `$T/endless-ui.js` (Playwright).

**Interfaces — Produces:**

```
CONFIG.endless = { fromMilestone: 7, minSpawn: [1.8, 2.6], rampEvery: 5, rampFactor: 0.92, eventEvery: 15,
  unitsPer: 12, unitsMax: 2, flirtEvery: 12, tomoEvery: 20, rewards: { 50: 100, 100: 200, 200: 400 } }
S.endless = { best: 0, bestIncome: 0, rewards: {} }

BT.Endless.unlocked(): bool                   // S.ms.index >= fromMilestone
BT.Endless.spawnRange(served:int, base:[a,b]): [number, number]
     // base × rampFactor^floor(served/rampEvery), từng phần kẹp ≥ minSpawn
BT.Endless.units(served:int): number          // min(unitsMax, served / unitsPer), 2 số lẻ
BT.Endless.claim(served:int, income:number): { newBest:bool, coins:int, milestones:int[] }
BT.Endless.run(): Run                         // mode "endless", key "endless", cfg = MS.shiftCfg(S.ms.index,false,pickEvent)
```

**GameScreen ở mode `endless`:**
- `this.total = Infinity`. HUD khách hiện `"{d} khách"`.
- Khoảng cách khách đến lấy từ `Endless.spawnRange(this.stats.served, cfg.spawn)`.
- Cứ `eventEvery` khách: đổi `this.dayCfg.weather` và các khóa biến cố qua `MS.pickEvent`, cập nhật lớp `weather-*` và toast.
- Thả thính: một lượt mỗi `flirtEvery` khách phục vụ. Anh Hiếu ghé mua mỗi `tomoEvery` khách.
- Không có chương truyện khách quen; `planSpecials` bỏ phần regulars.
- Hết hàng (dòng ~1148): nếu `S.wallet ≥ price` thì tự nhập `buyPackQty`, trừ ví, rồi tiếp tục; nếu không thì toast như cũ.
- Khi khách gọi món: chỉ chọn món còn làm được (mọi nguyên liệu có tồn, hoặc ví đủ tiền nhập). Không còn món nào → `finish(false)`.
- Hết tim → `finish(true)`.
- **`finish`:** `Endless.claim`; `u = Endless.units(served)` → `MS.addProgress(u)`; `S.ms.shifts++`. Summary gồm `{ served, best, newBest, coins, milestones }`.
- **Result ở mode endless:** không có sao và mục tiêu; hiện số khách, doanh thu, kỷ lục và thưởng mốc kỷ lục, thanh `.ms-bar`. Nút `"Chơi lại"` → `Game {run: Endless.run()}` (không qua Prep), và `"Về menu"`.
- **Menu:** nút `"Ca vô tận"`, khoá kèm `"Mở ở Mốc 7"`, kỷ lục hiện dưới nút.

- [ ] **Step 1: Viết `$T/endless-core.js`.**
  - `spawnRange(0,[4,6])` → `[4,6]`.
  - `spawnRange(5,[4,6])` → `[3.68,5.52]`.
  - `spawnRange(500,[4,6])` → `[1.8,2.6]`.
  - `units(6)===0.5`, `units(40)===2`.
  - `claim(55,…)` → `coins===100`, `milestones=[50]`, `newBest===true`; gọi lại `claim(60)` → `coins===0`.
  - `claim(210)` → `coins===600` (100 và 200 mới, 50 đã nhận).
- [ ] **Step 2: Viết `$T/endless-ui.js`.**
  - `ms.index=7` → Menu có `"Ca vô tận"` → `.game` chạy.
  - Bot phục vụ ≥ 15 khách → lớp weather đã đổi ít nhất một lần.
  - Ép `hearts=0` → Result endless có kỷ lục.
  - **Review Focus 4:** `S.wallet=0`, mọi `inventory=0` → vào ca, sau 10 giây trang không lỗi JS và ca đã kết thúc tới Result.
- [ ] **Step 3: Chạy.** Expected: FAIL.
- [ ] **Step 4: Viết code.**
- [ ] **Step 5: Chạy** `endless-core.js`, `endless-ui.js`, `ms-flow.js`, `flirt-game.js`. Expected: PASS.
- [ ] **Step 6: Commit** `feat: ca vô tận`.

### Task 7: Dọn chỗ dùng "ngày", Album chuyện vặt, tài liệu, kiểm thử toàn bộ

**Files:**
- Modify: `src/save.js` (quests `fromDay` so với `BT.MS.current().level`), `ReviewScreen.js` (`"Mốc N"`: `addReview` lưu `ms` thay cho `day`), `AlbumScreen.js` (thẻ `"Chuyện vặt"`), `config.js` (texts: `dayN` → mốc; `"Ngày bí mật"` → `"Ca bí mật"`; tooltip quest `"days"` → `"Bán {n} ca"`), `README.md` (mục mới "12. Mốc, Thử thách & Ca vô tận": cách sửa `dailyNotes`, `minorTales`, `minorPerMajor`, `shiftsBase`), `service-worker.js` (`bongtrang-v1.3.0`), `$T/p6.js` (tên cache).
- Test: `$T/ms-bot.js` (Playwright): bot chơi liên tục từ mốc 1 tới hết mùa, với `CONFIG` tăng tốc như `run15b.js`.

- [ ] **Step 1: Viết `$T/ms-bot.js`.**
  - Bot chơi `"Ca tiếp"` lặp lại cho tới khi gặp nút `"Bất ngờ"`, tối đa 200 ca.
  - Ghi số ca mỗi mốc.
  - Kiểm: tới được mốc 30 và đoạn kết; không mốc nào cần > 12 ca; không lỗi JS ngoài `ERR_FILE_NOT_FOUND` của ảnh kỷ niệm chưa có.
- [ ] **Step 2: `grep -rn "unlockedDay\|S.days\b\|\.days\[" src`** → chỉ còn trong `milestones.js` (`migrate`). Sửa các chỗ còn lại.
- [ ] **Step 3: Album "Chuyện vặt"**, chữ giao diện, README, cache.
- [ ] **Step 4: Chạy toàn bộ:** `ms-core`, `ms-migrate`, `ms-flow`, `ms-map`, `daily-core`, `daily-ui`, `endless-core`, `endless-ui`, `ms-bot`, `flirt-logic`, `flirt-data`, `flirt-game`, `flirt-book`, `fullscreen`, `fullbleed`, `play`, `p5`, `p6`. Expected: tất cả PASS / không lỗi.
- [ ] **Step 5: Commit** `feat: hoàn tất mốc — dọn ngày, album chuyện vặt, tài liệu`. Đẩy lên nhánh.
