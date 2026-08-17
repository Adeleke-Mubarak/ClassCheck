import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/auth'

export default function SenderNavbar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/sender')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <Link to="/sender/portal" className="font-semibold text-lg text-gray-900 tracking-tight">
          ClassCheck
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/sender/portal"
            className={`text-sm transition-colors ${isActive('/sender/portal') ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Post update
          </Link>
          <Link
            to="/sender/history"
            className={`text-sm transition-colors ${isActive('/sender/history') ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
          >
            My history
          </Link>
          <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 leading-none">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 capitalize">
                {profile?.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
