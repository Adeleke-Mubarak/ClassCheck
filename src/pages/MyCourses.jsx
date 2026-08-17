import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function MyCourses() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState([])
  const [subscribed, setSubscribed] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(null)

  useEffect(() => {
    async function load() {
      if (!profile) return

      const [{ data: allCourses }, { data: subs }] = await Promise.all([
        supabase
          .from('courses')
          .select('*')
          .order('course_code'),
        supabase
          .from('student_courses')
          .select('course_id')
          .eq('student_id', user.id),
      ])

      setCourses(allCourses || [])
      setSubscribed(new Set((subs || []).map((s) => s.course_id)))
      setLoading(false)
    }
    load()
  }, [profile, user])

  async function handleToggle(courseId) {
    if (toggling) return
    setToggling(courseId)

    const isSubscribed = subscribed.has(courseId)

    try {
      if (isSubscribed) {
        const { error } = await supabase
          .from('student_courses')
          .delete()
          .eq('student_id', user.id)
          .eq('course_id', courseId)
        if (error) throw error
        setSubscribed((prev) => {
          const next = new Set(prev)
          next.delete(courseId)
          return next
        })
      } else {
        const { error } = await supabase
          .from('student_courses')
          .insert({ student_id: user.id, course_id: courseId })
        if (error) throw error
        setSubscribed((prev) => new Set([...prev, courseId]))
      }
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
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>My courses</h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>
            Toggle to subscribe or unsubscribe from a course
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
            {profile?.department} — {profile?.level} Level
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
            {subscribed.size} subscribed
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '16px',
              }}>
                <div style={{ height: '14px', background: '#1A1A1A', borderRadius: '4px', width: '30%', marginBottom: '8px' }} />
                <div style={{ height: '12px', background: '#1A1A1A', borderRadius: '4px', width: '60%' }} />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: '#111111',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          }}>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>No courses found for your department.</p>
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
                    background: '#111111',
                    border: isOn ? '1px solid rgba(37,99,235,0.3)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>{course.course_code}</p>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{course.course_name}</p>
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
                      background: isOn ? '#2563EB' : '#2A2A2A',
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
