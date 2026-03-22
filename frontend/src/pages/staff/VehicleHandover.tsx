export function VehicleHandover() {
  return (
    <div className="page">
      <h1 className="page-title">Hoàn thành & bàn giao xe</h1>
      <p className="page-desc">Checklist trước khi khách ký nhận và kích hoạt thanh toán.</p>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>RO #2026-0318</h2>
          <div className="stack">
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" /> Rửa xe hoàn tất
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" /> Kiểm tra thử xe / không cảnh báo
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" /> Phụ kiện / đồ cá nhân trả khách
            </label>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" /> Hoá đơn & báo giá đã khớp
            </label>
          </div>
          <div className="field" style={{ marginTop: '1rem' }}>
            <label>Giờ bàn giao dự kiến</label>
            <input type="datetime-local" />
          </div>
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Chữ ký & xác nhận</h2>
          <p className="muted" style={{ marginBottom: '1rem' }}>
            Khách ký trên tablet / SMS OTP — lưu cùng hồ sơ RO.
          </p>
          <div className="field">
            <label>Ghi chú bàn giao</label>
            <textarea placeholder="Hướng dẫn tái kiểm tra sau 500km..." />
          </div>
          <button type="button" className="btn btn-primary">
            Đóng RO & mở thanh toán
          </button>
        </div>
      </div>
    </div>
  )
}
