import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="landing-mark">OTO</span>
          <span>Garage Pro</span>
        </div>
        <div className="landing-actions">
          <Link to="/login" className="btn btn-ghost">
            Đăng nhập
          </Link>
          <Link to="/register" className="btn btn-primary">
            Đăng ký
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <p className="landing-kicker">Hệ thống quản lý gara ô tô</p>
        <h1>
          Đặt lịch minh bạch.
          <br />
          Theo dõi sửa xe <span className="text-accent">theo thời gian thực</span>.
        </h1>
        <p className="landing-lead">
          Khách hàng đặt lịch online, duyệt báo giá và thanh toán an toàn. Đội ngũ kỹ thuật cập nhật tiến độ,
          quản lý kho phụ tùng — tất cả trong một nền tảng.
        </p>
        <div className="landing-cta">
          <Link to="/app/customer" className="btn btn-primary">
            Phân hệ Khách hàng
          </Link>
          <Link to="/app/staff" className="btn btn-ghost">
            Phân hệ Nhân viên
          </Link>
          <Link to="/app/admin" className="btn btn-ghost">
            Quản trị
          </Link>
        </div>
      </section>

      <section className="landing-grid">
        <article className="card">
          <h3>Khách hàng</h3>
          <p className="muted">Đặt lịch, lịch sử xe, báo giá, thanh toán, đánh giá.</p>
          <ul className="landing-list">
            <li>6 tính năng chính</li>
            <li>Theo dõi trạng thái real-time</li>
          </ul>
        </article>
        <article className="card">
          <h3>Nhân viên gara</h3>
          <p className="muted">Tiếp nhận xe, báo giá, tiến độ, kho phụ tùng, bàn giao.</p>
          <ul className="landing-list">
            <li>6 tính năng chính</li>
            <li>Lịch làm việc tập trung</li>
          </ul>
        </article>
        <article className="card">
          <h3>Admin</h3>
          <p className="muted">Nhân viên, kho, dịch vụ, dashboard, báo cáo, thông báo.</p>
          <ul className="landing-list">
            <li>6 tính năng chính</li>
            <li>Báo cáo doanh thu</li>
          </ul>
        </article>
      </section>

      <footer className="landing-footer muted">Capstone — Spring Boot + PostgreSQL + React</footer>

      <style>{`
        .landing {
          min-height: 100%;
          padding: 1.5rem 1.25rem 2rem;
          max-width: 1100px;
          margin: 0 auto;
        }
        .landing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3rem;
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-weight: 700;
        }
        .landing-mark {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          padding: 0.35rem 0.5rem;
          border-radius: 6px;
          background: var(--accent-dim);
          color: var(--accent);
        }
        .landing-actions {
          display: flex;
          gap: 0.5rem;
        }
        .landing-hero h1 {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          line-height: 1.15;
          margin: 0 0 1rem;
          letter-spacing: -0.03em;
        }
        .text-accent {
          color: var(--accent);
        }
        .landing-kicker {
          color: var(--accent);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 0.75rem;
        }
        .landing-lead {
          color: var(--text-muted);
          max-width: 52ch;
          margin: 0 0 1.5rem;
        }
        .landing-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 3rem;
        }
        .landing-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          margin-bottom: 2rem;
        }
        .landing-grid h3 {
          margin: 0 0 0.5rem;
          font-size: 1.05rem;
        }
        .landing-list {
          margin: 0.75rem 0 0;
          padding-left: 1.1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .landing-footer {
          text-align: center;
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  )
}
