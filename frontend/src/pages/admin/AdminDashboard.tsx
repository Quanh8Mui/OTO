import { useEffect, useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Link } from 'react-router-dom'
import {
  api,
  type DashboardResponse,
  type RepairOrder,
  type Booking,
  type DailyRevenueItem,
  type RevenueReport,
  type Employee,
} from '../../lib/api'
import { formatMoney } from '../../lib/format'
import { useToast } from '../../context/ToastContext'

const DONUT_COLORS = [
  '#533c6e', // Deep plum
  '#a8d5ed', // Soft sky blue
  '#a3d9b4', // Soft mint
  '#fcc9ba', // Soft peach
  '#ded4ec', // Lavender
  '#fae4a7', // Pale yellow
]

const DAY_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

function formatDateInput(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDate(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  return formatDateInput(dt)
}

function getBookingRealtimeStatus(b: Booking) {
  if (b.quoteStatus === 'REJECTED') {
    return {
      label: 'Khách từ chối báo giá',
      badgeClass: 'badge-red',
      desc: b.quoteRejectedReason ? `Lý do: ${b.quoteRejectedReason}` : 'Khách không duyệt báo giá',
      isRejected: true,
    }
  }
  if (b.repairOrderStatus === 'DELIVERED' || b.status === 'COMPLETED') {
    return {
      label: 'Đã bàn giao xe',
      badgeClass: 'badge-green',
      desc: b.repairOrderNumber ? `Lệnh: ${b.repairOrderNumber}` : undefined,
    }
  }
  if (b.repairOrderStatus === 'COMPLETED') {
    return {
      label: 'Đã xong · Chờ bàn giao',
      badgeClass: 'badge-green',
      desc: b.repairOrderNumber ? `Lệnh: ${b.repairOrderNumber}` : undefined,
    }
  }
  if (b.repairOrderStatus === 'IN_PROGRESS') {
    return {
      label: 'Đang sửa chữa',
      badgeClass: 'badge-blue',
      desc: b.repairOrderNumber ? `Lệnh: ${b.repairOrderNumber}` : undefined,
    }
  }
  if (b.repairOrderStatus === 'AWAITING_APPROVAL' || b.quoteStatus === 'SENT') {
    return {
      label: 'Chờ duyệt báo giá',
      badgeClass: 'badge-purple',
      desc: b.repairOrderNumber ? `Lệnh: ${b.repairOrderNumber}` : undefined,
    }
  }
  if (b.repairOrderStatus === 'QUOTING') {
    return {
      label: 'Đang lập báo giá',
      badgeClass: 'badge-purple',
      desc: b.repairOrderNumber ? `Lệnh: ${b.repairOrderNumber}` : undefined,
    }
  }
  if (b.status === 'CONFIRMED') {
    return {
      label: 'Đã tiếp nhận vào xưởng',
      badgeClass: 'badge-purple',
      desc: b.repairOrderNumber ? `Lệnh: ${b.repairOrderNumber}` : 'Xe đang trong xưởng',
    }
  }
  if (b.status === 'CANCELLED') {
    return {
      label: 'Đã hủy',
      badgeClass: 'badge-red',
    }
  }
  return {
    label: 'Chờ tiếp nhận xe',
    badgeClass: 'badge-amber',
    desc: 'Chưa vào xưởng',
  }
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null)
  const [dailyData, setDailyData] = useState<DailyRevenueItem[]>([])
  const [breakdownData, setBreakdownData] = useState<Array<{ name: string; value: number }>>([])
  const { showToast } = useToast()

  // Date and filter states for schedule
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput())
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL')
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')

  const loadData = () => {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const firstDayOfMonthStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    const oneYearAgoStr = new Date(today.getFullYear() - 1, today.getMonth() + 1, 1).toISOString().slice(0, 10)

    Promise.allSettled([
      api.admin.dashboard(),
      api.staff.repairOrdersAll(),
      api.staff.bookings('all'),
      api.admin.employees(),
      api.admin.revenue(firstDayOfMonthStr, todayStr),
      api.admin.dailyRevenue(oneYearAgoStr, todayStr),
      api.admin.breakdown(),
    ]).then(([dashRes, roRes, bkRes, empRes, revRes, dailyRes, bdRes]) => {
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value)
      if (roRes.status === 'fulfilled') setRepairOrders(roRes.value)
      if (bkRes.status === 'fulfilled') setBookings(bkRes.value)
      if (empRes.status === 'fulfilled') setEmployees(empRes.value)
      if (revRes.status === 'fulfilled') setRevenueReport(revRes.value)
      if (dailyRes.status === 'fulfilled') setDailyData(dailyRes.value)
      if (bdRes.status === 'fulfilled') setBreakdownData(bdRes.value)
    }).catch((err) => {
      showToast(err instanceof Error ? err.message : 'Không thể tải dữ liệu từ server')
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  // Top 4 Stat Cards calculated from real DB data
  const activeROsCount = repairOrders.filter(
    (ro) => ro.status !== 'DELIVERED' && ro.status !== 'CANCELLED'
  ).length

  const totalBookingsCount = bookings.length
  const lowStockCount = dashboard?.lowStockPartsCount ?? 0
  const monthRevenue = revenueReport?.totalRevenue ?? dashboard?.revenueToday ?? 0

  // 12-Month Revenue Data aggregated from real payments
  const { twelveMonthsData, total12MonthRevenue } = useMemo(() => {
    const now = new Date()
    const mapByMonth: Record<string, number> = {}

    dailyData.forEach((item) => {
      const ym = item.date.slice(0, 7)
      mapByMonth[ym] = (mapByMonth[ym] || 0) + (Number(item.revenue) || 0)
    })

    let sum = 0
    const list = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const rev = mapByMonth[ym] || 0
      sum += rev
      list.push({
        month: `T${d.getMonth() + 1}`,
        revenue: rev,
        isCurrent: i === 0,
      })
    }

    return { twelveMonthsData: list, total12MonthRevenue: sum }
  }, [dailyData])

  // Category Breakdown Data from real quote lines
  const finalBreakdown = useMemo(() => {
    if (breakdownData.length > 0) {
      return breakdownData.map((item, idx) => ({
        name: item.name,
        value: Number(item.value) || 0,
        color: DONUT_COLORS[idx % DONUT_COLORS.length],
      }))
    }
    return [
      { name: 'Bảo dưỡng định kỳ', value: 0, color: DONUT_COLORS[0] },
      { name: 'Sửa chữa phụ tùng', value: 0, color: DONUT_COLORS[1] },
    ]
  }, [breakdownData])

  const donutTotal = useMemo(() => {
    return finalBreakdown.reduce((acc, cur) => acc + cur.value, 0)
  }, [finalBreakdown])

  // Map each booking to its repair order to find assigned staff
  const roMapByBookingId = useMemo(() => {
    const map = new Map<number, RepairOrder>()
    repairOrders.forEach((ro) => {
      if (ro.bookingId) map.set(ro.bookingId, ro)
      if (ro.id) map.set(ro.id, ro)
    })
    return map
  }, [repairOrders])

  // Day bookings for selectedDate
  const dayBookings = useMemo(
    () => bookings.filter((b) => b.requestedDate === selectedDate && b.status !== 'CANCELLED'),
    [bookings, selectedDate],
  )

  // Status counts for selected date
  const pendingCount = useMemo(() => dayBookings.filter((b) => b.status === 'PENDING').length, [dayBookings])
  const confirmedCount = useMemo(() => dayBookings.filter((b) => b.status === 'CONFIRMED').length, [dayBookings])
  const rejectedCount = useMemo(() => dayBookings.filter((b) => b.quoteStatus === 'REJECTED').length, [dayBookings])

  // Filtered bookings based on selected staff and status filter
  const filteredBookings = useMemo(() => {
    return dayBookings.filter((b) => {
      const ro = roMapByBookingId.get(b.id) || (b.repairOrderId ? roMapByBookingId.get(b.repairOrderId) : null)
      const staffId = b.assignedStaffId ?? ro?.assignedStaffId ?? null

      // Staff filter
      if (selectedStaffId === 'UNASSIGNED') {
        if (staffId != null) return false
      } else if (selectedStaffId !== 'ALL') {
        if (staffId !== Number(selectedStaffId)) return false
      }

      // Status filter
      if (statusFilter === 'PENDING' && b.status !== 'PENDING') return false
      if (statusFilter === 'CONFIRMED' && b.status !== 'CONFIRMED') return false
      if (statusFilter === 'REJECTED' && b.quoteStatus !== 'REJECTED') return false

      return true
    })
  }, [dayBookings, selectedStaffId, statusFilter, roMapByBookingId])

  // Timeline view grid for selected date
  const scheduleGrid = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const hour = Number(slot.split(':')[0])
      const matched = filteredBookings.filter((b) => {
        const start = b.timeSlot?.split('–')[0]?.trim() ?? b.timeSlot?.split('-')[0]?.trim()
        if (!start) return hour === 8
        return Number(start.split(':')[0]) === hour
      })
      return { slot, bookings: matched }
    })
  }, [filteredBookings])

  // Formatted date title
  const formattedDateHeader = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const dayOfWeek = DAY_NAMES[dt.getDay()]
    const todayStr = formatDateInput()
    const isToday = selectedDate === todayStr
    return `${dayOfWeek}, ngày ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} ${isToday ? '(Hôm nay)' : ''}`
  }, [selectedDate])

  return (
    <div className="dashboard-container">
      {/* ── ROW 1: 4 STAT CARDS ── */}
      <div className="stat-cards-row">
        <div className="stat-card">
          <div className="stat-card-value">{activeROsCount}</div>
          <div className="stat-card-label">Xe đang tại xưởng</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{totalBookingsCount}</div>
          <div className="stat-card-label">Tổng lượt đặt lịch</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{lowStockCount}</div>
          <div className="stat-card-label">Cảnh báo tồn kho phụ tùng</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{formatMoney(monthRevenue)}</div>
          <div className="stat-card-label">Doanh thu tháng thực thu</div>
        </div>
      </div>

      {/* ── ROW 2: MAIN 2-COLUMN GRID ── */}
      <div className="main-content-split">
        {/* ── LEFT COLUMN: ADMIN DAILY WORK SCHEDULE & REPAIR PROGRESS ── */}
        <div className="timeline-card">
          {/* Header & Quick Action */}
          <div className="timeline-card-header">
            <div>
              <h2 className="timeline-card-title">Lịch hẹn khách & Tiến độ toàn xưởng</h2>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#796e85' }}>
                Theo dõi toàn bộ lịch hẹn, xe tiếp nhận và kỹ thuật viên phụ trách từng đơn.
              </p>
            </div>
            <Link to="/app/staff/schedule" className="pill-action-btn">
              Xem chi tiết thời khoá biểu ➔
            </Link>
          </div>

          {/* Date Selector & Switcher Toolbar */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              padding: '0.85rem 1rem',
              background: '#faf8fd',
              borderRadius: '16px',
              border: '1px solid #e8e2f2',
              marginBottom: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="filter-pill-select"
                style={{ padding: '0.35rem 0.75rem' }}
                onClick={() => setSelectedDate((prev) => shiftDate(prev, -1))}
              >
                ◀ Trước
              </button>
              <button
                type="button"
                className="filter-pill-select"
                style={{
                  padding: '0.35rem 0.85rem',
                  background: selectedDate === formatDateInput() ? '#533c6e' : '#f8f6fc',
                  color: selectedDate === formatDateInput() ? '#ffffff' : '#533c6e',
                }}
                onClick={() => setSelectedDate(formatDateInput())}
              >
                Hôm nay
              </button>
              <button
                type="button"
                className="filter-pill-select"
                style={{ padding: '0.35rem 0.75rem' }}
                onClick={() => setSelectedDate((prev) => shiftDate(prev, 1))}
              >
                Sau ▶
              </button>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.3rem 0.6rem',
                  borderRadius: '10px',
                  border: '1px solid #e8e2f2',
                  fontSize: '0.85rem',
                  marginLeft: '0.3rem',
                }}
              />
            </div>

            {/* View Mode Toggle */}
            <div
              style={{
                display: 'inline-flex',
                background: '#f2edf8',
                padding: '3px',
                borderRadius: '10px',
              }}
            >
              <button
                type="button"
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'list' ? '#ffffff' : 'transparent',
                  fontWeight: viewMode === 'list' ? 700 : 500,
                  color: viewMode === 'list' ? '#533c6e' : '#796e85',
                  boxShadow: viewMode === 'list' ? '0 2px 6px rgba(83,60,110,0.08)' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setViewMode('list')}
              >
                Danh sách
              </button>
              <button
                type="button"
                style={{
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.82rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: viewMode === 'timeline' ? '#ffffff' : 'transparent',
                  fontWeight: viewMode === 'timeline' ? 700 : 500,
                  color: viewMode === 'timeline' ? '#533c6e' : '#796e85',
                  boxShadow: viewMode === 'timeline' ? '0 2px 6px rgba(83,60,110,0.08)' : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => setViewMode('timeline')}
              >
                Khung giờ
              </button>
            </div>
          </div>

          {/* Admin Filters: Assigned Staff & Status Filters */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            {/* Staff Filter Dropdown (ADMIN ONLY) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#533c6e' }}>
                Nhân viên phụ trách:
              </span>
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #e8e2f2',
                  fontSize: '0.85rem',
                  background: '#ffffff',
                  color: '#282033',
                  fontWeight: 500,
                }}
              >
                <option value="ALL">Tất cả nhân viên ({dayBookings.length} đơn)</option>
                <option value="UNASSIGNED">Chưa phân công KTV</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName} ({emp.position || 'Kỹ thuật viên'})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="filter-pill-select"
                style={{
                  background: statusFilter === 'ALL' ? '#533c6e' : '#f8f6fc',
                  color: statusFilter === 'ALL' ? '#ffffff' : '#533c6e',
                }}
                onClick={() => setStatusFilter('ALL')}
              >
                Tất cả ({dayBookings.length})
              </button>
              <button
                type="button"
                className="filter-pill-select"
                style={{
                  background: statusFilter === 'PENDING' ? '#533c6e' : '#f8f6fc',
                  color: statusFilter === 'PENDING' ? '#ffffff' : '#533c6e',
                }}
                onClick={() => setStatusFilter('PENDING')}
              >
                Chờ tiếp nhận ({pendingCount})
              </button>
              <button
                type="button"
                className="filter-pill-select"
                style={{
                  background: statusFilter === 'CONFIRMED' ? '#533c6e' : '#f8f6fc',
                  color: statusFilter === 'CONFIRMED' ? '#ffffff' : '#533c6e',
                }}
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                Đã tiếp nhận ({confirmedCount})
              </button>
              {rejectedCount > 0 && (
                <button
                  type="button"
                  className="filter-pill-select"
                  style={{
                    background: statusFilter === 'REJECTED' ? '#c62828' : '#ffebee',
                    color: statusFilter === 'REJECTED' ? '#ffffff' : '#c62828',
                    border: '1px solid #fca5a5',
                  }}
                  onClick={() => setStatusFilter('REJECTED')}
                >
                  Từ chối ({rejectedCount})
                </button>
              )}
            </div>
          </div>

          {/* Current Date Title Bar */}
          <div
            style={{
              padding: '0.65rem 1rem',
              background: 'linear-gradient(135deg, rgba(83,60,110,0.05) 0%, rgba(144,120,174,0.08) 100%)',
              borderRadius: '12px',
              border: '1px solid #e8e2f2',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <strong style={{ color: '#533c6e', fontSize: '0.92rem' }}>
              {formattedDateHeader}
            </strong>
            <span style={{ fontSize: '0.82rem', color: '#796e85' }}>
              Hiển thị <strong>{filteredBookings.length}</strong> / {dayBookings.length} lịch hẹn
            </span>
          </div>

          {/* Detailed Appointments List View */}
          {viewMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredBookings.length === 0 ? (
                <div className="timeline-empty" style={{ padding: '2.5rem 1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 600, color: '#796e85' }}>
                    Không có lịch hẹn nào phù hợp cho ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
                  </p>
                  <p style={{ margin: '0.4rem 0 0', fontSize: '0.84rem', color: '#9d92aa' }}>
                    Hãy chọn ngày khác hoặc đổi bộ lọc nhân viên / trạng thái để xem dữ liệu.
                  </p>
                </div>
              ) : (
                filteredBookings.map((b) => {
                  const rt = getBookingRealtimeStatus(b)
                  const ro = roMapByBookingId.get(b.id) || (b.repairOrderId ? roMapByBookingId.get(b.repairOrderId) : null)
                  const assignedStaffName = b.assignedStaffName || ro?.assignedStaffName || null
                  const roNumber = ro?.orderNumber || b.repairOrderNumber || null

                  return (
                    <div
                      key={b.id}
                      style={{
                        padding: '1rem 1.15rem',
                        borderRadius: '16px',
                        background: rt.isRejected ? '#fff8f8' : '#ffffff',
                        border: rt.isRejected ? '1.5px solid #fca5a5' : '1px solid #f0ebf7',
                        boxShadow: '0 2px 10px rgba(83, 60, 110, 0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Top Row: Time, Code, Status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              color: '#533c6e',
                              background: '#f4eef9',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                            }}
                          >
                            {b.timeSlot ?? '08:00 – 10:00'}
                          </span>
                          <span style={{ fontSize: '0.82rem', color: '#796e85' }}>
                            Mã: <code style={{ fontWeight: 600 }}>{b.bookingNumber}</code>
                          </span>
                        </div>

                        <span
                          className={`badge ${rt.badgeClass}`}
                          style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem', fontWeight: 600 }}
                        >
                          {rt.label}
                        </span>
                      </div>

                      {/* Middle Grid: Customer, Vehicle, Service */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '0.75rem',
                          padding: '0.55rem 0',
                          borderTop: '1px dashed #f0ebf7',
                          borderBottom: '1px dashed #f0ebf7',
                        }}
                      >
                        {/* Customer */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#796e85', textTransform: 'uppercase' }}>
                            Khách hàng
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#282033', marginTop: '2px' }}>
                            {b.customerName}
                          </div>
                          {b.customerPhone && (
                            <div style={{ fontSize: '0.82rem', color: '#533c6e', marginTop: '2px' }}>
                              <a href={`tel:${b.customerPhone}`} style={{ textDecoration: 'underline' }}>{b.customerPhone}</a>
                            </div>
                          )}
                        </div>

                        {/* Vehicle */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#796e85', textTransform: 'uppercase' }}>
                            Phương tiện
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                            <span
                              style={{
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                background: '#ffffff',
                                border: '1.5px solid #1e293b',
                                borderRadius: '4px',
                                padding: '0.1rem 0.45rem',
                                fontSize: '0.88rem',
                                color: '#0f172a',
                              }}
                            >
                              {b.licensePlate}
                            </span>
                          </div>
                          {b.vehicleLabel && (
                            <div style={{ fontSize: '0.82rem', color: '#796e85', marginTop: '2px' }}>
                              {b.vehicleLabel}
                            </div>
                          )}
                        </div>

                        {/* Service Requested */}
                        <div>
                          <div style={{ fontSize: '0.75rem', color: '#796e85', textTransform: 'uppercase' }}>
                            Dịch vụ yêu cầu
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#282033', marginTop: '2px' }}>
                            {b.serviceTypeLabel ?? b.serviceName ?? 'Bảo dưỡng định kỳ'}
                          </div>
                          {b.notes && (
                            <div style={{ fontSize: '0.8rem', color: '#796e85', marginTop: '2px', fontStyle: 'italic' }}>
                              "{b.notes}"
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Assigned Staff & Status Details */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.65rem',
                        }}
                      >
                        {/* Assigned Staff Display (CRITICAL FOR ADMIN) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {assignedStaffName ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                background: '#f0eaf7',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.84rem',
                                color: '#432f5a',
                                fontWeight: 600,
                              }}
                            >
                              <span>KTV phụ trách:</span>
                              <strong>{assignedStaffName}</strong>
                              {roNumber && (
                                <span style={{ color: '#796e85', fontWeight: 500, fontSize: '0.78rem' }}>
                                  ({roNumber})
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                background: '#fffbeb',
                                border: '1px solid #fde68a',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '8px',
                                fontSize: '0.84rem',
                                color: '#b45309',
                                fontWeight: 600,
                              }}
                            >
                              <span>Chưa phân công KTV</span>
                            </div>
                          )}

                          {rt.isRejected && (
                            <span
                              style={{
                                background: '#fee2e2',
                                color: '#991b1b',
                                padding: '0.2rem 0.55rem',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              {rt.desc}
                            </span>
                          )}
                        </div>

                        {/* Staff status details if any */}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            /* Timeline View Grid */
            <div className="table-wrap" style={{ border: '1px solid #f0ebf7', borderRadius: '16px' }}>
              <table className="data" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: '110px' }}>Khung giờ</th>
                    <th>Danh sách đơn & KTV phụ trách</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleGrid.map((row) => (
                    <tr key={row.slot}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#533c6e' }}>
                        {row.slot}
                      </td>
                      <td>
                        {row.bookings.length === 0 ? (
                          <span className="muted">—</span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {row.bookings.map((b) => {
                              const rt = getBookingRealtimeStatus(b)
                              const ro = roMapByBookingId.get(b.id) || (b.repairOrderId ? roMapByBookingId.get(b.repairOrderId) : null)
                              const assignedStaffName = b.assignedStaffName || ro?.assignedStaffName || null

                              return (
                                <div
                                  key={b.id}
                                  style={{
                                    padding: '0.45rem 0.75rem',
                                    borderRadius: '8px',
                                    background: rt.isRejected ? '#fff8f8' : '#faf8fd',
                                    border: rt.isRejected ? '1px solid #fca5a5' : '1px solid #e8e2f2',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: '0.4rem',
                                  }}
                                >
                                  <div>
                                    <strong style={{ color: '#282033' }}>{b.licensePlate}</strong>
                                    {' — '}
                                    <span style={{ fontWeight: 600, color: '#533c6e' }}>{b.customerName}</span>
                                    {assignedStaffName ? (
                                      <span
                                        style={{
                                          marginLeft: '0.5rem',
                                          background: '#ded4ec',
                                          color: '#432f5a',
                                          padding: '0.15rem 0.5rem',
                                          borderRadius: '6px',
                                          fontSize: '0.78rem',
                                          fontWeight: 600,
                                        }}
                                      >
                                        {assignedStaffName}
                                      </span>
                                    ) : (
                                      <span
                                        style={{
                                          marginLeft: '0.5rem',
                                          background: '#fef3c7',
                                          color: '#b45309',
                                          padding: '0.15rem 0.5rem',
                                          borderRadius: '6px',
                                          fontSize: '0.78rem',
                                          fontWeight: 600,
                                        }}
                                      >
                                        Chưa có KTV
                                      </span>
                                    )}
                                  </div>
                                  <span className={`badge ${rt.badgeClass}`} style={{ fontSize: '0.78rem' }}>
                                    {rt.label}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: CHARTS & FINANCIALS ── */}
        <div className="charts-column">
          {/* Card 1: 12-Month Revenue Bar Chart */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-title">Doanh thu 12 tháng gần nhất</div>
                <div className="chart-big-number">{formatMoney(total12MonthRevenue)}</div>
              </div>
            </div>

            <div className="chart-filters-row">
              <div className="filter-pill-select">12 tháng ▾</div>
              <div className="filter-pill-select">Biểu đồ cột ▾</div>
              <div className="filter-pill-select">Năm 2026 ▾</div>
            </div>

            <div className="chart-canvas-wrap">
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={twelveMonthsData} margin={{ top: 20, right: 4, left: 4, bottom: 0 }}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#796e85', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(83, 60, 110, 0.05)' }}
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #e8e2f2',
                      borderRadius: 12,
                      boxShadow: '0 8px 24px rgba(83, 60, 110, 0.12)',
                      fontSize: '0.85rem',
                      color: '#282033',
                    }}
                    formatter={(value) => [formatMoney(Number(value) || 0), 'Doanh thu']}
                  />
                  <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                    {twelveMonthsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isCurrent ? '#533c6e' : entry.revenue > 0 ? '#7f669e' : '#e5ddf0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 2: Donut Chart & Category Breakdown */}
          <div className="chart-card">
            <div className="donut-card-header">
              <div>
                <div className="chart-title">Doanh thu theo nhóm dịch vụ</div>
                <div className="chart-sub">Theo tiền báo giá đã duyệt thực tế</div>
              </div>
              <div className="filter-pill-select">Tháng 9/2026 ▾</div>
            </div>

            <div className="donut-content-split">
              <div className="donut-chart-container">
                <ResponsiveContainer width={150} height={150}>
                  <PieChart>
                    <Pie
                      data={finalBreakdown}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                    >
                      {finalBreakdown.map((entry, index) => (
                        <Cell key={`donut-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatMoney(Number(val) || 0), 'Doanh thu']}
                      contentStyle={{
                        background: '#ffffff',
                        border: '1px solid #e8e2f2',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-text">
                  <span className="donut-center-val">
                    {donutTotal >= 1000000
                      ? `${(donutTotal / 1000000).toFixed(1)}tr`
                      : donutTotal > 0
                        ? `${(donutTotal / 1000).toFixed(0)}k`
                        : '0đ'}
                  </span>
                </div>
              </div>

              <div className="breakdown-list">
                {finalBreakdown.map((item, idx) => (
                  <div key={idx} className="breakdown-row">
                    <div className="breakdown-name-wrap">
                      <span className="color-dot" style={{ backgroundColor: item.color }} />
                      <span className="breakdown-name" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <span className="breakdown-val">{formatMoney(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scoped Styles */}
      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 0 2rem 2.5rem;
        }

        /* ── ROW 1: 4 STAT CARDS ── */
        .stat-cards-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e8e2f2;
          border-radius: 22px;
          padding: 1.5rem 1.6rem;
          box-shadow: 0 4px 20px rgba(83, 60, 110, 0.03);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(83, 60, 110, 0.07);
        }

        .stat-card-value {
          font-size: 2.1rem;
          font-weight: 800;
          color: #282033;
          letter-spacing: -0.02em;
          margin-bottom: 0.35rem;
          line-height: 1.1;
        }

        .stat-card-label {
          font-size: 0.88rem;
          color: #796e85;
          font-weight: 500;
        }

        /* ── ROW 2: MAIN 2-COLUMN SPLIT ── */
        .main-content-split {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 1.5rem;
          align-items: start;
        }

        /* ── LEFT COLUMN: TIMELINE CARD ── */
        .timeline-card {
          background: #ffffff;
          border: 1px solid #e8e2f2;
          border-radius: 24px;
          padding: 1.75rem 1.85rem;
          box-shadow: 0 4px 24px rgba(83, 60, 110, 0.03);
        }

        .timeline-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .timeline-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #282033;
          margin: 0;
        }

        .pill-action-btn {
          background: #533c6e;
          color: #ffffff;
          border-radius: 9999px;
          padding: 0.48rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 4px 14px rgba(83, 60, 110, 0.25);
          transition: all 0.15s ease;
        }
        .pill-action-btn:hover {
          background: #432f5a;
          color: #ffffff;
          box-shadow: 0 6px 18px rgba(83, 60, 110, 0.35);
        }

        .timeline-empty {
          padding: 1.5rem;
          text-align: center;
          color: #9d92aa;
          font-size: 0.88rem;
          border: 1px dashed #e8e2f2;
          border-radius: 16px;
          background: #faf8fd;
        }

        /* ── RIGHT COLUMN: CHARTS ── */
        .charts-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .chart-card {
          background: #ffffff;
          border: 1px solid #e8e2f2;
          border-radius: 24px;
          padding: 1.5rem 1.6rem;
          box-shadow: 0 4px 24px rgba(83, 60, 110, 0.03);
        }

        .chart-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 0.85rem;
        }

        .chart-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #282033;
        }

        .chart-sub {
          font-size: 0.82rem;
          color: #8c7f99;
          margin-top: 0.15rem;
        }

        .chart-big-number {
          font-size: 1.45rem;
          font-weight: 800;
          color: #282033;
          margin-top: 0.2rem;
        }

        .chart-filters-row {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .filter-pill-select {
          background: #f8f6fc;
          border: 1px solid #e8e2f2;
          border-radius: 9999px;
          padding: 0.3rem 0.85rem;
          font-size: 0.78rem;
          font-weight: 600;
          color: #533c6e;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
        }
        .filter-pill-select:hover {
          background: #f0ebf7;
        }

        .chart-canvas-wrap {
          width: 100%;
          margin-top: 0.5rem;
        }

        /* ── DONUT CARD ── */
        .donut-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .donut-content-split {
          display: grid;
          grid-template-columns: 150px 1fr;
          gap: 1.25rem;
          align-items: center;
        }

        .donut-chart-container {
          position: relative;
          width: 150px;
          height: 150px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .donut-center-text {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .donut-center-val {
          font-size: 0.95rem;
          font-weight: 800;
          color: #282033;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .breakdown-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.82rem;
          padding: 0.2rem 0;
        }

        .breakdown-name-wrap {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          min-width: 0;
        }

        .color-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .breakdown-name {
          color: #645773;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 170px;
        }

        .breakdown-val {
          color: #282033;
          font-weight: 700;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        @media (max-width: 1100px) {
          .stat-cards-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .main-content-split {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .stat-cards-row {
            grid-template-columns: 1fr;
          }
          .dashboard-container {
            padding: 0 1rem 1.5rem;
          }
          .donut-content-split {
            grid-template-columns: 1fr;
            justify-items: center;
          }
        }
      `}</style>
    </div>
  )
}
