# BÁO CÁO PHÂN TÍCH VÀ TỐI ƯU HÓA KHẢ NĂNG MỞ RỘNG (SCALABILITY ANALYSIS)
**Dự án:** Hệ thống Quản lý Xưởng dịch vụ & Chăm sóc Ô tô OTO Garage  
**Ngày lập:** Tháng 09/2026  
**Phiên bản:** 1.0.0  

---

## 1. TỔNG QUAN KIẾN TRÚC HIỆN TẠI (CURRENT ARCHITECTURE)

Hệ thống OTO Garage đang được xây dựng theo mô hình **Client - Server (Single-Page Application & RESTful API)**:

* **Tầng Frontend**:
  * Công nghệ: React 18, Vite, TypeScript, React Router 6.
  * Giao diện: Vanilla CSS Design System, Responsive UI, Recharts cho biểu đồ trực quan.
  * Quản lý trạng thái: React Context (`AuthContext`, `ToastContext`), Hooks (`useMemo`, `useState`, `useEffect`).
* **Tầng Backend**:
  * Công nghệ: Spring Boot 3.2.5 (Java 17).
  * Bảo mật: Spring Security với xác thực phi trạng thái **Stateless JWT** (JSON Web Token).
  * ORM / Data: Spring Data JPA, Hibernate, HikariCP Connection Pool.
  * Cơ chế ngầm: `@Async` ThreadPool cho các tác vụ gửi email và thông báo tự động.
  * Di chuyển lược đồ CSDL: Flyway Database Migrations.
* **Tầng Cơ sở dữ liệu (Database)**:
  * Hệ quản trị: MySQL 8.x.
* **Hạ tầng & Đóng gói (Deployment)**:
  * Đóng gói hoàn toàn bằng **Docker** và điều phối qua **Docker Compose** (`oto_mysql`, `oto_backend`, `oto_frontend`).

---

## 2. NHỮNG ĐIỂM MẠNH VỀ SCALABILITY ĐÃ CÓ SẴN (CURRENT STRENGTHS)

Kiến trúc hiện tại của dự án đã sở hữu nhiều nền tảng kỹ thuật chuẩn mực, tạo điều kiện rất tốt cho việc mở rộng:

| Thành phần | Đặc điểm thiết kế | Lợi thế mở rộng (Scalability Advantage) |
| :--- | :--- | :--- |
| **Xác thực Stateless JWT** | Không lưu Session trong bộ nhớ RAM của Web Server | **Scale ngang (Horizontal Scaling) cực kỳ dễ dàng**: Có thể nhân bản lên 2, 5 hay 10 container Backend đằng sau Load Balancer mà không cần sticky session hay session replication. |
| **Đóng gói Containerization** | Tách riêng Backend, Frontend, Database trong Docker | Dễ dàng chuyển dịch lên các nền tảng đám mây hiện đại (AWS ECS, Google Cloud Run, Azure Container Apps hoặc cụm Kubernetes - K8s). |
| **Xử lý bất đồng bộ (@Async)** | Tách việc gửi email SMTP sang luồng ngầm | Request HTTP của người dùng không bị nghẽn (non-blocking). Dù máy chủ mail phản hồi chậm, trải nghiệm đặt lịch và duyệt báo giá vẫn diễn ra tức thì. |
| **Connection Pooling (HikariCP)** | Quản lý vòng đời kết nối CSDL chặt chẽ | Tái sử dụng kết nối hiệu quả, bảo vệ MySQL khỏi tình trạng cạn kiệt tài nguyên khi có nhiều kết nối đồng thời. |
| **Quản lý Schema (Flyway)** | Quản lý phiên bản CSDL bằng mã nguồn SQL versioned | Khi triển khai thêm cụm máy chủ hoặc môi trường Staging/Production mới, CSDL tự động nâng cấp đồng bộ mà không lo sai lệch cấu trúc. |

---

## 3. CÁC ĐIỂM NGHẼN TIỀM ẨN VÀ GIẢI PHÁP TỐI ƯU (BOTTLENECKS & SOLUTIONS)

Khi lượng khách hàng tăng từ vài trăm lên hàng chục ngàn xe, hoặc khi mở rộng chuỗi nhiều chi nhánh, hệ thống sẽ đối mặt với các điểm nghẽn sau:

### 3.1. Tầng Cơ sở dữ liệu (Database Bottlenecks)

1. **Thiếu Phân trang (Pagination) ở các API danh sách lớn**:
   * *Hiện trạng*: Các endpoint như `bookingService.listAll()`, `repairOrderRepository.findAll()` đang tải toàn bộ dữ liệu từ CSDL vào RAM server.
   * *Nguy cơ*: Khi có 20.000 lịch hẹn hay 50.000 dòng báo giá, một request có thể chiếm hàng trăm MB RAM và thời gian query kéo dài từ 2–5 giây.
   * *Giải pháp*:
     * Chuyển các hàm tìm kiếm sang dùng `Pageable` của Spring Data JPA (`PageRequest.of(page, size, Sort.by(...))`).
     * Trả về cấu trúc phân trang: `{ content: [...], totalElements, totalPages, page, size }`.
     * Phía Frontend bổ sung Pagination hoặc Infinite Scroll (tải thêm khi cuộn).

2. **Tối ưu hóa Truy vấn & Chỉ mục (Indexing)**:
   * *Nguy cơ*: Truy vấn lọc theo ngày, trạng thái hoặc KTV phụ trách sẽ bị quét toàn bộ bảng (Full Table Scan) nếu thiếu chỉ mục.
   * *Giải pháp*: Tạo các **Composite Index** trong MySQL thông qua Flyway migration:
     ```sql
     CREATE INDEX idx_bookings_date_status ON bookings(requested_date, status);
     CREATE INDEX idx_repair_orders_customer ON repair_orders(customer_id, created_at);
     CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);
     CREATE INDEX idx_quotes_status ON quotes(status);
     ```

3. **Hiện tượng N+1 Query trong JPA**:
   * *Nguy cơ*: Khi lấy danh sách Bookings hoặc RepairOrders, việc truy cập các entity quan hệ như Customer, Vehicle, AssignedStaff có thể làm Hibernate phát sinh hàng trăm câu query con lặp lại.
   * *Giải pháp*: Sử dụng `JOIN FETCH` trong JPQL hoặc `@EntityGraph` để nạp dữ liệu liên quan trong một lần truy vấn duy nhất.

---

### 3.2. Tầng Bộ nhớ đệm (Caching Layer)

* *Hiện trạng*: Mỗi lần Admin mở Dashboard hoặc khách hàng xem danh mục, backend đều phải query MySQL và tính toán lại doanh thu 12 tháng, nhóm dịch vụ bán chạy...
* *Giải pháp tích hợp Redis Cache*:
  * Bổ sung **Redis** làm tầng In-Memory Cache giữa Backend và MySQL.
  * Sử dụng Spring Cache `@Cacheable` cho các dữ liệu đọc nhiều nhưng ít thay đổi:
    * Danh mục dịch vụ và giá tiêu chuẩn (`@Cacheable("service_catalog")`).
    * Danh mục phụ tùng cơ bản.
    * Bảng báo cáo doanh thu theo ngày/tháng (lưu cache trong 10–30 phút, chỉ tính lại khi có thanh toán mới qua `@CacheEvict`).
  * **Hiệu quả**: Giảm đến 70% – 85% tải truy vấn đọc trực tiếp vào MySQL.

---

### 3.3. Tầng Hàng đợi tác vụ (Message Queue & Event-Driven)

* *Hiện trạng*: Gửi email qua `@Async` hiện đang chạy trong ThreadPool nội tại của JVM instance. Nếu server bị khởi động lại hoặc crash đột ngột trong lúc đang gửi hàng loạt, tác vụ đó sẽ bị mất vĩnh viễn.
* *Giải pháp cho quy mô lớn*:
  * Tích hợp Message Broker như **RabbitMQ** hoặc **Apache Kafka**.
  * Khi có sự kiện (Đặt lịch mới, Báo giá sẵn sàng, Cập nhật tiến độ), backend chỉ bắn một Message nhỏ vào Exchange/Topic (mất < 5ms).
  * Worker Service riêng biệt sẽ tiêu thụ message và thực hiện gửi Email, SMS Brandname, Web Push.
  * Hỗ trợ Retry tự động, Dead Letter Queue (DLQ) nếu cổng gửi thư bị gián đoạn.

---

### 3.4. Tầng Frontend & Tối ưu hóa tải trang (Frontend Performance)

* *Hiện trạng*: Bundle JavaScript chính của Vite hiện tại đang ở mức **1.07 MB** (`dist/assets/index-pfD8CQSp.js`) chứa toàn bộ mã nguồn của cả Khách hàng, Nhân viên và Admin.
* *Giải pháp*:
  1. **Code-splitting / Dynamic Import**:
     * Áp dụng `React.lazy()` và `Suspense` cho các Route:
       ```tsx
       const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'))
       const WorkSchedule = React.lazy(() => import('./pages/staff/WorkSchedule'))
       const CustomerDashboard = React.lazy(() => import('./pages/customer/CustomerDashboard'))
       ```
     * Chia nhỏ thư viện biểu đồ Recharts chỉ tải khi người dùng vào trang Admin.
     * Giúp file tải ban đầu giảm từ **1.07 MB xuống còn dưới 180 KB**, tăng tốc độ mở trang (LCP) lên gấp 3 lần.
  2. **Lưu trữ tệp đa phương tiện (Media Assets)**:
     * Hình ảnh hư hỏng của xe, ảnh phụ tùng nên được lưu trữ trên Object Storage (Amazon S3, Cloudflare R2 hoặc MinIO) và phân phối qua mạng CDN (Content Delivery Network).

---

## 4. LỘ TRÌNH MỞ RỘNG THEO TỪNG QUY MÔ (SCALABILITY ROADMAP)

```
=============================================================================
GIAI ĐOẠN 1: MỘT XƯỞNG ĐƠN LẺ (< 1.000 lượt xe/tháng)
=============================================================================
├── Kiến trúc Monolith + Docker Compose hiện tại vận hành xuất sắc.
├── Chi phí vận hành: 1 VPS (2-4 CPU, 4-8GB RAM) chi phí tối thiểu.
└── Hành động cần làm:
    ├── Thêm phân trang (Pagination) ở các API danh sách.
    ├── Bổ sung chỉ mục (Indexing) cho MySQL.
    └── Lazy-loading code splitting trên Frontend.

=============================================================================
GIAI ĐOẠN 2: CHUỖI 3 - 5 GARA (5.000 - 20.000 lượt xe/tháng)
=============================================================================
├── Scale ngang tầng ứng dụng: Chạy 2 - 3 container Backend sau Nginx Load Balancer.
├── Bổ sung Redis Cache cho bảng giá, danh mục và báo cáo doanh thu.
├── Tách biệt MySQL ra máy chủ chuyên dụng (hỗ trợ Read-Replica cho các báo cáo nặng).
└── Lưu trữ hình ảnh xe và hồ sơ sửa chữa trên Cloud Storage (S3 / MinIO).

=============================================================================
GIAI ĐOẠN 3: CHUỖI TOÀN QUỐC / NỀN TẢNG SAAS (> 100.000 lượt xe/tháng)
=============================================================================
├── Triển khai trên cụm Kubernetes (EKS / GKE) với cơ chế HPA (Horizontal Pod Autoscaler)
│   tự động tăng giảm số lượng container Backend dựa theo lượng CPU/RAM thực tế.
├── Tách biệt các dịch vụ độc lập:
│   ├── Core Service (Tiếp nhận xe, Lịch hẹn, Lệnh sửa chữa).
│   ├── Notification Worker (Gửi Mail, SMS, Zalo ZNS qua RabbitMQ/Kafka).
│   └── Analytics & Reporting Service (Chuyên xử lý số liệu doanh thu và KPI).
└── Áp dụng Multi-tenancy (Mỗi garage/đại lý có không gian dữ liệu riêng biệt an toàn).
```

---

## 5. TỔNG KẾT & KẾT LUẬN

1. **Về nền tảng**: Dự án OTO Garage đang sở hữu một cấu trúc thiết kế sạch sẽ (**Clean Layered Architecture**), phân quyền rõ ràng (`ADMIN`, `STAFF`, `CUSTOMER`) và cơ chế xác thực **Stateless JWT** chuẩn công nghiệp.
2. **Khả năng nâng cấp**: Bạn hoàn toàn **không cần phải đập đi xây lại hệ thống** khi lượng khách tăng lên. Hệ thống có thể mở rộng mượt mà theo từng bước bằng cách bổ sung thêm:
   * **Phân trang (Pagination)**.
   * **Bộ nhớ đệm (Redis Cache)**.
   * **Cân bằng tải (Load Balancer)**.
3. **Giá trị đầu tư**: Kiến trúc hiện tại cân bằng hoàn hảo giữa tính tinh gọn, dễ bảo trì ở giai đoạn đầu và tiềm năng bứt phá về hiệu năng khi mở rộng quy mô lớn trong tương lai.
