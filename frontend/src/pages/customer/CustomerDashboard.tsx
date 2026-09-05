import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { RealtimeCalendar } from '../../components/RealtimeCalendar'
import { api, type Booking, type Quote, type RepairOrder } from '../../lib/api'

const quick = [
  { to: 'book', title: 'Đặt lịch mới', desc: 'Bảo dưỡng hoặc sửa chữa', icon: '' },
  { to: 'status', title: 'Xe đang sửa', desc: 'Theo dõi tiến độ', icon: '' },
  { to: 'quotes', title: 'Báo giá', desc: 'Xem & duyệt', icon: '' },
  { to: 'payment', title: 'Thanh toán', desc: 'Hoá đơn & ví', icon: '' },
]

export function CustomerDashboard() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])

  useEffect(() => {
    let active = true
    const repairOrdersFn = api.customer.repairOrders
    Promise.all([
      api.customer.bookings(),
      typeof repairOrdersFn === 'function' ? repairOrdersFn() : Promise.resolve([] as RepairOrder[]),
      api.customer.quotes(),
    ])
      .then(([b, o, q]) => {
        if (!active) return
        setBookings(b)
        setOrders(o)
        setQuotes(q)
      })
      .catch(() => {
        // keep UI usable even when backend is down
      })
    return () => {
      active = false
    }
  }, [])

  const upcoming = bookings.filter((x) => x.status === 'PENDING' || x.status === 'CONFIRMED')
  const inProgress = orders.filter((x) => ['INTAKE', 'QUOTING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'PAUSED'].includes(x.status))
  const waitingQuote = quotes.filter((x) => x.status === 'SENT')

  return (
    <div className="page">
      <h1 className="page-title">Xin chào, {user?.fullName ?? 'khách hàng'}</h1>
      <p className="page-desc">Tóm tắt hoạt động xe và lịch hẹn sắp tới.</p>

      <div className="grid-2" style={{ marginBottom: '1.5rem', alignItems: 'start' }}>
        <div className="grid-3">
          <div className="card">
            <div className="stat">
              <span className="stat-label">Lịch hẹn sắp tới</span>
              <span className="stat-value">{upcoming.length}</span>
              <span className="muted">{upcoming[0]?.licensePlate ?? 'Không có lịch hẹn mới'}</span>
            </div>
          </div>
          <div className="card">
            <div className="stat">
              <span className="stat-label">Đang trong xưởng</span>
              <span className="stat-value">{inProgress.length}</span>
              <span className="muted">{inProgress[0]?.orderNumber ?? 'Không có RO đang xử lý'}</span>
            </div>
          </div>
          <div className="card">
            <div className="stat">
              <span className="stat-label">Báo giá chờ duyệt</span>
              <span className="stat-value">{waitingQuote.length}</span>
              <span className="muted">{waitingQuote[0]?.quoteNumber ?? 'Không có yêu cầu'}</span>
            </div>
          </div>
        </div>
        <RealtimeCalendar title="Lịch realtime của khách hàng" compact />
      </div>

      <h2 style={{ fontSize: '1.05rem', marginBottom: '0.75rem' }}>Thao tác nhanh</h2>
      <div className="grid-2">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="card card-muted" style={{ textDecoration: 'none' }}>
            <div className="row-between">
              <div>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>{q.icon}</div>
                <div style={{ fontWeight: 600 }}>{q.title}</div>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {q.desc}
                </div>
              </div>
              <span className="badge badge-amber">Mở</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
