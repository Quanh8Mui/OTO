import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { api, type Booking, type StaffSchedule } from '../../lib/api'

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
      label: 'Chờ khách duyệt báo giá',
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

export function WorkSchedule() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [schedules, setSchedules] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED'>('ALL')

  const [newDay, setNewDay] = useState(1)
  const [newStart, setNewStart] = useState('08:00')
  const [newEnd, setNewEnd] = useState('17:00')
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [bookingsData, schedulesData] = await Promise.all([api.staff.bookings('mine'), api.staff.schedules()])
      setBookings(bookingsData)
      setSchedules(schedulesData)
      setMessage(null)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tải lịch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  // All non-cancelled bookings for the selected date belonging to current staff or unassigned
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => {
      if (b.requestedDate !== selectedDate || b.status === 'CANCELLED') return false
      // If assigned to a different staff member, do not display on this staff's schedule
      if (user?.role === 'STAFF' && b.assignedStaffId && user.id && b.assignedStaffId !== user.id) {
        return false
      }
      return true
    })
  }, [bookings, selectedDate, user])

  // Counts for tabs
  const pendingCount = useMemo(() => dayBookings.filter((b) => b.status === 'PENDING').length, [dayBookings])
  const confirmedCount = useMemo(() => dayBookings.filter((b) => b.status === 'CONFIRMED').length, [dayBookings])
  const rejectedCount = useMemo(() => dayBookings.filter((b) => b.quoteStatus === 'REJECTED').length, [dayBookings])

  // Filtered by selected sub-tab
  const filteredBookings = useMemo(() => {
    if (filterType === 'PENDING') return dayBookings.filter((b) => b.status === 'PENDING')
    if (filterType === 'CONFIRMED') return dayBookings.filter((b) => b.status === 'CONFIRMED')
    if (filterType === 'REJECTED') return dayBookings.filter((b) => b.quoteStatus === 'REJECTED')
    return dayBookings
  }, [dayBookings, filterType])

  // Timeline view grid
  const scheduleGrid = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const hour = Number(slot.split(':')[0])
      const matched = dayBookings.filter((b) => {
        const start = b.timeSlot?.split('–')[0]?.trim() ?? b.timeSlot?.split('-')[0]?.trim()
        if (!start) return hour === 8
        return Number(start.split(':')[0]) === hour
      })
      return { slot, bookings: matched }
    })
  }, [dayBookings])

  async function addSchedule() {
    setSaving(true)
    setMessage(null)
    try {
      await api.staff.createSchedule({ dayOfWeek: newDay, startTime: newStart, endTime: newEnd })
      await loadData()
      setMessage('Đã thêm ca làm việc.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể thêm ca')
    } finally {
      setSaving(false)
    }
  }

  async function removeSchedule(id: number) {
    setSaving(true)
    setMessage(null)
    try {
      await api.staff.deleteSchedule(id)
      await loadData()
      setMessage('Đã xóa ca làm việc.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xóa ca')
    } finally {
      setSaving(false)
    }
  }

  // Format header date display
  const formattedDateHeader = useMemo(() => {
    const [y, m, d] = selectedDate.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    const dayOfWeek = DAY_NAMES[dt.getDay()]
    const todayStr = formatDateInput()
    const isToday = selectedDate === todayStr
    return `${dayOfWeek}, ngày ${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y} ${isToday ? '(Hôm nay)' : ''}`
  }, [selectedDate])

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: '1.25rem' }}>
        <div>
          <h1 className="page-title">Lịch hẹn khách & Ca làm việc</h1>
          <p className="page-desc">
            Theo dõi danh sách khách hẹn mang xe đến xưởng theo từng ngày, tiến độ xử lý và ca trực kỹ thuật.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button type="button" className="btn btn-ghost" onClick={() => void loadData()} disabled={loading}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* Date Navigation Toolbar */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '1rem 1.25rem',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Quick date switches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
              onClick={() => setSelectedDate((prev) => shiftDate(prev, -1))}
            >
              ◀ Ngày trước
            </button>
            <button
              type="button"
              className={`btn ${selectedDate === formatDateInput() ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.9rem' }}
              onClick={() => setSelectedDate(formatDateInput())}
            >
              Hôm nay
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.9rem' }}
              onClick={() => setSelectedDate((prev) => shiftDate(prev, 1))}
            >
              Ngày sau ▶
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chọn ngày:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '0.4rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Chế độ xem:</span>
            <div
              style={{
                display: 'inline-flex',
                background: 'var(--bg-subtle)',
                padding: '3px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <button
                type="button"
                className="btn"
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: viewMode === 'list' ? 'var(--bg-panel)' : 'transparent',
                  fontWeight: viewMode === 'list' ? 600 : 400,
                  boxShadow: viewMode === 'list' ? 'var(--shadow-sm)' : 'none',
                }}
                onClick={() => setViewMode('list')}
              >
                📋 Danh sách chi tiết
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  background: viewMode === 'timeline' ? 'var(--bg-panel)' : 'transparent',
                  fontWeight: viewMode === 'timeline' ? 600 : 400,
                  boxShadow: viewMode === 'timeline' ? 'var(--shadow-sm)' : 'none',
                }}
                onClick={() => setViewMode('timeline')}
              >
                🕒 Khung giờ trong ngày
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Date Overview Header & Summary Badges */}
      <div
        className="card"
        style={{
          marginBottom: '1.25rem',
          padding: '1.25rem',
          background: 'linear-gradient(135deg, rgba(83,60,110,0.04) 0%, rgba(144,120,174,0.08) 100%)',
          border: '1px solid var(--border)',
        }}
      >
        <div className="row-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--accent)', fontWeight: 700 }}>
              {formattedDateHeader}
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Có <strong>{dayBookings.length}</strong> lịch hẹn của khách hàng đặt xe vào ngày này.
            </p>
          </div>

          {/* Quick Filter Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn ${filterType === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setFilterType('ALL')}
            >
              Tất cả ({dayBookings.length})
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'PENDING' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setFilterType('PENDING')}
            >
              Chờ tiếp nhận ({pendingCount})
            </button>
            <button
              type="button"
              className={`btn ${filterType === 'CONFIRMED' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}
              onClick={() => setFilterType('CONFIRMED')}
            >
              Đã tiếp nhận ({confirmedCount})
            </button>
            {rejectedCount > 0 && (
              <button
                type="button"
                className={`btn ${filterType === 'REJECTED' ? 'btn-danger' : 'btn-ghost'}`}
                style={{
                  fontSize: '0.85rem',
                  padding: '0.35rem 0.75rem',
                  color: filterType === 'REJECTED' ? '#fff' : 'var(--danger)',
                  borderColor: 'var(--danger)',
                }}
                onClick={() => setFilterType('REJECTED')}
              >
                ⚠️ Từ chối báo giá ({rejectedCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--info-bg)',
            color: 'var(--info)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem',
          }}
        >
          {message}
        </div>
      )}

      {/* Main View: Detailed List or Timeline Grid */}
      {viewMode === 'list' ? (
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div className="row-between" style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '1.05rem' }}>
              Danh sách lịch hẹn ({filteredBookings.length})
            </strong>
          </div>

          {loading ? (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
              Đang tải danh sách lịch hẹn...
            </p>
          ) : filteredBookings.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <p style={{ fontSize: '1.1rem', margin: 0, fontWeight: 500 }}>
                Không có lịch hẹn nào cho ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
                {filterType !== 'ALL' ? ` (theo bộ lọc hiện tại)` : ''}.
              </p>
              <p style={{ fontSize: '0.88rem', marginTop: '0.5rem', marginBottom: 0 }}>
                Bạn có thể bấm "Ngày sau" hoặc chọn ngày khác để xem lịch hẹn của khách.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {filteredBookings.map((b) => {
                const rt = getBookingRealtimeStatus(b)
                return (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                      padding: '1rem 1.25rem',
                      borderRadius: 'var(--radius-sm)',
                      background: rt.isRejected ? '#fff8f8' : 'var(--bg-panel)',
                      border: rt.isRejected ? '1.5px solid #fca5a5' : '1px solid var(--border)',
                      boxShadow: 'var(--shadow-sm)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Top Row: Time, Status, Booking Code */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: 'var(--accent)',
                            background: 'var(--accent-dim)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                          }}
                        >
                          {b.timeSlot ?? '08:00 – 10:00'}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Mã hẹn: <code style={{ fontWeight: 600 }}>{b.bookingNumber}</code>
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          className={`badge ${rt.badgeClass}`}
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          {rt.label}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Customer Info, Vehicle Info, Service Info */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '1rem',
                        padding: '0.65rem 0',
                        borderTop: '1px dashed var(--border-subtle)',
                        borderBottom: '1px dashed var(--border-subtle)',
                      }}
                    >
                      {/* Customer Info */}
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Khách hàng
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--text)', marginTop: '2px' }}>
                          {b.customerName}
                        </div>
                        {b.customerPhone ? (
                          <div style={{ fontSize: '0.88rem', color: 'var(--accent)', marginTop: '2px' }}>
                            <a href={`tel:${b.customerPhone}`} style={{ textDecoration: 'underline' }}>{b.customerPhone}</a>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '2px' }}>
                            (Chưa có SĐT)
                          </div>
                        )}
                      </div>

                      {/* Vehicle Info */}
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Phương tiện
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '3px' }}>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              background: '#ffffff',
                              border: '1.5px solid #1e293b',
                              borderRadius: '4px',
                              padding: '0.15rem 0.5rem',
                              fontSize: '0.92rem',
                              color: '#0f172a',
                              letterSpacing: '1px',
                            }}
                          >
                            {b.licensePlate}
                          </span>
                        </div>
                        {b.vehicleLabel && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            {b.vehicleLabel}
                          </div>
                        )}
                      </div>

                      {/* Service & Request Notes */}
                      <div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Yêu cầu / Dịch vụ
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.92rem', marginTop: '2px', color: 'var(--text)' }}>
                          {b.serviceTypeLabel ?? b.serviceName ?? 'Bảo dưỡng định kỳ'}
                        </div>
                        {b.notes && (
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                            "{b.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Actionable Status Details & Quick Actions */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {b.assignedStaffId ? (
                          <span style={{ fontSize: '0.84rem', color: '#432f5a', background: '#f0eaf7', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                            KTV phụ trách: {b.assignedStaffId === user?.id ? `Bạn (${b.assignedStaffName || user?.fullName})` : b.assignedStaffName}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.84rem', color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 600 }}>
                            Chưa phân công KTV (Chờ tiếp nhận)
                          </span>
                        )}
                        {rt.isRejected ? (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              background: '#fee2e2',
                              padding: '0.3rem 0.65rem',
                              borderRadius: '6px',
                              color: '#991b1b',
                              fontSize: '0.84rem',
                              fontWeight: 600,
                            }}
                          >
                            <span>{rt.desc}</span>
                          </div>
                        ) : rt.desc ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            {rt.desc}
                          </span>
                        ) : null}
                      </div>

                      {/* Quick Action Buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {b.status === 'PENDING' && (
                          <Link
                            to="/app/staff/intake"
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
                          >
                            Tiếp nhận xe ngay ➔
                          </Link>
                        )}
                        {b.quoteStatus === 'REJECTED' && (
                          <Link
                            to="/app/staff/quote"
                            className="btn btn-danger"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
                          >
                            Xem & Điều chỉnh báo giá
                          </Link>
                        )}
                        {b.repairOrderStatus === 'IN_PROGRESS' && (
                          <Link
                            to="/app/staff/progress"
                            className="btn btn-ghost"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
                          >
                            Xem tiến độ sửa
                          </Link>
                        )}
                        {b.repairOrderStatus === 'COMPLETED' && (
                          <Link
                            to="/app/staff/handover"
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
                          >
                            Bàn giao xe
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* Timeline View */
        <div className="table-wrap" style={{ marginBottom: '1.5rem' }}>
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Khung giờ</th>
                <th>Danh sách lịch hẹn của khách</th>
              </tr>
            </thead>
            <tbody>
              {scheduleGrid.map((row) => (
                <tr key={row.slot}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.slot}</td>
                  <td>
                    {row.bookings.length === 0 ? (
                      <span className="muted">—</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {row.bookings.map((b) => {
                          const rt = getBookingRealtimeStatus(b)
                          return (
                            <div
                              key={b.id}
                              style={{
                                padding: '0.4rem 0.75rem',
                                borderRadius: '6px',
                                background: rt.isRejected ? '#fff8f8' : 'var(--bg-panel)',
                                border: rt.isRejected ? '1px solid #fca5a5' : '1px solid var(--border)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.5rem',
                              }}
                            >
                              <div>
                                <strong style={{ color: 'var(--text)' }}>
                                  {b.licensePlate}
                                </strong>
                                {' — '}
                                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                                  {b.customerName}
                                </span>
                                {b.customerPhone ? (
                                  <span className="muted" style={{ fontSize: '0.85rem', marginLeft: '0.35rem' }}>
                                    ({b.customerPhone})
                                  </span>
                                ) : null}
                                {' · '}
                                <span className="muted">
                                  {b.serviceTypeLabel ?? b.serviceName ?? 'Dịch vụ'}
                                </span>
                              </div>
                              <span className={`badge ${rt.badgeClass}`} style={{ fontSize: '0.82rem' }}>
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


      {/* Weekly Staff Work Schedule Section */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="row-between" style={{ marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700 }}>
              Ca làm việc của nhân viên trong tuần
            </h2>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Đăng ký và quản lý ca trực kỹ thuật cá nhân trong tuần.
            </p>
          </div>
        </div>

        <div className="grid-3" style={{ marginBottom: '1rem' }}>
          <div className="field">
            <label>Thứ / Ngày</label>
            <select value={newDay} onChange={(e) => setNewDay(Number(e.target.value))}>
              {DAY_NAMES.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Giờ bắt đầu</label>
            <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
          </div>
          <div className="field">
            <label>Giờ kết thúc</label>
            <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => void addSchedule()}
          disabled={saving}
          style={{ marginBottom: '1.25rem' }}
        >
          + Thêm ca làm việc
        </button>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Thứ / Ngày</th>
                <th>Khung giờ ca trực</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{DAY_NAMES[s.dayOfWeek] ?? `Ngày ${s.dayOfWeek}`}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {s.startTime} – {s.endTime}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      style={{ color: 'var(--danger)', padding: '0.25rem 0.6rem', fontSize: '0.85rem' }}
                      onClick={() => void removeSchedule(s.id)}
                      disabled={saving}
                    >
                      Xóa ca
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    Chưa đăng ký ca làm việc nào trong tuần.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
