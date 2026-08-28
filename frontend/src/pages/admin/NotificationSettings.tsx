import { useEffect, useState } from 'react'
import { api, type NotificationSetting } from '../../lib/api'

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    api.admin
      .notifications()
      .then(setSettings)
      .catch((err) => setMessage(err instanceof Error ? err.message : 'Không thể tải cấu hình'))
      .finally(() => setLoading(false))
  }, [])

  function toggleEvent(id: number) {
    setSettings((current) => current.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s)))
  }

  async function saveSettings() {
    setSaving(true)
    setMessage(null)
    try {
      const channel = [emailEnabled && 'EMAIL', smsEnabled && 'SMS', pushEnabled && 'PUSH'].filter(Boolean).join(',') || 'EMAIL'
      await Promise.all(
        settings.map((s) =>
          api.admin.updateNotification(s.id, {
            enabled: s.enabled,
            channel,
          }),
        ),
      )
      setMessage('Đã lưu cấu hình thông báo.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể lưu cấu hình')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Cấu hình thông báo tự động</h1>
      <p className="page-desc">Bật/tắt sự kiện gửi thông báo cho khách và nhân viên.</p>

      <div className="card" style={{ maxWidth: 640 }}>
        <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Kênh gửi</h2>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} /> Email (SMTP)
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} /> SMS gateway
        </label>
        <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} /> Push (PWA / FCM)
        </label>

        <div className="divider" />

        <h2 style={{ fontSize: '1rem', margin: '0 0 1rem' }}>Sự kiện</h2>
        {loading ? <p className="muted">Đang tải...</p> : null}
        <div className="stack">
          {settings.map((s) => (
            <div key={s.id} className="row-between">
              <span>{s.eventKey}</span>
              <input type="checkbox" checked={s.enabled} onChange={() => toggleEvent(s.id)} />
            </div>
          ))}
        </div>

        {message ? <p className="muted" style={{ marginTop: '1rem' }}>{message}</p> : null}

        <button type="button" className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => void saveSettings()} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>
    </div>
  )
}
