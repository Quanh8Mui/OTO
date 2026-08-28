import { useState } from 'react'
import { api } from '../lib/api'

interface ChangePasswordFormProps {
  description: string
}

export function ChangePasswordForm({ description }: ChangePasswordFormProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function submit() {
    if (newPassword !== confirmPassword) {
      setMessage('Mật khẩu mới và xác nhận chưa khớp.')
      return
    }
    setSaving(true)
    setMessage(null)
    try {
      await api.auth.changePassword({ currentPassword, newPassword })
      setMessage('Đổi mật khẩu thành công.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể đổi mật khẩu')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page">
      <h1 className="page-title">Đổi mật khẩu</h1>
      <p className="page-desc">{description}</p>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="field">
          <label>Mật khẩu hiện tại</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        </div>
        <div className="field">
          <label>Mật khẩu mới</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <div className="field">
          <label>Xác nhận mật khẩu mới</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <button type="button" className="btn btn-primary" onClick={submit} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Đổi mật khẩu'}
        </button>
        {message ? <p className="muted" style={{ marginTop: '0.75rem' }}>{message}</p> : null}
      </div>
    </div>
  )
}