import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { signOut } from '../lib/auth'

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
    const { error } = await supabase
      .from('students')
      .update({ level })
      .eq('id', user.id)
    if (error) {
      toast.error('Failed to update level')
    } else {
      await refreshProfile()
      toast.success('Level updated')
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
    const { error } = await supabase.auth.updateUser({ password: passwords.next })
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Password changed successfully')
      setPasswords({ current: '', next: '', confirm: '' })
    }
    setSavingPw(false)
  }

  async function deleteAccount() {
    setDeleting(true)
    try {
      // Delete student record — cascades to student_courses
      await supabase.from('students').delete().eq('id', user.id)
      await signOut()
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

        {/* Profile info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
          <div>
            <label className="form-label">Full name</label>
            <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              {profile?.full_name}
            </p>
          </div>
          <div>
            <label className="form-label">Matric number</label>
            <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              {profile?.matric_no}
            </p>
          </div>
          <div>
            <label className="form-label">Department</label>
            <p className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5">
              {profile?.department}
            </p>
          </div>
          <div>
            <label className="form-label">Level</label>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    level === l
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            {level !== profile?.level && (
              <button
                onClick={saveLevel}
                disabled={savingLevel}
                className="mt-3 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {savingLevel ? 'Saving...' : 'Save level'}
              </button>
            )}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mt-4">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Change password</h2>
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
              className="btn-primary"
            >
              {savingPw ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-white border border-red-200 rounded-2xl p-6 mt-4">
          <h2 className="text-base font-semibold text-red-700 mb-2">Danger zone</h2>
          <p className="text-sm text-gray-500 mb-4">
            Deleting your account is permanent. All your data will be removed.
          </p>
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Delete account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">Are you sure? This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
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
