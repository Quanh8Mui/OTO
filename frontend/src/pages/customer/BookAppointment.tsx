import { useEffect, useMemo, useState } from 'react'
import { api, type Vehicle } from '../../lib/api'

export function BookAppointment() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [vehicleId, setVehicleId] = useState<number | null>(null)
  const [serviceTypeLabel, setServiceTypeLabel] = useState('Bảo dưỡng định kỳ')
  const [requestedDate, setRequestedDate] = useState('')
  const [timeSlot, setTimeSlot] = useState('08:00 – 10:00')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    api.customer.vehicles().then((v) => {
      if (!active) return
      setVehicles(v)
      if (!vehicleId && v.length > 0) setVehicleId(v[0].id)
    })
    return () => {
      active = false
    }
  }, [vehicleId])

  const canSubmit = useMemo(() => vehicleId != null && requestedDate.length > 0, [vehicleId, requestedDate])

  async function submitBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit || vehicleId == null) return
    setLoading(true)
    setMessage(null)
    try {
      await api.customer.createBooking({ vehicleId, serviceTypeLabel, requestedDate, timeSlot, notes })
      setMessage('Đặt lịch thành công.')
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
      <p className="page-desc">Chọn xe, loại dịch vụ và khung giờ phù hợp.</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={submitBooking}>
          <div className="field">
            <label>Xe</label>
            <select value={vehicleId ?? ''} onChange={(e) => setVehicleId(Number(e.target.value))} required>
              {vehicles.length === 0 ? <option value="">Chưa có xe, vui lòng thêm ở backend</option> : null}
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.licensePlate} · {[v.brand, v.model].filter(Boolean).join(' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Loại dịch vụ</label>
            <select value={serviceTypeLabel} onChange={(e) => setServiceTypeLabel(e.target.value)}>
              <option>Bảo dưỡng định kỳ</option>
              <option>Sửa chữa theo yêu cầu</option>
              <option>Đồng sơn / va chạm</option>
              <option>Kiểm tra tổng quát</option>
            </select>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Ngày</label>
              <input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} />
            </div>
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
