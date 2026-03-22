export function Payment() {
  return (
    <div className="page">
      <h1 className="page-title">Thanh toán online</h1>
      <p className="page-desc">Thanh toán hoá đơn sau khi công việc hoàn tất (tích hợp cổng sau).</p>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Hoá đơn chờ thanh toán</h2>
          <div className="stack">
            <div className="row-between">
              <span className="muted">RO #2026-0318</span>
              <span className="badge badge-amber">Chưa TT</span>
            </div>
            <div className="row-between">
              <span>Camry · BD 40k km</span>
              <strong>12.450.000 ₫</strong>
            </div>
            <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
              Thanh toán ngay
            </button>
          </div>
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Phương thức</h2>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="radio" name="pay" defaultChecked /> Ví điện tử (MoMo, ZaloPay)
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="radio" name="pay" /> Thẻ ATM / Visa / Mastercard
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="radio" name="pay" /> Chuyển khoản (QR)
          </label>
        </div>
      </div>

      <h2 style={{ fontSize: '1.05rem', margin: '1.75rem 0 0.75rem' }}>Lịch sử giao dịch</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Ngày</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)' }}>TXN-99821</td>
              <td>15/03/2026</td>
              <td>4.200.000 ₫</td>
              <td>
                <span className="badge badge-green">Thành công</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
