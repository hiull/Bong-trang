# 11 tính năng làm game thú vị hơn — Thiết kế ngắn

Ngày: 2026-11-24 · Trạng thái: đã duyệt ("làm tất cả, sinh nhật Bống là 28/3")

Người tặng chọn làm cả 11 đề xuất. Chữ do Claude viết nháp (thư, lời nhắn ngày đặc biệt, ghi chú hẹn hò), người tặng sửa trong `personal.js`. Mọi số liệu nằm trong `config.js`. Không máy chủ.

## Đợt A — Tình cảm & theo mùa

**7. Ngày đặc biệt** (`PERSONAL.specialDays`):
- Các ngày: 28/3 sinh nhật Bống, ngày kỷ niệm (`anniversary` → 11/1), 14/2, 8/3, 20/10.
- Ngày 11 mỗi tháng là "tháng kỷ niệm" (lời nhắn ngắn, không quà).
- Đúng ngày thật:
  - Menu có dải chúc mừng và pháo giấy;
  - mặt tiền tiệm có lớp trang trí `special-day`;
  - **lần mở game đầu tiên trong ngày**, anh Hiếu tặng quà: hộp thoại lời nhắn + tiền (sinh nhật 500k, kỷ niệm 300k, các ngày khác 150k).
- Mỗi năm mỗi ngày nhận quà một lần (`S.specialSeen["2027-03-28"]`).

**8. Thư hằng tuần** (`PERSONAL.weeklyLetters`, 12 lá nháp):
- Tính từ lần chơi đầu (`S.firstPlay`), cứ đủ 7 ngày thì mở thêm một lá.
- Menu có nút hộp thư, chấm đỏ khi có thư chưa đọc.
- Album có "Hộp thư" để đọc lại.
- Hết 12 lá thì thôi, không quay vòng.

**4. Trang trí theo mùa tự bật:**
- Đang đúng mùa của một bộ trang trí (Tết, Valentine, Trung Thu, Noel) thì tiệm tự mặc bộ đó, kể cả khi chưa mua.
- Có công tắc `settings.autoSeasonSkin`, mặc định bật.
- Trong mùa, thỉnh thoảng khách khen trang trí (bong bóng thoại).

## Đợt B — Trong ca

**1. Giờ cao điểm:**
- Từ cấp 4, ca thường và Thử thách có một đợt 20 giây khi tiến độ ở khoảng 40–60%.
- Trong đợt đó: khách đến nhanh gấp đôi, tip ×2, dải "GIỜ CAO ĐIỂM 🔥" kèm đồng hồ đếm.
- Không có ở Ca bí mật và Ca vô tận.

**2. Khách đặc biệt hiếm:**
- Từ cấp 5, mỗi lượt sinh khách có 4% thành khách đặc biệt (tối đa 1 người mỗi ca).

| Khách | Thưởng khi phục vụ |
|---|---|
| Nhà phê bình ẩm thực | Đánh giá tính ×3; nếu 5 sao thì +50k |
| Ngôi sao TikTok | +40k; 2 ca sau đông hơn 3 khách |
| Ông già Noel | Chỉ có trong tháng 12; +80k |
| Cô dâu chú rể | Gọi 2 món; +60k |

- Hình dùng lại doodle khách có sẵn, đeo bảng tên.
- Đếm số lần phục vụ để tính huy hiệu.

**6. Thú cưng có việc làm** (mỗi con đã có làm một việc, 1 lần mỗi ca):
- **Miu:** khách đầu tiên sắp bỏ đi (dưới 20% kiên nhẫn) được Miu dụi chân, hồi 30% kiên nhẫn.
- **Cún Bông:** một lần mỗi ca kéo thêm một khách vào khi tiệm vắng (ghế trống quá 6 giây).
- **Hạt Dẻ:** sau ca có 30% nhặt được 10–30k rơi dưới quầy.

**10. Kỷ lục & phá kỷ lục:**
- Ca của mốc đã có kỷ lục (`ms.best[i].income`) hiện chip "🏆 kỷ lục" trên HUD.
- Vượt kỷ lục giữa ca: thông báo "Phá kỷ lục!" (một lần).
- Màn Tổng kết ghi "Kỷ lục mới".

## Đợt C — Mục tiêu dài hạn

**5. Huy hiệu** (`CONFIG.badges`, 14 cái):
- Mở theo các bộ đếm trọn đời `S.life`: khách phục vụ, ca không ai bỏ đi, bánh nướng giòn, câu thính giải, chuỗi Thử thách, kỷ lục Ca vô tận, mùa đã xong, khách đặc biệt, món sáng tạo bán được, giờ cao điểm vượt qua, hẹn hò thắng.
- Mở thì có thông báo và tiền thưởng nhỏ.
- Album có lưới "Huy hiệu" (cái chưa mở hiện mờ, ghi cách mở).

**11. Nhiệm vụ tuần** (`CONFIG.weeklyQuests`):
- Mỗi tuần (thứ Hai → Chủ nhật, giờ máy) có 5 nhiệm vụ, lấy từ cùng các chỉ số với nhiệm vụ ngày nhưng mức cao hơn.
- Làm xong cả 5 thì nhận một **đồ trang trí độc quyền**. Có 4 món theo vòng: chuông gió, đèn dây, bảng chalk, gấu bông. Nhận hết thì đổi sang tiền.
- Menu có nút "Tuần này".

## Đợt D — Sáng tạo & hẹn hò

**3. Món sáng tạo** (Menu → "Bếp sáng tạo"):
- Tạo tối đa 3 món: chọn quầy **Trộn, Cuốn hoặc Chè**, chọn 2–5 nguyên liệu đã mở (chè: xếp đúng thứ tự lớp), đặt tên (tối đa 24 ký tự).
- Giá tự tính: tổng giá nguyên liệu × 2 + 5k.
- Món được thêm vào thực đơn (Sổ công thức). Khách thỉnh thoảng gọi; khách quen thích gọi hơn.
- Cách làm như món thường: Trộn phải lắc, Cuốn phải cuốn, Chè thêm đá.

**9. Hẹn hò sau ca:**
- Sau mỗi ca **qua mốc lớn**, hoặc ngẫu nhiên 25% sau ca thắng: màn Tổng kết có nút "Hẹn hò sau ca 💕".
- Trò lật thẻ ghép đôi 4×3 (6 cặp hình doodle), 45 giây.
- Thắng thì mở **một ghi chú hẹn hò** trong `PERSONAL.dateNotes` (10 câu nháp, mở lần lượt) và +30k. Thua thì vẫn có câu an ủi.
- Album có "Sổ hẹn hò".

## Kiểm thử

- Mỗi đợt có một file Playwright riêng: `funA.js`, `funB.js`, `funC.js`, `funD.js`.
- Giả ngày bằng ghi đè `Date` (28/3, Chủ nhật…).
- Ép các xác suất về 1.
- Toàn bộ bộ test hiện có vẫn xanh.
