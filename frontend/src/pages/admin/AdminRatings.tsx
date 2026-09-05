import { useEffect, useMemo, useState } from 'react'
import { api, type ServiceRating } from '../../lib/api'

export function AdminRatings() {
  const [ratings, setRatings] = useState<ServiceRating[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [starFilter, setStarFilter] = useState<string>('ALL')
  const [search, setSearch] = useState<string>('')

  useEffect(() => {
    let active = true
    api.admin
      .ratings()
      .then((data) => {
        if (!active) return
        setRatings(data)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách đánh giá')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Thống kê số liệu
  const stats = useMemo(() => {
    const total = ratings.length
    const emptyCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    if (total === 0) {
      return { total: 0, average: '0.0', satisfactionRate: 0, starCounts: emptyCounts }
    }
    const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0)
    const average = (sum / total).toFixed(1)
    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ratings.forEach((r) => {
      if (starCounts[r.rating] !== undefined) {
        starCounts[r.rating]++
      }
    })
    const positiveReviews = starCounts[5] + starCounts[4]
    const satisfactionRate = Math.round((positiveReviews / total) * 100)

    return {
      total,
      average,
      satisfactionRate,
      starCounts,
    }
  }, [ratings])

  // Lọc dữ liệu
  const filteredRatings = useMemo(() => {
    return ratings.filter((item) => {
      if (starFilter !== 'ALL' && item.rating !== Number(starFilter)) {
        return false
      }
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchCustomer = item.customerName?.toLowerCase().includes(query) ?? false
        const matchPlate = item.licensePlate?.toLowerCase().includes(query) ?? false
        const matchOrder = item.orderNumber?.toLowerCase().includes(query) ?? false
        const matchComment = item.comment?.toLowerCase().includes(query) ?? false
        if (!matchCustomer && !matchPlate && !matchOrder && !matchComment) {
          return false
        }
      }
      return true
    })
  }, [ratings, starFilter, search])

  return (
    <div className="page">
      <h1 className="page-title">Quản lý đánh giá khách hàng</h1>
      <p className="page-desc">Theo dõi phản hồi, chỉ số hài lòng (CSAT) và chất lượng dịch vụ của garage.</p>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: '0.85rem' }}>Điểm trung bình</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#d97706', margin: '0.35rem 0' }}>
            ★ {stats.average} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ 5</span>
          </div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>Dựa trên {stats.total} lượt đánh giá</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: '0.85rem' }}>Tỷ lệ hài lòng</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#16a34a', margin: '0.35rem 0' }}>
            {stats.satisfactionRate}%
          </div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>Đánh giá 4 sao và 5 sao</div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div className="muted" style={{ fontSize: '0.85rem' }}>Tổng số đánh giá</div>
          <div style={{ fontSize: '2.2rem', fontWeight: 700, margin: '0.35rem 0' }}>
            {stats.total}
          </div>
          <div className="muted" style={{ fontSize: '0.8rem' }}>Tất cả các dịch vụ đã giao xe</div>
        </div>

        <div className="card">
          <div className="muted" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Phân bố sao</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.8rem' }}>
            {[5, 4, 3, 2, 1].map((s) => {
              const count = stats.starCounts[s] || 0
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '40px', color: '#eab308' }}>{s} ★</span>
                  <div style={{ flex: 1, background: '#e2e8f0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: s >= 4 ? '#16a34a' : s === 3 ? '#eab308' : '#dc2626' }} />
                  </div>
                  <span style={{ width: '25px', textAlign: 'right' }} className="muted">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="row-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Tìm theo tên khách, biển số xe, mã RO, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', maxWidth: '400px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="muted" style={{ fontSize: '0.9rem' }}>Lọc số sao:</span>
          <select value={starFilter} onChange={(e) => setStarFilter(e.target.value)}>
            <option value="ALL">Tất cả ({ratings.length})</option>
            <option value="5">5 sao ({stats.starCounts[5]})</option>
            <option value="4">4 sao ({stats.starCounts[4]})</option>
            <option value="3">3 sao ({stats.starCounts[3]})</option>
            <option value="2">2 sao ({stats.starCounts[2]})</option>
            <option value="1">1 sao ({stats.starCounts[1]})</option>
          </select>
        </div>
      </div>

      {/* Error or Loading */}
      {error ? <div className="card" style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</div> : null}
      {loading ? <div className="muted" style={{ padding: '1.5rem 0' }}>Đang tải danh sách đánh giá...</div> : null}

      {/* Ratings Table */}
      {!loading && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Khách hàng</th>
                  <th>Biển số xe</th>
                  <th>Mã đơn RO</th>
                  <th>Đánh giá</th>
                  <th>Nội dung nhận xét</th>
                </tr>
              </thead>
              <tbody>
                {filteredRatings.map((r) => (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{r.customerName || 'Khách hàng'}</td>
                    <td style={{ fontWeight: 600 }}>{r.licensePlate || '-'}</td>
                    <td>{r.orderNumber || `#${r.repairOrderId}`}</td>
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
                        <span className="muted" style={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                          Không có nhận xét
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRatings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: '2rem' }}>
                      {ratings.length === 0
                        ? 'Chưa có phiếu đánh giá nào từ khách hàng.'
                        : 'Không tìm thấy đánh giá nào khớp với điều kiện lọc.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
