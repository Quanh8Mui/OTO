# OTO — Hệ thống quản lý garage ô tô

Ứng dụng web full-stack: đặt lịch khách hàng, vận hành xưởng, quản trị kho & báo cáo.

## Công nghệ

| Thành phần | Stack |
|---|---|
| Backend | Spring Boot 3.2, Java 17, MySQL, JWT |
| Frontend | React 18, TypeScript, Vite |
| API docs | Swagger UI tại `/swagger-ui.html` |

## Chạy local

### 1. Database (Docker)

```bash
docker compose up -d
```

MySQL chạy tại `localhost:3308`, database `oto`, user `root`, password `123456`.

### 2. Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

API: `http://localhost:8080`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:5173` (proxy `/api` → backend)

## Tài khoản demo (profile `dev`)

| Email | Mật khẩu | Vai trò |
|---|---|---|
| `customer1@garage.local` | `Customer@123` | Khách hàng |
| `staff@garage.local` | `Staff@123` | Nhân viên |
| `admin@garage.local` | `Admin@123` | Quản trị |

## Cấu trúc

```
OTO/
├── backend/     # REST API
├── frontend/    # Giao diện web (3 phân hệ: customer / staff / admin)
├── docs/        # Sơ đồ nghiệp vụ (Mermaid)
└── docker-compose.yml
```
