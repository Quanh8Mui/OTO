import { useEffect, useMemo, useState } from 'react'
import { api, type Booking } from '../../lib/api'
import { formatStatus, getStatusBadgeClass } from '../../lib/format'

export function VehicleIntake() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null)
  const [odometer, setOdometer] = useState('')
  const [fuelLevel, setFuelLevel] = useState('1/2 bình')
  const [customerNote, setCustomerNote] = useState('')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    'Đèn cảnh báo taplo': false,
    'Mức dầu phanh & dầu máy': false,
    'Lốp xe & lazang': false,
    'Kính lái & gương chiếu hậu': false,
  })
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const refreshBookings = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await api.staff.bookings('pending')
      setBookings(data.filter((b) => b.status === 'PENDING'))
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
    () => bookings.find((b) => b.id === selectedBookingId) ?? bookings[0] ?? null,
    [bookings, selectedBookingId],
  )

  useEffect(() => {
    if (selectedBooking && selectedBookingId !== selectedBooking.id) {
      setSelectedBookingId(selectedBooking.id)
    } else if (!selectedBooking) {
      setSelectedBookingId(null)
    }
  }, [selectedBooking, selectedBookingId])

  useEffect(() => {
    if (!selectedBooking) return
    setCustomerNote(selectedBooking.notes ?? '')
    setMessage(null)
  }, [selectedBooking])

  const toggleChecklist = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  async function createIntake() {
    if (!selectedBooking) return
    setSubmitting(true)
    setMessage(null)
    setIsSuccess(false)

    const checkedItems = Object.entries(checklist)
      .filter(([, val]) => val)
      .map(([k]) => k)

    try {
      await api.staff.createRepairIntake({
        customerId: selectedBooking.customerId,
        vehicleId: selectedBooking.vehicleId,
        bookingId: selectedBooking.id,
        intakeNotes: [
          `Mã lịch hẹn: ${selectedBooking.bookingNumber}`,
          `Biển số xe: ${selectedBooking.licensePlate}`,
          `Km hiện tại: ${odometer ? `${odometer} km` : 'Chưa nhập'}`,
          `Mức xăng: ${fuelLevel}`,
          checkedItems.length > 0 ? `Checklist đạt: ${checkedItems.join(', ')}` : '',
          `Ghi chú khách: ${customerNote || 'Không có ghi chú thêm'}`,
        ]
          .filter(Boolean)
          .join('\n'),
      })
      setMessage(`Đã tiếp nhận xe ${selectedBooking.licensePlate} và tạo Lệnh sửa chữa (RO) thành công!`)
      setIsSuccess(true)
      setOdometer('')
      await refreshBookings()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tạo phiếu tiếp nhận')
      setIsSuccess(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: '1600px' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tiếp nhận xe & Ghi nhận tình trạng</h1>
          <p className="page-desc">
            Chọn lịch hẹn của khách, kiểm tra hiện trạng xe tại xưởng và tạo Lệnh sửa chữa (RO).
          </p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => void refreshBookings()}>
          🔄 Làm mới danh sách
        </button>
      </div>

      {/* THANH CHỌN NGANG (HORIZONTAL SELECTOR BAR) */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <label style={{ margin: 0, fontWeight: 700, fontSize: '0.98rem', whiteSpace: 'nowrap', color: '#533c6e' }}>
            Chọn lịch hẹn chờ tiếp nhận:
          </label>

          <div style={{ flex: 1, minWidth: '320px' }}>
            <select
              value={selectedBooking?.id ?? ''}
              onChange={(e) => setSelectedBookingId(e.target.value ? Number(e.target.value) : null)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: '1.5px solid #533c6e',
                borderRadius: '12px',
                background: '#faf8fd',
              }}
            >
              {bookings.length === 0 ? (
                <option value="">{loading ? 'Đang tải dữ liệu...' : 'Chưa có lịch hẹn nào chờ tiếp nhận'}</option>
              ) : null}
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.bookingNumber} · Biển số: {b.licensePlate} · Khách: {b.customerName} · Gói:{' '}
                  {b.serviceTypeLabel ?? b.serviceName ?? 'Dịch vụ'} ({b.requestedDate} {b.timeSlot ?? ''}) - [
                  {formatStatus(b.status)}]
                </option>
              ))}
            </select>
          </div>

          {selectedBooking && (
            <span className={`badge ${getStatusBadgeClass(selectedBooking.status)}`} style={{ padding: '0.45rem 1rem' }}>
              {formatStatus(selectedBooking.status)}
            </span>
          )}

          <span className="badge badge-blue">{bookings.length} lịch hẹn</span>
        </div>

        {loadError && <p style={{ color: '#dc2626', margin: '0.5rem 0 0' }}>Lỗi tải dữ liệu: {loadError}</p>}
      </div>

      {/* NỘI DUNG CHI TIẾT TRẢI RỘNG THEO CHIỀU NGANG */}
      {selectedBooking ? (
        <div className="stack" style={{ gap: '1.5rem' }}>
          {/* HÀNG 1: THÔNG TIN TỔNG QUAN XE & LỊCH HẸN (HORIZONTAL INFO STRIP) */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #faf8fd 100%)',
              border: '1px solid #e8e2f2',
              padding: '1.25rem 1.5rem',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                alignItems: 'center',
              }}
            >
              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Biển số xe</div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    color: '#533c6e',
                    display: 'inline-block',
                    padding: '0.2rem 0.75rem',
                    background: '#f2edf8',
                    borderRadius: '8px',
                    border: '1px solid #ded4ec',
                    marginTop: '0.2rem',
                  }}
                >
                  {selectedBooking.licensePlate}
                </div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Chủ xe / Khách hàng</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.2rem' }}>
                  {selectedBooking.customerName}
                </div>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  Mã lịch hẹn: <code>{selectedBooking.bookingNumber}</code>
                </div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Gói dịch vụ đã đặt</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#533c6e', marginTop: '0.2rem' }}>
                  {selectedBooking.serviceTypeLabel ?? selectedBooking.serviceName ?? 'Bảo dưỡng định kỳ'}
                </div>
              </div>

              <div>
                <div className="muted" style={{ fontSize: '0.8rem' }}>Thời gian đón tiếp</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>
                  {selectedBooking.requestedDate}
                </div>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  Khung giờ: {selectedBooking.timeSlot ?? 'Giờ hành chính'}
                </div>
              </div>
            </div>
          </div>

          {/* HÀNG 2: BIÊN BẢN KIỂM TRA XE (3 CỘT NGANG RỘNG RÃI) */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', color: '#282033' }}>
              Biên bản kiểm tra hiện trạng xe khi vào xưởng
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              {/* Cột 1: Thông số kỹ thuật */}
              <div className="stack" style={{ gap: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#533c6e' }}>
                  1. Thông số vận hành
                </h3>

                <div className="field">
                  <label>Số ODO (Km hiện tại)</label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value)}
                    placeholder="Ví dụ: 45200"
                    style={{ fontWeight: 600 }}
                  />
                </div>

                <div className="field">
                  <label>Mức nhiên liệu hiện tại</label>
                  <select value={fuelLevel} onChange={(e) => setFuelLevel(e.target.value)}>
                    <option value="Dưới 1/4 bình">Dưới 1/4 bình (Gần cạn)</option>
                    <option value="1/4 bình">1/4 bình</option>
                    <option value="1/2 bình">1/2 bình</option>
                    <option value="3/4 bình">3/4 bình</option>
                    <option value="Đầy bình">Đầy bình</option>
                  </select>
                </div>
              </div>

              {/* Cột 2: Triệu chứng & Ghi chú */}
              <div className="stack" style={{ gap: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#533c6e' }}>
                  2. Triệu chứng & Yêu cầu của khách
                </h3>

                <div className="field">
                  <label>Ghi chú phản ánh của chủ xe</label>
                  <textarea
                    rows={5}
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    placeholder="Khách báo xe kêu lục cục dưới gầm, máy lạnh không mát sâu, cần kiểm tra thêm phanh..."
                  />
                </div>
              </div>

              {/* Cột 3: Checklist nhanh & Ảnh hiện trạng */}
              <div className="stack" style={{ gap: '1rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: '#533c6e' }}>
                  3. Checklist kiểm tra nhanh
                </h3>

                <div
                  style={{
                    background: '#faf8fd',
                    border: '1px solid #e8e2f2',
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
                  }}
                >
                  {Object.keys(checklist).map((item) => (
                    <label
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checklist[item]}
                        onChange={() => toggleChecklist(item)}
                        style={{ width: '18px', height: '18px', accentColor: '#533c6e' }}
                      />
                      <span style={{ fontWeight: checklist[item] ? 600 : 400 }}>{item}</span>
                    </label>
                  ))}
                </div>

                <div className="field">
                  <label>Ảnh hiện trạng xe (vết xước, va quẹt cũ)</label>
                  <input type="file" accept="image/*" multiple />
                </div>
              </div>
            </div>

            {message && (
              <div
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  marginBottom: '1.25rem',
                  backgroundColor: isSuccess ? '#e8f5e9' : '#ffebee',
                  color: isSuccess ? '#2e7d32' : '#c62828',
                  fontWeight: 600,
                }}
              >
                {message}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f0ebf7', paddingTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0.75rem 2.5rem', fontSize: '1rem' }}
                onClick={() => void createIntake()}
                disabled={submitting}
              >
                {submitting ? 'Đang tạo lệnh RO...' : '✓ Xác nhận tiếp nhận xe & Tạo lệnh sửa chữa (RO)'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: '1.1rem' }}>
            Không có lịch hẹn nào đang chờ tiếp nhận.
          </p>
        </div>
      )}
    </div>
  )
}
