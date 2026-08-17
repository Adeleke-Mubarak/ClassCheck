import { Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from '../lib/auth'

const TABS = [
  { label: 'Overview', path: '/admin' },
  { label: 'Senders', path: '/admin/senders' },
  { label: 'Courses', path: '/admin/courses' },
  { label: 'All updates', path: '/admin/updates' },
]

export default function AdminNavbar({ activeTab, onTabChange }) {
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14">
      <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-semibold text-lg text-gray-900 tracking-tight">ClassCheck</span>
          <span className="text-xs bg-gray-900 text-white px-2 py-0.5 rounded font-medium">Admin</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
