import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, type Booking, type ServiceItem, type Vehicle } from '../../lib/api'
import { useToast } from '../../context/ToastContext'

function formatDateInput(date = new Date()) {
  const local = new Date(date)
  const year = local.getFullYear()
  const month = String(local.getMonth() + 1).padStart(2, '0')
  const day = String(local.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function BookAppointment() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null)
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null)
  const [nowLabel, setNowLabel] = useState(() => new Date().toLocaleString('vi-VN'))
  const todayLabel = useMemo(() => new Date(requestedDate || formatDateInput()).toLocaleDateString('vi-VN'), [requestedDate])
  const { showToast } = useToast()

  useEffect(() => {
    api.catalog
      .services()
      .then((services) => {
        setCatalogServices(services)
        if (services[0]) setServiceTypeLabel(services[0].name)
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : 'Không thể tải danh mục dịch vụ')
      })

    api.customer
      .vehicles()
      .then((list) => {
        setVehicles(list)
        if (list.length > 0) {
          applyVehicle(list[0])
        }
      })
      .catch(() => { })
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowLabel(new Date().toLocaleString('vi-VN'))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function applyVehicle(v: Vehicle | null) {
    if (!v) {
      setSelectedVehicleId(null)
      setLicensePlate('')
      setBrand('')
      setModel('')
      setYear('')
      return
    }
    setSelectedVehicleId(v.id)
    setLicensePlate(v.licensePlate || '')
    setBrand(v.brand || '')
    setModel(v.model || '')
    setYear(v.year ? String(v.year) : '')
  }

  function resetFormForNewBooking() {
    setSubmittedBooking(null)
    setErrorMessage(null)
    setNotes('')
    setSelectedVehicleId(null)
    setLicensePlate('')
    setBrand('')
    setModel('')
    setYear('')
    setVin('')
    setColor('')
    setRequestedDate(formatDateInput())
    setTimeSlot('08:00 – 10:00')
  }

  const canSubmit = useMemo(
    () => licensePlate.trim().length > 0 && requestedDate.length > 0 && !submittedBooking,
    [licensePlate, requestedDate, submittedBooking],
  )

  async function submitBooking(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!canSubmit || loading) return
    setLoading(true)
    setErrorMessage(null)
    try {
      const created = await api.customer.createBooking({
        vehicleId: selectedVehicleId,
        licensePlate: licensePlate.trim().toUpperCase(),
        brand: brand.trim(),
        model: model.trim(),
        year: year ? Number(year) : null,
        vin: vin.trim(),
        color: color.trim(),
        serviceTypeLabel,
        requestedDate,
        timeSlot,
        notes: notes.trim(),
      })
      setSubmittedBooking(created)
      showToast(`Đặt lịch thành công! Mã phiếu: ${created.bookingNumber}`, 'success')
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Không thể đặt lịch'
      setErrorMessage(errMsg)
      showToast(errMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 1360 }}>
      {/* ── Page Header ── */}
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">Đặt lịch bảo dưỡng / sửa chữa</h1>
          <p className="page-desc">
            Vui lòng điền thông tin xe và chọn thời gian đón tiếp phù hợp. Hệ thống sẽ tự động liên kết hoặc tạo mới hồ sơ phương tiện.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="badge badge-green" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}>
            ● Xưởng đang nhận xe hôm nay
          </span>
        </div>
      </div>

      {/* ── 2-Column Wide Layout ── */}
      <div className="booking-grid-wrapper">
        {/* LEFT COLUMN: Comprehensive Booking Form or Success State */}
        <div className="booking-form-area">
          {submittedBooking ? (
            /* SUCCESS STATE: Prevents duplicate resubmission and gives clear confirmation */
            <div
              className="card"
              style={{
                padding: '2.5rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(145deg, #ffffff 0%, #fbf9fd 100%)',
                border: '2px solid #a3d9b4',
                borderRadius: '24px',
                boxShadow: '0 12px 36px rgba(83, 60, 110, 0.08)',
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: 'rgba(46, 125, 50, 0.12)',
                  color: '#2e7d32',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem',
                  margin: '0 auto 1.25rem',
                }}
              >
                ✓
              </div>

              <span className="badge badge-green" style={{ padding: '0.4rem 1rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                Đã tiếp nhận yêu cầu đặt lịch
              </span>

              <h2 style={{ fontSize: '1.65rem', margin: '0.5rem 0', color: 'var(--accent)', fontWeight: 800 }}>
                Đặt lịch hẹn thành công!
              </h2>

              <p className="muted" style={{ maxWidth: 540, margin: '0 auto 1.75rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Hồ sơ lịch hẹn của xe <strong>{submittedBooking.licensePlate}</strong> đã được gửi tới bộ phận điều phối xưởng OTO Garage. Cố vấn dịch vụ sẽ liên hệ xác nhận trong vòng 15 phút.
              </p>

              {/* Summary Card inside Success Box */}
              <div
                className="card card-muted"
                style={{
                  maxWidth: 520,
                  margin: '0 auto 2rem',
                  textAlign: 'left',
                  padding: '1.25rem 1.5rem',
                  border: '1px solid #ded4ec',
                }}
              >
                <div className="row-between" style={{ paddingBottom: '0.6rem', borderBottom: '1px dashed #e8e2f2' }}>
                  <span className="muted">Mã lịch hẹn:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', color: 'var(--accent)' }}>
                    {submittedBooking.bookingNumber}
                  </strong>
                </div>
                <div className="row-between" style={{ padding: '0.6rem 0', borderBottom: '1px dashed #e8e2f2' }}>
                  <span className="muted">Biển số xe:</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>{submittedBooking.licensePlate}</strong>
                </div>
                <div className="row-between" style={{ padding: '0.6rem 0', borderBottom: '1px dashed #e8e2f2' }}>
                  <span className="muted">Gói dịch vụ:</span>
                  <strong>{submittedBooking.serviceTypeLabel || serviceTypeLabel}</strong>
                </div>
                <div className="row-between" style={{ paddingTop: '0.6rem' }}>
                  <span className="muted">Thời gian hẹn:</span>
                  <strong style={{ color: 'var(--accent)' }}>
                    {submittedBooking.requestedDate} ({submittedBooking.timeSlot || timeSlot})
                  </strong>
                </div>
              </div>

              {/* Action Buttons to Prevent Duplicate Submissions */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={resetFormForNewBooking}
                  className="btn btn-ghost"
                  style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', fontWeight: 600 }}
                >
                  + Đặt lịch cho xe khác
                </button>
                <Link
                  to="/customer/status"
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 2rem', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  Theo dõi tiến độ sửa xe →
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submitBooking}>
              {/* Error banner when duplicate or server validation fails */}
              {errorMessage ? (
                <div
                  style={{
                    padding: '0.9rem 1.25rem',
                    borderRadius: 'var(--radius)',
                    marginBottom: '1.25rem',
                    fontSize: '0.92rem',
                    background: 'rgba(198, 40, 40, 0.08)',
                    color: 'var(--danger)',
                    border: '1.5px solid rgba(198, 40, 40, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <span style={{ fontSize: '1.3rem' }}>⚠️</span>
                  <div>
                    <strong>Không thể gửi lịch hẹn:</strong>
                    <div style={{ marginTop: '0.15rem' }}>{errorMessage}</div>
                  </div>
                </div>
              ) : null}

              {/* SECTION 1: Vehicle Information */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="form-section-header">
                  <div>
                    <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--accent)' }}>
                      Thông tin phương tiện
                    </h2>
                    <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                      Nhập biển số và thông số xe cần làm dịch vụ
                    </p>
                  </div>
                </div>

                {/* Quick Select Existing Vehicle if available */}
                {vehicles.length > 0 ? (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.45rem' }}>
                      Chọn nhanh từ danh sách xe của bạn:
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {vehicles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => applyVehicle(v)}
                          className={`btn ${selectedVehicleId === v.id ? 'btn-primary' : 'btn-ghost'}`}
                          style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
                        >
                          {v.licensePlate} {v.brand ? `(${v.brand} ${v.model || ''})` : ''}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => applyVehicle(null)}
                        className={`btn ${selectedVehicleId === null ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
                      >
                        + Nhập xe khác
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Row 1: License Plate, Brand, Model (3 Columns) */}
                <div className="grid-3" style={{ marginBottom: '0.25rem' }}>
                  <div className="field">
                    <label>
                      Biển số xe <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      value={licensePlate}
                      onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                      placeholder="VD: 59B-88888"
                      style={{ textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.04em' }}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Hãng xe</label>
                    <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="VD: Honda, Toyota, Mazda..." />
                  </div>
                  <div className="field">
                    <label>Dòng xe / Model</label>
                    <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="VD: CR-V, Camry, CX-5..." />
                  </div>
                </div>

                {/* Row 2: Year, Color, VIN (3 Columns) */}
                <div className="grid-3">
                  <div className="field">
                    <label>Năm sản xuất</label>
                    <input
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="VD: 2022"
                      inputMode="numeric"
                    />
                  </div>
                  <div className="field">
                    <label>Màu sơn xe</label>
                    <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="VD: Trắng, Đen, Xám..." />
                  </div>
                  <div className="field">
                    <label>Số khung (VIN) / Ghi chú xe</label>
                    <input value={vin} onChange={(e) => setVin(e.target.value)} placeholder="Nhập nếu có" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Service and Schedule */}
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <div className="form-section-header">
                  <div>
                    <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: 'var(--accent)' }}>
                      Thời gian & Dịch vụ yêu cầu
                    </h2>
                    <p className="muted" style={{ margin: '0.2rem 0 0', fontSize: '0.85rem' }}>
                      Chọn hạng mục cần thực hiện và khung giờ đón tiếp thuận tiện nhất
                    </p>
                  </div>
                </div>

                {/* Row 1: Service Type & Time Slot (2 Columns) */}
                <div className="grid-2" style={{ marginBottom: '0.25rem' }}>
                  <div className="field">
                    <label>
                      Hạng mục dịch vụ <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select value={serviceTypeLabel} onChange={(e) => setServiceTypeLabel(e.target.value)}>
                      {catalogServices.length > 0 ? (
                        catalogServices.map((s) => (
                          <option key={s.id} value={s.name}>
                            {s.name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option>Bảo dưỡng định kỳ 10.000 – 40.000 km</option>
                          <option>Sửa chữa theo yêu cầu kỹ thuật</option>
                          <option>Kiểm tra hệ thống phanh, gầm, lốp</option>
                          <option>Đồng sơn / Làm đẹp xe & Đánh bóng</option>
                          <option>Kiểm tra tổng quát xe trước chuyến đi xa</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="field">
                    <label>
                      Khung giờ ưu tiên đón xe <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                      <option value="08:00 – 10:00">08:00 – 10:00 (Buổi sáng)</option>
                      <option value="10:00 – 12:00">10:00 – 12:00 (Gần trưa)</option>
                      <option value="13:00 – 15:00">13:00 – 15:00 (Đầu giờ chiều)</option>
                      <option value="15:00 – 17:00">15:00 – 17:00 (Cuối buổi chiều)</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Requested Date & Realtime hint */}
                <div className="grid-2" style={{ marginBottom: '0.25rem' }}>
                  <div className="field">
                    <label>
                      Ngày mong muốn tiếp nhận <span style={{ color: 'var(--danger)' }}>*</span>
                    </label>
                    <input
                      type="date"
                      min={formatDateInput()}
                      value={requestedDate}
                      onChange={(e) => setRequestedDate(e.target.value)}
                    />
                  </div>
                  <div className="field" style={{ justifyContent: 'center' }}>
                    <div
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.65rem 0.9rem',
                        fontSize: '0.85rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: '1.25rem',
                      }}
                    >
                      <span>
                        Hôm nay: <strong style={{ color: 'var(--text)' }}>{todayLabel}</strong> · Cập nhật: {nowLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Row 3: Notes / Symptoms */}
                <div className="field">
                  <label>Mô tả triệu chứng / Yêu cầu cụ thể từ khách hàng</label>
                  <textarea
                    placeholder="Ví dụ: Rung vô lăng khi phanh ở tốc độ cao, điều hoà có mùi lạ, cần thay dầu máy và kiểm tra áp suất lốp..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    style={{ minHeight: '88px' }}
                  />
                </div>

                {/* Submit Button Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>
                    (*) Thông tin bắt buộc để xưởng chuẩn bị vật tư & kỹ thuật viên.
                  </span>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSubmit || loading}
                    style={{
                      padding: '0.75rem 2rem',
                      fontSize: '0.98rem',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                    }}
                  >
                    {loading ? 'Đang kiểm tra & gửi...' : '✓ Xác nhận gửi phiếu đặt lịch'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT COLUMN: Live Summary Preview & Garage Service Process */}
        <div className="booking-sidebar-area">
          {/* Card 1: Live Booking Summary Preview */}
          <div
            className="card"
            style={{
              marginBottom: '1.25rem',
              background: 'linear-gradient(145deg, #ffffff 0%, #faf8fc 100%)',
              border: '1.5px solid #ded4ec',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'var(--accent)',
              }}
            />
            <div className="row-between" style={{ marginBottom: '1rem', marginTop: '0.2rem' }}>
              <span className="badge badge-purple" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                Tóm tắt phiếu đặt
              </span>
              <span className={`badge ${submittedBooking ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '0.75rem' }}>
                {submittedBooking ? 'Đã tiếp nhận' : 'Bản nháp'}
              </span>
            </div>

            {/* Vehicle Plate Highlight */}
            <div
              style={{
                background: 'linear-gradient(135deg, #533c6e 0%, #3e2d53 100%)',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '1rem 1.2rem',
                marginBottom: '1.25rem',
                boxShadow: '0 6px 18px rgba(83, 60, 110, 0.2)',
              }}
            >
              <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Biển số đăng ký
              </div>
              <div
                style={{
                  fontSize: '1.55rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  margin: '0.25rem 0',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {licensePlate || 'CHƯA NHẬP'}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                {brand || model ? `${brand} ${model} ${year ? `(${year})` : ''}` : 'Chưa có thông tin dòng xe'}
              </div>
            </div>

            {/* Key Information Rows */}
            <div className="stack" style={{ gap: '0.75rem', fontSize: '0.9rem' }}>
              {submittedBooking ? (
                <div className="row-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px dashed #e8e2f2' }}>
                  <span className="muted">Mã phiếu hẹn:</span>
                  <strong style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                    {submittedBooking.bookingNumber}
                  </strong>
                </div>
              ) : null}

              <div className="row-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px dashed #e8e2f2' }}>
                <span className="muted">Gói dịch vụ:</span>
                <strong style={{ textAlign: 'right', maxWidth: '65%', color: 'var(--accent)' }}>
                  {serviceTypeLabel}
                </strong>
              </div>

              <div className="row-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px dashed #e8e2f2' }}>
                <span className="muted">Ngày tiếp nhận:</span>
                <strong>{requestedDate || '-'}</strong>
              </div>

              <div className="row-between" style={{ paddingBottom: '0.5rem', borderBottom: '1px dashed #e8e2f2' }}>
                <span className="muted">Khung giờ hẹn:</span>
                <span className="badge badge-blue">{timeSlot}</span>
              </div>

              <div style={{ paddingTop: '0.25rem' }}>
                <span className="muted" style={{ display: 'block', marginBottom: '0.25rem' }}>
                  Ghi chú yêu cầu:
                </span>
                <div
                  style={{
                    background: '#f6f4fa',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.83rem',
                    color: notes ? 'var(--text)' : 'var(--text-muted)',
                    fontStyle: notes ? 'normal' : 'italic',
                  }}
                >
                  {notes || 'Không có ghi chú thêm'}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: '1.1rem',
                paddingTop: '0.85rem',
                borderTop: '1px solid #e8e2f2',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <span>Cố vấn dịch vụ sẽ liên hệ xác nhận trong vòng 15 phút.</span>
            </div>
          </div>

          {/* Card 2: 4-Step Process Guide */}
          <div className="card card-muted" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', margin: '0 0 0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
              Quy trình tiếp nhận tại OTO Garage
            </h3>
            <div className="booking-steps-timeline">
              <div className="step-item">
                <div className="step-num">1</div>
                <div className="step-body">
                  <strong>Đặt lịch & Chọn khung giờ</strong>
                  <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
                    Chọn ngày hẹn và gói dịch vụ phù hợp online.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">2</div>
                <div className="step-body">
                  <strong>Khám xe & Lập báo giá</strong>
                  <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
                    Kỹ thuật viên kiểm tra toàn diện và gửi báo giá qua app.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">3</div>
                <div className="step-body">
                  <strong>Khách duyệt & Tiến hành</strong>
                  <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
                    Khách duyệt online từng hạng mục trước khi xưởng làm.
                  </p>
                </div>
              </div>
              <div className="step-item">
                <div className="step-num">4</div>
                <div className="step-body">
                  <strong>Rửa xe, Kiểm thử & Bàn giao</strong>
                  <p className="muted" style={{ margin: '0.15rem 0 0', fontSize: '0.8rem' }}>
                    Xe được vệ sinh sạch sẽ và bàn giao đúng hẹn.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Hotline & Support */}
          <div
            className="card"
            style={{
              padding: '1.1rem 1.25rem',
              background: '#ffffff',
              border: '1px solid #e8e2f2',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>Cần hỗ trợ khẩn cấp?</div>
                <div className="muted" style={{ fontSize: '0.82rem' }}>
                  Hotline cứu hộ & kỹ thuật 24/7:{' '}
                  <strong style={{ color: 'var(--accent)' }}>1900 8888</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .booking-grid-wrapper {
          display: grid;
          grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
          gap: 1.75rem;
          align-items: start;
        }

        .form-section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.85rem;
          border-bottom: 1px solid var(--border-subtle);
        }

        .form-section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--accent-dim);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.15rem;
        }

        .booking-steps-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .step-item {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--accent);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .step-body strong {
          font-size: 0.88rem;
          color: var(--text);
        }

        @media (max-width: 1024px) {
          .booking-grid-wrapper {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
