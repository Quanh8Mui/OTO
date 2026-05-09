import { useEffect, useMemo, useState } from 'react'

type Props = {
  title?: string
  compact?: boolean
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date)
}

export function RealtimeCalendar({ title = 'Lịch realtime', compact = false }: Props) {
  const [now, setNow] = useState(() => new Date())
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    setViewDate((current) => (current.getMonth() === now.getMonth() && current.getFullYear() === now.getFullYear() ? current : now))
    setSelectedDate((current) => (current.getMonth() === now.getMonth() && current.getFullYear() === now.getFullYear() ? current : now))
  }, [now])

  const dayCells = useMemo(() => {
    const start = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const month = viewDate.getMonth()
    const daysInMonth = new Date(viewDate.getFullYear(), month + 1, 0).getDate()
    const firstDay = (start.getDay() + 6) % 7
    const cells: Array<number | null> = []
    for (let i = 0; i < firstDay; i += 1) cells.push(null)
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
    return cells
  }, [viewDate])

  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const selectedLabel = selectedDate.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  function moveMonth(delta: number) {
    setViewDate((current) => {
      const next = new Date(current)
      next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  function selectDay(day: number) {
    setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
  }

  return (
    <section className={`realtime-calendar${compact ? ' realtime-calendar--compact' : ''}`}>
      <div className="realtime-calendar-head">
        <div>
          <p className="realtime-calendar-kicker">{title}</p>
          <h3>{formatDateTime(now)}</h3>
        </div>
        <div className="realtime-calendar-clock">
          <span>{pad(now.getHours())}</span>
          <span>:</span>
          <span>{pad(now.getMinutes())}</span>
          <span>:</span>
          <span>{pad(now.getSeconds())}</span>
        </div>
      </div>

      <div className="realtime-calendar-toolbar">
        <button type="button" aria-label="Tháng trước" onClick={() => moveMonth(-1)}>
          ‹
        </button>
        <div className="realtime-calendar-month">
          {viewDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" aria-label="Tháng sau" onClick={() => moveMonth(1)}>
          ›
        </button>
      </div>

      <div className="realtime-calendar-grid realtime-calendar-grid--days">
        {dayNames.map((name) => (
          <div key={name} className="realtime-calendar-dayname">
            {name}
          </div>
        ))}
        {dayCells.map((day, index) => (
          <button
            key={`${day ?? 'empty'}-${index}`}
            type="button"
            disabled={day == null}
            onClick={() => day != null && selectDay(day)}
            className={`realtime-calendar-cell${day === now.getDate() ? ' realtime-calendar-cell--today' : ''}${
              day != null && day === selectedDate.getDate() &&
              viewDate.getMonth() === selectedDate.getMonth() &&
              viewDate.getFullYear() === selectedDate.getFullYear()
                ? ' realtime-calendar-cell--selected'
                : ''
            }${day == null ? ' realtime-calendar-cell--empty' : ''}`}
          >
            {day ?? ''}
          </button>
        ))}
      </div>

      <div className="realtime-calendar-selected">
        <span>Ngày đã chọn</span>
        <strong>{selectedLabel}</strong>
        <small>{selectedDate.toLocaleTimeString('vi-VN')}</small>
      </div>

      <style>{`
        .realtime-calendar {
          padding: 1rem;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)), var(--bg-panel);
          border: 1px solid var(--border);
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16);
        }
        .realtime-calendar--compact {
          padding: 0.85rem;
        }
        .realtime-calendar-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
        }
        .realtime-calendar-kicker {
          margin: 0 0 0.25rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.72rem;
          color: var(--accent);
          font-weight: 700;
        }
        .realtime-calendar h3 {
          margin: 0;
          font-size: 1rem;
          line-height: 1.4;
        }
        .realtime-calendar-clock {
          display: flex;
          align-items: center;
          gap: 0.2rem;
          padding: 0.5rem 0.7rem;
          border-radius: 999px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          font-family: var(--font-mono);
          color: var(--accent);
          font-weight: 700;
        }
        .realtime-calendar-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin: 1rem 0 0.75rem;
        }
        .realtime-calendar-toolbar button {
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--bg-deep);
          color: var(--text);
          cursor: pointer;
        }
        .realtime-calendar-month {
          font-weight: 600;
          color: var(--text);
          text-align: center;
          flex: 1;
        }
        .realtime-calendar-grid {
          display: grid;
          gap: 0.4rem;
        }
        .realtime-calendar-grid--days {
          grid-template-columns: repeat(7, minmax(0, 1fr));
        }
        .realtime-calendar-dayname {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 600;
          padding-bottom: 0.25rem;
        }
        .realtime-calendar-cell {
          min-height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.04);
          cursor: pointer;
          font: inherit;
        }
        .realtime-calendar-cell--today {
          background: var(--accent-dim);
          color: var(--accent);
          border-color: rgba(232, 163, 23, 0.22);
          font-weight: 700;
        }
        .realtime-calendar-cell--selected {
          outline: 2px solid rgba(232, 163, 23, 0.35);
          outline-offset: 1px;
        }
        .realtime-calendar-cell--empty {
          background: transparent;
          border-color: transparent;
          cursor: default;
        }
        .realtime-calendar-selected {
          margin-top: 0.9rem;
          padding: 0.75rem 0.85rem;
          border-radius: 14px;
          background: var(--bg-deep);
          border: 1px solid var(--border);
          display: grid;
          gap: 0.2rem;
        }
        .realtime-calendar-selected span {
          color: var(--text-muted);
          font-size: 0.76rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .realtime-calendar-selected strong {
          color: var(--text);
        }
        .realtime-calendar-selected small {
          color: var(--text-muted);
        }
      `}</style>
    </section>
  )
}
