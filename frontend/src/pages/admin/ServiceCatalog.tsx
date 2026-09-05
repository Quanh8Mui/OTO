import { useEffect, useState } from 'react'
import { api, type ServiceItem } from '../../lib/api'
import { formatMoney } from '../../lib/format'

type FormState = {
  code: string
  name: string
  description: string
  basePrice: string
  active: boolean
}

const emptyForm = (): FormState => ({
  code: '',
  name: '',
  description: '',
  basePrice: '',
  active: true,
})

export function ServiceCatalog() {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [showForm, setShowForm] = useState(false)

  async function loadServices() {
    setLoading(true)
    try {
      const data = await api.admin.services()
      setServices(data)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tải danh mục')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadServices()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setShowForm(true)
    setMessage(null)
  }

  function openEdit(service: ServiceItem) {
    setEditingId(service.id)
    setForm({
      code: service.code,
      name: service.name,
      description: service.description ?? '',
      basePrice: String(service.basePrice),
      active: service.active ?? true,
    })
    setShowForm(true)
    setMessage(null)
  }

  async function submitForm() {
    if (!form.code.trim() || !form.name.trim() || !form.basePrice) {
      setMessage('Vui lòng nhập mã, tên và giá.')
      return
    }
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      basePrice: Number(form.basePrice),
      active: form.active,
    }
    try {
      if (editingId) {
        await api.admin.updateService(editingId, payload)
        setMessage('Đã cập nhật dịch vụ.')
      } else {
        await api.admin.createService(payload)
        setMessage('Đã thêm dịch vụ mới.')
      }
      setShowForm(false)
      await loadServices()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể lưu dịch vụ')
    }
  }

  async function removeService(id: number) {
    if (!window.confirm('Xóa dịch vụ này?')) return
    try {
      await api.admin.deleteService(id)
      setMessage('Đã xóa dịch vụ.')
      await loadServices()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xóa dịch vụ')
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Danh mục dịch vụ & giá</h1>
      <p className="page-desc">Gói công chuẩn để nhân viên lắp vào báo giá.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <span className="muted">{loading ? 'Đang tải...' : `${services.length} dịch vụ`}</span>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + Thêm dịch vụ
        </button>
      </div>

      {showForm ? (
        <div className="card" style={{ marginBottom: '1rem', maxWidth: 640 }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0 }}>{editingId ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h2>
          <div className="grid-2">
            <div className="field">
              <label>Mã</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
            </div>
            <div className="field">
              <label>Tên dịch vụ</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
          </div>
          <div className="field">
            <label>Mô tả</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Giá đề xuất (VND)</label>
              <input type="number" min={0} value={form.basePrice} onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))} />
            </div>
            <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem' }}>
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
              Đang hoạt động
            </label>
          </div>
          <div className="row-between" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Hủy
            </button>
            <button type="button" className="btn btn-primary" onClick={() => void submitForm()}>
              Lưu
            </button>
          </div>
        </div>
      ) : null}

      {message ? <p className="muted" style={{ marginBottom: '1rem' }}>{message}</p> : null}

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Tên dịch vụ</th>
              <th>Giá đề xuất</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{s.code}</td>
                <td>{s.name}</td>
                <td>{formatMoney(s.basePrice)}</td>
                <td>
                  <span className={`badge ${s.active ? 'badge-green' : 'badge-amber'}`}>{s.active ? 'Hoạt động' : 'Tạm dừng'}</span>
                </td>
                <td>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }} onClick={() => openEdit(s)}>
                    Sửa
                  </button>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }} onClick={() => void removeService(s.id)}>
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {services.length === 0 && !loading ? (
              <tr>
                <td colSpan={5} className="muted">
                  Chưa có dịch vụ nào.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
