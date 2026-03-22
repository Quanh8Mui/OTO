import { Link } from 'react-router-dom'

const today = [
  { time: '08:30', plate: '51A-12345', job: 'BD 40k', bay: 'Pit 2', status: 'Đang làm' },
  { time: '10:00', plate: '59C-77889', job: 'Thay má phanh', bay: 'Nâng 1', status: 'Chờ phụ tùng' },
]

export function StaffDashboard() {
  return (
    <div className="page">
      <h1 className="page-title">Xưởng hôm nay</h1>
      <p className="page-desc">Tổng quan lệnh sửa chữa và tải công việc.</p>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Xe trong xưởng</span>
            <span className="stat-value">7</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Báo giá chờ KH</span>
            <span className="stat-value">3</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Yêu cầu kho mới</span>
            <span className="stat-value">2</span>
          </div>
        </div>
      </div>

      <div className="row-between" style={{ marginBottom: '0.75rem' }}>
        <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Lịch theo slot</h2>
        <Link to="schedule" className="btn btn-ghost" style={{ padding: '0.4rem 0.75rem' }}>
          Mở lịch đầy đủ
        </Link>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Giờ</th>
              <th>Biển số</th>
              <th>Công việc</th>
              <th>Vị trí</th>
              <th>TT</th>
            </tr>
          </thead>
          <tbody>
            {today.map((r) => (
              <tr key={r.plate + r.time}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{r.time}</td>
                <td>{r.plate}</td>
                <td>{r.job}</td>
                <td>{r.bay}</td>
                <td>
                  <span className="badge badge-blue">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
