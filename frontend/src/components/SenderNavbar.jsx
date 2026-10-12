import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

export default function SenderNavbar() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await api.signOut()
    await refreshProfile()
    navigate('/sender')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/[0.08] h-14">
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/sender/portal" className="font-extrabold text-[17px] text-white tracking-tight">
            ClassCheck
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400">
            Sender
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1">
            <Link
              to="/sender/portal"
              className={`text-xs sm:text-sm px-3 py-1.5 rounded-[6px] transition-colors ${
                isActive('/sender/portal')
                  ? 'text-white bg-white/[0.08] font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Post update
            </Link>
            <Link
              to="/sender/history"
              className={`text-xs sm:text-sm px-3 py-1.5 rounded-[6px] transition-colors ${
                isActive('/sender/history')
                  ? 'text-white bg-white/[0.08] font-semibold'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              My history
            </Link>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-medium text-white leading-none">
                {profile?.full_name}
              </p>
              <p className="text-[11px] text-white/40 mt-1 capitalize">
                {profile?.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
