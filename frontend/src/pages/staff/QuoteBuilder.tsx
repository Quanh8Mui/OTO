import { useEffect, useMemo, useState } from 'react'
import { api, type PublicPartItem, type Quote, type RepairOrder, type ServiceItem } from '../../lib/api'

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

  const selectedOrder = useMemo(() => orders.find((o) => o.id === selectedOrderId) ?? orders[0] ?? null, [orders, selectedOrderId])

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
          setLines(latest.lines.map((line) => ({ id: String(line.id), lineType: line.lineType, description: line.description, quantity: line.quantity, unitPrice: line.unitPrice })))
          setTaxRate(Number((Number(latest.taxRate) * 100).toFixed(2)))
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

  function applyServicePreset(lineId: string, serviceId: number | null) {
    const service = services.find((item) => item.id === serviceId)
    updateLine(lineId, {
      lineType: 'LABOR',
      serviceCatalogId: service?.id ?? null,
      partId: null,
      description: service?.name ?? '',
      unitPrice: service?.basePrice ?? 0,
    })
  }

  function applyPartPreset(lineId: string, partId: number | null) {
    const part = parts.find((item) => item.id === partId)
    updateLine(lineId, {
      lineType: 'PART',
      partId: part?.id ?? null,
      serviceCatalogId: null,
      description: part?.name ?? '',
      unitPrice: part?.unitPrice ?? 0,
    })
  }

  async function saveDraft(send = false) {
    if (!selectedOrder) return
    setSaving(true)
    setMessage(null)
    try {
      const draft = quote ?? (await api.staff.createQuoteDraft(selectedOrder.id))
      const saved = await api.staff.saveQuoteLines(draft.id, {
        taxRate,
        staffNotes,
        lines: lines.map((line) => ({
          lineType: line.lineType,
          serviceCatalogId: line.lineType === 'LABOR' ? line.serviceCatalogId ?? null : null,
          partId: line.lineType === 'PART' ? line.partId ?? null : null,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
      })
      if (send) {
        await api.staff.sendQuote(saved.id)
        setMessage('Đã gửi báo giá cho khách.')
      } else {
        setMessage('Đã lưu nháp báo giá.')
      }
      setQuote(saved)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể lưu báo giá')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Lập báo giá (phụ tùng + công)</h1>
      <p className="page-desc">Chọn RO đang xử lý, thêm dòng phụ tùng/công, tính tiền và gửi báo giá cho khách.</p>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>RO đang xử lý</h2>
            <span className="badge badge-blue">{orders.length} mục</span>
          </div>
          {loading ? <p className="muted">Đang tải...</p> : null}
          {loadError ? <p className="muted">Lỗi tải dữ liệu: {loadError}</p> : null}
          <div className="stack" style={{ maxHeight: 320, overflow: 'auto' }}>
            {orders.map((order) => (
              <button key={order.id} type="button" className="card" onClick={() => setSelectedOrderId(order.id)} style={{ textAlign: 'left', background: order.id === selectedOrder?.id ? 'var(--accent-dim)' : 'var(--bg-panel)', border: order.id === selectedOrder?.id ? '1px solid var(--accent)' : '1px solid var(--border)', cursor: 'pointer', width: '100%' }}>
                <strong>{order.orderNumber}</strong>
                <div className="muted" style={{ marginTop: '0.35rem' }}>{order.licensePlate} · {order.customerName}</div>
                <div className="muted" style={{ marginTop: '0.2rem', fontSize: '0.9rem' }}>{order.vehicleLabel || 'Xe'} · {order.status}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="card card-muted">
          {selectedOrder ? (
            <>
              <div className="row-between" style={{ marginBottom: '1rem' }}>
                <div>
                  <span className="badge badge-blue">RO #{selectedOrder.orderNumber}</span>
                  <div style={{ marginTop: '0.35rem', fontWeight: 600 }}>{selectedOrder.customerName} · {selectedOrder.licensePlate}</div>
                  <div className="muted">{selectedOrder.vehicleLabel || 'Chưa có mô tả xe'}</div>
                </div>
                <button type="button" className="btn btn-ghost" onClick={addPartLine}>+ Phụ tùng</button>
              </div>

              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="grid-2">
                  <div className="field">
                    <label>Khách hàng</label>
                    <input value={selectedOrder.customerName} readOnly />
                  </div>
                  <div className="field">
                    <label>Biển số</label>
                    <input value={selectedOrder.licensePlate} readOnly />
                  </div>
                </div>
                <div className="field">
                  <label>Xe</label>
                  <input value={selectedOrder.vehicleLabel || ''} readOnly />
                </div>
              </div>

              <div className="row-between" style={{ marginBottom: '0.75rem' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem' }}>Dòng báo giá</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-ghost" onClick={addLaborLine}>+ Công</button>
                  <button type="button" className="btn btn-ghost" onClick={addPartLine}>+ Phụ tùng</button>
                </div>
              </div>

              <div className="table-wrap" style={{ marginBottom: '1rem' }}>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Loại</th>
                      <th>Mô tả</th>
                      <th>SL</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => (
                      <tr key={line.id}>
                        <td>{line.lineType === 'LABOR' ? 'Công' : 'Phụ tùng'}</td>
                        <td>
                          {line.lineType === 'LABOR' ? (
                            <select
                              value={line.serviceCatalogId ?? ''}
                              onChange={(e) => applyServicePreset(line.id, e.target.value ? Number(e.target.value) : null)}
                            >
                              <option value="">-- Chọn dịch vụ --</option>
                              {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <select
                              value={line.partId ?? ''}
                              onChange={(e) => applyPartPreset(line.id, e.target.value ? Number(e.target.value) : null)}
                            >
                              <option value="">-- Chọn phụ tùng --</option>
                              {parts.map((part) => (
                                <option key={part.id} value={part.id}>
                                  {part.sku} · {part.name}
                                </option>
                              ))}
                            </select>
                          )}
                          <input
                            style={{ marginTop: '0.35rem' }}
                            value={line.description}
                            onChange={(e) => updateLine(line.id, { description: e.target.value })}
                            placeholder={line.lineType === 'LABOR' ? 'Mô tả dịch vụ' : 'Mô tả phụ tùng'}
                          />
                        </td>
                        <td>
                          <input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) || 1 })} style={{ width: 72 }} />
                        </td>
                        <td>
                          <input type="number" min={0} value={line.unitPrice} onChange={(e) => updateLine(line.id, { unitPrice: Number(e.target.value) || 0 })} style={{ width: 120 }} />
                        </td>
                        <td>{formatMoney(line.quantity * line.unitPrice)}</td>
                        <td>
                          <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}>✕</button>
                        </td>
                      </tr>
                    ))}
                    {lines.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="muted">Chưa có dòng báo giá nào.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              <div className="grid-2" style={{ marginBottom: '1rem' }}>
                <div className="field">
                  <label>VAT (%)</label>
                  <input type="number" min={0} value={taxRate} onChange={(e) => setTaxRate(Number(e.target.value) || 0)} />
                </div>
                <div className="field">
                  <label>Ghi chú nội bộ</label>
                  <textarea value={staffNotes} onChange={(e) => setStaffNotes(e.target.value)} placeholder="Ghi chú cho khách..." />
                </div>
              </div>

              <div className="card" style={{ marginBottom: '1rem' }}>
                <div className="row-between"><span className="muted">Subtotal</span><strong>{formatMoney(subtotal)}</strong></div>
                <div className="row-between" style={{ marginTop: '0.5rem' }}><span className="muted">VAT</span><strong>{formatMoney(vat)}</strong></div>
                <div className="divider" />
                <div className="row-between"><span>Tổng cộng</span><strong style={{ fontSize: '1.1rem' }}>{formatMoney(total)}</strong></div>
              </div>

              {message ? <p className="muted">{message}</p> : null}

              <div className="row-between">
                <button type="button" className="btn btn-ghost" onClick={() => void saveDraft(false)} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu nháp'}</button>
                <button type="button" className="btn btn-primary" onClick={() => void saveDraft(true)} disabled={saving}>{saving ? 'Đang gửi...' : 'Gửi báo giá cho khách'}</button>
              </div>
            </>
          ) : (
            <p className="muted">Chưa có RO nào để lập báo giá.</p>
          )}
        </div>
      </div>
    </div>
  )
}
