import { useEffect, useMemo, useState } from 'react'
import { api, type Quote } from '../../lib/api'
import { formatMoney, formatStatus, getStatusBadgeClass } from '../../lib/format'

export function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectType, setRejectType] = useState<'ADJUST' | 'CANCEL_RETURN'>('ADJUST')
  const [rejectCustomNote, setRejectCustomNote] = useState('')
  const [rejecting, setRejecting] = useState(false)

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

  async function confirmReject() {
    if (!selected) return
    setRejecting(true)
    try {
      const reasonLabel =
        rejectType === 'CANCEL_RETURN'
          ? `Không đồng ý sửa chữa (Yêu cầu nhận lại xe)${rejectCustomNote.trim() ? `: ${rejectCustomNote.trim()}` : ''}`
          : `Yêu cầu điều chỉnh lại báo giá${rejectCustomNote.trim() ? `: ${rejectCustomNote.trim()}` : ''}`

      const updated = await api.customer.rejectQuote(selected.id, reasonLabel)
      setQuotes((prev) => prev.map((q) => (q.id === updated.id ? updated : q)))
      setShowRejectModal(false)
      setRejectCustomNote('')
      setMessage(
        rejectType === 'CANCEL_RETURN'
          ? 'Đã gửi yêu cầu từ chối & xin nhận lại xe. Xưởng sẽ làm thủ tục hoàn tất hồ sơ để bàn giao trả xe.'
          : 'Đã gửi yêu cầu điều chỉnh báo giá tới xưởng.',
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể gửi phản hồi từ chối')
    } finally {
      setRejecting(false)
    }
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
              Trạng thái: <strong>{selected?.status ? formatStatus(selected.status) : '-'}</strong>
            </p>
          </div>
        </div>
      </div>

      <h1 className="page-title no-print">Báo giá & duyệt online</h1>
      <p className="page-desc no-print">Xem chi tiết phụ tùng, công và phê duyệt trước khi thực hiện.</p>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="row-between">
          <div>
            <span className={`badge ${getStatusBadgeClass(selected?.status)}`} style={{ marginBottom: '0.5rem' }}>
              {selected?.status ? formatStatus(selected.status) : '—'}
            </span>
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
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setShowRejectModal(true)}
              disabled={!selected || selected.status === 'APPROVED' || selected.status === 'REJECTED'}
            >
              Từ chối & phản hồi
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
                {q.quoteNumber} · RO #{q.repairOrderId} ({formatStatus(q.status)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rejection Options Modal */}
      {showRejectModal && selected && (
        <div
          className="no-print"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 500,
              width: '100%',
              padding: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25)',
              borderRadius: '16px',
            }}
          >
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.35rem', color: '#111827' }}>
              Xác nhận từ chối báo giá
            </h2>
            <p className="muted" style={{ fontSize: '0.85rem', margin: '0 0 1.25rem' }}>
              Báo giá <strong>{selected.quoteNumber}</strong> (Lệnh sửa chữa RO #{selected.repairOrderId})
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: `1.5px solid ${rejectType === 'ADJUST' ? '#6366f1' : '#e5e7eb'}`,
                  background: rejectType === 'ADJUST' ? 'rgba(99, 102, 241, 0.05)' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="rejectType"
                  checked={rejectType === 'ADJUST'}
                  onChange={() => setRejectType('ADJUST')}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1f2937' }}>
                    🔄 Yêu cầu điều chỉnh lại báo giá (Xe vẫn ở xưởng)
                  </div>
                  <div className="muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Yêu cầu xưởng xem xét giảm bớt hoặc đổi các hạng mục và gửi lại báo giá mới.
                  </div>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: `1.5px solid ${rejectType === 'CANCEL_RETURN' ? '#ef4444' : '#e5e7eb'}`,
                  background: rejectType === 'CANCEL_RETURN' ? 'rgba(239, 68, 68, 0.05)' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="rejectType"
                  checked={rejectType === 'CANCEL_RETURN'}
                  onChange={() => setRejectType('CANCEL_RETURN')}
                  style={{ marginTop: '0.2rem' }}
                />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#b91c1c' }}>
                    🚗 Không sửa chữa — Xin nhận lại xe
                  </div>
                  <div className="muted" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                    Không đồng ý phương án sửa chữa, yêu cầu xưởng hoàn tất hồ sơ để nhận xe về.
                  </div>
                </div>
              </label>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                Ghi chú thêm cho cố vấn dịch vụ (tùy chọn):
              </label>
              <textarea
                value={rejectCustomNote}
                onChange={(e) => setRejectCustomNote(e.target.value)}
                placeholder={
                  rejectType === 'CANCEL_RETURN'
                    ? 'VD: Chi phí vượt ngân sách, tôi xin nhận lại xe vào chiều nay...'
                    : 'VD: Xin bỏ bớt lọc gió, chỉ thay dầu động cơ giúp tôi...'
                }
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowRejectModal(false)}
                disabled={rejecting}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmReject}
                disabled={rejecting}
              >
                {rejecting ? 'Đang gửi...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}

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

