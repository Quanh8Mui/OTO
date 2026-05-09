import { useEffect, useMemo, useState } from 'react'
import { api, type Part, type RepairOrder } from '../../lib/api'

type PartsRequestRow = {
  id: string
  partId: number | null
  quantityRequested: number
}

function statusBadge(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'badge-green'
    case 'FULFILLED':
      return 'badge-blue'
    case 'REJECTED':
      return 'badge-red'
    default:
      return 'badge-amber'
  }
}

export function PartsRequest() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [parts, setParts] = useState<Part[]>([])
  const [requests, setRequests] = useState<Array<{ id: number; requestNumber: string; repairOrderId: number; status: string; adminNote?: string; createdAt?: string; fulfilledAt?: string; lines: Array<{ id: number; partId: number; partName: string; partSku: string; quantityRequested: number; quantityIssued: number }> }>>([])
  const [rows, setRows] = useState<PartsRequestRow[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null, [orders, selectedOrderId])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        setLoading(true)
        const [ordersData, partsData] = await Promise.all([api.staff.repairOrders(), api.catalog.parts()])
        if (!active) return
        setOrders(ordersData)
        setParts(partsData)
        if (ordersData[0]) setSelectedOrderId(ordersData[0].id)
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
    if (!selectedOrder) return
    setLoading(true)
    setMessage(null)
    api.staff
      .partsRequests(selectedOrder.id)
      .then((data) => setRequests(data))
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Không thể tải phiếu'))
      .finally(() => setLoading(false))
  }, [selectedOrder])

  function addRow() {
    setRows((current) => [...current, { id: crypto.randomUUID(), partId: parts[0]?.id ?? null, quantityRequested: 1 }])
  }

  function updateRow(id: string, patch: Partial<PartsRequestRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  async function submitRequest() {
    if (!selectedOrder) {
      setMessage('Chọn RO trước.')
      return
    }
    if (rows.length === 0) {
      setMessage('Thêm ít nhất 1 phụ tùng.')
      return
    }
    if (rows.some((row) => !row.partId || row.quantityRequested <= 0)) {
      setMessage('Vui lòng chọn phụ tùng và số lượng hợp lệ.')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await api.staff.createPartsRequest({
        repairOrderId: selectedOrder.id,
        lines: rows.map((row) => ({ partId: row.partId!, quantityRequested: row.quantityRequested })),
      })
      setRows([])
      const data = await api.staff.partsRequests(selectedOrder.id)
      setRequests(data)
      setMessage('Đã tạo yêu cầu phụ tùng.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tạo yêu cầu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Yêu cầu phụ tùng từ kho</h1>
      <p className="page-desc">Phiếu xuất kho gắn RO — admin duyệt khi cần.</p>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          <div className="card">
            <div className="row-between" style={{ marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1rem', margin: 0 }}>Chọn RO</h2>
              <span className="badge badge-blue">{orders.length} RO</span>
            </div>
            <div className="stack" style={{ maxHeight: 280, overflow: 'auto' }}>
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className="card"
                  style={{
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    background: order.id === selectedOrderId ? 'var(--accent-dim)' : 'var(--bg-panel)',
                    border: order.id === selectedOrderId ? '1px solid var(--accent)' : '1px solid var(--border)',
                  }}
                >
                  <strong>{order.orderNumber}</strong>
                  <div className="muted" style={{ marginTop: '0.35rem' }}>
                    {order.licensePlate} · {order.customerName}
                  </div>
                  <div className="muted" style={{ marginTop: '0.2rem' }}>{order.status}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card card-muted">
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Cảnh báo nghiệp vụ</h2>
            <ul className="muted" style={{ marginBottom: 0, paddingLeft: '1.2rem' }}>
              <li>Chỉ tạo phiếu khi báo giá đã chốt và cần phụ tùng thật.</li>
              <li>Không nên tạo phiếu cho RO đã đóng.</li>
              <li>Kiểm tra tồn trước khi gửi để tránh thiếu kho.</li>
            </ul>
          </div>
        </div>

        <div className="stack">
          <div className="card">
            {selectedOrder ? (
              <>
                <div className="row-between" style={{ marginBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-blue">{selectedOrder.orderNumber}</span>
                    <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.1rem' }}>{selectedOrder.customerName} · {selectedOrder.licensePlate}</h2>
                    <div className="muted" style={{ marginTop: '0.25rem' }}>{selectedOrder.vehicleLabel || '-'}</div>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={addRow}>+ Thêm dòng</button>
                </div>

                <div className="card card-muted" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginTop: 0, fontSize: '0.98rem' }}>Thông tin RO</h3>
                  <div className="grid-2">
                    <div><span className="muted">Khách hàng:</span> {selectedOrder.customerName}</div>
                    <div><span className="muted">Biển số:</span> {selectedOrder.licensePlate}</div>
                    <div><span className="muted">Xe:</span> {selectedOrder.vehicleLabel || '-'}</div>
                    <div><span className="muted">Trạng thái:</span> {selectedOrder.status}</div>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: '1rem' }}>
                  <div className="row-between" style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.98rem' }}>Form tạo yêu cầu</h3>
                    <button type="button" className="btn btn-primary" onClick={() => void submitRequest()} disabled={saving}>
                      {saving ? 'Đang tạo...' : 'Gửi yêu cầu'}
                    </button>
                  </div>

                  <div className="table-wrap">
                    <table className="data">
                      <thead>
                        <tr>
                          <th>Phụ tùng</th>
                          <th>SL</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <select value={row.partId ?? ''} onChange={(e) => updateRow(row.id, { partId: e.target.value ? Number(e.target.value) : null })}>
                                <option value="">-- Chọn phụ tùng --</option>
                                {parts.map((part) => (
                                  <option key={part.id} value={part.id}>
                                    {part.sku} · {part.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input type="number" min={1} value={row.quantityRequested} onChange={(e) => updateRow(row.id, { quantityRequested: Number(e.target.value) || 1 })} style={{ width: 90 }} />
                            </td>
                            <td>
                              <button type="button" className="btn btn-ghost" onClick={() => removeRow(row.id)}>✕</button>
                            </td>
                          </tr>
                        ))}
                        {rows.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="muted">Chưa có dòng nào.</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>

                {message ? (
                  <div className="card card-muted" style={{ marginBottom: '1rem' }}>
                    <strong>Thông báo</strong>
                    <p className="muted" style={{ marginBottom: 0 }}>{message}</p>
                  </div>
                ) : null}

                <div className="card card-muted">
                  <div className="row-between" style={{ marginBottom: '0.75rem' }}>
                    <h3 style={{ margin: 0, fontSize: '0.98rem' }}>Phiếu gần đây</h3>
                    {loading ? <span className="muted">Đang tải...</span> : <span className="muted">{requests.length} phiếu</span>}
                  </div>
                  <div className="table-wrap">
                    <table className="data">
                      <thead>
                        <tr>
                          <th>Mã phiếu</th>
                          <th>Trạng thái</th>
                          <th>Thời gian</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((req) => (
                          <tr key={req.id}>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{req.requestNumber}</td>
                            <td><span className={`badge ${statusBadge(req.status)}`}>{req.status}</span></td>
                            <td className="muted">{req.createdAt ? new Date(req.createdAt).toLocaleString('vi-VN') : '-'}</td>
                          </tr>
                        ))}
                        {requests.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="muted">Chưa có phiếu nào.</td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <p className="muted">Chưa có RO nào để tạo phiếu.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
