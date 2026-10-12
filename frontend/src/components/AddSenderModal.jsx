import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { api } from '../lib/api'

const ROLES = ['lecturer', 'class_rep']

export default function AddSenderModal({ isOpen, onClose, onAdded }) {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    role: '',
    password: '',
    selectedCourses: [],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    api.getCourses().then(({ data }) => {
      setCourses(data || [])
    }).catch(() => toast.error('Failed to load courses'))
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
    setForm({ full_name: '', email: '', role: '', password: '', selectedCourses: [] })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.role) return toast.error('Select a role')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')

    setLoading(true)
    try {
      await api.createSender({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
        courses: form.selectedCourses,
      })

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
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
            className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md"
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
            className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md"
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
            className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md"
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
                className={`flex-1 py-2.5 rounded-md text-sm font-semibold border transition-colors ${
                  form.role === r
                    ? 'bg-white text-black border-white'
                    : 'bg-[#161616] text-white/60 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {r === 'class_rep' ? 'Class rep' : 'Lecturer'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Assign courses</label>
          <div className="border border-white/[0.08] bg-[#161616] rounded-md max-h-48 overflow-y-auto">
            {courses.length === 0 ? (
              <p className="text-sm text-white/40 p-4">No courses found</p>
            ) : (
              courses.map((course) => (
                <label
                  key={course.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.06] last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={form.selectedCourses.includes(course.id)}
                    onChange={() => toggleCourse(course.id)}
                    className="rounded border-white/20 bg-[#111111] text-blue-600 focus:ring-0"
                  />
                  <span className="text-sm text-white">
                    <span className="font-semibold">{course.course_code}</span>
                    <span className="text-white/50"> — {course.course_name}</span>
                  </span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => { reset(); onClose() }}
            className="btn-secondary flex-1 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 rounded-md"
          >
            {loading ? 'Adding...' : 'Add sender'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
