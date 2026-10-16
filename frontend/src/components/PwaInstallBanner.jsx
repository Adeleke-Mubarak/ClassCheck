import { useState, useEffect } from 'react'
import { usePwaInstall } from '../lib/pwaUtils'

const DISMISS_KEY = 'classcheck_pwa_banner_dismissed'

export default function PwaInstallBanner() {
  const { isInstallable, isStandalone, isIos, promptInstall } = usePwaInstall()
  const [dismissed, setDismissed] = useState(true)
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    try {
      const wasDismissed = localStorage.getItem(DISMISS_KEY)
      if (!wasDismissed) {
        setDismissed(false)
      }
    } catch {}
  }, [])

  function handleDismiss() {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, 'true')
    } catch {}
  }

  // Hide if already in standalone app mode or dismissed or neither iOS nor installable
  if (isStandalone || dismissed || (!isInstallable && !isIos)) {
    return null
  }

  async function handleInstallClick() {
    if (isIos) {
      setShowIosGuide((prev) => !prev)
    } else {
      await promptInstall()
    }
  }

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--brand-blue-border)',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '20px',
      boxShadow: 'var(--shadow-elevated)',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            background: 'var(--brand-blue-bg)',
            border: '1px solid var(--brand-blue-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}>
            📲
          </div>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Install ClassCheck for Instant Lecture Alerts
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
              Add to your home screen for faster loading and reliable cancellation alerts.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleInstallClick}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              background: '#2563EB',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s',
            }}
          >
            <span>{isIos ? 'How to install on iOS' : 'Install App'}</span>
            <span aria-hidden="true">→</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '4px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* iOS Step-by-Step Guide Dropdown */}
      {showIosGuide && isIos && (
        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-card)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, color: 'var(--text-primary)' }}>
            2 steps to install on your iPhone:
          </p>
          <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
            <li>
              Tap the Safari <strong>Share button</strong> (the square icon with upward arrow <span style={{ color: '#2563EB' }}>⎋</span> at the bottom of your screen).
            </li>
            <li>
              Scroll down the menu and tap <strong>"Add to Home Screen"</strong> (with the <span style={{ color: '#2563EB' }}>[+]</span> icon).
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
