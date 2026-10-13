import { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { offlineStorage, useOnlineStatus } from '../lib/offlineStorage'
import Navbar from '../components/Navbar'
import SenderNavbar from '../components/SenderNavbar'
import AdminNavbar from '../components/AdminNavbar'
import AddTimetableModal from '../components/AddTimetableModal'
import NextLectureCard from '../components/NextLectureCard'
import OfflineStatusBanner from '../components/OfflineStatusBanner'
import HallPulseWidget from '../components/HallPulseWidget'
import toast from 'react-hot-toast'

const DAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon', dayIndex: 1 },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue', dayIndex: 2 },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed', dayIndex: 3 },
  { key: 'thursday', label: 'Thursday', short: 'Thu', dayIndex: 4 },
  { key: 'friday', label: 'Friday', short: 'Fri', dayIndex: 5 },
  { key: 'saturday', label: 'Saturday', short: 'Sat', dayIndex: 6 },
]

function getInitialDay() {
  const currentDay = new Date().getDay()
  const matched = DAYS.find((d) => d.dayIndex === currentDay)
  return matched ? matched.key : 'monday'
}

function isDateToday(dateString) {
  if (!dateString) return false
  const d = new Date(dateString)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

function calculateDuration(start, end) {
  if (!start || !end) return ''
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const totalMinutes = eh * 60 + em - (sh * 60 + sm)
  if (isNaN(totalMinutes) || totalMinutes <= 0) return ''
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  if (mins === 0) return `${hours} hr${hours > 1 ? 's' : ''}`
  if (hours === 0) return `${mins} mins`
  return `${hours}h ${mins}m`
}

export default function Schedule() {
  const { profile } = useAuth()

  const { isOnline, formattedSyncAge } = useOnlineStatus()
  const [activeDay, setActiveDay] = useState(getInitialDay)
  const [viewMode, setViewMode] = useState('daily') // 'daily' | 'weekly'
  const [scope, setScope] = useState('mine') // 'mine' | 'all'
  const [timetable, setTimetable] = useState(() => offlineStorage.get('timetable', []))
  const [allCourses, setAllCourses] = useState(() => offlineStorage.get('courses', []))
  const [todayUpdates, setTodayUpdates] = useState(() => offlineStorage.get('feed', []))
  const [loading, setLoading] = useState(() => {
    const cached = offlineStorage.get('timetable', null)
    return cached === null
  })

  // Modal states
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const isRepOrAdmin =
    profile?.role === 'class_rep' || profile?.role === 'admin'
  const todayDayIndex = new Date().getDay()

  const fetchScheduleData = useCallback(async () => {
    setLoading(true)
    try {
      const [scheduleRes, coursesRes, feedRes] = await Promise.all([
        scope === 'mine' ? api.getMyTimetable() : api.getTimetable(),
        api.getCourses().catch(() => ({ data: offlineStorage.get('courses', []) })),
        api.getFeed().catch(() => ({ data: offlineStorage.get('feed', []) })),
      ])

      const ttData = scheduleRes?.data || []
      const coursesData = coursesRes?.data || []
      const feedData = feedRes?.data || []

      setTimetable(ttData)
      setAllCourses(coursesData)

      if (ttData.length > 0) offlineStorage.save('timetable', ttData)
      if (coursesData.length > 0) offlineStorage.save('courses', coursesData)
      if (feedData.length > 0) offlineStorage.save('feed', feedData)

      // Filter feed updates posted today
      const todayPosts = feedData.filter((u) =>
        isDateToday(u.created_at)
      )
      setTodayUpdates(todayPosts)
    } catch (err) {
      console.warn('Network issue fetching schedule, loading cached timetable:', err)
      const cachedTt = offlineStorage.get('timetable', [])
      const cachedCourses = offlineStorage.get('courses', [])
      if (cachedTt.length > 0) setTimetable(cachedTt)
      if (cachedCourses.length > 0) setAllCourses(cachedCourses)
    } finally {
      setLoading(false)
    }
  }, [scope])

  useEffect(() => {
    fetchScheduleData()
  }, [fetchScheduleData])

  // Map updates by course_id for fast lookup
  const todayUpdatesByCourse = useMemo(() => {
    const map = new Map()
    for (const update of todayUpdates) {
      if (update.course_id && !map.has(update.course_id)) {
        map.set(update.course_id, update)
      }
    }
    return map
  }, [todayUpdates])

  // Count lectures per day
  const dayCounts = useMemo(() => {
    const counts = {}
    for (const d of DAYS) counts[d.key] = 0
    for (const item of timetable) {
      if (counts[item.day_of_week] !== undefined) {
        counts[item.day_of_week]++
      }
    }
    return counts
  }, [timetable])

  // Entries for the active day
  const activeDayEntries = useMemo(() => {
    return timetable.filter((entry) => entry.day_of_week === activeDay)
  }, [timetable, activeDay])

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to remove this lecture from the timetable?')) {
      return
    }

    setDeletingId(id)
    try {
      await api.deleteTimetableEntry(id)
      toast.success('Lecture removed from timetable.')
      fetchScheduleData()
    } catch (err) {
      toast.error(err.message || 'Failed to delete entry.')
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(entry) {
    setEditingEntry(entry)
    setModalOpen(true)
  }

  function handleCreate() {
    setEditingEntry(null)
    setModalOpen(true)
  }

  // Appropriate navbar based on role
  const renderNavbar = () => {
    if (profile?.role === 'admin') return <AdminNavbar />
    if (profile?.role === 'lecturer' || profile?.role === 'class_rep') {
      return <SenderNavbar />
    }
    return <Navbar />
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans">
      {renderNavbar()}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-20 pb-24 md:pb-12">
        {/* Offline status banner */}
        <OfflineStatusBanner />

        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Timetable & Schedule
              </h1>
              {isRepOrAdmin && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/25 text-blue-400">
                  {profile?.role === 'admin' ? 'Admin Access' : 'Course Rep'}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              Live routine, lecture halls, and real-time status alerts for your courses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-[#111111] border border-white/[0.08] p-1 rounded-[6px] flex items-center">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all ${
                  viewMode === 'daily'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Daily View
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all ${
                  viewMode === 'weekly'
                    ? 'bg-white/[0.12] text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                Weekly Matrix
              </button>
            </div>

            {/* Scope Filter (My Courses vs All) */}
            <div className="bg-[#111111] border border-white/[0.08] p-1 rounded-[6px] flex items-center">
              <button
                onClick={() => setScope('mine')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all ${
                  scope === 'mine'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                My Courses
              </button>
              <button
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-all ${
                  scope === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                All Courses
              </button>
            </div>

            {/* Add Lecture Button (Course Rep & Admin Only) */}
            {isRepOrAdmin && (
              <button
                onClick={handleCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-[6px] text-xs font-bold bg-white text-black hover:bg-white/90 transition-all shadow-sm active:scale-95 ml-auto md:ml-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add Lecture</span>
              </button>
            )}
          </div>
        </div>

        {/* ── DAILY VIEW ──────────────────────────────────────────────── */}
        {viewMode === 'daily' && (
          <>
            {/* Live Glance Widget */}
            <NextLectureCard
              timetable={timetable}
              todayUpdates={todayUpdates}
              isOffline={!isOnline}
              syncAge={formattedSyncAge}
            />

            {/* Day Selector Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
              {DAYS.map((day) => {
                const isActive = activeDay === day.key
                const isCurrentCalendarDay = day.dayIndex === todayDayIndex
                const count = dayCounts[day.key] || 0

                return (
                  <button
                    key={day.key}
                    onClick={() => setActiveDay(day.key)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-[6px] text-xs font-semibold transition-all whitespace-nowrap border shrink-0 ${
                      isActive
                        ? 'bg-white/[0.12] border-blue-500/50 text-white shadow-sm'
                        : 'bg-[#111111] border-white/[0.06] text-white/55 hover:text-white hover:border-white/[0.12]'
                    }`}
                  >
                    {isCurrentCalendarDay && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    <span>{day.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300'
                          : 'bg-white/[0.06] text-white/40'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Lecture Cards List */}
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-white/40">Loading schedule...</p>
              </div>
            ) : activeDayEntries.length === 0 ? (
              <div className="bg-[#111111] border border-white/[0.08] rounded-[6px] p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-3 text-white/40">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  No lectures scheduled for {DAYS.find((d) => d.key === activeDay)?.label}
                </h3>
                <p className="text-xs text-white/45 max-w-sm mx-auto">
                  {scope === 'mine'
                    ? 'None of your subscribed courses have a class on this day. Switch to "All Courses" or enroll in more courses.'
                    : 'There are no department timetable slots assigned on this day.'}
                </p>
                {isRepOrAdmin && (
                  <button
                    onClick={handleCreate}
                    className="mt-4 px-4 py-2 rounded-[6px] text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                  >
                    + Add Lecture for {DAYS.find((d) => d.key === activeDay)?.label}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {activeDayEntries.map((entry) => {
                  const course = entry.courses || {}
                  const duration = calculateDuration(entry.start_time, entry.end_time)
                  const isEntryForToday =
                    DAYS.find((d) => d.key === entry.day_of_week)?.dayIndex === todayDayIndex

                  // Cross-reference live update posted today
                  const liveAlert = isEntryForToday
                    ? todayUpdatesByCourse.get(entry.course_id)
                    : null
                  const isCancelled = liveAlert?.type === 'cancelled'
                  const isRelocated = liveAlert?.type === 'venue_change'

                  return (
                    <div
                      key={entry.id}
                      className={`relative bg-[#111111] border rounded-[6px] p-4 sm:p-5 transition-all ${
                        isCancelled
                          ? 'border-red-500/40 bg-red-950/10'
                          : isRelocated
                          ? 'border-amber-500/40 bg-amber-950/10'
                          : 'border-white/[0.08] hover:border-white/[0.14]'
                      }`}
                    >
                      {/* Live Alert Banner */}
                      {isCancelled && (
                        <div className="mb-3.5 flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
                          <span>CLASS CANCELLED TODAY</span>
                          {liveAlert.note && (
                            <span className="font-normal text-white/70 ml-1">
                              — {liveAlert.note}
                            </span>
                          )}
                        </div>
                      )}

                      {isRelocated && (
                        <div className="mb-3.5 flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                          <span>VENUE CHANGED TODAY TO: {liveAlert.new_venue}</span>
                          {liveAlert.note && (
                            <span className="font-normal text-white/70 ml-1">
                              — {liveAlert.note}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Time & Duration Column */}
                        <div className="sm:w-36 shrink-0 flex items-center sm:flex-col sm:items-start gap-2 sm:gap-1 border-b sm:border-b-0 sm:border-r border-white/[0.06] pb-3 sm:pb-0 sm:pr-4">
                          <div
                            className={`text-sm sm:text-base font-black tracking-tight ${
                              isCancelled ? 'line-through text-white/30' : 'text-white'
                            }`}
                          >
                            {entry.start_time} – {entry.end_time}
                          </div>
                          {duration && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.06] text-white/60">
                              {duration}
                            </span>
                          )}
                        </div>

                        {/* Course & Location Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-black text-sm sm:text-base text-white tracking-tight">
                              {course.course_code || 'COURSE'}
                            </span>
                            <span className="text-xs text-white/40">•</span>
                            <span className="text-xs sm:text-sm font-semibold text-white/80 truncate">
                              {course.course_name || 'Lecture'}
                            </span>
                            {course.level && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-white/50">
                                {course.level}L
                              </span>
                            )}
                          </div>

                          {/* Details Row: Venue, Lecturer, Note */}
                          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-white/65 mt-2.5">
                            {/* Venue badge */}
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span
                                className={`font-semibold ${
                                  isRelocated
                                    ? 'line-through text-white/30'
                                    : 'text-white'
                                }`}
                              >
                                {entry.venue}
                              </span>
                              {isRelocated && (
                                <span className="font-black text-amber-400">
                                  → {liveAlert.new_venue}
                                </span>
                              )}
                            </div>

                            {/* Lecturer name */}
                            {entry.lecturer_name && (
                              <div className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{entry.lecturer_name}</span>
                              </div>
                            )}

                            {/* Note */}
                            {entry.note && (
                              <div className="flex items-center gap-1.5 text-white/50">
                                <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="italic">{entry.note}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Rep / Admin Actions */}
                        {isRepOrAdmin && (
                          <div className="flex items-center gap-2 pt-2 sm:pt-0 sm:self-center shrink-0 border-t sm:border-t-0 border-white/[0.06]">
                            <button
                              onClick={() => handleEdit(entry)}
                              className="px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
                              title="Edit lecture schedule"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(entry.id)}
                              disabled={deletingId === entry.id}
                              className="px-2.5 py-1.5 rounded-[4px] text-xs font-semibold text-red-400/80 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title="Delete lecture"
                            >
                              {deletingId === entry.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Hall Pulse for Today's Classes */}
                      {isEntryForToday && !isCancelled && (
                        <HallPulseWidget
                          courseId={entry.course_id}
                          courseCode={course.course_code}
                          venue={isRelocated ? liveAlert.new_venue : entry.venue}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── WEEKLY MATRIX VIEW ───────────────────────────────────────── */}
        {viewMode === 'weekly' && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {DAYS.slice(0, 5).map((day) => {
              const entries = timetable
                .filter((e) => e.day_of_week === day.key)
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
              const isCurrentDay = day.dayIndex === todayDayIndex

              return (
                <div
                  key={day.key}
                  className={`bg-[#111111] border rounded-[6px] p-3.5 flex flex-col min-h-[300px] ${
                    isCurrentDay
                      ? 'border-blue-500/40 bg-blue-950/[0.06]'
                      : 'border-white/[0.08]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs tracking-tight text-white">
                        {day.label}
                      </span>
                      {isCurrentDay && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white/40">
                      {entries.length}
                    </span>
                  </div>

                  {entries.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4">
                      <p className="text-[11px] text-white/30 italic">No classes</p>
                    </div>
                  ) : (
                    <div className="space-y-2 flex-1">
                      {entries.map((entry) => {
                        const course = entry.courses || {}
                        const isEntryToday = isCurrentDay
                        const liveAlert = isEntryToday
                          ? todayUpdatesByCourse.get(entry.course_id)
                          : null
                        const isCancelled = liveAlert?.type === 'cancelled'

                        return (
                          <div
                            key={entry.id}
                            className={`p-2.5 rounded-[4px] border text-xs ${
                              isCancelled
                                ? 'bg-red-500/10 border-red-500/30'
                                : 'bg-[#0A0A0A] border-white/[0.08]'
                            }`}
                          >
                            <div className="flex items-center justify-between font-black text-white text-[11px] mb-1">
                              <span className={isCancelled ? 'line-through text-red-300' : ''}>
                                {course.course_code}
                              </span>
                              <span className="text-[10px] text-white/50 font-semibold">
                                {entry.start_time}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/70 truncate mb-1">
                              {course.course_name}
                            </p>
                            <div className="text-[10px] text-blue-400 font-semibold flex items-center justify-between">
                              <span>{entry.venue}</span>
                              {isCancelled && (
                                <span className="text-red-400 font-black text-[9px] uppercase">
                                  Cancelled
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Add / Edit Lecture Modal */}
      {isRepOrAdmin && (
        <AddTimetableModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchScheduleData}
          initialData={editingEntry}
          courses={allCourses}
        />
      )}
    </div>
  )
}
