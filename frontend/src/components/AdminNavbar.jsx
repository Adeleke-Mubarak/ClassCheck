import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function AdminNavbar() {
  const { refreshProfile } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await api.signOut()
    await refreshProfile()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0A] border-b border-white/[0.08] h-14">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="font-extrabold text-[17px] text-white tracking-tight">
            ClassCheck
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 border border-red-500/25 text-red-400">
            Admin
          </span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-xs sm:text-sm text-white/50 hover:text-white transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
