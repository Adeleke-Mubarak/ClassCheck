import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = [
  { key: 'in_class', label: 'Lecturer is here', shortLabel: 'Lecturer arrived', icon: '👨‍🏫' },
  { key: 'late', label: 'Class running late', shortLabel: 'Running late', icon: '⏳' },
  { key: 'not_in_class', label: 'Hall locked / empty', shortLabel: 'Hall empty', icon: '🔒' },
]

function normalizeStatus(status) {
  if (status === 'lecturer_present') return 'in_class'
  if (status === 'class_holding') return 'late'
  if (status === 'hall_empty') return 'not_in_class'
  return status
}

export default function HallPulseWidget({ courseId, courseCode, venue }) {
  const { user } = useAuth()
  const [pulse, setPulse] = useState({
    consensus: null,
    reports: [],
    counts: { in_class: 0, late: 0, not_in_class: 0 },
    total_reports: 0,
  })
  const [loading, setLoading] = useState(false)
  const [myVote, setMyVote] = useState(null)

  const fetchPulse = useCallback(async () => {
    if (!courseId) return
    try {
      const res = await api.getHallPulse(courseId)
      if (res?.data) {
        setPulse(res.data)
        // Detect current user's vote
        const userReport = (res.data.reports || []).find((r) => r.user_id === user?.id)
        if (userReport) setMyVote(normalizeStatus(userReport.status))
      }
    } catch {
      // Fail silently for background polling
    }
  }, [courseId, user?.id])

  useEffect(() => {
    fetchPulse()

    let channel = null
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channel = new BroadcastChannel('classcheck_realtime')
        channel.onmessage = (event) => {
          if (
            event.data?.type === 'HALL_PULSE_UPDATE' &&
            (!event.data?.courseId || event.data?.courseId === courseId)
          ) {
            if (event.data?.payload) {
              setPulse(event.data.payload)
              const userReport = (event.data.payload.reports || []).find(
                (r) => r.user_id === user?.id
              )
              if (userReport) setMyVote(normalizeStatus(userReport.status))
            } else {
              fetchPulse()
            }
          }
        }
      } catch {}
    }

    const handleStorage = (e) => {
      if (e.key && e.key.includes(`hall_pulse_${courseId}`)) {
        fetchPulse()
      }
    }
    window.addEventListener('storage', handleStorage)

    const timer = setInterval(fetchPulse, 3000)

    return () => {
      if (channel) channel.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(timer)
    }
  }, [courseId, user?.id, fetchPulse])

  async function handleVote(status) {
    if (loading) return
    const prevVote = myVote
    const prevPulse = { ...pulse }

    // Optimistic UI update
    setMyVote(status)
    const newCounts = { in_class: 0, late: 0, not_in_class: 0, ...pulse.counts }
    if (prevVote && newCounts[prevVote] > 0) newCounts[prevVote]--
    newCounts[status] = (newCounts[status] || 0) + 1

    const highest = Math.max(...Object.values(newCounts))
    const leaders = Object.entries(newCounts).filter(([, count]) => count === highest && count > 0)
    const newConsensus = leaders.length > 1 ? 'mixed' : highest >= 3 ? leaders[0][0] : null

    setPulse((prev) => ({
      ...prev,
      counts: newCounts,
      consensus: newConsensus,
    }))

    setLoading(true)
    try {
      await api.submitHallPulse({
        course_id: courseId,
        status,
        user_id: user?.id,
        user_name: user?.full_name || 'Coursemate',
      })
      await fetchPulse()
      toast.success(
        status === 'in_class' || status === 'lecturer_present'
          ? 'Your report is in. Thanks for helping your coursemates.'
          : status === 'not_in_class' || status === 'hall_empty'
          ? 'Your hall status report is in.'
          : 'Your class status report is in.'
      )
    } catch {
      // Rollback on failure
      setMyVote(prevVote)
      setPulse(prevPulse)
      toast.error('Could not submit status. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const counts = { in_class: 0, late: 0, not_in_class: 0, ...pulse.counts }
  const totalReports = pulse.total_reports ?? (pulse.reports || []).length
  const consensusConfig = STATUS_OPTIONS.find((option) => option.key === pulse.consensus)
  const reportTimes = (pulse.reports || [])
    .map((report) => report.created_at || report.timestamp)
    .filter(Boolean)
    .map((timestamp) => new Date(timestamp).getTime())
    .filter(Number.isFinite)
  const latestReportTime = pulse.last_updated
    ? new Date(pulse.last_updated).getTime()
    : Math.max(0, ...reportTimes)
  const reportAge = latestReportTime ? Math.max(0, Math.floor((Date.now() - latestReportTime) / 60000)) : null
  const freshness = reportAge === null
    ? 'No recent reports'
    : reportAge < 1
    ? 'Updated just now'
    : reportAge < 60
    ? `Updated ${reportAge}m ago`
    : `Updated ${Math.floor(reportAge / 60)}h ago`
  const isMixed = pulse.consensus === 'mixed'
  const leadingCount = Math.max(...Object.values(counts))

  return (
    <section className="hall-pulse" aria-label={`Crowdsourced status for ${courseCode || 'this lecture'}`}>
      <header className="hall-pulse-header">
        <div>
          <p className="hall-pulse-kicker">HALL PULSE</p>
          <h3>{courseCode ? `${courseCode} · ${venue}` : venue}</h3>
        </div>
        <div className="hall-pulse-meta">
          <strong>{totalReports} {totalReports === 1 ? 'report' : 'reports'}</strong>
          <time>{freshness}</time>
        </div>
      </header>

      <div className={`hall-pulse-signal ${isMixed ? 'mixed' : consensusConfig ? 'consensus' : 'unconfirmed'}`} role="status">
        {isMixed ? (
          <>
            <strong>Reports don’t agree yet</strong>
            <span>Check the official course update before changing plans.</span>
          </>
        ) : consensusConfig ? (
          <>
            <strong>{consensusConfig.label} · community consensus</strong>
            <span>{counts[pulse.consensus]} recent reports match this status.</span>
          </>
        ) : totalReports > 0 ? (
          <>
            <strong>Early signal, not confirmed</strong>
            <span>{leadingCount} matching {leadingCount === 1 ? 'report' : 'reports'}; 3 matching reports are needed for consensus.</span>
          </>
        ) : (
          <>
            <strong>No student reports yet</strong>
            <span>Only report if you are at the venue.</span>
          </>
        )}
      </div>

      <p className="hall-pulse-prompt">
        Are you at {venue}? Confirm the situation to save your coursemates from guessing:
      </p>
      <div className="hall-pulse-options" role="group" aria-label="Report lecture status">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = myVote === option.key
          return (
            <button
              key={option.key}
              type="button"
              className={`hall-pulse-option ${option.key} ${isSelected ? 'selected' : ''}`}
              disabled={loading}
              onClick={() => handleVote(option.key)}
              aria-pressed={isSelected}
            >
              <span className="hall-pulse-option-label"><i aria-hidden="true">{option.icon}</i>{option.shortLabel}</span>
              <strong>{counts[option.key]}</strong>
            </button>
          )
        })}
      </div>
      {myVote && (
        <p className="hall-pulse-your-vote">
          Your report: <strong>{STATUS_OPTIONS.find((option) => option.key === myVote)?.label}</strong>. You can update it if the situation changes.
        </p>
      )}
    </section>
  )
}
