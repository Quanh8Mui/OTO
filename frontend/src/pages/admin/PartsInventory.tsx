import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { api, type Part } from '../../lib/api'

function getStockStatus(part: Part) {
  if (part.quantityOnHand <= 0) return { label: 'Hết hàng', badge: 'badge-red' }
  if (part.quantityOnHand < part.minStock) return { label: 'Thấp', badge: 'badge-amber' }
  if (part.quantityOnHand === part.minStock) return { label: 'Cảnh báo', badge: 'badge-blue' }
  return { label: 'OK', badge: 'badge-green' }
}

type ActionMode = 'none' | 'adjust'

export function PartsInventory() {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [actionMode, setActionMode] = useState<ActionMode>('none')
  const [message, setMessage] = useState<string | null>(null)
  const [selectedSku, setSelectedSku] = useState('')
  const [quantity, setQuantity] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const p = await api.admin.parts()
      setParts(p)
    } catch {
      setParts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const stats = useMemo(() => {
    const totalParts = parts.length
    const lowStockPartsCount = parts.filter((p) => p.quantityOnHand > 0 && p.quantityOnHand < p.minStock).length
    const outOfStockPartsCount = parts.filter((p) => p.quantityOnHand <= 0).length
    const warningPartsCount = parts.filter((p) => p.quantityOnHand === p.minStock).length
    return { totalParts, lowStockPartsCount, outOfStockPartsCount, warningPartsCount }
  }, [parts])

  const alertParts = parts.filter((p) => getStockStatus(p).label !== 'OK').slice(0, 5)
  const selectedPart = parts.find((p) => p.sku === selectedSku) ?? null

  function openAction(mode: ActionMode) {
    setActionMode(mode)
    setMessage(null)
    if (!selectedSku && parts[0]) setSelectedSku(parts[0].sku)
    setQuantity('')
    setNote('')
  }

  function closeAction() {
    setActionMode('none')
    setQuantity('')
    setNote('')
    setMessage(null)
  }

  async function submitAction() {
    if (!selectedPart) {
      setMessage('Vui lòng chọn SKU hiện có.')
      return
    }
    if (!quantity || Number(quantity) < 0) {
      setMessage('Vui lòng nhập số lượng hợp lệ.')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await api.admin.updatePart(selectedPart.id, {
        sku: selectedPart.sku,
        name: selectedPart.name,
        description: selectedPart.description,
        unitPrice: selectedPart.unitPrice ?? 0,
        quantityOnHand: Number(quantity),
        minStock: selectedPart.minStock,
        category: selectedPart.category,
        active: selectedPart.active ?? true,
      })
      await loadData()
      setMessage(`Đã điều chỉnh tồn ${selectedPart.name} về ${Number(quantity)}.`)
      closeAction()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể điều chỉnh tồn')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Quản lý kho phụ tùng</h1>
      <p className="page-desc">SKU, tồn kho, định mức tối thiểu, vị trí.</p>

      <div className="grid-3" style={{ marginBottom: '1rem' }}>
        <div className="card"><div className="stat"><span className="stat-label">Tổng SKU</span><span className="stat-value">{stats.totalParts}</span><span className="muted">Đang theo dõi trong kho</span></div></div>
        <div className="card"><div className="stat"><span className="stat-label">Cần bổ sung</span><span className="stat-value">{stats.lowStockPartsCount + stats.warningPartsCount}</span><span className="muted">Dưới hoặc sát định mức</span></div></div>
        <div className="card"><div className="stat"><span className="stat-label">Hết hàng</span><span className="stat-value">{stats.outOfStockPartsCount}</span><span className="muted">Cần xử lý ngay</span></div></div>
      </div>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to="/app/admin/parts/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>+ Thêm SKU</Link>
          <button type="button" className="btn btn-ghost" onClick={() => openAction('adjust')}>Điều chỉnh tồn</button>
          <button type="button" className="btn btn-ghost" onClick={() => loadData()}>Làm mới</button>
        </div>
      </div>

      {actionMode !== 'none' ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <div className="row-between" style={{ marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Điều chỉnh tồn</h2>
            <button type="button" className="btn btn-ghost" onClick={closeAction}>Đóng</button>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Chọn SKU hiện có</label>
              <select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)}>
                {parts.map((p) => <option key={p.sku} value={p.sku}>{p.sku} · {p.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Số lượng tồn mới</label>
              <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" />
            </div>
          </div>
          <div className="field"><label>Ghi chú</label><textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lý do / biên bản kiểm kê..." /></div>
          <div className="row-between">
            <span className="muted">{selectedPart ? `Đang điều chỉnh ${selectedPart.name} (${selectedPart.sku})` : 'Chọn một SKU hiện có để điều chỉnh.'}</span>
            <button type="button" className="btn btn-primary" onClick={submitAction} disabled={saving}>{saving ? 'Đang lưu...' : 'Xác nhận'}</button>
          </div>
        </div>
      ) : null}

      {message ? <div className="card card-muted" style={{ marginBottom: '1rem' }}><strong>Thông báo</strong><p className="muted" style={{ marginBottom: 0 }}>{message}</p></div> : null}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="row-between" style={{ marginBottom: '0.75rem' }}><h2 style={{ fontSize: '1rem', margin: 0 }}>Danh sách phụ tùng</h2>{loading ? <span className="muted">Đang tải...</span> : <span className="muted">{parts.length} mục</span>}</div>
          <div className="table-wrap"><table className="data"><thead><tr><th>SKU</th><th>Tên</th><th>Tồn</th><th>Tối thiểu</th><th>Vị trí</th><th>Trạng thái</th></tr></thead><tbody>{parts.map((p) => { const status = getStockStatus(p); return (<tr key={p.sku} onClick={() => setSelectedSku(p.sku)} style={{ cursor: 'pointer' }}><td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{p.sku}</td><td>{p.name}</td><td>{p.quantityOnHand}</td><td>{p.minStock}</td><td>{p.category ?? '-'}</td><td><span className={`badge ${status.badge}`}>{status.label}</span></td></tr>) })}</tbody></table></div>
        </div>

        <div className="stack">
          <div className="card card-muted">
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Cảnh báo sắp hết hàng</h2>
            {alertParts.length === 0 ? <p className="muted">Hiện chưa có phụ tùng nào cần cảnh báo.</p> : null}
            <div className="stack">{alertParts.map((p) => { const status = getStockStatus(p); return (<div key={p.sku} className="card" style={{ padding: '0.85rem 1rem' }}><div style={{ fontWeight: 600 }}>{p.name}</div><div className="muted" style={{ marginTop: '0.25rem' }}>{p.sku} · Tồn {p.quantityOnHand} / tối thiểu {p.minStock}</div><div style={{ marginTop: '0.5rem' }}><span className={`badge ${status.badge}`}>{status.label}</span></div></div>) })}</div>
          </div>

        </div>
      </div>
    </div>
  )
}
