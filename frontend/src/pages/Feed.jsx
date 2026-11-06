import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import FilterPills from '../components/FilterPills'
import UpdateCard from '../components/UpdateCard'
import LectureStatusPanel from '../components/LectureStatusPanel'
import OfflineStatusBanner from '../components/OfflineStatusBanner'
import PwaInstallBanner from '../components/PwaInstallBanner'
import { api } from '../lib/api'
import { offlineStorage, useOnlineStatus } from '../lib/offlineStorage'
import { useAuth } from '../context/AuthContext'
import { pwaUtils } from '../lib/pwaUtils'

export default function Feed() {
  const { user, profile } = useAuth()
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
        <div className="feed-header">
          <div>
            <p className="feed-eyebrow">Your campus signal</p>
            <h1>Class updates</h1>
            {profile && (
              <p className="feed-subtitle">
                {profile.department} — {profile.level} Level
              </p>
            )}
          </div>
          <div className={`feed-connection ${isOnline ? 'online' : 'offline'}`}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isOnline ? 'var(--cc-accent)' : '#B76B16',
            }} />
            <span>
              {isOnline ? 'Live sync' : 'Offline mode'}
            </span>
          </div>
        </div>

        {/* Next Lecture Live Glance Widget */}
        {hasSubscriptions && (
          <LectureStatusPanel
            timetable={timetable}
            todayUpdates={updates}
            isOffline={!isOnline}
            syncAge={formattedSyncAge}
          />
        )}

        {!hasSubscriptions ? (
          /* No subscriptions state */
          <div className="feed-empty">
            <span className="feed-empty-index">01 / COURSES</span>
            <p className="feed-empty-title">Your feed starts with your courses.</p>
            <p className="feed-empty-copy">
              Go to My Courses to subscribe to your courses for this semester.
            </p>
            <Link to="/my-courses" className="feed-empty-link">
              Choose courses <span aria-hidden="true">↗</span>
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
              <div className="feed-updates">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="feed-skeleton-card">
                    <div className="feed-skeleton-line short" />
                    <div className="feed-skeleton-line medium" />
                    <div className="feed-skeleton-line long" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* Empty state */
              <div className="feed-empty feed-empty-clear">
                <span className="feed-empty-index">NO NEW CHANGES</span>
                <p className="feed-empty-title">All clear for now.</p>
                <p className="feed-empty-copy">Your subscribed courses have no updates matching this filter.</p>
              </div>
            ) : (
              <div className="feed-updates">
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
