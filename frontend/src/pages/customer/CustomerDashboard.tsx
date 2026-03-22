import { Link } from 'react-router-dom'

const quick = [
  { to: 'book', title: 'Đặt lịch mới', desc: 'Bảo dưỡng hoặc sửa chữa', icon: '📅' },
  { to: 'status', title: 'Xe đang sửa', desc: 'Theo dõi tiến độ', icon: '🔧' },
  { to: 'quotes', title: 'Báo giá', desc: 'Xem & duyệt', icon: '📋' },
  { to: 'payment', title: 'Thanh toán', desc: 'Hoá đơn & ví', icon: '💳' },
]

export function CustomerDashboard() {
  return (
    <div className="page">
      <h1 className="page-title">Xin chào, Anh Minh</h1>
      <p className="page-desc">Tóm tắt hoạt động xe và lịch hẹn sắp tới.</p>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Lịch hẹn sắp tới</span>
            <span className="stat-value">1</span>
            <span className="muted">29/03 — 09:00 · Toyota Camry</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Đang trong xưởng</span>
            <span className="stat-value">1</span>
            <span className="muted">Bảo dưỡng định kỳ</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Báo giá chờ duyệt</span>
            <span className="stat-value">0</span>
            <span className="muted">Không có yêu cầu</span>
          </div>
        </div>
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
