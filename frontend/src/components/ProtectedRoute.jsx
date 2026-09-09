import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute wraps a component with role-based access control.
 * allowedRoles: array of 'student' | 'sender' | 'admin'
 * redirectTo: where to send unauthorised users
 */
export default function ProtectedRoute({ children, allowedRoles, redirectTo = '/signin' }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the appropriate home for their role
    if (role === 'admin') return <Navigate to="/admin" replace />
    if (role === 'sender') return <Navigate to="/sender/portal" replace />
    return <Navigate to="/feed" replace />
  }

  return children
}
