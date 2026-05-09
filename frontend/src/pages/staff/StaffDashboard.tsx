import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { RealtimeCalendar } from '../../components/RealtimeCalendar'
import { api, type RepairOrder } from '../../lib/api'

export function StaffDashboard() {
  const [orders, setOrders] = useState<RepairOrder[]>([])

  useEffect(() => {
    api.staff.repairOrders().then(setOrders).catch(() => {})
  }, [])

  const inProgress = useMemo(
    () => orders.filter((x) => ['INTAKE', 'QUOTING', 'AWAITING_APPROVAL', 'IN_PROGRESS', 'PAUSED'].includes(x.status)),
    [orders],
  )

  return (
    <div className="page">
      <h1 className="page-title">Xưởng hôm nay</h1>
      <p className="page-desc">Tổng quan lệnh sửa chữa và tải công việc.</p>

      <div className="grid-2" style={{ marginBottom: '1.5rem', alignItems: 'start' }}>
        <div className="grid-3">
          <div className="card">
            <div className="stat">
              <span className="stat-label">Xe trong xưởng</span>
              <span className="stat-value">{inProgress.length}</span>
            </div>
          </div>
          <div className="card">
            <div className="stat">
              <span className="stat-label">Báo giá chờ KH</span>
              <span className="stat-value">{orders.filter((x) => x.status === 'AWAITING_APPROVAL').length}</span>
            </div>
          </div>
          <div className="card">
            <div className="stat">
              <span className="stat-label">Yêu cầu kho mới</span>
              <span className="stat-value">-</span>
            </div>
          </div>
        </div>
        <RealtimeCalendar title="Lịch realtime của xưởng" compact />
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
            {orders.map((r, index) => (
              <tr key={r.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{`0${8 + index}:00`}</td>
                <td>{r.licensePlate}</td>
                <td>{r.orderNumber}</td>
                <td>{r.assignedStaffName ?? '-'}</td>
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
