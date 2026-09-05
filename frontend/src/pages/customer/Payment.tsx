import { useEffect, useMemo, useState } from 'react'
import { api, type Payment as PaymentType, type Quote } from '../../lib/api'
import { formatDate, formatMoney, formatPaymentMethod, formatStatus, getStatusBadgeClass } from '../../lib/format'

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
  const [selectedQuoteId, setSelectedQuoteId] = useState<number | null>(null)

  const reloadData = async () => {
    try {
      const [p, q] = await Promise.all([api.customer.payments(), api.customer.quotes()])
      setPayments(p)
      setQuotes(q)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tải dữ liệu thanh toán')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('vnpaySuccess') === 'true') {
      const ref = params.get('txnRef') || ''
      setMessage(`🎉 Thanh toán VNPay thành công${ref ? ` cho mã giao dịch ${ref}` : ''}!`)
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (params.get('vnpayError')) {
      setMessage(`❌ Giao dịch VNPay không thành công (Mã lỗi: ${params.get('vnpayError')})`)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    reloadData()
  }, [])

  // A quote is completed/paid if there is at least one COMPLETED payment for it
  const isQuotePaid = (quote: Quote) => {
    return payments.some(
      (p) =>
        p.status === 'COMPLETED' &&
        ((p.quoteId && p.quoteId === quote.id) || (!p.quoteId && p.repairOrderId === quote.repairOrderId))
    )
  }

  // Sorted list of all customer quotes
  const allQuotes = useMemo(() => {
    return [...quotes].sort((a, b) => b.id - a.id)
  }, [quotes])

  // Quotes that are approved/sent and NOT yet paid
  const unpaidQuotes = useMemo(() => {
    return allQuotes.filter((q) => (q.status === 'APPROVED' || q.status === 'SENT') && !isQuotePaid(q))
  }, [allQuotes, payments])

  // Synchronize selectedQuoteId with available unpaid quotes
  useEffect(() => {
    if (unpaidQuotes.length > 0) {
      if (!selectedQuoteId || !unpaidQuotes.some((q) => q.id === selectedQuoteId)) {
        setSelectedQuoteId(unpaidQuotes[0].id)
      }
    } else {
      setSelectedQuoteId(null)
    }
  }, [unpaidQuotes, selectedQuoteId])

  const selectedQuote = useMemo(() => {
    if (!selectedQuoteId) return null
    return quotes.find((q) => q.id === selectedQuoteId) || null
  }, [quotes, selectedQuoteId])

  // Reset QR state when changing selected quote
  useEffect(() => {
    setQrUrl(null)
    setQrPaymentRef(null)
  }, [selectedQuoteId])

  async function payCash() {
    if (!selectedQuote) return
    if (isQuotePaid(selectedQuote)) {
      setMessage('Hóa đơn này đã được thanh toán hoàn tất trước đó.')
      return
    }
    setPaying(true)
    setMessage(null)
    try {
      const created = await api.customer.createPayment({
        repairOrderId: selectedQuote.repairOrderId,
        quoteId: selectedQuote.id,
        amount: selectedQuote.grandTotal,
        method: 'CASH',
      })
      await api.customer.completePayment(created.id, `CASH-${Date.now()}`)
      setMessage(`Khách đã xác nhận thanh toán tiền mặt thành công cho hóa đơn ${selectedQuote.quoteNumber}.`)
      await reloadData()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán tiền mặt')
    } finally {
      setPaying(false)
    }
  }

  async function mockPayVnpay() {
    if (!qrPaymentRef) return
    setPaying(true)
    setMessage(null)
    try {
      await api.customer.mockCompleteVnpayPayment(qrPaymentRef)
      setQrUrl(null)
      setQrPaymentRef(null)
      setMessage(`Đã thanh toán VNPay thành công (Chế độ thử nghiệm).`)
      await reloadData()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán thử nghiệm')
    } finally {
      setPaying(false)
    }
  }

  async function payVnpay() {
    if (!selectedQuote) return
    if (isQuotePaid(selectedQuote)) {
      setMessage('Hóa đơn này đã được thanh toán hoàn tất trước đó.')
      return
    }
    setPaying(true)
    setMessage(null)
    try {
      const created = await api.customer.createVnpayPayment({
        repairOrderId: selectedQuote.repairOrderId,
        quoteId: selectedQuote.id,
        amount: selectedQuote.grandTotal,
        orderInfo: `Thanh toan ${selectedQuote.quoteNumber}`,
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
      <p className="page-desc">Chọn hóa đơn cần thanh toán bằng tiền mặt hoặc VNPay. Tiền mặt xác nhận hoàn tất ngay, VNPay sẽ hiển thị mã QR.</p>

      {/* 1. DANH SÁCH HÓA ĐƠN & BÁO GIÁ CỦA KHÁCH HÀNG */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="row-between" style={{ marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', margin: 0 }}>Danh sách hóa đơn của bạn</h2>
            <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
              Nhấp vào một hóa đơn bên dưới để chọn thanh toán. Hóa đơn đã thanh toán sẽ hiển thị trạng thái hoàn tất và không thể thanh toán lại.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-amber">{unpaidQuotes.length} chờ thanh toán</span>
            <span className="badge badge-green">
              {allQuotes.filter(isQuotePaid).length} đã thanh toán
            </span>
          </div>
        </div>

        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}>Chọn</th>
                <th>Mã hóa đơn</th>
                <th>Lệnh sửa chữa</th>
                <th>Ngày lập</th>
                <th>Tổng tiền</th>
                <th>Trạng thái duyệt</th>
                <th>Trạng thái thanh toán</th>
              </tr>
            </thead>
            <tbody>
              {allQuotes.map((q) => {
                const paid = isQuotePaid(q)
                const isSelected = selectedQuote?.id === q.id
                return (
                  <tr
                    key={q.id}
                    onClick={() => {
                      if (!paid) setSelectedQuoteId(q.id)
                    }}
                    style={{
                      cursor: paid ? 'default' : 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.08)' : undefined,
                    }}
                  >
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="radio"
                        name="selectedQuote"
                        checked={isSelected}
                        disabled={paid}
                        onChange={() => setSelectedQuoteId(q.id)}
                        style={{ cursor: paid ? 'not-allowed' : 'pointer' }}
                      />
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: isSelected ? 600 : 'normal' }}>
                      {q.quoteNumber}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>RO-{q.repairOrderId}</td>
                    <td>{formatDate(q.createdAt)}</td>
                    <td style={{ fontWeight: 600 }}>{formatMoney(q.grandTotal)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(q.status)}`}>{formatStatus(q.status)}</span>
                    </td>
                    <td>
                      {paid ? (
                        <span className="badge badge-green">✓ Đã thanh toán</span>
                      ) : (
                        <span className="badge badge-amber">Chờ thanh toán</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {allQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
                    {loading ? 'Đang tải danh sách hóa đơn...' : 'Bạn chưa có hóa đơn nào.'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. KHUNG THANH TOÁN CHO HÓA ĐƠN ĐƯỢC CHỌN HOẶC TRẠNG THÁI HOÀN TẤT */}
      <div className="grid-2">
        <div className="card">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>
            {selectedQuote ? `Thanh toán hóa đơn: ${selectedQuote.quoteNumber}` : 'Thông tin thanh toán'}
          </h2>
          {loading ? <p className="muted">Đang tải...</p> : null}

          {selectedQuote ? (
            <div className="stack">
              <div className="row-between">
                <span className="muted">Lệnh sửa chữa: RO-{selectedQuote.repairOrderId}</span>
                <span className="badge badge-amber">Chờ thanh toán</span>
              </div>
              <div
                className="row-between"
                style={{
                  padding: '0.75rem 0',
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontSize: '1.05rem', fontWeight: 500 }}>{selectedQuote.quoteNumber}</span>
                <strong style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
                  {formatMoney(selectedQuote.grandTotal)}
                </strong>
              </div>

              <div className="field">
                <label>Phương thức thanh toán</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="payMode" checked={payMode === 'CASH'} onChange={() => setPayMode('CASH')} />
                    Tiền mặt
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                    <input type="radio" name="payMode" checked={payMode === 'VNPAY'} onChange={() => setPayMode('VNPAY')} />
                    VNPay
                  </label>
                </div>
              </div>

              <div className="row-between" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={payCash}
                  disabled={paying || payMode !== 'CASH'}
                >
                  {paying && payMode === 'CASH' ? 'Đang xác nhận...' : 'Xác nhận tiền mặt'}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={payVnpay}
                  disabled={paying || payMode !== 'VNPAY'}
                >
                  {paying && payMode === 'VNPAY' ? 'Đang tạo QR...' : 'Tạo mã QR VNPay'}
                </button>
              </div>

              {message ? <div className="muted" style={{ fontWeight: 500 }}>{message}</div> : null}
            </div>
          ) : (
            <div className="stack" style={{ padding: '1.5rem 0', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
              <strong style={{ fontSize: '1.05rem', color: '#059669' }}>
                Tất cả hóa đơn đã được thanh toán đầy đủ!
              </strong>
              <p className="muted" style={{ margin: '0.35rem 0 0', maxWidth: 360 }}>
                Bạn hiện không có hóa đơn nào đang chờ thanh toán. Cảm ơn quý khách đã sử dụng dịch vụ của OTO Garage!
              </p>
              {message ? <div style={{ marginTop: '0.75rem', fontWeight: 500 }}>{message}</div> : null}
            </div>
          )}
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Mã QR thanh toán VNPay</h2>
          {qrUrl && selectedQuote ? (
            <div className="stack" style={{ alignItems: 'center' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrUrl)}`}
                alt="VNPay QR"
                style={{ width: 240, height: 240, borderRadius: 16, background: '#fff', padding: 8 }}
              />
              <div className="muted" style={{ textAlign: 'center' }}>
                Mã thanh toán: {qrPaymentRef} ({selectedQuote.quoteNumber})
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <a href={qrUrl} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
                  Mở link VNPay
                </a>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={mockPayVnpay}
                  disabled={paying}
                  style={{ background: '#059669', borderColor: '#059669', color: '#fff' }}
                  title="Giả lập thanh toán thành công ngay lập tức để kiểm tra luồng"
                >
                  {paying ? 'Đang xử lý...' : '⚡ Giả lập thanh toán thành công'}
                </button>
              </div>
            </div>
          ) : (
            <p className="muted" style={{ textAlign: 'center', padding: '2rem 0' }}>
              {selectedQuote
                ? 'Chọn VNPay và nhấn "Tạo mã QR VNPay" để hiển thị mã thanh toán.'
                : 'Không có hóa đơn nào chờ thanh toán.'}
            </p>
          )}
        </div>
      </div>

      {/* 3. LỊCH SỬ GIAO DỊCH */}
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
                <td>{formatPaymentMethod(p.method)}</td>
                <td>
                  <span className={`badge ${getStatusBadgeClass(p.status)}`}>{formatStatus(p.status)}</span>
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
