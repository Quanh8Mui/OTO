import { useEffect, useMemo, useState } from 'react'
import { api, type RepairOrder } from '../../lib/api'

export function ServiceRating() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [rating, setRating] = useState<number>(4)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true
    api.customer
      .repairOrders()
      .then((data) => {
        if (!active) return
        setOrders(data.filter((order) => order.status === 'DELIVERED' || order.status === 'COMPLETED'))
      })
      .catch((err) => {
        if (!active) return
        setMessage(err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null, [orders, selectedOrderId])

  useEffect(() => {
    if (selectedOrder && selectedOrderId == null) setSelectedOrderId(selectedOrder.id)
  }, [selectedOrder, selectedOrderId])

  async function submit() {
    if (!selectedOrder) {
      setMessage('Không có đơn hàng đủ điều kiện để đánh giá.')
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      await api.customer.createRating({ repairOrderId: selectedOrder.id, rating, comment })
      setMessage('Đã gửi đánh giá.')
      setComment('')
      setRating(4)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể gửi đánh giá')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Đánh giá dịch vụ</h1>
      <p className="page-desc">Chọn đơn hàng đã bàn giao và gửi đánh giá trải nghiệm của bạn.</p>

      <div className="card" style={{ maxWidth: 720 }}>
        <div className="field">
          <label>Đơn hàng đủ điều kiện</label>
          <select value={selectedOrder?.id ?? ''} onChange={(e) => setSelectedOrderId(e.target.value ? Number(e.target.value) : null)}>
            {orders.length === 0 ? <option value="">Chưa có đơn hàng hoàn tất</option> : null}
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNumber} · {order.licensePlate} · {order.status}
              </option>
            ))}
          </select>
          {loading ? <div className="muted" style={{ marginTop: '0.5rem' }}>Đang tải...</div> : null}
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

        <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting || !selectedOrder}>
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
        {message ? <p className="muted" style={{ marginTop: '0.75rem' }}>{message}</p> : null}
      </div>
    </div>
  )
}
