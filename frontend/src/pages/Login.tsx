import { Link } from 'react-router-dom'

export function Login() {
  return (
    <div className="auth-page">
      <div className="card page-narrow" style={{ margin: '2rem auto', padding: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
          Đăng nhập
        </h1>
        <p className="page-desc">Tài khoản khách hàng, nhân viên hoặc admin — phân quyền theo vai trò.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" placeholder="••••••••" autoComplete="current-password" />
          </div>
          <div className="row-between" style={{ marginTop: '1.25rem' }}>
            <Link to="/register" className="muted" style={{ fontSize: '0.9rem' }}>
              Chưa có tài khoản?
            </Link>
            <button type="submit" className="btn btn-primary">
              Đăng nhập
            </button>
          </div>
        </form>
        <p className="muted" style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
          Demo UI: sau này nối Spring Security + JWT. Chọn phân hệ từ{' '}
          <Link to="/">trang chủ</Link>.
        </p>
      </div>
      <div style={{ textAlign: 'center' }}>
        <Link to="/" className="muted">
          ← Về trang chủ
        </Link>
      </div>
    </div>
  )
}
