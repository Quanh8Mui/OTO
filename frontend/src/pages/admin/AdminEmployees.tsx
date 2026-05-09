import { useEffect, useMemo, useState } from 'react'
import { api, type Employee } from '../../lib/api'

const DEFAULT_PASSWORD = '12345678'
const DEFAULT_EMPLOYEE_CODE = 'NV-X7K4Q'

export function AdminEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [position, setPosition] = useState('')
  const [password, setPassword] = useState(DEFAULT_PASSWORD)

  const canSubmitCreate = useMemo(
    () => email.trim().length > 0 && fullName.trim().length > 0,
    [email, fullName],
  )

  const canSubmitEdit = useMemo(
    () => editingEmployee != null && email.trim().length > 0 && fullName.trim().length > 0,
    [editingEmployee, email, fullName],
  )

  const loadEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.admin.employees()
      setEmployees(data)
      setSelectedEmployee((current) => data.find((emp) => emp.id === current?.id) ?? data[0] ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhân viên')
      setEmployees([])
      setSelectedEmployee(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadEmployees()
  }, [])

  function startCreate() {
    setEditingEmployee(null)
    setEmail('')
    setFullName('')
    setPhone('')
    setEmployeeCode(DEFAULT_EMPLOYEE_CODE)
    setPosition('')
    setPassword(DEFAULT_PASSWORD)
    setShowCreateForm(true)
    setSuccess(null)
    setError(null)
  }

  function startEdit(emp: Employee) {
    setEditingEmployee(emp)
    setEmail(emp.email)
    setFullName(emp.fullName)
    setPhone(emp.phone ?? '')
    setEmployeeCode(emp.employeeCode)
    setPosition(emp.position ?? '')
    setPassword('')
    setShowCreateForm(true)
    setSuccess(null)
    setError(null)
  }

  function closeForm() {
    setShowCreateForm(false)
    setEditingEmployee(null)
    setSuccess(null)
    setError(null)
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      if (editingEmployee) {
        await api.admin.updateEmployee(editingEmployee.id, {
          email,
          password: password.trim() || undefined,
          fullName,
          phone,
          employeeCode,
          position,
        })
        setSuccess('Đã cập nhật thông tin nhân viên.')
      } else {
        const created = await api.admin.createEmployee({
          email,
          password,
          fullName,
          phone,
          employeeCode,
          position,
        })
        setSuccess(`Đã tạo nhân viên. Tài khoản đăng nhập: ${created.email} / ${password}`)
      }
      closeForm()
      await loadEmployees()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu nhân viên')
    } finally {
      setSaving(false)
    }
  }

  async function deleteEmployee(emp: Employee) {
    if (!window.confirm(`Xóa nhân viên ${emp.fullName}?`)) return
    setDeletingId(emp.id)
    setError(null)
    try {
      await api.admin.deleteEmployee(emp.id)
      setSuccess('Đã xóa nhân viên.')
      await loadEmployees()
      if (selectedEmployee?.id === emp.id) setSelectedEmployee(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa nhân viên')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <div className="row-between" style={{ marginBottom: '0.75rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 0 }}>Quản lý nhân viên</h1>
          <p className="page-desc" style={{ marginTop: '0.35rem' }}>Tạo, xem, sửa và xóa tài khoản staff.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-ghost" onClick={() => void loadEmployees()}>
            Làm mới
          </button>
          <button type="button" className="btn btn-primary" onClick={showCreateForm ? closeForm : startCreate}>
            {showCreateForm ? 'Đóng form' : 'Thêm nhân viên'}
          </button>
        </div>
      </div>

      {showCreateForm ? (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', marginTop: 0 }}>{editingEmployee ? 'Sửa thông tin nhân viên' : 'Thông tin nhân viên'}</h2>
          <form onSubmit={submit}>
            <div className="grid-2">
              <div className="field">
                <label>Họ và tên</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" required />
              </div>
              <div className="field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@garagepro.vn" required />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Số điện thoại</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0909 000 111" />
              </div>
              <div className="field">
                <label>Chức vụ</label>
                <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Kỹ thuật viên" />
              </div>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Mã nhân viên</label>
                <input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} placeholder={DEFAULT_EMPLOYEE_CODE} required />
              </div>
              <div className="field">
                <label>{editingEmployee ? 'Mật khẩu mới (bỏ trống nếu không đổi)' : 'Mật khẩu mặc định'}</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder={DEFAULT_PASSWORD} required={!editingEmployee} />
              </div>
            </div>
            <div className="muted" style={{ marginTop: '-0.25rem', marginBottom: '1rem' }}>
              Mã nhân viên dùng mẫu có sẵn, mật khẩu mặc định là 12345678.
            </div>
            {editingEmployee ? (
              <div className="muted" style={{ marginTop: '-0.25rem', marginBottom: '1rem' }}>
                Nếu không muốn đổi mật khẩu, hãy để trống ô này.
              </div>
            ) : null}
            {error ? <p className="muted">{error}</p> : null}
            {success ? <p className="muted">{success}</p> : null}
            <div className="row-between">
              <span className="muted">Tài khoản có thể cập nhật sau khi tạo.</span>
              <button type="submit" className="btn btn-primary" disabled={saving || (editingEmployee ? !canSubmitEdit : !canSubmitCreate)}>
                {saving ? 'Đang lưu...' : editingEmployee ? 'Lưu thay đổi' : 'Xác nhận tạo nhân viên'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Danh sách nhân viên</h2>
          {loading ? <p className="muted">Đang tải...</p> : null}
          {!loading && employees.length === 0 ? <p className="muted">Chưa có nhân viên nào.</p> : null}
          <div className="stack">
            {employees.map((emp) => (
              <div
                key={emp.id}
                className="card card-muted"
                style={{
                  padding: '0.9rem 1rem',
                  textAlign: 'left',
                  border: selectedEmployee?.id === emp.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedEmployee(emp)}
                    style={{
                      background: 'transparent',
                      border: 0,
                      padding: 0,
                      textAlign: 'left',
                      flex: 1,
                      cursor: 'pointer',
                      color: 'inherit',
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{emp.fullName}</div>
                    <div className="muted" style={{ fontSize: '0.92rem', marginTop: '0.25rem' }}>
                      {emp.employeeCode} · {emp.position ?? 'Chưa có chức vụ'}
                    </div>
                    <div className="muted" style={{ fontSize: '0.92rem', marginTop: '0.25rem' }}>
                      {emp.email}
                    </div>
                  </button>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setSelectedEmployee(emp)}>
                      Xem
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => startEdit(emp)}>
                      Sửa
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => void deleteEmployee(emp)} disabled={deletingId === emp.id}>
                      {deletingId === emp.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card card-muted">
          <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Xem thông tin nhân viên</h2>
          {selectedEmployee ? (
            <>
              <div className="field">
                <label>Họ và tên</label>
                <input value={selectedEmployee.fullName} readOnly />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Email</label>
                  <input value={selectedEmployee.email} readOnly />
                </div>
                <div className="field">
                  <label>Số điện thoại</label>
                  <input value={selectedEmployee.phone ?? ''} readOnly />
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Mã nhân viên</label>
                  <input value={selectedEmployee.employeeCode} readOnly />
                </div>
                <div className="field">
                  <label>Chức vụ</label>
                  <input value={selectedEmployee.position ?? ''} readOnly />
                </div>
              </div>
              <div className="row-between" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => startEdit(selectedEmployee)}>
                  Chỉnh sửa
                </button>
                <button type="button" className="btn btn-danger" onClick={() => void deleteEmployee(selectedEmployee)} disabled={deletingId === selectedEmployee.id}>
                  {deletingId === selectedEmployee.id ? 'Đang xóa...' : 'Xóa nhân viên'}
                </button>
              </div>
            </>
          ) : (
            <p className="muted">Chọn một nhân viên bên trái để xem chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  )
}
