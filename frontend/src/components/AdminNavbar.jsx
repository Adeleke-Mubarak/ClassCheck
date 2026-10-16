import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function AdminNavbar() {
  const { refreshProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await api.signOut()
    await refreshProfile()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.08]"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <Link to="/admin" className="font-extrabold text-[17px] text-white tracking-tight">
                ClassCheck
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">
                Admin
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/admin"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/admin')
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/schedule"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/schedule')
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Timetable
              </Link>
              <Link
                to="/directory"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/directory')
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Directory
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick links for mobile admin in header */}
            <div className="flex sm:hidden items-center gap-1 mr-1">
              <Link
                to="/admin"
                className={`text-xs px-2 py-1 rounded ${isActive('/admin') ? 'text-white font-bold bg-white/10' : 'text-white/50'}`}
              >
                Admin
              </Link>
              <Link
                to="/schedule"
                className={`text-xs px-2 py-1 rounded ${isActive('/schedule') ? 'text-white font-bold bg-white/10' : 'text-white/50'}`}
              >
                Schedule
              </Link>
            </div>

            <ThemeToggle />

            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-white/50 hover:text-white transition-colors px-2.5 py-1.5 rounded hover:bg-white/5"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
