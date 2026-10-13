import { useOnlineStatus } from '../lib/offlineStorage'

export default function OfflineStatusBanner() {
  const { isOnline, formattedSyncAge } = useOnlineStatus()

  if (isOnline) return null

  return (
    <div style={{
      background: 'rgba(245, 158, 11, 0.12)',
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
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#FCD34D' }}>
          Offline mode active
        </span>
        <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
          — Viewing saved timetable and updates ({formattedSyncAge})
        </span>
      </div>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: 'rgba(255, 255, 255, 0.4)',
        background: 'rgba(0, 0, 0, 0.3)',
        padding: '2px 8px',
        borderRadius: '4px',
      }}>
        Data cached locally
      </span>
    </div>
  )
}
