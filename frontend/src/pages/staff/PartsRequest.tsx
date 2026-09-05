import { useEffect, useMemo, useState } from 'react'
import { api, type PublicPartItem, type RepairOrder } from '../../lib/api'
import { formatStatus, getStatusBadgeClass } from '../../lib/format'

type PartsRequestRow = {
  id: string
  partId: number | null
  quantityRequested: number
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
}

export function PartsRequest() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [parts, setParts] = useState<PublicPartItem[]>([])
  const [requests, setRequests] = useState<
    Array<{
      id: number
      requestNumber: string
      repairOrderId: number
      status: string
      adminNote?: string
      createdAt?: string
      fulfilledAt?: string
      lines: Array<{
        id: number
        partId: number
        partName: string
        partSku: string
        quantityRequested: number
        quantityIssued: number
      }>
    }>
  >([])
  const [rows, setRows] = useState<PartsRequestRow[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  )

  useEffect(() => {
    let active = true
      ; (async () => {
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

  const loadRequests = async (roId: number) => {
    try {
      const data = await api.staff.partsRequests(roId)
      setRequests(data)
    } catch {
      setRequests([])
    }
  }

  useEffect(() => {
    if (!selectedOrder) return
    setLoading(true)
    setMessage(null)
    loadRequests(selectedOrder.id).finally(() => setLoading(false))
  }, [selectedOrder])

  function addRow() {
    setRows((current) => [
      ...current,
      { id: crypto.randomUUID(), partId: parts[0]?.id ?? null, quantityRequested: 1 },
    ])
  }

  function updateRow(id: string, patch: Partial<PartsRequestRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  async function submitRequest() {
    if (!selectedOrder) {
      setMessage('Vui lòng chọn Lệnh sửa chữa (RO) trước.')
      setIsSuccess(false)
      return
    }
    if (rows.length === 0) {
      setMessage('Hãy bấm "+ Thêm dòng phụ tùng" để chọn vật tư cần xuất kho.')
      setIsSuccess(false)
      return
    }
    if (rows.some((row) => !row.partId || row.quantityRequested <= 0)) {
      setMessage('Vui lòng chọn phụ tùng và nhập số lượng yêu cầu hợp lệ (> 0).')
      setIsSuccess(false)
      return
    }
    setSaving(true)
    setMessage(null)
    setIsSuccess(false)
    try {
      await api.staff.createPartsRequest({
        repairOrderId: selectedOrder.id,
        lines: rows.map((row) => ({ partId: row.partId!, quantityRequested: row.quantityRequested })),
      })
      setRows([])
      await loadRequests(selectedOrder.id)
      setMessage('Đã tạo và gửi phiếu yêu cầu xuất kho tới Quản trị viên!')
      setIsSuccess(true)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tạo yêu cầu')
      setIsSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '1600px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Yêu cầu phụ tùng từ kho</h1>
          <p className="page-desc">
            Lập phiếu xuất phụ tùng và vật tư cho từng lệnh RO — quản trị viên hoặc thủ kho sẽ duyệt và xuất kho.
          </p>
        </div>
      </div>

      {/* THANH CHỌN LỆNH RO NGANG (HORIZONTAL SELECTOR BAR) */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontWeight: 700, fontSize: '0.98rem', whiteSpace: 'nowrap', color: '#533c6e' }}>
            Chọn Lệnh sửa chữa (RO):
          </label>

          <div style={{ flex: 1, minWidth: '320px' }}>
            <select
              value={selectedOrder?.id ?? ''}
              onChange={(e) => setSelectedOrderId(e.target.value ? Number(e.target.value) : null)}
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

          {selectedOrder && (
            <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`} style={{ padding: '0.45rem 1rem' }}>
              {formatStatus(selectedOrder.status)}
            </span>
          )}

          <span className="badge badge-blue">{orders.length} RO</span>
        </div>
      </div>

      {/* CHI TIẾT TRẢI RỘNG THEO CHIỀU NGANG */}
      {selectedOrder ? (
        <div className="stack" style={{ gap: '1.5rem' }}>
          {/* HÀNG 1: THÔNG TIN TỔNG QUAN RO (HORIZONTAL STRIP) */}
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
                <strong style={{ fontSize: '1.35rem', color: '#533c6e' }}>{selectedOrder.orderNumber}</strong>
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
                  {selectedOrder.licensePlate}
                </div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Khách hàng</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>{selectedOrder.customerName}</div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Dòng xe</div>
                <div style={{ fontWeight: 600 }}>{selectedOrder.vehicleLabel || 'Xe tiêu chuẩn'}</div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Tiến độ sửa chữa</div>
                <span className={`badge ${getStatusBadgeClass(selectedOrder.status)}`} style={{ marginTop: '0.25rem' }}>
                  {formatStatus(selectedOrder.status)}
                </span>
              </div>
            </div>
          </div>

          {/* HÀNG 2: TẠO PHIẾU YÊU CẦU PHỤ TÙNG (FULL WIDTH) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="row-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Lập phiếu yêu cầu xuất kho phụ tùng</h2>
                <p className="muted" style={{ fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                  Chọn các linh kiện và vật tư cần lấy từ kho cho xe này
                </p>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                onClick={addRow}
                style={{ padding: '0.6rem 1.25rem' }}
              >
                + Thêm dòng phụ tùng
              </button>
            </div>

            <div className="table-wrap" style={{ border: '1px solid #f0ebf7', borderRadius: '12px', marginBottom: '1.25rem' }}>
              <table className="data" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#faf8fd' }}>
                    <th>Phụ tùng / Vật tư cần lấy từ kho</th>
                    <th style={{ width: '160px', textAlign: 'center' }}>Số lượng yêu cầu</th>
                    <th style={{ width: '60px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <select
                          value={row.partId ?? ''}
                          onChange={(e) => updateRow(row.id, { partId: e.target.value ? Number(e.target.value) : null })}
                          style={{ width: '100%', fontSize: '0.92rem' }}
                        >
                          <option value="">-- Chọn phụ tùng từ danh mục kho --</option>
                          {parts.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} [{p.sku}]
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          value={row.quantityRequested}
                          onChange={(e) => updateRow(row.id, { quantityRequested: Math.max(1, Number(e.target.value)) })}
                          style={{ width: '100px', textAlign: 'center', fontWeight: 700, fontSize: '0.95rem' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => removeRow(row.id)}
                          style={{ padding: '0.25rem 0.5rem', color: '#dc2626', border: 'none' }}
                          title="Xóa dòng"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={3} className="muted" style={{ textAlign: 'center', padding: '2.5rem' }}>
                        Chưa chọn phụ tùng nào. Hãy bấm nút <strong>+ Thêm dòng phụ tùng</strong> ở góc trên bên phải.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => void submitRequest()}
                disabled={saving || rows.length === 0}
                style={{ padding: '0.75rem 2.5rem', fontSize: '1rem' }}
              >
                {saving ? 'Đang gửi yêu cầu...' : '✓ Gửi yêu cầu xuất kho tới Quản trị viên'}
              </button>
            </div>
          </div>

          {/* HÀNG 3: LỊCH SỬ CÁC PHIẾU YÊU CẦU KHO CỦA RO NÀY (FULL WIDTH TABLE) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="row-between" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                  Lịch sử các phiếu yêu cầu phụ tùng của RO này
                </h2>
                <p className="muted" style={{ fontSize: '0.85rem', margin: '0.2rem 0 0' }}>
                  Theo dõi trạng thái duyệt và số lượng thực tế đã xuất kho từ phía quản lý
                </p>
              </div>
              <span className="badge badge-blue">{requests.length} phiếu</span>
            </div>

            <div className="table-wrap" style={{ border: '1px solid #f0ebf7', borderRadius: '12px' }}>
              <table className="data" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#faf8fd' }}>
                    <th style={{ width: '180px' }}>Mã phiếu</th>
                    <th style={{ width: '160px' }}>Thời gian gửi</th>
                    <th>Chi tiết phụ tùng yêu cầu</th>
                    <th style={{ width: '160px' }}>Trạng thái duyệt</th>
                    <th>Ghi chú phản hồi</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id}>
                      <td>
                        <strong>{req.requestNumber}</strong>
                      </td>
                      <td style={{ fontSize: '0.88rem' }}>{formatDate(req.createdAt)}</td>
                      <td>
                        <div className="stack" style={{ gap: '0.35rem', fontSize: '0.9rem' }}>
                          {req.lines?.map((line) => (
                            <div key={line.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>• {line.partName}</span>
                              <span className="muted">[{line.partSku}]</span>
                              <strong style={{ color: '#533c6e' }}>x{line.quantityRequested}</strong>
                              {line.quantityIssued > 0 && (
                                <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>
                                  (Đã xuất: {line.quantityIssued})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${req.status === 'FULFILLED'
                            ? 'badge-green'
                            : req.status === 'APPROVED'
                              ? 'badge-blue'
                              : req.status === 'REJECTED'
                                ? 'badge-red'
                                : 'badge-yellow'
                            }`}
                        >
                          {req.status === 'FULFILLED'
                            ? 'ĐÃ XUẤT KHO'
                            : req.status === 'APPROVED'
                              ? 'ĐÃ DUYỆT'
                              : req.status === 'REJECTED'
                                ? 'TỪ CHỐI'
                                : 'CHỜ DUYỆT'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.88rem', color: '#64748b' }}>
                        {req.adminNote || req.fulfilledAt ? (
                          <div>
                            {req.adminNote && <div>{req.adminNote}</div>}
                            {req.fulfilledAt && (
                              <span className="muted" style={{ fontSize: '0.8rem' }}>
                                Xuất lúc: {formatDate(req.fulfilledAt)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="muted" style={{ fontStyle: 'italic' }}>Chưa có phản hồi</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: '2.5rem' }}>
                        Chưa có phiếu yêu cầu kho nào cho RO này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Chưa có Lệnh sửa chữa (RO) nào để yêu cầu phụ tùng.
          </p>
        </div>
      )}
    </div>
  )
}
