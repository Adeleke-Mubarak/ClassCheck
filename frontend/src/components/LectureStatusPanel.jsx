import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculateNextLecture } from '../lib/scheduleUtils'
import HallPulseWidget from './HallPulseWidget'

export default function LectureStatusPanel({ timetable = [], todayUpdates = [], isOffline = false, syncAge = '' }) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick((tick) => tick + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  const nextInfo = calculateNextLecture(timetable, todayUpdates)
  if (nextInfo.state === 'no_schedule') return null

  const isDone = nextInfo.state === 'done_today' || nextInfo.state === 'no_classes_today'
  if (isDone) {
    return (
      <section className="lecture-status-panel done">
        <div>
          <p className="lecture-status-kicker">TODAY'S ROUTINE</p>
          <h2>{nextInfo.state === 'done_today' ? 'You’re done for today.' : 'No classes on today’s schedule.'}</h2>
          <p className="lecture-status-support">
            {nextInfo.entry
              ? `Next up: ${nextInfo.courseCode} · ${nextInfo.nextDayLabel} at ${nextInfo.start12}`
              : 'Your weekly timetable is ready when you need it.'}
          </p>
        </div>
        <Link to="/schedule" className="lecture-status-link">Open timetable <span aria-hidden="true">↗</span></Link>
        {isOffline && <span className="lecture-status-offline">Saved {syncAge}</span>}
      </section>
    )
  }

  const isCancelled = nextInfo.isCancelled
  const isVenueChanged = nextInfo.isVenueChanged
  const isInProgress = nextInfo.state === 'in_progress'
  const statusLabel = isCancelled
    ? 'Cancelled'
    : isInProgress
    ? 'In progress'
    : isVenueChanged
    ? 'Venue changed'
    : 'Next lecture'
  const statusTone = isCancelled ? 'cancelled' : isVenueChanged ? 'changed' : isInProgress ? 'active' : 'upcoming'
  const venue = isVenueChanged
    ? nextInfo.update?.new_venue || nextInfo.update?.venue || nextInfo.venue
    : nextInfo.venue
  const showPulse = !isCancelled && (
    isInProgress || (nextInfo.state === 'upcoming_today' && nextInfo.diffMinutes <= 25)
  )

  return (
    <section className={`lecture-status-panel ${statusTone}`}>
      <div className="lecture-status-topline">
        <p className="lecture-status-kicker">{isInProgress ? 'CURRENTLY ON' : 'COMING UP'}</p>
        <div className="lecture-status-badges">
          <span className={`lecture-status-badge ${statusTone}`}>{statusLabel}</span>
          {isOffline && <span className="lecture-status-offline">Saved {syncAge}</span>}
        </div>
      </div>

      <div className="lecture-status-heading">
        <div>
          <h2>{nextInfo.courseCode}</h2>
          <p>{nextInfo.courseName}</p>
        </div>
        <span className="lecture-status-countdown">{isCancelled ? 'No class today' : nextInfo.timeBadge}</span>
      </div>

      <div className="lecture-status-details">
        <div><span>TIME</span><strong>{nextInfo.start12} – {nextInfo.end12}</strong></div>
        <div><span>VENUE</span><strong className={isVenueChanged ? 'venue-new' : ''}>{venue}</strong></div>
        <div><span>LECTURER</span><strong>{nextInfo.lecturer}</strong></div>
      </div>

      {nextInfo.update && (
        <div className={`lecture-status-notice ${statusTone}`}>
          <strong>{isCancelled ? 'Official cancellation' : 'Official venue update'}</strong>
          <p>{nextInfo.update.note || nextInfo.update.content || nextInfo.update.reason || 'Posted by an approved course sender.'}</p>
        </div>
      )}

      {showPulse && (
        <HallPulseWidget
          courseId={nextInfo.courseId || nextInfo.entry?.course_id || nextInfo.entry?.courses?.id}
          courseCode={nextInfo.courseCode}
          venue={venue}
        />
      )}

      <Link to="/schedule" className="lecture-status-link">Full timetable <span aria-hidden="true">↗</span></Link>
    </section>
  )
}