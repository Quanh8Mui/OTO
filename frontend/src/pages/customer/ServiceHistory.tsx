import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type RepairOrder, type ServiceRating, type Vehicle } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { formatStatus, getStatusBadgeClass } from '../../lib/format'

export function ServiceHistory() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [ratings, setRatings] = useState<ServiceRating[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filterPlate, setFilterPlate] = useState('all')
  const { showToast } = useToast()

  useEffect(() => {
    api.customer.repairOrders().then(setOrders).catch((err) => {
      showToast(err instanceof Error ? err.message : 'Không thể tải lịch sử')
    })
    api.customer.ratings().then(setRatings).catch(() => {})
    api.customer.vehicles().then(setVehicles).catch(() => {})
  }, [])

  const filtered = filterPlate === 'all' ? orders : orders.filter((o) => o.licensePlate === filterPlate)

  function handlePrint() {
    window.print()
  }

  return (
    <div className="page">
      {/* Printable Header for PDF/Print */}
      <div className="print-only">
        <div className="print-header">
          <div>
            <h1 className="print-title">GARAGE OTO SERVICES</h1>
            <p style={{ margin: '4px 0', fontSize: '10pt', color: '#4b5563' }}>
              Địa chỉ: 123 Đường Số 1, TP. Hồ Chí Minh | Hotline: 1900 8888
            </p>
            <p style={{ margin: '2px 0', fontSize: '10pt', color: '#4b5563' }}>
              Email: contact@garage.local | Website: garage.local
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '14pt', margin: 0, color: '#111827' }}>SỔ LỊCH SỬ DỊCH VỤ XE</h2>
            <p style={{ margin: '4px 0', fontSize: '10pt' }}>
              Ngày in: {new Date().toLocaleDateString('vi-VN')}
            </p>
            <p style={{ margin: '2px 0', fontSize: '10pt' }}>
              Xe: {filterPlate === 'all' ? 'Tất cả các xe' : filterPlate}
            </p>
          </div>
        </div>
      </div>

      <h1 className="page-title no-print">Lịch sử bảo dưỡng / sửa chữa</h1>
      <p className="page-desc no-print">Theo từng xe trong tài khoản của bạn.</p>

      <div className="row-between no-print" style={{ marginBottom: '1rem' }}>
        <select style={{ maxWidth: 280 }} value={filterPlate} onChange={(e) => setFilterPlate(e.target.value)}>
          <option value="all">Tất cả xe</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.licensePlate}>
              {v.licensePlate}{v.brand ? ` · ${v.brand}` : ''}{v.model ? ` ${v.model}` : ''}
            </option>
          ))}
        </select>
        <button type="button" className="btn btn-ghost" onClick={handlePrint}>
          📄 In / Xuất PDF
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Biển số xe</th>
              <th>Mã lệnh RO</th>
              <th>Ghi chú tiến độ</th>
              <th>Trạng thái</th>
              <th>Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const ratingItem = ratings.find((rt) => rt.repairOrderId === r.id)
              const isEligibleForRating = r.status === 'DELIVERED' || r.status === 'COMPLETED'
              return (
                <tr key={r.id}>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '-'}</td>
                  <td style={{ fontWeight: 600 }}>{r.licensePlate}</td>
                  <td>{r.orderNumber}</td>
                  <td>{r.progressNotes || r.intakeNotes || 'Bảo dưỡng / sửa chữa định kỳ'}</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(r.status)}`}>{formatStatus(r.status)}</span>
                  </td>
                  <td>
                    {ratingItem ? (
                      <span style={{ color: '#eab308', whiteSpace: 'nowrap' }} title={ratingItem.comment || ''}>
                        {'★'.repeat(ratingItem.rating)}
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '4px' }}>
                          ({ratingItem.rating}/5)
                        </span>
                      </span>
                    ) : isEligibleForRating ? (
                      <Link to="/app/customer/rating" className="btn btn-ghost" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}>
                        ⭐ Đánh giá
                      </Link>
                    ) : (
                      <span className="muted" style={{ fontSize: '0.85rem' }}>-</span>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                  Chưa có dữ liệu lịch sử sửa chữa nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Printable Signatures */}
      <div className="print-only">
        <div className="print-signatures">
          <div className="print-signature-box">
            <strong>Khách hàng</strong>
            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0' }}>(Ký và ghi rõ họ tên)</p>
            <div className="print-signature-space" />
          </div>
          <div className="print-signature-box">
            <strong>Đại diện Garage</strong>
            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0' }}>(Ký và đóng dấu)</p>
            <div className="print-signature-space" />
          </div>
        </div>
      </div>
    </div>
  )
}

