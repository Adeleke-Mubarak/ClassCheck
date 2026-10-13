import { useState, useEffect } from 'react'

/**
 * ClassCheck PWA & Push Notification Reliability Manager
 */

let deferredInstallPrompt = null

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar or browser prompt
    e.preventDefault()
    deferredInstallPrompt = e
    window.dispatchEvent(new Event('classcheck_pwa_installable'))
  })
}

export const pwaUtils = {
  isIos() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    const ua = navigator.userAgent || ''
    return /iPad|iPhone|iPod/.test(ua) && !window.MSStream
  },

  isAndroid() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
    return /Android/i.test(navigator.userAgent || '')
  },

  isStandalone() {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://')
    )
  },

  isPushSupported() {
    if (typeof window === 'undefined') return false
    return 'Notification' in window && 'serviceWorker' in navigator
  },

  getNotificationPermission() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
    return Notification.permission
  },

  async requestPermission() {
    if (!pwaUtils.isPushSupported()) {
      throw new Error('Notifications are not supported in this browser.')
    }
    const result = await Notification.requestPermission()
    return result
  },

  async sendTestNotification() {
    if (!pwaUtils.isPushSupported()) {
      throw new Error('Push notifications are not supported by this browser.')
    }

    if (Notification.permission !== 'granted') {
      const perm = await Notification.requestPermission()
      if (perm !== 'granted') {
        throw new Error('Notification permission was denied.')
      }
    }

    const title = 'ClassCheck: Lecture Alert Test'
    const options = {
      body: 'Verified: MAT 401 cancelled today. Real-time notifications are working on this device!',
      icon: '/pwa-192x192.png',
      badge: '/favicon.svg',
      tag: 'classcheck-test-alert',
      vibrate: [200, 100, 200, 100, 200],
      requireInteraction: true,
      data: { url: '/feed' },
    }

    // Try service worker notification first
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        if (registration && registration.showNotification) {
          await registration.showNotification(title, options)
          return true
        }
      }
    } catch (swErr) {
      console.warn('SW notification fallback to regular Notification:', swErr)
    }

    // Fallback to standard window Notification
    try {
      new Notification(title, options)
      return true
    } catch (winErr) {
      console.warn('Standard notification failed:', winErr)
      throw winErr
    }
  },

  async triggerInstallPrompt() {
    if (!deferredInstallPrompt) return false
    deferredInstallPrompt.prompt()
    const { outcome } = await deferredInstallPrompt.userChoice
    deferredInstallPrompt = null
    return outcome === 'accepted'
  },
}

/**
 * Hook to observe PWA installability and standalone status
 */
export function usePwaInstall() {
  const [isInstallable, setIsInstallable] = useState(Boolean(deferredInstallPrompt))
  const [isStandalone, setIsStandalone] = useState(pwaUtils.isStandalone())
  const [isIos] = useState(pwaUtils.isIos())

  useEffect(() => {
    function handleInstallable() {
      setIsInstallable(true)
    }
    function handleAppInstalled() {
      setIsInstallable(false)
      setIsStandalone(true)
    }

    window.addEventListener('classcheck_pwa_installable', handleInstallable)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('classcheck_pwa_installable', handleInstallable)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  return {
    isInstallable,
    isStandalone,
    isIos,
    promptInstall: pwaUtils.triggerInstallPrompt,
  }
}
