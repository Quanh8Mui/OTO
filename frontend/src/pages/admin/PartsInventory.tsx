import { useEffect, useState } from 'react'
import { api, type Part } from '../../lib/api'

export function PartsInventory() {
  const [parts, setParts] = useState<Part[]>([])

  useEffect(() => {
    api.admin.parts().then(setParts).catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Quản lý kho phụ tùng</h1>
      <p className="page-desc">SKU, tồn kho, định mức tối thiểu, vị trí.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <button type="button" className="btn btn-primary">
          + Thêm SKU
        </button>
        <button type="button" className="btn btn-ghost">
          Nhập kho
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Tên</th>
              <th>Tồn</th>
              <th>Tối thiểu</th>
              <th>Vị trí</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {parts.map((p) => (
              <tr key={p.sku}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.sku}</td>
                <td>{p.name}</td>
                <td>{p.quantityOnHand}</td>
                <td>{p.minStock}</td>
                <td>{p.category ?? '-'}</td>
                <td>
                  {p.quantityOnHand < p.minStock ? (
                    <span className="badge badge-red">Dưới định mức</span>
                  ) : (
                    <span className="badge badge-green">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
