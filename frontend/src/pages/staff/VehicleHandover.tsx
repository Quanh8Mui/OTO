import { useEffect, useMemo, useState } from 'react'
import { api, type RepairOrder } from '../../lib/api'
import { formatStatus } from '../../lib/format'

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
      setMessage(`Đã bàn giao xe ${updated.licensePlate} (${updated.orderNumber}). Trạng thái: ${formatStatus(updated.status)}.`)
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
      <p className="page-desc">Chỉ lệnh sửa chữa đã hoàn thành mới có thể bàn giao cho khách.</p>

      {loading ? <p className="muted">Đang tải...</p> : null}

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Chọn RO sẵn sàng bàn giao</h2>
          {readyOrders.length === 0 ? (
            <p className="muted">Chưa có RO nào ở trạng thái hoàn thành. Vui lòng cập nhật tiến độ trước khi bàn giao.</p>
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
              <div className="row-between no-print" style={{ marginTop: '1rem', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => window.print()}
                >
                  📄 In biên bản bàn giao
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void submitHandover()}
                  disabled={submitting || !allChecked}
                >
                  {submitting ? 'Đang xử lý...' : 'Đóng RO & bàn giao xe'}
                </button>
              </div>
            </>
          ) : (
            <p className="muted">Chọn RO từ danh sách bên trái.</p>
          )}
          {message ? <p className="muted no-print" style={{ marginTop: '1rem' }}>{message}</p> : null}
        </div>
      </div>

      {/* Printable Vehicle Handover Report */}
      {selectedOrder ? (
        <div className="print-only" style={{ marginTop: '20px' }}>
          <div className="print-header">
            <div>
              <h1 className="print-title">GARAGE OTO SERVICES</h1>
              <p style={{ margin: '4px 0', fontSize: '10pt', color: '#4b5563' }}>
                Địa chỉ: 123 Đường Số 1, TP. Hồ Chí Minh | Hotline: 1900 8888
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '14pt', margin: 0, color: '#111827' }}>BIÊN BẢN BÀN GIAO XE</h2>
              <p style={{ margin: '4px 0', fontSize: '10pt' }}>
                Số RO: <strong>{selectedOrder.orderNumber}</strong>
              </p>
              <p style={{ margin: '2px 0', fontSize: '10pt' }}>
                Ngày bàn giao: {handoverAt ? new Date(handoverAt).toLocaleString('vi-VN') : new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '16px', fontSize: '10pt' }}>
            <p style={{ margin: '4px 0' }}>Khách hàng: <strong>{selectedOrder.customerName}</strong></p>
            <p style={{ margin: '4px 0' }}>Biển số xe: <strong>{selectedOrder.licensePlate}</strong></p>
            <p style={{ margin: '4px 0' }}>Kỹ thuật viên phụ trách: <strong>{selectedOrder.assignedStaffName || 'Đội ngũ kỹ thuật OTO'}</strong></p>
            <p style={{ margin: '4px 0' }}>Ghi chú tiếp nhận: {selectedOrder.intakeNotes || 'Không có'}</p>
            <p style={{ margin: '4px 0' }}>Ghi chú bàn giao: {handoverNote || 'Xe hoạt động bình thường, đã kiểm tra hoàn tất.'}</p>
          </div>

          <h3 style={{ fontSize: '11pt', borderBottom: '1px solid #111', paddingBottom: '4px', margin: '16px 0 8px' }}>
            DANH MỤC KIỂM TRA TRƯỚC KHI BÀN GIAO (CHECKLIST)
          </h3>
          <table className="data" style={{ marginBottom: '20px' }}>
            <thead>
              <tr>
                <th>STT</th>
                <th>Hạng mục kiểm tra</th>
                <th>Kết quả</th>
              </tr>
            </thead>
            <tbody>
              {CHECKLIST_ITEMS.map((item, idx) => (
                <tr key={item}>
                  <td style={{ width: '40px', textAlign: 'center' }}>{idx + 1}</td>
                  <td>{item}</td>
                  <td style={{ width: '120px', textAlign: 'center', fontWeight: 600, color: checked[item] ? '#059669' : '#dc2626' }}>
                    {checked[item] ? '✓ Đạt yêu cầu' : 'Chưa kiểm tra'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="print-signatures">
            <div className="print-signature-box">
              <strong>Khách hàng nhận xe</strong>
              <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0' }}>(Ký và ghi rõ họ tên)</p>
              <div className="print-signature-space" />
            </div>
            <div className="print-signature-box">
              <strong>Kỹ thuật viên bàn giao</strong>
              <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0' }}>(Ký và ghi rõ họ tên)</p>
              <div className="print-signature-space" />
            </div>
            <div className="print-signature-box">
              <strong>Đại diện Garage OTO</strong>
              <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0' }}>(Ký và đóng dấu)</p>
              <div className="print-signature-space" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
