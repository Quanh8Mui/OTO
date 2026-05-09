import { useEffect, useMemo, useState } from 'react'
import { api, type Booking } from '../../lib/api'

export function VehicleIntake() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [odometer, setOdometer] = useState('')
  const [fuelLevel, setFuelLevel] = useState('1/2 bình')
  const [customerNote, setCustomerNote] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const refreshBookings = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await api.staff.bookings()
      setBookings(data)
    } catch (err) {
      setBookings([])
      setLoadError(err instanceof Error ? err.message : 'Không thể tải danh sách booking')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshBookings()
  }, [])

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) ?? bookings[0] ?? null,
    [bookings, selectedBookingId],
  )

  useEffect(() => {
    if (selectedBooking && selectedBookingId == null) {
      setSelectedBookingId(selectedBooking.id)
    }
  }, [selectedBooking, selectedBookingId])

  useEffect(() => {
    if (!selectedBooking) return
    setCustomerNote(selectedBooking.notes ?? '')
  }, [selectedBooking])

  async function createIntake() {
    if (!selectedBooking) return
    setSubmitting(true)
    setMessage(null)
    try {
      await api.staff.createRepairIntake({
        customerId: selectedBooking.customerId,
        vehicleId: selectedBooking.vehicleId,
        bookingId: selectedBooking.id,
        intakeNotes: [
          `Booking: ${selectedBooking.bookingNumber}`,
          `Biển số: ${selectedBooking.licensePlate}`,
          `Km hiện tại: ${odometer || '-'}`,
          `Mức xăng: ${fuelLevel}`,
          `Ghi chú khách: ${customerNote || '-'}`,
        ].join('\n'),
      })
      setMessage('Đã tạo phiếu tiếp nhận (RO) thành công.')
      await refreshBookings()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tạo phiếu tiếp nhận')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Tiếp nhận xe & ghi nhận tình trạng</h1>
      <p className="page-desc">Chọn lịch hẹn, nhập thông tin check-in và tạo phiếu tiếp nhận.</p>

      <div className="grid-2 intake-grid" style={{ alignItems: 'stretch' }}>
        <div className="card intake-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', margin: 0 }}>Danh sách lịch hẹn chờ tiếp nhận</h2>
            <button type="button" className="btn btn-ghost" onClick={() => void refreshBookings()}>
              Làm mới
            </button>
          </div>
          {loading ? <p className="muted">Đang tải booking...</p> : null}
          {loadError ? <p className="muted">Lỗi tải dữ liệu: {loadError}</p> : null}
          <div className="stack" style={{ flex: 1, overflow: 'auto', paddingRight: '0.25rem' }}>
            {!loading && bookings.length === 0 ? <p className="muted">Chưa có booking nào.</p> : null}
            {bookings.map((booking) => (
              <button
                key={booking.id}
                type="button"
                onClick={() => setSelectedBookingId(booking.id)}
                className="card"
                style={{
                  textAlign: 'left',
                  border: booking.id === selectedBooking?.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                  background: 'var(--bg-panel)',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                <strong>{booking.bookingNumber}</strong>
                <div className="muted" style={{ marginTop: '0.35rem' }}>
                  {booking.licensePlate} · {booking.customerName}
                </div>
                <div className="muted" style={{ marginTop: '0.35rem' }}>
                  {booking.serviceTypeLabel ?? booking.serviceName ?? 'Dịch vụ'}
                </div>
                <div className="muted" style={{ marginTop: '0.2rem', fontSize: '0.9rem' }}>
                  {booking.requestedDate} · {booking.timeSlot ?? '-'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="card card-muted intake-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Thông tin lịch hẹn</h2>
          {selectedBooking ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div className="muted" style={{ marginBottom: '0.75rem' }}>
                {selectedBooking.licensePlate} · {selectedBooking.customerName}
              </div>
              <div className="field">
                <label>Mã lịch / biển số</label>
                <input value={`${selectedBooking.bookingNumber} · ${selectedBooking.licensePlate}`} readOnly />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Km hiện tại</label>
                  <input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="40215" />
                </div>
                <div className="field">
                  <label>Mức xăng</label>
                  <select value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)}>
                    <option>1/4 bình</option>
                    <option>1/2 bình</option>
                    <option>3/4 bình</option>
                    <option>Đầy</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Ghi chú khách</label>
                <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} placeholder="Triệu chứng, yêu cầu thêm phụ kiện..." />
              </div>
              <div className="field">
                <label>Checklist nhanh</label>
                <div className="stack">
                  {['Đèn cảnh báo trên taplo', 'Mức dầu phanh', 'Lốp & lazang', 'Kính & gương'].map((x) => (
                    <label key={x} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input type="checkbox" /> {x}
                    </label>
                  ))}
                </div>
              </div>
              <div className="field" style={{ marginTop: '1rem' }}>
                <label>Ảnh hiện trạng (upload)</label>
                <input type="file" accept="image/*" multiple />
              </div>
              {message ? <p className="muted">{message}</p> : null}
              <button type="button" className="btn btn-primary" style={{ marginTop: '0.5rem' }} onClick={() => void createIntake()} disabled={submitting}>
                {submitting ? 'Đang tạo RO...' : 'Tạo phiếu tiếp nhận (RO)'}
              </button>
            </div>
          ) : (
            <p className="muted">Hãy chọn một booking bên trái.</p>
          )}
        </div>
      </div>
    </div>
  )
}
