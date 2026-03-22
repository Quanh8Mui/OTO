const parts = [
  { sku: 'OIL-5W30-4L', name: 'Dầu 5W-30 (4L)', qty: 42, min: 20, loc: 'Kệ A1' },
  { sku: 'FIL-OEM-001', name: 'Lọc dầu OEM', qty: 8, min: 15, loc: 'Kệ A2' },
  { sku: 'BRK-F-FD', name: 'Má phanh trước (bộ)', qty: 3, min: 4, loc: 'Kệ C3' },
]

export function PartsInventory() {
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
                <td>{p.qty}</td>
                <td>{p.min}</td>
                <td>{p.loc}</td>
                <td>
                  {p.qty < p.min ? <span className="badge badge-red">Dưới định mức</span> : <span className="badge badge-green">OK</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
