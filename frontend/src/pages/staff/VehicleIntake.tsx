export function VehicleIntake() {
  return (
    <div className="page">
      <h1 className="page-title">Tiếp nhận xe & ghi nhận tình trạng</h1>
      <p className="page-desc">Check-in khách, km, mức nhiên liệu, checklist ngoại thất.</p>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Thông tin lịch hẹn</h2>
          <div className="field">
            <label>Mã lịch / biển số</label>
            <input placeholder="Quét QR hoặc nhập 51A-..." />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Km hiện tại</label>
              <input type="number" placeholder="40215" />
            </div>
            <div className="field">
              <label>Mức xăng</label>
              <select>
                <option>1/4 bình</option>
                <option>1/2 bình</option>
                <option>3/4 bình</option>
                <option>Đầy</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Ghi chú khách</label>
            <textarea placeholder="Triệu chứng, yêu cầu thêm phụ kiện..." />
          </div>
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Checklist nhanh</h2>
          <div className="stack">
            {['Đèn cảnh báo trên taplo', 'Mức dầu phanh', 'Lốp & lazang', 'Kính & gương'].map((x) => (
              <label key={x} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="checkbox" /> {x}
              </label>
            ))}
          </div>
          <div className="field" style={{ marginTop: '1rem' }}>
            <label>Ảnh hiện trạng (upload)</label>
            <input type="file" accept="image/*" multiple />
          </div>
          <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
            Tạo phiếu tiếp nhận (RO)
          </button>
        </div>
      </div>
    </div>
  )
}
