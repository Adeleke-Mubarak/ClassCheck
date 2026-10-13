import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { calculateNextLecture } from '../lib/scheduleUtils'

export default function NextLectureCard({ timetable = [], todayUpdates = [], isOffline = false, syncAge = '' }) {
  const [, setTick] = useState(0)

  // Refresh calculations every 30s so countdowns stay fresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1)
    }, 30000)
    return () => clearInterval(timer)
  }, [])

  const nextInfo = calculateNextLecture(timetable, todayUpdates)

  if (nextInfo.state === 'no_schedule') {
    return null
  }

  // 1. ALL DONE FOR TODAY OR NO CLASSES SCHEDULED TODAY
  if (nextInfo.state === 'done_today' || nextInfo.state === 'no_classes_today') {
    return (
      <div style={{
        background: 'linear-gradient(180deg, #121212 0%, #0D0D0D 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        padding: '20px 22px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10B981',
            fontSize: '18px',
            fontWeight: 800,
            flexShrink: 0,
          }}>
            ✓
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                {nextInfo.state === 'done_today' ? 'Done for today' : 'No classes scheduled today'}
              </span>
              {isOffline && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '100px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  Offline · {syncAge}
                </span>
              )}
            </div>
            {nextInfo.entry ? (
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '4px 0 0' }}>
                Next lecture: <strong style={{ color: '#FFFFFF' }}>{nextInfo.courseCode}</strong> on {nextInfo.nextDayLabel} at {nextInfo.start12} ({nextInfo.venue})
              </p>
            ) : (
              <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '4px 0 0' }}>
                Check your weekly calendar for upcoming slots.
              </p>
            )}
          </div>
        </div>

        <Link
          to="/schedule"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#3B82F6',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          View timetable →
        </Link>
      </div>
    )
  }

  // 2. ACTIVE LECTURE (IN PROGRESS OR UPCOMING TODAY)
  const isInProgress = nextInfo.state === 'in_progress'
  const isCancelled = nextInfo.isCancelled
  const isVenueChanged = nextInfo.isVenueChanged

  return (
    <div
      style={{
        background: isCancelled
          ? 'linear-gradient(180deg, #1C1212 0%, #120D0D 100%)'
          : isInProgress
          ? 'linear-gradient(180deg, #101815 0%, #0E1210 100%)'
          : 'linear-gradient(180deg, #12151D 0%, #0E1017 100%)',
        border: `1px solid ${
          isCancelled
            ? 'rgba(239, 68, 68, 0.35)'
            : isInProgress
            ? 'rgba(16, 185, 129, 0.3)'
            : 'rgba(37, 99, 235, 0.3)'
        }`,
        borderRadius: '12px',
        padding: '22px 24px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isCancelled
          ? '0 4px 20px rgba(239, 68, 68, 0.08)'
          : isInProgress
          ? '0 4px 20px rgba(16, 185, 129, 0.06)'
          : '0 4px 20px rgba(37, 99, 235, 0.06)',
      }}
    >
      {/* Top Meta Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Status Tag */}
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 10px',
            borderRadius: '100px',
            background: isCancelled
              ? 'rgba(239, 68, 68, 0.15)'
              : isInProgress
              ? 'rgba(16, 185, 129, 0.15)'
              : 'rgba(37, 99, 235, 0.15)',
            color: isCancelled ? '#EF4444' : isInProgress ? '#10B981' : '#3B82F6',
            border: `1px solid ${
              isCancelled
                ? 'rgba(239, 68, 68, 0.3)'
                : isInProgress
                ? 'rgba(16, 185, 129, 0.3)'
                : 'rgba(37, 99, 235, 0.3)'
            }`,
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isCancelled ? '#EF4444' : isInProgress ? '#10B981' : '#3B82F6',
              boxShadow: isInProgress ? '0 0 8px #10B981' : 'none',
            }} />
            {isCancelled ? 'CANCELLED TODAY' : isInProgress ? 'HAPPENING NOW' : 'NEXT LECTURE'}
          </span>

          {/* Time Badge */}
          <span style={{
            fontSize: '12px',
            fontWeight: 600,
            color: isCancelled ? '#EF4444' : isInProgress ? '#10B981' : '#60A5FA',
          }}>
            {isCancelled ? 'Class will not hold' : nextInfo.timeBadge}
          </span>
        </div>

        {/* Offline Badge */}
        {isOffline && (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.5)',
            background: 'rgba(255, 255, 255, 0.06)',
            padding: '2px 8px',
            borderRadius: '100px',
          }}>
            Saved Timetable · {syncAge}
          </span>
        )}
      </div>

      {/* Main Details */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#FFFFFF',
            margin: '0 0 4px',
            letterSpacing: '-0.02em',
          }}>
            {nextInfo.courseCode}
            <span style={{
              fontSize: '15px',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.65)',
              marginLeft: '8px',
            }}>
              {nextInfo.courseName}
            </span>
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.45)', margin: 0 }}>
            {nextInfo.lecturer}
          </p>
        </div>

        <Link
          to="/schedule"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#3B82F6',
            textDecoration: 'none',
          }}
        >
          Timetable →
        </Link>
      </div>

      {/* Venue & Time Pill Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '16px',
        paddingTop: '14px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
      }}>
        {/* Time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg style={{ width: '15px', height: '15px', color: 'rgba(255, 255, 255, 0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
            {nextInfo.start12} – {nextInfo.end12}
          </span>
        </div>

        <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>

        {/* Venue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg style={{ width: '15px', height: '15px', color: 'rgba(255, 255, 255, 0.4)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          {isVenueChanged ? (
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#F59E0B' }}>
              <span style={{ textDecoration: 'line-through', color: 'rgba(255, 255, 255, 0.4)', marginRight: '6px' }}>
                {nextInfo.venue}
              </span>
              Relocated → {nextInfo.update?.new_venue || nextInfo.update?.venue || 'New Venue'}
            </span>
          ) : (
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: isCancelled ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF',
              textDecoration: isCancelled ? 'line-through' : 'none',
            }}>
              Venue: {nextInfo.venue}
            </span>
          )}
        </div>
      </div>

      {/* Real-time Broadcast Notice if exists */}
      {nextInfo.update && (
        <div style={{
          marginTop: '14px',
          padding: '10px 14px',
          borderRadius: '8px',
          background: isCancelled ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
          border: `1px solid ${isCancelled ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)'}`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>
            {isCancelled ? '🚫' : '⚠️'}
          </span>
          <div>
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isCancelled ? '#EF4444' : '#F59E0B',
              margin: '0 0 2px',
            }}>
              {isCancelled ? 'Verified Cancellation' : 'Venue Change Notice'}
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.4 }}>
              {nextInfo.update.content || nextInfo.update.reason || 'Notice broadcasted by course rep / lecturer.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
