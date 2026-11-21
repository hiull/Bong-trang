# Anh Hiếu thả thính — thiết kế (bản ngắn)

## Mục đích
Thêm chất "bựa" kiểu meme Việt cho NPC: anh Hiếu (Tomortle) ghé tiệm buông các câu **nói lái / chuyển vế đổi dấu**
do người dùng sưu tầm, Bống gõ "ý thật" vào ô chữ, đoán đúng thì được thưởng. Mục tiêu: Bống bật cười và muốn
giải hết bộ câu. **Bắt buộc:** đưa đủ tất cả các câu chơi chữ người dùng đã gửi vào game.

## Không làm / tránh
- Không để học sinh và Bé Na Lớp 10 (nhân vật vị thành niên) nói câu lái bậy.
- Không phạt khi đoán sai; không làm ca bán hàng bị dồn ép (khách đứng chờ, không mất kiên nhẫn khi đang giải).
- Không bỏ hành vi mua hàng hiện có của anh Hiếu.

## Các hướng đã cân nhắc
- **A. Thay câu hỏi kỷ niệm sau khi anh mua bằng câu thính** — gọn, nhưng mỗi lượt chơi chỉ gặp ~16 câu → không đủ.
- **B. Xen kẽ kỷ niệm / thính** — càng ít câu hơn.
- **C. Anh chỉ vào thả thính, không mua** — người dùng muốn giữ cả việc mua hàng.
- **Đã chọn (người dùng): anh Hiếu vừa mua hàng như cũ, vừa có các lượt ghé riêng chỉ để thả thính**, đủ dày để gặp hết các câu.

## Thiết kế
- **Lượt ghé thả thính** (không gọi món, không chiếm ghế, không tính vào số khách/mục tiêu): từ Ngày 3, mỗi ngày
  `tomoFlirtPerDay` lần (mặc định 3) vào các thời điểm ngẫu nhiên giữa ca; Ngày bí mật `tomoFlirtSecret` lần (mặc định 10).
  Anh bước vào đứng trước quầy → game tạm dừng → bong bóng câu thính (câu nhiều dòng hiện đủ các dòng) → ô nhập chữ.
- **Chấm:** bỏ qua hoa/thường, dấu câu, khoảng trắng thừa; chấp nhận gõ không dấu; mỗi câu có thể có nhiều đáp án.
- **Đúng:** +20k tip, +1 tim tiệm, anh phản ứng vui + thả tim, câu được lưu vào **"Sổ thính của anh Hiếu"**.
  **Sai:** báo nhẹ, cho gõ lại. Nút **"Chịu, anh nói đi"**: anh lộ đáp án, vẫn thưởng **+10k** (không có tim); câu vẫn vào Sổ thính (đánh dấu "anh nói").
- **Thứ tự câu:** đi lần lượt qua toàn bộ danh sách, câu đã giải không lặp lại cho đến khi giải hết; tiến độ được lưu.
- **Sổ thính** (trong Album): "Đã giải N/tổng", xem lại các câu đã giải kèm đáp án; câu chưa gặp hiện khoá.
- Lượt anh ghé **mua hàng** giữ nguyên (câu gọi món lnlk, kiên nhẫn vô hạn, tip, hỏi kỷ niệm).
- **Dữ liệu** trong `personal.js` → `flirtLines: [{ lines: ["câu 1", "câu 2"…], answers: ["đáp án"…], note? }]`.
  Claude giải nháp toàn bộ đáp án, câu nào không chắc ghi `note: "CẦN KIỂM TRA"` để người dùng rà lại.
- Nhiệm vụ hằng ngày thêm: "Giải N câu thính của anh Hiếu".
- Số lần ghé, phần thưởng nằm trong `config.js`; câu chữ phản ứng/nút nằm trong `config.js` texts.

## Để lại cho người làm
Vị trí bong bóng/ô nhập trên màn bán hàng, hoạt ảnh anh đi vào/đi ra, câu phản ứng khi đúng/sai, cách nhóm các dòng
trong danh sách người dùng thành từng câu.

## Cập nhật sau duyệt (người dùng, 21/11/2026)
- **Chỉ giữ các câu thả thính dễ thương, bỏ hết câu tục tĩu.** Trong bộ câu đã gửi chỉ 3 câu đạt (xương nhất trình, lúc xào… ninh, vị anh đơ); câu không chắc nghĩa cũng bỏ. Phản ứng của anh Hiếu đổi sang giọng dễ thương (💕 thay 😈).
- Sau đánh giá mã: gõ lại câu đố không được tính; đáp án ngắn nhận cả câu có chứa đáp án (khi có dấu); câu chưa giải được ưu tiên; không bao giờ chồng popup thả thính với câu chuyện khách quen; ô nhập tắt tự sửa chữ của bàn phím.

### Cập nhật: bộ câu cố định & chấm theo chữ bị đổi
- Bộ câu chỉ gồm 10 câu người dùng đưa (hai dòng "phải cùng nàng ăn tối / anh mới thấy được quá trời xinh" gộp thành một câu hai dòng).
- `answers[0]` là cả câu ý thật. Bống chỉ cần gõ những chữ khác với câu đố, đúng thứ tự; gõ cả câu vẫn đúng. Chữ chỉ khác dấu với chữ cùng vị trí trong câu đố phải gõ đúng dấu.
