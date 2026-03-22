const slots = [
  { t: '08:00', a: 'Camry 51A — BD', b: '—', c: 'Fortuner — ĐH' },
  { t: '09:00', a: 'Camry (tiếp)', b: 'Vios 59F — máy lạnh', c: '—' },
  { t: '10:00', a: '—', b: 'Vios (tiếp)', c: 'Fortuner (tiếp)' },
]

export function WorkSchedule() {
  return (
    <div className="page">
      <h1 className="page-title">Lịch làm việc</h1>
      <p className="page-desc">Theo pit / nâng — đồng bộ với lịch đặt của khách.</p>

      <div className="row-between" style={{ marginBottom: '1rem' }}>
        <input type="date" />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn btn-ghost">
            Ngày
          </button>
          <button type="button" className="btn btn-primary">
            Tuần
          </button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Giờ</th>
              <th>Pit 1</th>
              <th>Pit 2</th>
              <th>Nâng 1</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.t}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.t}</td>
                <td>{s.a}</td>
                <td>{s.b}</td>
                <td>{s.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
