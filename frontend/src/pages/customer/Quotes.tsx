export function Quotes() {
  return (
    <div className="page">
      <h1 className="page-title">Báo giá & duyệt online</h1>
      <p className="page-desc">Xem chi tiết phụ tùng, công và phê duyệt trước khi thực hiện.</p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row-between">
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>
              Chờ duyệt
            </span>
            <div style={{ fontWeight: 700 }}>BG #Q-2026-0142 · RO #2026-0318</div>
            <div className="muted">Tạo lúc 14:32 — Camry 51A-12345</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-value" style={{ fontSize: '1.35rem' }}>
              12.450.000 ₫
            </div>
            <div className="muted">Đã bao gồm VAT</div>
          </div>
        </div>

        <div className="divider" />

        <div className="table-wrap" style={{ border: 'none' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Hạng mục</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Dầu động cơ 5W-30 (4L)</td>
                <td>1</td>
                <td>1.200.000 ₫</td>
                <td>1.200.000 ₫</td>
              </tr>
              <tr>
                <td>Lọc dầu</td>
                <td>1</td>
                <td>180.000 ₫</td>
                <td>180.000 ₫</td>
              </tr>
              <tr>
                <td>Công thay dầu & kiểm tra 21 điểm</td>
                <td>1</td>
                <td>450.000 ₫</td>
                <td>450.000 ₫</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="row-between" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-danger">
            Từ chối & ghi chú
          </button>
          <button type="button" className="btn btn-primary">
            Duyệt báo giá
          </button>
        </div>
      </div>

      <div className="card card-muted">
        <div className="row-between">
          <div>
            <span className="badge badge-green">Đã duyệt</span>
            <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>BG #Q-2025-0891</div>
            <div className="muted">Hoàn tất thanh toán</div>
          </div>
          <span className="muted">Xem chi tiết →</span>
        </div>
      </div>
    </div>
  )
}
