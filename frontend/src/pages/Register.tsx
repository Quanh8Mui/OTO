import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({ fullName, phone, email, password })
      navigate('/app/customer', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card page-narrow" style={{ margin: '2rem auto', padding: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
          Đăng ký
        </h1>
        <p className="page-desc">Tạo tài khoản khách hàng để đặt lịch và theo dõi xe.</p>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Họ tên</label>
            <input
              id="name"
              placeholder="Nguyễn Văn A"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="phone">Số điện thoại</label>
            <input id="phone" type="tel" placeholder="09xx xxx xxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              placeholder="Tối thiểu 6 ký tự"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error ? (
            <p className="badge badge-red" style={{ border: 'none', margin: '0 0 0.75rem' }}>
              {error}
            </p>
          ) : null}
          <div className="row-between" style={{ marginTop: '1.25rem' }}>
            <Link to="/login" className="muted" style={{ fontSize: '0.9rem' }}>
              Đã có tài khoản?
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="muted">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
