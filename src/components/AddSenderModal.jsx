import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { supabase } from '../lib/supabase'

const ROLES = ['lecturer', 'class_rep']

export default function AddSenderModal({ isOpen, onClose, onAdded }) {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    role: '',
    password: '',
    selectedCourses: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    supabase.from('courses').select('*').order('course_code').then(({ data }) => {
      setCourses(data || [])
    })
  }, [isOpen])

  function toggleCourse(id) {
    setForm((prev) => ({
      ...prev,
      selectedCourses: prev.selectedCourses.includes(id)
        ? prev.selectedCourses.filter((c) => c !== id)
        : [...prev.selectedCourses, id],
    }))
  }

  function reset() {
    setForm({ fullName: '', email: '', role: '', password: '', selectedCourses: [] })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.role) return toast.error('Select a role')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      // Create auth user via admin API (requires service role key in production)
      // For this build we use signUp which works with anon key + email confirm disabled
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      })
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Failed to create user')

      // Insert sender profile
      const { error: senderError } = await supabase.from('senders').insert({
        id: userId,
        full_name: form.fullName,
        email: form.email,
        role: form.role,
        status: 'active',
      })
      if (senderError) throw senderError

      // Assign courses
      if (form.selectedCourses.length > 0) {
        const rows = form.selectedCourses.map((course_id) => ({
          sender_id: userId,
          course_id,
        }))
        const { error: courseError } = await supabase.from('sender_courses').insert(rows)
        if (courseError) throw courseError
      }

      toast.success('Sender added successfully')
      reset()
      onClose()
      onAdded?.()
    } catch (err) {
      toast.error(err.message || 'Failed to add sender')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add sender">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label" htmlFor="senderName">Full name</label>
          <input
            id="senderName"
            type="text"
            required
            placeholder="e.g. Dr. Amaka Nwosu"
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="senderEmail">Email address</label>
          <input
            id="senderEmail"
            type="email"
            required
            placeholder="lecturer@university.edu.ng"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="senderPassword">Temporary password</label>
          <input
            id="senderPassword"
            type="password"
            required
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Role</label>
          <div className="flex gap-3">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: r }))}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.role === r
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {r === 'class_rep' ? 'Class rep' : 'Lecturer'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Assign courses</label>
          <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
            {courses.length === 0 ? (
              <p className="text-sm text-gray-400 p-4">No courses found</p>
            ) : (
              courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={form.selectedCourses.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                  />
                  <span className="text-sm text-gray-900">
                    <span className="font-medium">{course.course_code}</span>
                    <span className="text-gray-500"> — {course.course_name}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => { reset(); onClose() }}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 px-6 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Adding...' : 'Add sender'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
