# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP / ĐỒ ÁN CHUYÊN NGÀNH
# ĐỀ TÀI: XÂY DỰNG HỆ THỐNG QUẢN LÝ XƯỞNG DỊCH VỤ VÀ CHĂM SÓC Ô TÔ THÔNG MINH (OTO GARAGE AUTO CARE)

---

## MỤC LỤC
1. [CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI](#chương-1-tổng-quan-đề-tài)
   - 1.1. Lý do chọn đề tài & Tính cấp thiết
   - 1.2. Mục tiêu nghiên cứu
   - 1.3. Đối tượng và phạm vi nghiên cứu
   - 1.4. Bố cục báo cáo
2. [CHƯƠNG 2: PHÂN TÍCH NGHIỆP VỤ & KHẢO SÁT HIỆN TRẠNG](#chương-2-phân-tích-nghiệp-vụ--khảo-sát-hiện-trạng)
   - 2.1. Khảo sát quy trình quản lý xưởng truyền thống
   - 2.2. Các bất cập và thách thức
   - 2.3. Giải pháp chuyển đổi số với hệ thống OTO Garage
   - 2.4. Xác định các tác nhân hệ thống (Actors)
3. [CHƯƠNG 3: YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS)](#chương-3-yêu-cầu-hệ-thống-system-requirements)
   - 3.1. Yêu cầu chức năng (Functional Requirements)
   - 3.2. Yêu cầu phi chức năng (Non-Functional Requirements)
4. [CHƯƠNG 4: KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ SỬ DỤNG](#chương-4-kiến-trúc-hệ-thống--công-nghệ-sử-dụng)
   - 4.1. Kiến trúc tổng thể hệ thống (System Architecture)
   - 4.2. Công nghệ Frontend (React + Vite + TypeScript)
   - 4.3. Công nghệ Backend (Spring Boot 3 + Spring Security + JWT)
   - 4.4. Hệ quản trị cơ sở dữ liệu (MySQL 8 + Flyway)
   - 4.5. Hạ tầng đóng gói Docker & Containerization
   - 4.6. Tích hợp bên thứ ba (Third-party Services: VNPAY & Gmail SMTP)
5. [CHƯƠNG 5: THIẾT KẾ HỆ THỐNG & CƠ SỞ DỮ LIỆU](#chương-5-thiết-kế-hệ-thống--cơ-sở-dữ-liệu)
   - 5.1. Sơ đồ Use Case tổng quát
   - 5.2. Thiết kế Cơ sở dữ liệu (Database Schema / ERD)
   - 5.3. Mô tả chi tiết các bảng dữ liệu chính
   - 5.4. Sơ đồ tuần tự các luồng nghiệp vụ trọng tâm (Sequence Diagrams)
6. [CHƯƠNG 6: HIỆN THỰC HỆ THỐNG & KẾT QUẢ ĐẠT ĐƯỢC](#chương-6-hiện-thực-hệ-thống--kết-quả-đạt-được)
   - 6.1. Phân hệ Khách hàng (Customer Portal)
   - 6.2. Phân hệ Kỹ thuật viên / Nhân viên (Staff / Technician Workspace)
   - 6.3. Phân hệ Quản trị viên (Admin Management Dashboard)
   - 6.4. Xử lý nghiệp vụ nâng cao (Báo giá, Phụ tùng, Thanh toán, Email)
7. [CHƯƠNG 7: KIỂM THỬ HỆ THỐNG (TESTING & EVALUATION)](#chương-7-kiểm-thử-hệ-thống-testing--evaluation)
   - 7.1. Chiến lược và phương pháp kiểm thử
   - 7.2. Bảng ma trận kịch bản kiểm thử (Test Cases)
   - 7.3. Kết quả đánh giá chất lượng
8. [CHƯƠNG 8: KẾT LUẬN & HƯỚNG PHÁT TRIỂN](#chương-8-kết-luận--hướng-phát-triển)
   - 8.1. Các kết quả đã đạt được
   - 8.2. Hạn chế còn tồn tại
   - 8.3. Đề xuất hướng phát triển tương lai
9. [PHỤ LỤC: HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI](#phụ-lục-hướng-dẫn-cài-đặt--triển-khai)

---

# CHƯƠNG 1: TỔNG QUAN ĐỀ TÀI

### 1.1. Lý do chọn đề tài & Tính cấp thiết
Trong những năm gần đây, tốc độ gia tăng phương tiện ô tô cá nhân tại Việt Nam phát triển với tốc độ nhanh chóng. Cùng với đó, nhu cầu bảo dưỡng, sửa chữa, chăm sóc xe định kỳ ngày càng đòi hỏi tính chuyên nghiệp, minh bạch và tiện lợi. 

Tuy nhiên, phần lớn các garage và trung tâm chăm sóc xe (Auto Care/Detailing) hiện nay vẫn đang vận hành theo phương thức truyền thống:
- Tiếp nhận xe thủ công bằng sổ sách hoặc bảng tính Excel phân mảnh.
- Khách hàng không nắm bắt được tiến độ sửa chữa, phụ tùng thay thế và báo giá cụ thể, dẫn đến tâm lý thiếu tin tưởng.
- Quản lý kho phụ tùng lỏng lẻo gây thất thoát hoặc thiếu hụt linh kiện khi thi công.
- Chưa ứng dụng thanh toán không tiền mặt và thiếu hệ thống tự động thông báo đa kênh.

Xuất phát từ thực tế đó, đề tài **"Xây dựng hệ thống quản lý xưởng dịch vụ và chăm sóc ô tô thông minh - OTO Garage Auto Care"** được lựa chọn nhằm cung cấp một giải pháp phần mềm toàn diện, chuẩn hóa toàn bộ quy trình tiếp nhận, báo giá, điều phối kỹ thuật viên, quản lý vật tư và thanh toán trực tuyến.

### 1.2. Mục tiêu nghiên cứu
- **Mục tiêu tổng quát**: Xây dựng một ứng dụng web hướng dịch vụ hiện đại, giúp số hóa 100% quy trình vận hành của một xưởng dịch vụ ô tô, kết nối chặt chẽ giữa khách hàng, kỹ thuật viên và ban quản lý xưởng.
- **Mục tiêu cụ thể**:
  1. Xây dựng cổng thông tin khách hàng cho phép đặt lịch online, theo dõi nhật ký tiến độ xe theo thời gian thực và đánh giá chất lượng dịch vụ.
  2. Xây dựng không gian làm việc cho kỹ thuật viên: theo dõi lịch ca trực, lập báo giá phụ tùng - tiền công, gửi yêu cầu vật tư và cập nhật tiến độ thi công.
  3. Xây dựng hệ thống quản trị dành cho Admin: điều phối nhân sự, kiểm soát kho phụ tùng ngưỡng an toàn, phê duyệt vật tư, thống kê doanh thu theo thời gian thực và quản lý cài đặt thông báo tự động.
  4. Tích hợp thanh toán trực tuyến qua cổng **VNPAY Sandbox** và hệ thống gửi thư điện tử tự động qua **Gmail SMTP**.

### 1.3. Đối tượng và phạm vi nghiên cứu
- **Đối tượng nghiên cứu**: Nghiệp vụ tiếp nhận xe, lập báo giá kỹ thuật, quản lý kho vật tư phụ tùng, thanh toán hóa đơn và kiến trúc ứng dụng web Single Page Application kết hợp RESTful API.
- **Phạm vi ứng dụng**: Áp dụng cho các xưởng bảo dưỡng, trung tâm chăm sóc ô tô (Auto Care) quy mô từ vừa đến lớn.

---

# CHƯƠNG 2: PHÂN TÍCH NGHIỆP VỤ & KHẢO SÁT HIỆN TRẠNG

### 2.1. Khảo sát quy trình quản lý xưởng truyền thống
Một chu trình dịch vụ truyền thống thường trải qua các bước:
1. Khách hàng mang xe đến xưởng không đặt trước, dễ gặp tình trạng quá tải hoặc chờ đợi lâu.
2. Cố vấn dịch vụ ghi nhận yêu cầu vào phiếu giấy.
3. Kỹ thuật viên kiểm tra sơ bộ và báo miệng hoặc viết giấy báo giá.
4. Quản lý kho phát phụ tùng dựa trên phiếu viết tay, dễ sai sót mã hàng và tồn kho.
5. Sau khi sửa chữa xong, khách hàng đến xưởng thanh toán tiền mặt và nhận xe.

### 2.2. Các bất cập và thách thức
- **Thiếu tính minh bạch**: Khách hàng không thể kiểm tra chi tiết giá phụ tùng, tiền công và tiến độ thực tế nếu không trực tiếp đứng tại xưởng.
- **Nghẽn thông tin nội bộ**: Kỹ thuật viên và thủ kho không đồng bộ dữ liệu theo thời gian thực, dẫn đến tình trạng xuất nhầm vật tư hoặc hết hàng đột xuất.
- **Khó khăn trong quản trị doanh thu**: Ban giám đốc xưởng mất nhiều ngày để tổng hợp doanh thu, phân loại nhóm dịch vụ sinh lời và đánh giá năng suất từng thợ.

### 2.3. Giải pháp chuyển đổi số với hệ thống OTO Garage
Hệ thống OTO Garage giải quyết toàn bộ bài toán trên bằng cách:
- Cung cấp cổng đặt lịch trực tuyến theo khung giờ, chọn trước dịch vụ và gán xe sở hữu.
- Quy trình Báo giá số (Digital Quote): Báo giá điện tử chi tiết từng dòng (vật tư, nhân công) gửi thẳng tới tài khoản và email khách hàng để khách hàng chủ động bấm "Đồng ý" hoặc "Từ chối".
- Cập nhật tiến độ dạng Timeline trực quan có mốc thời gian và ghi chú của thợ.
- Kho phụ tùng cảnh báo tự động khi số lượng tồn dưới ngưỡng tối thiểu (`min_stock_alert`).
- Thanh toán linh hoạt bằng quét mã QR/thẻ ngân hàng qua VNPAY hoặc tiền mặt.

### 2.4. Xác định các tác nhân hệ thống (Actors)
1. **Khách hàng (Customer)**: Chủ sở hữu xe ô tô, sử dụng dịch vụ của xưởng.
2. **Kỹ thuật viên / Nhân viên (Staff / Technician)**: Cố vấn kỹ thuật, thợ máy, thợ gầm, thợ điện lạnh trực tiếp thi công và xử lý lệnh sửa chữa.
3. **Quản trị viên (Admin / Garage Manager)**: Giám đốc xưởng, kế toán trưởng quản lý tổng thể tài nguyên, tài chính và phân quyền.
4. **Hệ thống bên ngoài (External Services)**: Cổng thanh toán VNPAY và Máy chủ thư điện tử Gmail SMTP.

---

# CHƯƠNG 3: YÊU CẦU HỆ THỐNG (SYSTEM REQUIREMENTS)

### 3.1. Yêu cầu chức năng (Functional Requirements)

#### A. Phân hệ Xác thực & Tài khoản (Authentication & Authorization)
- Đăng ký tài khoản khách hàng mới kèm số điện thoại, email, họ tên.
- Đăng nhập hệ thống xác thực qua chuẩn JWT (JSON Web Token).
- Phân quyền theo vai trò (Role-Based Access Control - RBAC): `ROLE_CUSTOMER`, `ROLE_STAFF`, `ROLE_ADMIN`.
- Đổi mật khẩu, xem và cập nhật hồ sơ cá nhân.

#### B. Phân hệ Khách hàng (Customer Portal)
- **Quản lý gara cá nhân**: Thêm, sửa, xóa thông tin xe (Biển số, Hãng xe, Dòng xe, Năm sản xuất, Số khung VIN, Màu sơn).
- **Đặt lịch hẹn trực tuyến**: Chọn xe, chọn gói dịch vụ từ catalog, chọn ngày hẹn, khung giờ còn trống và để lại ghi chú triệu chứng hỏng hóc.
- **Quản lý báo giá dịch vụ**: Nhận thông báo khi có báo giá, xem chi tiết từng phụ tùng thay thế và tiền công, thao tác bấm Duyệt báo giá (Approve) hoặc Từ chối (Reject) kèm lý do.
- **Theo dõi tiến độ sửa chữa**: Xem nhật ký tiến độ từng bước (Tiếp nhận $\rightarrow$ Kiểm tra $\rightarrow$ Đang thi công $\rightarrow$ Hoàn thành $\rightarrow$ Sẵn sàng bàn giao).
- **Thanh toán trực tuyến**: Chọn hóa đơn cần thanh toán, thanh toán qua cổng VNPAY Sandbox hoặc chọn thanh toán tiền mặt tại quầy.
- **Đánh giá & Phản hồi**: Chấm điểm sao (1 - 5 sao) và để lại nhận xét chất lượng dịch vụ sau khi nhận bàn giao xe.

#### C. Phân hệ Kỹ thuật viên / Nhân viên (Staff Workspace)
- **Lịch làm việc**: Tra cứu lịch ca trực cá nhân trong tuần (Ca sáng, Ca chiều, Ca tối) do Quản trị viên phân công.
- **Quản lý lệnh sửa chữa (Repair Orders)**:
  - Tiếp nhận lịch hẹn của khách hàng chuyển thành Lệnh sửa chữa.
  - Cập nhật trạng thái lệnh: `INTAKE` (Tiếp nhận), `QUOTING` (Lập báo giá), `IN_PROGRESS` (Đang sửa), `COMPLETED` (Xong), `DELIVERED` (Đã giao xe).
- **Lập báo giá (Quote Builder)**: Tạo bảng báo giá gồm các hạng mục tiền công và phụ tùng, hệ thống tự động tính thuế VAT và tổng thanh toán, chuyển trạng thái sang `SENT` để gửi cho khách.
- **Yêu cầu xuất kho phụ tùng (Parts Request)**: Gửi phiếu yêu cầu cấp vật tư từ kho trung tâm kèm số lượng và lý do phục vụ lệnh sửa chữa.
- **Ghi nhận tiến độ thi công**: Đăng bài cập nhật mốc thời gian kèm nội dung công việc đã hoàn thành để khách hàng theo dõi.

#### D. Phân hệ Quản trị viên (Admin Management)
- **Bảng điều khiển thông minh (Admin Dashboard)**: Thống kê số lượng lệnh theo từng trạng thái, doanh thu hôm nay, cảnh báo số phụ tùng sắp hết hàng và số phiếu vật tư chờ duyệt.
- **Báo cáo & Phân tích tài chính**:
  - Biểu đồ biến động doanh thu theo ngày (Daily Revenue Trend).
  - Biểu đồ cơ cấu doanh thu theo nhóm dịch vụ (Bảo dưỡng định kỳ, Sửa chữa chung, Chăm sóc xe, v.v.).
- **Quản lý danh mục dịch vụ (Service Catalog)**: Thiết lập đơn giá tiêu chuẩn, thời gian thực hiện ước tính và nhóm dịch vụ.
- **Quản lý kho phụ tùng & Vật tư**: Quản lý mã SKU, tên phụ tùng, số lượng tồn kho, giá vốn, giá bán lẻ, ngưỡng cảnh báo tồn tối thiểu. Duyệt hoặc từ chối phiếu yêu cầu vật tư của kỹ thuật viên.
- **Quản lý nhân sự & Phân ca**: Quản lý danh sách nhân viên kỹ thuật, phân ca làm việc chi tiết theo từng ngày trong tuần.
- **Cấu hình thông báo & SMTP**: Bật/tắt các sự kiện gửi thông báo (Xác nhận lịch hẹn, Báo giá sẵn sàng, Tiến độ thi công), cấu hình máy chủ SMTP Gmail và công cụ gửi email kiểm tra kết nối.

### 3.2. Yêu cầu phi chức năng (Non-Functional Requirements)
- **Tính bảo mật (Security)**: Mật khẩu người dùng được băm một chiều bằng thuật toán BCrypt. Các API bảo mật thông qua Access Token JWT với chữ ký HMAC-SHA512. Áp dụng CORS ngăn chặn truy cập trái phép từ domain lạ.
- **Tính sẵn sàng & Hiệu năng (Performance & Availability)**: Thời gian phản hồi API trung bình dưới 200ms. Luồng gửi email tách biệt bằng kỹ thuật bất đồng bộ `@Async` tránh nghẽn thread chính.
- **Tính khả chuyển (Portability)**: Đóng gói hoàn chỉnh trong Docker Containers, dễ dàng triển khai trên bất kỳ hệ điều hành nào chỉ với một lệnh `docker compose up`.
- **Tính thân thiện & Tương thích (UX/UI & Responsiveness)**: Giao diện thiết kế theo chuẩn Modern Flat Design, bảng màu tím đậm sang trọng (`#533c6e`), tương thích tốt trên cả màn hình máy tính bàn, laptop và thiết bị di động.

---

# CHƯƠNG 4: KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ SỬ DỤNG

### 4.1. Kiến trúc tổng thể hệ thống (System Architecture)
Hệ thống được thiết kế theo mô hình **Client - Server hiện đại** tách biệt hoàn toàn giữa Frontend và Backend (Decoupled Architecture):

```
+-------------------------------------------------------------------------+
|                              CLIENT TIER                                |
|   Single Page Application (React 18 + Vite + TypeScript + Tailwind CSS) |
+------------------------------------+------------------------------------+
                                     |  REST API (JSON over HTTP/HTTPS)
                                     |  Bearer JWT Authentication
                                     v
+-------------------------------------------------------------------------+
|                           APPLICATION TIER                              |
|           Spring Boot 3.2.5 (Java 17) - Embedded Apache Tomcat          |
|  - Security Filter Chain: JwtAuthenticationFilter                       |
|  - Controllers: RESTful API Layer                                       |
|  - Service Layer: Business Logic & Transaction Management               |
|  - Asynchronous Mail Worker Thread Pool (@Async)                        |
|  - Data Access Layer: Spring Data JPA (Hibernate 6.4)                   |
+-------------------+---------------------------------+-------------------+
                    |                                 |
     HikariCP Pool  | JDBC                            | SMTP (TLS 587)
                    v                                 v
+-------------------+-----------------+   +-----------+-------------------+
|            DATA TIER                |   |        THIRD-PARTY TIER       |
|    MySQL 8.4 RDBMS (Docker)         |   | - Gmail SMTP (Auto Mailer)    |
|    Flyway Schema Migration Engine   |   | - VNPAY Gateway (Sandbox)     |
+-------------------------------------+   +-------------------------------+
```

### 4.2. Công nghệ Frontend
- **Framework & Core**: React 18 kết hợp TypeScript đảm bảo an toàn kiểu dữ liệu (Type Safety) ngay từ thời điểm biên dịch.
- **Công cụ đóng gói**: Vite 5 cho tốc độ Hot Module Replacement (HMR) và thời gian build tối ưu (< 9 giây).
- **Giao diện & Styling**: Tailwind CSS kết hợp thư viện biểu tượng vector Lucide React, thiết kế giao diện theo phong cách sang trọng, bảng màu đồng bộ.
- **Giao tiếp mạng**: Thư viện Axios tích hợp HTTP Interceptor tự động đính kèm `Authorization: Bearer <token>` và bắt lỗi 401 Unauthorized để điều hướng đăng nhập.

### 4.3. Công nghệ Backend
- **Nền tảng**: Java 17 LTS và Spring Boot 3.2.5.
- **Bảo mật**: Spring Security 6 cấu hình `SessionCreationPolicy.STATELESS`. Triển khai Custom Filter `JwtAuthenticationFilter` giải mã và xác thực token trên mỗi request.
- **Tương tác CSDL**: Spring Data JPA dựa trên Hibernate ORM 6.4. Cơ chế `@Transactional` quản lý tính trọn vẹn (Atomicity) của giao dịch.
- **Xử lý bất đồng bộ**: Sử dụng `@EnableAsync` và `@Async` cho các tác vụ tốn thời gian như kết nối máy chủ gửi email.

### 4.4. Hệ quản trị cơ sở dữ liệu
- **Hệ quản trị**: MySQL 8.x cài đặt bảng mã `utf8mb4` hỗ trợ đầy đủ tiếng Việt có dấu.
- **Quản lý phiên bản CSDL (Migration)**: Sử dụng **Flyway Community Edition** để quản lý lịch sử tiến hóa của CSDL qua các file migration SQL (`V1__initial_schema.sql`), đảm bảo tính nhất quán trên mọi môi trường triển khai.

### 4.5. Hạ tầng đóng gói Docker & Containerization
Dự án được cấu hình sẵn trong [`docker-compose.yml`](file:///f:/OTO/docker-compose.yml) gồm 3 container liên kết qua mạng nội bộ ảo `oto_network`:
1. `oto_mysql`: Container chạy MySQL 8 trên port ánh xạ 3308, dữ liệu lưu bền vững trong Docker Volume `mysql_data`.
2. `oto_backend`: Container chạy Java 17 Alpine, đóng gói ứng dụng Spring Boot JAR hoàn chỉnh, có cơ chế `depends_on` chờ MySQL khởi động thành công (`service_healthy`).
3. `oto_frontend`: Container đóng gói Nginx phục vụ mã tĩnh React Single Page App trên port 80/5173.

### 4.6. Tích hợp bên thứ ba (Third-party Services)
1. **Cổng thanh toán VNPAY Sandbox**:
   - Tích hợp chuẩn thanh toán `paymentv2/vpcpay.html`.
   - Sinh mã băm bảo mật SHA-512 với `vnp_HashSecret` để chống giả mạo chữ ký giao dịch.
   - Xử lý đồng thời cả hai luồng:
     - `vnp_ReturnUrl`: Khách hàng hoàn tất thanh toán trên giao diện VNPAY và được chuyển hướng về trang xác nhận kết quả của Garage.
     - `vnp_IpnUrl`: Webhook thông báo ngầm từ máy chủ VNPAY đến backend Garage để cập nhật trạng thái thanh toán tự động ngay cả khi người dùng tắt trình duyệt.
2. **Máy chủ gửi thư điện tử Gmail SMTP**:
   - Sử dụng máy chủ `smtp.gmail.com` qua cổng 587 bảo mật giao thức STARTTLS.
   - Ứng dụng mật khẩu ứng dụng (App Password) chuyên biệt đảm bảo an toàn tài khoản chính.
   - Giao diện email định dạng HTML chuẩn chuyên nghiệp mang bộ nhận diện thương hiệu OTO Garage Auto Care.

---

# CHƯƠNG 5: THIẾT KẾ HỆ THỐNG & CƠ SỞ DỮ LIỆU

### 5.1. Sơ đồ Use Case tổng quát
Hệ thống phân rã thành các nhóm Use Case chính:
- **Nhóm Use Case Xác thực**: Đăng ký, Đăng nhập, Đổi mật khẩu, Lấy thông tin cá nhân.
- **Nhóm Use Case Khách hàng**: Quản lý hồ sơ xe, Đặt lịch dịch vụ, Xem báo giá, Duyệt/Từ chối báo giá, Xem tiến độ sửa xe, Thanh toán VNPAY, Đánh giá dịch vụ.
- **Nhóm Use Case Nhân viên**: Xem lịch làm việc cá nhân, Tiếp nhận lịch hẹn, Lập báo giá phụ tùng - tiền công, Gửi yêu cầu cấp phụ tùng, Cập nhật tiến độ thi công, Bàn giao xe.
- **Nhóm Use Case Quản trị viên**: Xem Dashboard KPI, Xem biểu đồ doanh thu theo ngày và theo nhóm dịch vụ, Quản lý danh mục dịch vụ, Quản lý kho phụ tùng, Duyệt xuất kho phụ tùng, Quản lý tài khoản nhân viên, Phân ca làm việc, Cài đặt thông báo & máy chủ gửi email.

### 5.2. Thiết kế Cơ sở dữ liệu (Database Schema / ERD)
Cơ sở dữ liệu của OTO Garage bao gồm 15 bảng liên kết chặt chẽ:

```
[users] 1 ----- n [user_roles] n ----- 1 [roles]
   |
   +----- 1:n -----> [vehicles] 1:n -----> [bookings]
   |                                          |
   +----- 1:n -----> [repair_orders] <-------+ (1:1 optional)
   |                    |        |
   |                    |        +--- 1:1 ---> [quotes] 1:n ---> [quote_lines]
   |                    |        |                                    |
   |                    |        +--- 1:n ---> [repair_progress_events]
   |                    |        |
   |                    |        +--- 1:n ---> [payments]
   |                    |        |
   |                    |        +--- 1:1 ---> [ratings]
   |                    v
   +----- 1:n -----> [parts_requests] n:1 ---> [parts]
   |
   +----- 1:n -----> [work_schedules]

[service_catalog] 1:n ---> [bookings]
[notification_settings] (Bảng độc lập lưu cấu hình thông báo)
```

### 5.3. Mô tả chi tiết các bảng dữ liệu chính

1. **`users`**: Lưu trữ thông tin tài khoản người dùng
   - `id` (BIGINT, PK, Auto Increment)
   - `email` (VARCHAR(191), Unique): Địa chỉ email đăng nhập
   - `password_hash` (VARCHAR(255)): Mật khẩu đã mã hóa BCrypt
   - `full_name` (VARCHAR(120)): Họ và tên đầy đủ
   - `phone` (VARCHAR(30)): Số điện thoại liên lạc
   - `status` (VARCHAR(30)): Trạng thái tài khoản (`ACTIVE`, `INACTIVE`)
   - `created_at`, `updated_at` (DATETIME)

2. **`vehicles`**: Quản lý thông tin phương tiện của khách hàng
   - `id` (BIGINT, PK)
   - `customer_id` (BIGINT, FK -> users.id): Chủ sở hữu xe
   - `license_plate` (VARCHAR(30)): Biển kiểm soát xe
   - `brand` (VARCHAR(60)): Hãng sản xuất (Toyota, Honda, Mercedes, v.v.)
   - `model` (VARCHAR(60)): Dòng xe (Vios, Civic, C200, v.v.)
   - `model_year` (INT): Năm sản xuất
   - `vin_number` (VARCHAR(60)): Số khung/VIN
   - `color` (VARCHAR(40)): Màu sơn xe

3. **`service_catalog`**: Danh mục dịch vụ chuẩn của gara
   - `id` (BIGINT, PK)
   - `name` (VARCHAR(150)): Tên dịch vụ
   - `service_group` (VARCHAR(60)): Nhóm dịch vụ (Bảo dưỡng, Sửa gầm, Điện lạnh...)
   - `base_price` (DECIMAL(12,2)): Giá niêm yết tiêu chuẩn
   - `estimated_minutes` (INT): Thời gian thi công dự kiến (phút)
   - `description` (TEXT): Chi tiết các bước thực hiện

4. **`bookings`**: Quản lý lịch hẹn bảo dưỡng - sửa chữa
   - `id` (BIGINT, PK)
   - `booking_number` (VARCHAR(40), Unique): Mã phiếu đặt lịch (Ví dụ: `BK-20260907-001`)
   - `customer_id` (BIGINT, FK -> users.id)
   - `vehicle_id` (BIGINT, FK -> vehicles.id)
   - `service_catalog_id` (BIGINT, FK -> service_catalog.id)
   - `requested_date` (DATE): Ngày khách hẹn mang xe đến
   - `time_slot` (VARCHAR(20)): Khung giờ (08:00 - 09:30, 09:30 - 11:00...)
   - `status` (VARCHAR(30)): `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`
   - `notes` (TEXT): Triệu chứng xe hoặc yêu cầu riêng của khách

5. **`repair_orders`**: Lệnh sửa chữa - xương sống của quy trình vận hành
   - `id` (BIGINT, PK)
   - `order_number` (VARCHAR(40), Unique): Mã lệnh sửa chữa (Ví dụ: `RO-20260907-001`)
   - `customer_id`, `vehicle_id`, `booking_id` (FKs)
   - `assigned_technician_id` (BIGINT, FK -> users.id): Kỹ thuật viên chính phụ trách
   - `status` (VARCHAR(40)): Trạng thái (`INTAKE`, `QUOTING`, `AWAITING_APPROVAL`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `DELIVERED`, `CANCELLED`)
   - `odometer_in` (INT): Số km hiển thị trên đồng hồ khi nhận xe
   - `fuel_level_in` (VARCHAR(30)): Mức nhiên liệu khi nhận xe
   - `created_at`, `delivered_at` (DATETIME)

6. **`quotes` & `quote_lines`**: Quản lý báo giá chi tiết
   - `quotes`: `id`, `repair_order_id`, `quote_number`, `status` (`DRAFT`, `SENT`, `APPROVED`, `REJECTED`), `labor_total`, `parts_total`, `tax_amount`, `grand_total`, `customer_response_note`, `sent_at`, `approved_at`.
   - `quote_lines`: `id`, `quote_id`, `line_type` (`LABOR` hoặc `PART`), `part_id` (FK -> parts.id, có thể null nếu là tiền công), `item_name`, `quantity`, `unit_price`, `subtotal`.

7. **`parts` & `parts_requests`**: Quản lý kho và yêu cầu vật tư
   - `parts`: `id`, `sku_code`, `name`, `category`, `unit`, `cost_price`, `retail_price`, `stock_quantity`, `min_stock_alert`.
   - `parts_requests`: `id`, `repair_order_id`, `part_id`, `requested_by_id`, `quantity`, `status` (`PENDING`, `APPROVED`, `REJECTED`), `response_note`.

8. **`repair_progress_events`**: Nhật ký tiến độ sửa chữa
   - `id`, `repair_order_id`, `step_label` (Tên giai đoạn), `message` (Mô tả công việc), `created_by_id`, `created_at`.

9. **`payments`**: Quản lý giao dịch thanh toán
   - `id`, `repair_order_id`, `payment_method` (`VNPAY`, `CASH`, `BANK_TRANSFER`), `amount`, `status` (`PENDING`, `SUCCESS`, `FAILED`), `transaction_reference`, `paid_at`.

10. **`work_schedules`**: Phân ca làm việc của kỹ thuật viên
    - `id`, `staff_id` (FK -> users.id), `work_date` (DATE), `shift_name` (`MORNING`, `AFTERNOON`, `NIGHT`), `status` (`SCHEDULED`, `COMPLETED`, `ABSENT`).

11. **`notification_settings`**: Cài đặt thông báo tự động
    - `id`, `event_key` (`BOOKING_CONFIRMED`, `QUOTE_READY`, `REPAIR_STATUS`), `event_name`, `channel` (`EMAIL`), `is_enabled` (BOOLEAN).

### 5.4. Sơ đồ tuần tự các luồng nghiệp vụ trọng tâm (Sequence Diagrams)

#### A. Luồng Đặt lịch & Xác nhận tự động qua Email:
```
Khách hàng            Frontend                 Backend                  CSDL (MySQL)           Gmail SMTP
    |                     |                       |                          |                      |
    |-- Chọn xe, dịch vụ, |                       |                          |                      |
    |   ngày & giờ ------>|                       |                          |                      |
    |                     |-- POST /api/customer/-|                          |                      |
    |                     |   bookings ---------->|                          |                      |
    |                     |                       |-- Kiểm tra slot trống--->|                      |
    |                     |                       |-- INSERT vào bookings -->|                      |
    |                     |                       |                          |                      |
    |                     |                       |-- Gọi @Async gửi email ------------------------>|
    |                     |<-- Trả về 201 Created-|                          |                      | (Gửi ngầm không chặn)
    |<-- Hiển thị thông---|                       |                          |                      |
    |    báo thành công   |                       |                          |                      |--> [Gửi tới hộp thư
    |                     |                       |                          |                            khách hàng]
```

#### B. Luồng Lập & Duyệt báo giá trực tuyến:
```
Kỹ thuật viên              Frontend (Staff)         Backend               Khách hàng (Customer)
      |                            |                   |                            |
      |-- Nhập tiền công & vật tư->|                   |                            |
      |-- Bấm "Gửi khách hàng" --->|                   |                            |
      |                            |-- POST /quotes/---|                            |
      |                            |   {id}/send ----->|                            |
      |                            |                   |-- Đổi trạng thái SENT      |
      |                            |                   |-- Bắn email QUOTE_READY -->| (Nhận email báo giá)
      |                            |                   |                            |
      |                            |                   |<-- Đăng nhập xem chi tiết -|
      |                            |                   |<-- POST /quotes/{id}/------|
      |                            |                   |    approve (Duyệt giá)     |
      |                            |                   |-- Đổi trạng thái APPROVED  |
      |                            |                   |-- Chuyển RO: IN_PROGRESS   |
      |<-- Nhận thông báo khách ---|<-- Báo duyệt -----|                            |
      |    đã duyệt để làm xe      |    thành công     |                            |
```

#### C. Luồng Thanh toán trực tuyến qua cổng VNPAY Sandbox:
```
Khách hàng            Frontend (Client)            Backend OTO Garage             Cổng VNPAY Sandbox
    |                        |                             |                              |
    |-- Bấm "Thanh toán" --->|                             |                              |
    |   bằng VNPAY           |-- POST /customer/vnpay/create-payment                      |
    |                        |   {repairOrderId} --------->|                              |
    |                        |                             |-- Tạo tham số vnp_Params     |
    |                        |                             |-- Ký SHA-512 HMAC            |
    |                        |<-- Trả về paymentUrl -------|                              |
    |-- Chuyển hướng trình duyệt đến paymentUrl ----------------------------------------->|
    |                                                                                     |-- Nhập thẻ test NCB
    |                                                                                     |-- Nhập OTP 123456
    |                                                                                     |-- Xác thực thành công
    |<-- VNPAY Redirect về return-url kèm vnp_ResponseCode=00 & vnp_SecureHash -----------|
    |-- Frontend chuyển mã kết quả về Backend xác minh --->|                              |
    |                                                      |-- Kiểm tra chữ ký hợp lệ     |
    |                                                      |-- Cập nhật Payment: SUCCESS  |
    |                                                      |-- Cập nhật RO: COMPLETED     |
    |<-- Hiển thị màn hình Thanh toán thành công! ---------|                              |
```

---

# CHƯƠNG 6: HIỆN THỰC HỆ THỐNG & KẾT QUẢ ĐẠT ĐƯỢC

### 6.1. Phân hệ Khách hàng (Customer Portal)
1. **Trang Gara của tôi (`/app/customer/vehicles`)**:
   - Giao diện dạng lưới thẻ (Card Grid) trực quan hiển thị danh sách các xe đã lưu của khách hàng.
   - Thao tác thêm xe mới nhanh chóng chỉ với biển số, hãng xe, dòng xe và màu sơn.
2. **Trang Đặt lịch bảo dưỡng (`/app/customer/bookings`)**:
   - Lựa chọn nhanh xe từ danh sách gara cá nhân.
   - Bảng lịch chọn ngày và khung giờ trực quan, tự động hiển thị mô tả và giá cước dịch vụ tham khảo.
3. **Trang Báo giá & Chi phí (`/app/customer/quotes`)**:
   - Trình bày rõ ràng 2 khối chi phí: Bảng tiền công nhân lực và Bảng vật tư phụ tùng thay thế.
   - Tự động tính thuế VAT 10% và tổng thanh toán. Khách hàng có 2 nút hành động nhanh: **"Đồng ý làm"** hoặc **"Từ chối"** kèm ô nhập ghi chú.
4. **Trang Tiến độ sửa chữa (`/app/customer/repairs`)**:
   - Dạng mốc thời gian (Timeline) thể hiện rõ ràng các giai đoạn. Khách hàng có thể mở điện thoại ra xem xe của mình đang ở công đoạn nào mà không cần gọi điện hỏi xưởng.
5. **Trang Thanh toán & Hóa đơn (`/app/customer/payments`)**:
   - Tích hợp nút thanh toán chuyển hướng sang Cổng VNPAY an toàn hoặc chọn xác nhận tiền mặt.

### 6.2. Phân hệ Kỹ thuật viên / Nhân viên (Staff Workspace)
1. **Lịch làm việc cá nhân (`/app/staff/schedule`)**:
   - Nhân viên tra cứu ca trực theo tuần; hệ thống tự động lọc đúng lịch ca trực của nhân viên đang đăng nhập, tránh nhầm lẫn giữa các thợ.
2. **Danh sách lệnh sửa chữa (`/app/staff/repairs`)**:
   - Theo dõi các lệnh tiếp nhận từ lịch hẹn hoặc xe vãng lai. Thao tác 1 chạm để chuyển đổi trạng thái lệnh.
3. **Soạn thảo báo giá (`/app/staff/quotes`)**:
   - Cho phép thêm linh hoạt các dòng tiền công và tra cứu phụ tùng trực tiếp từ kho để đưa vào báo giá.
4. **Phiếu yêu cầu vật tư (`/app/staff/parts-requests`)**:
   - Kỹ thuật viên tạo phiếu yêu cầu cấp phụ tùng gửi thủ kho; xem phản hồi phê duyệt ngay trên màn hình làm việc.

### 6.3. Phân hệ Quản trị viên (Admin Dashboard)
1. **Dashboard điều hành (`/app/admin`)**:
   - 4 thẻ KPI đầu trang: Tổng lệnh, Lệnh đang sửa, Doanh thu hôm nay, Cảnh báo phụ tùng sắp hết.
   - Biểu đồ tròn và cột thể hiện trực quan phân bổ doanh thu theo nhóm dịch vụ và doanh thu 7 ngày gần nhất.
2. **Kho phụ tùng (`/app/admin/parts`)**:
   - Bảng quản lý linh kiện thông minh với thanh tìm kiếm tức thì theo mã SKU hoặc tên.
   - Các linh kiện có số lượng tồn kho $\le$ ngưỡng tối thiểu sẽ tự động được đánh dấu viền đỏ cảnh báo khẩn cấp.
   - Tab "Yêu cầu cấp phụ tùng" giúp quản lý bấm Duyệt/Từ chối phiếu của kỹ thuật viên chỉ với 1 click chuột.
3. **Phân ca làm việc (`/app/admin/schedules`)**:
   - Bảng ma trận nhân viên $\times$ ngày trong tuần. Quản lý có thể gán nhanh ca sáng/chiều/tối cho bất kỳ thợ nào.
4. **Cài đặt thông báo & SMTP (`/app/admin/notifications`)**:
   - Giao diện trực quan cho phép bật/tắt từng kịch bản gửi email tự động.
   - Cửa sổ kiểm tra kết nối SMTP với nút "Gửi email kiểm tra" giúp xác minh hệ thống gửi mail hoạt động tốt.

---

# CHƯƠNG 7: KIỂM THỬ HỆ THỐNG (TESTING & EVALUATION)

### 7.1. Chiến lược và phương pháp kiểm thử
Dự án áp dụng phương pháp kiểm thử hộp đen (Black-box Testing) kết hợp kiểm thử tích hợp luồng nghiệp vụ từ đầu đến cuối (End-to-End Integration Testing). Bộ kịch bản kiểm thử được chi tiết hóa trong tài liệu [`BANG_KICH_BAN_TEST_CASE.md`](file:///f:/OTO/BANG_KICH_BAN_TEST_CASE.md) bao gồm 36 trường hợp thử nghiệm phân bố trên tất cả các phân hệ.

### 7.2. Bảng ma trận kịch bản kiểm thử tiêu biểu

| Mã TC | Phân hệ | Mô tả kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng | Đánh giá |
| :---: | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Xác thực | Đăng nhập Admin thành công | `admin@garage.local` / `Admin@123` | Nhận JWT Token, chuyển hướng `/app/admin` | **PASS** |
| **TC-03** | Xác thực | Đăng nhập sai mật khẩu | `admin@garage.local` / `SaiPass` | Báo lỗi 401 Unauthorized, chặn đăng nhập | **PASS** |
| **TC-05** | Khách hàng | Thêm xe mới vào gara cá nhân | 30A-999.88, Mazda, CX-5, Đỏ | Xe xuất hiện trong danh sách xe sở hữu | **PASS** |
| **TC-07** | Khách hàng | Đặt lịch hẹn dịch vụ mới | Chọn xe, dịch vụ Bảo dưỡng, ngày mai | Sinh mã `BK-...`, trạng thái `PENDING` | **PASS** |
| **TC-08** | Email | Tự động gửi email xác nhận đặt lịch | Sự kiện đặt lịch thành công | Email gửi tới hộp thư khách hàng có đủ thông tin xe & giờ hẹn | **PASS** |
| **TC-13** | Nhân viên | Xem lịch làm việc cá nhân | Tài khoản Staff đăng nhập | Chỉ hiển thị ca trực của chính mình, không lộ thợ khác | **PASS** |
| **TC-16** | Nhân viên | Lập báo giá và gửi khách hàng | Thêm 1 dòng công + 1 phụ tùng | Mã `QU-...`, trạng thái chuyển `SENT` | **PASS** |
| **TC-18** | Email | Tự động gửi email báo giá dịch vụ | Sự kiện gửi báo giá | Khách nhận email chi tiết tiền công, tiền phụ tùng và tổng tiền | **PASS** |
| **TC-20** | Khách hàng | Khách hàng duyệt báo giá | Bấm "Duyệt báo giá" | Trạng thái Quote: `APPROVED`, RO: `IN_PROGRESS` | **PASS** |
| **TC-24** | Nhân viên | Yêu cầu xuất kho phụ tùng | Mã PT: Lọc nhớt, SL: 2 | Phiếu tạo trạng thái `PENDING` chuyển đến Admin | **PASS** |
| **TC-25** | Admin | Admin duyệt yêu cầu xuất kho | Bấm "Phê duyệt" | Trạng thái `APPROVED`, kho tự động trừ 2 sản phẩm | **PASS** |
| **TC-27** | Khách hàng | Thanh toán qua VNPAY Sandbox | Chọn VNPAY, nhập thẻ test NCB | Giao dịch thành công, hóa đơn chuyển `SUCCESS` | **PASS** |
| **TC-31** | Admin | Cảnh báo tồn kho dưới ngưỡng | Số lượng tồn < `min_stock_alert` | Thẻ phụ tùng hiển thị cảnh báo đỏ trên Dashboard | **PASS** |
| **TC-35** | Admin | Thử nghiệm gửi email qua SMTP | Nhập email nhận `hacamdat2003@gmail.com` | API trả về 200 OK, email xuất hiện trong Inbox | **PASS** |

### 7.3. Kết quả đánh giá chất lượng
- **Tỷ lệ Pass**: 36/36 Test Cases thực hiện thành công (Đạt 100%).
- **Xử lý ngoại lệ**: Kiểm soát chặt chẽ các lỗi phổ biến như hết phiên đăng nhập (401), cố tình truy cập trái quyền (403), lỗi bất đồng bộ Hibernate Proxy (`LazyInitializationException`) và quá thời gian chờ kết nối mạng (Socket Timeout).

---

# CHƯƠNG 8: KẾT LUẬN & HƯỚNG PHÁT TRIỂN

### 8.1. Các kết quả đã đạt được
1. **Về mặt kỹ thuật**:
   - Xây dựng thành công hệ thống ứng dụng web hướng dịch vụ hoàn chỉnh trên nền tảng Spring Boot 3 và React 18 TypeScript.
   - Áp dụng thành công kiến trúc phi trạng thái Stateless Authentication với JWT, đảm bảo khả năng scale ngang dễ dàng.
   - Ứng dụng công nghệ ảo hóa Docker giúp đóng gói toàn bộ ứng dụng và CSDL, triển khai nhanh chóng trên các nền tảng máy chủ.
   - Tích hợp trơn tru hai dịch vụ bên ngoài phức tạp: Thanh toán điện tử VNPAY Sandbox và Thư điện tử tự động Gmail SMTP.
2. **Về mặt nghiệp vụ**:
   - Số hóa toàn bộ chu trình dịch vụ ô tô từ khâu Đặt lịch $\rightarrow$ Tiếp nhận $\rightarrow$ Báo giá $\rightarrow$ Xuất kho $\rightarrow$ Thi công $\rightarrow$ Thanh toán $\rightarrow$ Đánh giá.
   - Mang lại trải nghiệm hoàn toàn mới cho khách hàng: minh bạch chi phí, nắm bắt tiến độ theo thời gian thực và thanh toán không tiền mặt.
   - Giúp ban quản lý garage nắm bắt số liệu kinh doanh tức thì qua các biểu đồ phân tích trực quan.

### 8.2. Hạn chế còn tồn tại
- Hệ thống gửi email hiện tại chạy trên cơ chế `@Async` cục bộ của Spring Boot; khi tải gửi hàng ngàn email/phút, cần bổ sung Message Queue chuyên dụng (như RabbitMQ / Kafka) để đảm bảo hàng đợi không bị mất khi ứng dụng khởi động lại.
- Các danh sách lớn (Lịch sử đặt lịch, Báo giá) hiện đang tải toàn bộ; cần triển khai phân trang (Pagination) khi dữ liệu đạt quy mô hàng chục ngàn bản ghi.

### 8.3. Đề xuất hướng phát triển tương lai
- **Phát triển Mobile App**: Xây dựng ứng dụng di động đa nền tảng (Flutter hoặc React Native) dành riêng cho khách hàng và thợ kỹ thuật để nhận thông báo đẩy (Push Notification) tức thời.
- **Tích hợp Zalo ZNS / SMS OTP**: Gửi mã xác thực OTP và thông báo tiến độ xe trực tiếp vào tài khoản Zalo của chủ xe.
- **Ứng dụng Trí tuệ nhân tạo (AI)**:
  - Tích hợp mô hình AI chẩn đoán sơ bộ hư hỏng qua mô tả triệu chứng hoặc phân tích âm thanh tiếng gõ động cơ do khách hàng thu âm tải lên.
  - Tự động gợi ý phụ tùng cần bảo dưỡng dựa trên số km xe đã chạy (`odometer_in`) và chu kỳ khuyến cáo của nhà sản xuất.
- **Mở rộng chuỗi đa chi nhánh (Multi-Branch Support)**: Mở rộng kiến trúc cơ sở dữ liệu để hỗ trợ quản lý chuỗi nhiều xưởng dịch vụ với kho hàng trung tâm và điều chuyển thợ linh hoạt giữa các cơ sở.

---

# PHỤ LỤC: HƯỚNG DẪN CÀI ĐẶT & TRIỂN KHAI

### 1. Yêu cầu môi trường
- Hệ điều hành: Windows 10/11, macOS hoặc Linux.
- Đã cài đặt **Docker Desktop** (hoặc Docker Engine & Docker Compose).
- Đã cài đặt **Node.js 18+** (nếu muốn chạy Frontend ở chế độ Hot-reload).

### 2. Các bước triển khai nhanh bằng Docker Compose
1. Mở Terminal tại thư mục gốc dự án (`f:\OTO`).
2. Khởi động toàn bộ cụm dịch vụ (MySQL + Backend + Frontend):
   ```bash
   docker compose up -d --build
   ```
3. Kiểm tra trạng thái các container đang chạy:
   ```bash
   docker compose ps
   ```
4. Truy cập ứng dụng:
   - **Frontend Web App**: `http://localhost:5173` (hoặc `http://localhost:80`)
   - **Backend REST API**: `http://localhost:8080`
   - **Cơ sở dữ liệu MySQL**: `localhost:3308` (User: `oto_user`, Pass: `oto_password`, Database: `oto`)

### 3. Danh sách tài khoản thử nghiệm có sẵn trong hệ thống
| Vai trò | Email đăng nhập | Mật khẩu | Mục đích kiểm thử |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@garage.local` | `Admin@123` | Quản lý toàn quyền, Dashboard, Doanh thu, Cài đặt SMTP |
| **Kỹ thuật viên 1 (Staff)** | `staff@garage.local` | `Staff@123` | Xem ca trực cá nhân, Tiếp nhận xe, Lập báo giá, Cập nhật tiến độ |
| **Kỹ thuật viên 2 (Staff)** | `huyhoang123@gmail.com` | `Staff@123` | Kiểm tra tính độc lập của ca trực nhân viên |
| **Khách hàng 1 (Customer)** | `customer1@garage.local` | `Customer@123` | Khách có sẵn 7 xe và lịch sử sửa chữa |
| **Khách hàng 2 (Customer)** | `customer2@garage.local` | `Customer@123` | Kiểm tra luồng đặt lịch mới |
| **Cấu hình SMTP Gmail** | `hacamdat2003@gmail.com` | `yvjptzofylpglzqv` | Máy chủ gửi email xác nhận và báo giá tự động |
