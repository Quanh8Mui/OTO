import { useState } from 'react'
import { api } from '../../lib/api'

export function ServiceRating() {
  const [repairOrderId, setRepairOrderId] = useState<number>(1)
  const [rating, setRating] = useState<number>(4)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function submit() {
    try {
      await api.customer.createRating({ repairOrderId, rating, comment })
      setMessage('Đã gửi đánh giá.')
      setComment('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể gửi đánh giá')
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Đánh giá dịch vụ</h1>
      <p className="page-desc">Chia sẻ trải nghiệm sau khi nhận xe — giúp gara cải thiện chất lượng.</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="muted" style={{ marginBottom: '1rem' }}>
          Đơn hàng (repairOrderId):{' '}
          <input
            type="number"
            value={repairOrderId}
            onChange={(e) => setRepairOrderId(Number(e.target.value))}
            style={{ width: 100, marginLeft: 6 }}
          />
        </div>
        <div className="field">
          <label>Điểm tổng thể</label>
          <div style={{ display: 'flex', gap: '0.35rem', fontSize: '1.75rem' }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className="btn btn-ghost"
                style={{ padding: '0.25rem 0.35rem', fontSize: '1.5rem' }}
                onClick={() => setRating(value)}
              >
                {value <= rating ? '★' : '☆'}
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
          <textarea
            placeholder="Kỹ thuật viên tư vấn rõ ràng, giao xe đúng giờ..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <button type="button" className="btn btn-primary" onClick={submit}>
          Gửi đánh giá
        </button>
        {message ? <p className="muted" style={{ marginTop: '0.75rem' }}>{message}</p> : null}
      </div>
    </div>
  )
}
