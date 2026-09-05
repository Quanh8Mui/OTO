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
} from '../../lib/api'
import { formatMoney, formatStatus } from '../../lib/format'
import { useToast } from '../../context/ToastContext'

const DONUT_COLORS = [
  '#533c6e', // Deep plum
  '#a8d5ed', // Soft sky blue
  '#a3d9b4', // Soft mint
  '#fcc9ba', // Soft peach
  '#ded4ec', // Lavender
  '#fae4a7', // Pale yellow
]

export function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [revenueReport, setRevenueReport] = useState<RevenueReport | null>(null)
  const [dailyData, setDailyData] = useState<DailyRevenueItem[]>([])
  const [breakdownData, setBreakdownData] = useState<Array<{ name: string; value: number }>>([])
  const { showToast } = useToast()

  useEffect(() => {
    const today = new Date()
    const todayStr = today.toISOString().slice(0, 10)
    const firstDayOfMonthStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10)
    const oneYearAgoStr = new Date(today.getFullYear() - 1, today.getMonth() + 1, 1).toISOString().slice(0, 10)

    Promise.allSettled([
      api.admin.dashboard(),
      api.staff.repairOrdersAll(),
      api.staff.bookings(),
      api.admin.revenue(firstDayOfMonthStr, todayStr),
      api.admin.dailyRevenue(oneYearAgoStr, todayStr),
      api.admin.breakdown(),
    ]).then(([dashRes, roRes, bkRes, revRes, dailyRes, bdRes]) => {
      if (dashRes.status === 'fulfilled') setDashboard(dashRes.value)
      if (roRes.status === 'fulfilled') setRepairOrders(roRes.value)
      if (bkRes.status === 'fulfilled') setBookings(bkRes.value)
      if (revRes.status === 'fulfilled') setRevenueReport(revRes.value)
      if (dailyRes.status === 'fulfilled') setDailyData(dailyRes.value)
      if (bdRes.status === 'fulfilled') setBreakdownData(bdRes.value)
    }).catch((err) => {
      showToast(err instanceof Error ? err.message : 'Không thể tải dữ liệu từ server')
    })
  }, [])

  // 1. Top 4 Stat Cards calculated from real DB data
  const activeROsCount = repairOrders.filter(
    (ro) => ro.status !== 'DELIVERED' && ro.status !== 'CANCELLED'
  ).length

  const totalBookingsCount = bookings.length
  const lowStockCount = dashboard?.lowStockPartsCount ?? 0
  const monthRevenue = revenueReport?.totalRevenue ?? dashboard?.revenueToday ?? 0

  // 2. 12-Month Revenue Data aggregated from real payments
  const { twelveMonthsData, total12MonthRevenue } = useMemo(() => {
    const now = new Date()
    const mapByMonth: Record<string, number> = {}

    // Group actual daily records into YYYY-MM
    dailyData.forEach((item) => {
      const ym = item.date.slice(0, 7) // e.g. "2026-08"
      mapByMonth[ym] = (mapByMonth[ym] || 0) + (Number(item.revenue) || 0)
    })

    let sum = 0
    const list = []
    // Build the 12 consecutive months ending at current month
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

  // 3. Category Breakdown Data from real quote lines
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

  // 4. Real Timeline from Database (Bookings & Repair Orders)
  const { todayList, upcomingList } = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)

    // Real bookings for today
    const bksToday = bookings.filter((b) => b.requestedDate === todayStr)
    // Real active repair orders
    const activeROs = repairOrders.filter(
      (ro) => ro.status !== 'DELIVERED' && ro.status !== 'CANCELLED'
    )

    // Merge into today items
    const todayItems: Array<{
      time: string
      title: string
      subtitle: string
      status: string
      tag: string
    }> = []

    // Add today bookings
    bksToday.forEach((b) => {
      todayItems.push({
        time: b.timeSlot || '08:00 - 10:00',
        title: `${b.licensePlate} • Đặt lịch hẹn`,
        subtitle: `${b.serviceTypeLabel || 'Bảo dưỡng định kỳ'}${b.customerName ? ` • KH: ${b.customerName}` : ''}`,
        status: formatStatus(b.status),
        tag: 'Lịch hẹn',
      })
    })

    // Add active repair orders
    activeROs.forEach((ro) => {
      todayItems.push({
        time: 'Trong ngày',
        title: `${ro.licensePlate}${ro.vehicleLabel ? ` • ${ro.vehicleLabel}` : ''}`,
        subtitle: `${ro.intakeNotes || ro.progressNotes || 'Đang sửa chữa'}${ro.assignedStaffName ? ` • KTV: ${ro.assignedStaffName}` : ''}`,
        status: formatStatus(ro.status),
        tag: ro.status === 'IN_PROGRESS' ? 'Đang sửa' : 'Lệnh xưởng',
      })
    })

    // Real upcoming bookings
    const bksUpcoming = bookings.filter((b) => b.requestedDate > todayStr)
    const upcomingItems: Array<{
      time: string
      title: string
      subtitle: string
      status: string
      tag: string
    }> = []

    bksUpcoming.forEach((b) => {
      upcomingItems.push({
        time: `${b.requestedDate} (${b.timeSlot || '08:00 - 10:00'})`,
        title: `${b.licensePlate} • Lịch hẹn tới`,
        subtitle: `${b.serviceTypeLabel || 'Bảo dưỡng định kỳ'}${b.customerName ? ` • KH: ${b.customerName}` : ''}`,
        status: formatStatus(b.status),
        tag: 'Lên lịch',
      })
    })

    // Fallback display if database is empty for upcoming
    if (upcomingItems.length === 0 && repairOrders.some((r) => r.status === 'DELIVERED')) {
      const delivered = repairOrders.filter((r) => r.status === 'DELIVERED')
      delivered.forEach((ro) => {
        upcomingItems.push({
          time: 'Đã hoàn tất',
          title: `${ro.licensePlate}${ro.vehicleLabel ? ` • ${ro.vehicleLabel}` : ''}`,
          subtitle: `Xe đã bàn giao thành công cho khách hàng${ro.customerName ? ` (${ro.customerName})` : ''}`,
          status: 'Đã bàn giao',
          tag: 'Hoàn thành',
        })
      })
    }

    return { todayList: todayItems, upcomingList: upcomingItems }
  }, [bookings, repairOrders])

  return (
    <div className="dashboard-container">
      {/* ── ROW 1: 4 STAT CARDS (100% REAL DB DATA) ── */}
      <div className="stat-cards-row">
        {/* Card 1 */}
        <div className="stat-card">
          <div className="stat-card-value">{activeROsCount}</div>
          <div className="stat-card-label">Xe đang tại xưởng</div>
        </div>

        {/* Card 2 */}
        <div className="stat-card">
          <div className="stat-card-value">{totalBookingsCount}</div>
          <div className="stat-card-label">Tổng lượt đặt lịch</div>
        </div>

        {/* Card 3 */}
        <div className="stat-card">
          <div className="stat-card-value">{lowStockCount}</div>
          <div className="stat-card-label">Cảnh báo tồn kho phụ tùng</div>
        </div>

        {/* Card 4 */}
        <div className="stat-card">
          <div className="stat-card-value">{formatMoney(monthRevenue)}</div>
          <div className="stat-card-label">Doanh thu tháng thực thu</div>
        </div>
      </div>

      {/* ── ROW 2: MAIN 2-COLUMN GRID (60% Left, 40% Right) ── */}
      <div className="main-content-split">
        {/* ── LEFT COLUMN: REAL REPAIR TIMELINE & APPOINTMENTS FROM DB ── */}
        <div className="timeline-card">
          <div className="timeline-card-header">
            <h2 className="timeline-card-title">Tiến độ xe & Lịch sửa chữa thực tế</h2>
            <Link to="/app/staff/schedule" className="pill-action-btn">
              Xem toàn bộ thời khoá biểu
            </Link>
          </div>

          {/* Group 1: Today from Database */}
          <div className="timeline-group">
            <div className="timeline-group-header">Hôm nay - Hoạt động tại xưởng</div>
            <div className="timeline-items-list">
              {todayList.length > 0 ? (
                todayList.map((item, idx) => (
                  <div key={idx} className="timeline-row-item">
                    <div className="timeline-item-main">
                      <span className="time-pill">{item.time}</span>
                      <div className="timeline-item-title">{item.title}</div>
                      <div className="timeline-item-sub">{item.subtitle}</div>
                    </div>
                    <div className="timeline-item-badge">
                      <span className="status-outline-badge">{item.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="timeline-empty">Không có xe đang hoạt động hôm nay</div>
              )}
            </div>
          </div>

          {/* Group 2: Upcoming / Delivered from Database */}
          <div className="timeline-group">
            <div className="timeline-group-header">Lịch hẹn sắp tới & Đã hoàn tất</div>
            <div className="timeline-items-list">
              {upcomingList.length > 0 ? (
                upcomingList.map((item, idx) => (
                  <div key={idx} className="timeline-row-item">
                    <div className="timeline-item-main">
                      <span className="time-pill">{item.time}</span>
                      <div className="timeline-item-title">{item.title}</div>
                      <div className="timeline-item-sub">{item.subtitle}</div>
                    </div>
                    <div className="timeline-item-badge">
                      <span className="status-outline-badge">{item.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="timeline-empty">Chưa có lịch hẹn kế tiếp</div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: REAL CHARTS & FINANCIALS FROM DB ── */}
        <div className="charts-column">
          {/* Card 1: 12-Month Revenue Bar Chart (Real Payments) */}
          <div className="chart-card">
            <div className="chart-card-header">
              <div>
                <div className="chart-title">Doanh thu 12 tháng gần nhất</div>
                <div className="chart-big-number">{formatMoney(total12MonthRevenue)}</div>
              </div>
            </div>

            {/* Filter Pills Row */}
            <div className="chart-filters-row">
              <div className="filter-pill-select">12 tháng ▾</div>
              <div className="filter-pill-select">Biểu đồ cột ▾</div>
              <div className="filter-pill-select">Năm 2026 ▾</div>
            </div>

            {/* Real Bar Chart */}
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

          {/* Card 2: Donut Chart & Category Breakdown (Real Quote Lines) */}
          <div className="chart-card">
            <div className="donut-card-header">
              <div>
                <div className="chart-title">Doanh thu theo nhóm dịch vụ</div>
                <div className="chart-sub">Theo tiền báo giá đã duyệt thực tế</div>
              </div>
              <div className="filter-pill-select">Tháng 9/2026 ▾</div>
            </div>

            <div className="donut-content-split">
              {/* Donut Chart with Center Total */}
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

              {/* Breakdown Legend Table from Real Quote Lines */}
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

      {/* Scoped Styles matching the reference image */}
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

        /* ── LEFT COLUMN: TIMELINE ── */
        .timeline-card {
          background: #ffffff;
          border: 1px solid #e8e2f2;
          border-radius: 24px;
          padding: 1.75rem 1.85rem;
          box-shadow: 0 4px 24px rgba(83, 60, 110, 0.03);
        }

        .timeline-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
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

        .timeline-group {
          margin-bottom: 1.5rem;
        }
        .timeline-group:last-child {
          margin-bottom: 0;
        }

        .timeline-group-header {
          font-size: 0.88rem;
          font-weight: 700;
          color: #4a3c5a;
          margin-bottom: 0.85rem;
        }

        .timeline-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .timeline-row-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.85rem 1.15rem;
          border: 1px solid #f0ebf7;
          border-radius: 16px;
          background: #ffffff;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .timeline-row-item:hover {
          border-color: #ded4ec;
          box-shadow: 0 4px 16px rgba(83, 60, 110, 0.04);
        }

        .timeline-item-main {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          min-width: 0;
        }

        .time-pill {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #533c6e;
          background: #f4eef9;
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
          align-self: flex-start;
          margin-bottom: 0.15rem;
        }

        .timeline-item-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #282033;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-item-sub {
          font-size: 0.82rem;
          color: #8c7f99;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-empty {
          padding: 1rem;
          text-align: center;
          color: #9d92aa;
          font-size: 0.88rem;
          border: 1px dashed #e8e2f2;
          border-radius: 12px;
        }

        .status-outline-badge {
          border: 1px solid #ded4ec;
          background: #faf8fd;
          color: #533c6e;
          border-radius: 9999px;
          padding: 0.25rem 0.8rem;
          font-size: 0.78rem;
          font-weight: 600;
          white-space: nowrap;
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
          transition: background 0.15s ease;
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
