import { formatDistanceToNow } from 'date-fns'

export default function UpdateCard({ update }) {
  const { courses, senders, type, new_venue, note, created_at } = update

  const isCancelled = type === 'cancelled'
  const isVenueChange = type === 'venue_change'
  const isLecturer = senders?.role === 'lecturer'

  return (
    <div style={{
      background: '#111111',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '10px',
      padding: '20px',
      transition: 'border-color 0.15s',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Course code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#FFFFFF', fontSize: '14px' }}>
              {courses?.course_code}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>
              {courses?.course_name}
            </span>
          </div>

          {/* Update type badge */}
          <div style={{ marginTop: '10px' }}>
            {isCancelled && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'rgba(239,68,68,0.12)',
                color: '#EF4444',
                border: '1px solid rgba(239,68,68,0.2)',
              }}>
                Class cancelled
              </span>
            )}
            {isVenueChange && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'rgba(245,158,11,0.12)',
                color: '#F59E0B',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                Venue change
              </span>
            )}
          </div>

          {/* Venue info */}
          {isVenueChange && new_venue && (
            <p style={{ marginTop: '10px', fontSize: '14px', color: 'rgba(255,255,255,0.6)' }}>
              New venue: <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{new_venue}</span>
            </p>
          )}

          {/* Note */}
          {note && (
            <p style={{ marginTop: '6px', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>{note}</p>
          )}
        </div>

        {/* Source badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
          {isLecturer ? (
            <span style={{
              display: 'inline-flex',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(34,197,94,0.12)',
              color: '#22C55E',
              border: '1px solid rgba(34,197,94,0.2)',
            }}>
              Official
            </span>
          ) : (
            <span style={{
              display: 'inline-flex',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'rgba(37,99,235,0.12)',
              color: '#2563EB',
              border: '1px solid rgba(37,99,235,0.2)',
            }}>
              Via class rep
            </span>
          )}
        </div>
      </div>

      {/* Timestamp */}
      <p style={{
        marginTop: '12px',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.25)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: '12px',
      }}>
        {formatDistanceToNow(new Date(created_at), { addSuffix: true })}
      </p>
    </div>
  )
}
