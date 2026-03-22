export function RepairProgress() {
  return (
    <div className="page">
      <h1 className="page-title">Cập nhật tiến độ sửa chữa</h1>
      <p className="page-desc">Thay đổi trạng thái công đoạn — hiển thị cho khách hàng.</p>

      <div className="card" style={{ maxWidth: 560, marginBottom: '1.25rem' }}>
        <div className="field">
          <label>Chọn RO</label>
          <select>
            <option>RO #2026-0318 · 51A-12345 · BD 40k</option>
            <option>RO #2026-0319 · 59C-77889 · Phanh</option>
          </select>
        </div>
        <div className="field">
          <label>Trạng thái hiện tại</label>
          <select>
            <option>Tiếp nhận</option>
            <option>Chờ phụ tùng</option>
            <option>Đang thực hiện</option>
            <option>Kiểm tra chất lượng</option>
            <option>Rửa xe & bàn giao</option>
          </select>
        </div>
        <div className="field">
          <label>Tiến độ (%)</label>
          <input type="range" min={0} max={100} defaultValue={65} style={{ width: '100%' }} />
        </div>
        <div className="field">
          <label>Ghi chú nội bộ / công khai cho KH</label>
          <textarea placeholder="VD: Đang chờ rotin phanh — dự kiến 30 phút" />
        </div>
        <button type="button" className="btn btn-primary">
          Cập nhật
        </button>
      </div>

      <div className="card card-muted">
        <strong>Webhook / SSE:</strong>{' '}
        <span className="muted">
          Khi backend ghi nhận, client khách hàng nhận tiến độ mới (thiết kế API sau).
        </span>
      </div>
    </div>
  )
}
