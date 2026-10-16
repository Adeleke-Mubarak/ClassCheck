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
      background: 'linear-gradient(180deg, #161616 0%, #111111 100%)',
      border: '1px solid rgba(37, 99, 235, 0.3)',
      borderRadius: '10px',
      padding: '14px 18px',
      marginBottom: '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
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
            background: 'rgba(37, 99, 235, 0.15)',
            border: '1px solid rgba(37, 99, 235, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0,
          }}>
            📲
          </div>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '-0.01em' }}>
              Install ClassCheck for Instant Lecture Alerts
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', margin: '2px 0 0' }}>
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
              color: 'rgba(255, 255, 255, 0.4)',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.75)',
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#FFFFFF' }}>
            2 steps to install on your iPhone:
          </p>
          <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
            <li>
              Tap the Safari <strong>Share button</strong> (the square icon with upward arrow <span style={{ color: '#3B82F6' }}>⎋</span> at the bottom of your screen).
            </li>
            <li>
              Scroll down the menu and tap <strong>"Add to Home Screen"</strong> (with the <span style={{ color: '#3B82F6' }}>[+]</span> icon).
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
