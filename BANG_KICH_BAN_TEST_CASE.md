# BẢNG KỊCH BẢN KIỂM THỬ CHỨC NĂNG (FUNCTIONAL TEST CASES)
**Dự án:** Hệ thống Quản lý Xưởng dịch vụ & Chăm sóc Ô tô (OTO Garage)  
**Đồ án môn học / Khóa luận tốt nghiệp:** Chuyên ngành Công nghệ thông tin  
**Nhóm thực hiện:** Nhóm 12  

Trần Quang Anh (MSSV: 2151053001) 


**Môi trường kiểm thử (Test Environment):**  
- Hệ điều hành: Windows 11 / Linux Docker Engine  
- Trình duyệt kiểm thử: Google Chrome (Version 128+)  
- Backend: Java 17, Spring Boot 3.2.5 (Chạy trên Docker container `oto_backend:8080`)  
- Frontend: React 18, Vite 5, TypeScript (Chạy tại `http://localhost:5173`)  
- Database: MySQL 8.x (Docker container `oto_mysql:3308`)  
- Cổng thanh toán tích hợp: VNPAY Sandbox Payment Gateway  
- Cổng gửi thư tích hợp: Google Gmail SMTP (`smtp.gmail.com:587`)  

---

## 1. TỔNG QUAN CHIẾN LƯỢC KIỂM THỬ (TEST STRATEGY)

### 1.1. Mục tiêu kiểm thử
1. Đảm bảo toàn bộ các yêu cầu chức năng (FRD) của 3 phân hệ (**Khách hàng**, **Kỹ thuật viên**, **Quản trị viên**) hoạt động chính xác theo đặc tả nghiệp vụ.
2. Kiểm tra tính toàn vẹn của dữ liệu và các ràng buộc nghiệp vụ quan trọng:
   * Chặn đặt lịch trùng cho cùng một xe trong cùng một ngày nếu đơn trước chưa bàn giao.
   * Đảm bảo lịch làm việc của KTV nào chỉ hiển thị xe do chính KTV đó tiếp nhận, không lộ sang KTV khác.
   * Tính toán doanh thu và chi phí báo giá (tiền công + tiền phụ tùng + thuế) chính xác 100%.
   * Ràng buộc quyền truy cập theo vai trò (Role-based Access Control - RBAC) bằng Stateless JWT.
3. Kiểm tra các dịch vụ tích hợp bên ngoài: Thanh toán trực tuyến VNPAY và tự động gửi Email thật qua SMTP.

### 1.2. Bảng tổng hợp số lượng Test Case (Test Summary)

| STT | Phân hệ / Module kiểm thử | Số lượng Test Case | Đạt (PASS) | Không đạt (FAIL) | Tỷ lệ đạt |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **1** | Xác thực & Phân quyền (Authentication & RBAC) | 6 | 6 | 0 | 100% |
| **2** | Phân hệ Khách hàng (Customer Features) | 8 | 8 | 0 | 100% |
| **3** | Phân hệ Kỹ thuật viên (Staff / Workshop Features) | 10 | 10 | 0 | 100% |
| **4** | Phân hệ Quản trị viên (Admin & Management Features) | 8 | 8 | 0 | 100% |
| **5** | Tích hợp bên ngoài (VNPAY & Gmail SMTP Notification) | 4 | 4 | 0 | 100% |
| **TỔNG CỘNG** | **Toàn bộ hệ thống** | **36** | **36** | **0** | **100%** |

---

## 2. CHI TIẾT CÁC KỊCH BẢN KIỂM THỬ (DETAILED TEST CASES)

### MODULE 1: XÁC THỰC & PHÂN QUYỀN (AUTH & RBAC)

| Mã TC | Tên chức năng | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_AUTH_01** | Đăng ký tài khoản Khách hàng mới thành công | Email chưa tồn tại trong hệ thống | 1. Mở trang `/register`<br>2. Nhập đầy đủ thông tin hợp lệ<br>3. Bấm "Đăng ký" | Họ tên: Nguyễn An<br>Email: `test_an@gmail.com`<br>SĐT: `0912345678`<br>Pass: `123456` | Hệ thống tạo tài khoản thành công, cấp quyền `CUSTOMER`, tự động chuyển hướng về trang `/login` với thông báo thành công. | Đăng ký thành công, chuyển hướng về login. | **PASS** |
| **TC_AUTH_02** | Đăng ký tài khoản với email đã tồn tại | Email `customer1@garage.local` đã có trong CSDL | 1. Mở trang `/register`<br>2. Nhập email đã tồn tại<br>3. Bấm "Đăng ký" | Email: `customer1@garage.local`<br>Pass: `123456` | Báo lỗi: "Email đã được sử dụng", không cho tạo tài khoản trùng. | Báo lỗi email đã tồn tại chính xác. | **PASS** |
| **TC_AUTH_03** | Đăng nhập thất bại do sai mật khẩu | Tài khoản đã tồn tại trong CSDL | 1. Mở trang `/login`<br>2. Nhập email đúng, mật khẩu sai<br>3. Bấm "Đăng nhập" | Email: `huyhoang123@gmail.com`<br>Pass: `123456` (Mật khẩu đúng là `Staff@123`) | Hiển thị thông báo: "Email hoặc mật khẩu không chính xác", không cấp token. | Hiển thị lỗi đăng nhập thất bại. | **PASS** |
| **TC_AUTH_04** | Đăng nhập thành công với vai trò Khách hàng | Tài khoản Customer hợp lệ | 1. Mở trang `/login`<br>2. Nhập email và mật khẩu đúng<br>3. Bấm "Đăng nhập" | Email: `customer1@garage.local`<br>Pass: `Customer@123` | Nhận JWT Token, lưu vào LocalStorage, điều hướng vào `/app/customer`. | Đăng nhập thành công, vào Dashboard khách hàng. | **PASS** |
| **TC_AUTH_05** | Đăng nhập thành công với vai trò Kỹ thuật viên | Tài khoản Staff hợp lệ | 1. Mở trang `/login`<br>2. Nhập email và mật khẩu đúng<br>3. Bấm "Đăng nhập" | Email: `staff@garage.local`<br>Pass: `Staff@123` | Nhận JWT Token có role `STAFF`, điều hướng vào `/app/staff`. | Đăng nhập thành công, vào Dashboard xưởng. | **PASS** |
| **TC_AUTH_06** | Chặn truy cập trái phép phân hệ Admin (RBAC) | Đang đăng nhập tài khoản Khách hàng (`CUSTOMER`) | Cố tình gõ URL `/app/admin` trên thanh địa chỉ trình duyệt | Token role: `CUSTOMER` | `ProtectedRoute` chặn truy cập, tự động điều hướng ngược lại về `/app/customer`. | Bị chặn và điều hướng về trang của đúng vai trò. | **PASS** |

---

### MODULE 2: PHÂN HỆ KHÁCH HÀNG (CUSTOMER)

| Mã TC | Tên chức năng | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_CUST_01** | Đặt lịch hẹn dịch vụ mới hợp lệ | Đã đăng nhập Customer, xe chưa có lịch trong ngày | 1. Vào `/app/customer/book`<br>2. Nhập biển số, ngày hẹn, giờ hẹn, dịch vụ<br>3. Bấm "Xác nhận đặt lịch" | Biển số: `51A-99999`<br>Ngày: Ngày mai<br>Giờ: `08:00 - 10:00`<br>Dịch vụ: Bảo dưỡng 50k km | Tạo đơn thành công với trạng thái `PENDING`. Tự động kích hoạt gửi Email xác nhận đến email khách. | Đặt lịch thành công, nhận mã `BK-...`, có email gửi về. | **PASS** |
| **TC_CUST_02** | Chặn đặt trùng lịch cho cùng xe trong cùng ngày | Xe `51A-99999` đã có lịch ngày mai ở trạng thái `PENDING` | 1. Vào lại `/app/customer/book`<br>2. Nhập lại biển số `51A-99999` cho cùng ngày mai<br>3. Bấm "Xác nhận đặt lịch" | Biển số: `51A-99999`<br>Ngày: Ngày mai | Báo lỗi 409 Conflict: *"Xe 51A-99999 đã có lịch hẹn hoặc đang được xử lý vào ngày... Vui lòng không đặt trùng lặp"*. | Chặn trùng lịch thành công, hiển thị thông báo rõ ràng. | **PASS** |
| **TC_CUST_03** | Cho phép đặt lịch mới khi xe đã bàn giao xong (`COMPLETED`) | Xe `51A-12345` trước đó đã bàn giao xong (`DELIVERED`/`COMPLETED`) | 1. Vào `/app/customer/book`<br>2. Đặt lịch mới cho xe `51A-12345` vào ngày hôm nay | Biển số: `51A-12345`<br>Ngày: Hôm nay | Hệ thống cho phép đặt lịch thành công vì đơn sửa chữa trước đó đã kết thúc. | Đặt lịch thành công bình thường. | **PASS** |
| **TC_CUST_04** | Xem danh sách xe và lịch sử sửa chữa | Đã đăng nhập Customer | Vào `/app/customer/history` | - | Hiển thị đầy đủ danh sách xe của khách và các lần sửa chữa trước đây. | Hiển thị đúng danh sách xe và lịch sử. | **PASS** |
| **TC_CUST_05** | Xem tiến độ sửa chữa xe thời gian thực | Xe đang có Lệnh sửa chữa trong xưởng | Vào `/app/customer/status` | Mã RO: `RO-20260501-001` | Hiển thị timeline tiến độ: Tiếp nhận xe -> Đang bảo dưỡng -> Hoàn thành. | Timeline mốc thời gian hiển thị chính xác. | **PASS** |
| **TC_CUST_06** | Khách hàng duyệt báo giá trực tuyến (`APPROVED`) | Báo giá đang ở trạng thái `SENT` | 1. Vào `/app/customer/quotes`<br>2. Xem chi tiết phụ tùng, tiền công<br>3. Bấm nút "Đồng ý báo giá" | Mã QT: `QT-20260501-001` | Báo giá chuyển trạng thái `APPROVED`, thông báo cho xưởng bắt đầu làm. | Trạng thái chuyển thành `APPROVED`. | **PASS** |
| **TC_CUST_07** | Khách hàng từ chối báo giá (`REJECTED`) | Báo giá đang ở trạng thái `SENT` | 1. Vào `/app/customer/quotes`<br>2. Bấm "Từ chối báo giá"<br>3. Nhập lý do từ chối | Lý do: "Chi phí phụ tùng vượt ngân sách" | Báo giá chuyển `REJECTED`, lưu lý do từ chối. Lịch hẹn bên xưởng hiển thị trạng thái "Khách từ chối báo giá". | Trạng thái chuyển `REJECTED`, lý do được lưu. | **PASS** |
| **TC_CUST_08** | Gửi đánh giá và chấm điểm dịch vụ | Xe đã được bàn giao (`DELIVERED`) | 1. Vào `/app/customer/rating`<br>2. Chọn số sao (1-5) và ghi nhận xét<br>3. Bấm "Gửi đánh giá" | Đánh giá: 5 sao<br>Nội dung: "Dịch vụ rất nhanh và nhiệt tình" | Lưu đánh giá vào hệ thống, hiển thị bên trang đánh giá của Admin. | Đánh giá được lưu thành công. | **PASS** |

---

### MODULE 3: PHÂN HỆ KỸ THUẬT VIÊN & XƯỞNG (STAFF)

| Mã TC | Tên chức năng | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_STAFF_01** | Xem Lịch làm việc cá nhân - Lọc xe của KTV khác | KTV Trần Minh Khoa phụ trách xe `59B-88888`; KTV Nguyễn Huy Hoàng đăng nhập | 1. Đăng nhập tài khoản KTV Nguyễn Huy Hoàng (`huyhoang123@gmail.com`)<br>2. Mở `/app/staff/schedule` | Tài khoản: Huy Hoàng (ID 3)<br>Xe kiểm tra: `59B-88888` (thuộc KTV Khoa ID 43) | Xe `59B-88888` **hoàn toàn KHÔNG xuất hiện** trên lịch của Huy Hoàng. Chỉ xuất hiện xe do Hoàng tiếp nhận hoặc xe chưa ai nhận. | Xe của KTV khác bị lọc bỏ chính xác 100%. | **PASS** |
| **TC_STAFF_02** | Xem Lịch làm việc cá nhân - Hiển thị đúng xe của mình | KTV Trần Minh Khoa phụ trách xe `59B-88888` | 1. Đăng nhập tài khoản KTV Trần Minh Khoa (`staff@garage.local`)<br>2. Mở `/app/staff/schedule` | Tài khoản: Minh Khoa (ID 43) | Xe `59B-88888` **hiển thị chính xác** trong danh sách lịch làm việc của Khoa. | Xe hiển thị đúng trên lịch của KTV phụ trách. | **PASS** |
| **TC_STAFF_03** | Tiếp nhận xe vào xưởng (Vehicle Intake) | Lịch hẹn ở trạng thái chờ tiếp nhận (`PENDING`) | 1. Mở `/app/staff/intake`<br>2. Chọn lịch hẹn `BK-...`<br>3. Ghi nhận tình trạng xe ban đầu<br>4. Bấm "Xác nhận tiếp nhận" | Lịch hẹn: `BK-20260501-002`<br>Số km: 45.000 km<br>Xăng: 50% | Hệ thống tạo Lệnh sửa chữa `RO-...`, gán KTV đang đăng nhập phụ trách, đổi trạng thái booking thành `CONFIRMED`. | Tiếp nhận thành công, sinh mã `RO` và gán đúng KTV. | **PASS** |
| **TC_STAFF_04** | Tự động loại bỏ xe đã tiếp nhận khỏi danh sách chờ | Lịch hẹn vừa được tiếp nhận ở TC_STAFF_03 | Kiểm tra danh sách dropdown "Chọn lịch hẹn chờ tiếp nhận" tại `/app/staff/intake` | Lịch hẹn vừa tiếp nhận | Lịch hẹn đó tự động biến mất khỏi danh sách chờ tiếp nhận (vì đã vào xưởng). | Danh sách chỉ còn các xe thực sự đang chờ tiếp nhận. | **PASS** |
| **TC_STAFF_05** | Lập bản báo giá chi tiết (Quote Builder) | Xe đã tiếp nhận vào xưởng (`RO` đang mở) | 1. Mở `/app/staff/quote`<br>2. Thêm dòng công thợ (Bảo dưỡng)<br>3. Thêm dòng phụ tùng (Dầu nhớt, lọc)<br>4. Bấm "Lưu bản nháp" | Tiền công: 300.000 đ<br>Dầu 5W-30: 180.000 đ<br>Lọc gió: 120.000 đ | Hệ thống tự động tính: Tiền công = 300k, Tiền vật tư = 300k, Tổng = 600k. Trạng thái `DRAFT`. | Tính toán tổng tiền tự động chính xác. | **PASS** |
| **TC_STAFF_06** | Gửi báo giá cho khách hàng duyệt | Bản báo giá đang ở trạng thái `DRAFT` | Bấm nút "Gửi báo giá cho khách" tại màn hình lập báo giá | Mã báo giá: `QT-...` | Trạng thái chuyển sang `SENT`, kích hoạt gửi Email chi tiết báo giá đến email của khách hàng. | Trạng thái chuyển `SENT`, email được gửi đi ngầm. | **PASS** |
| **TC_STAFF_07** | Gửi yêu cầu xin cấp phụ tùng từ kho (Parts Request) | Báo giá đã được duyệt (`APPROVED`) | 1. Mở `/app/staff/parts`<br>2. Chọn lệnh sửa chữa<br>3. Chọn phụ tùng: Má phanh x2<br>4. Bấm "Gửi yêu cầu kho" | Mã phụ tùng: `BRK-PAD-F`<br>Số lượng: 2 | Tạo phiếu yêu cầu mã `PR-...` với trạng thái `PENDING`, chuyển sang cho Admin duyệt. | Tạo phiếu yêu cầu kho thành công. | **PASS** |
| **TC_STAFF_08** | Cập nhật mốc tiến độ sửa chữa xưởng (Progress Event) | Xe đang trong quá trình bảo dưỡng | 1. Mở `/app/staff/progress`<br>2. Nhập tiêu đề mốc: "Đang thay má phanh"<br>3. Nhập ghi chú<br>4. Bấm "Cập nhật tiến độ" | Mốc: "Đang thay má phanh"<br>Ghi chú: "Đã tháo bánh, đang lắp má mới" | Ghi nhận sự kiện vào CSDL, tự động kích hoạt gửi email cập nhật cho khách hàng. | Cập nhật thành công, khách nhận email tiến độ. | **PASS** |
| **TC_STAFF_09** | Bàn giao xe cho khách hàng (Vehicle Handover) | Xe đã sửa xong, khách đã thanh toán | 1. Mở `/app/staff/handover`<br>2. Bấm "Xác nhận bàn giao xe cho khách" | Lệnh: `RO-20260501-001` | Lệnh sửa chữa chuyển `DELIVERED`, booking chuyển `COMPLETED`. Xe rời khỏi xưởng. | Bàn giao thành công, đóng chu trình sửa chữa. | **PASS** |
| **TC_STAFF_10** | Xem thời khóa biểu phân ca của nhân viên | Đã đăng nhập Staff | Mở `/app/staff/schedule` -> xem tab Lịch trực ca tuần | - | Hiển thị đúng ca trực từ thứ 2 đến thứ 7 (08:00 - 17:00). | Ca trực tuần hiển thị trực quan, chính xác. | **PASS** |

---

### MODULE 4: PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN)

| Mã TC | Tên chức năng | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_ADM_01** | Xem Dashboard tổng quan - 4 Thẻ chỉ số chính | Đã đăng nhập Admin | Mở `/app/admin` | Dữ liệu thực tế | Hiển thị đúng 4 chỉ số: Xe đang tại xưởng, Tổng lượt đặt lịch, Cảnh báo tồn kho thấp, Doanh thu tháng thực thu. | 4 thẻ số liệu nhảy số chính xác. | **PASS** |
| **TC_ADM_02** | Xem Biểu đồ Doanh thu theo nhóm dịch vụ (Donut Chart) | Đã có các báo giá được duyệt (`APPROVED`) | Mở `/app/admin` -> nhìn góc phải | Dữ liệu từ các Quote `APPROVED` | Hiển thị Top 6 dịch vụ mang lại doanh thu cao nhất, tâm biểu đồ hiển thị tổng số tiền chính xác (Ví dụ: `7.2tr`). | Biểu đồ tròn hiển thị đầy đủ Top 6 và tổng doanh thu. | **PASS** |
| **TC_ADM_03** | Lọc lịch hẹn toàn xưởng theo từng Kỹ thuật viên | Đã đăng nhập Admin | 1. Mở `/app/admin`<br>2. Tại dropdown "Nhân viên phụ trách", chọn "Trần Minh Khoa"<br>3. Chọn "Nguyễn Huy Hoàng" | Bộ lọc KTV | Danh sách lịch hẹn bên dưới tự động lọc đúng xe mà KTV được chọn đang phụ trách. | Lọc chính xác theo từng KTV. | **PASS** |
| **TC_ADM_04** | Loại bỏ nút thao tác KTV trên Dashboard Admin | Đã đăng nhập Admin | Mở `/app/admin` -> quan sát các thẻ lịch hẹn | Thẻ đơn hàng | Không còn xuất hiện các nút "Tiếp nhận xe" hay "Xem báo giá" của nhân viên (giữ giao diện Admin thuần theo dõi). | Các nút thao tác nhân viên đã được gỡ bỏ sạch sẽ. | **PASS** |
| **TC_ADM_05** | Quản lý kho phụ tùng & Cảnh báo tồn kho thấp | Đã đăng nhập Admin | Mở `/app/admin/inventory` | Phụ tùng có tồn kho <= mức tối thiểu | Danh sách hiển thị nhãn cảnh báo màu đỏ/vàng cho các phụ tùng sắp hết hàng. | Cảnh báo tồn kho hiển thị trực quan. | **PASS** |
| **TC_ADM_06** | Thêm mới phụ tùng vào kho | Đã đăng nhập Admin | 1. Mở `/app/admin/parts/new`<br>2. Nhập Mã SKU, Tên, Giá bán, Tồn kho<br>3. Bấm "Lưu phụ tùng" | SKU: `SPK-NGK`<br>Tên: Bugi NGK Iridium<br>Giá: 220.000 đ<br>SL: 20 | Thêm mới thành công, phụ tùng lập tức xuất hiện trong kho và bảng lập báo giá. | Phụ tùng mới được lưu vào CSDL. | **PASS** |
| **TC_ADM_07** | Duyệt phiếu cấp phát phụ tùng cho xưởng | Có phiếu yêu cầu phụ tùng đang ở trạng thái `PENDING` | 1. Mở `/app/admin/parts-requests`<br>2. Xem danh sách yêu cầu từ thợ<br>3. Bấm nút "Duyệt cấp phát" | Phiếu: `PR-...` | Phiếu chuyển sang `APPROVED`, tự động trừ số lượng tồn kho tương ứng trong bảng `parts`. | Phiếu được duyệt, tồn kho trừ tự động. | **PASS** |
| **TC_ADM_08** | Cấu hình bật/tắt sự kiện thông báo tự động | Đã đăng nhập Admin | 1. Mở `/app/admin/notifications`<br>2. Bật/tắt sự kiện `BOOKING_CONFIRMED`<br>3. Bấm "Lưu cấu hình sự kiện" | Sự kiện: `BOOKING_CONFIRMED` | Lưu trạng thái vào bảng `notification_settings`, hệ thống tuân thủ theo cài đặt mới. | Cấu hình được lưu thành công vào CSDL. | **PASS** |

---

### MODULE 5: TÍCH HỢP HỆ THỐNG THỨ BA (VNPAY & GMAIL SMTP)

| Mã TC | Tên chức năng | Điều kiện tiên quyết | Các bước thực hiện | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **TC_INT_01** | Tạo đường dẫn thanh toán VNPAY trực tuyến | Lệnh sửa chữa hoàn thành, có hóa đơn thanh toán | 1. Khách hàng vào `/app/customer/payment`<br>2. Chọn phương thức "VNPAY Online"<br>3. Bấm "Thanh toán qua VNPAY" | Số tiền: 830.000 đ<br>Cổng: VNPAY Sandbox | Backend sinh URL thanh toán hợp lệ với chữ ký HMAC-SHA512, chuyển hướng sang cổng VNPAY. | Chuyển hướng thành công sang trang thanh toán VNPAY. | **PASS** |
| **TC_INT_02** | Xử lý phản hồi thanh toán thành công từ VNPAY (IPN/Return) | Đang ở trang giả lập VNPAY Sandbox | 1. Chọn ngân hàng NCB Sandbox<br>2. Nhập thông tin thẻ test<br>3. Xác nhận OTP thanh toán | Thẻ: `9704198526191432198`<br>OTP: `123456` | VNPAY trả kết quả về `/api/payments/vnpay-return`, backend kiểm tra checksum đúng, cập nhật `PaymentStatus = COMPLETED`. | Giao dịch hoàn tất, trạng thái thanh toán chuyển `COMPLETED`. | **PASS** |
| **TC_INT_03** | Kiểm tra trạng thái máy chủ gửi Email SMTP | Đã cấu hình tài khoản Gmail và App Password | Mở trang `/app/admin/notifications` | Máy chủ: `smtp.gmail.com:587` | Khung trạng thái hiển thị: "● Đã cấu hình tài khoản gửi thư", hiển thị đúng máy chủ và tài khoản gửi đã che mặt nạ (`ha***@gmail.com`). | Hiển thị đúng trạng thái đã cấu hình. | **PASS** |
| **TC_INT_04** | Gửi Email kiểm tra kết nối thực tế (Test Email) | Backend kết nối Internet | 1. Vào `/app/admin/notifications`<br>2. Nhập email nhận thật<br>3. Bấm "Gửi email kiểm tra" | Email nhận: `hacamdat2003@gmail.com` | Backend gửi email qua Gmail SMTP thành công, trả về HTTP 200: "Email thử nghiệm đã được gửi thành công...". Hộp thư người nhận có email thật. | Email gửi thành công 100%, hộp thư Gmail nhận được thư. | **PASS** |

---

## 3. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG HỆ THỐNG

1. **Độ bao phủ kiểm thử (Test Coverage)**: Toàn bộ 36 kịch bản kiểm thử bao phủ 100% các nghiệp vụ cốt lõi từ lúc khách đặt lịch, qua các bước tại xưởng (tiếp nhận, báo giá, phụ tùng, tiến độ), cho đến lúc thanh toán VNPAY, bàn giao xe và gửi email thông báo.
2. **Tỷ lệ vượt qua (Pass Rate)**: **36 / 36 Test Cases (100% PASS)**, không có lỗi nghiêm trọng (Blocker/Critical) nào tồn đọng.
3. **Độ ổn định & An toàn**:
   * Cơ chế phân quyền RBAC và Stateless JWT hoạt động chặt chẽ, ngăn chặn mọi hành vi leo thang đặc quyền.
   * Xử lý bất đồng bộ `@Async` cho Email giúp hệ thống chạy nhanh và chống treo ứng dụng khi mạng gặp sự cố.
   * Các nghiệp vụ toàn vẹn dữ liệu (chống trùng lịch, tự động trừ tồn kho, tính toán tiền) vận hành trơn tru và chính xác tuyệt đối.
