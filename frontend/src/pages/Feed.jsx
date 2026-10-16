import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import FilterPills from '../components/FilterPills'
import UpdateCard from '../components/UpdateCard'
import NextLectureCard from '../components/NextLectureCard'
import OfflineStatusBanner from '../components/OfflineStatusBanner'
import PwaInstallBanner from '../components/PwaInstallBanner'
import { api } from '../lib/api'
import { offlineStorage, useOnlineStatus } from '../lib/offlineStorage'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { pwaUtils } from '../lib/pwaUtils'

export default function Feed() {
  const { user, profile } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { isOnline, formattedSyncAge } = useOnlineStatus()
  const [updates, setUpdates] = useState(() => offlineStorage.get('feed', []))
  const [timetable, setTimetable] = useState(() => offlineStorage.get('timetable', []))
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(() => {
    const cached = offlineStorage.get('feed', null)
    return cached === null
  })
  const [hasSubscriptions, setHasSubscriptions] = useState(true)

  const fetchUpdates = useCallback(async (isSilent = false) => {
    if (!user) return

    try {
      // 1. Get subscriptions
      const { data: subs } = await api.getStudentSubscriptions(user.id)

      if (!subs || subs.length === 0) {
        setHasSubscriptions(false)
        if (!isSilent) setLoading(false)
        return
      }

      setHasSubscriptions(true)
      offlineStorage.save('subscriptions', subs)

      // 2. Fetch Feed updates & Student Timetable in parallel
      const [feedRes, timetableRes] = await Promise.all([
        api.getFeed().catch(() => ({ data: offlineStorage.get('feed', []) })),
        api.getMyTimetable().catch(() => ({ data: offlineStorage.get('timetable', []) })),
      ])

      const feedData = feedRes?.data || []
      const timetableData = timetableRes?.data || []

      setUpdates(feedData)
      setTimetable(timetableData)

      offlineStorage.save('feed', feedData)
      offlineStorage.save('timetable', timetableData)
    } catch (err) {
      console.warn('Network issue fetching feed, loading offline cache:', err)
      const cachedFeed = offlineStorage.get('feed', [])
      const cachedTimetable = offlineStorage.get('timetable', [])
      if (cachedFeed.length > 0) setUpdates(cachedFeed)
      if (cachedTimetable.length > 0) setTimetable(cachedTimetable)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUpdates(false)
  }, [fetchUpdates])

  // Real-time synchronization
  useEffect(() => {
    if (!user) return

    // 1. Instant cross-tab real-time push via BroadcastChannel
    let channel = null
    if (typeof window !== 'undefined' && window.BroadcastChannel) {
      try {
        channel = new BroadcastChannel('classcheck_realtime')
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_UPDATE') {
            const upd = event.data.payload
            toast.success(
              `⚡ Live update: ${upd.courses?.course_code || 'Lecture'} ${
                upd.type === 'cancelled' ? 'Cancelled' : 'Venue Relocated'
              }`,
              { duration: 5000, icon: '📢' }
            )
            pwaUtils.sendBroadcastNotification(upd)
            fetchUpdates(true)
          } else if (
            event.data?.type === 'DELETE_UPDATE' ||
            event.data?.type === 'SUBSCRIPTIONS_UPDATED' ||
            event.data?.type === 'TIMETABLE_UPDATE'
          ) {
            fetchUpdates(true)
          }
        }
      } catch {}
    }

    // 2. Storage event listener for cross-tab updates
    const handleStorage = (e) => {
      if (
        e.key === 'classcheck_dev_updates' ||
        e.key === 'classcheck_dev_subscribed_ids'
      ) {
        fetchUpdates(true)
      }
    }
    window.addEventListener('storage', handleStorage)

    // 3. Heartbeat polling every 3 seconds for continuous real-time sync
    const intervalId = setInterval(() => {
      fetchUpdates(true)
    }, 3000)

    return () => {
      if (channel) channel.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(intervalId)
    }
  }, [user, fetchUpdates])

  const filtered = updates.filter((u) => {
    if (filter === 'All') return true
    if (filter === 'Cancelled') return u.type === 'cancelled'
    if (filter === 'Venue change') return u.type === 'venue_change'
    return true
  })

  return (
    <div className="page-container">
      <Navbar />
      <div className="feed-container">
        {/* Offline status banner */}
        <OfflineStatusBanner />

        {/* PWA Install & iOS Helper Banner */}
        <PwaInstallBanner />

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
              Class updates
            </h1>
            {profile && (
              <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B', marginTop: '4px', margin: '4px 0 0', fontWeight: 500 }}>
                {profile.department} — {profile.level} Level
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '4px' }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isOnline ? '#10B981' : '#F59E0B',
            }} />
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              color: isOnline ? (isDark ? 'rgba(16, 185, 129, 0.9)' : '#059669') : '#D97706',
              letterSpacing: '0.04em',
            }}>
              {isOnline ? 'Live sync' : 'Offline mode'}
            </span>
          </div>
        </div>

        {/* Next Lecture Live Glance Widget */}
        {hasSubscriptions && (
          <NextLectureCard
            timetable={timetable}
            todayUpdates={updates}
            isOffline={!isOnline}
            syncAge={formattedSyncAge}
          />
        )}

        {!hasSubscriptions ? (
          /* No subscriptions state */
          <div style={{
            background: isDark ? '#111111' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          }}>
            <p style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>
              You have no courses selected
            </p>
            <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B', marginTop: '8px' }}>
              Go to My Courses to subscribe to your courses for this semester.
            </p>
            <Link
              to="/my-courses"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 20px',
                background: isDark ? '#FFFFFF' : '#0F172A',
                color: isDark ? '#0A0A0A' : '#FFFFFF',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'opacity 0.15s',
              }}
            >
              Go to My Courses
            </Link>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-5">
              <FilterPills active={filter} onChange={setFilter} />
            </div>

            {/* Updates */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{
                    background: isDark ? '#111111' : '#FFFFFF',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                  }}>
                    <div style={{ height: '16px', background: isDark ? '#1A1A1A' : '#F1F5F9', borderRadius: '4px', width: '25%', marginBottom: '12px' }} />
                    <div style={{ height: '20px', background: isDark ? '#1A1A1A' : '#F1F5F9', borderRadius: '4px', width: '33%', marginBottom: '12px' }} />
                    <div style={{ height: '12px', background: isDark ? '#1A1A1A' : '#F1F5F9', borderRadius: '4px', width: '75%' }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* Empty state */
              <div style={{
                background: isDark ? '#111111' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
                boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: isDark ? 'rgba(37,99,235,0.1)' : '#EFF6FF',
                  border: `1px solid ${isDark ? 'rgba(37,99,235,0.2)' : '#BFDBFE'}`,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <svg style={{ width: '20px', height: '20px', color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p style={{ fontSize: '16px', fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>All clear for today</p>
                <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B', marginTop: '4px' }}>All classes are holding as scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((update) => (
                  <UpdateCard key={update.id} update={update} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
