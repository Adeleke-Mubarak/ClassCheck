import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'

const MOBILE_NAV_ITEMS = [
  {
    label: 'Feed',
    path: '/feed',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 text-blue-400' : 'text-white/40'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? 2.2 : 1.8}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
    ),
  },
  {
    label: 'Schedule',
    path: '/schedule',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 text-blue-400' : 'text-white/40'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? 2.2 : 1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: 'Directory',
    path: '/directory',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 text-blue-400' : 'text-white/40'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? 2.2 : 1.8}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    label: 'Courses',
    path: '/my-courses',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 text-blue-400' : 'text-white/40'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? 2.2 : 1.8}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
  },
  {
    label: 'Account',
    path: '/account',
    icon: (isActive) => (
      <svg
        className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 text-blue-400' : 'text-white/40'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={isActive ? 2.2 : 1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    ),
  },
]

export default function Navbar() {
  const { profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await api.signOut()
    await refreshProfile()
    navigate('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Account'
  const isFeed = location.pathname === '/feed'
  const isSchedule = location.pathname === '/schedule'
  const isDirectory = location.pathname === '/directory'
  const isCourses = location.pathname === '/my-courses'
  const isAccount = location.pathname === '/account'

  return (
    <>
      {/* ── Top Header (Fixed with Safe Area Support) ────────────────── */}
      <nav
        className="app-header fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#DCE5DE]"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          height: 'calc(3.5rem + env(safe-area-inset-top, 0px))',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left: Brand + Desktop Navigation */}
          <div className="flex items-center gap-6">
            <Link
              to="/feed"
              className="font-extrabold text-[17px] text-[#172A25] tracking-tight hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span>ClassCheck</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/feed"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isFeed
                    ? 'text-[#2563EB] bg-[#EAF1FF] font-semibold'
                    : 'text-[#687871] hover:text-[#172A25] hover:bg-[#EFF3EE]'
                }`}
              >
                Feed
              </Link>
              <Link
                to="/schedule"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isSchedule
                    ? 'text-[#2563EB] bg-[#EAF1FF] font-semibold'
                    : 'text-[#687871] hover:text-[#172A25] hover:bg-[#EFF3EE]'
                }`}
              >
                Schedule
              </Link>
              <Link
                to="/directory"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isDirectory
                    ? 'text-[#2563EB] bg-[#EAF1FF] font-semibold'
                    : 'text-[#687871] hover:text-[#172A25] hover:bg-[#EFF3EE]'
                }`}
              >
                Directory
              </Link>
              <Link
                to="/my-courses"
                className={`text-xs px-3 py-1.5 rounded-[6px] transition-colors ${
                  isCourses
                    ? 'text-[#2563EB] bg-[#EAF1FF] font-semibold'
                    : 'text-[#687871] hover:text-[#172A25] hover:bg-[#EFF3EE]'
                }`}
              >
                My Courses
              </Link>
            </div>
          </div>

          {/* Right: Profile & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Profile Pill (Desktop & Mobile) */}
            <Link
              to="/account"
              className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-[6px] transition-colors ${
                isAccount ? 'bg-[#EAF1FF]' : 'hover:bg-[#EFF3EE]'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-[#2563EB] text-white font-bold text-xs flex items-center justify-center shrink-0">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#172A25] tracking-tight max-w-[80px] sm:max-w-none truncate">
                {firstName}
              </span>
            </Link>

            {/* Desktop Divider */}
            <div className="hidden sm:block w-px h-4 bg-[#DCE5DE]" />

            {/* Sign Out (Desktop & Mobile) */}
            <button
              onClick={handleSignOut}
              className="text-xs font-medium text-[#687871] hover:text-[#172A25] transition-colors flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-[6px] hover:bg-[#EFF3EE]"
              aria-label="Sign out"
              title="Sign out"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Bottom Mobile Navigation Bar (Fixed with Safe Area Support) ── */}
      <nav
        className="app-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#DCE5DE] md:hidden px-1"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          height: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))',
        }}
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center">
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative h-full flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute top-0 w-8 h-[2.5px] bg-[#2563EB] rounded-full" />
                )}

                {/* Icon */}
                <div className="mt-0.5">
                  {item.icon(isActive)}
                </div>

                {/* Label */}
                <span
                  className={`text-[9.5px] tracking-tight transition-colors truncate max-w-full px-0.5 ${
                    isActive ? 'text-[#2563EB] font-bold' : 'text-[#87948C] font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
