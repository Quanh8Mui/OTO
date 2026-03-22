const employees = [
  { id: 1, name: 'Nguyễn Văn A', role: 'Kỹ thuật viên', phone: '0901…', status: 'Hoạt động' },
  { id: 2, name: 'Trần Thị B', role: 'Lễ tân', phone: '0902…', status: 'Hoạt động' },
  { id: 3, name: 'Lê Văn C', role: 'Quản kho', phone: '0903…', status: 'Tạm khoá' },
]

export function EmployeeManagement() {
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
                <td>{e.name}</td>
                <td>{e.role}</td>
                <td>{e.phone}</td>
                <td>
                  <span className={`badge ${e.status === 'Hoạt động' ? 'badge-green' : 'badge-red'}`}>
                    {e.status}
                  </span>
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
