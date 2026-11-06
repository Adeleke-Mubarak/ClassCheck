import { useOnlineStatus } from '../lib/offlineStorage'

export default function OfflineStatusBanner() {
  const { isOnline, formattedSyncAge } = useOnlineStatus()

  if (isOnline) return null

  return (
    <div style={{
      background: '#FFF4DF',
      border: '1px solid #EBCB8A',
      borderRadius: '6px',
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
          background: '#B76B16',
          display: 'inline-block',
        }} />
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#8D5412' }}>
          Offline mode active
        </span>
        <span style={{ fontSize: '13px', color: '#6E6759' }}>
          — Viewing saved timetable and updates ({formattedSyncAge})
        </span>
      </div>
      <span style={{
        fontSize: '11px',
        fontWeight: 600,
        color: '#8D5412',
        background: 'rgba(183, 107, 22, 0.08)',
        padding: '2px 8px',
        borderRadius: '4px',
      }}>
        Data cached locally
      </span>
    </div>
  )
}
