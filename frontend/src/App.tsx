import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { RoleLayout, type NavItem } from './components/RoleLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { BookAppointment } from './pages/customer/BookAppointment'
import { ServiceHistory } from './pages/customer/ServiceHistory'
import { RepairStatus } from './pages/customer/RepairStatus'
import { Quotes } from './pages/customer/Quotes'
import { Payment } from './pages/customer/Payment'
import { ServiceRating } from './pages/customer/ServiceRating'
import { ChangePassword as CustomerChangePassword } from './pages/customer/ChangePassword'
import { StaffDashboard } from './pages/staff/StaffDashboard'
import { VehicleIntake } from './pages/staff/VehicleIntake'
import { QuoteBuilder } from './pages/staff/QuoteBuilder'
import { RepairProgress } from './pages/staff/RepairProgress'
import { PartsRequest } from './pages/staff/PartsRequest'
import { VehicleHandover } from './pages/staff/VehicleHandover'
import { WorkSchedule } from './pages/staff/WorkSchedule'
import { ChangePassword as StaffChangePassword } from './pages/staff/ChangePassword'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminEmployees } from './pages/admin/AdminEmployees'
import { PartsInventory } from './pages/admin/PartsInventory'
import { PartsRequestsReview } from './pages/admin/PartsRequestsReview'
import { PartCreate } from './pages/admin/PartCreate'
import { ServiceCatalog } from './pages/admin/ServiceCatalog'
import { RevenueReports } from './pages/admin/RevenueReports'
import { NotificationSettings } from './pages/admin/NotificationSettings'
import { ChangePassword as AdminChangePassword } from './pages/admin/ChangePassword'

function SwaggerRedirect() {
  useEffect(() => {
    window.location.assign('/swagger-ui/index.html')
  }, [])
  return null
}

const customerNav: NavItem[] = [
  { to: '/app/customer', label: 'Tổng quan', end: true },
  { to: '/app/customer/book', label: 'Đặt lịch' },
  { to: '/app/customer/history', label: 'Lịch sử xe' },
  { to: '/app/customer/status', label: 'Trạng thái sửa' },
  { to: '/app/customer/quotes', label: 'Báo giá & duyệt' },
  { to: '/app/customer/payment', label: 'Thanh toán' },
  { to: '/app/customer/rating', label: 'Đánh giá' },
  { to: '/app/customer/password', label: 'Đổi mật khẩu' },
]

const staffNav: NavItem[] = [
  { to: '/app/staff', label: 'Tổng quan', end: true },
  { to: '/app/staff/intake', label: 'Tiếp nhận xe' },
  { to: '/app/staff/quote', label: 'Lập báo giá' },
  { to: '/app/staff/progress', label: 'Tiến độ' },
  { to: '/app/staff/parts', label: 'Yêu cầu kho' },
  { to: '/app/staff/handover', label: 'Bàn giao' },
  { to: '/app/staff/schedule', label: 'Lịch làm việc' },
  { to: '/app/staff/password', label: 'Đổi mật khẩu' },
]

const adminNav: NavItem[] = [
  { to: '/app/admin', label: 'Dashboard', end: true },
  { to: '/app/admin/employees', label: 'Nhân viên' },
  { to: '/app/admin/inventory', label: 'Kho phụ tùng' },
  { to: '/app/admin/parts-requests', label: 'Duyệt phiếu' },
  { to: '/app/admin/parts/new', label: 'Thêm phụ tùng' },
  { to: '/app/admin/services', label: 'Dịch vụ & giá' },
  { to: '/app/admin/revenue', label: 'Báo cáo DT' },
  { to: '/app/admin/notifications', label: 'Thông báo' },
  { to: '/app/admin/password', label: 'Đổi mật khẩu' },
]

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/swagger" element={<SwaggerRedirect />} />
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute roles={['CUSTOMER']} />}>
          <Route
            path="/app/customer"
            element={
              <RoleLayout brand="Khách hàng" subtitle="Đặt lịch & theo dõi xe" nav={customerNav} accent="customer" />
            }
          >
            <Route index element={<CustomerDashboard />} />
            <Route path="book" element={<BookAppointment />} />
            <Route path="history" element={<ServiceHistory />} />
            <Route path="status" element={<RepairStatus />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="payment" element={<Payment />} />
            <Route path="rating" element={<ServiceRating />} />
            <Route path="password" element={<CustomerChangePassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['STAFF']} />}>
          <Route
            path="/app/staff"
            element={<RoleLayout brand="Nhân viên" subtitle="Vận hành xưởng" nav={staffNav} accent="staff" />}
          >
            <Route index element={<StaffDashboard />} />
            <Route path="intake" element={<VehicleIntake />} />
            <Route path="quote" element={<QuoteBuilder />} />
            <Route path="progress" element={<RepairProgress />} />
            <Route path="parts" element={<PartsRequest />} />
            <Route path="handover" element={<VehicleHandover />} />
            <Route path="schedule" element={<WorkSchedule />} />
            <Route path="password" element={<StaffChangePassword />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute roles={['ADMIN']} />}>
          <Route
            path="/app/admin"
            element={<RoleLayout brand="Quản trị" subtitle="Cấu hình & báo cáo" nav={adminNav} accent="admin" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="employees" element={<AdminEmployees />} />
            <Route path="inventory" element={<PartsInventory />} />
            <Route path="parts-requests" element={<PartsRequestsReview />} />
            <Route path="parts/new" element={<PartCreate />} />
            <Route path="services" element={<ServiceCatalog />} />
            <Route path="revenue" element={<RevenueReports />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="password" element={<AdminChangePassword />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
