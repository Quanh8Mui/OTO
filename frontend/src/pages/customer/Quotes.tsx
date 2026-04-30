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

  return (
    <div className="page">
      <h1 className="page-title">Báo giá & duyệt online</h1>
      <p className="page-desc">Xem chi tiết phụ tùng, công và phê duyệt trước khi thực hiện.</p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row-between">
          <div>
            <span className="badge badge-blue" style={{ marginBottom: '0.5rem' }}>{selected?.status ?? '—'}</span>
            <div style={{ fontWeight: 700 }}>{selected?.quoteNumber ?? 'Chưa có báo giá'}</div>
            <div className="muted">RO #{selected?.repairOrderId ?? '-'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="stat-value" style={{ fontSize: '1.35rem' }}>
              {formatMoney(selected?.grandTotal)}
            </div>
            <div className="muted">Đã bao gồm VAT</div>
          </div>
        </div>

        <div className="divider" />

        <div className="table-wrap" style={{ border: 'none' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Hạng mục</th>
                <th>SL</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {selected?.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.description}</td>
                  <td>{line.quantity}</td>
                  <td>{formatMoney(line.unitPrice)}</td>
                  <td>{formatMoney(line.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="row-between" style={{ marginTop: '1rem' }}>
          <button type="button" className="btn btn-danger" onClick={reject} disabled={!selected}>
            Từ chối & ghi chú
          </button>
          <button type="button" className="btn btn-primary" onClick={approve} disabled={!selected}>
            Duyệt báo giá
          </button>
        </div>
        {message ? <p className="muted" style={{ marginTop: '0.75rem' }}>{message}</p> : null}
      </div>

      <div className="card card-muted">
        <div className="row-between">
          <div>
            <span className="badge badge-green">Danh sách báo giá</span>
            <div style={{ marginTop: '0.5rem', fontWeight: 600 }}>{quotes.length} báo giá</div>
            <div className="muted">Chọn ở đây để xem nhanh</div>
          </div>
          <select value={selectedId ?? ''} onChange={(e) => setSelectedId(Number(e.target.value))}>
            {quotes.map((q) => (
              <option key={q.id} value={q.id}>
                {q.quoteNumber}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
