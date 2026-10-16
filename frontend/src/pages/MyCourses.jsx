import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function MyCourses() {
  const { user, profile } = useAuth()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [courses, setCourses] = useState([])
  const [subscribed, setSubscribed] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  const load = useCallback(async () => {
    if (!profile || !user?.id) return

    try {
      const [{ data: allCourses }, { data: subs }] = await Promise.all([
        api.getCourses(),
        api.getStudentSubscriptions(user.id),
      ])

      setCourses(allCourses || [])
      setSubscribed(new Set((subs || []).map((s) => s.course_id || s.id)))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [profile, user?.id])

  useEffect(() => {
    load()

    let bc = null
    try {
      if (typeof window !== 'undefined' && window.BroadcastChannel) {
        bc = new BroadcastChannel('classcheck_realtime')
        bc.onmessage = (event) => {
          if (event.data?.type === 'COURSES_UPDATE' || event.data?.type === 'SUBSCRIPTIONS_UPDATED') {
            load()
          }
        }
      }
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'classcheck_dev_subscribed_ids' || e.key === 'classcheck_courses') {
        load()
      }
    }
    window.addEventListener('storage', handleStorage)

    const interval = setInterval(load, 3500)

    return () => {
      if (bc) bc.close()
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [load])

  async function handleToggle(courseId) {
    if (toggling) return
    setToggling(courseId)

    const isSubscribed = subscribed.has(courseId)
    const newSubscribed = new Set(subscribed)

    if (isSubscribed) {
      newSubscribed.delete(courseId)
    } else {
      newSubscribed.add(courseId)
    }

    try {
      await api.updateSubscriptions(user.id, Array.from(newSubscribed))
      setSubscribed(newSubscribed)
    } catch (err) {
      toast.error('Failed to update subscription')
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="page-container">
      <Navbar />
      <div className="feed-container">
        <div className="mb-6">
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A', letterSpacing: '-0.02em', margin: 0 }}>
            My courses
          </h1>
          <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B', marginTop: '4px' }}>
            Toggle to subscribe or unsubscribe from a course
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '13px', color: isDark ? 'rgba(255,255,255,0.45)' : '#64748B', fontWeight: 500 }}>
            {profile?.department} — {profile?.level} Level
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: isDark ? '#FFFFFF' : '#0F172A' }}>
            {subscribed.size} subscribed
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: isDark ? '#111111' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
                borderRadius: '10px',
                padding: '16px',
                boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
              }}>
                <div style={{ height: '14px', background: isDark ? '#1A1A1A' : '#F1F5F9', borderRadius: '4px', width: '30%', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: isDark ? '#1A1A1A' : '#F1F5F9', borderRadius: '4px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: isDark ? '#111111' : '#FFFFFF',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
            borderRadius: '12px',
            boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          }}>
            <p style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B' }}>
              No courses found for your department.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {courses.map((course) => {
              const isOn = subscribed.has(course.id)
              const isToggling = toggling === course.id
              return (
                <div
                  key={course.id}
                  style={{
                    background: isDark ? '#111111' : '#FFFFFF',
                    border: isOn
                      ? isDark ? '1px solid rgba(37,99,235,0.35)' : '1px solid #BFDBFE'
                      : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isDark ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 800, color: isDark ? '#FFFFFF' : '#0F172A' }}>{course.course_code}</p>
                    <p style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.5)' : '#64748B', marginTop: '2px' }}>{course.course_name}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(course.id)}
                    disabled={isToggling}
                    aria-label={isOn ? 'Unsubscribe' : 'Subscribe'}
                    style={{
                      position: 'relative',
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      background: isOn ? '#2563EB' : (isDark ? '#2A2A2A' : '#CBD5E1'),
                      border: 'none',
                      cursor: isToggling ? 'wait' : 'pointer',
                      transition: 'background 0.2s',
                      flexShrink: 0,
                      opacity: isToggling ? 0.5 : 1,
                    }}
                  >
                    <span style={{
                      position: 'absolute',
                      top: '3px',
                      left: isOn ? '23px' : '3px',
                      width: '18px',
                      height: '18px',
                      background: '#FFFFFF',
                      borderRadius: '50%',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                      transition: 'left 0.2s',
                    }} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
