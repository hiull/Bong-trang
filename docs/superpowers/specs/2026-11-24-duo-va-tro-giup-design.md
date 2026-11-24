# Trợ giúp: anh Hiếu phụ tiệm từ đầu & 3 tuỳ chọn — Thiết kế

Ngày: 2026-11-24 · Trạng thái: đã duyệt (người tặng: "bỏ chơi duo, thêm anh Hiếu vào trợ giúp luôn từ những màn đầu tiên và 3 phần kia")

Người tặng bỏ tính năng Duo qua mạng (Supabase): không làm. Game vẫn không có máy chủ, đúng Mục 0.

## 1. Anh Hiếu phụ tiệm từ Mốc 1 Mùa 1

- **Mở sẵn từ đầu.** Không còn chờ Mùa 2 · Mốc 3. Bản lưu cũ cũng được mở luôn.
- **Màn Chuẩn bị chỉ hiện việc đã có quầy:**
  - "Chạy bàn" và "Anh nghỉ": luôn có.
  - "Pha nước": khi đã mở quầy nước (cấp 2).
  - "Phụ chè": khi đã mở quầy chè (cấp 16).
  - Việc đã chọn mà ca này chưa có quầy thì anh tự làm "Chạy bàn".
- **Mặc định "Chạy bàn"** (Claude tự quyết), để có trợ giúp ngay. Ca anh đi làm thì anh không ghé làm khách; chọn "Anh nghỉ" thì anh ghé như cũ.
- **Không tự làm thay khi đang có hướng dẫn tương tác** (Ngày 1, 2, 4, 7, 16), như hiện tại.
- **Chương "Sau giờ đóng cửa" 1:** hiện ở màn Tổng kết của **ca đầu tiên anh phụ**. Chương 2 và 3 vẫn theo cấp ăn ý (8 / 20 ca).
- Luật Thử thách "Anh Hiếu bận" vẫn chỉ có từ cấp 18.

## 2. Cài đặt → "Trợ giúp"

Cả ba áp cho mọi chế độ chơi.

### 2.1 Chế độ dễ: nút gợi ý nguyên liệu

- **Công tắc:** `settings.easyHints`, mặc định tắt.
- **Hàng `.hint-row`** ngay trên lưới nguyên liệu: tối đa 6 nút, là các nguyên liệu cần chạm tiếp theo đúng thứ tự cho **món mục tiêu**.
- **Món mục tiêu:**
  - Món còn chờ của khách đợi lâu nhất (kiên nhẫn thấp nhất), khớp với khay đang chọn (cùng đế, chưa thừa nguyên liệu).
  - Khay đang trống thì lấy món đầu tiên thuộc khu đang mở.
  - Khu đang mở không có món nào chờ thì lấy món của khách đợi lâu nhất. Chạm nút sẽ tự chuyển khu.
- **Thứ tự nút:** đế → topping còn thiếu (chè theo đúng thứ tự lớp) → bước kết.
  - Rót (trà, nước mía): nút ghi "Giữ ô … để rót", chạm thì nhắc thao tác, không rót hộ.
  - Lắc, cuốn, gấp: không có nút, vẫn làm như cũ.
- **Chạm nút** = `onStationTap(id)` (khu khác thì `setZone` trước).

### 2.2 Thêm nguyên liệu sau khi đã làm xong

- **Công tắc:** `settings.lateAdd`, mặc định bật.
- **Áp dụng cho:** khay đã lắc, đã cuốn, đã gấp, hoặc cốc chè đã có lớp phủ. Vẫn chạm thêm được nếu có một món đang chờ (cùng đế) mà:
  - khay **không thừa** nguyên liệu nào, và
  - chỉ **thiếu 1–2 phần topping hay lớp**, và
  - nguyên liệu vừa chạm nằm trong phần thiếu.
- **Riêng chè:** chỉ thêm được **lớp kế tiếp** theo thứ tự. Lớp mới nằm dưới lớp phủ.
- Thêm sau vẫn tính đúng, không phạt.
- Thiếu từ 3 phần trở lên, hoặc chạm nguyên liệu không thuộc phần thiếu: vẫn báo như cũ.

### 2.3 Kiên nhẫn của khách

- **Lựa chọn:** `settings.patienceBoost`, xoay vòng Bình thường / +25% / +50% (0 / 0.25 / 0.5). Mặc định Bình thường.
- **Cách tính:** nhân thêm `1 + boost` vào `patienceMult` lúc vào ca, cộng dồn với quạt máy và trợ giúp khi thua.

## 3. Kiểm thử

- **Anh Hiếu:**
  - Mốc 1 Mùa 1 có hàng chọn việc gồm 2 nút (Chạy bàn, Anh nghỉ). Cấp 2 có thêm Pha nước. Cấp 16 có thêm Phụ chè.
  - Chạy bàn chạy được ở Mùa 1.
  - Chương 1 hiện sau ca đầu.
  - Bản lưu cũ (`unlocked: false`) vẫn có anh.
- **Gợi ý:**
  - Tắt thì không có hàng gợi ý.
  - Bật thì hiện đúng nguyên liệu, đúng thứ tự, cho trộn / nướng / nước / chè.
  - Bấm hết các nút (cùng thao tác lắc) thì giao được món.
- **Thêm sau:**
  - Bịch đã lắc thiếu 1 topping: thêm được, giao đúng.
  - Thiếu 3: không cho.
  - Nguyên liệu lạ: không cho.
  - Chè thiếu lớp kế tiếp: thêm được. Chạm lớp khác: không.
  - Tắt công tắc: không cho thêm.
- **Kiên nhẫn +50%:** `patienceMult` lớn gấp 1,5.
- **Hồi quy:** bộ test hiện có. Riêng các test giả định anh Hiếu chưa mở ở Mùa 1 thì sửa theo luật mới.
