import { useEffect, useMemo, useState } from 'react'
import { api, type ServiceItem } from '../../lib/api'

function formatDateInput(date = new Date()) {
  const local = new Date(date)
  const year = local.getFullYear()
  const month = String(local.getMonth() + 1).padStart(2, '0')
  const day = String(local.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function BookAppointment() {
  const [licensePlate, setLicensePlate] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [vin, setVin] = useState('')
  const [color, setColor] = useState('')
  const [serviceTypeLabel, setServiceTypeLabel] = useState('Bảo dưỡng định kỳ')
  const [catalogServices, setCatalogServices] = useState<ServiceItem[]>([])
  const [requestedDate, setRequestedDate] = useState(() => formatDateInput())
  const [timeSlot, setTimeSlot] = useState('08:00 – 10:00')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [nowLabel, setNowLabel] = useState(() => new Date().toLocaleString('vi-VN'))
  const todayLabel = useMemo(() => new Date(requestedDate || formatDateInput()).toLocaleDateString('vi-VN'), [requestedDate])

  useEffect(() => {
    api.catalog.services().then((services) => {
      setCatalogServices(services)
      if (services[0]) setServiceTypeLabel(services[0].name)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowLabel(new Date().toLocaleString('vi-VN'))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const canSubmit = useMemo(() => licensePlate.trim().length > 0 && requestedDate.length > 0, [licensePlate, requestedDate])

  async function submitBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setMessage(null)
    try {
      await api.customer.createBooking({
        vehicleId: null,
        licensePlate,
        brand,
        model,
        year: year ? Number(year) : null,
        vin,
        color,
        serviceTypeLabel,
        requestedDate,
        timeSlot,
        notes,
      })
      setMessage('Đặt lịch thành công. Xe đã được ghi nhận.')
      setNotes('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể đặt lịch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Đặt lịch bảo dưỡng / sửa chữa</h1>
      <p className="page-desc">Nhập thông tin xe, hệ thống sẽ tự tạo xe mới nếu chưa có trong hồ sơ khách hàng.</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={submitBooking}>
          <div className="grid-2">
            <div className="field">
              <label>Biển số</label>
              <input value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} placeholder="59B-88888" required />
            </div>
            <div className="field">
              <label>Hãng xe</label>
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Honda" />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Dòng xe</label>
              <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="CR-V" />
            </div>
            <div className="field">
              <label>Năm xe</label>
              <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="2022" inputMode="numeric" />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>VIN</label>
              <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="Nhập nếu có" />
            </div>
            <div className="field">
              <label>Màu xe</label>
              <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="Đen" />
            </div>
          </div>
          <div className="field">
            <label>Loại dịch vụ</label>
            <select value={serviceTypeLabel} onChange={(e) => setServiceTypeLabel(e.target.value)}>
              {catalogServices.length > 0 ? (
                catalogServices.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))
              ) : (
                <>
                  <option>Bảo dưỡng định kỳ</option>
                  <option>Sửa chữa theo yêu cầu</option>
                  <option>Đồng sơn / va chạm</option>
                  <option>Kiểm tra tổng quát</option>
                </>
              )}
            </select>
          </div>
          <div className="field">
            <label>Ngày</label>
            <input type="date" min={formatDateInput()} value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} />
            <p className="muted" style={{ marginTop: '0.35rem' }}>
              Hôm nay: {todayLabel} · Cập nhật lúc: {nowLabel}
            </p>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Giờ ưu tiên</label>
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option>08:00 – 10:00</option>
                <option>10:00 – 12:00</option>
                <option>13:00 – 15:00</option>
                <option>15:00 – 17:00</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label>Mô tả triệu chứng / yêu cầu</label>
            <textarea
              placeholder="Ví dụ: rung tay lách khi phanh gấp..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {message ? <p className="muted">{message}</p> : null}
          <button type="submit" className="btn btn-primary" disabled={!canSubmit || loading}>
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu đặt lịch'}
          </button>
        </form>
      </div>
    </div>
  )
}
