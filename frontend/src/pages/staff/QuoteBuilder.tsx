import { useEffect, useMemo, useState } from 'react'
import { api, type PublicPartItem, type Quote, type RepairOrder, type ServiceItem } from '../../lib/api'
import { formatStatus, getStatusBadgeClass } from '../../lib/format'

type QuoteLineDraft = {
  id: string
  lineType: 'LABOR' | 'PART'
  serviceCatalogId?: number | null
  partId?: number | null
  description: string
  quantity: number
  unitPrice: number
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function calcSubtotal(lines: QuoteLineDraft[]) {
  return lines.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0)
}

export function QuoteBuilder() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [parts, setParts] = useState<PublicPartItem[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [quote, setQuote] = useState<Quote | null>(null)
  const [lines, setLines] = useState<QuoteLineDraft[]>([])
  const [taxRate, setTaxRate] = useState(10)
  const [staffNotes, setStaffNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([api.staff.repairOrders(), api.catalog.services(), api.catalog.parts()])
      .then(([ordersData, servicesData, partsData]) => {
        if (!active) return
        setOrders(ordersData)
        setServices(servicesData)
        setParts(partsData)
      })
      .catch((err) => {
        if (!active) return
        setLoadError(err instanceof Error ? err.message : 'Không thể tải dữ liệu báo giá')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const selectedOrder = useMemo(
    () => orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null,
    [orders, selectedOrderId],
  )

  useEffect(() => {
    if (selectedOrder && selectedOrderId == null) setSelectedOrderId(selectedOrder.id)
  }, [selectedOrder, selectedOrderId])

  useEffect(() => {
    if (!selectedOrder) return
    setLoading(true)
    setMessage(null)
    api.staff
      .quotesForRepairOrder(selectedOrder.id)
      .then((quotes) => {
        const latest = quotes[0] ?? null
        setQuote(latest)
        if (latest) {
          setLines(
            latest.lines.map((line) => ({
              id: String(line.id),
              lineType: line.lineType,
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
            })),
          )
          setTaxRate(Number(latest.taxRate ?? 10))
          setStaffNotes(latest.staffNotes ?? '')
        } else {
          setQuote(null)
          setLines([])
          setStaffNotes('')
          setTaxRate(10)
        }
      })
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Không thể tải báo giá'))
      .finally(() => setLoading(false))
  }, [selectedOrder])

  const subtotal = calcSubtotal(lines)
  const vat = subtotal * (taxRate / 100)
  const total = subtotal + vat

  function addLaborLine() {
    const defaultService = services[0]
    setLines((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        lineType: 'LABOR',
        serviceCatalogId: defaultService?.id ?? null,
        description: defaultService?.name ?? 'Công việc mới',
        quantity: 1,
        unitPrice: defaultService?.basePrice ?? 0,
      },
    ])
  }

  function addPartLine() {
    const defaultPart = parts[0]
    setLines((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        lineType: 'PART',
        partId: defaultPart?.id ?? null,
        description: defaultPart?.name ?? 'Phụ tùng mới',
        quantity: 1,
        unitPrice: defaultPart?.unitPrice ?? 0,
      },
    ])
  }

  function updateLine(id: string, patch: Partial<QuoteLineDraft>) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id))
  }

  function applyServicePreset(lineId: string, serviceId: number | null) {
    const s = services.find((item) => item.id === serviceId)
    if (!s) return
    updateLine(lineId, { serviceCatalogId: s.id, description: s.name, unitPrice: s.basePrice })
  }

  function applyPartPreset(lineId: string, partId: number | null) {
    const p = parts.find((item) => item.id === partId)
    if (!p) return
    updateLine(lineId, { partId: p.id, description: `${p.name} (${p.sku})`, unitPrice: p.unitPrice })
  }

  async function ensureQuoteId() {
    if (quote) return quote.id
    if (!selectedOrder) throw new Error('Chưa chọn RO')
    const created = await api.staff.createQuoteDraft(selectedOrder.id)
    setQuote(created)
    return created.id
  }

  async function saveDraft() {
    if (!selectedOrder) return
    setSaving(true)
    setMessage(null)
    setIsSuccess(false)
    try {
      const qid = await ensureQuoteId()
      const saved = await api.staff.saveQuoteLines(qid, {
        taxRate,
        staffNotes,
        lines: lines.map((line) => ({
          lineType: line.lineType,
          serviceCatalogId: line.serviceCatalogId ?? null,
          partId: line.partId ?? null,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      })
      setQuote(saved)
      setMessage('Đã lưu bản nháp báo giá thành công!')
      setIsSuccess(true)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể lưu báo giá')
      setIsSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  async function sendQuote() {
    if (!selectedOrder) return
    setSaving(true)
    setMessage(null)
    setIsSuccess(false)
    try {
      const qid = await ensureQuoteId()
      await api.staff.saveQuoteLines(qid, {
        taxRate,
        staffNotes,
        lines: lines.map((line) => ({
          lineType: line.lineType,
          serviceCatalogId: line.serviceCatalogId ?? null,
          partId: line.partId ?? null,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      })
      const sent = await api.staff.sendQuote(qid)
      setQuote(sent)
      setMessage('Báo giá đã được gửi tới khách hàng để duyệt trực tuyến!')
      setIsSuccess(true)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể gửi báo giá')
      setIsSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '1600px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Lập báo giá (Công thợ + Phụ tùng)</h1>
          <p className="page-desc">
            Chọn lệnh RO, bổ sung các hạng mục sửa chữa, chi phí vật tư và gửi cho khách hàng duyệt trực tuyến.
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
                <option value="">{loading ? 'Đang tải dữ liệu...' : 'Chưa có lệnh sửa chữa nào'}</option>
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

          <span className="badge badge-blue">{orders.length} lệnh RO</span>
        </div>

        {loadError && <p style={{ color: '#dc2626', margin: '0.5rem 0 0' }}>Lỗi tải dữ liệu: {loadError}</p>}
      </div>

      {/* CHI TIẾT BÁO GIÁ TRẢI RỘNG TOÀN BỘ CHIỀU NGANG */}
      {selectedOrder ? (
        <div className="stack" style={{ gap: '1.5rem' }}>
          {/* HÀNG 1: TÓM TẮT THÔNG SỐ XE & RO (HORIZONTAL STRIP) */}
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
                <div className="muted" style={{ fontSize: '0.8rem' }}>Mã lệnh sửa chữa</div>
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
                <div className="muted" style={{ fontSize: '0.8rem' }}>Trạng thái duyệt báo giá</div>
                <span
                  className={`badge ${quote?.status === 'APPROVED' ? 'badge-green' : 'badge-yellow'}`}
                  style={{ marginTop: '0.25rem' }}
                >
                  {quote?.status === 'APPROVED'
                    ? 'ĐÃ DUYỆT'
                    : quote?.status === 'SENT'
                      ? 'ĐÃ GỬI KHÁCH'
                      : quote?.status === 'REJECTED'
                        ? 'KHÁCH TỪ CHỐI'
                        : 'BẢN NHÁP'}
                </span>
              </div>
            </div>
          </div>

          {/* HÀNG 2: BẢNG DÒNG BÁO GIÁ FULL WIDTH CỰC KỲ RỘNG RÃI */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div className="row-between" style={{ marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>Hạng mục công việc & Phụ tùng</h2>
                <p className="muted" style={{ fontSize: '0.88rem', margin: '0.2rem 0 0' }}>
                  Thêm các gói công bảo dưỡng hoặc phụ tùng thay thế từ kho
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={addLaborLine}
                  style={{ borderColor: '#533c6e', color: '#533c6e', padding: '0.6rem 1.25rem' }}
                >
                  + Thêm Công thợ
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addPartLine}
                  style={{ padding: '0.6rem 1.25rem' }}
                >
                  + Thêm Phụ tùng kho
                </button>
              </div>
            </div>

            <div className="table-wrap" style={{ border: '1px solid #f0ebf7', borderRadius: '12px' }}>
              <table className="data" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ background: '#faf8fd' }}>
                    <th style={{ width: '120px' }}>Phân loại</th>
                    <th style={{ width: '300px' }}>Chọn từ danh mục</th>
                    <th>Mô tả chi tiết hạng mục</th>
                    <th style={{ width: '90px', textAlign: 'center' }}>SL</th>
                    <th style={{ width: '160px', textAlign: 'right' }}>Đơn giá (VNĐ)</th>
                    <th style={{ width: '160px', textAlign: 'right' }}>Thành tiền</th>
                    <th style={{ width: '50px', textAlign: 'center' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            background: line.lineType === 'LABOR' ? '#e0f2fe' : '#fef3c7',
                            color: line.lineType === 'LABOR' ? '#0369a1' : '#b45309',
                          }}
                        >
                          {line.lineType === 'LABOR' ? 'CÔNG' : 'PHỤ TÙNG'}
                        </span>
                      </td>
                      <td>
                        {line.lineType === 'LABOR' ? (
                          <select
                            value={line.serviceCatalogId ?? ''}
                            onChange={(e) => applyServicePreset(line.id, e.target.value ? Number(e.target.value) : null)}
                            style={{ width: '100%', fontSize: '0.9rem' }}
                          >
                            <option value="">-- Chọn dịch vụ chuẩn --</option>
                            {services.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name} ({formatMoney(s.basePrice)})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <select
                            value={line.partId ?? ''}
                            onChange={(e) => applyPartPreset(line.id, e.target.value ? Number(e.target.value) : null)}
                            style={{ width: '100%', fontSize: '0.9rem' }}
                          >
                            <option value="">-- Chọn phụ tùng kho --</option>
                            {parts.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} [{p.sku}] - {formatMoney(p.unitPrice)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>
                        <input
                          type="text"
                          value={line.description}
                          onChange={(e) => updateLine(line.id, { description: e.target.value })}
                          placeholder="Mô tả công việc hoặc mã phụ tùng..."
                          style={{ width: '100%', fontSize: '0.9rem' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={line.quantity}
                          onChange={(e) => updateLine(line.id, { quantity: Math.max(1, Number(e.target.value)) })}
                          style={{ width: '100%', textAlign: 'center', fontWeight: 600 }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="1000"
                          value={line.unitPrice}
                          onChange={(e) => updateLine(line.id, { unitPrice: Math.max(0, Number(e.target.value)) })}
                          style={{ width: '100%', textAlign: 'right', fontWeight: 600 }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#533c6e' }}>
                        {formatMoney(line.quantity * line.unitPrice)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => removeLine(line.id)}
                          style={{ padding: '0.25rem 0.5rem', color: '#dc2626', border: 'none' }}
                          title="Xóa dòng"
                        >
                          X
                        </button>
                      </td>
                    </tr>
                  ))}
                  {lines.length === 0 && (
                    <tr>
                      <td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '2.5rem' }}>
                        Chưa có hạng mục nào. Hãy bấm <strong>+ Thêm Công thợ</strong> hoặc{' '}
                        <strong>+ Thêm Phụ tùng kho</strong> ở trên.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* HÀNG 3: TỔNG KẾT & NÚT HÀNH ĐỘNG (2 CỘT NGANG CÂN ĐỐI) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', alignItems: 'start' }}>
              {/* Ghi chú & VAT */}
              <div className="stack" style={{ gap: '1rem' }}>
                <div className="field">
                  <label>Ghi chú của kỹ thuật viên / garage gửi kèm báo giá</label>
                  <textarea
                    rows={4}
                    value={staffNotes}
                    onChange={(e) => setStaffNotes(e.target.value)}
                    placeholder="Cam kết phụ tùng chính hãng bảo hành 12 tháng, thời gian hoàn thành dự kiến 17:00 chiều nay..."
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <label style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem' }}>Thuế suất GTGT (VAT):</label>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    style={{ width: '120px', fontWeight: 700 }}
                  >
                    <option value="0">0%</option>
                    <option value="8">8%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
              </div>

              {/* Khung tổng tiền thanh toán */}
              <div
                style={{
                  background: '#faf8fd',
                  padding: '1.5rem',
                  borderRadius: '16px',
                  border: '1px solid #e8e2f2',
                }}
              >
                <div className="row-between" style={{ marginBottom: '0.65rem', fontSize: '1rem' }}>
                  <span className="muted">Cộng tiền công & phụ tùng:</span>
                  <strong>{formatMoney(subtotal)}</strong>
                </div>

                <div className="row-between" style={{ marginBottom: '0.85rem', fontSize: '1rem' }}>
                  <span className="muted">Thuế VAT ({taxRate}%):</span>
                  <strong>{formatMoney(vat)}</strong>
                </div>

                <div
                  className="row-between"
                  style={{
                    borderTop: '2px dashed #ded4ec',
                    paddingTop: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <span style={{ fontSize: '1.15rem', fontWeight: 700 }}>TỔNG CỘNG THANH TOÁN:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#533c6e' }}>
                    {formatMoney(total)}
                  </span>
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

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ flex: 1, padding: '0.75rem' }}
                    onClick={() => void saveDraft()}
                    disabled={saving || lines.length === 0}
                  >
                    Lưu bản nháp
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1.4, padding: '0.75rem' }}
                    onClick={() => void sendQuote()}
                    disabled={saving || lines.length === 0}
                  >
                    {saving ? 'Đang gửi...' : ' Gửi báo giá cho khách duyệt'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Chưa có Lệnh sửa chữa (RO) nào để lập báo giá.
          </p>
        </div>
      )}
    </div>
  )
}
