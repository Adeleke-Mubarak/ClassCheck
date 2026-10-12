import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const LEVELS = ['100', '200', '300', '400', '500']

export default function Account() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const [level, setLevel] = useState(profile?.level || '')
  const [savingLevel, setSavingLevel] = useState(false)

  const [passwords, setPasswords] = useState({ current: '', next: '', confirm: '' })
  const [savingPw, setSavingPw] = useState(false)

  const [deleting, setDeleting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  async function saveLevel() {
    if (level === profile?.level) return
    setSavingLevel(true)

    try {
      await api.updateProfile({ level })
      await refreshProfile()
      toast.success('Level updated')
    } catch (error) {
      toast.error('Failed to update level')
    }

    setSavingLevel(false)
  }

  async function changePassword(e) {
    e.preventDefault()
    if (passwords.next !== passwords.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (passwords.next.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setSavingPw(true)
    try {
      await api.updatePassword(passwords.next)
      toast.success('Password changed successfully')
      setPasswords({ current: '', next: '', confirm: '' })
    } catch (error) {
      toast.error(error.message || 'Failed to update password')
    }
    setSavingPw(false)
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      await api.deleteAccount(user.id)
      await api.signOut()
      navigate('/')
    } catch (err) {
      toast.error('Failed to delete account')
      setDeleting(false)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="form-container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Account settings</h1>
          <p className="text-xs text-white/40 mt-1">Manage your student profile and credentials</p>
        </div>

        {/* Profile info */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Student Profile</h2>
          <div>
            <label className="form-label">Full name</label>
            <p className="text-sm font-medium text-white bg-[#161616] border border-white/[0.06] rounded-[6px] px-4 py-2.5">
              {profile?.full_name || '—'}
            </p>
          </div>
          <div>
            <label className="form-label">Email address</label>
            <p className="text-sm font-medium text-white bg-[#161616] border border-white/[0.06] rounded-[6px] px-4 py-2.5">
              {profile?.email || '—'}
            </p>
          </div>
          <div>
            <label className="form-label">Matriculation number</label>
            <p className="text-sm font-medium text-white bg-[#161616] border border-white/[0.06] rounded-[6px] px-4 py-2.5">
              {profile?.matric_no || '—'}
            </p>
          </div>
          <div>
            <label className="form-label">Department</label>
            <p className="text-sm font-medium text-white bg-[#161616] border border-white/[0.06] rounded-[6px] px-4 py-2.5">
              {profile?.department || '—'}
            </p>
          </div>
          <div>
            <label className="form-label">Academic level</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {LEVELS.map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 rounded-[6px] text-xs font-bold border transition-colors ${
                    level === l
                      ? 'bg-white text-[#0A0A0A] border-white'
                      : 'bg-[#161616] text-white/60 border-white/[0.08] hover:border-white/20 hover:text-white'
                  }`}
                >
                  {l} Level
                </button>
              ))}
            </div>
            {level !== profile?.level && (
              <button
                type="button"
                onClick={saveLevel}
                disabled={savingLevel}
                className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-[6px] hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                {savingLevel ? 'Saving...' : 'Save level change'}
              </button>
            )}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-6 mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">Security · Change password</h2>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                required
                placeholder="At least 6 characters"
                value={passwords.next}
                onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
              <input
                id="confirmPassword"
                type="password"
                required
                placeholder="Repeat new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                className="form-input"
              />
            </div>
            <button
              type="submit"
              disabled={savingPw}
              className="btn-primary mt-2"
            >
              {savingPw ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-[#111111] border border-red-500/20 rounded-[6px] p-6 mt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-1">Danger zone</h2>
          <p className="text-xs text-white/40 mb-4 leading-relaxed">
            Deleting your account is permanent. All your course subscriptions and preferences will be erased.
          </p>
          {!deleteConfirm ? (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-[6px] hover:bg-red-500/20 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-white">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-[6px] hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-bold text-white/70 bg-[#161616] border border-white/[0.08] rounded-[6px] hover:bg-white/[0.08] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
