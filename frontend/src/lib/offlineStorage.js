import { useState, useEffect } from 'react'

/**
 * ClassCheck Offline Storage & Network Manager
 * Provides instant local fallback for campus network drops.
 */

const PREFIX = 'classcheck_cache_'

export const offlineStorage = {
  save(key, data) {
    try {
      localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(data))
      localStorage.setItem(`${PREFIX}${key}_synced_at`, new Date().toISOString())
      localStorage.setItem(`${PREFIX}last_sync_all`, new Date().toISOString())
    } catch (err) {
      console.warn('offlineStorage.save failed:', err)
    }
  },

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(`${PREFIX}${key}`)
      if (!raw) return fallback
      return JSON.parse(raw)
    } catch (err) {
      console.warn('offlineStorage.get failed:', err)
      return fallback
    }
  },

  getSyncedAt(key) {
    try {
      return localStorage.getItem(`${PREFIX}${key}_synced_at`) || localStorage.getItem(`${PREFIX}last_sync_all`)
    } catch {
      return null
    }
  },

  formatTimeAge(isoString) {
    if (!isoString) return 'Just now'
    try {
      const diffMs = Date.now() - new Date(isoString).getTime()
      if (diffMs < 0) return 'Just now'
      const mins = Math.floor(diffMs / 60000)
      if (mins < 1) return 'Just now'
      if (mins === 1) return '1m ago'
      if (mins < 60) return `${mins}m ago`
      const hours = Math.floor(mins / 60)
      if (hours === 1) return '1h ago'
      if (hours < 24) return `${hours}h ago`
      const days = Math.floor(hours / 24)
      return `${days}d ago`
    } catch {
      return 'Recently'
    }
  },
}

/**
 * Hook to monitor device online/offline connectivity
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )
  const [lastSync, setLastSync] = useState(() =>
    offlineStorage.getSyncedAt('last_sync_all')
  )

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true)
    }
    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const interval = setInterval(() => {
      setLastSync(offlineStorage.getSyncedAt('last_sync_all'))
    }, 15000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  return {
    isOnline,
    lastSyncTime: lastSync,
    formattedSyncAge: offlineStorage.formatTimeAge(lastSync),
  }
}
