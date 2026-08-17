import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/auth'

const font = "'Plus Jakarta Sans', 'Inter', ui-sans-serif, sans-serif"

const NAV_LINKS = [
  { label: 'Feed', path: '/feed' },
  { label: 'My Courses', path: '/my-courses' },
]

export default function Navbar() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Account'

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: '#0A0A0A',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      height: '56px',
      fontFamily: font,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left — Logo + nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <Link
            to="/feed"
            style={{
              fontWeight: 800,
              fontSize: '17px',
              letterSpacing: '-0.04em',
              color: '#FFFFFF',
              textDecoration: 'none',
            }}
          >
            ClassCheck
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {NAV_LINKS.map(({ label, path }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                    background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'color 0.15s, background 0.15s',
                    letterSpacing: '-0.01em',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.45)'
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Right — Account + Sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/account"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {/* Profile icon */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0',
              flexShrink: 0,
            }}>
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              letterSpacing: '-0.01em',
            }}>
              {firstName}
            </span>
          </Link>

          <div style={{
            width: '1px',
            height: '20px',
            background: 'rgba(255,255,255,0.1)',
          }} />

          <button
            onClick={handleSignOut}
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.35)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 8px',
              borderRadius: '6px',
              fontFamily: font,
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.75)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)'
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
