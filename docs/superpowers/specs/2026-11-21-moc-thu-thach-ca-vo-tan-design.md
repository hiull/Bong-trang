# Mốc, Thử thách mỗi ngày & Ca vô tận — Thiết kế

Ngày: 2026-11-21 · Trạng thái: chờ duyệt

Các chỗ Claude tự quyết (người tặng xem lại): mở Thử thách ở Mốc 5, Ca vô tận ở Mốc 7; tiến độ mỗi ca (bảng 4.2); chơi lại mốc cũ ×0.5; Ca vô tận không qua màn Chuẩn bị; không thưởng theo chuỗi ngày; chuyện vặt khi qua mốc nhỏ.

## 1. Ý định & lý do

Người tặng game lo game quá ngắn: 15 ngày chơi xong là hết, sau đó không còn lý do mở lại. Mục tiêu là để Bống chơi lâu hơn và có lý do mở game mỗi ngày, mà **không thấy phải cày**.

Ba thay đổi, làm cùng một đợt:

1. **Mốc thay cho ngày.** Bống không "qua Ngày 3" nữa mà chơi nhiều **ca** để đầy thanh tiến độ của mốc hiện tại. Mùa 1 có **30 mốc**: 15 mốc lớn (chính là 15 ngày hiện có) xen kẽ 15 mốc nhỏ.
2. **Thử thách mỗi ngày.** Mỗi ngày thật có một đề ca riêng. Chơi lần đầu trong ngày thì mở **một lời nhắn** của người tặng.
3. **Ca vô tận.** Khách đến mãi, nhanh dần, có 3 tim. Đua kỷ lục.

Cả ba chế độ đều cộng tiến độ vào mốc. Chán chế độ này thì chơi chế độ khác, mốc vẫn tăng.

Đã chốt với người tặng:
- Mỗi mốc cần khoảng 2–3 ca.
- Mỗi ngày Bống chơi khoảng 15 phút, nên Mùa 1 kéo dài khoảng 3–4 tuần.
- Mặc định 1 mốc nhỏ giữa hai mốc lớn, chỉnh bằng một con số.
- Lời nhắn mỗi ngày: Claude viết nháp khoảng 60 câu, "ý nghĩa nhưng không sến", người tặng sửa.
- Sau này sẽ có nhiều mùa, mùa nào cũng theo khuôn mốc này.

## 2. Mục tiêu / Không làm / Điều cấm

**Mục tiêu**
- Mùa 1 dài gấp 2–3 lần hiện tại mà người tặng không phải chuẩn bị thêm ảnh hay truyện.
- Ca nào cũng có tiến độ. Chơi dở thì tăng ít, nhưng không bao giờ mất trắng.
- Hai ca trong cùng một mốc phải có cảm giác khác nhau.
- Cấu trúc dữ liệu sẵn sàng cho Mùa 2+ (thêm mùa chủ yếu là thêm dữ liệu).
- Tiến trình đã lưu được chuyển đổi, không mất gì.

**Không làm trong đợt này**
- Nội dung Mùa 2: quầy mới, truyện mới, kỷ niệm mới.
- Bảng xếp hạng trực tuyến, máy chủ, đăng nhập.
- Màn chọn mùa (mới có một mùa; chỉ chuẩn bị dữ liệu).

**Điều cấm (ngoài Mục 0 và Mục 24 của đặc tả gốc)**
- Không có cơ chế làm Bống mất tiến độ, phạt khi nghỉ chơi, hay mất chuỗi kèm thông báo gây áp lực.
- Không bắt chơi lại đúng một ca giống hệt để đủ mốc.
- Mọi con số cân bằng nằm trong `config.js`, mọi lời nhắn nằm trong `personal.js`, mọi chữ hiển thị là tiếng Việt có dấu.

## 3. Các cách đã cân nhắc

| Cách | Mô tả | Đánh đổi |
|---|---|---|
| **A. Dùng lại cấu hình ngày làm mốc** *(đã chọn)* | Mỗi khối trong `CONFIG.days` là một mốc lớn. Mốc nhỏ sinh ra bằng cách nội suy giữa hai mốc lớn liền kề. GameScreen chạy ca theo cấu hình mốc, cộng thêm một biến cố ngẫu nhiên. | Giữ nguyên cân bằng đã chỉnh, ít rủi ro, sửa vừa phải. |
| B. Bộ máy tự sinh ca | Độ khó tính bằng công thức, món rút từ kho chung. | Linh hoạt, nhưng phải viết lại lõi và chỉnh cân bằng lại từ đầu. |
| C. Giữ ngày, mốc chỉ để qua mùa | Mùa 1 vẫn qua ngày như cũ. | Làm nhanh, nhưng không đúng ý người tặng. |

Người tặng giao phần cách làm cho Claude. Claude chọn A, và người tặng đồng ý.

## 4. Thiết kế

### 4.1 Dữ liệu mùa và mốc (`config.js`)

```js
seasons: [
  { id: 1, name: "Mùa 1 · Tiệm nhỏ đầu hẻm", majorDays: [1, 2, ..., 15], minorPerMajor: 1 }
],
milestones: {
  shiftsBase: 2,          // số "ca chuẩn" cần cho mốc đầu
  shiftsGrowth: 0.04,     // mỗi mốc sau cần thêm (2 → ~3.2 ở mốc 30)
  minorStep: 0.5,         // mốc nhỏ: độ khó nằm giữa mốc lớn trước và sau (0..1)
  replayProgressRate: 0.5,// chơi lại mốc cũ: tiến độ cho mốc hiện tại ×0.5
  minorRewardCoins: [40, 60, 80, ...] // hoặc công thức, xem 4.5
}
```

- Danh sách mốc được **sinh lúc chạy**, theo thứ tự: lớn 1, nhỏ 1, lớn 2, nhỏ 2, …, lớn 15, nhỏ 15. Tổng `15 × (1 + minorPerMajor)` = 30.
- **Mốc lớn k** dùng đúng `CONFIG.days[k]`: món mở khóa, thời tiết kịch bản, hướng dẫn, ghi chú.
- **Mốc nhỏ sau mốc lớn k** có cấp món bằng k (cùng món như mốc lớn k, không mở món mới). Các thông số `customers`, `target`, `spawn`, `patienceMult` được nội suy giữa ngày k và k+1 theo `minorStep`. Riêng sau mốc 15 thì ngoại suy nhẹ (khách +1, mục tiêu +8%).
- Mỗi mốc có `level`, là số dùng để so với `openDay` / `fromDay` ở mọi nơi. Như vậy toàn bộ logic mở món, khách, anh Hiếu, thả thính, nhiệm vụ… giữ nguyên, chỉ đổi nguồn `dayNum` thành `level` của mốc.
- `minorPerMajor` đặt 2 thì thành 45 mốc. Code không giả định con số 30.

### 4.2 Tiến độ ca

Mỗi ca kết thúc sẽ ra **đơn vị tiến độ `u`**, cộng vào mốc hiện tại.

| Kết quả ca | u |
|---|---|
| Đạt mục tiêu, không mất tim (= "qua ca") | 1.0 |
| Qua ca và đạt 3 sao | 1.25 |
| Không qua ca | `max(0.25, 0.6 × thu / mục tiêu)` |
| Bỏ giữa chừng (thoát ra) | 0 (giữ như hiện tại: khôi phục kho) |

- Mốc i cần `need(i) = shiftsBase + shiftsGrowth × (i − 1)` đơn vị. Thanh tiến độ hiện `%` và số ca ước còn lại.
- **Đầy thanh thì qua mốc.** Phần dư chuyển sang mốc kế, tối đa 0.5 đơn vị để không nhảy liền hai mốc.
- **Van an toàn:** không ca nào cho dưới 0.25, nên mốc nào cũng đạt được sau tối đa khoảng 12 ca, kể cả khi chơi rất dở. Nếu chơi bình thường thì 2–3 ca.
- **Chơi lại mốc cũ** (từ bản đồ):
  - Được, để săn sao hoặc Tim vàng.
  - Tiến độ cộng vào mốc hiện tại, nhân `replayProgressRate` = 0.5.

### 4.3 Biến cố ngẫu nhiên mỗi ca

Mục đích là để các ca trong cùng một mốc khác nhau.

- **Ca đầu tiên của mỗi mốc lớn** chạy đúng kịch bản của ngày đó: thời tiết, hướng dẫn, ghi chú như cũ.
- **Các ca còn lại** (và mọi ca của mốc nhỏ) tự rút một biến cố từ `CONFIG.shiftEvents`:
  - Bộ biến cố tận dụng các thời tiết sẵn có: `sunny, windy, hot, payday, reviewer, rain, school, festival`.
  - Mỗi biến cố có `fromLevel` riêng (vd. `school` từ cấp 12) và trọng số.
  - Không lặp lại biến cố của ca ngay trước.
- Biến cố chỉ đổi các thông số thời tiết đã có (`weather`, `tipMult`, `drinkWeight`, `ratingWeight`, `grillWeight`, `groupOf`). Không có luật mới.
- Không đổi số khách hay mục tiêu của mốc, trừ khi chính biến cố đó vốn đã như vậy (vd. `festival` tip ×1.5).

### 4.4 Màn hình

**Bản đồ (`MapScreen`) → "Đường mốc"**
- 30 nút từ dưới lên:
  - Mốc lớn là nút to, có số 1–15 và biểu tượng thời tiết kịch bản.
  - Mốc nhỏ là nút tròn nhỏ ở giữa, không có số lớn.
- Mốc hiện tại có vòng tiến độ quanh nút.
- Đầu màn có thẻ **"Mốc hiện tại"** gồm:
  - tên mốc,
  - thanh tiến độ, ví dụ "1,4 / 2,3 ca",
  - món mới (nếu là mốc lớn),
  - nút **"Mở ca bán"** (dẫn tới Prep như cũ).
- Mốc đã qua: bấm để xem thông tin và **"Chơi lại"**. Mốc lớn hiện sao tốt nhất ★★★.
- Mốc chưa tới: khóa 🔒.
- Nút Ca bí mật giữ nguyên, mở khi đã xem đoạn kết.

**Chuẩn bị (`PrepScreen`)**
- Giữ nguyên.
- Tiêu đề đổi thành "Chuẩn bị · Mốc N" (hoặc "Thử thách hôm nay" / "Ca vô tận").
- Thẻ thông tin hiện biến cố của ca này.
- Quà khai trương (15 phần miễn phí) chỉ ở ca đầu tiên của mốc 1.

**Kết quả (`ResultScreen`)**
- Giữ bảng tổng kết.
- Thêm **thanh tiến độ mốc chạy lên**: "+0,8 ca".
- Đầy thanh thì có pháo hoa và bảng **"Qua Mốc N!"** kèm phần thưởng (4.5).
- Nút:
  - **"Ca tiếp"**: về Prep của mốc hiện tại.
  - **"Về bản đồ"**.
  - Bỏ nút "Làm lại ngày" (thay bằng "Ca tiếp").
- Qua mốc cuối (30) thì nút **"Bất ngờ"** dẫn tới đoạn kết như cũ.

**Menu**
- Thêm hai nút:
  - **"Thử thách hôm nay"**, có chấm đỏ khi hôm nay chưa chơi.
  - **"Ca vô tận"**.
- Cả hai bị khóa cho tới mốc mở (4.6, 4.7) và có ghi chú "Mở ở Mốc N".

### 4.5 Phần thưởng khi qua mốc

- **Mốc lớn k:**
  - Mở kỷ niệm k trong Album (như qua ngày k hiện nay).
  - Mở món của mốc lớn k+1 khi bước vào mốc đó.
- **Mốc nhỏ:**
  - Tiền thưởng `40 + 10 × level` (k).
  - Một **"chuyện vặt"**: một câu thoại ngắn hài hước hoặc dễ thương của khách quen, rút từ `PERSONAL.minorTales`. Claude viết nháp khoảng 20 câu theo giọng các NPC hiện có. Câu đã xem được ghi vào Album, mục "Chuyện vặt".
- **Tim vàng:** mỗi mốc lớn có 1 Tim vàng, nhận khi có ít nhất một ca của mốc đó đạt 3 sao. Tổng 15 Tim, Lời nhắn bí mật mở khi đủ 15 như cũ.
- Truyện khách quen vẫn chạy theo `level` và số ca, như hiện nay chạy theo ngày (`regularNext` tính theo **số ca đã chơi** thay vì số ngày).

### 4.6 Thử thách mỗi ngày

- **Mở từ Mốc 5** (`daily.fromMilestone`).
- **Đề** sinh từ hạt giống là ngày theo giờ máy (YYYYMMDD), nên cùng ngày luôn ra cùng đề. Đề gồm:
  - một biến cố (4.3),
  - một **món chủ đạo** (khách gọi món này ×3 trọng số),
  - một **luật vui** rút từ danh sách nhỏ: "khách vội" (kiên nhẫn ×0.8), "toàn khách quen", "anh Hiếu ghé 5 lần", "tip gấp đôi nhưng khách khó tính", "đông khách" (+3 khách).
- **Cấp món, số khách, mục tiêu** lấy theo mốc hiện tại (rồi áp luật vui), nên đề luôn hợp sức. Có màn Chuẩn bị như ca thường.
- **Lần chơi đầu trong ngày:**
  - Mở **lời nhắn kế tiếp** trong `PERSONAL.dailyNotes`. Theo thứ tự, không phụ thuộc ngày, nên không bỏ sót câu nào.
  - Cộng **1.0 đơn vị** tiến độ mốc (bất kể kết quả).
  - Thưởng tiền theo mức điểm: đồng / bạc / vàng = 30 / 60 / 100k, dựa trên tỉ lệ thu/mục tiêu.
  - Chơi lại trong ngày chỉ để nâng kỷ lục, không thưởng thêm.
- **Hết danh sách lời nhắn** thì quay lại từ đầu, ghi chú nhỏ "đọc lại".
- **Chuỗi ngày 🔥:**
  - Hiện số ngày chơi liên tiếp, và **lịch tháng** tô màu ngày đã chơi.
  - Lỡ một ngày thì chuỗi về 0 mà **không có thông báo trách móc**.
  - Không thưởng theo chuỗi (tránh áp lực).
- **Sổ lời nhắn** trong Album: xem lại các lời nhắn đã mở.
- Giờ máy bị chỉnh lùi thì không tính chơi lần đầu cho ngày đã chơi.

### 4.7 Ca vô tận

- **Mở từ Mốc 7** (`endless.fromMilestone`), sau khi đã có bếp nướng.
- **Món:** mọi món đã mở theo `level` hiện tại.
- **Luật:**
  - Không có mục tiêu tiền. 3 tim; mỗi khách bỏ đi mất 1 tim; hết tim thì xong ca.
  - Khoảng cách khách đến giảm dần, từ `spawn` của mốc hiện tại xuống sàn `endless.minSpawn` (vd. [1.8, 2.6] giây), giảm sau mỗi `endless.rampEvery` khách.
  - Biến cố đổi mỗi 15 khách.
  - Anh Hiếu và thả thính vẫn ghé theo nhịp ca thường.
- **Không cần Prep:**
  - Nguyên liệu dùng từ kho, hết thì tự nhập với giá thường, trừ ví.
  - Ví không đủ thì ca vẫn chạy tiếp; món thiếu nguyên liệu bị loại khỏi danh sách khách gọi.
  - Ruling: tránh màn Chuẩn bị cho một chế độ không có điểm dừng.
- **Kết quả:**
  - Số khách phục vụ, doanh thu, kỷ lục cũ / mới.
  - Tiến độ mốc `u = min(2, khách / 12)`.
  - Mốc kỷ lục 50 / 100 / 200 khách: thưởng một lần 100 / 200 / 400k.

### 4.8 Lưu trữ & chuyển đổi

Thêm vào `Save.defaults`:

```js
season: 1,
ms: { index: 1, progress: 0, cleared: 0, shifts: 0, best: {} },   // best[msIndex] = { stars, income }
daily: { lastDate: null, streak: 0, played: {}, noteNext: 0, notesSeen: [], best: {} },
endless: { best: 0, bestIncome: 0, rewards: {} },
talesSeen: []
```

**Chuyển đổi một lần**, khi `ms` không có trong bản lưu cũ:
- `unlockedDay = d` (1..16) → `ms.index = 2d − 1` (đang ở mốc lớn d), `progress = 0`.
- `days[k].stars` → `ms.best[2k−1].stars`.
- `goldHearts` giữ nguyên ý nghĩa.
- `memoriesUnlocked`, `endingSeen`, ví, đồ đã mua, khách quen: giữ nguyên.
- `unlockedDay ≥ 16` (đã qua cả 15 ngày) → `ms.index = 30`, `cleared = 29`: còn đúng mốc nhỏ cuối, tức vài ca để "đóng" mùa. Đoạn kết đã xem thì không chiếu lại.
- `regularNext` cũ tính theo ngày → đặt về 0 để truyện tiếp tục ở ca kế.
- `dayBackup` đang dở (thoát giữa ca) → khôi phục kho rồi xoá, như khi bỏ ca.

Mã sao lưu TIEM1- mang theo các khóa mới. Mã cũ được chuyển đổi khi nhập.

### 4.9 Nhiệm vụ & các chỗ dùng "ngày"

- Mọi chỗ đang đọc `unlockedDay` / `dayNum` / `fromDay` / `openDay` (quests, Station, GameScreen, Prep, Map) đổi sang `level` của mốc hiện tại, hoặc của mốc đang chơi lại.
- Chữ "Ngày N" trên giao diện đổi thành "Mốc N". Riêng "Ngày bí mật" đổi thành **"Ca bí mật"**.
- Tóm tắt khách đánh giá (`ReviewScreen`) đổi "Ngày N" thành "Mốc N".

## 5. Nội dung Claude viết nháp (người tặng sửa)

- `PERSONAL.dailyNotes`: 60 lời nhắn, ý nghĩa, ấm áp, không sến. Ví dụ giọng: "Hôm nay có mệt thì nghỉ chút cũng được, tiệm vẫn ở đây chờ."
- `PERSONAL.minorTales`: khoảng 20 chuyện vặt của chị Lan, chú Tư, bé Na, anh shipper, bà cụ…
- Chữ giao diện mới trong `CONFIG.texts`.

## 6. Để lại cho người làm

- Hình vẽ doodle cho nút mốc nhỏ, lịch tháng, biểu tượng 🔥 (theo bộ doodle hiện có).
- Bố cục chi tiết thẻ "Mốc hiện tại" và lịch tháng ở màn 360px.
- Cách hiển thị số thập phân trong thanh tiến độ (gợi ý: phần trăm + "còn khoảng N ca").

## 7. Kiểm thử (tối thiểu)

- Sinh mốc: 15 lớn + 15 nhỏ đúng thứ tự; nội suy đúng; `minorPerMajor = 2` ra 45.
- Tiến độ: qua ca +1; 3 sao +1.25; thua ≥ 0.25; chuyển phần dư ≤ 0.5; chơi lại ×0.5.
- Chuyển đổi bản lưu: Ngày 7 → Mốc 13; đã phá đảo → Mốc 30; sao và tim giữ nguyên.
- Thử thách: cùng ngày cùng đề; lần đầu mở lời nhắn kế và +1 đơn vị; lần sau không; lùi giờ không gian lận được; chuỗi tăng và về 0.
- Vô tận: tốc độ khách giảm dần tới sàn; 3 tim; kỷ lục lưu; thưởng mốc kỷ lục chỉ một lần.
- Chơi bằng bot đủ 30 mốc không kẹt; đoạn kết hiện khi qua mốc 30.
- Màn 360×640 và 390×844: không tràn, không còn emoji thô (doodle).
