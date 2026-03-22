export function BookAppointment() {
  return (
    <div className="page">
      <h1 className="page-title">Đặt lịch bảo dưỡng / sửa chữa</h1>
      <p className="page-desc">Chọn xe, loại dịch vụ và khung giờ phù hợp.</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className="field">
            <label>Xe</label>
            <select defaultValue="camry">
              <option value="camry">51A-12345 · Toyota Camry 2019</option>
              <option value="fortuner">51B-99999 · Toyota Fortuner 2021</option>
            </select>
          </div>
          <div className="field">
            <label>Loại dịch vụ</label>
            <select>
              <option>Bảo dưỡng định kỳ</option>
              <option>Sửa chữa theo yêu cầu</option>
              <option>Đồng sơn / va chạm</option>
              <option>Kiểm tra tổng quát</option>
            </select>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Ngày</label>
              <input type="date" />
            </div>
            <div className="field">
              <label>Giờ ưu tiên</label>
              <select>
                <option>08:00 – 10:00</option>
                <option>10:00 – 12:00</option>
                <option>13:00 – 15:00</option>
                <option>15:00 – 17:00</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Mô tả triệu chứng / yêu cầu</label>
            <textarea placeholder="Ví dụ: rung tay lách khi phanh gấp..." />
          </div>
          <button type="submit" className="btn btn-primary">
            Gửi yêu cầu đặt lịch
          </button>
        </form>
      </div>
    </div>
  )
}
