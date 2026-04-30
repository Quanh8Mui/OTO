import { useEffect, useState } from 'react'
import { api, type NotificationSetting } from '../../lib/api'

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  useEffect(() => {
    api.admin.notifications().then(setSettings).catch(() => {})
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Cấu hình thông báo tự động</h1>
      <p className="page-desc">Email / SMS / push khi có sự kiện quan trọng.</p>

      <div className="card" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Kênh gửi</h2>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" defaultChecked /> Email (SMTP — cấu hình trong backend)
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" /> SMS gateway
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" /> Push (PWA / FCM)
        </label>

        <div className="divider" />

        <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Sự kiện</h2>
        <div className="stack">
          {settings.map((s) => (
            <div key={s.id} className="row-between">
              <span>{s.eventKey}</span>
              <input type="checkbox" checked={s.enabled} readOnly />
            </div>
          ))}
        </div>

        <button type="button" className="btn btn-primary" style={{ marginTop: '1.25rem' }}>
          Lưu cấu hình
        </button>
      </div>
    </div>
  )
}
