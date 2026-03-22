export function RevenueReports() {
  return (
    <div className="page">
      <h1 className="page-title">Báo cáo doanh thu</h1>
      <p className="page-desc">Lọc theo ngày, loại dịch vụ, nhân viên phụ trách.</p>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="grid-2">
          <div className="field">
            <label>Từ ngày</label>
            <input type="date" />
          </div>
          <div className="field">
            <label>Đến ngày</label>
            <input type="date" />
          </div>
        </div>
        <div className="field">
          <label>Nhóm báo cáo</label>
          <select>
            <option>Tổng hợp theo ngày</option>
            <option>Theo hạng mục dịch vụ</option>
            <option>Theo kỹ thuật viên</option>
          </select>
        </div>
        <div className="row-between">
          <button type="button" className="btn btn-ghost">
            Xuất Excel
          </button>
          <button type="button" className="btn btn-primary">
            Áp dụng
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Số RO</th>
              <th>Doanh thu</th>
              <th>Giảm giá</th>
              <th>Thực thu</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>21/03/2026</td>
              <td>14</td>
              <td>186.000.000 ₫</td>
              <td>4.000.000 ₫</td>
              <td>182.000.000 ₫</td>
            </tr>
            <tr>
              <td>20/03/2026</td>
              <td>11</td>
              <td>142.500.000 ₫</td>
              <td>0 ₫</td>
              <td>142.500.000 ₫</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
