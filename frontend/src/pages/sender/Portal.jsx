import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import SenderNavbar from '../../components/SenderNavbar'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function Portal() {
  const { user } = useAuth()
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
      try {
        const { data } = await api.getSenderCourses(user.id)
        setCourses(data || [])
      } catch (err) {
        toast.error('Failed to load courses')
      }
    }
    if (user?.id) loadCourses()
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
      await api.postUpdate({
        course_id: form.courseId,
        sender_id: user.id,
        type: form.type,
        new_venue: form.type === 'venue_change' ? form.newVenue.trim() : null,
        note: form.note.trim() || null,
      })

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
      <div className="light-workspace min-h-screen bg-[#0A0A0A] text-white pt-[calc(4.25rem+env(safe-area-inset-top,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12 px-4">
        <SenderNavbar />
        <div className="max-w-[480px] mx-auto">
          <div className="bg-[#111111] border border-white/[0.08] rounded-md p-8 text-center">
            <div className="w-12 h-12 bg-green-500/10 border border-green-500/25 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Update broadcasted</h2>
            <p className="text-sm text-white/50 mt-1.5">
              Students subscribed to{' '}
              <span className="font-semibold text-white">{success.course}</span>{' '}
              have been notified.
            </p>

            {/* Summary */}
            <div className="mt-6 text-left bg-[#161616] border border-white/[0.08] rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Course</span>
                <span className="font-semibold text-white">{success.course}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40">Type</span>
                {success.type === 'cancelled' ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/25">
                    Class cancelled
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                    Venue change
                  </span>
                )}
              </div>
              {success.newVenue && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/40">New venue</span>
                  <span className="font-semibold text-white">{success.newVenue}</span>
                </div>
              )}
              {success.note && (
                <div className="flex justify-between items-start text-sm">
                  <span className="text-white/40 shrink-0 mr-2">Note</span>
                  <span className="text-white/80 text-right">{success.note}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setSuccess(null)}
              className="mt-6 w-full btn-primary rounded-md"
            >
              Post another update
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="light-workspace min-h-screen bg-[#0A0A0A] text-white pt-[calc(4.25rem+env(safe-area-inset-top,0px))] pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-12 px-4">
      <SenderNavbar />
      <div className="max-w-[480px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Post update</h1>
          <p className="text-sm text-white/50 mt-1">Broadcast class cancellations or venue relocations</p>
        </div>

        <div className="bg-[#111111] border border-white/[0.08] rounded-md p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Course selector */}
            <div>
              <label className="form-label" htmlFor="courseId">Course</label>
              <select
                id="courseId"
                required
                value={form.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
                className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md"
              >
                <option value="" className="bg-[#161616] text-white/50">Select a course</option>
                {courses.map((c) => c && (
                  <option key={c.id} value={c.id} className="bg-[#161616] text-white">
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
                  className={`py-3.5 px-4 rounded-md border text-sm font-semibold transition-all text-left ${
                    form.type === 'cancelled'
                      ? 'border-red-500/50 bg-red-500/10 text-red-400'
                      : 'border-white/10 bg-[#161616] text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  <div className="text-sm font-bold mb-0.5">Cancelled</div>
                  <div className="text-xs font-normal opacity-70">Class will not hold</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleChange('type', 'venue_change')}
                  className={`py-3.5 px-4 rounded-md border text-sm font-semibold transition-all text-left ${
                    form.type === 'venue_change'
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                      : 'border-white/10 bg-[#161616] text-white/50 hover:border-white/20 hover:text-white/80'
                  }`}
                >
                  <div className="text-sm font-bold mb-0.5">Venue change</div>
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
                  className="form-input bg-[#161616] border-[#2A2A2A] text-white rounded-md"
                />
              </div>
            )}

            {/* Note */}
            <div>
              <label className="form-label" htmlFor="note">
                Note <span className="text-white/40 font-normal normal-case">(optional)</span>
              </label>
              <textarea
                id="note"
                rows={3}
                placeholder="Add any additional instructions for students..."
                value={form.note}
                onChange={(e) => handleChange('note', e.target.value)}
                className="form-input resize-none bg-[#161616] border-[#2A2A2A] text-white rounded-md"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-md"
            >
              {loading ? 'Posting...' : 'Post update'}
            </button>

            {selectedCourse && (
              <p className="text-center text-xs text-white/40">
                Students subscribed to {selectedCourse.course_code} will see this immediately
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
