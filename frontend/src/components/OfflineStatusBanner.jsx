import { useOnlineStatus } from '../lib/offlineStorage'

export default function OfflineStatusBanner() {
  const { isOnline, formattedSyncAge } = useOnlineStatus()

  if (isOnline) return null

  return (
    <div style={{
      background: 'rgba(245, 158, 11, 0.1)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      borderRadius: '8px',
      padding: '10px 16px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#F59E0B',
          display: 'inline-block',
        }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#D97706' }}>
          Offline mode active
        </span>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          — Viewing saved timetable and updates ({formattedSyncAge})
        </span>
      </div>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        background: 'var(--bg-card-subtle)',
        padding: '2px 8px',
        borderRadius: '4px',
        border: '1px solid var(--border-card)',
      }}>
        Data cached locally
      </span>
    </div>
  )
}
