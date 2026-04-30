import { useEffect, useState } from 'react'
import { api, type Employee } from '../../lib/api'

export function EmployeeManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    api.admin.employees().then(setEmployees).catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Quản lý nhân viên</h1>
      <p className="page-desc">CRUD tài khoản, gán vai trò Spring Security.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <input type="search" placeholder="Tìm theo tên, SĐT..." style={{ maxWidth: 280 }} />
        <button type="button" className="btn btn-primary">
          + Thêm nhân viên
        </button>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Họ tên</th>
              <th>Vai trò</th>
              <th>SĐT</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((e) => (
              <tr key={e.id}>
                <td>{e.fullName}</td>
                <td>{e.position ?? 'Nhân viên'}</td>
                <td>{e.phone ?? '-'}</td>
                <td>
                  <span className="badge badge-green">Hoạt động</span>
                </td>
                <td>
                  <button type="button" className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem' }}>
                    Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
