import { useEffect, useMemo, useState } from 'react'
import { RealtimeCalendar } from '../../components/RealtimeCalendar'
import { api, type Booking, type StaffSchedule } from '../../lib/api'

const DAY_NAMES = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

function formatDateInput(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function slotLabel(booking: Booking) {
  return `${booking.licensePlate} — ${booking.serviceTypeLabel ?? booking.serviceName ?? 'Dịch vụ'}`
}

export function WorkSchedule() {
  const [selectedDate, setSelectedDate] = useState(() => formatDateInput())
  const [bookings, setBookings] = useState<Booking[]>([])
  const [schedules, setSchedules] = useState<StaffSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [newDay, setNewDay] = useState(1)
  const [newStart, setNewStart] = useState('08:00')
  const [newEnd, setNewEnd] = useState('17:00')
  const [saving, setSaving] = useState(false)

  async function loadData() {
    setLoading(true)
    try {
      const [bookingsData, schedulesData] = await Promise.all([api.staff.bookings(), api.staff.schedules()])
      setBookings(bookingsData)
      setSchedules(schedulesData)
      setMessage(null)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể tải lịch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.requestedDate === selectedDate && b.status !== 'CANCELLED'),
    [bookings, selectedDate],
  )

  const scheduleGrid = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const hour = Number(slot.split(':')[0])
      const matched = dayBookings.filter((b) => {
        const start = b.timeSlot?.split('–')[0]?.trim() ?? b.timeSlot?.split('-')[0]?.trim()
        if (!start) return hour === 8
        return Number(start.split(':')[0]) === hour
      })
      return { slot, bookings: matched }
    })
  }, [dayBookings])

  async function addSchedule() {
    setSaving(true)
    setMessage(null)
    try {
      await api.staff.createSchedule({ dayOfWeek: newDay, startTime: newStart, endTime: newEnd })
      await loadData()
      setMessage('Đã thêm ca làm việc.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể thêm ca')
    } finally {
      setSaving(false)
    }
  }

  async function removeSchedule(id: number) {
    setSaving(true)
    setMessage(null)
    try {
      await api.staff.deleteSchedule(id)
      await loadData()
      setMessage('Đã xóa ca làm việc.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xóa ca')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Lịch làm việc</h1>
      <p className="page-desc">Lịch đặt của khách và ca làm việc cá nhân trong tuần.</p>

      <div className="grid-2" style={{ marginBottom: '1rem', alignItems: 'start' }}>
        <div className="card card-muted">
          <div className="row-between" style={{ marginBottom: '0.75rem' }}>
            <strong style={{ fontSize: '0.98rem' }}>Lịch theo ngày</strong>
            <button type="button" className="btn btn-ghost" onClick={() => void loadData()}>
              Làm mới
            </button>
          </div>
          <input type="date" style={{ width: '100%' }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <p className="muted" style={{ marginTop: '0.75rem', marginBottom: 0 }}>
            {dayBookings.length} lịch hẹn ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <RealtimeCalendar title="Lịch realtime của xưởng" compact />
      </div>

      {loading ? <p className="muted">Đang tải...</p> : null}
      {message ? <p className="muted">{message}</p> : null}

      <div className="table-wrap" style={{ marginBottom: '1.25rem' }}>
        <table className="data">
          <thead>
            <tr>
              <th>Giờ</th>
              <th>Lịch hẹn khách</th>
            </tr>
          </thead>
          <tbody>
            {scheduleGrid.map((row) => (
              <tr key={row.slot}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{row.slot}</td>
                <td>
                  {row.bookings.length === 0 ? (
                    <span className="muted">—</span>
                  ) : (
                    row.bookings.map((b) => (
                      <div key={b.id}>
                        {slotLabel(b)} <span className="badge badge-blue">{b.status}</span>
                      </div>
                    ))
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Ca làm việc trong tuần</h2>
        <div className="grid-3" style={{ marginBottom: '1rem' }}>
          <div className="field">
            <label>Ngày</label>
            <select value={newDay} onChange={(e) => setNewDay(Number(e.target.value))}>
              {DAY_NAMES.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Bắt đầu</label>
            <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
          </div>
          <div className="field">
            <label>Kết thúc</label>
            <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => void addSchedule()} disabled={saving}>
          + Thêm ca
        </button>

        <div className="table-wrap" style={{ marginTop: '1rem' }}>
          <table className="data">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Ca</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td>{DAY_NAMES[s.dayOfWeek] ?? `Ngày ${s.dayOfWeek}`}</td>
                  <td>
                    {s.startTime} – {s.endTime}
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost" onClick={() => void removeSchedule(s.id)} disabled={saving}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 ? (
                <tr>
                  <td colSpan={3} className="muted">
                    Chưa có ca làm việc nào.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
