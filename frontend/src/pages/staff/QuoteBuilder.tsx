export function QuoteBuilder() {
  return (
    <div className="page">
      <h1 className="page-title">Lập báo giá (phụ tùng + công)</h1>
      <p className="page-desc">Gắn với kho phụ tùng và bảng giá công chuẩn.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <div>
          <span className="badge badge-blue">RO #2026-0318</span>
          <div style={{ marginTop: '0.35rem', fontWeight: 600 }}>Camry 51A-12345 · BD 40k km</div>
        </div>
        <button type="button" className="btn btn-ghost">
          Thêm từ danh mục
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="table-wrap" style={{ border: 'none' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Phụ tùng</td>
                <td>Dầu 5W-30 (4L)</td>
                <td>
                  <input type="number" defaultValue={1} style={{ width: 56 }} />
                </td>
                <td>1.200.000 ₫</td>
                <td>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }}>
                    ✕
                  </button>
                </td>
              </tr>
              <tr>
                <td>Công</td>
                <td>Thay dầu + 21 điểm</td>
                <td>1</td>
                <td>450.000 ₫</td>
                <td>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }}>
                    ✕
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="divider" />
        <div className="row-between">
          <span className="muted">VAT 10%</span>
          <strong>Tạm tính: 12.450.000 ₫</strong>
        </div>
        <div className="row-between" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-ghost">
            Lưu nháp
          </button>
          <button type="button" className="btn btn-primary">
            Gửi báo giá cho khách
          </button>
        </div>
      </div>
    </div>
  )
}
