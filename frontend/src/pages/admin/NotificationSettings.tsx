import { useEffect, useState } from 'react'
import { api, type NotificationSetting, type SmtpStatus } from '../../lib/api'

const EVENT_INFO: Record<string, { title: string; desc: string }> = {
  BOOKING_CONFIRMED: {
    title: 'Đặt lịch / Tiếp nhận xe thành công',
    desc: 'Gửi email xác nhận lịch hẹn, biển số xe, khung giờ và dịch vụ yêu cầu đến khách hàng.',
  },
  QUOTE_READY: {
    title: 'Báo giá dịch vụ đã sẵn sàng',
    desc: 'Gửi email thông báo báo giá đã lập xong, kèm tổng tiền phụ tùng, tiền công và link duyệt online.',
  },
  REPAIR_STATUS: {
    title: 'Cập nhật tiến độ sửa chữa',
    desc: 'Gửi email thông báo tự động mỗi khi kỹ thuật viên cập nhật mốc tiến độ hoặc hoàn tất sửa chữa.',
  },
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>([])
  const [smtpStatus, setSmtpStatus] = useState<SmtpStatus | null>(null)
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [smsEnabled, setSmsEnabled] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Test email state
  const [testEmail, setTestEmail] = useState('')
  const [testSending, setTestSending] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null)

  useEffect(() => {
    Promise.allSettled([api.admin.notifications(), api.admin.smtpStatus()])
      .then(([notifRes, smtpRes]) => {
        if (notifRes.status === 'fulfilled') {
          setSettings(notifRes.value)
          // Derive channels from first setting if available
          if (notifRes.value.length > 0 && notifRes.value[0].channel) {
            const ch = notifRes.value[0].channel.toUpperCase()
            setEmailEnabled(ch.includes('EMAIL'))
            setSmsEnabled(ch.includes('SMS'))
            setPushEnabled(ch.includes('PUSH'))
          }
        }
        if (smtpRes.status === 'fulfilled') {
          setSmtpStatus(smtpRes.value)
        }
      })
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
      const channel =
        [emailEnabled && 'EMAIL', smsEnabled && 'SMS', pushEnabled && 'PUSH'].filter(Boolean).join(',') || 'EMAIL'
      await Promise.all(
        settings.map((s) =>
          api.admin.updateNotification(s.id, {
            enabled: s.enabled,
            channel,
          }),
        ),
      )
      setMessage('Đã lưu cấu hình thông báo thành công.')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể lưu cấu hình')
    } finally {
      setSaving(false)
    }
  }

  async function handleSendTestEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!testEmail || !testEmail.includes('@')) {
      setTestResult({ success: false, text: 'Vui lòng nhập địa chỉ email hợp lệ.' })
      return
    }
    setTestSending(true)
    setTestResult(null)
    try {
      const res = await api.admin.testEmail(testEmail.trim())
      setTestResult({ success: true, text: res.message || 'Đã gửi email thử nghiệm thành công!' })
    } catch (err) {
      setTestResult({
        success: false,
        text: err instanceof Error ? err.message : 'Gửi email thử nghiệm thất bại. Vui lòng kiểm tra lại cấu hình SMTP.',
      })
    } finally {
      setTestSending(false)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 860 }}>
      <h1 className="page-title">Cấu hình thông báo tự động</h1>
      <p className="page-desc">
        Quản lý các sự kiện gửi thông báo tự động cho khách hàng và cấu hình máy chủ gửi Email SMTP.
      </p>

      {/* ── CARD 1: SMTP CONFIGURATION STATUS & TEST ── */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', margin: 0, fontWeight: 700, color: '#282033' }}>
              Trạng thái máy chủ gửi Email (SMTP Server)
            </h2>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem', color: '#796e85' }}>
              Dịch vụ gửi thư điện tử tự động qua giao thức SMTP.
            </p>
          </div>
          {smtpStatus?.configured ? (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              ● Đã cấu hình tài khoản gửi thư
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                padding: '0.3rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              Chưa cấu hình tài khoản SMTP
            </span>
          )}
        </div>

        {/* Server Specs Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
            background: '#faf8fd',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1px solid #e8e2f2',
            fontSize: '0.86rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <span style={{ color: '#796e85' }}>Máy chủ (Host):</span>{' '}
            <strong style={{ color: '#282033' }}>{smtpStatus?.host || 'smtp.gmail.com'}</strong>
          </div>
          <div>
            <span style={{ color: '#796e85' }}>Cổng (Port):</span>{' '}
            <strong style={{ color: '#282033' }}>{smtpStatus?.port || 587}</strong> (TLS/STARTTLS)
          </div>
          <div>
            <span style={{ color: '#796e85' }}>Tài khoản gửi:</span>{' '}
            <strong style={{ color: '#533c6e' }}>{smtpStatus?.username || '(Chưa cấu hình)'}</strong>
          </div>
          <div>
            <span style={{ color: '#796e85' }}>Tên người gửi:</span>{' '}
            <strong style={{ color: '#282033' }}>{smtpStatus?.senderName || 'OTO Garage Auto Care'}</strong>
          </div>
        </div>

        {/* Quick Test Email Form */}
        <div style={{ borderTop: '1px dashed #e8e2f2', paddingTop: '1rem' }}>
          <h3 style={{ fontSize: '0.92rem', fontWeight: 600, margin: '0 0 0.5rem', color: '#282033' }}>
            Kiểm tra kết nối gửi thử Email thực tế
          </h3>
          <form onSubmit={handleSendTestEmail} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input
              type="email"
              placeholder="Nhập email của bạn (ví dụ: ban@gmail.com)"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              style={{
                flex: '1',
                minWidth: '260px',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #d5cde2',
                fontSize: '0.88rem',
              }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={testSending}
              style={{ padding: '0.5rem 1.1rem', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
            >
              {testSending ? 'Đang gửi kiểm tra...' : 'Gửi email kiểm tra'}
            </button>
          </form>

          {testResult && (
            <div
              style={{
                marginTop: '0.75rem',
                padding: '0.65rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 500,
                background: testResult.success ? '#ecfdf5' : '#fef2f2',
                color: testResult.success ? '#065f46' : '#991b1b',
                border: `1px solid ${testResult.success ? '#a7f3d0' : '#fecaca'}`,
              }}
            >
              {testResult.text}
            </div>
          )}
        </div>

        {/* How-to guide box */}
        {!smtpStatus?.configured && (
          <div
            style={{
              marginTop: '1rem',
              background: '#f8f6fc',
              border: '1px solid #e0d8eb',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              fontSize: '0.82rem',
              color: '#533c6e',
              lineHeight: 1.6,
            }}
          >
            <strong>💡 Cách cấu hình gửi bằng Gmail (Miễn phí 500 email/ngày):</strong>
            <ol style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem' }}>
              <li>Bật <strong>Xác minh 2 bước</strong> cho tài khoản Google của bạn.</li>
              <li>Vào <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#533c6e', textDecoration: 'underline', fontWeight: 600 }}>Google App Passwords</a> để tạo mật khẩu ứng dụng 16 ký tự.</li>
              <li>Thêm 2 biến vào file môi trường: <code>MAIL_USERNAME=email_cua_ban@gmail.com</code> và <code>MAIL_PASSWORD=mat_khau_16_chu_cai</code>.</li>
            </ol>
          </div>
        )}
      </div>

      {/* ── CARD 2: CHANNELS & EVENT TRIGGERS ── */}
      <div className="card">
        <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.85rem', fontWeight: 700 }}>Kênh truyền thông được bật</h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
            <input type="checkbox" checked={emailEnabled} onChange={(e) => setEmailEnabled(e.target.checked)} />
            <span style={{ fontWeight: 600 }}>Email (SMTP)</span>
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
            <input type="checkbox" checked={smsEnabled} onChange={(e) => setSmsEnabled(e.target.checked)} />
            <span>SMS Gateway (Brandname)</span>
          </label>
          <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem', margin: 0, cursor: 'pointer' }}>
            <input type="checkbox" checked={pushEnabled} onChange={(e) => setPushEnabled(e.target.checked)} />
            <span>Thông báo đẩy (Web Push / App)</span>
          </label>
        </div>

        <div className="divider" style={{ margin: '1.25rem 0' }} />

        <h2 style={{ fontSize: '1.05rem', margin: '0 0 0.85rem', fontWeight: 700 }}>
          Sự kiện tự động gửi thông báo cho khách hàng
        </h2>
        {loading ? <p className="muted">Đang tải cấu hình sự kiện...</p> : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {settings.map((s) => {
            const info = EVENT_INFO[s.eventKey] || {
              title: s.eventKey,
              desc: s.templateSubject || 'Sự kiện tự động của hệ thống',
            }

            return (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  background: s.enabled ? '#faf8fd' : '#f9f9f9',
                  border: `1px solid ${s.enabled ? '#e8e2f2' : '#eeeeee'}`,
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ paddingRight: '1rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: s.enabled ? '#282033' : '#888888' }}>
                    {info.title}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#796e85', marginTop: '2px' }}>
                    {info.desc}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#9d92aa', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    Mã sự kiện: <code>{s.eventKey}</code>
                  </div>
                </div>

                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => toggleEvent(s.id)}
                    style={{ width: '18px', height: '18px', accentColor: '#533c6e', cursor: 'pointer' }}
                  />
                </label>
              </div>
            )
          })}
        </div>

        {message && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.65rem 0.9rem',
              borderRadius: '8px',
              background: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              fontSize: '0.85rem',
            }}
          >
            {message}
          </div>
        )}

        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: '1.25rem', padding: '0.6rem 1.5rem', fontWeight: 600 }}
          onClick={() => void saveSettings()}
          disabled={saving}
        >
          {saving ? 'Đang lưu cấu hình...' : 'Lưu cấu hình sự kiện'}
        </button>
      </div>
    </div>
  )
}
