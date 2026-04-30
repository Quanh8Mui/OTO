import { useEffect, useState } from 'react'
import { api, type ProgressEvent, type RepairOrder } from '../../lib/api'
import { formatDate } from '../../lib/format'

export function RepairStatus() {
  const [order, setOrder] = useState<RepairOrder | null>(null)
  const [events, setEvents] = useState<ProgressEvent[]>([])

  useEffect(() => {
    let active = true
    api.customer.repairOrders()
      .then(async (orders) => {
        if (!active || orders.length === 0) return
        const ro = orders[0]
        setOrder(ro)
        const progress = await api.customer.repairProgress(ro.id)
        if (active) setEvents(progress)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Theo dõi trạng thái sửa chữa</h1>
      <p className="page-desc">Tiến độ cập nhật từ xưởng (demo real-time sau khi nối WebSocket).</p>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="row-between">
          <div>
            <div className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>{order?.status ?? 'Đang tải'}</div>
            <div style={{ fontWeight: 700 }}>
              {order?.orderNumber ?? '-'} · {order?.licensePlate ?? '-'}
            </div>
            <div className="muted">{order?.progressNotes ?? 'Chưa có ghi chú tiến độ'}</div>
          </div>
          <div className="stat" style={{ textAlign: 'right' }}>
            <span className="stat-label">Tiến độ</span>
            <span className="stat-value" style={{ color: 'var(--info)' }}>
              {events.length > 0 ? '80%' : '40%'}
            </span>
          </div>
        </div>
        <div className="divider" />
        <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-deep)', overflow: 'hidden' }}>
          <div
            style={{
              width: events.length > 0 ? '80%' : '40%',
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
