import { useEffect, useMemo, useState } from 'react'
import { api, type Quote } from '../../lib/api'
import { formatMoney } from '../../lib/format'

export function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    api.customer.quotes().then((data) => {
      setQuotes(data)
      if (data.length > 0) setSelectedId(data[0].id)
    })
  }, [])

  const selected = useMemo(() => quotes.find((x) => x.id === selectedId) ?? null, [quotes, selectedId])

  async function approve() {
    if (!selected) return
    const updated = await api.customer.approveQuote(selected.id)
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    setMessage('Đã duyệt báo giá.')
  }

  async function reject() {
    if (!selected) return
    const updated = await api.customer.rejectQuote(selected.id, 'Cần điều chỉnh hạng mục')
    setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
    setMessage('Đã từ chối báo giá.')
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div className="page">
      {/* Printable Header for PDF/Print */}
      <div className="print-only">
        <div className="print-header">
          <div>
            <h1 className="print-title">GARAGE OTO SERVICES</h1>
            <p style={{ margin: '4px 0', fontSize: '10pt', color: '#4b5563' }}>
              Địa chỉ: 123 Đường Số 1, TP. Hồ Chí Minh | Hotline: 1900 8888
            </p>
            <p style={{ margin: '2px 0', fontSize: '10pt', color: '#4b5563' }}>
              Email: contact@garage.local | Website: garage.local
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '14pt', margin: 0, color: '#111827' }}>PHIẾU BÁO GIÁ DỊCH VỤ</h2>
            <p style={{ margin: '4px 0', fontSize: '10pt', fontWeight: 600 }}>
              Mã báo giá: {selected?.quoteNumber ?? '-'}
            </p>
            <p style={{ margin: '2px 0', fontSize: '10pt' }}>
              Lệnh sửa chữa (RO): #{selected?.repairOrderId ?? '-'}
            </p>
            <p style={{ margin: '2px 0', fontSize: '10pt' }}>
              Trạng thái: <strong>{selected?.status ?? '-'}</strong>
            </p>
          </div>
        </div>
      </div>

      <h1 className="page-title no-print">Báo giá & duyệt online</h1>
      <p className="page-desc no-print">Xem chi tiết phụ tùng, công và phê duyệt trước khi thực hiện.</p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row-between">
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>{selected?.status ?? '—'}</span>
            <div style={{ fontWeight: 700 }}>{selected?.quoteNumber ?? 'Chưa có báo giá'}</div>
            <div className="muted">RO #{selected?.repairOrderId ?? '-'}</div>
            {selected?.staffNotes ? (
              <div className="muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Ghi chú kỹ thuật: {selected.staffNotes}
              </div>
            ) : null}
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-value" style={{ fontSize: '1.35rem' }}>
              {formatMoney(selected?.grandTotal)}
            </div>
            <div className="muted">Đã bao gồm VAT ({((selected?.taxRate ?? 0.1) * 100).toFixed(0)}%)</div>
          </div>
        </div>

        <div className="divider" />

        <div className="table-wrap" style={{ border: 'none' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Hạng mục</th>
                <th>Loại</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {selected?.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.description}</td>
                  <td>
                    <span className={line.lineType === 'PART' ? 'badge badge-amber' : 'badge badge-blue'}>
                      {line.lineType === 'PART' ? 'Phụ tùng' : 'Tiền công'}
                    </span>
                  </td>
                  <td>{line.quantity}</td>
                  <td>{formatMoney(line.unitPrice)}</td>
                  <td style={{ fontWeight: 600 }}>{formatMoney(line.lineTotal)}</td>
                </tr>
              ))}
              {(!selected || selected.lines.length === 0) ? (
                <tr>
                  <td colSpan={5} className="muted" style={{ textAlign: 'center' }}>
                    Chưa có hạng mục báo giá nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="row-between no-print" style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-ghost" onClick={handlePrint} disabled={!selected}>
              📄 In / Xuất PDF
            </button>
            <button type="button" className="btn btn-danger" onClick={reject} disabled={!selected || selected.status === 'APPROVED'}>
              Từ chối & ghi chú
            </button>
          </div>
          <button type="button" className="btn btn-primary" onClick={approve} disabled={!selected || selected.status === 'APPROVED'}>
            {selected?.status === 'APPROVED' ? 'Đã duyệt' : 'Duyệt báo giá'}
          </button>
        </div>
        {message ? <p className="muted no-print" style={{ marginTop: '0.75rem' }}>{message}</p> : null}
      </div>

      <div className="card card-muted no-print">
        <div className="row-between">
          <div>
            <span className="badge badge-green">Danh sách báo giá</span>
            <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>{quotes.length} báo giá</div>
            <div className="muted">Chọn ở đây để xem nhanh</div>
          </div>
          <select value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))}>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quoteNumber} · RO #{q.repairOrderId} ({q.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Printable Signatures */}
      <div className="print-only">
        <div className="print-signatures">
          <div className="print-signature-box">
            <strong>Khách hàng duyệt giá</strong>
            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0' }}>(Ký và ghi rõ họ tên)</p>
            <div className="print-signature-space" />
          </div>
          <div className="print-signature-box">
            <strong>Cố vấn dịch vụ / Garage</strong>
            <p style={{ fontSize: '9pt', color: '#6b7280', margin: '2px 0' }}>(Ký và ghi rõ họ tên)</p>
            <div className="print-signature-space" />
          </div>
        </div>
      </div>
    </div>
  )
}

