import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { api, type RevenueReport, type DailyRevenueItem } from '../../lib/api'
import { formatDate, formatMoney } from '../../lib/format'
import { useToast } from '../../context/ToastContext'

export function RevenueReports() {
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [from, setFrom] = useState(thirtyDaysAgo)
  const [to, setTo] = useState(today)
  const [report, setReport] = useState<RevenueReport | null>(null)
  const [dailyList, setDailyList] = useState<DailyRevenueItem[]>([])
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  async function loadReport() {
    setLoading(true)
    try {
      const [data, daily] = await Promise.all([
        api.admin.revenue(from, to),
        api.admin.dailyRevenue(from, to).catch(() => [] as DailyRevenueItem[]),
      ])
      setReport(data)
      setDailyList(daily)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Không thể tải báo cáo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReport()
  }, [])

  function exportExcel() {
    if (!report && dailyList.length === 0) {
      showToast('Không có dữ liệu để xuất Excel', 'info')
      return
    }

    const rows = dailyList.length > 0 
      ? dailyList.map((d) => ({
          'Ngày': d.date,
          'Số giao dịch': d.paymentCount,
          'Doanh thu (VNĐ)': d.revenue,
        }))
      : [{
          'Khoảng thời gian': `${formatDate(report?.from ?? '')} - ${formatDate(report?.to ?? '')}`,
          'Số giao dịch': report?.paymentCount ?? 0,
          'Tổng doanh thu (VNĐ)': report?.totalRevenue ?? 0,
        }]

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DoanhThu')
    XLSX.writeFile(workbook, `bao-cao-doanh-thu_${from}_${to}.xlsx`)
    showToast('Đã xuất file Excel thành công!', 'success')
  }

  return (
    <div className="page">
      <h1 className="page-title">Báo cáo doanh thu</h1>
      <p className="page-desc">Thống kê doanh thu theo khoảng thời gian và xuất file Excel.</p>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="grid-2">
          <div className="field">
            <label>Từ ngày</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field">
            <label>Đến ngày</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <div className="row-between" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={exportExcel}>
            📊 Xuất Excel
          </button>
          <button type="button" className="btn btn-primary" onClick={loadReport} disabled={loading}>
            {loading ? 'Đang tải...' : 'Áp dụng lọc'}
          </button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Tổng doanh thu</span>
            <span className="stat-value" style={{ color: 'var(--success)' }}>
              {formatMoney(report?.totalRevenue ?? 0)}
            </span>
            <span className="muted">{formatDate(report?.from ?? from)} - {formatDate(report?.to ?? to)}</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Số lượt thanh toán</span>
            <span className="stat-value">{report?.paymentCount ?? 0}</span>
            <span className="muted">Giao dịch hoàn tất</span>
          </div>
        </div>
        <div className="card">
          <div className="stat">
            <span className="stat-label">Trung bình / đơn</span>
            <span className="stat-value">
              {formatMoney(report && report.paymentCount > 0 ? report.totalRevenue / report.paymentCount : 0)}
            </span>
            <span className="muted">Giá trị trung bình</span>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Số GD</th>
              <th>Doanh thu</th>
            </tr>
          </thead>
          <tbody>
            {dailyList.length > 0 ? (
              dailyList.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{d.paymentCount}</td>
                  <td style={{ fontWeight: 600, color: d.revenue > 0 ? 'var(--success)' : 'inherit' }}>
                    {formatMoney(d.revenue)}
                  </td>
                </tr>
              ))
            ) : report ? (
              <tr>
                <td>{`${formatDate(report.from)} - ${formatDate(report.to)}`}</td>
                <td>{report.paymentCount}</td>
                <td>{formatMoney(report.totalRevenue)}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan={3} className="muted" style={{ textAlign: 'center' }}>
                  Chưa có dữ liệu báo cáo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

