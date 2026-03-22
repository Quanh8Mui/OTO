export function PartsRequest() {
  return (
    <div className="page">
      <h1 className="page-title">Yêu cầu phụ tùng từ kho</h1>
      <p className="page-desc">Phiếu xuất kho gắn RO — admin duyệt khi cần.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <button type="button" className="btn btn-primary">
          + Tạo yêu cầu mới
        </button>
        <select defaultValue="open">
          <option value="open">Đang mở</option>
          <option>Đã xuất</option>
          <option>Từ chối</option>
        </select>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mã phiếu</th>
              <th>RO</th>
              <th>Phụ tùng</th>
              <th>SL</th>
              <th>TT kho</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)' }}>PR-1042</td>
              <td>RO #2026-0319</td>
              <td>Má phanh trước (bộ)</td>
              <td>1</td>
              <td>
                <span className="badge badge-amber">Chờ xuất</span>
              </td>
            </tr>
            <tr>
              <td style={{ fontFamily: 'var(--font-mono)' }}>PR-1041</td>
              <td>RO #2026-0318</td>
              <td>Lọc dầu OEM</td>
              <td>1</td>
              <td>
                <span className="badge badge-green">Đã xuất</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
