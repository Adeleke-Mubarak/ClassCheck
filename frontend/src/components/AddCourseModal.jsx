import { useState } from 'react'
import toast from 'react-hot-toast'
import Modal from './Modal'
import { api } from '../lib/api'

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
      await api.createCourse({
        course_code: form.courseCode.toUpperCase().trim(),
        course_name: form.courseName.trim(),
        department: form.department,
        level: form.level,
      })

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
            className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md uppercase"
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
            className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="courseDept">Department</label>
          <select
            id="courseDept"
            required
            value={form.department}
            onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
            className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md"
          >
            <option value="" className="bg-[#161616] text-white/50">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d} className="bg-[#161616] text-white">{d}</option>
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
                className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
                  form.level === l
                    ? 'bg-white text-black border-white'
                    : 'bg-[#161616] text-white/60 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {l}L
              </button>
            ))}
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
            {loading ? 'Adding...' : 'Add course'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
