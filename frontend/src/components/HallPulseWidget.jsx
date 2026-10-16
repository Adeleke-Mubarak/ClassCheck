import { useState, useEffect, useCallback } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  lecturer_present: {
    label: 'Lecturer is here',
    shortLabel: 'Lecturer arrived',
    icon: '👨‍🏫',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.3)',
    activeBg: 'rgba(16, 185, 129, 0.25)',
  },
  hall_empty: {
    label: 'Hall locked / empty',
    shortLabel: 'Hall empty',
    icon: '🔒',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.3)',
    activeBg: 'rgba(245, 158, 11, 0.25)',
  },
  class_holding: {
    label: 'Class in session',
    shortLabel: 'In session',
    icon: '📖',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.3)',
    activeBg: 'rgba(59, 130, 246, 0.25)',
  },
}

export default function HallPulseWidget({ courseId, courseCode, venue }) {
  const { user } = useAuth()
  const [pulse, setPulse] = useState({
    consensus: null,
    reports: [],
    counts: { lecturer_present: 0, hall_empty: 0, class_holding: 0 },
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
        if (userReport) {
          setMyVote(userReport.status)
        }
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
              if (userReport) setMyVote(userReport.status)
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
    const newCounts = { ...pulse.counts }
    if (prevVote && newCounts[prevVote] > 0) newCounts[prevVote]--
    newCounts[status] = (newCounts[status] || 0) + 1

    let newConsensus = null
    for (const [st, count] of Object.entries(newCounts)) {
      if (count >= 3) {
        newConsensus = st
        break
      }
    }

    setPulse((prev) => ({
      ...prev,
      counts: newCounts,
      consensus: newConsensus,
    }))

    setLoading(true)
    try {
      const res = await api.submitHallPulse({
        course_id: courseId,
        status,
        user_id: user?.id,
        user_name: user?.full_name || 'Coursemate',
      })
      if (res?.data) {
        setPulse(res.data)
      }
      toast.success(
        status === 'lecturer_present'
          ? 'Marked: Lecturer is in the hall! Coursemates notified.'
          : status === 'hall_empty'
          ? 'Alert logged: Hall empty / locked.'
          : 'Reported: Class is holding.'
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

  const totalReports = (pulse.reports || []).length
  const consensusConfig = pulse.consensus ? STATUS_CONFIG[pulse.consensus] : null

  return (
    <div style={{
      marginTop: '16px',
      padding: '16px',
      borderRadius: '8px',
      background: 'var(--bg-card-subtle)',
      border: '1px solid var(--border-card)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Pulsing beacon */}
          <span style={{
            position: 'relative',
            display: 'flex',
            width: '10px',
            height: '10px',
          }}>
            <span style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: '#3B82F6',
              opacity: 0.75,
              animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
            }} />
            <span style={{
              position: 'relative',
              borderRadius: '50%',
              width: '10px',
              height: '10px',
              background: '#2563EB',
            }} />
          </span>

          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-primary)',
          }}>
            Hall Pulse · {courseCode ? `${courseCode} @ ${venue}` : venue}
          </span>
        </div>

        {/* Tally counter */}
        {totalReports > 0 && (
          <span style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontWeight: 500,
          }}>
            {totalReports} coursemate{totalReports === 1 ? '' : 's'} reported
          </span>
        )}
      </div>

      {/* Consensus Banner or Status text */}
      {consensusConfig ? (
        <div style={{
          padding: '10px 12px',
          borderRadius: '6px',
          background: consensusConfig.bg,
          border: `1px solid ${consensusConfig.border}`,
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{ fontSize: '15px' }}>{consensusConfig.icon}</span>
          <div>
            <p style={{
              fontSize: '12px',
              fontWeight: 800,
              color: consensusConfig.color,
              margin: 0,
              letterSpacing: '-0.01em',
            }}>
              Community Verified · {consensusConfig.label}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Confirmed by {pulse.counts[pulse.consensus]} coursemates physically present in {venue}.
            </p>
          </div>
        </div>
      ) : totalReports > 0 ? (
        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          margin: '0 0 12px',
          lineHeight: 1.4,
        }}>
          {pulse.counts.lecturer_present > 0 && (
            <span>👨‍🏫 {pulse.counts.lecturer_present} reported lecturer here · </span>
          )}
          {pulse.counts.hall_empty > 0 && (
            <span>🔒 {pulse.counts.hall_empty} reported hall empty · </span>
          )}
          {pulse.counts.class_holding > 0 && (
            <span>📖 {pulse.counts.class_holding} reported in session · </span>
          )}
          <span style={{ color: 'var(--text-muted)' }}>
            (Need 3 votes for verified badge)
          </span>
        </p>
      ) : (
        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          margin: '0 0 12px',
          lineHeight: 1.4,
        }}>
          Are you at {venue}? Confirm the situation to save your coursemates from guessing:
        </p>
      )}

      {/* 3 Quick Action Tap Pills */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px',
      }}>
        {Object.entries(STATUS_CONFIG).map(([key, config]) => {
          const isSelected = myVote === key
          const count = pulse.counts[key] || 0

          return (
            <button
              key={key}
              type="button"
              disabled={loading}
              onClick={() => handleVote(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderRadius: '6px',
                background: isSelected ? config.activeBg : 'var(--bg-card)',
                border: `1px solid ${isSelected ? config.border : 'var(--border-card)'}`,
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{config.icon}</span>
                <span>{config.shortLabel}</span>
              </span>

              {count > 0 && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '100px',
                  background: isSelected ? config.color : 'var(--border-card)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                  marginLeft: '4px',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {myVote && (
        <p style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          margin: '10px 0 0',
          textAlign: 'center',
        }}>
          You reported: <strong style={{ color: 'var(--text-primary)' }}>{STATUS_CONFIG[myVote]?.label}</strong>. Tap another button to update if things changed.
        </p>
      )}
    </div>
  )
}
