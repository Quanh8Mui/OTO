import { useState } from 'react'
import { api } from '../../lib/api'

export function PartCreate() {
  const [sku, setSku] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [quantityOnHand, setQuantityOnHand] = useState('0')
  const [minStock, setMinStock] = useState('0')
  const [category, setCategory] = useState('')
  const [active, setActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      await api.admin.createPart({
        sku,
        name,
        description,
        unitPrice: Number(unitPrice),
        quantityOnHand: Number(quantityOnHand),
        minStock: Number(minStock),
        category,
        active,
      })
      setMessage('Đã tạo phụ tùng mới thành công.')
      setSku('')
      setName('')
      setDescription('')
      setUnitPrice('')
      setQuantityOnHand('0')
      setMinStock('0')
      setCategory('')
      setActive(true)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tạo phụ tùng')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Thêm phụ tùng mới</h1>
      <p className="page-desc">Khai báo SKU mới, giá bán và tồn đầu để đưa vào kho.</p>

      <div className="card" style={{ maxWidth: 760 }}>
        <form onSubmit={submit}>
          <div className="grid-2">
            <div className="field">
              <label>SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="OIL-5W30-4L" required />
            </div>
            <div className="field">
              <label>Tên phụ tùng</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dầu động cơ 5W-30 4L" required />
            </div>
          </div>

          <div className="field">
            <label>Mô tả</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Mô tả ngắn về phụ tùng..." />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Đơn giá</label>
              <input type="number" min={0} value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="1200000" required />
            </div>
            <div className="field">
              <label>Nhóm / vị trí</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Dầu nhớt / Kệ A1" />
            </div>
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Số lượng tồn đầu</label>
              <input type="number" min={0} value={quantityOnHand} onChange={(e) => setQuantityOnHand(e.target.value)} required />
            </div>
            <div className="field">
              <label>Mức tối thiểu</label>
              <input type="number" min={0} value={minStock} onChange={(e) => setMinStock(e.target.value)} required />
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              Kích hoạt phụ tùng
            </label>
          </div>

          {message ? <p className="muted">{message}</p> : null}

          <div className="row-between">
            <span className="muted">Phụ tùng mới sẽ xuất hiện trong kho ngay sau khi lưu.</span>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu phụ tùng'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
