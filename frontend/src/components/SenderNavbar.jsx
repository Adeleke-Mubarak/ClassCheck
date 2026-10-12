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
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/[0.08] h-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/sender/portal" className="font-extrabold text-[17px] text-white tracking-tight">
              ClassCheck
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400">
              Sender
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/sender/portal"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/sender/portal')
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Post update
              </Link>
              <Link
                to="/sender/history"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isActive('/sender/history')
                    ? 'text-white bg-white/[0.08] font-semibold'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                My history
              </Link>
            </div>

            <div className="flex items-center gap-3 pl-3 md:border-l md:border-white/10">
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
                className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5"
              >
                <svg className="w-3.5 h-3.5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Sender Mobile Bottom Navigation Dock ────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/[0.08] h-16 md:hidden px-4"
        aria-label="Sender Navigation"
      >
        <div className="grid grid-cols-2 h-full max-w-xs mx-auto items-center">
          <Link
            to="/sender/portal"
            className="relative h-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
          >
            {isActive('/sender/portal') && (
              <span className="absolute top-0 w-8 h-[2px] bg-blue-500 rounded-full" />
            )}
            <svg
              className={`w-5 h-5 transition-transform ${
                isActive('/sender/portal') ? 'scale-105 text-blue-400' : 'text-white/40'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/sender/portal') ? 2.2 : 1.8} d="M12 4v16m8-8H4" />
            </svg>
            <span
              className={`text-[10px] tracking-tight transition-colors ${
                isActive('/sender/portal') ? 'text-white font-bold' : 'text-white/45 font-medium'
              }`}
            >
              Post update
            </span>
          </Link>

          <Link
            to="/sender/history"
            className="relative h-full flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
          >
            {isActive('/sender/history') && (
              <span className="absolute top-0 w-8 h-[2px] bg-blue-500 rounded-full" />
            )}
            <svg
              className={`w-5 h-5 transition-transform ${
                isActive('/sender/history') ? 'scale-105 text-blue-400' : 'text-white/40'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/sender/history') ? 2.2 : 1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span
              className={`text-[10px] tracking-tight transition-colors ${
                isActive('/sender/history') ? 'text-white font-bold' : 'text-white/45 font-medium'
              }`}
            >
              History
            </span>
          </Link>
        </div>
      </nav>
    </>
  )
}
