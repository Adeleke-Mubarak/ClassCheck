import { useState, useEffect } from 'react'
import Modal from './Modal'
import { api } from '../lib/api'
import toast from 'react-hot-toast'

const DAYS = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
]

export default function AddTimetableModal({
  isOpen,
  onClose,
  onSuccess,
  initialData = null,
  courses = [],
}) {
  const isEditing = Boolean(initialData?.id)

  const [courseId, setCourseId] = useState('')
  const [dayOfWeek, setDayOfWeek] = useState('monday')
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('10:00')
  const [venue, setVenue] = useState('')
  const [lecturerName, setLecturerName] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setCourseId(initialData.course_id || '')
      setDayOfWeek(initialData.day_of_week || 'monday')
      setStartTime(initialData.start_time || '08:00')
      setEndTime(initialData.end_time || '10:00')
      setVenue(initialData.venue || '')
      setLecturerName(initialData.lecturer_name || '')
      setNote(initialData.note || '')
    } else {
      setCourseId(courses[0]?.id || '')
      setDayOfWeek('monday')
      setStartTime('08:00')
      setEndTime('10:00')
      setVenue('')
      setLecturerName('')
      setNote('')
    }
  }, [initialData, courses, isOpen])

  async function handleSubmit(e) {
    e.preventDefault()

    if (!courseId) {
      toast.error('Please select a course.')
      return
    }
    if (!venue.trim()) {
      toast.error('Please specify a lecture venue.')
      return
    }
    if (!startTime || !endTime) {
      toast.error('Please enter valid start and end times.')
      return
    }

    setSubmitting(true)

    const payload = {
      course_id: courseId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      venue: venue.trim(),
      lecturer_name: lecturerName.trim() || null,
      note: note.trim() || null,
    }

    try {
      if (isEditing) {
        await api.updateTimetableEntry(initialData.id, payload)
        toast.success('Lecture schedule updated!')
      } else {
        await api.createTimetableEntry(payload)
        toast.success('Lecture added to timetable!')
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to save timetable slot.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Lecture Schedule' : 'Add Lecture to Timetable'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course selection */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Course
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
            className="w-full bg-[#0A0A0A] border border-white/[0.12] rounded-[6px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="" disabled>Select a course...</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.course_code} — {course.course_name}
              </option>
            ))}
          </select>
        </div>

        {/* Day of Week */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Day of Week
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/[0.12] rounded-[6px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            {DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        {/* Time Interval */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-white/[0.12] rounded-[6px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-white/[0.12] rounded-[6px] px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Venue */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Venue / Hall
          </label>
          <input
            type="text"
            placeholder="e.g. LT2, Math Lab 1, NLH 3"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
            className="w-full bg-[#0A0A0A] border border-white/[0.12] rounded-[6px] px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Lecturer Name */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Lecturer / Facilitator (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. Prof. Adeyemi, Dr. Okon"
            value={lecturerName}
            onChange={(e) => setLecturerName(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/[0.12] rounded-[6px] px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-1.5">
            Note or Instructions (Optional)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Tutorial sheet 2 review, bring scientific calculator..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#0A0A0A] border border-white/[0.12] rounded-[6px] px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-[6px] text-xs font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-[6px] text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update Lecture' : 'Add Lecture'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
