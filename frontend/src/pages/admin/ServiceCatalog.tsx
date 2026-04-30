import { useEffect, useState } from 'react'
import { api, type ServiceItem } from '../../lib/api'
import { formatMoney } from '../../lib/format'

export function ServiceCatalog() {
  const [services, setServices] = useState<ServiceItem[]>([])
  useEffect(() => {
    api.admin.services().then(setServices).catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Danh mục dịch vụ & giá</h1>
      <p className="page-desc">Gói công chuẩn để nhân viên lắp vào báo giá.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <select defaultValue="all">
          <option value="all">Tất cả nhóm</option>
          <option>Định kỳ</option>
          <option>Điện / điều hoà</option>
          <option>Phanh</option>
        </select>
        <button type="button" className="btn btn-primary">
          + Thêm dịch vụ
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên dịch vụ</th>
              <th>Giá đề xuất</th>
              <th>Nhóm</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.code}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.code}</td>
                <td>{s.name}</td>
                <td>{formatMoney(s.basePrice)}</td>
                <td>{s.active ? 'Hoạt động' : 'Tạm dừng'}</td>
                <td>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
