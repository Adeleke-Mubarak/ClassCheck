import { useState, useEffect } from 'react'
import { pwaUtils } from '../lib/pwaUtils'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function NotificationTestCard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [permission, setPermission] = useState(() => pwaUtils.getNotificationPermission())
  const [testing, setTesting] = useState(false)
  const isIos = pwaUtils.isIos()
  const isStandalone = pwaUtils.isStandalone()

  useEffect(() => {
    // Check permission state periodically or on window focus
    function checkPerm() {
      setPermission(pwaUtils.getNotificationPermission())
    }
    window.addEventListener('focus', checkPerm)
    return () => window.removeEventListener('focus', checkPerm)
  }, [])

  async function handleEnable() {
    try {
      const perm = await pwaUtils.requestPermission()
      setPermission(perm)
      if (perm === 'granted') {
        toast.success('Notification permission granted!')
      } else if (perm === 'denied') {
        toast.error('Permission was denied. Please allow notifications in site settings.')
      }
    } catch (err) {
      toast.error(err.message || 'Could not request notification permission.')
    }
  }

  async function handleTest() {
    setTesting(true)
    try {
      await pwaUtils.sendTestNotification()
      toast.success('Test alert sent! Check your device lock screen & status bar.')
    } catch (err) {
      toast.error(err.message || 'Failed to dispatch test notification.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div style={{
      background: isDark ? '#111111' : '#FFFFFF',
      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : '#E2E8F0'}`,
      borderRadius: '8px',
      padding: '20px 24px',
      marginTop: '16px',
      boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
    }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#334155', margin: 0 }}>
            Lecture Alert & Device Readiness
          </h2>
          <p style={{ fontSize: '12px', color: isDark ? 'rgba(255, 255, 255, 0.45)' : '#64748B', margin: '4px 0 0' }}>
            Ensure your phone doesn't silence emergency lecture cancellations.
          </p>
        </div>

        {/* Status pill */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          borderRadius: '100px',
          fontSize: '11px',
          fontWeight: 700,
          background: permission === 'granted'
            ? isDark ? 'rgba(16, 185, 129, 0.12)' : '#ECFDF5'
            : permission === 'denied'
            ? isDark ? 'rgba(239, 68, 68, 0.12)' : '#FFF1F2'
            : isDark ? 'rgba(245, 158, 11, 0.12)' : '#FFFBEB',
          color: permission === 'granted'
            ? isDark ? '#10B981' : '#059669'
            : permission === 'denied'
            ? isDark ? '#EF4444' : '#E11D48'
            : isDark ? '#F59E0B' : '#D97706',
          border: `1px solid ${
            permission === 'granted'
              ? isDark ? 'rgba(16, 185, 129, 0.25)' : '#A7F3D0'
              : permission === 'denied'
              ? isDark ? 'rgba(239, 68, 68, 0.25)' : '#FECDD3'
              : isDark ? 'rgba(245, 158, 11, 0.25)' : '#FDE68A'
          }`,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: permission === 'granted' ? '#10B981' : permission === 'denied' ? '#EF4444' : '#F59E0B',
          }} />
          {permission === 'granted'
            ? 'Alerts Active'
            : permission === 'denied'
            ? 'Alerts Blocked'
            : 'Permission Needed'}
        </span>
      </div>

      {/* iOS Standalone Warning */}
      {isIos && !isStandalone && (
        <div style={{
          padding: '12px 14px',
          borderRadius: '6px',
          background: isDark ? 'rgba(59, 130, 246, 0.08)' : '#EFF6FF',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : '#BFDBFE'}`,
          marginBottom: '14px',
          fontSize: '12px',
          color: isDark ? '#93C5FD' : '#1D4ED8',
          lineHeight: 1.5,
        }}>
          <strong>iPhone users:</strong> To receive push notifications on iOS, tap the Share button (⎋) in Safari and select <strong>"Add to Home Screen"</strong>. Then open ClassCheck from your home screen.
        </div>
      )}

      {/* Action Row */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '12px' }}>
        {permission !== 'granted' ? (
          <button
            type="button"
            onClick={handleEnable}
            style={{
              padding: '10px 18px',
              borderRadius: '6px',
              background: '#2563EB',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s',
            }}
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>Enable Push Notifications</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={testing}
            onClick={handleTest}
            style={{
              padding: '10px 18px',
              borderRadius: '6px',
              background: isDark ? '#FFFFFF' : '#0F172A',
              color: isDark ? '#0A0A0A' : '#FFFFFF',
              fontSize: '13px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              opacity: testing ? 0.6 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            <span>🔔</span>
            <span>{testing ? 'Dispatching test...' : 'Send Test Notification'}</span>
          </button>
        )}

        {permission === 'denied' && (
          <span style={{ fontSize: '12px', color: '#EF4444' }}>
            Notifications are disabled in your browser. Tap the site settings lock icon to allow.
          </span>
        )}
      </div>

      {/* Battery / Background Info Tip */}
      <div style={{
        marginTop: '16px',
        paddingTop: '12px',
        borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : '#F1F5F9'}`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
      }}>
        <span style={{ fontSize: '13px', flexShrink: 0 }}>💡</span>
        <p style={{ fontSize: '11px', color: isDark ? 'rgba(255, 255, 255, 0.4)' : '#64748B', margin: 0, lineHeight: 1.5 }}>
          <strong>Battery tip:</strong> On Tecno, Infinix, or Xiaomi devices, ensure power-saving mode hasn't restricted ClassCheck from running in the background so updates sound off instantly.
        </p>
      </div>
    </div>
  )
}
