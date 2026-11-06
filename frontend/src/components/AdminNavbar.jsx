import { Link, useNavigate, useLocation } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

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
        className="app-header fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCE5DE]"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2.5">
              <Link to="/admin" className="font-extrabold text-[17px] text-[#172A25] tracking-tight">
                ClassCheck
              </Link>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FBE9E5] border border-[#F0C6BC] text-[#B94E39]">
                Admin
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1">
              <Link
                to="/admin"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/admin')
                    ? 'text-[#2563EB] bg-[#EAF1FF] font-semibold'
                    : 'text-[#687871] hover:text-[#172A25] hover:bg-[#EFF3EE]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/schedule"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/schedule')
                    ? 'text-[#2563EB] bg-[#EAF1FF] font-semibold'
                    : 'text-[#687871] hover:text-[#172A25] hover:bg-[#EFF3EE]'
                }`}
              >
                Timetable
              </Link>
              <Link
                to="/directory"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/directory')
                    ? 'text-[#2563EB] bg-[#EAF1FF] font-semibold'
                    : 'text-[#687871] hover:text-[#172A25] hover:bg-[#EFF3EE]'
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
                className={`text-xs px-2 py-1 rounded ${isActive('/admin') ? 'text-[#2563EB] font-bold bg-[#EAF1FF]' : 'text-[#687871]'}`}
              >
                Admin
              </Link>
              <Link
                to="/schedule"
                className={`text-xs px-2 py-1 rounded ${isActive('/schedule') ? 'text-[#2563EB] font-bold bg-[#EAF1FF]' : 'text-[#687871]'}`}
              >
                Schedule
              </Link>
            </div>

            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-[#687871] hover:text-[#172A25] transition-colors px-2.5 py-1.5 rounded hover:bg-[#EFF3EE]"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}
