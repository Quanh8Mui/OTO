import { useEffect, useMemo, useState } from 'react'
import { api, type RepairOrder, type ServiceRating as ServiceRatingType } from '../../lib/api'
import { formatStatus } from '../../lib/format'

export function ServiceRating() {
  const [orders, setOrders] = useState<RepairOrder[]>([])
  const [myRatings, setMyRatings] = useState<ServiceRatingType[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    try {
      const [orderList, ratingList] = await Promise.all([
        api.customer.repairOrders(),
        api.customer.ratings(),
      ])
      setOrders(orderList.filter((order) => order.status === 'DELIVERED' || order.status === 'COMPLETED'))
      setMyRatings(ratingList)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tải dữ liệu đánh giá')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Chỉ cho phép đánh giá các đơn chưa từng được đánh giá
  const unratedOrders = useMemo(() => {
    const ratedOrderIds = new Set(myRatings.map((r) => r.repairOrderId))
    return orders.filter((o) => !ratedOrderIds.has(o.id))
  }, [orders, myRatings])

  const selectedOrder = useMemo(
    () => unratedOrders.find((o) => o.id === selectedOrderId) ?? unratedOrders[0] ?? null,
    [unratedOrders, selectedOrderId],
  )

  useEffect(() => {
    if (selectedOrder && selectedOrderId !== selectedOrder.id) {
      setSelectedOrderId(selectedOrder.id)
    } else if (!selectedOrder) {
      setSelectedOrderId(null)
    }
  }, [selectedOrder, selectedOrderId])

  async function submit() {
    if (!selectedOrder) {
      setMessage('Không có đơn hàng đủ điều kiện để đánh giá.')
      setIsSuccess(false)
      return
    }
    setSubmitting(true)
    setMessage(null)
    try {
      await api.customer.createRating({ repairOrderId: selectedOrder.id, rating, comment })
      setMessage('Cảm ơn bạn! Đánh giá dịch vụ đã được gửi thành công.')
      setIsSuccess(true)
      setComment('')
      setRating(5)
      await loadData()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể gửi đánh giá')
      setIsSuccess(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Đánh giá dịch vụ</h1>
      <p className="page-desc">
        Đóng góp ý kiến và đánh giá trải nghiệm dịch vụ sau khi xe đã được sửa chữa và bàn giao.
      </p>

      {/* Form đánh giá đơn hàng mới */}
      <div className="card" style={{ maxWidth: 760, marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>
          Gửi đánh giá dịch vụ mới
        </h2>

        {loading ? (
          <div className="muted" style={{ padding: '1rem 0' }}>Đang tải thông tin đơn hàng...</div>
        ) : unratedOrders.length === 0 ? (
          <div
            style={{
              padding: '1.25rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: 'var(--text-main)',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, color: '#059669', fontSize: '1.05rem' }}>
              Bạn đã đánh giá tất cả các đơn hàng hoàn tất!
            </p>
            <p style={{ margin: '0.4rem 0 0', fontSize: '0.9rem', color: '#4b5563' }}>
              Khi bạn có thêm dịch vụ sửa chữa mới hoàn thành và nhận xe, bạn có thể quay lại đây để gửi đánh giá tiếp.
            </p>
          </div>
        ) : (
          <>
            <div className="field">
              <label>Chọn đơn hàng cần đánh giá</label>
              <select
                value={selectedOrderId ?? ''}
                onChange={(e) => setSelectedOrderId(e.target.value ? Number(e.target.value) : null)}
              >
                {unratedOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.orderNumber} · Biển số: {order.licensePlate} ({formatStatus(order.status)})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Điểm đánh giá trải nghiệm</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.85rem' }}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="btn btn-ghost"
                    style={{
                      padding: '0.2rem 0.35rem',
                      fontSize: '1.8rem',
                      color: value <= rating ? '#eab308' : '#cbd5e1',
                    }}
                    onClick={() => setRating(value)}
                    title={`${value} sao`}
                  >
                    ★
                  </button>
                ))}
                <span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: '0.5rem', color: '#d97706' }}>
                  {rating === 5 && 'Tuyệt vời (5/5)'}
                  {rating === 4 && 'Hài lòng (4/5)'}
                  {rating === 3 && 'Bình thường (3/5)'}
                  {rating === 2 && 'Chưa hài lòng (2/5)'}
                  {rating === 1 && 'Rất tệ (1/5)'}
                </span>
              </div>
            </div>

            <div className="field">
              <label>Tiêu chí dịch vụ</label>
              <div className="stack" style={{ gap: '0.5rem', fontSize: '0.9rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}>
                {[
                  'Thái độ phục vụ tận tâm, chuyên nghiệp',
                  'Đúng hẹn theo cam kết bàn giao',
                  'Chi phí minh bạch, báo giá rõ ràng',
                  'Chất lượng sửa chữa và vận hành xe ổn định',
                ].map((t) => (
                  <div key={t} className="row-between">
                    <span>{t}</span>
                    <span style={{ color: '#eab308' }}>★★★★★</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Nhận xét / Ý kiến đóng góp (tuỳ chọn)</label>
              <textarea
                rows={3}
                placeholder="Kỹ thuật viên tư vấn rõ ràng, phụ tùng chính hãng, xe chạy êm sau khi bảo dưỡng..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={submit}
              disabled={submitting || !selectedOrder}
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </>
        )}

        {message ? (
          <p
            style={{
              marginTop: '1rem',
              fontWeight: 500,
              color: isSuccess ? '#16a34a' : '#dc2626',
            }}
          >
            {message}
          </p>
        ) : null}
      </div>

      {/* Lịch sử phiếu đánh giá đã gửi */}
      <div className="card" style={{ maxWidth: 760 }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Lịch sử phiếu đánh giá của bạn
        </h2>
        <p className="page-desc" style={{ marginBottom: '1rem' }}>
          Danh sách các phiếu đánh giá bạn đã gửi tới Garage.
        </p>

        {myRatings.length === 0 ? (
          <div className="muted" style={{ textAlign: 'center', padding: '1.5rem' }}>
            Bạn chưa gửi phiếu đánh giá nào.
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Ngày gửi</th>
                  <th>Mã đơn (RO)</th>
                  <th>Biển số xe</th>
                  <th>Điểm</th>
                  <th>Nội dung nhận xét</th>
                </tr>
              </thead>
              <tbody>
                {myRatings.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.orderNumber || `#${r.repairOrderId}`}</td>
                    <td>{r.licensePlate || '-'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#eab308', marginRight: '4px' }}>
                        {'★'.repeat(r.rating)}
                        {'☆'.repeat(5 - r.rating)}
                      </span>
                      <strong>({r.rating}/5)</strong>
                    </td>
                    <td>
                      {r.comment ? (
                        <span>{r.comment}</span>
                      ) : (
                        <span className="muted" style={{ fontStyle: 'italic' }}>
                          Không có nhận xét
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
