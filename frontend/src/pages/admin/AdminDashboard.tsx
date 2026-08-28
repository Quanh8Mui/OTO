import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { RealtimeCalendar } from '../../components/RealtimeCalendar'
import { api, type DashboardResponse, type DailyRevenueItem } from '../../lib/api'
import { formatMoney } from '../../lib/format'
import { useToast } from '../../context/ToastContext'

const STATUS_COLORS: Record<string, string> = {
  INTAKE: '#6cb6ff',
  QUOTING: '#f5b84a',
  AWAITING_APPROVAL: '#e8a317',
  IN_PROGRESS: '#3dd68c',
  PAUSED: '#f07178',
  COMPLETED: '#4caf50',
  DELIVERED: '#8bc34a',
  CANCELLED: '#666',
}

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [dailyData, setDailyData] = useState<DailyRevenueItem[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    api.admin.dashboard().then(setDashboard).catch((err) => {
      showToast(err instanceof Error ? err.message : 'Không thể tải dashboard')
    })
    api.admin.dailyRevenue().then(setDailyData).catch(() => {})
  }, [])

  const pieData = Object.entries(dashboard?.ordersByStatus ?? {})
    .filter(([, v]) => v > 0)
    .map(([status, count]) => ({ name: status, value: count }))

  return (
    <div className="page">
      <h1 className="page-title">Dashboard tổng quan</h1>
      <p className="page-desc">Doanh thu, hiệu suất xưởng và cảnh báo kho.</p>

      <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Doanh thu hôm nay</span>
            <span className="stat-value">{formatMoney(dashboard?.revenueToday)}</span>
            <span className="muted">Cập nhật realtime</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">RO đang mở</span>
            <span className="stat-value">
              {Object.entries(dashboard?.ordersByStatus ?? {}).reduce((acc, [, n]) => acc + n, 0)}
            </span>
            <span className="muted">Tất cả trạng thái</span>
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
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Doanh thu 7 ngày gần nhất</h2>
          <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={dailyData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#8b93a7', fontSize: 11 }}
                  tickFormatter={(d: string) => {
                    const parts = d.split('-')
                    return `${parts[2]}/${parts[1]}`
                  }}
                />
                <YAxis
                  tick={{ fill: '#8b93a7', fontSize: 11 }}
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}tr` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}k` : String(v)
                  }
                />
                <Tooltip
                  contentStyle={{ background: '#181c26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8eaef' }}
                  formatter={(value) => [formatMoney(Number(value) || 0), 'Doanh thu']}
                  labelFormatter={(label) => `Ngày ${label}`}
                />
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3dd68c" />
                    <stop offset="100%" stopColor="rgba(61,214,140,0.2)" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {dailyData.length === 0 ? (
            <p className="muted" style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
              Chưa có dữ liệu thanh toán trong 7 ngày qua.
            </p>
          ) : null}
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Phân bổ RO theo trạng thái</h2>
          {pieData.length > 0 ? (
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={30}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] ?? '#888'} />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#181c26', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#e8eaef' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="muted">Chưa có RO nào.</p>
          )}
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: '1rem' }}>
        <RealtimeCalendar title="Lịch realtime của admin" compact />
        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Hoạt động gần đây</h2>
          <ul className="stack" style={{ margin: 0, paddingLeft: '1.1rem', color: 'var(--text-muted)' }}>
            {Object.entries(dashboard?.ordersByStatus ?? {}).map(([status, total]) => (
              <li key={status}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[status] ?? '#888', marginRight: '0.5rem' }} />
                {status}: {total}
              </li>
            ))}
          </ul>
          {dashboard?.pendingPartsRequests ? (
            <p className="muted" style={{ marginTop: '0.75rem' }}>
              ⚠️ {dashboard.pendingPartsRequests} phiếu yêu cầu kho chờ duyệt
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}
