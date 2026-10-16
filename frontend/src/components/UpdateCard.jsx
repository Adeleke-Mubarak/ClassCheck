import { formatDistanceToNow } from 'date-fns'
import { useTheme } from '../context/ThemeContext'

export default function UpdateCard({ update }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { courses, senders, type, new_venue, note, created_at } = update

  const isCancelled = type === 'cancelled'
  const isVenueChange = type === 'venue_change'
  const isLecturer = senders?.role === 'lecturer'

  return (
    <div
      style={{
        background: isDark ? '#111111' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
        borderRadius: '10px',
        padding: '20px',
        boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.15s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Course code & title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', fontSize: '15px' }}>
              {courses?.course_code}
            </span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.2)' : '#CBD5E1', fontSize: '14px' }}>·</span>
            <span style={{ color: isDark ? 'rgba(255,255,255,0.55)' : '#64748B', fontSize: '14px', fontWeight: 500 }}>
              {courses?.course_name}
            </span>
          </div>

          {/* Update type badge */}
          <div style={{ marginTop: '10px' }}>
            {isCancelled && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: isDark ? 'rgba(239,68,68,0.12)' : '#FFF1F2',
                  color: isDark ? '#EF4444' : '#E11D48',
                  border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : '#FECDD3'}`,
                }}
              >
                Class cancelled
              </span>
            )}
            {isVenueChange && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: isDark ? 'rgba(245,158,11,0.12)' : '#FFFBEB',
                  color: isDark ? '#F59E0B' : '#D97706',
                  border: `1px solid ${isDark ? 'rgba(245,158,11,0.2)' : '#FDE68A'}`,
                }}
              >
                Venue change
              </span>
            )}
          </div>

          {/* Venue info */}
          {isVenueChange && new_venue && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.7)' : '#334155' }}>
              New venue:{' '}
              <span style={{ fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>
                {new_venue}
              </span>
            </p>
          )}

          {/* Note */}
          {note && (
            <p style={{ marginTop: '6px', fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.6)' : '#475569' }}>
              {note}
            </p>
          )}
        </div>

        {/* Source badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
          {isLecturer ? (
            <span
              style={{
                display: 'inline-flex',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                background: isDark ? 'rgba(34,197,94,0.12)' : '#ECFDF5',
                color: isDark ? '#22C55E' : '#059669',
                border: `1px solid ${isDark ? 'rgba(34,197,94,0.2)' : '#A7F3D0'}`,
              }}
            >
              Official
            </span>
          ) : (
            <span
              style={{
                display: 'inline-flex',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                background: isDark ? 'rgba(37,99,235,0.12)' : '#EFF6FF',
                color: isDark ? '#60A5FA' : '#2563EB',
                border: `1px solid ${isDark ? 'rgba(37,99,235,0.25)' : '#BFDBFE'}`,
              }}
            >
              Via class rep
            </span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <p
        style={{
          marginTop: '14px',
          fontSize: '12px',
          color: isDark ? 'rgba(255,255,255,0.35)' : '#94A3B8',
          borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9'}`,
          paddingTop: '12px',
          margin: '14px 0 0',
        }}
      >
        {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
      </p>
    </div>
  )
}
