import { Link } from 'react-router-dom'

export function Register() {
  return (
    <div className="auth-page">
      <div className="card page-narrow" style={{ margin: '2rem auto', padding: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
          Đăng ký
        </h1>
        <p className="page-desc">Tạo tài khoản khách hàng để đặt lịch và theo dõi xe.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className="field">
            <label htmlFor="name">Họ tên</label>
            <input id="name" placeholder="Nguyễn Văn A" autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="phone">Số điện thoại</label>
            <input id="phone" type="tel" placeholder="09xx xxx xxx" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Mật khẩu</label>
            <input id="password" type="password" placeholder="Tối thiểu 8 ký tự" autoComplete="new-password" />
          </div>
          <div className="row-between" style={{ marginTop: '1.25rem' }}>
            <Link to="/login" className="muted" style={{ fontSize: '0.9rem' }}>
              Đã có tài khoản?
            </Link>
            <button type="submit" className="btn btn-primary">
              Đăng ký
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
