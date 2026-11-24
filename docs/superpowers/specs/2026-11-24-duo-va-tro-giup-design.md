# Chơi Duo qua mạng & 3 tuỳ chọn trợ giúp — Thiết kế

Ngày: 2026-11-24 · Trạng thái: chờ duyệt

## 1. Ý định

Người tặng muốn Bống và anh **chơi cùng một tiệm, mỗi người một máy, ngang hàng**: cả hai đều thấy khách, đều làm món, đều giao được. Kèm 3 tuỳ chọn để game dễ thở hơn:
1. Chế độ dễ có nút gợi ý nguyên liệu.
2. Thêm nguyên liệu sau khi món đã làm xong, nếu chỉ thiếu 1–2 thứ.
3. Tăng kiên nhẫn của khách (tuỳ chọn riêng).

**Đã chốt với người tặng:**
- Duo dùng Supabase (đã dùng ở dự án khác).
- Chơi kiểu B (ngang hàng), không phải kiểu A (anh chỉ phụ).
- Làm cả 3 tuỳ chọn trợ giúp.

**Người tặng chấp nhận đổi nguyên tắc "không máy chủ" (Mục 0, 24) cho riêng tính năng Duo:**
- Supabase Realtime chỉ chuyền tin giữa hai máy: không tài khoản, không lưu dữ liệu, không thu thập gì.
- Chơi một mình vẫn chạy offline như cũ.

## 2. Mục tiêu / Không làm / Điều cấm

**Mục tiêu**
- Hai máy vào cùng một ca bằng **mã phòng 4 số**. Cả hai cùng thấy một dòng khách và cùng giao món.
- Mạng chậm 100–300 ms vẫn chơi được, không lệch tiền hay lệch khách.
- 3 tuỳ chọn trợ giúp bật/tắt trong Cài đặt, áp cho cả chơi một mình lẫn Duo.

**Không làm**
- Tìm người lạ chơi cùng, bảng xếp hạng, chat, tài khoản.
- Duo cho Ca vô tận và Thử thách hôm nay (để sau, nếu cần).
- Đồng bộ bản lưu giữa hai máy.

**Điều cấm**
- Không dùng khoá `service_role`. Chỉ dùng khoá công khai (anon/publishable), kèm ghi chú trong README.
- Không gửi thông tin cá nhân lên mạng. Chỉ gửi trạng thái ca: id món, số tiền trong ca, vị trí khách.
- Không làm hỏng chơi một mình hay chơi offline.
- Mất mạng giữa ca không được làm treo game.

## 3. Các cách đã cân nhắc

| Cách | Mô tả | Đánh đổi | |
|---|---|---|---|
| **B1. Máy chủ phòng là máy Bống** | Máy Bống chạy toàn bộ mô phỏng (khách, kiên nhẫn, tiền). Máy anh gửi **thao tác** (chạm nguyên liệu, giao món) và nhận **ảnh chụp trạng thái** khoảng 8 lần/giây để vẽ lại. | Một nguồn sự thật duy nhất nên không lệch. Máy anh trễ một nhịp mạng khi giao món. | **Chọn (Claude tự quyết)** |
| B2. Hai máy cùng mô phỏng, khớp từng bước | Hai máy chạy cùng nhau từng khung hình. | Mạng chậm là đứng hình. Mọi chỗ ngẫu nhiên đều phải khớp. Phải viết lại GameScreen. | |
| B3. Mỗi máy tự chạy, gộp kết quả | Hai bên tự xử lý rồi trộn lại. | Hai người giành cùng một khách. Tiền và khách lệch nhau. | |

**Khay là của riêng từng máy.** Mỗi người có khay và vỉ nướng riêng, làm món trên máy mình nên chạm là thấy ngay. Chỉ lúc **giao món** mới gửi lên máy Bống để chấm.

## 4. Thiết kế Duo

### 4.1 Kết nối

- **Lớp truyền tin** `BT.Net` (file `src/net.js`), hai kiểu:
  - `SupabaseTransport`: dùng `supabase-js` v2 (cố định một phiên bản, nạp từ cdn.jsdelivr.net), kênh Broadcast `bongtrang-<mã phòng>`, `self: false`.
  - `LocalTransport`: dùng `BroadcastChannel`, để thử hai tab trên cùng máy và để test tự động.
- **Cấu hình** trong `config.js`: `duo: { supabaseUrl: "", supabaseAnonKey: "", snapshotHz: 8, timeoutSec: 8 }`.
  - Chưa điền thì nút Duo hiện "Chưa cài Duo", kèm hướng dẫn trong README.
- **Thư viện:** chỉ nạp `supabase-js` khi bấm vào Duo, nên chơi một mình không tải thêm gì.

### 4.2 Luồng vào phòng

- Menu có nút **"Chơi Duo 👫"**, mở khi Bống ở Mốc 3 trở lên (như các chế độ khác).
- **Tạo phòng** (máy Bống, gọi là "chủ"):
  - Sinh mã 4 số, hiện to giữa màn kèm "Đợi người chơi cùng…".
  - Chọn ca: ca kế tiếp của mốc hiện tại, hoặc chơi lại một mốc đã qua.
- **Vào phòng** (máy anh, gọi là "khách"): nhập mã 4 số.
- Khi đủ hai người:
  1. Chủ gửi `start` kèm `run` (cấu hình ca) và danh sách món mở.
  2. Cả hai vào màn bán hàng. Màn Chuẩn bị chỉ có ở máy chủ, tiền nhập hàng trừ vào ví của chủ.
  3. Hai máy đếm ngược cùng lúc.

### 4.3 Trong ca

**Máy chủ:**
- Chạy GameScreen như cũ.
- Mỗi `1/snapshotHz` giây gửi `snap`, gồm:
  - danh sách khách: id, ghế, loại, món, yêu cầu riêng, % kiên nhẫn, trạng thái, món nào đã xong;
  - tiền ca, tim, combo;
  - số khách đã phục vụ / tổng;
  - kho nguyên liệu;
  - biến cố.

**Máy khách:**
- Chạy GameScreen ở **chế độ duo-khách**: không tự sinh khách, không tính kiên nhẫn, không tính tiền.
- Vẽ khách theo `snap`. Ghép khách theo `id`: khách mới thì cho đi vào, khách mất thì cho rời đi.

**Làm món:**
- Mỗi máy dùng khay của mình.
- Chạm nguyên liệu thì trừ kho **ở máy chủ**:
  - máy khách gửi `take {ing}`;
  - chủ trừ kho rồi trả `ok` / `out`;
  - máy khách trừ tạm ngay; nếu chủ trả `out` thì hoàn lại, kèm câu "Hết hàng".

**Giao món:**
- Máy khách gửi `deliver {customerId, tray}`, với `tray` là bản sao trạng thái khay.
- Chủ chấm bằng đúng `deliver()` hiện có (dùng một khay ảo như anh Hiếu phụ pha nước), rồi trả `delivered {ok, reason}`.
- Máy khách: đúng thì xoá khay; sai thì báo lý do và giữ khay.
- **Hai người giao cùng một món:** chủ xử lý theo thứ tự tin đến. Người sau nhận "Khách nhận rồi", khay vẫn giữ nguyên để giao cho khách khác.

**Những thứ chỉ chạy ở máy chủ:** truyện khách quen, anh Hiếu ghé, thả thính, sự kiện, xe chè, nút Năng lượng yêu thương.
- Hộp thoại truyện chỉ hiện ở máy chủ. Máy khách thấy dòng "Bống đang nói chuyện với khách…" và tạm dừng theo.
- Thả thính hiện ở **máy khách**: người chơi cùng là anh Hiếu thật, nên anh thấy câu mình "đang thả", còn Bống vẫn gõ đáp án như cũ.

**Tạm dừng:** một bên bấm tạm dừng thì cả hai cùng dừng.

**Kết thúc ca:**
- Chủ chạy `finish()` như cũ và gửi `end` kèm tóm tắt.
- Máy khách hiện màn Tổng kết chỉ để xem: không cộng tiến độ, không cộng tiền vào bản lưu của máy khách.
- Tiến độ, tiền, tim vàng ghi vào bản lưu của **máy chủ**.

### 4.4 Mất kết nối

- Quá `timeoutSec` không nhận tin của bên kia: hiện "Mất kết nối với người chơi cùng".
  - **Máy chủ:** cho chọn "Chơi tiếp một mình" (ca chạy tiếp bình thường) hoặc "Đợi".
  - **Máy khách:** về Menu.
- Máy khách vào lại đúng mã phòng giữa ca thì nhận `snap` và chơi tiếp.

### 4.5 Bố cục

- **Thanh trên đầu** có chấm trạng thái mạng (xanh / vàng / đỏ) và mã phòng.
- **Hai đồng hồ cát tên người chơi** (`PERSONAL.herName`, `PERSONAL.myName`) cạnh tiền ca. Ai giao món nào thì món đó hiện chữ "+Bống" / "+Hiếu" bay lên.

## 5. Ba tuỳ chọn trợ giúp (Cài đặt → "Trợ giúp")

### 5.1 Chế độ dễ: nút gợi ý nguyên liệu

- **Công tắc:** `settings.easyHints` (mặc định tắt).
- **Hàng gợi ý** `.hint-row`, nằm ngay trên lưới nguyên liệu, có tối đa 6 nút nguyên liệu cần chạm tiếp, đúng thứ tự cần làm.
  - **Món mục tiêu:** món đầu tiên còn đang chờ của khách đợi lâu nhất, khớp với khay đang chọn (cùng đế), hoặc cùng khu đang mở nếu khay còn trống.
  - **Thứ tự nút:** đế → topping còn thiếu (chè thì theo thứ tự lớp) → bước kết (tắc, đá, nước chấm, sốt…).
  - **Thao tác** (lắc, cuốn, gấp, rót): hiện nút chữ "Lắc!", "Cuốn!", "Giữ để rót", bấm thì mở đúng thao tác đó, không làm hộ.
- **Chạm nút gợi ý** = chạm đúng ô nguyên liệu đó (`onStationTap`). Nguyên liệu nằm ở khu khác thì tự chuyển khu.
- **Duo:** mỗi máy tự bật/tắt gợi ý của mình.

### 5.2 Thêm nguyên liệu sau khi đã làm xong

- **Công tắc:** `settings.lateAdd` (mặc định bật).
- **Áp dụng cho:** bịch đã lắc, bánh đã cuốn, bánh đã gấp, và cốc chè đã có lớp phủ. Vẫn được chạm thêm nguyên liệu nếu:
  1. khay khớp với ít nhất một món đang chờ, **chỉ thiếu 1–2 phần topping/lớp**, và
  2. nguyên liệu vừa chạm là một trong những phần còn thiếu đó.
- **Riêng chè:** chỉ thêm được **lớp trên cùng còn thiếu** (lớp cuối theo thứ tự). Thiếu lớp ở giữa thì vẫn báo "Sai thứ tự", vì không chèn được vào giữa cốc.
- **Không cho thêm** khi nguyên liệu không thuộc phần thiếu, hoặc thiếu từ 3 phần trở lên. Lúc đó báo như cũ ("Đã lắc rồi…").
- Thêm sau thì món vẫn tính đúng, không phạt. Riêng bánh nướng "giòn" vẫn giữ chất lượng đã có.

### 5.3 Tăng kiên nhẫn của khách

- **Lựa chọn:** `settings.patienceBoost`, một trong `0` / `0.25` / `0.5`, hiện là "Bình thường / +25% / +50%". Mặc định 0.
- **Cách tính:** nhân thêm vào `patienceMult` lúc vào ca, cộng dồn với quạt máy và trợ giúp khi thua.
- **Duo:** dùng mức của **máy chủ**.

## 6. Kiểm thử

- **Duo, dùng `LocalTransport` (hai trang Playwright cùng `BroadcastChannel`):**
  - Tạo phòng và vào phòng bằng mã đúng; mã sai thì báo.
  - Hai bên thấy cùng số khách và cùng món chờ.
  - Máy khách làm khay đúng rồi giao: tiền tăng ở chủ, khách được phục vụ ở cả hai.
  - Hai bên giao cùng một món: chỉ một lần được tính.
  - Hết hàng: máy khách được hoàn kho.
  - Tạm dừng một bên thì cả hai dừng.
  - Kết thúc ca: tiến độ chỉ cộng ở chủ.
  - Mất kết nối: hiện thông báo, chủ chơi tiếp được.
  - Không lỗi JS.
- **Supabase:**
  - Thử một lần với dự án thật nếu môi trường cho kết nối tới `*.supabase.co`.
  - Nếu không: kiểm `SupabaseTransport` bằng giả lập thư viện, và ghi rõ là chưa thử với mạng thật.
- **Gợi ý:** đúng nguyên liệu, đúng thứ tự (trộn, nước, nướng, cuốn, chè); chạm nút làm đúng món; tắt thì không hiện.
- **Thêm sau:**
  - Bịch đã lắc thiếu 1 topping: thêm được, giao đúng.
  - Thiếu 3 topping: không cho thêm.
  - Nguyên liệu không thuộc phần thiếu: từ chối.
  - Chè thiếu lớp trên cùng: thêm được. Thiếu lớp giữa: không.
- **Kiên nhẫn:** +50% thì thời gian chờ dài gấp 1,5.
- **Hồi quy:** toàn bộ bộ test hiện có vẫn xanh.

## 7. Cần từ người tặng

- **URL dự án Supabase** và **khoá anon/publishable** (dùng dự án sẵn có hoặc tạo mới). Claude có thể tự tra qua kết nối Supabase nếu người tặng cho phép.
- **Bật Realtime** cho dự án. Broadcast mặc định đã bật; không cần bảng, không cần RLS cho kênh broadcast công khai.
