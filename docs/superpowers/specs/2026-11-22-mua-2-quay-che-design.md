# Mùa 2 · Quầy Chè & Sữa chua — Thiết kế

Ngày: 2026-11-22 · Trạng thái: đã duyệt (2026-11-22)

## 1. Ý định

Mùa 1 (30 mốc) đã xong khung. Mùa 2 làm cho Bống có lý do chơi tiếp sau đoạn kết. Theo ý người tặng, đây là **mở rộng kinh doanh**: tiệm thêm quầy chè & sữa chua, món cũ vẫn bán. **Anh Hiếu vào phụ tiệm** để 5 quầy không quá tải. Tiệm cũng có thêm vài nhân vật không phải khách mua.

Đã chốt với người tặng:
- **Cách xây:** quầy chè là khu thứ 5, mùa mới nối tiếp mùa cũ (cách 1).
- **Không có ảnh kỷ niệm Mùa 2.** Mốc lớn mở **chương truyện khách quen + thẻ công thức**. Album Mùa 2 có sẵn chỗ cho kỷ niệm, khi nào người tặng thêm ảnh vào `personal.js` thì tự hiện, không bao giờ để ô trống.
- **Đoạn kết Mùa 2:** Claude viết nháp một lá thư, người tặng sửa.
- **Người phụ là anh Hiếu** (chính người tặng), giúp mức "vừa vừa": mỗi ca phụ một việc, Bống vẫn làm món chính. Không thuê nhân viên khác.
- **Giữ sự kiện** Bác chủ nhà và Xe chè đối thủ.

## 2. Mục tiêu / Không làm / Điều cấm

**Mục tiêu**
- 30 mốc Mùa 2 (cấp 16–30). Thời lượng tương đương Mùa 1, khoảng 3–4 tuần.
- Cách chơi mới thật sự: **xếp lớp đúng thứ tự**.
- Anh Hiếu phụ tiệm, với 3 cấp độ ăn ý và 3 chương "Sau giờ đóng cửa".
- Khung mùa chạy được Mùa 3+ chỉ bằng thêm dữ liệu.

**Không làm**
- Mùa 3, quầy cá viên chiên.
- Tách mỗi quầy thành mô-đun riêng (cách 3), để khi Mùa 3 cần mới làm.
- Ảnh kỷ niệm Mùa 2.

**Điều cấm** (ngoài Mục 0 và Mục 24 của đặc tả gốc)
- Không làm hỏng hay đổi cân bằng Mùa 1.
- Anh Hiếu không được tự chơi thay Bống.
- Không có ô trống "chờ ảnh".
- Không phạt khi cho anh Hiếu nghỉ.

## 3. Các cách đã cân nhắc

| Cách | Đánh đổi | |
|---|---|---|
| **1. Quầy chè là khu thứ 5, mùa nối tiếp** | Đúng ý mở rộng. Dùng lại khối xử lý khay. Thanh quầy chật hơn | **Đã chọn** |
| 2. Tiệm chè riêng | Bỏ món cũ, đơn điệu | |
| 3. Tách mô-đun quầy trước | Sạch hơn nhưng rủi ro hỏng Mùa 1 | |

## 4. Thiết kế

### 4.1 Nhiều mùa

- **Dữ liệu mùa** (`CONFIG.seasons`), mỗi mùa gồm `{ id, name, majorDays, minorPerMajor }`. Mùa 2 có `majorDays: [16..30]`, `minorPerMajor: 1` → 30 mốc.
- **`CONFIG.days`** thêm ngày 16–30. Bảng 4.3 là mốc lớn, mốc nhỏ nội suy như Mùa 1.
- **Lưu trữ** (version 3):
  - `S.season`: mùa đang chơi.
  - `S.ms`: tiến độ của mùa đang chơi.
  - `S.msBySeason[id]`: kho tiến độ mỗi mùa, dùng cho bản đồ và chơi lại.
  - Chuyển đổi: bản v2 thành `season: 1`, `msBySeason[1] = ms`.
- **`BT.MS`** đọc mùa hiện tại:
  - `list()`, `count()`, `majorIndex()` theo mùa.
  - Thêm `season()` và `seasonCount()`.
  - Chỉ số mốc (`ms.index`) đánh lại từ 1 mỗi mùa. Tiêu đề hiện "Mùa 2 · Mốc 5".
- **Chuyển mùa:**
  - Qua mốc cuối Mùa 1 thì xem đoạn kết như cũ. Sau đoạn kết, Menu hiện thẻ **"Mùa 2 mở rồi!"**. Bấm vào thì `S.season = 2`, mốc 1 Mùa 2, kèm màn giới thiệu ngắn (thư của anh Hiếu, Claude viết nháp).
  - Người chơi đang ở mốc 30 Mùa 1 mà chưa xem đoạn kết thì vẫn phải qua mốc 30 như cũ.
- **Bản đồ:**
  - Có thanh chọn mùa ở trên ("Mùa 1 · Mùa 2").
  - Mùa đã qua: chơi lại mốc nào cũng được, tiến độ cộng ×0.5 vào mốc hiện tại của **mùa đang chơi**.
  - Mùa chưa mở: khoá.
- **Thử thách và Ca vô tận:** dùng cấp mốc hiện tại của mùa đang chơi (đã như vậy, chỉ đổi nguồn).
- **Ca bí mật:** giữ như cũ, thuộc Mùa 1.

### 4.2 Quầy Chè & Sữa chua: xếp lớp

- **Khu mới** `che` ("Chè", icon 🍧), `openDay: 16`, đồ chứa "Cốc chè". `CONFIG.build.playableZones` thêm `che`.
- **Đế:** `coc_che` (cốc). Phải chọn cốc trước, như ly ở quầy nước.
- **Lớp:** chạm nguyên liệu theo thứ tự. Khay lưu **mảng `layers`** đúng thứ tự chạm, không gộp số lượng. Cốc vẽ các dải màu chồng lên nhau, lớp trước nằm dưới.
- **Lớp phủ** (`finish`), chỉ thêm sau khi đã có ít nhất một lớp: `da` (đá bào) và `dua_nao` (dừa nạo rắc). Thứ tự giữa các lớp phủ không quan trọng.
- **Chấm khi giao:**
  - `layers` phải **trùng khít** thứ tự trong công thức.
  - Lớp phủ phải đủ và không thừa.
  - Sai thứ tự thì báo **"Sai thứ tự lớp: {ing}"**, khách không nhận. Bống đổ bỏ bằng thùng rác như các khay khác.
- **Yêu cầu riêng:** dùng lại cơ chế cũ.
  - `remove`: bỏ lớp đó khỏi thứ tự.
  - `double`: lớp đó xuất hiện hai lần liền nhau.
  - `spicy`, `crispy`: không áp dụng cho chè.
- **Hướng dẫn tương tác:** có ở mốc lớn 16 (ca kịch bản đầu), kiểu như hướng dẫn Ngày 1, 2, 4, 7.
- **Sổ công thức:** món chè hiện thứ tự lớp bằng các ô đánh số.
- **Thanh quầy 5 nút:** ở màn hẹp (dưới 400px) nút chỉ còn biểu tượng, chữ nhỏ bên dưới. Kiểm tra ở 360×640 không tràn.

**Nguyên liệu mới** (giá nhập 5 phần, k). Các nguyên liệu Mùa 1 dùng được cho chè thì thêm khu `che` vào danh sách `zones`.

| id | Tên | Mở | Giá |
|---|---|---|---|
| coc_che | Cốc chè | 16 | 2 |
| dau_xanh | Đậu xanh | 16 | 5 |
| sua_chua | Sữa chua | 16 | 8 |
| nuoc_cot_dua | Nước cốt dừa | 16 | 6 |
| da | Đá bào *(có sẵn, thêm khu che)* | 16 | — |
| dau_do | Đậu đỏ | 17 | 5 |
| suong_sao | Sương sáo | 18 | 5 |
| mit | Mít | 19 | 10 |
| thach | Thạch rau câu | 20 | 6 |
| nep_cam | Nếp cẩm | 21 | 7 |
| tran_chau | Trân châu *(có sẵn, thêm khu che)* | 22 | — |
| dua_nao | Dừa nạo | 24 | 6 |

**Món chè** (giá bán k; thứ tự lớp → lớp phủ):

| Mốc lớn | Món | Lớp (dưới → trên) | Phủ | Giá |
|---|---|---|---|---|
| 16 | Chè đậu xanh | đậu xanh → nước cốt dừa | đá | 15 |
| 16 | Sữa chua đá | sữa chua | đá | 12 |
| 17 | Chè đậu đỏ | đậu đỏ → nước cốt dừa | đá | 15 |
| 18 | Chè sương sáo | sương sáo → nước cốt dừa | đá | 15 |
| 19 | Sữa chua mít | mít → sữa chua | đá | 20 |
| 20 | Chè thập cẩm | đậu xanh → đậu đỏ → thạch → nước cốt dừa | đá | 25 |
| 21 | Sữa chua nếp cẩm | nếp cẩm → sữa chua | đá | 22 |
| 22 | Chè Thái | mít → thạch → trân châu → nước cốt dừa | đá | 28 |
| 23 | Sữa chua trân châu | trân châu → sữa chua | đá | 20 |
| 24 | Chè dừa non | thạch → nước cốt dừa | dừa nạo, đá | 22 |
| 25 | Chè ba màu | đậu đỏ → đậu xanh → thạch → nước cốt dừa | đá | 25 |
| 26 | Sữa chua dừa | sữa chua → nước cốt dừa | dừa nạo | 22 |
| 27 | Combo Mùa Hè | Chè Thái + Trà tắc (combo như Combo Tình Yêu) | — | 40 |
| 28 | Chè đặc biệt | đậu xanh → nếp cẩm → mít → thạch → trân châu → nước cốt dừa | dừa nạo, đá | 38 |
| 30 | Ly Chè Hẹn Hò | sữa chua → mít → trân châu → nước cốt dừa | dừa nạo | 45 |

Mốc 29 không có món mới, chỉ có biến cố (lễ hội).

### 4.3 Mốc lớn Mùa 2 (bảng `CONFIG.days` 16–30)

- **Khách:** 18 → 24 khách, tăng chừng +1 sau mỗi 2–3 mốc lớn.
- **Mục tiêu:** 760 → 1500k, tăng đều.
- **Nhịp khách đến:** `spawn` từ [3, 4] giảm dần tới [2.6, 3.4].
- **Kiên nhẫn:** `patienceMult` 1.0 → 0.95.
- **Thời tiết kịch bản** lặp lại các loại có sẵn. Ngày 29 là `festival`, ngày 30 là `sunset`.
- **Ngày 16 tặng hàng:** tặng 15 phần mỗi nguyên liệu chè (như quà khai trương Mùa 1).
- **Chặn quá tải:** các mốc lớn 16–18 giảm trọng số món chè mới (`newDishWeight`) để khách không dồn hết vào quầy chè.

### 4.4 Anh Hiếu phụ tiệm (mở ở Mùa 2 · Mốc 3)

- **Mở:** qua Mùa 2 · Mốc 2 thì hiện một đoạn truyện ngắn: anh Hiếu xin vào phụ tiệm. Không thuê, không lương (anh đùa "lương anh là được ở gần bà chủ").
- **Chọn việc mỗi ca:** ở màn Chuẩn bị có hàng nút "Hôm nay anh phụ…", chọn một trong bốn. Lựa chọn được nhớ cho ca sau.

| Lựa chọn | Anh làm gì | Cấp 1 / 2 / 3 |
|---|---|---|
| **Chạy bàn** | Khay đã **làm đúng** món của một khách đang chờ, sau một lúc mà Bống chưa giao thì anh tự mang tới. Khách đang chờ có kiên nhẫn giảm chậm hơn 10%. | 1,5 / 1,1 / 0,8 giây |
| **Pha nước** | Tự pha **Trà đá, Trà tắc, Nước mía** khi có khách gọi, một ly một lúc, dùng hàng trong kho. Không pha trà sữa. | 6 / 5 / 4 giây mỗi ly |
| **Phụ quầy chè** | Cốc chè đã đủ lớp thì anh tự thêm lớp phủ (đá, dừa nạo) đúng công thức. Không xếp lớp hộ. | 1,2 / 0,9 / 0,6 giây |
| **Hôm nay anh nghỉ** | Anh ghé làm khách như Mùa 1 | — |

- **Hình trong tiệm:** ca anh đi làm thì hình anh Hiếu (doodle `tomortle`) đứng ở góc quầy đang phụ. Thỉnh thoảng có bong bóng thoại: 20 câu vui, thả thính nhẹ, chọc Bống; Claude viết nháp.
- **Thả thính:** ca anh đi làm thì anh không ghé mua, nhưng lượt thả thính vẫn diễn ra như cũ (anh đứng ở quầy), cùng số lượt và cùng ô nhập đáp án.
- **Độ ăn ý (3 cấp):** cấp 2 sau 8 ca làm chung, cấp 3 sau 20 ca. Lên cấp thì mở một chương **"Sau giờ đóng cửa"** (hộp truyện như khách quen, có lựa chọn và thưởng tim hoặc tiền). Chương 1 mở ngay khi anh vào phụ. Claude viết nháp 3 chương.
- **Sự kiện nhỏ**, tối đa 1 lần mỗi ca, tỉ lệ 10%:
  - "Anh đi trễ" (vắng 20% đầu ca, kèm câu xin lỗi dễ thương);
  - "Anh làm đổ ly" (mất 1 phần nguyên liệu, kèm câu thoại).
- **Album:** mục **"Anh phụ tiệm"** gồm cấp ăn ý, số ca làm chung, các chương đã mở.

### 4.5 Bác chủ nhà và Xe chè đối thủ (sự kiện nhỏ)

**Bác Sáu chủ nhà:**
- Đầu ca của mỗi mốc lớn chẵn (18, 20, …), bác ghé thu **tiền mặt bằng** (`rent`, 50 → 120k theo cấp) kèm một câu chuyện.
- Chọn **"Gửi bác"** (trừ ví), hoặc **"Khất bác tuần sau"** (lần sau trả gấp đôi, tối đa khất 1 lần).
- Ví không đủ thì tự khất.
- Bác không bao giờ làm mất tiến độ.

**Xe chè Cô Tư đối thủ:**
- Từ mốc lớn 22, có 25% số ca thường gặp xe chè bên kia đường trong 30% giữa ca.
- Trong lúc đó, kiên nhẫn của khách giảm nhanh hơn 15%.
- Phục vụ liền 5 khách trong lúc xe chè ở đó thì xe chè "chịu thua", dọn đi, Bống +30k và có câu thoại vui.

### 4.6 Phần thưởng mốc lớn Mùa 2

- **Chương truyện khách quen Mùa 2:**
  - Chị Lan, chú Tư, bé Na mỗi người thêm 2 chương (chương 4–5).
  - Thêm khách quen mới **Cô giáo Hạnh** (thích chè ba màu), 3 chương.
  - Claude viết nháp toàn bộ.
- **Thẻ công thức** (`PERSONAL.recipeCards2`, 15 thẻ):
  - Mỗi mốc lớn 16–30 mở một thẻ: tên món, thứ tự lớp vẽ bằng doodle, và một đoạn 2–3 câu về món (kỷ niệm ăn chè vỉa hè, mẹo nấu…).
  - Album có mục **"Sổ công thức Mùa 2"**.
- **Kỷ niệm Mùa 2** (`PERSONAL.memories2`, mặc định rỗng):
  - Có phần tử thứ k thì qua mốc lớn k của Mùa 2 mở như Mùa 1.
  - Thêm sau khi mốc đã qua thì mở ngay lần vào Album kế tiếp.
  - Rỗng thì Album Mùa 2 không hiện lưới kỷ niệm.
- **Tim vàng Mùa 2:** 15 tim (3 sao mỗi mốc lớn). Đủ 15 thì mở `PERSONAL.bonusMessage2` (Claude viết nháp).
- **Đoạn kết Mùa 2:** qua mốc 30 thì hiện màn kết (dùng lại EndingScreen) với `PERSONAL.ending2` (thư nháp). Sau đó Menu ghi "Mùa 3 đang được chuẩn bị 💕".

### 4.7 Mốc nhỏ, Thử thách, Ca vô tận

- **Mốc nhỏ Mùa 2:** như Mùa 1 (tiền + chuyện vặt). `PERSONAL.minorTales` thêm 15 câu, có cả nhân viên.
- **Thử thách hôm nay:** thêm 2 luật vui.
  - "Ngày chè" (món chủ đạo luôn là món chè).
  - "Anh Hiếu bận" (anh không phụ ca này, thưởng +50%).
- **Ca vô tận:** anh Hiếu phụ theo lựa chọn đã nhớ.

## 5. Nội dung Claude viết nháp (người tặng sửa)

- Thư mở Mùa 2.
- Thư kết Mùa 2 (`ending2`).
- Lời nhắn đủ 15 Tim vàng Mùa 2 (`bonusMessage2`).
- 15 thẻ công thức.
- Truyện:
  - 6 chương khách quen cũ, 3 chương cô Hạnh;
  - 3 chương "Sau giờ đóng cửa";
  - 20 câu thoại anh Hiếu khi phụ tiệm;
  - 6 câu bác Sáu, 4 câu xe chè;
  - 15 chuyện vặt.

Giọng văn: dễ thương, đời thường, không sến.

## 6. Để lại cho người làm

- Hình doodle:
  - 11 nguyên liệu mới, 14 món chè, cốc chè có dải màu;
  - bác Sáu, xe chè, cô Hạnh (anh Hiếu dùng hình có sẵn).
  - Vẽ bằng `tools/doodle/gen.py`, cùng nét với bộ hiện có.
- Bố cục hình anh Hiếu trong màn bán hàng, để không che khách và khay.
- Âm thanh: tiếng "lách cách" khi xếp lớp (âm tổng hợp như các âm hiện có).

## 7. Kiểm thử (tối thiểu)

- **Mùa:**
  - Bản v2 chuyển sang v3 đúng.
  - Sau đoạn kết Mùa 1 mở được Mùa 2.
  - Chơi lại Mùa 1 khi đang ở Mùa 2 thì cộng ×0.5 vào mốc Mùa 2.
  - Mùa 1 không đổi số liệu nào.
- **Xếp lớp:**
  - Đúng thứ tự thì nhận.
  - Đảo thứ tự thì báo sai.
  - Thiếu hoặc thừa lớp phủ thì sai.
  - `remove` / `double` đúng.
  - Không thêm lớp phủ trước khi có lớp.
- **Anh Hiếu phụ tiệm:**
  - Chạy bàn chỉ giao khay đúng món.
  - Pha nước chỉ pha 3 món đơn giản, có trừ kho.
  - Phụ chè không xếp lớp hộ.
  - Chọn "nghỉ" thì anh ghé làm khách.
  - Lựa chọn được nhớ.
  - Cấp ăn ý lên đúng mốc ca.
- **Bác Sáu:** khất tối đa 1 lần; ví không đủ thì tự khất; không âm ví.
- **Xe chè:** phục vụ 5 khách liền thì xe đi và có thưởng.
- **Bố cục:** thanh 5 quầy ở 360×640 và iPad dọc/ngang không tràn.
- **Máy tự chơi:** đi hết Mùa 2 không kẹt (≤ 12 ca mỗi mốc), tới đoạn kết Mùa 2.
