import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RoleLayout, type NavItem } from './components/RoleLayout'
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
import { StaffDashboard } from './pages/staff/StaffDashboard'
import { VehicleIntake } from './pages/staff/VehicleIntake'
import { QuoteBuilder } from './pages/staff/QuoteBuilder'
import { RepairProgress } from './pages/staff/RepairProgress'
import { PartsRequest } from './pages/staff/PartsRequest'
import { VehicleHandover } from './pages/staff/VehicleHandover'
import { WorkSchedule } from './pages/staff/WorkSchedule'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { EmployeeManagement } from './pages/admin/EmployeeManagement'
import { PartsInventory } from './pages/admin/PartsInventory'
import { ServiceCatalog } from './pages/admin/ServiceCatalog'
import { RevenueReports } from './pages/admin/RevenueReports'
import { NotificationSettings } from './pages/admin/NotificationSettings'

const customerNav: NavItem[] = [
  { to: '/app/customer', label: 'Tổng quan', icon: '🏠', end: true },
  { to: '/app/customer/book', label: 'Đặt lịch', icon: '📅' },
  { to: '/app/customer/history', label: 'Lịch sử xe', icon: '📜' },
  { to: '/app/customer/status', label: 'Trạng thái sửa', icon: '🔧' },
  { to: '/app/customer/quotes', label: 'Báo giá & duyệt', icon: '📋' },
  { to: '/app/customer/payment', label: 'Thanh toán', icon: '💳' },
  { to: '/app/customer/rating', label: 'Đánh giá', icon: '⭐' },
]

const staffNav: NavItem[] = [
  { to: '/app/staff', label: 'Tổng quan', icon: '🏭', end: true },
  { to: '/app/staff/intake', label: 'Tiếp nhận xe', icon: '🚗' },
  { to: '/app/staff/quote', label: 'Lập báo giá', icon: '📝' },
  { to: '/app/staff/progress', label: 'Tiến độ', icon: '⏱' },
  { to: '/app/staff/parts', label: 'Yêu cầu kho', icon: '📦' },
  { to: '/app/staff/handover', label: 'Bàn giao', icon: '✅' },
  { to: '/app/staff/schedule', label: 'Lịch làm việc', icon: '🗓' },
]

const adminNav: NavItem[] = [
  { to: '/app/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/app/admin/employees', label: 'Nhân viên', icon: '👥' },
  { to: '/app/admin/inventory', label: 'Kho phụ tùng', icon: '📦' },
  { to: '/app/admin/services', label: 'Dịch vụ & giá', icon: '🛠' },
  { to: '/app/admin/revenue', label: 'Báo cáo DT', icon: '💹' },
  { to: '/app/admin/notifications', label: 'Thông báo', icon: '🔔' },
]

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
        </Route>

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
        </Route>

        <Route
          path="/app/admin"
          element={<RoleLayout brand="Quản trị" subtitle="Cấu hình & báo cáo" nav={adminNav} accent="admin" />}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="inventory" element={<PartsInventory />} />
          <Route path="services" element={<ServiceCatalog />} />
          <Route path="revenue" element={<RevenueReports />} />
          <Route path="notifications" element={<NotificationSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
