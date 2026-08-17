import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SenderNavbar from '../../components/SenderNavbar'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

export default function Portal() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    courseId: '',
    type: '',
    newVenue: '',
    note: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    async function loadCourses() {
      const { data } = await supabase
        .from('sender_courses')
        .select('course_id, courses(id, course_code, course_name)')
        .eq('sender_id', user.id)
      setCourses((data || []).map((d) => d.courses))
    }
    loadCourses()
  }, [user])

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.courseId) return toast.error('Select a course')
    if (!form.type) return toast.error('Select an update type')
    if (form.type === 'venue_change' && !form.newVenue.trim()) {
      return toast.error('Enter the new venue')
    }

    setLoading(true)
    try {
      const { error } = await supabase.from('updates').insert({
        course_id: form.courseId,
        sender_id: user.id,
        type: form.type,
        new_venue: form.type === 'venue_change' ? form.newVenue.trim() : null,
        note: form.note.trim() || null,
      })
      if (error) throw error

      const course = courses.find((c) => c.id === form.courseId)
      setSuccess({
        course: course?.course_code,
        type: form.type,
        newVenue: form.newVenue,
        note: form.note,
      })
      setForm({ courseId: '', type: '', newVenue: '', note: '' })
    } catch (err) {
      toast.error('Failed to post update')
    } finally {
      setLoading(false)
    }
  }

  const selectedCourse = courses.find((c) => c?.id === form.courseId)

  if (success) {
    return (
      <div className="page-container">
        <SenderNavbar />
        <div className="form-container">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Update posted</h2>
            <p className="text-sm text-gray-500 mt-2">
              Students subscribed to{' '}
              <span className="font-medium text-gray-900">{success.course}</span>{' '}
              have been notified.
            </p>

            {/* Summary */}
            <div className="mt-6 text-left bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Course</span>
                <span className="font-medium text-gray-900">{success.course}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                {success.type === 'cancelled' ? (
                  <span className="font-medium text-red-700">Class cancelled</span>
                ) : (
                  <span className="font-medium text-amber-700">Venue change</span>
                )}
              </div>
              {success.newVenue && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">New venue</span>
                  <span className="font-medium text-gray-900">{success.newVenue}</span>
                </div>
              )}
              {success.note && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Note</span>
                  <span className="font-medium text-gray-900">{success.note}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSuccess(null)}
              className="mt-6 btn-primary"
            >
              Post another update
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <SenderNavbar />
      <div className="form-container">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Post update</h1>

        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Course selector */}
            <div>
              <label className="form-label" htmlFor="courseId">Course</label>
              <select
                id="courseId"
                required
                value={form.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                className="form-input"
              >
                <option value="">Select a course</option>
                {courses.map((c) => c && (
                  <option key={c.id} value={c.id}>
                    {c.course_code} — {c.course_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Update type */}
            <div>
              <label className="form-label">Update type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('type', 'cancelled')}
                  className={`py-4 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type === 'cancelled'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-base mb-1">Cancelled</div>
                  <div className="text-xs font-normal opacity-70">Class will not hold</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('type', 'venue_change')}
                  className={`py-4 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.type === 'venue_change'
                      ? 'border-amber-400 bg-amber-50 text-amber-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <div className="text-base mb-1">Venue change</div>
                  <div className="text-xs font-normal opacity-70">Different location</div>
                </button>
              </div>
            </div>

            {/* New venue — only shown for venue change */}
            {form.type === 'venue_change' && (
              <div>
                <label className="form-label" htmlFor="newVenue">New venue</label>
                <input
                  id="newVenue"
                  type="text"
                  required
                  placeholder="e.g. LT2, Faculty of Engineering Block B"
                  value={form.newVenue}
                  onChange={(e) => handleChange('newVenue', e.target.value)}
                  className="form-input"
                />
              </div>
            )}

            {/* Note */}
            <div>
              <label className="form-label" htmlFor="note">
                Note <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="note"
                rows={3}
                placeholder="Add any additional information for students..."
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                className="form-input resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Posting...' : 'Post update'}
            </button>

            {selectedCourse && (
              <p className="text-center text-xs text-gray-400">
                Students in {selectedCourse.course_code} will be notified immediately
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
