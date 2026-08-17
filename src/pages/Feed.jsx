import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import FilterPills from '../components/FilterPills'
import UpdateCard from '../components/UpdateCard'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Feed() {
  const { user, profile } = useAuth()
  const [updates, setUpdates] = useState([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [hasSubscriptions, setHasSubscriptions] = useState(true)

  const fetchUpdates = useCallback(async () => {
    if (!user) return

    // Get subscribed course IDs
    const { data: subs } = await supabase
      .from('student_courses')
      .select('course_id')
      .eq('student_id', user.id)

    if (!subs || subs.length === 0) {
      setHasSubscriptions(false)
      setLoading(false)
      return
    }

    setHasSubscriptions(true)
    const courseIds = subs.map((s) => s.course_id)

    let query = supabase
      .from('updates')
      .select(`
        *,
        courses (course_code, course_name),
        senders (role, full_name)
      `)
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })

    const { data, error } = await query
    if (!error) {
      setUpdates(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchUpdates()
  }, [fetchUpdates])

  // Realtime subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'updates' },
        () => {
          fetchUpdates()
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'updates' },
        () => {
          fetchUpdates()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
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
        {/* Page header */}
        <div className="mb-6">
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Class updates</h1>
          {profile && (
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
              {profile.department} — {profile.level} Level
            </p>
          )}
        </div>

        {!hasSubscriptions ? (
          /* No subscriptions state */
          <div style={{
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF' }}>You have no courses selected</p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
              Go to My Courses to subscribe to your courses for this semester.
            </p>
            <Link
              to="/my-courses"
              style={{
                display: 'inline-block',
                marginTop: '20px',
                padding: '10px 20px',
                background: '#FFFFFF',
                color: '#0A0A0A',
                fontSize: '14px',
                fontWeight: 700,
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'background 0.15s',
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
                    background: '#111111',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{ height: '16px', background: '#1A1A1A', borderRadius: '4px', width: '25%', marginBottom: '12px' }} />
                    <div style={{ height: '20px', background: '#1A1A1A', borderRadius: '4px', width: '33%', marginBottom: '12px' }} />
                    <div style={{ height: '12px', background: '#1A1A1A', borderRadius: '4px', width: '75%' }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              /* Empty state */
              <div style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'rgba(37,99,235,0.1)',
                  border: '1px solid rgba(37,99,235,0.2)',
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
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>All clear for today</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>All classes are holding as scheduled</p>
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
