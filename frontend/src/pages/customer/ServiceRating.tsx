export function ServiceRating() {
  return (
    <div className="page">
      <h1 className="page-title">Đánh giá dịch vụ</h1>
      <p className="page-desc">Chia sẻ trải nghiệm sau khi nhận xe — giúp gara cải thiện chất lượng.</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="muted" style={{ marginBottom: '1rem' }}>
          Đơn hàng: RO #2026-0318 · Hoàn tất 15/03/2026
        </div>
        <div className="field">
          <label>Điểm tổng thể</label>
          <div style={{ display: 'flex', gap: '0.35rem', fontSize: '1.75rem' }}>
            {'★★★★☆'.split('').map((c, i) => (
              <button
                key={i}
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.25rem 0.35rem', fontSize: '1.5rem' }}
              >
                {c === '★' ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Tiêu chí</label>
          <div className="stack">
            {['Thái độ nhân viên', 'Đúng hẹn', 'Minh bạch chi phí', 'Chất lượng sửa chữa'].map((t) => (
              <div key={t} className="row-between">
                <span>{t}</span>
                <span className="muted">★★★★★</span>
              </div>
            ))}
          </div>
        </div>
        <div className="field">
          <label>Nhận xét (tuỳ chọn)</label>
          <textarea placeholder="Kỹ thuật viên tư vấn rõ ràng, giao xe đúng giờ..." />
        </div>
        <button type="button" className="btn btn-primary">
          Gửi đánh giá
        </button>
      </div>
    </div>
  )
}
