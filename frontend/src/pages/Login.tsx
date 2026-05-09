import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('customer@oto.local')
  const [password, setPassword] = useState('Password123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await login(email, password)
      if (result.role === 'CUSTOMER') navigate('/app/customer', { replace: true })
      else if (result.role === 'STAFF') navigate('/app/staff', { replace: true })
      else navigate('/app/admin', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card page-narrow" style={{ margin: '2rem auto', padding: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
          Đăng nhập
        </h1>
        <p className="page-desc">Tài khoản khách hàng, nhân viên hoặc admin — phân quyền theo vai trò.</p>
        <form onSubmit={handleSubmit}>
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
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <p className="badge badge-red" style={{ border: 'none', margin: '0 0 0.75rem' }}>
              {error}
            </p>
          ) : null}
          <div className="row-between" style={{ marginTop: '1.25rem' }}>
            <Link to="/register" className="muted" style={{ fontSize: '0.9rem' }}>
              Chưa có tài khoản?
            </Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
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
