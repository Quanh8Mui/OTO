# OTO — Hệ thống quản lý garage ô tô

Ứng dụng web full-stack hoàn chỉnh: Đặt lịch khách hàng, Vận hành xưởng, Quản trị kho phụ tùng & Báo cáo doanh thu.

## 🛠️ Công nghệ

| Thành phần | Stack |
|---|---|
| **Backend** | Spring Boot 3.2, Java 17, Spring Security + JWT, JPA / Hibernate, Flyway, MySQL 8 |
| **Frontend** | React 18, TypeScript, Vite, Recharts, XLSX |
| **Container** | Docker & Docker Compose (Multi-stage build Backend + Nginx Frontend) |
| **API Docs** | Swagger UI tại `/swagger-ui.html` |

---

## 🚀 Cách Chạy Dự Án

### Cách 1: Chạy toàn bộ với Docker (Khuyên dùng - 1 lệnh duy nhất)

```bash
docker compose up --build -d
```

* **Frontend UI**: `http://localhost:5173` hoặc `http://localhost`
* **Backend API & Swagger**: `http://localhost:8080/swagger-ui.html`
* **MySQL Database**: `localhost:3308` (Database: `oto`)

---

### Cách 2: Chạy thủ công từng phần (Dev Mode)

#### 1. Database (Docker)
```bash
docker compose up mysql -d
```

#### 2. Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run
```
API: `http://localhost:8080`

#### 3. Frontend (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
UI: `http://localhost:5173` (Vite tự proxy `/api` → backend)

---

## 🔑 Tài khoản demo

| Vai trò | Email | Mật khẩu |
|---|---|---|
| 🧑 **Khách hàng** | `customer1@garage.local` | `Customer@123` |
| 👷 **Nhân viên** | `staff@garage.local` | `Staff@123` |
| 🔧 **Quản trị viên** | `admin@garage.local` | `Admin@123` |

---

## 🌟 Tính Năng Nổi Bật

* **Biểu đồ thời gian thực (Recharts)**: Doanh thu 7 ngày, tỷ lệ trạng thái lệnh sửa chữa RO trên Admin Dashboard.
* **Xuất báo cáo Excel (.xlsx)**: Xuất file bảng kê chi tiết doanh thu từng ngày.
* **In / Xuất PDF chuẩn Garage**:
  * Sổ lịch sử dịch vụ & bảo dưỡng xe.
  * Phiếu báo giá dịch vụ & phụ tùng (kèm bảng thuế VAT & chữ ký khách hàng).
  * Biên bản bàn giao & nghiệm thu xe (kèm checklist kiểm tra kỹ thuật).
* **Cổng thanh toán**: Tích hợp thanh toán tiền mặt & VNPay QR Code.

