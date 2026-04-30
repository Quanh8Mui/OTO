import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { Role } from '../lib/api'

export function ProtectedRoute({ roles }: { roles: Role[] }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="page">Đang tải phiên đăng nhập...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    if (user.role === 'CUSTOMER') return <Navigate to="/app/customer" replace />
    if (user.role === 'STAFF') return <Navigate to="/app/staff" replace />
    return <Navigate to="/app/admin" replace />
  }

  return <Outlet />
}

