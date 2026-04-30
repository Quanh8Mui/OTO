import { useEffect, useState } from 'react'
import { api, type DashboardResponse } from '../../lib/api'
import { formatMoney } from '../../lib/format'

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)

  useEffect(() => {
    api.admin.dashboard().then(setDashboard).catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Dashboard tổng quan</h1>
      <p className="page-desc">Doanh thu, hiệu suất xưởng và cảnh báo kho.</p>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Doanh thu tháng 3</span>
            <span className="stat-value">{formatMoney(dashboard?.revenueToday)}</span>
            <span className="muted">+8% so với tháng trước</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">RO đang mở</span>
            <span className="stat-value">
              {Object.entries(dashboard?.ordersByStatus ?? {}).reduce((acc, [, n]) => acc + n, 0)}
            </span>
            <span className="muted">Trung bình 2,4h / xe</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Cảnh báo kho</span>
            <span className="stat-value">{dashboard?.lowStockPartsCount ?? 0}</span>
            <span className="muted">SKU dưới định mức</span>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Doanh thu 7 ngày</h2>
          <div
            style={{
              height: 160,
              borderRadius: 8,
              background:
                'linear-gradient(180deg, rgba(61,214,140,0.25) 0%, transparent 100%), var(--bg-deep)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '0.75rem',
              gap: 4,
            }}
          >
            {[40, 55, 48, 70, 62, 80, 75].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${h}%`,
                  background: 'linear-gradient(180deg, var(--success), rgba(61,214,140,0.2))',
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
          <p className="muted" style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
            Biểu đồ demo — thay bằng Chart.js / Recharts khi nối API.
          </p>
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Hoạt động gần đây</h2>
          <ul className="stack" style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)' }}>
            {Object.entries(dashboard?.ordersByStatus ?? {}).map(([status, total]) => (
              <li key={status}>
                {status}: {total}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
