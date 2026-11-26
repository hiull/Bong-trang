# Cải thiện gameplay — Thiết kế ngắn

Ngày: 2026-11-26 · Trạng thái: đã duyệt ("làm hết", bỏ Thách đấu anh Hiếu)

Người tặng chọn làm mục 1–7 trong danh sách đề xuất và thêm việc anh Hiếu giúp khi Bống làm sai. Mục 8 (Thách đấu anh Hiếu) bỏ.
Số liệu nằm trong `config.js`, lời thoại trong `personal.js`.

## Quyết định của người tặng
- **Anh Hiếu tự sửa món làm sai:** không cần bấm.
- **Bùa giữ mãi:** cộng dồn qua mọi mùa.
- **Cơ chế mới mở dần theo mốc:** chỉnh được ở Cài đặt → Sự kiện (Tắt/Ít/Vừa/Nhiều). Nhịp lắc/cuốn có công tắc riêng trong Trợ giúp.

## Đợt 1

**Anh Hiếu sửa món làm sai.**
- Khi giao sai món (thiếu, thừa, chưa lắc/cuốn, cháy, sai lớp chè…), anh Hiếu tự nhảy vào: bỏ khay sai rồi làm lại đúng món trong 2,5 giây.
- Khách được giữ kiên nhẫn ít nhất 30%, không bị trừ.
- Khách vẫn trả tiền món nhưng tip chỉ còn 50%, và combo về 0.
- Mỗi ca tối đa 3 lần. Hết lượt thì như cũ (khách phật ý, trừ kiên nhẫn).
- Có công tắc "Anh Hiếu sửa món làm sai" trong Trợ giúp, mặc định bật.
- Lời thoại: `PERSONAL.heroFixLines`.

**Bếp tập.**
- Nút ở Menu.
- Chọn một món bất kỳ đã mở (kể cả món sáng tạo và công thức chuẩn ngoài đời), làm theo công thức.
- Không có khách thật, không tính giờ, không tốn tiền hay nguyên liệu, không tính tiến độ.
- Giao đúng thì khen và chọn món khác; giao sai thì báo lý do.

**Mục tiêu phụ mỗi mốc.**
- Mỗi mốc (từ Mốc 2) có một mục tiêu phụ cố định theo số mốc. Ví dụ: không ai bỏ đi, combo 5, 3 bánh nướng giòn, 5 đánh giá 5 sao, không cần anh Hiếu sửa món, phục vụ 3 yêu cầu riêng.
- Đạt mục tiêu thì mốc có thêm dấu ★ trên Bản đồ, và lần đầu đạt được 20k.
- Hiện ở màn Chuẩn bị, trên HUD, và ở Tổng kết.

## Đợt 2: Bùa
- Mỗi lần qua mốc lớn lần đầu, Bống chọn 1 trong 3 bùa ngẫu nhiên chưa có.
- Bùa cộng dồn và giữ mãi.
- Ví dụ: lắc/cuốn nhanh hơn, tip món cuốn +5k, vùng giòn rộng hơn, khách đầu ca kiên nhẫn gấp đôi, nguyên liệu rẻ 10%, thêm 1 lượt anh Hiếu sửa món, giờ cao điểm tip ×2,5…
- Xem lại trong Kỷ niệm → Bùa.

## Đợt 3
**Tủ giữ món.**
- Từ cấp 6. Có 2 ô: kéo hoặc chạm khay đã làm xong để cất vào tủ.
- Khách gọi trúng món trong tủ thì chạm ô để giao ngay.
- Món để quá 40 giây thì "nguội": vẫn giao được nhưng trừ 1 sao đánh giá.

**Nhịp lắc / cuốn.**
- Vòng nhịp khép lại; chạm đúng lúc thì được "Ngon tuyệt!", +3k tip cho món đó và rung nhẹ.
- Lệch nhịp vẫn lắc bình thường.
- Công tắc trong Trợ giúp, mặc định bật. Chế độ thư giãn tắt nhịp.

## Đợt 4
**Đơn mang về.**
- Từ cấp 8. Đơn hiện trên điện thoại ở quầy, gồm 2–3 món, có đồng hồ chờ tài xế (60–80 giây).
- Giao đủ thì trả tiền + 10k phí; trễ thì mất đơn, nhưng không trừ tim.
- Mức chỉnh ở Cài đặt → Sự kiện.

**Đơn sỉ.**
- Từ cấp 10. Một khách gọi 4–6 phần cùng một món trộn hoặc chè.
- Bật "khay lớn": làm một lần, giao một lần là đủ. Khay lớn tốn nguyên liệu ×số phần.
- Tiền ×số phần + 15%. Mức chỉnh ở Cài đặt → Sự kiện.

## Kiểm thử
- Mỗi đợt có một file Playwright riêng.
- Toàn bộ bộ test hiện có vẫn phải xanh.
