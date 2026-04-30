import { useEffect, useState } from 'react'
import { api, type RepairOrder } from '../../lib/api'

export function ServiceHistory() {
  const [orders, setOrders] = useState<RepairOrder[]>([])

  useEffect(() => {
    api.customer.repairOrders().then(setOrders).catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Lịch sử bảo dưỡng / sửa chữa</h1>
      <p className="page-desc">Theo từng xe trong tài khoản của bạn.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <select style={{ maxWidth: 280 }} defaultValue="all">
          <option value="all">Tất cả xe</option>
          <option>51A-12345 · Camry</option>
          <option>51B-99999 · Fortuner</option>
        </select>
        <button type="button" className="btn btn-ghost">
          Xuất PDF
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Xe</th>
              <th>Dịch vụ</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((r) => (
              <tr key={r.id}>
                <td>-</td>
                <td>{r.licensePlate}</td>
                <td>{r.orderNumber}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>-</td>
                <td>
                  <span className="badge badge-green">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
