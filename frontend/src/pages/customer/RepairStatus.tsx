import { useEffect, useMemo, useState } from 'react'
import { api, type ProgressEvent, type RepairOrder } from '../../lib/api'
import { formatDate, formatStatus, getStatusBadgeClass } from '../../lib/format'
import { useToast } from '../../context/ToastContext'

const STATUS_PROGRESS: Record<string, number> = {
  INTAKE: 10,
  QUOTING: 25,
  AWAITING_APPROVAL: 40,
  IN_PROGRESS: 60,
  PAUSED: 55,
  COMPLETED: 90,
  DELIVERED: 100,
  CANCELLED: 0,
}

export function RepairStatus() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [events, setEvents] = useState<ProgressEvent[]>([])
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  const order = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  )

  const progressPercent = useMemo(() => {
    if (!order) return 0
    const base = STATUS_PROGRESS[order.status] ?? 20
    const bonus = Math.min(events.length * 5, 15)
    return Math.min(base + bonus, 100)
  }, [order, events])

  useEffect(() => {
    let active = true
    api.customer
      .repairOrders()
      .then((data) => {
        if (!active) return
        setOrders(data)
        if (data[0]) setSelectedOrderId(data[0].id)
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : 'Không thể tải trạng thái sửa chữa')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!order) {
      setEvents([])
      return
    }
    let active = true
    api.customer
      .repairProgress(order.id)
      .then((progress) => {
        if (active) setEvents(progress)
      })
      .catch(() => {
        if (active) setEvents([])
      })
    return () => {
      active = false
    }
  }, [order])

  return (
    <div className="page">
      <h1 className="page-title">Theo dõi trạng thái sửa chữa</h1>
      <p className="page-desc">Chọn lệnh sửa chữa để xem tiến độ cập nhật từ xưởng.</p>

      {loading ? <p className="muted">Đang tải...</p> : null}

      {orders.length > 1 ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="field">
            <label>Chọn lệnh sửa chữa</label>
            <select value={order?.id ?? ''} onChange={(e) => setSelectedOrderId(Number(e.target.value))}>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} · {o.licensePlate} ({formatStatus(o.status)})
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="row-between">
          <div>
            <div className={`badge ${getStatusBadgeClass(order?.status)}`} style={{ marginBottom: '0.5rem' }}>
              {order?.status ? formatStatus(order.status) : 'Chưa có RO'}
            </div>
            <div style={{ fontWeight: 700 }}>
              {order?.orderNumber ?? '-'} · {order?.licensePlate ?? '-'}
            </div>
            <div className="muted">{order?.progressNotes ?? 'Chưa có ghi chú tiến độ'}</div>
          </div>
          <div className="stat" style={{ textAlign: 'right' }}>
            <span className="stat-label">Tiến độ</span>
            <span className="stat-value" style={{ color: 'var(--info)' }}>
              {progressPercent}%
            </span>
          </div>
        </div>
        <div className="divider" />
        <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-deep)', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
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
          {events.map((e) => (
            <div key={e.id} className="timeline-item">
              <strong>{e.stepLabel ?? 'Cập nhật'}</strong>
              <div className="muted">
                {formatDate(e.createdAt)} — {e.message}
              </div>
            </div>
          ))}
          {events.length === 0 ? <div className="muted">Chưa có sự kiện tiến độ.</div> : null}
        </div>
      </div>
    </div>
  )
}
