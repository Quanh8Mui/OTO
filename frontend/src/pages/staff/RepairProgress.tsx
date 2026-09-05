import { useEffect, useMemo, useState } from 'react'
import { api, type ProgressEvent, type RepairOrderResponse } from '../../lib/api'
import { formatStatus, getStatusBadgeClass } from '../../lib/format'

const statusOptions = [
  'INTAKE',
  'QUOTING',
  'AWAITING_APPROVAL',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'DELIVERED',
] as const

const STEPS = [
  { key: 'INTAKE', label: '1. Tiếp nhận xe' },
  { key: 'QUOTING', label: '2. Lập báo giá' },
  { key: 'AWAITING_APPROVAL', label: '3. Chờ khách duyệt' },
  { key: 'IN_PROGRESS', label: '4. Đang sửa chữa' },
  { key: 'PAUSED', label: '5. Tạm dừng' },
  { key: 'COMPLETED', label: '6. Hoàn thành sửa' },
  { key: 'DELIVERED', label: '7. Đã bàn giao xe' },
]

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
  const [isSuccess, setIsSuccess] = useState(false)

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
      ; (async () => {
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

  async function saveUpdate() {
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    setIsSuccess(false)
    try {
      const updated = await api.staff.updateRepairStatus(selectedId, { status, progressNotes })
      await api.staff.addRepairProgress(selectedId, {
        stepLabel: formatStatus(status),
        message: progressNotes.trim() || `Cập nhật trạng thái: ${formatStatus(status)}`,
      })
      setOrder(updated)
      const events = await api.staff.repairProgress(selectedId)
      setHistory(events)
      setMessage(`Đã cập nhật tiến độ sang "${formatStatus(status)}" thành công!`)
      setIsSuccess(true)
      await loadOrders()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái')
      setIsSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  async function quickComplete() {
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    setIsSuccess(false)
    try {
      const updated = await api.staff.completeWork(selectedId)
      setOrder(updated)
      setStatus(updated.status)
      const events = await api.staff.repairProgress(selectedId)
      setHistory(events)
      setMessage('Đã đánh dấu hoàn thành tất cả hạng mục sửa chữa!')
      setIsSuccess(true)
      await loadOrders()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể hoàn thành RO')
      setIsSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  async function quickHandover() {
    if (!selectedId) return
    setSaving(true)
    setMessage(null)
    setIsSuccess(false)
    try {
      const updated = await api.staff.handover(selectedId)
      setOrder(updated)
      setStatus(updated.status)
      const events = await api.staff.repairProgress(selectedId)
      setHistory(events)
      setMessage('Đã xác nhận bàn giao xe cho khách hàng thành công!')
      setIsSuccess(true)
      await loadOrders()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể bàn giao xe')
      setIsSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  const currentStepIndex = useMemo(() => {
    if (!order) return -1
    return STEPS.findIndex((s) => s.key === order.status)
  }, [order])

  return (
    <div className="page" style={{ maxWidth: '1600px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Theo dõi & Cập nhật tiến độ sửa chữa</h1>
          <p className="page-desc">
            Cập nhật từng bước thao tác thực tế tại xưởng, ghi nhật ký tiến độ và bàn giao xe cho khách.
          </p>
        </div>
      </div>

      {/* THANH CHỌN RO NGANG (HORIZONTAL SELECTOR BAR) */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontWeight: 700, fontSize: '0.98rem', whiteSpace: 'nowrap', color: '#533c6e' }}>
            Chọn Lệnh sửa chữa (RO):
          </label>

          <div style={{ flex: 1, minWidth: '320px' }}>
            <select
              value={order?.id ?? ''}
              onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : null)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '1.5px solid #533c6e',
                borderRadius: '12px',
                background: '#faf8fd',
              }}
            >
              {orders.length === 0 ? (
                <option value="">{loading ? 'Đang tải dữ liệu...' : 'Chưa có lệnh RO nào'}</option>
              ) : null}
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNumber} · Biển số: {o.licensePlate} · Khách: {o.customerName} · Xe:{' '}
                  {o.vehicleLabel || 'Tiêu chuẩn'} - [{formatStatus(o.status)}]
                </option>
              ))}
            </select>
          </div>

          {order && (
            <span className={`badge ${getStatusBadgeClass(order.status)}`} style={{ padding: '0.45rem 1rem' }}>
              {formatStatus(order.status)}
            </span>
          )}

          <span className="badge badge-blue">{orders.length} RO</span>
        </div>
      </div>

      {/* CHI TIẾT TIẾN ĐỘ TRẢI RỘNG THEO CHIỀU NGANG */}
      {order ? (
        <div className="stack" style={{ gap: '1.5rem' }}>
          {/* HÀNG 1: THÔNG TIN TỔNG QUAN XE (HORIZONTAL STRIP) */}
          <div
            className="card"
            style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, #ffffff 0%, #faf8fd 100%)',
              border: '1px solid #e8e2f2',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                alignItems: 'center',
              }}
            >
              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Mã lệnh RO</div>
                <strong style={{ fontSize: '1.35rem', color: '#533c6e' }}>{order.orderNumber}</strong>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Biển số xe</div>
                <div
                  style={{
                    display: 'inline-block',
                    fontWeight: 800,
                    fontSize: '1.15rem',
                    background: '#f2edf8',
                    color: '#533c6e',
                    padding: '0.2rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #ded4ec',
                    marginTop: '0.15rem',
                  }}
                >
                  {order.licensePlate}
                </div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Khách hàng</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{order.customerName}</div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Kỹ thuật viên phụ trách</div>
                <div style={{ fontWeight: 600, color: '#533c6e' }}>
                  {order.assignedStaffName || 'Đang phân công'}
                </div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Ngày đón tiếp</div>
                <div style={{ fontSize: '0.92rem' }}>{formatDate(order.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* HÀNG 2: TIẾN TRÌNH 7 BƯỚC NGANG (HORIZONTAL STEPPER) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#282033' }}>
              Quy trình tiến độ xe tại garage (7 giai đoạn)
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '0.5rem',
                alignItems: 'stretch',
              }}
            >
              {STEPS.map((s, index) => {
                const isCurrent = s.key === order.status
                const isPassed = currentStepIndex > index
                return (
                  <div
                    key={s.key}
                    style={{
                      padding: '0.85rem 0.65rem',
                      borderRadius: '12px',
                      background: isCurrent ? '#533c6e' : isPassed ? '#e8f5e9' : '#f8fafc',
                      border: isCurrent ? '1.5px solid #533c6e' : '1px solid #e8e2f2',
                      color: isCurrent ? '#ffffff' : isPassed ? '#2e7d32' : '#64748b',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      boxShadow: isCurrent ? '0 4px 14px rgba(83, 60, 110, 0.25)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        background: isCurrent ? '#ffffff' : isPassed ? '#2e7d32' : '#cbd5e1',
                        color: isCurrent ? '#533c6e' : '#ffffff',
                      }}
                    >
                      {isPassed ? '✓' : index + 1}
                    </div>

                    <div style={{ fontSize: '0.82rem', fontWeight: isCurrent ? 700 : 600, lineHeight: '1.2' }}>
                      {s.label.split('. ')[1]}
                    </div>

                    {isCurrent && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          background: 'rgba(255, 255, 255, 0.25)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                        }}
                      >
                        Đang ở bước này
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* HÀNG 3: CẬP NHẬT TRẠNG THÁI & LỊCH SỬ THAO TÁC (2 CỘT NGANG RỘNG RÃI) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
            {/* Cột Trái: Cập nhật trạng thái */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#282033' }}>
                Cập nhật tiến độ & Thao tác
              </h3>

              <div className="field">
                <label>Chọn trạng thái tiến độ mới</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{ fontWeight: 600, fontSize: '0.95rem' }}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {formatStatus(opt)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Nhật ký chi tiết công việc thực hiện</label>
                <textarea
                  rows={4}
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  placeholder="Đang kiểm tra hệ thống phanh, tiến hành thay dầu động cơ và lọc gió..."
                />
              </div>

              {message && (
                <div
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    marginBottom: '1rem',
                    backgroundColor: isSuccess ? '#e8f5e9' : '#ffebee',
                    color: isSuccess ? '#2e7d32' : '#c62828',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void saveUpdate()}
                  disabled={saving}
                  style={{ padding: '0.75rem', fontSize: '0.95rem' }}
                >
                  {saving ? 'Đang cập nhật...' : '✓ Lưu & Cập nhật tiến độ'}
                </button>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => void quickComplete()}
                    disabled={saving || order.status === 'COMPLETED' || order.status === 'DELIVERED'}
                    style={{ flex: 1, padding: '0.65rem' }}
                  >
                    Hoàn thành sửa
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => void quickHandover()}
                    disabled={saving || order.status !== 'COMPLETED'}
                    style={{ flex: 1, padding: '0.65rem', borderColor: '#16a34a', color: '#16a34a' }}
                  >
                    Giao xe cho khách
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f0ebf7', fontSize: '0.88rem' }}>
                <span className="muted">Ghi chú lúc tiếp nhận:</span>
                <div style={{ whiteSpace: 'pre-line', marginTop: '0.25rem', color: '#4b5563', fontStyle: 'italic' }}>
                  {order.intakeNotes || 'Không có ghi chú tiếp nhận'}
                </div>
              </div>
            </div>

            {/* Cột Phải: Lịch sử thao tác & Nhật ký */}
            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1.25rem', color: '#282033' }}>
                Lịch sử thao tác & Nhật ký tiến độ
              </h3>

              <div
                className="stack"
                style={{
                  maxHeight: '440px',
                  overflowY: 'auto',
                  paddingRight: '0.35rem',
                  gap: '0.85rem',
                }}
              >
                {history.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      borderLeft: '3px solid #533c6e',
                      paddingLeft: '1rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    <div className="row-between">
                      <strong style={{ color: '#533c6e' }}>{event.stepLabel || 'Cập nhật'}</strong>
                      <span className="muted" style={{ fontSize: '0.8rem' }}>
                        {formatDate(event.createdAt)}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.25rem', color: '#334155' }}>{event.message}</div>
                    {event.createdByName && (
                      <div className="muted" style={{ fontSize: '0.78rem', marginTop: '0.2rem' }}>
                        Thực hiện bởi: {event.createdByName}
                      </div>
                    )}
                  </div>
                ))}

                {history.length === 0 && (
                  <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
                    Chưa có lịch sử cập nhật nào cho lệnh RO này.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Chưa có Lệnh sửa chữa (RO) nào để theo dõi tiến độ.
          </p>
        </div>
      )}
    </div>
  )
}
