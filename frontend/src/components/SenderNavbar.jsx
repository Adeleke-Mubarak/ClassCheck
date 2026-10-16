import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import ThemeToggle from './ThemeToggle'

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
      {/* ── Top Header (Fixed with Safe Area Support) ────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/[0.08]"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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

            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 md:border-l md:border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-medium text-white leading-none">
                  {profile?.full_name}
                </p>
                <p className="text-[11px] text-white/40 mt-1 capitalize">
                  {profile?.role === 'class_rep' ? 'Class rep' : 'Lecturer'}
                </p>
              </div>
              <ThemeToggle />

              <button
                onClick={handleSignOut}
                className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded hover:bg-white/5"
                title="Log out"
              >
                <svg className="w-3.5 h-3.5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Log out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Sender Mobile Bottom Navigation Dock ────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/[0.08] md:hidden px-2"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          height: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))',
        }}
        aria-label="Sender Navigation"
      >
        <div className="grid grid-cols-4 h-14 max-w-sm mx-auto items-center">
          <Link
            to="/sender/portal"
            className="relative h-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
          >
            {isActive('/sender/portal') && (
              <span className="absolute top-0 w-8 h-[2.5px] bg-blue-500 rounded-full" />
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
              className={`text-[9.5px] tracking-tight transition-colors ${
                isActive('/sender/portal') ? 'text-white font-bold' : 'text-white/45 font-medium'
              }`}
            >
              Post
            </span>
          </Link>

          <Link
            to="/schedule"
            className="relative h-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
          >
            {isActive('/schedule') && (
              <span className="absolute top-0 w-8 h-[2.5px] bg-blue-500 rounded-full" />
            )}
            <svg
              className={`w-5 h-5 transition-transform ${
                isActive('/schedule') ? 'scale-105 text-blue-400' : 'text-white/40'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/schedule') ? 2.2 : 1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span
              className={`text-[9.5px] tracking-tight transition-colors ${
                isActive('/schedule') ? 'text-white font-bold' : 'text-white/45 font-medium'
              }`}
            >
              Timetable
            </span>
          </Link>

          <Link
            to="/directory"
            className="relative h-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
          >
            {isActive('/directory') && (
              <span className="absolute top-0 w-8 h-[2.5px] bg-blue-500 rounded-full" />
            )}
            <svg
              className={`w-5 h-5 transition-transform ${
                isActive('/directory') ? 'scale-105 text-blue-400' : 'text-white/40'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive('/directory') ? 2.2 : 1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              className={`text-[9.5px] tracking-tight transition-colors ${
                isActive('/directory') ? 'text-white font-bold' : 'text-white/45 font-medium'
              }`}
            >
              Directory
            </span>
          </Link>

          <Link
            to="/sender/history"
            className="relative h-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
          >
            {isActive('/sender/history') && (
              <span className="absolute top-0 w-8 h-[2.5px] bg-blue-500 rounded-full" />
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
              className={`text-[9.5px] tracking-tight transition-colors ${
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
