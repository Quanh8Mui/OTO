import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function Landing() {
  const { user, logout } = useAuth()
  const isLoggedIn = Boolean(user)

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-logo">
          <span className="landing-mark">OTO</span>
          <span>Garage Pro</span>
        </div>
        {isLoggedIn ? (
          <div className="landing-userbar">
            <span className="landing-greeting">Xin chào, {user?.fullName || user?.email || 'bạn'}</span>
            <button type="button" className="btn btn-ghost" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        ) : (
          <div className="landing-actions">
            <Link to="/login" className="btn btn-ghost">
              Đăng nhập
            </Link>
            <Link to="/register" className="btn btn-primary">
              Đăng ký
            </Link>
          </div>
        )}
      </header>

      <section className="landing-hero landing-hero--centered">
        <div className="landing-hero-copy">
          <p className="landing-kicker">Hệ thống gara thân thiện với khách hàng</p>
          <h1>
            Chăm xe chỉn chu.
            <br />
            <span className="text-accent">Rõ lịch, rõ giá, rõ tiến độ.</span>
          </h1>
          <p className="landing-lead">
            Gửi xe như gửi gắm một người bạn đồng hành. Từ đặt lịch, báo giá đến bàn giao xe — mọi bước đều minh bạch,
            dễ hiểu và cập nhật liên tục để bạn yên tâm.
          </p>
          <div className="landing-cta">
            <Link to="/app/customer" className="btn btn-primary">
              Đặt lịch ngay
            </Link>
            <Link to="/app/staff" className="btn btn-ghost">
              Xem quy trình
            </Link>
          </div>
          <div className="landing-trust-row">
            <span>• Kỹ thuật viên tận tâm</span>
            <span>• Báo giá trước khi làm</span>
            <span>• Cập nhật tiến độ từng bước</span>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <p className="landing-kicker">Dịch vụ nổi bật</p>
          <h2>Chúng tôi hỗ trợ khách hàng như một gara thật sự</h2>
          <p>
            Tập trung vào trải nghiệm gần gũi: hẹn giờ linh hoạt, nhắc lịch bảo dưỡng, tư vấn dễ hiểu và thông báo
            rõ ràng trong từng giai đoạn sửa chữa.
          </p>
        </div>

        <div className="landing-grid">
          <article className="card feature-card">
            <h3>Đặt lịch & tiếp nhận nhanh</h3>
            <p className="muted">Khách hàng chọn thời gian phù hợp, nhập thông tin xe và chụp hiện trạng trước khi đến gara.</p>
          </article>
          <article className="card feature-card">
            <h3>Báo giá minh bạch</h3>
            <p className="muted">Có chi tiết hạng mục, phụ tùng, công thợ và phần cần duyệt trước khi thực hiện.</p>
          </article>
          <article className="card feature-card">
            <h3>Theo dõi tiến độ</h3>
            <p className="muted">Cập nhật từng mốc: tiếp nhận, kiểm tra, sửa chữa, chạy thử và bàn giao xe.</p>
          </article>
        </div>
      </section>

      <section className="landing-section landing-service-flow">
        <div className="section-heading compact">
          <p className="landing-kicker">Quy trình gợi ý</p>
          <h2>Đơn giản, rõ ràng, dễ tiếp cận</h2>
        </div>
        <div className="flow-list">
          <div className="flow-item">
            <span>1</span>
            <p>Đặt lịch hoặc liên hệ hotline để được tư vấn nhanh.</p>
          </div>
          <div className="flow-item">
            <span>2</span>
            <p>Tiếp nhận xe, kiểm tra tổng quát và gửi báo giá chi tiết.</p>
          </div>
          <div className="flow-item">
            <span>3</span>
            <p>Thực hiện sửa chữa, cập nhật tiến độ và bàn giao sau khi hoàn tất.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-top">
          <div>
            <div className="footer-brand">
              <span className="landing-mark">OTO</span>
              <strong>Garage Pro</strong>
            </div>
            <p className="muted footer-note">
              Đồng hành cùng bạn trong mọi nhu cầu bảo dưỡng, sửa chữa và chăm sóc xe với quy trình rõ ràng,
              dịch vụ thân thiện.
            </p>
          </div>
          <div>
            <h4>Dịch vụ</h4>
            <ul>
              <li>Bảo dưỡng định kỳ</li>
              <li>Sửa chữa động cơ, điện, gầm</li>
              <li>Chăm sóc ngoại thất - nội thất</li>
              <li>Phụ tùng & báo giá minh bạch</li>
            </ul>
          </div>
          <div>
            <h4>Liên hệ</h4>
            <ul>
              <li>Hotline: 1900 123 456</li>
              <li>Email: support@garagepro.vn</li>
              <li>Giờ làm việc: 8:00 - 18:00</li>
              <li>Hỗ trợ đặt lịch online 24/7</li>
            </ul>
          </div>
          <div>
            <h4>Theo dõi</h4>
            <ul>
              <li>Facebook / Zalo / YouTube</li>
              <li>Nhắc lịch bảo dưỡng</li>
              <li>Tin tức mẹo chăm xe</li>
              <li>Ưu đãi dành cho khách hàng thân thiết</li>
            </ul>
          </div>
        </div>
      </footer>

      <style>{`
        .landing {
          min-height: 100%;
          padding: 1.5rem 1.25rem 2rem;
          max-width: 1180px;
          margin: 0 auto;
        }
        .landing-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 3rem;
          gap: 1rem;
        }
        .landing-logo, .footer-brand {
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
        .landing-actions,
        .landing-userbar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .landing-greeting {
          font-weight: 600;
          color: var(--text);
        }
        .landing-hero {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
          align-items: center;
          margin-bottom: 2rem;
        }
        .landing-hero--centered {
          text-align: center;
          justify-items: center;
        }
        .landing-hero h1 {
          font-size: clamp(2rem, 4.3vw, 3.4rem);
          line-height: 1.08;
          margin: 0 0 1rem;
          letter-spacing: -0.04em;
        }
        .text-accent { color: var(--accent); }
        .landing-kicker {
          color: var(--accent);
          font-weight: 700;
          font-size: 0.82rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 0.75rem;
        }
        .landing-lead {
          color: var(--text-muted);
          max-width: 58ch;
          margin: 0 0 1.25rem;
          font-size: 1.02rem;
          line-height: 1.7;
        }
        .landing-cta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .landing-trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1rem;
          color: var(--text-muted);
          font-size: 0.92rem;
        }
        .landing-section {
          margin-top: 2rem;
          margin-bottom: 2rem;
        }
        .section-heading {
          max-width: 760px;
          margin-bottom: 1rem;
        }
        .section-heading h2 {
          margin: 0 0 0.5rem;
          font-size: clamp(1.35rem, 2.2vw, 1.8rem);
        }
        .section-heading p { color: var(--text-muted); margin: 0; line-height: 1.7; }
        .landing-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        }
        .feature-card h3 { margin: 0 0 0.5rem; }
        .landing-service-flow .flow-list {
          display: grid;
          gap: 0.8rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        }
        .flow-item {
          padding: 1rem;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--bg-panel);
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .flow-item span {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--accent-dim);
          color: var(--accent);
          font-weight: 700;
          flex: 0 0 auto;
        }
        .flow-item p { margin: 0; color: var(--text-muted); line-height: 1.6; }
        .landing-footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border);
        }
        .footer-top {
          display: grid;
          gap: 1rem;
          grid-template-columns: 1.4fr repeat(3, 1fr);
        }
        .footer-top h4 {
          margin: 0 0 0.65rem;
          font-size: 0.98rem;
        }
        .footer-top ul {
          list-style: none;
          padding: 0;
          margin: 0;
          color: var(--text-muted);
          display: grid;
          gap: 0.4rem;
          line-height: 1.5;
        }
        .footer-note { max-width: 36ch; }
        .footer-bottom {
          text-align: center;
          font-size: 0.85rem;
          margin-top: 1.25rem;
        }
        @media (max-width: 900px) {
          .landing-hero,
          .footer-top { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .landing-header { flex-direction: column; align-items: flex-start; }
          .landing-userbar, .landing-actions { flex-wrap: wrap; }
          .garage-scene { min-height: 300px; }
          .landing { padding-inline: 0.85rem; }
        }
      `}</style>
    </div>
  )
}
