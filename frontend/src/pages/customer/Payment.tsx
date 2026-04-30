import { useEffect, useMemo, useState } from 'react'
import { api, type Payment as PaymentType, type Quote } from '../../lib/api'
import { formatDate, formatMoney } from '../../lib/format'

export function Payment() {
  const [payments, setPayments] = useState<PaymentType[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedMethod, setSelectedMethod] = useState<PaymentType['method']>('ONLINE')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.customer.payments(), api.customer.quotes()]).then(([p, q]) => {
      setPayments(p)
      setQuotes(q)
    })
  }, [])

  const pendingQuote = useMemo(() => quotes.find((q) => q.status === 'APPROVED'), [quotes])

  async function payNow() {
    if (!pendingQuote) return
    const created = await api.customer.createPayment({
      repairOrderId: pendingQuote.repairOrderId,
      quoteId: pendingQuote.id,
      amount: pendingQuote.grandTotal,
      method: selectedMethod,
    })
    const completed = await api.customer.completePayment(created.id, `SIM-${Date.now()}`)
    setPayments((prev) => [completed, ...prev])
    setMessage('Thanh toán thành công.')
  }

  return (
    <div className="page">
      <h1 className="page-title">Thanh toán online</h1>
      <p className="page-desc">Thanh toán hoá đơn sau khi công việc hoàn tất (tích hợp cổng sau).</p>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Hoá đơn chờ thanh toán</h2>
          <div className="stack">
            <div className="row-between">
              <span className="muted">RO #2026-0318</span>
              <span className="badge badge-amber">Chưa TT</span>
            </div>
            <div className="row-between">
              <span>{pendingQuote?.quoteNumber ?? 'Không có hóa đơn chờ thanh toán'}</span>
              <strong>{formatMoney(pendingQuote?.grandTotal)}</strong>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ marginTop: '0.5rem' }}
              onClick={payNow}
              disabled={!pendingQuote}
            >
              Thanh toán ngay
            </button>
            {message ? <div className="muted">{message}</div> : null}
          </div>
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Phương thức</h2>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="radio" name="pay" checked={selectedMethod === 'ONLINE'} onChange={() => setSelectedMethod('ONLINE')} /> Ví điện tử (MoMo, ZaloPay)
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input type="radio" name="pay" checked={selectedMethod === 'CARD'} onChange={() => setSelectedMethod('CARD')} /> Thẻ ATM / Visa / Mastercard
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="radio"
              name="pay"
              checked={selectedMethod === 'BANK_TRANSFER'}
              onChange={() => setSelectedMethod('BANK_TRANSFER')}
            />{' '}
            Chuyển khoản (QR)
          </label>
        </div>
      </div>

      <h2 style={{ fontSize: '1.05rem', margin: '1.75rem 0 0.75rem' }}>Lịch sử giao dịch</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mã GD</th>
              <th>Ngày</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{p.transactionRef ?? p.paymentNumber}</td>
                <td>{formatDate(p.paidAt ?? p.createdAt)}</td>
                <td>{formatMoney(p.amount)}</td>
                <td>
                  <span className={p.status === 'COMPLETED' ? 'badge badge-green' : 'badge badge-amber'}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
