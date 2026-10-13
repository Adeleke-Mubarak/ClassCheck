/**
 * ClassCheck Timetable & Next Lecture Calculation Engine
 */

export const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

export const DAY_LABELS = {
  sunday: 'Sunday',
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
}

/**
 * Converts "HH:MM" (e.g. "08:30") to minutes from midnight
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/**
 * Formats "14:00" -> "2:00 PM"
 */
export function formatTime12(timeStr) {
  if (!timeStr) return ''
  const [hStr, mStr] = timeStr.split(':')
  let h = parseInt(hStr, 10)
  const m = mStr || '00'
  if (isNaN(h)) return timeStr
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

/**
 * Returns today's day key: 'monday', 'tuesday', etc.
 */
export function getCurrentDayKey() {
  const dayIndex = new Date().getDay()
  return DAY_KEYS[dayIndex]
}

/**
 * Checks if a given timestamp was created today
 */
export function isToday(dateString) {
  if (!dateString) return false
  const d = new Date(dateString)
  const today = new Date()
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

/**
 * Computes human-friendly relative time until/from minutes
 */
function formatMinutesDifference(diffMinutes) {
  if (diffMinutes <= 0) return 'Just now'
  if (diffMinutes === 1) return 'in 1 minute'
  if (diffMinutes < 60) return `in ${diffMinutes} mins`
  const hours = Math.floor(diffMinutes / 60)
  const remainingMins = diffMinutes % 60
  if (remainingMins === 0) return `in ${hours} hr${hours > 1 ? 's' : ''}`
  return `in ${hours}h ${remainingMins}m`
}

/**
 * Finds if there is an official update for this course today
 */
export function findTodayCourseUpdate(courseId, todayUpdates = []) {
  if (!courseId || !Array.isArray(todayUpdates)) return null
  return todayUpdates.find(
    (u) => (u.course_id === courseId || u.course?.id === courseId) && isToday(u.created_at)
  ) || null
}

/**
 * Main Calculator: Analyzes the student's timetable and today's updates
 * to determine the active or next upcoming lecture with real-time status.
 */
export function calculateNextLecture(timetable = [], todayUpdates = []) {
  if (!Array.isArray(timetable) || timetable.length === 0) {
    return { state: 'no_schedule' }
  }

  const now = new Date()
  const currentDayKey = DAY_KEYS[now.getDay()]
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  // 1. Get today's classes sorted chronologically
  const todayClasses = timetable
    .filter((entry) => (entry.day_of_week || '').toLowerCase() === currentDayKey)
    .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))

  // 2. Check if a lecture is in progress right now
  const inProgress = todayClasses.find((entry) => {
    const start = timeToMinutes(entry.start_time)
    const end = timeToMinutes(entry.end_time)
    return currentMinutes >= start && currentMinutes < end
  })

  if (inProgress) {
    const end = timeToMinutes(inProgress.end_time)
    const remainingMins = Math.max(0, end - currentMinutes)
    const update = findTodayCourseUpdate(inProgress.course_id || inProgress.courses?.id, todayUpdates)

    return {
      state: 'in_progress',
      entry: inProgress,
      courseCode: inProgress.courses?.course_code || inProgress.course_code || 'Course',
      courseName: inProgress.courses?.course_name || inProgress.course_name || '',
      venue: inProgress.venue || 'TBA',
      start12: formatTime12(inProgress.start_time),
      end12: formatTime12(inProgress.end_time),
      lecturer: inProgress.lecturer_name || 'Department Lecturer',
      timeBadge: `${remainingMins} min${remainingMins === 1 ? '' : 's'} remaining`,
      update,
      isCancelled: update?.type === 'cancelled',
      isVenueChanged: update?.type === 'venue_change',
    }
  }

  // 3. Check for the next upcoming lecture TODAY
  const upcomingToday = todayClasses.find((entry) => {
    const start = timeToMinutes(entry.start_time)
    return start > currentMinutes
  })

  if (upcomingToday) {
    const start = timeToMinutes(upcomingToday.start_time)
    const diffMins = Math.max(0, start - currentMinutes)
    const update = findTodayCourseUpdate(upcomingToday.course_id || upcomingToday.courses?.id, todayUpdates)

    return {
      state: 'upcoming_today',
      entry: upcomingToday,
      courseCode: upcomingToday.courses?.course_code || upcomingToday.course_code || 'Course',
      courseName: upcomingToday.courses?.course_name || upcomingToday.course_name || '',
      venue: inProgress?.venue || upcomingToday.venue || 'TBA',
      start12: formatTime12(upcomingToday.start_time),
      end12: formatTime12(upcomingToday.end_time),
      lecturer: upcomingToday.lecturer_name || 'Department Lecturer',
      timeBadge: formatMinutesDifference(diffMins),
      diffMinutes: diffMins,
      update,
      isCancelled: update?.type === 'cancelled',
      isVenueChanged: update?.type === 'venue_change',
    }
  }

  // 4. No more lectures today! Find next lecture on an upcoming day
  const todayIndex = now.getDay()
  for (let offset = 1; offset <= 7; offset++) {
    const nextDayIndex = (todayIndex + offset) % 7
    const nextDayKey = DAY_KEYS[nextDayIndex]
    const classesOnNextDay = timetable
      .filter((entry) => (entry.day_of_week || '').toLowerCase() === nextDayKey)
      .sort((a, b) => timeToMinutes(a.start_time) - timeToMinutes(b.start_time))

    if (classesOnNextDay.length > 0) {
      const nextEntry = classesOnNextDay[0]
      const dayLabel = offset === 1 ? 'Tomorrow' : DAY_LABELS[nextDayKey]

      return {
        state: todayClasses.length > 0 ? 'done_today' : 'no_classes_today',
        entry: nextEntry,
        courseCode: nextEntry.courses?.course_code || nextEntry.course_code || 'Course',
        courseName: nextEntry.courses?.course_name || nextEntry.course_name || '',
        venue: nextEntry.venue || 'TBA',
        start12: formatTime12(nextEntry.start_time),
        end12: formatTime12(nextEntry.end_time),
        lecturer: nextEntry.lecturer_name || 'Department Lecturer',
        nextDayLabel: dayLabel,
      }
    }
  }

  return { state: 'done_today', nextDayLabel: 'next week' }
}
