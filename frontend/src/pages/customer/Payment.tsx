import { useEffect, useMemo, useState } from 'react'
import { api, type Payment as PaymentType, type Quote } from '../../lib/api'
import { formatDate, formatMoney } from '../../lib/format'

type PayMode = 'CASH' | 'VNPAY'

export function Payment() {
  const [payments, setPayments] = useState<PaymentType[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [payMode, setPayMode] = useState<PayMode>('VNPAY')
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [qrPaymentRef, setQrPaymentRef] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([api.customer.payments(), api.customer.quotes()])
      .then(([p, q]) => {
        if (!active) return
        setPayments(p)
        setQuotes(q)
      })
      .catch((err) => {
        if (!active) return
        setMessage(err instanceof Error ? err.message : 'Không thể tải dữ liệu thanh toán')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const payableQuote = useMemo(() => quotes.find((q) => q.status === 'APPROVED' || q.status === 'SENT'), [quotes])

  async function payCash() {
    if (!payableQuote) return
    setPaying(true)
    setMessage(null)
    try {
      const created = await api.customer.createPayment({
        repairOrderId: payableQuote.repairOrderId,
        quoteId: payableQuote.id,
        amount: payableQuote.grandTotal,
        method: 'CASH',
      })
      const completed = await api.customer.completePayment(created.id, `CASH-${Date.now()}`)
      setPayments((prev) => [completed, ...prev])
      setMessage('Khách đã xác nhận thanh toán tiền mặt thành công.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán tiền mặt')
    } finally {
      setPaying(false)
    }
  }

  async function payVnpay() {
    if (!payableQuote) return
    setPaying(true)
    setMessage(null)
    try {
      const created = await api.customer.createVnpayPayment({
        repairOrderId: payableQuote.repairOrderId,
        quoteId: payableQuote.id,
        amount: payableQuote.grandTotal,
        orderInfo: `Thanh toan ${payableQuote.quoteNumber}`,
      })
      setQrPaymentRef(created.paymentRef)
      setQrUrl(created.paymentUrl)
      setMessage('Quét mã QR để thanh toán VNPay.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tạo mã QR thanh toán')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Thanh toán</h1>
      <p className="page-desc">Chọn tiền mặt hoặc VNPay. Tiền mặt xác nhận là hoàn tất ngay, VNPay sẽ hiển thị mã QR.</p>

      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Hoá đơn chờ thanh toán</h2>
          {loading ? <p className="muted">Đang tải...</p> : null}
          <div className="stack">
            <div className="row-between">
              <span className="muted">RO</span>
              <span className="badge badge-amber">Chờ thanh toán</span>
            </div>
            <div className="row-between">
              <span>{payableQuote?.quoteNumber ?? 'Không có hóa đơn chờ thanh toán'}</span>
              <strong>{formatMoney(payableQuote?.grandTotal ?? 0)}</strong>
            </div>
            <div className="field">
              <label>Phương thức thanh toán</label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="radio" name="payMode" checked={payMode === 'CASH'} onChange={() => setPayMode('CASH')} />
                  Tiền mặt
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="radio" name="payMode" checked={payMode === 'VNPAY'} onChange={() => setPayMode('VNPAY')} />
                  VNPay
                </label>
              </div>
            </div>

            <div className="row-between" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-primary" onClick={payCash} disabled={!payableQuote || paying || payMode !== 'CASH'}>
                {paying && payMode === 'CASH' ? 'Đang xác nhận...' : 'Xác nhận tiền mặt'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={payVnpay} disabled={!payableQuote || paying || payMode !== 'VNPAY'}>
                {paying && payMode === 'VNPAY' ? 'Đang tạo QR...' : 'Tạo mã QR VNPay'}
              </button>
            </div>

            {message ? <div className="muted">{message}</div> : null}
          </div>
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Mã QR thanh toán VNPay</h2>
          {qrUrl ? (
            <div className="stack" style={{ alignItems: 'center' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`}
                alt="VNPay QR"
                style={{ width: 240, height: 240, borderRadius: 16, background: '#fff', padding: 8 }}
              />
              <div className="muted" style={{ textAlign: 'center' }}>
                Mã thanh toán: {qrPaymentRef}
              </div>
              <a href={qrUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                Mở link VNPay
              </a>
            </div>
          ) : (
            <p className="muted">Chưa tạo mã QR VNPay.</p>
          )}
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
              <th>Phương thức</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{p.transactionRef ?? p.paymentNumber}</td>
                <td>{formatDate(p.paidAt ?? p.createdAt)}</td>
                <td>{formatMoney(p.amount)}</td>
                <td>{p.method === 'CASH' ? 'Tiền mặt' : p.method === 'ONLINE' ? 'VNPay' : p.method}</td>
                <td>
                  <span className={p.status === 'COMPLETED' ? 'badge badge-green' : 'badge badge-amber'}>{p.status}</span>
                </td>
              </tr>
            ))}
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  Chưa có giao dịch nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
