import { useEffect, useMemo, useState } from 'react'
import { api, type RepairOrder } from '../../lib/api'

const CHECKLIST_ITEMS = [
  'Rửa xe hoàn tất',
  'Kiểm tra thử xe / không cảnh báo',
  'Phụ kiện / đồ cá nhân trả khách',
  'Hoá đơn & báo giá đã khớp',
] as const

export function VehicleHandover() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [handoverNote, setHandoverNote] = useState('')
  const [handoverAt, setHandoverAt] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const readyOrders = useMemo(() => orders.filter((o) => o.status === 'COMPLETED'), [orders])
  const selectedOrder = useMemo(
    () => readyOrders.find((o) => o.id === selectedOrderId) ?? readyOrders[0] ?? null,
    [readyOrders, selectedOrderId],
  )

  useEffect(() => {
    let active = true
    api.staff
      .repairOrdersAll()
      .then((data) => {
        if (!active) return
        setOrders(data)
        const firstReady = data.find((o) => o.status === 'COMPLETED')
        if (firstReady) setSelectedOrderId(firstReady.id)
      })
      .catch((err) => {
        if (active) setMessage(err instanceof Error ? err.message : 'Không thể tải danh sách RO')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const allChecked = CHECKLIST_ITEMS.every((item) => checked[item])

  async function submitHandover() {
    if (!selectedOrder) {
      setMessage('Chọn RO cần bàn giao.')
      return
    }
    if (!allChecked) {
      setMessage('Hoàn thành checklist trước khi bàn giao.')
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      const updated = await api.staff.handover(selectedOrder.id)
      setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)))
      setMessage(`Đã bàn giao xe ${updated.licensePlate} (${updated.orderNumber}). Trạng thái: ${updated.status}.`)
      setChecked({})
      setHandoverNote('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể bàn giao xe')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Hoàn thành & bàn giao xe</h1>
      <p className="page-desc">Chỉ RO đã hoàn thành sửa chữa (COMPLETED) mới có thể bàn giao cho khách.</p>

      {loading ? <p className="muted">Đang tải...</p> : null}

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Chọn RO sẵn sàng bàn giao</h2>
          {readyOrders.length === 0 ? (
            <p className="muted">Chưa có RO nào ở trạng thái COMPLETED. Hoàn thành sửa chữa trước khi bàn giao.</p>
          ) : (
            <div className="stack" style={{ marginBottom: '1rem' }}>
              {readyOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  className="card"
                  onClick={() => setSelectedOrderId(order.id)}
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    background: order.id === selectedOrder?.id ? 'var(--accent-dim)' : 'var(--bg-panel)',
                    border: order.id === selectedOrder?.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  <strong>{order.orderNumber}</strong>
                  <div className="muted" style={{ marginTop: '0.35rem' }}>
                    {order.licensePlate} · {order.customerName}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedOrder ? (
            <>
              <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Checklist — {selectedOrder.orderNumber}</h2>
              <div className="stack">
                {CHECKLIST_ITEMS.map((item) => (
                  <label key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={!!checked[item]}
                      onChange={(e) => setChecked((current) => ({ ...current, [item]: e.target.checked }))}
                    />
                    {item}
                  </label>
                ))}
              </div>
              <div className="field" style={{ marginTop: '1rem' }}>
                <label>Giờ bàn giao dự kiến</label>
                <input type="datetime-local" value={handoverAt} onChange={(e) => setHandoverAt(e.target.value)} />
              </div>
            </>
          ) : null}
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Xác nhận bàn giao</h2>
          {selectedOrder ? (
            <>
              <p className="muted" style={{ marginBottom: '1rem' }}>
                Khách: <strong>{selectedOrder.customerName}</strong> · Xe: <strong>{selectedOrder.licensePlate}</strong>
              </p>
              <div className="field">
                <label>Ghi chú bàn giao</label>
                <textarea
                  value={handoverNote}
                  onChange={(e) => setHandoverNote(e.target.value)}
                  placeholder="Hướng dẫn tái kiểm tra sau 500km..."
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void submitHandover()}
                disabled={submitting || !allChecked}
              >
                {submitting ? 'Đang xử lý...' : 'Đóng RO & bàn giao xe'}
              </button>
            </>
          ) : (
            <p className="muted">Chọn RO từ danh sách bên trái.</p>
          )}
          {message ? <p className="muted" style={{ marginTop: '1rem' }}>{message}</p> : null}
        </div>
      </div>
    </div>
  )
}
