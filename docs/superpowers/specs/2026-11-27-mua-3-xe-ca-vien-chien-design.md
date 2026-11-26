# Mùa 3 · Xe cá viên chiên — Thiết kế ngắn

Ngày: 2026-11-27 · Trạng thái: đã duyệt (người tặng chọn "làm hết" trong danh sách cải thiện)

## Ý tưởng
Qua Mùa 2, tiệm mở thêm **xe cá viên chiên** ở đầu hẻm. Giữ nguyên lối chơi theo mốc như Mùa 1 và Mùa 2:
- 15 mốc lớn (ngày 31–45), mỗi mốc lớn kèm một mốc nhỏ;
- thẻ công thức Mùa 3 (15 thẻ);
- lời mở đầu và đoạn kết riêng;
- thưởng tim vàng.

## Quầy chiên (zone `chien`)
Thao tác gần với đời thật và dùng lại cơ chế có sẵn:
1. Chạm **rổ chiên** (đế).
2. Chạm các loại viên/xiên: cá viên, bò viên, tôm viên, xúc xích, đậu hũ phô mai, khoai tây.
3. Bấm **Lắc rổ**. Dùng lại cử chỉ lắc, có nhịp "Ngon tuyệt!".
4. Rưới tương sau khi lắc: tương ớt, tương me, sốt phô mai.

Khay có thể ở trạng thái thiếu, thừa, chưa lắc, tương rưới trước khi lắc. Các trạng thái này dùng chung cách báo sai như các quầy khác. Anh Hiếu, tủ giữ món, đơn sỉ, đơn mang về và món sáng tạo dùng được với quầy chiên.

## Nội dung
- Món: 8 món, mở dần theo mốc (từ mốc 31). Các món ở mốc 36 và 41 là combo hai món với quầy cũ.
- 9 nguyên liệu mới, có hình doodle riêng.
- `PERSONAL`:
  - `season3Intro`, `ending3`, `bonusMessage3`;
  - `recipeCards3` (15 thẻ);
  - `memories3: []` (anh tự thêm ảnh nếu muốn).
- Sự kiện bác chủ nhà và xe đối thủ vẫn có từ Mùa 2 trở đi.

## Kỹ thuật
- Trạng thái mùa tổng quát hoá: `S.s3` có cùng dạng với `S.s2`. Hàm `BT.MS.seasonState(sid)` trả về đúng object của từng mùa. Mọi chỗ đang viết cứng `S.s2` / `season === 2` được chuyển sang dùng mùa của ca.
- `CONFIG.build.maxPlayableDay`: tim vàng tính theo số mốc lớn của từng mùa (15).

## Kiểm thử
- `s3.js`: mở Mùa 3 sau khi xong Mùa 2, làm món chiên đúng/sai, qua mốc nhận thẻ công thức, đoạn kết Mùa 3, tim vàng Mùa 3.
- Toàn bộ bộ test hiện có vẫn phải xanh.
