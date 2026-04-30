import { useEffect, useState } from 'react'
import { api, type RevenueReport } from '../../lib/api'
import { formatDate, formatMoney } from '../../lib/format'

export function RevenueReports() {
  const today = new Date().toISOString().slice(0, 10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [report, setReport] = useState<RevenueReport | null>(null)

  async function loadReport() {
    const data = await api.admin.revenue(from, to)
    setReport(data)
  }

  useEffect(() => {
    loadReport().catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Báo cáo doanh thu</h1>
      <p className="page-desc">Lọc theo ngày, loại dịch vụ, nhân viên phụ trách.</p>

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
        <div className="field">
          <label>Nhóm báo cáo</label>
          <select>
            <option>Tổng hợp theo ngày</option>
            <option>Theo hạng mục dịch vụ</option>
            <option>Theo kỹ thuật viên</option>
          </select>
        </div>
        <div className="row-between">
          <button type="button" className="btn btn-ghost">
            Xuất Excel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => loadReport().catch(() => {})}>
            Áp dụng
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Số RO</th>
              <th>Doanh thu</th>
              <th>Giảm giá</th>
              <th>Thực thu</th>
            </tr>
          </thead>
          <tbody>
            {report ? (
              <tr>
                <td>{`${formatDate(report.from)} - ${formatDate(report.to)}`}</td>
                <td>{report.paymentCount}</td>
                <td>{formatMoney(report.totalRevenue)}</td>
                <td>0 ₫</td>
                <td>{formatMoney(report.totalRevenue)}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
