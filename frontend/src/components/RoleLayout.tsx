import { NavLink, Outlet } from 'react-router-dom'

export type NavItem = { to: string; label: string; icon: string; end?: boolean }

type Props = {
  brand: string
  subtitle: string
  nav: NavItem[]
  accent?: 'customer' | 'staff' | 'admin'
}

const accentClass: Record<NonNullable<Props['accent']>, string> = {
  customer: 'layout--customer',
  staff: 'layout--staff',
  admin: 'layout--admin',
}

export function RoleLayout({ brand, subtitle, nav, accent = 'customer' }: Props) {
  return (
    <div className={`app-layout ${accentClass[accent]}`}>
      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="app-brand-mark">OTO</span>
          <div>
            <div className="app-brand-title">{brand}</div>
            <div className="app-brand-sub">{subtitle}</div>
          </div>
        </div>
        <nav className="app-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `app-nav-link${isActive ? ' app-nav-link--active' : ''}`}
            >
              <span className="app-nav-icon" aria-hidden>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="app-sidebar-foot">
          <NavLink to="/" className="app-nav-link app-nav-link--ghost">
            ← Trang chủ
          </NavLink>
        </div>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
      <style>{`
        .app-layout {
          display: flex;
          min-height: 100%;
          background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(232, 163, 23, 0.12), transparent),
            var(--bg-deep);
        }
        .app-sidebar {
          width: 260px;
          flex-shrink: 0;
          background: var(--bg-panel);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 1.25rem 0.75rem;
        }
        .app-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 0.5rem 1.25rem;
          border-bottom: 1px solid var(--border);
          margin-bottom: 1rem;
        }
        .app-brand-mark {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.85rem;
          padding: 0.35rem 0.5rem;
          border-radius: 6px;
          background: var(--accent-dim);
          color: var(--accent);
        }
        .layout--staff .app-brand-mark {
          background: rgba(108, 182, 255, 0.12);
          color: var(--info);
        }
        .layout--admin .app-brand-mark {
          background: rgba(61, 214, 140, 0.12);
          color: var(--success);
        }
        .app-brand-title {
          font-weight: 700;
          font-size: 0.95rem;
        }
        .app-brand-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .app-nav {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
          flex: 1;
        }
        .app-nav-link {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 0.65rem;
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
        }
        .app-nav-link:hover {
          background: var(--bg-elevated);
          color: var(--text);
        }
        .app-nav-link--active {
          background: var(--accent-dim);
          color: var(--accent);
        }
        .layout--staff .app-nav-link--active {
          background: rgba(108, 182, 255, 0.12);
          color: var(--info);
        }
        .layout--admin .app-nav-link--active {
          background: rgba(61, 214, 140, 0.12);
          color: var(--success);
        }
        .app-nav-link--ghost {
          font-size: 0.85rem;
        }
        .app-nav-icon {
          width: 1.25rem;
          text-align: center;
          opacity: 0.9;
        }
        .app-sidebar-foot {
          padding-top: 0.5rem;
          border-top: 1px solid var(--border);
        }
        .app-main {
          flex: 1;
          min-width: 0;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  )
}
