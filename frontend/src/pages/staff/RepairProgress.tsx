import { useEffect, useMemo, useState } from 'react'
import { api, type ProgressEvent, type RepairOrderResponse } from '../../lib/api'

const statusOptions = [
  'INTAKE',
  'QUOTING',
  'AWAITING_APPROVAL',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'DELIVERED',
] as const

function statusLabel(status?: string) {
  switch (status) {
    case 'INTAKE':
      return 'Tiếp nhận'
    case 'QUOTING':
      return 'Lập báo giá'
    case 'AWAITING_APPROVAL':
      return 'Chờ duyệt'
    case 'IN_PROGRESS':
      return 'Đang sửa chữa'
    case 'PAUSED':
      return 'Tạm dừng'
    case 'COMPLETED':
      return 'Hoàn thành'
    case 'DELIVERED':
      return 'Đã bàn giao'
    default:
      return status ?? '-'
  }
}

function statusBadge(status?: string) {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return 'badge-green'
    case 'PAUSED':
      return 'badge-amber'
    case 'AWAITING_APPROVAL':
      return 'badge-blue'
    default:
      return 'badge-blue'
  }
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function RepairProgress() {
  const [orders, setOrders] = useState<RepairOrderResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [order, setOrder] = useState<RepairOrderResponse | null>(null)
  const [history, setHistory] = useState<ProgressEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<string>('IN_PROGRESS')
  const [progressNotes, setProgressNotes] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  async function loadOrders() {
    const data = await api.staff.repairOrders()
    setOrders(data)
    if (!selectedId && data[0]) setSelectedId(data[0].id)
    return data
  }

  async function loadOrder(id: number) {
    try {
      const [detail, events] = await Promise.all([api.staff.repairOrder(id), api.staff.repairProgress(id)])
      setOrder(detail)
      setHistory(events)
      setStatus(detail.status)
      setProgressNotes(detail.progressNotes ?? '')
      setMessage(null)
    } catch (err) {
      setOrder(null)
      setHistory([])
      setMessage(err instanceof Error ? err.message : 'Không thể tải RO')
    }
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await loadOrders()
        if (active && data[0]) {
          await loadOrder(data[0].id)
        }
      } catch (err) {
        if (active) setMessage(err instanceof Error ? err.message : 'Không thể tải dữ liệu')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    loadOrder(selectedId).finally(() => setLoading(false))
  }, [selectedId])

  const currentStatusLabel = useMemo(() => statusLabel(order?.status), [order?.status])
  const isClosed = order?.status === 'COMPLETED' || order?.status === 'DELIVERED'

  async function saveUpdate() {
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await api.staff.updateRepairStatus(selectedId, { status, progressNotes })
      await api.staff.addRepairProgress(selectedId, {
        stepLabel: statusLabel(status),
        message: progressNotes.trim() || `Cập nhật trạng thái: ${statusLabel(status)}`,
      })
      setOrder(updated)
      const events = await api.staff.repairProgress(selectedId)
      setHistory(events)
      setMessage('Đã cập nhật tiến độ.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể cập nhật tiến độ')
    } finally {
      setSaving(false)
    }
  }

  async function completeWork() {
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    try {
      const updated = await api.staff.completeWork(selectedId)
      setOrder(updated)
      setStatus(updated.status)
      const events = await api.staff.repairProgress(selectedId)
      setHistory(events)
      setMessage('Đã chuyển sang trạng thái hoàn thành.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể hoàn thành công việc')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Tiến độ sửa chữa</h1>
      <p className="page-desc">Theo dõi RO như ngoài gara thật: xem trạng thái, cập nhật tiến độ và lịch sử thao tác.</p>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.75rem' }}>
              <h2 style={{ margin: 0, fontSize: '1rem' }}>Danh sách RO</h2>
              <span className="badge badge-blue">{orders.length} RO</span>
            </div>
            {loading && orders.length === 0 ? <p className="muted">Đang tải...</p> : null}
            <div className="stack" style={{ maxHeight: 320, overflow: 'auto' }}>
              {orders.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className="card"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    background: item.id === selectedId ? 'var(--accent-dim)' : 'var(--bg-panel)',
                    border: item.id === selectedId ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  <strong>{item.orderNumber}</strong>
                  <div className="muted" style={{ marginTop: '0.35rem' }}>
                    {item.licensePlate} · {item.customerName}
                  </div>
                  <div className="muted" style={{ marginTop: '0.2rem' }}>
                    {item.vehicleLabel || 'Xe'}
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="stack">
          <div className="card">
            {order ? (
              <>
                <div className="row-between" style={{ marginBottom: '1rem' }}>
                  <div>
                    <span className={`badge ${statusBadge(order.status)}`}>{statusLabel(order.status)}</span>
                    <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.15rem' }}>{order.orderNumber}</h2>
                    <div className="muted" style={{ marginTop: '0.35rem' }}>
                      {order.customerName} · {order.licensePlate} · {order.vehicleLabel || 'Xe'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="muted">Thời gian tạo</div>
                    <strong>{formatDate(order.createdAt)}</strong>
                  </div>
                </div>

                <div className="grid-3" style={{ marginBottom: '1rem' }}>
                  <div className="card card-muted">
                    <div className="muted">RO</div>
                    <strong>{order.orderNumber}</strong>
                  </div>
                  <div className="card card-muted">
                    <div className="muted">Trạng thái</div>
                    <strong>{currentStatusLabel}</strong>
                  </div>
                  <div className="card card-muted">
                    <div className="muted">Phụ trách</div>
                    <strong>{order.assignedStaffName || '-'}</strong>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: '1rem' }}>
                  <div className="card card-muted">
                    <h3 style={{ marginTop: 0, fontSize: '0.98rem' }}>Thông tin RO</h3>
                    <div className="stack">
                      <div><span className="muted">Khách hàng:</span> {order.customerName}</div>
                      <div><span className="muted">Biển số:</span> {order.licensePlate}</div>
                      <div><span className="muted">Xe:</span> {order.vehicleLabel || '-'}</div>
                      <div><span className="muted">Ghi chú tiếp nhận:</span> {order.intakeNotes || '-'}</div>
                      <div><span className="muted">Ghi chú tiến độ:</span> {order.progressNotes || '-'}</div>
                    </div>
                  </div>

                  <div className="card card-muted">
                    <h3 style={{ marginTop: 0, fontSize: '0.98rem' }}>Tiến độ hiện tại</h3>
                    <div className="row-between">
                      <span className={`badge ${statusBadge(order.status)}`}>{currentStatusLabel}</span>
                      <span className="muted">{isClosed ? 'Đã kết thúc' : 'Đang mở'}</span>
                    </div>
                    <div className="divider" />
                    <div className="stack">
                      {statusOptions.map((item) => (
                        <div key={item} className="row-between">
                          <span>{statusLabel(item)}</span>
                          <span className={`badge ${order.status === item ? 'badge-green' : 'badge-blue'}`}>{order.status === item ? 'Hiện tại' : 'Bước'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="card card-muted">
                    <h3 style={{ marginTop: 0, fontSize: '0.98rem' }}>Lịch sử cập nhật</h3>
                    <div className="stack" style={{ maxHeight: 320, overflow: 'auto' }}>
                      {history.length === 0 ? <p className="muted">Chưa có lịch sử.</p> : null}
                      {history.map((item) => (
                        <div key={item.id} className="card" style={{ padding: '0.85rem 1rem' }}>
                          <div className="row-between">
                            <strong>{item.stepLabel || 'Cập nhật'}</strong>
                            <span className="muted" style={{ fontSize: '0.85rem' }}>{formatDate(item.createdAt)}</span>
                          </div>
                          <div style={{ marginTop: '0.35rem' }}>{item.message}</div>
                          <div className="muted" style={{ marginTop: '0.25rem', fontSize: '0.85rem' }}>
                            {item.createdByName || 'Hệ thống'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card">
                    <h3 style={{ marginTop: 0, fontSize: '0.98rem' }}>Form update</h3>
                    <div className="field">
                      <label>Trạng thái mới</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        {statusOptions.map((item) => (
                          <option key={item} value={item}>
                            {statusLabel(item)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Ghi chú cập nhật</label>
                      <textarea value={progressNotes} onChange={(e) => setProgressNotes(e.target.value)} placeholder="Ví dụ: Đang chờ phụ tùng má phanh..." />
                    </div>
                    <div className="row-between" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => void completeWork()} disabled={saving || isClosed}>
                        Hoàn thành sửa chữa
                      </button>
                      <button type="button" className="btn btn-primary" onClick={() => void saveUpdate()} disabled={saving}>
                        {saving ? 'Đang cập nhật...' : 'Lưu cập nhật'}
                      </button>
                    </div>
                  </div>
                </div>

                {message ? (
                  <div className="card card-muted" style={{ marginTop: '1rem' }}>
                    <strong>Thông báo</strong>
                    <p className="muted" style={{ marginBottom: 0 }}>
                      {message}
                    </p>
                  </div>
                ) : null}
              </>
            ) : (
              <p className="muted">Chưa chọn RO.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
