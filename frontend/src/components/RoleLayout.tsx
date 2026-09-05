import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export type NavItem = { to: string; label: string; end?: boolean; icon?: string }

type Props = {
  brand: string
  subtitle: string
  nav: NavItem[]
  accent?: 'customer' | 'staff' | 'admin'
}

// Map path keywords to clean SVG icons matching the reference dock style
function getNavIcon(to: string) {
  if (to.endsWith('/customer') || to.endsWith('/staff') || to.endsWith('/admin')) {
    // Dashboard / Grid icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
      </svg>
    )
  }
  if (to.includes('/book') || to.includes('/schedule')) {
    // Calendar icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="3" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    )
  }
  if (to.includes('/intake') || to.includes('/history') || to.includes('/status') || to.includes('/progress') || to.includes('/handover')) {
    // Car / Workflow / Status icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    )
  }
  if (to.includes('/quotes') || to.includes('/quote') || to.includes('/payment') || to.includes('/revenue')) {
    // Chart / Finance icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    )
  }
  if (to.includes('/inventory') || to.includes('/parts')) {
    // Box / Warehouse icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )
  }
  if (to.includes('/employees')) {
    // Users icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
  if (to.includes('/services')) {
    // Tools / Service icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    )
  }
  if (to.includes('/notifications')) {
    // Bell icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    )
  }
  if (to.includes('/password')) {
    // Key / Lock icon
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  }
  // Default Document icon
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

export function RoleLayout({ brand, subtitle, nav }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  // Determine current active section name
  const currentItem = nav.find((item) => (item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)))

  return (
    <div className="app-shell">
      {/* Sidebar Dock */}
      <aside className={`app-dock ${collapsed ? 'app-dock--collapsed' : ''}`}>
        <div className="dock-top">
          <button
            type="button"
            className="dock-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? '›' : '‹'}
          </button>
          
          <div className="dock-avatar" title={`OTO Garage - ${brand}`}>
            <span>G</span>
          </div>

          {!collapsed && (
            <div className="dock-brand-text">
              <div className="dock-brand-name">OTO GARAGE</div>
              <div className="dock-brand-role">{brand}</div>
            </div>
          )}
        </div>

        <nav className="dock-nav">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => `dock-item ${isActive ? 'dock-item--active' : ''}`}
            >
              <span className="dock-icon">{getNavIcon(item.to)}</span>
              {!collapsed && <span className="dock-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="dock-bottom">
          <NavLink to="/" className="dock-item dock-item--action" title={collapsed ? 'Trang chủ' : undefined}>
            <span className="dock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            {!collapsed && <span className="dock-label">Trang chủ</span>}
          </NavLink>

          <button
            type="button"
            onClick={handleLogout}
            className="dock-item dock-item--action dock-item--logout"
            title={collapsed ? 'Đăng xuất' : undefined}
          >
            <span className="dock-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {!collapsed && <span className="dock-label">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main App Container */}
      <div className="app-viewport">
        {/* Top Header Bar matching reference image */}
        <header className="app-topbar">
          <div className="topbar-left">
            <h1 className="topbar-title">{currentItem?.label ? currentItem.label.toUpperCase() : brand.toUpperCase()}</h1>
            <p className="topbar-desc">{subtitle}</p>
          </div>

          <div className="topbar-right">
            <div className="topbar-pill">
              <span>Tháng: Tháng 9/2026</span>
            </div>
            {user && (
              <div className="topbar-user" title={user.email}>
                <div className="user-badge-avatar">{user.fullName ? user.fullName[0].toUpperCase() : 'U'}</div>
                <span className="user-name">{user.fullName || user.email}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
          background: #f6f4fa;
          background-image: 
            radial-gradient(circle at 5% 5%, rgba(222, 212, 236, 0.45) 0%, transparent 35%),
            radial-gradient(circle at 95% 10%, rgba(252, 201, 186, 0.35) 0%, transparent 30%),
            radial-gradient(circle at 50% 95%, rgba(200, 225, 240, 0.3) 0%, transparent 40%);
          background-attachment: fixed;
        }

        /* ── Dock Sidebar ── */
        .app-dock {
          width: 240px;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-right: 1px solid #eae3f2;
          display: flex;
          flex-direction: column;
          padding: 1.25rem 0.85rem;
          transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 50;
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .app-dock--collapsed {
          width: 76px;
          padding: 1.25rem 0.5rem;
          align-items: center;
        }

        .dock-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding-bottom: 1.25rem;
          margin-bottom: 0.75rem;
          border-bottom: 1px solid #f0ebf7;
          position: relative;
          flex-shrink: 0;
        }

        .dock-toggle-btn {
          position: absolute;
          right: -4px;
          top: -4px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 1px solid #e2d9ec;
          background: #ffffff;
          color: #796e85;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .dock-toggle-btn:hover {
          background: #533c6e;
          color: #ffffff;
          border-color: #533c6e;
        }

        .app-dock--collapsed .dock-toggle-btn {
          right: -2px;
        }

        .dock-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #533c6e;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(83, 60, 110, 0.25);
          flex-shrink: 0;
        }

        .dock-brand-text {
          overflow: hidden;
        }

        .dock-brand-name {
          font-weight: 800;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          color: #282033;
        }

        .dock-brand-role {
          font-size: 0.75rem;
          color: #8c7f99;
          font-weight: 500;
        }

        .dock-nav {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 0.15rem;
          min-height: 0;
        }

        .dock-nav::-webkit-scrollbar {
          width: 4px;
        }
        .dock-nav::-webkit-scrollbar-thumb {
          background: rgba(83, 60, 110, 0.15);
          border-radius: 4px;
        }

        .dock-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.65rem 0.85rem;
          border-radius: 16px;
          color: #796e85;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.15s ease;
          text-decoration: none;
          border: 1px solid transparent;
        }

        .app-dock--collapsed .dock-item {
          justify-content: center;
          padding: 0.65rem;
          width: 44px;
          height: 44px;
        }

        .dock-item:hover {
          background: #f4eef9;
          color: #533c6e;
        }

        /* Active dock item: Deep plum purple like in the image */
        .dock-item--active {
          background: #533c6e !important;
          color: #ffffff !important;
          box-shadow: 0 6px 18px rgba(83, 60, 110, 0.28);
          font-weight: 600;
        }

        .dock-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .dock-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .dock-bottom {
          padding-top: 0.75rem;
          margin-top: auto;
          border-top: 1px solid #f0ebf7;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          flex-shrink: 0;
        }

        .dock-item--action {
          font-size: 0.85rem;
          color: #9286a1;
        }

        .dock-item--logout {
          background: transparent;
          border: none;
          width: 100%;
          cursor: pointer;
        }
        .dock-item--logout:hover {
          background: #ffebee;
          color: #c62828;
        }

        /* ── Viewport & Topbar ── */
        .app-viewport {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }

        .app-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 2rem 1rem;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .topbar-left {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .topbar-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: #282033;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .topbar-desc {
          font-size: 0.9rem;
          color: #796e85;
          margin: 0;
        }

        .topbar-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .topbar-pill {
          background: #ffffff;
          border: 1px solid #e8e2f2;
          border-radius: 9999px;
          padding: 0.45rem 1.15rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #533c6e;
          box-shadow: 0 2px 10px rgba(83, 60, 110, 0.04);
        }

        .topbar-user {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #ffffff;
          border: 1px solid #e8e2f2;
          border-radius: 9999px;
          padding: 0.35rem 0.9rem 0.35rem 0.45rem;
          box-shadow: 0 2px 10px rgba(83, 60, 110, 0.04);
        }

        .user-badge-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #e2d7ed;
          color: #533c6e;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #282033;
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-content {
          flex: 1;
        }

        @media (max-width: 900px) {
          .app-dock {
            width: 76px;
            padding: 1.25rem 0.5rem;
            align-items: center;
          }
          .dock-brand-text, .dock-label {
            display: none;
          }
          .dock-item {
            justify-content: center;
            width: 44px;
            height: 44px;
            padding: 0.65rem;
          }
          .app-topbar {
            padding: 1.25rem 1.25rem 0.5rem;
          }
          .page {
            padding: 1rem 1.25rem 2rem;
          }
        }
      `}</style>
    </div>
  )
}
