export function RepairStatus() {
  return (
    <div className="page">
      <h1 className="page-title">Theo dõi trạng thái sửa chữa</h1>
      <p className="page-desc">Tiến độ cập nhật từ xưởng (demo real-time sau khi nối WebSocket).</p>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="row-between">
          <div>
            <div className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>
              Đang thực hiện
            </div>
            <div style={{ fontWeight: 700 }}>RO #2026-0318 · Toyota Camry · 51A-12345</div>
            <div className="muted">Bảo dưỡng 40.000 km — ước tính giao xe 18:00 hôm nay</div>
          </div>
          <div className="stat" style={{ textAlign: 'right' }}>
            <span className="stat-label">Tiến độ</span>
            <span className="stat-value" style={{ color: 'var(--info)' }}>
              65%
            </span>
          </div>
        </div>
        <div className="divider" />
        <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-deep)', overflow: 'hidden' }}>
          <div
            style={{
              width: '65%',
              height: '100%',
              background: 'linear-gradient(90deg, var(--info), var(--accent))',
              borderRadius: 999,
            }}
          />
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Nhật ký công việc</h2>
        <div className="timeline">
          <div className="timeline-item">
            <strong>Tiếp nhận & kiểm tra</strong>
            <div className="muted">14:10 — Ghi nhận tình trạng, chụp ảnh hiện trường</div>
          </div>
          <div className="timeline-item">
            <strong>Chờ duyệt báo giá</strong>
            <div className="muted">14:35 — Đã gửi báo giá, khách duyệt lúc 14:50</div>
          </div>
          <div className="timeline-item">
            <strong>Đang thay dầu & lọc</strong>
            <div className="muted">15:20 — Thực hiện trong pit</div>
          </div>
          <div className="timeline-item">
            <strong>Kiểm tra phanh & lốp</strong>
            <div className="muted">Đang thực hiện…</div>
          </div>
        </div>
      </div>
    </div>
  )
}
