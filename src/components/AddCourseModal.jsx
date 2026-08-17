import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { supabase } from '../lib/supabase'

const DEPARTMENTS = [
  'Accounting', 'Architecture', 'Banking and Finance', 'Biochemistry',
  'Business Administration', 'Chemical Engineering', 'Chemistry', 'Civil Engineering',
  'Computer Science', 'Economics', 'Electrical Engineering', 'English',
  'Environmental Science', 'Geography', 'History', 'Industrial Chemistry',
  'Law', 'Mass Communication', 'Mathematics', 'Mechanical Engineering',
  'Medicine', 'Microbiology', 'Nursing', 'Pharmacy', 'Philosophy',
  'Physics', 'Political Science', 'Psychology', 'Public Administration',
  'Sociology', 'Statistics',
]

const LEVELS = ['100', '200', '300', '400', '500']

export default function AddCourseModal({ isOpen, onClose, onAdded }) {
  const [form, setForm] = useState({
    courseCode: '',
    courseName: '',
    department: '',
    level: '',
  })
  const [loading, setLoading] = useState(false)

  function reset() {
    setForm({ courseCode: '', courseName: '', department: '', level: '' })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.level) return toast.error('Select a level')

    setLoading(true)
    try {
      const { error } = await supabase.from('courses').insert({
        course_code: form.courseCode.toUpperCase().trim(),
        course_name: form.courseName.trim(),
        department: form.department,
        level: form.level,
      })
      if (error) throw error

      toast.success('Course added')
      reset()
      onClose()
      onAdded?.()
    } catch (err) {
      toast.error(err.message || 'Failed to add course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add course">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label" htmlFor="courseCode">Course code</label>
          <input
            id="courseCode"
            type="text"
            required
            placeholder="e.g. CSC401"
            value={form.courseCode}
            onChange={(e) => setForm((p) => ({ ...p, courseCode: e.target.value }))}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="courseName">Course name</label>
          <input
            id="courseName"
            type="text"
            required
            placeholder="e.g. Artificial Intelligence"
            value={form.courseName}
            onChange={(e) => setForm((p) => ({ ...p, courseName: e.target.value }))}
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="courseDept">Department</label>
          <select
            id="courseDept"
            required
            value={form.department}
            onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            className="form-input"
          >
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label">Level</label>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setForm((p) => ({ ...p, level: l }))}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  form.level === l
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {l}
              </button>
            ))}
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
            {loading ? 'Adding...' : 'Add course'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
