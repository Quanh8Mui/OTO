import { useEffect, useMemo, useState } from 'react'
import { api } from '../../lib/api'
import { formatStatus, getStatusBadgeClass } from '../../lib/format'

type PartsRequest = {
  id: number
  requestNumber: string
  repairOrderId: number
  requestedByStaffId: number
  status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED'
  adminNote?: string
  createdAt: string
  fulfilledAt?: string
  lines: Array<{ id: number; partId: number; partName: string; partSku: string; quantityRequested: number; quantityIssued: number }>
}

export function PartsRequestsReview() {
  const [requests, setRequests] = useState<PartsRequest[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const pending = useMemo(() => requests.filter((r) => r.status === 'PENDING'), [requests])
  const selected = useMemo(() => requests.find((r) => r.id === selectedId) ?? pending[0] ?? null, [requests, selectedId, pending])

  async function loadData() {
    setLoading(true)
    try {
      const data = await api.admin.partsRequests()
      setRequests(data)
      if (!selectedId && data[0]) setSelectedId(data[0].id)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tải phiếu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  async function act(action: 'approve' | 'fulfill' | 'reject') {
    if (!selected) return
    setSaving(true)
    setMessage(null)
    try {
      if (action === 'approve') await api.admin.approvePartsRequest(selected.id, note)
      if (action === 'fulfill') await api.admin.fulfillPartsRequest(selected.id, note)
      if (action === 'reject') await api.admin.rejectPartsRequest(selected.id, note)
      setNote('')
      await loadData()
      setMessage(`Đã ${action === 'approve' ? 'duyệt' : action === 'fulfill' ? 'xuất kho' : 'từ chối'} phiếu.`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể thực hiện')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Duyệt yêu cầu phụ tùng</h1>
      <p className="page-desc">Danh sách phiếu từ staff cần admin kiểm tra, duyệt và xác nhận xuất kho.</p>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Phiếu chờ duyệt</h2>
            <span className="badge badge-blue">{pending.length} chờ xử lý</span>
          </div>
          {loading ? <p className="muted">Đang tải...</p> : null}
          <div className="stack" style={{ maxHeight: 460, overflow: 'auto' }}>
            {pending.map((req) => (
              <button
                key={req.id}
                type="button"
                className="card"
                onClick={() => setSelectedId(req.id)}
                style={{
                  textAlign: 'left',
                  cursor: 'pointer',
                  width: '100%',
                  background: req.id === selected?.id ? 'var(--accent-dim)' : 'var(--bg-panel)',
                  border: req.id === selected?.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                <strong>{req.requestNumber}</strong>
                <div className="muted" style={{ marginTop: '0.35rem' }}>RO #{req.repairOrderId} · {formatStatus(req.status)}</div>
                <div className="muted" style={{ marginTop: '0.2rem' }}>{req.lines.length} dòng phụ tùng</div>
              </button>
            ))}
            {pending.length === 0 ? <p className="muted">Không có phiếu chờ duyệt.</p> : null}
          </div>
        </div>

        <div className="stack">
          {selected ? (
            <>
              <div className="card">
                <div className="row-between" style={{ marginBottom: '1rem' }}>
                  <div>
                    <span className={`badge ${getStatusBadgeClass(selected.status)}`}>{formatStatus(selected.status)}</span>
                    <h2 style={{ margin: '0.5rem 0 0', fontSize: '1.15rem' }}>{selected.requestNumber}</h2>
                    <div className="muted" style={{ marginTop: '0.25rem' }}>RO #{selected.repairOrderId} · Staff #{selected.requestedByStaffId}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="muted">Tạo lúc</div>
                    <strong>{new Date(selected.createdAt).toLocaleString('vi-VN')}</strong>
                  </div>
                </div>

                <div className="card card-muted" style={{ marginBottom: '1rem' }}>
                  <h3 style={{ marginTop: 0, fontSize: '0.98rem' }}>Chi tiết phiếu</h3>
                  <div className="table-wrap">
                    <table className="data">
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Tên</th>
                          <th>SL yêu cầu</th>
                          <th>SL xuất</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.lines.map((line) => (
                          <tr key={line.id}>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{line.partSku}</td>
                            <td>{line.partName}</td>
                            <td>{line.quantityRequested}</td>
                            <td>{line.quantityIssued}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="field">
                  <label>Ghi chú admin</label>
                  <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú duyệt / lý do từ chối / biên bản xuất kho..." />
                </div>

                <div className="row-between" style={{ gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => void act('reject')} disabled={saving}>
                    Từ chối
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => void act('approve')} disabled={saving}>
                    Duyệt phiếu
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => void act('fulfill')} disabled={saving}>
                    {saving ? 'Đang xử lý...' : 'Xác nhận xuất kho'}
                  </button>
                </div>
              </div>


              {message ? (
                <div className="card card-muted">
                  <strong>Thông báo</strong>
                  <p className="muted" style={{ marginBottom: 0 }}>{message}</p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="card">
              <p className="muted">Chưa chọn phiếu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
